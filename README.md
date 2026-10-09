# Modern Dairy — Customer Geocoding Tool

Local web tool: upload a customer Excel file → map columns → get latitude/longitude from the Google Geocoding API → download `<yourfile>_geocoded.xlsx`.

Runs only on your computer (`http://127.0.0.1:8765`). Customer data goes only to Google's Geocoding API.

## Project structure

```
app.py              Flask server: upload, preview, background job, download
geocoder.py         Google API calls, retries, throttling, cache, accuracy rules
excel_io.py         Excel reading (.xlsx/.xls) and writing results
static/             index.html, app.js, style.css (no frameworks)
tests/              pytest suite + fake Google API (no real key needed)
run.sh / run.bat    one-click start (macOS-Linux / Windows)
work/               temporary files (created at runtime, git-ignored)
```

## 1. Install

Needs Python 3.10+ ([python.org](https://www.python.org/downloads/); on Windows tick "Add Python to PATH").

```bash
cd Geolocation
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

(`run.sh` / `run.bat` do this automatically on first run.)

## 2. Google API key

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **Billing** → link a billing account (required by Google, even within the free allowance).
3. **APIs & Services → Library** → search **Geocoding API** → **Enable**.
4. **APIs & Services → Credentials → Create credentials → API key**.
5. Restrict the key (**Edit API key**):
   - *API restrictions* → **Restrict key** → only **Geocoding API**.
   - *Application restrictions* → **IP addresses** → your public IP (optional but recommended). Do **not** use "Websites" — this key is used server-side only.
6. Optional: **APIs & Services → Geocoding API → Quotas** → set a daily cap to limit spend.
7. Start the tool (step 3) and paste the key into the **Google API key** box at the top of the page → **Save key**. The tool checks it with one test request.
   The key is kept only in the program's memory — never written to a file, never sent back to the browser, never in logs or output. Re-enter it each time you restart the program.

Pricing changes over time — check [Google Maps pricing](https://developers.google.com/maps/billing-and-pricing/pricing).

## 3. Start

```bash
./run.sh                 # macOS / Linux
.\run.bat                # Windows PowerShell (or double-click run.bat)
# or manually:
python app.py
```

Open **http://127.0.0.1:8765** in your browser (run.bat opens it automatically) and enter your API key.

## 4. Upload and map columns

1. Choose your `.xlsx` or `.xls` file. Your original file is never modified (a working copy is used).
2. Pick the **worksheet** (if several). Header row is auto-detected; change it if your headers aren't in row 1.
3. Check the column dropdowns (auto-guessed from header names). Set any missing field to "— not in file —". At least one of Address / City / PIN is required.
4. If the file already has coordinates, map **Existing Latitude/Longitude**. Keep **Skip rows that already have valid coordinates** ticked to preserve them.
5. Read the estimate box: rows to process, missing addresses, duplicate addresses, estimated API requests (and cost if configured).

## 5. Process

- Click **Start Geocoding**. Progress bar, counts and results table update live.
- **Stop** pauses safely. **Start Geocoding** again resumes only the remaining rows.
- **Retry failed / review rows** re-queries `API_ERROR`, `NOT_FOUND`, `REVIEW_REQUIRED` rows (fresh, not from cache).
- Use the **Show** filter to list only rows needing review.
- If Google reports a bad key / disabled API / billing problem, or a quota limit, processing stops with a clear message; completed rows are kept.

How each row is searched:
1. Address + City + State + PIN + Country (duplicates removed, e.g. city already inside address).
2. If that result is weak, a second search adds the customer name.
3. Rows with no address/city/PIN are marked `MISSING_ADDRESS` (no request sent).
4. Identical searches are cached (`work/geocode_cache.json`) — never paid for twice, even across restarts. Different businesses at the same address still each keep their own row and get a note.

## 6. Download and verify

Click **Download Updated Excel** → `<original name>_geocoded.xlsx`. All original cells, sheets, formatting and column widths are kept; these columns are added at the right (or reused if they already exist):

| Column | Meaning |
|---|---|
| `Latitude`, `Longitude` | Coordinates from Google (empty if not found — never invented) |
| `Geocoding_Status` | see below |
| `Matched_Address` | Google's `formatted_address` |
| `Location_Type` | `ROOFTOP`, `RANGE_INTERPOLATED`, `GEOMETRIC_CENTER`, `APPROXIMATE` |
| `Place_ID` | Google place ID |
| `Geocoding_Note` | Why a row was flagged (PIN mismatch, multiple candidates, area-only match, duplicate address…) |

| Status | Meaning |
|---|---|
| `SUCCESS_PRECISE` | Rooftop / exact building match |
| `SUCCESS_APPROXIMATE` | Street-level, interpolated, or partial building match — usually fine, spot-check |
| `REVIEW_REQUIRED` | Coordinates written but **not trustworthy**: matched only locality/PIN centre, PIN mismatch, or several far-apart candidates |
| `NOT_FOUND` | Google found nothing — no coordinates written |
| `API_ERROR` | Request failed (network / invalid request) — retry later |
| `MISSING_ADDRESS` | Row has no address, city or PIN |
| `SKIPPED_EXISTING` | Existing valid coordinates kept |

Verify: open the file, sort/filter by `Geocoding_Status`, fix `REVIEW_REQUIRED`/`NOT_FOUND` addresses in your source sheet and re-run (already-found rows come from cache, free). Spot-check a few rows by pasting `lat,lng` into Google Maps.

Notes:
- If skip is off and a re-lookup fails, the old coordinates are left in place (note says so).
- Old `.xls` files: values are kept, but cell formatting cannot be carried over (output is `.xlsx`).
- openpyxl may drop charts/images/pivot tables in the processed workbook; cell data, formulas, styles, widths and sheet names are kept.

## 7. Stop and clean up

- Click **Clear session & temp files** → deletes the uploaded copy, outputs and the cache in `work/`.
- Stop the server: `Ctrl+C` in the terminal.
- To remove everything: delete the `work/` folder (and `.venv/` if you want).

## Optional settings (environment variables)

Not needed for normal use.

| Name | Default | |
|---|---|---|
| `REQUESTS_PER_SECOND` | 10 | throttle |
| `GEOCODING_REGION` | `in` | region bias (India) |
| `PORT` | 8765 | local port |
| `GEOCODING_PRICE_PER_1000`, `GEOCODING_PRICE_CURRENCY`, `GEOCODING_FREE_REQUESTS_PER_MONTH` | blank | show a cost estimate (enter the current Google price) |

## Tests

```bash
pip install xlwt   # optional: enables the .xls test
python -m pytest -q tests
```

Uses a fake Google API (no key, no cost). Covers: complete addresses, different column names/order, missing addresses & blank rows, duplicate addresses (cache), existing coordinates (skip on/off), not found / ambiguous / PIN mismatch / area-only matches, invalid key, quota error + resume, multiple worksheets, 3,000 rows, retry, stop/clear, `.xls`, bad uploads. Each test checks coordinates land on the correct row and original cells are unchanged.

Manual UI test without a real key:
```bash
python tests/fake_google.py 8999 &
GEOCODING_API_URL=http://127.0.0.1:8999/ python app.py
# then enter any key like AIzaTestKey1234567890 in the page
```
