"""Modern Dairy - Customer Geocoding Tool (local Flask app)."""
import logging
import os
import shutil
import threading
import uuid

from flask import Flask, jsonify, request, send_file, send_from_directory
from werkzeug.utils import secure_filename

import excel_io
import geocoder as g

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

WORK_DIR = os.environ.get("WORK_DIR") or os.path.join(BASE_DIR, "work")
CACHE_PATH = os.path.join(WORK_DIR, "geocode_cache.json")
FIELDS = ["name", "address", "city", "state", "pin", "country"]
VERIFY_KEYS = ("v_status", "v_note", "place_name", "place_address", "name_score", "distance_m",
               "place_lat", "place_lng", "place_uri")
# (Excel header, result key) for the name-check columns
VERIFY_COLUMNS = [("Name_Check", "v_status"), ("Google_Business_Name", "place_name"),
                  ("Google_Business_Address", "place_address"), ("Name_Match_Pct", "name_score"),
                  ("Distance_To_Business_m", "distance_m"), ("Google_Maps_Link", "place_uri"),
                  ("Name_Check_Note", "v_note")]
# Google key: entered in the web page, kept only in this process's memory (never written to disk)
KEY = {"value": os.environ.get("GOOGLE_GEOCODING_API_KEY", "").strip()}

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
# Never let HTTP debug logs print request URLs (they contain the API key and addresses)
logging.getLogger("urllib3").setLevel(logging.WARNING)
log = logging.getLogger("app")

app = Flask(__name__, static_folder="static")
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024


@app.after_request
def no_cache(resp):
    # Always load the latest page/script after an update (no stale browser cache)
    resp.headers["Cache-Control"] = "no-store"
    return resp


def _float_env(name, default=None):
    try:
        return float(os.environ.get(name, "").strip())
    except ValueError:
        return default


class Session:
    """Single in-memory session (one local user)."""

    def __init__(self):
        self.lock = threading.Lock()
        self.reset()

    def reset(self):
        self.file_path = None       # working .xlsx copy (never the user's original)
        self.original_name = None
        self.sheets = []
        self.data = None            # excel_io.SheetData
        self.config = None          # last config used for processing
        self.results = {}           # excel_row -> result dict
        self.seq = 0
        self.generation = getattr(self, "generation", 0) + 1  # bumps when results are discarded
        self.thread = None
        self.stop_event = threading.Event()
        self.state = "idle"         # idle|running|stopping|stopped|done|error
        self.error = ""
        self.total = 0
        self.completed = 0
        self.geo = None

    def running(self):
        return self.thread is not None and self.thread.is_alive()


S = Session()


def err(msg, code=400):
    return jsonify({"error": msg}), code


def get_geocoder():
    if S.geo is None:
        os.makedirs(WORK_DIR, exist_ok=True)
        S.geo = g.Geocoder(
            api_key=KEY["value"],
            cache_path=CACHE_PATH,
            rps=_float_env("REQUESTS_PER_SECOND", 10.0),
            region=os.environ.get("GEOCODING_REGION", "in").strip(),
            api_url=os.environ.get("GEOCODING_API_URL") or None,
        )
    S.geo.api_key = KEY["value"]
    return S.geo


# ---------- row preparation ----------

def parse_config(body):
    mapping = {}
    for f in FIELDS + ["lat", "lng"]:
        v = (body.get("mapping") or {}).get(f)
        mapping[f] = int(v) if v not in (None, "", -1, "-1") else None
    if not any(mapping[f] is not None for f in ("address", "city", "pin")):
        raise ValueError("Map at least one of Address, City or PIN code.")
    if (mapping["lat"] is None) != (mapping["lng"] is None):
        raise ValueError("Map both Latitude and Longitude columns, or neither.")
    return {
        "sheet": body.get("sheet"),
        "header_row": int(body.get("header_row") or 0) or None,
        "mapping": mapping,
        "skip_existing": bool(body.get("skip_existing", True)),
        "default_country": (body.get("default_country") or "").strip(),
    }


def load_sheet(cfg):
    if S.data is None or S.data.sheet != cfg["sheet"] or (
            cfg.get("header_row") and S.data.header_row != cfg["header_row"]):
        if cfg["sheet"] not in S.sheets:
            raise ValueError("Unknown worksheet.")
        S.data = excel_io.SheetData(S.file_path, cfg["sheet"], cfg.get("header_row"))
    return S.data


def build_rows(cfg):
    """List of row dicts for the current sheet and mapping."""
    data = load_sheet(cfg)
    m = cfg["mapping"]

    def val(vals, f):
        i = m.get(f)
        return vals[i] if i is not None and i < len(vals) else None

    rows = []
    for excel_row, vals in data.rows:
        parts = {f: val(vals, f) for f in FIELDS}
        lat, lng = val(vals, "lat"), val(vals, "lng")
        rows.append({
            "row": excel_row,
            "name": g.clean(parts["name"]),
            "address": g.build_address({k: parts[k] for k in ("address", "city", "state", "pin")}),
            "pin": parts["pin"],
            "queries": g.build_queries(parts, cfg["default_country"]),
            "existing": (float(lat), float(lng)) if g.valid_coords(lat, lng) else None,
        })
    # Same address used by several rows: keep them separate, but tell the user
    by_addr = {}
    for r in rows:
        if r["queries"]:
            by_addr.setdefault(g.norm(r["queries"][0]), []).append(r)
    for group in by_addr.values():
        if len(group) > 1:
            for r in group:
                others = [str(o["row"]) for o in group if o is not r][:5]
                r["dup_note"] = "Same address as row(s) " + ", ".join(others)
    return rows


def estimate(cfg, rows, results, mode="all"):
    geo = get_geocoder()
    todo = rows_to_process(rows, results, mode)
    if mode == "verify":
        return {"to_process": len(todo)}
    skipped = sum(1 for r in rows if cfg["skip_existing"] and r["existing"])
    missing = sum(1 for r in rows if not r["queries"])
    use_cache = mode == "all"
    first, fallback = set(), set()
    for r in todo:
        if not r["queries"] or (cfg["skip_existing"] and r["existing"]):
            continue
        if not (use_cache and geo.is_cached(r["queries"][0])):
            first.add(g.norm(r["queries"][0]))
        for q in r["queries"][1:]:
            if not (use_cache and geo.is_cached(q)):
                fallback.add(g.norm(q))
    out = {
        "total_rows": len(rows), "to_process": len(todo), "skip_existing": skipped,
        "missing_address": missing, "min_requests": len(first),
        "max_requests": len(first) + len(fallback),
        "duplicates": sum(1 for r in rows if r.get("dup_note")),
    }
    price = _float_env("GEOCODING_PRICE_PER_1000")
    if price is not None:
        out["cost_min"] = round(out["min_requests"] * price / 1000, 2)
        out["cost_max"] = round(out["max_requests"] * price / 1000, 2)
        out["currency"] = os.environ.get("GEOCODING_PRICE_CURRENCY", "USD")
        out["free_monthly"] = _float_env("GEOCODING_FREE_REQUESTS_PER_MONTH")
    return out


def rows_to_process(rows, results, mode):
    if mode == "verify":  # name check: geocoded rows with a name, not yet checked
        return [r for r in rows if r["name"] and r["row"] in results and results[r["row"]]["status"] != g.MISSING
                and results[r["row"]].get("v_status") in (None, g.V_ERR)]
    if mode == "retry":
        return [r for r in rows if results.get(r["row"], {}).get("status") in (g.API_ERROR, g.NOT_FOUND, g.REVIEW)]
    return [r for r in rows if r["row"] not in results]


# ---------- geocoding job ----------

def geocode_row(r, cfg, geo, use_cache):
    if cfg["skip_existing"] and r["existing"]:
        lat, lng = r["existing"]
        return {"lat": lat, "lng": lng, "status": g.SKIPPED, "note": "Existing coordinates kept"}
    if not r["queries"]:
        return {"status": g.MISSING, "note": "No address, city or PIN in this row"}
    best = None
    for q in r["queries"]:
        resp = geo.lookup(q, use_cache=use_cache)  # may raise FatalApiError
        if resp["status"] in ("OK", "ZERO_RESULTS"):
            status, res, note = g.classify(resp["results"], r["pin"])
        else:
            status, res, note = g.API_ERROR, None, resp.get("error", resp["status"])
        cand = {"status": status, "note": note}
        if res:
            loc = res["location"]
            cand.update(lat=loc.get("lat"), lng=loc.get("lng"), matched=res["formatted_address"],
                        loc_type=res["location_type"], place_id=res["place_id"])
        if len(r["queries"]) > 1:
            cand["note"] = ("Searched with name; " if q != r["queries"][0] else "") + cand["note"]
        if best is None or g.RANK[cand["status"]] > g.RANK[best["status"]]:
            best = cand
        if best["status"] in (g.PRECISE, g.APPROXIMATE):
            break
    if best.get("lat") is None and r["existing"]:
        best["note"] = (best["note"] + "; " if best["note"] else "") + "Previous coordinates left unchanged"
    return best


def verify_row(r, cfg, geo):
    res = S.results[r["row"]]
    lat, lng = res.get("lat"), res.get("lng")
    text = ", ".join(x for x in (r["name"], r["address"], cfg["default_country"]) if x)
    resp = geo.places_search(text, lat, lng)  # may raise FatalApiError
    if resp["status"] == "ERROR":
        return {"v_status": g.V_ERR, "v_note": resp.get("error", "")}
    return g.verify_name(resp["places"], r["name"], lat, lng)


def update_result(row, fields):
    S.seq += 1
    S.results[row] = {**S.results[row], **fields, "seq": S.seq}


def set_result(row, res, r):
    if r.get("dup_note"):
        res["note"] = "; ".join(x for x in (res.get("note"), r["dup_note"]) if x)
    S.seq += 1
    res["seq"] = S.seq
    res["name"] = r["name"]
    res["address"] = r["address"]
    S.results[row] = res


def worker(rows, cfg, use_cache, task="geocode"):
    geo = get_geocoder()
    try:
        for i, r in enumerate(rows):
            if S.stop_event.is_set():
                S.state = "stopped"
                break
            if task == "verify":
                res = verify_row(r, cfg, geo)
                with S.lock:
                    update_result(r["row"], res)
                    S.completed += 1
                log.info("Row %s: %s", r["row"], res["v_status"])
            else:
                res = geocode_row(r, cfg, geo, use_cache)
                with S.lock:
                    set_result(r["row"], res, r)
                    S.completed += 1
                log.info("Row %s: %s", r["row"], res["status"])  # no addresses in logs
            if i % 25 == 0:
                geo.save_cache()
        else:
            S.state = "done"
    except g.FatalApiError as e:
        S.state, S.error = "error", str(e)
        log.error("Stopped: %s", str(e).split(".")[0])
    except Exception:
        log.exception("Unexpected error")
        S.state, S.error = "error", "Unexpected error while processing. See the terminal log for details."
    finally:
        geo.save_cache()


# ---------- routes ----------

@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/config")
def api_config():
    return jsonify({"key_configured": bool(KEY["value"])})


@app.post("/api/key")
def api_key():
    """Check the key with one test request, then keep it in memory. The key is never sent back."""
    if S.running():
        return err("Processing is running. Stop it first.")
    key = ((request.get_json(silent=True) or {}).get("key") or "").strip()
    if not key:
        KEY["value"] = ""
        return jsonify({"key_configured": False})
    if len(key) < 20 or any(c.isspace() for c in key):
        return err("That doesn't look like a Google API key (they start with AIza and have no spaces).")
    test = g.Geocoder(key, rps=0, max_retries=1, region=os.environ.get("GEOCODING_REGION", "in").strip(),
                      api_url=os.environ.get("GEOCODING_API_URL") or None)
    try:
        resp = test.lookup("Pune, Maharashtra, India", use_cache=False)
    except g.FatalApiError as e:
        return err(str(e))
    if resp["status"] not in ("OK", "ZERO_RESULTS"):
        return err("Could not verify the key: " + resp.get("error", resp["status"]))
    KEY["value"] = key
    log.info("API key verified and set (memory only)")
    return jsonify({"key_configured": True})


@app.post("/api/upload")
def api_upload():
    if S.running():
        return err("Processing is running. Stop it first.")
    f = request.files.get("file")
    if not f or not f.filename:
        return err("No file selected.")
    name = secure_filename(f.filename) or "upload.xlsx"
    ext = os.path.splitext(name)[1].lower()
    if ext not in (".xlsx", ".xlsm", ".xls"):
        return err("Please upload an Excel file (.xlsx or .xls).")
    clear_files(keep_cache=True)
    S.reset()
    os.makedirs(WORK_DIR, exist_ok=True)
    raw = os.path.join(WORK_DIR, f"upload_{uuid.uuid4().hex}{ext}")
    f.save(raw)
    try:
        if ext == ".xls":
            path = raw[:-4] + ".xlsx"
            excel_io.convert_xls(raw, path)
            os.remove(raw)
        else:
            path = raw
        S.sheets = excel_io.sheet_names(path)
    except Exception:
        log.exception("Could not read upload")
        clear_files(keep_cache=True)
        return err("Could not read this file. Make sure it is a valid, non password-protected Excel file.")
    S.file_path = path
    S.original_name = os.path.splitext(f.filename)[0]
    return jsonify({"sheets": S.sheets, "xls": ext == ".xls"})


@app.get("/api/preview")
def api_preview():
    if not S.file_path:
        return err("Upload a file first.")
    sheet = request.args.get("sheet")
    if sheet not in S.sheets:
        return err("Unknown worksheet.")
    hr = request.args.get("header_row", type=int)
    try:
        S.data = excel_io.SheetData(S.file_path, sheet, hr)
    except Exception:
        log.exception("Preview failed")
        return err("Could not read this worksheet.")
    return jsonify(S.data.preview())


@app.post("/api/estimate")
def api_estimate():
    if not S.file_path:
        return err("Upload a file first.")
    try:
        body = request.get_json(force=True)
        cfg = parse_config(body)
        rows = build_rows(cfg)
        results = S.results if S.config == cfg else {}  # new settings => fresh run
        return jsonify(estimate(cfg, rows, results, body.get("mode", "all")))
    except ValueError as e:
        return err(str(e))


@app.post("/api/start")
def api_start():
    if not S.file_path:
        return err("Upload a file first.")
    if S.running():
        return err("Already running.")
    if not KEY["value"]:
        return err("Enter your Google Geocoding API key at the top of the page first.")
    body = request.get_json(force=True)
    try:
        cfg = parse_config(body)
        rows = build_rows(cfg)
    except ValueError as e:
        return err(str(e))
    mode = body.get("mode", "all")
    if mode == "verify" and (S.config != cfg or not S.results):
        return err("Run Start Geocoding first (with these same settings), then verify names.")
    with S.lock:
        if S.config != cfg:   # new settings: start fresh; same settings: resume
            S.results, S.generation = {}, S.generation + 1
            S.config = cfg
        todo = rows_to_process(rows, S.results, mode)
        if not todo:
            S.state = "done"
            return jsonify({"started": False, "message": "Nothing left to process." if mode != "verify" else
                            "All rows with a customer name are already checked."})
        S.stop_event.clear()
        S.state, S.error = "running", ""
        S.total, S.completed = len(todo), 0
        S.thread = threading.Thread(target=worker, args=(todo, cfg, mode != "retry",
                                                         "verify" if mode == "verify" else "geocode"), daemon=True)
        S.thread.start()
    return jsonify({"started": True, "total": len(todo)})


@app.post("/api/mapdata")
def api_mapdata():
    """Rows with coordinates from the uploaded file itself (e.g. a file this tool produced earlier).
    No Google requests are made."""
    if not S.file_path:
        return err("Upload a file first.")
    body = request.get_json(force=True)
    m = {f: (int(v) if v not in (None, "", -1, "-1") else None)
         for f, v in (body.get("mapping") or {}).items()}
    if m.get("lat") is None or m.get("lng") is None:
        return err("Select the Latitude and Longitude columns (under 'Existing Latitude/Longitude') to show this file on the map.")
    try:
        data = load_sheet({"sheet": body.get("sheet"), "header_row": int(body.get("header_row") or 0) or None})
    except ValueError as e:
        return err(str(e))
    lower = [h.strip().lower() for h in data.headers]
    extra = {k: (lower.index(h) if h in lower else None) for k, h in
             (("status", "geocoding_status"), ("matched", "matched_address"),
              ("loc_type", "location_type"), ("note", "geocoding_note"))}

    def val(vals, i):
        return vals[i] if i is not None and i < len(vals) else None

    out, missing = [], 0
    for excel_row, vals in data.rows:
        lat, lng = val(vals, m["lat"]), val(vals, m["lng"])
        if not g.valid_coords(lat, lng):
            missing += 1
            continue
        parts = {f: val(vals, m.get(f)) for f in ("address", "city", "state", "pin")}
        out.append({"row": excel_row, "name": g.clean(val(vals, m.get("name"))),
                    "address": g.build_address(parts), "lat": float(lat), "lng": float(lng),
                    **{k: (g.clean(val(vals, i)) or None) for k, i in extra.items()}})
        out[-1]["status"] = out[-1]["status"] or "FROM_FILE"
    return jsonify({"rows": out, "without_coords": missing})


def use_place_candidates():
    """Rows where Google's business listing (matching name) is a better location than the address geocode."""
    return [row for row, r in S.results.items() if r.get("place_lat") is not None and (
        r.get("v_status") == g.V_FAR or (r.get("v_status") == g.V_OK and r["status"] != g.PRECISE))]


@app.post("/api/use_place")
def api_use_place():
    """Replace coordinates with the Google business listing's location (one row, or all candidates)."""
    if S.running():
        return err("Wait for processing to finish.")
    body = request.get_json(force=True)
    rows = use_place_candidates() if body.get("all") else [int(body.get("row", 0))]
    done = 0
    with S.lock:
        for row in rows:
            r = S.results.get(row)
            if not r or r.get("place_lat") is None:
                continue
            note = "; ".join(x for x in (r.get("note"), "Coordinates set from Google business listing "
                                         f"'{r['place_name']}'") if x)
            update_result(row, {"lat": r["place_lat"], "lng": r["place_lng"], "status": g.PRECISE,
                                "loc_type": "GOOGLE_BUSINESS_LISTING", "matched": r["place_address"],
                                "place_id": r.get("place_ref"), "note": note, "distance_m": 0,
                                "v_status": g.V_CLOSED if r.get("v_status") == g.V_CLOSED else g.V_OK})
            done += 1
    if not done:
        return err("No Google business location available for that row.")
    return jsonify({"updated": done})


@app.post("/api/stop")
def api_stop():
    if S.running():
        S.stop_event.set()
        S.state = "stopping"
    return jsonify({"ok": True})


@app.get("/api/status")
def api_status():
    since = request.args.get("since", default=0, type=int)
    with S.lock:
        counts, vcounts = {}, {}
        for res in S.results.values():
            counts[res["status"]] = counts.get(res["status"], 0) + 1
            if res.get("v_status"):
                vcounts[res["v_status"]] = vcounts.get(res["v_status"], 0) + 1
        changed = [{"row": row, **{k: res.get(k) for k in
                    ("name", "address", "lat", "lng", "matched", "loc_type", "status", "note", "seq") + VERIFY_KEYS}}
                   for row, res in S.results.items() if res["seq"] > since]
        state = S.state if not (S.state in ("running", "stopping") and not S.running()) else "stopped"
        return jsonify({
            "state": state, "error": S.error, "total": S.total, "completed": S.completed,
            "counts": counts, "vcounts": vcounts, "use_place_count": len(use_place_candidates()), "results": sorted(changed, key=lambda x: x["row"]), "seq": S.seq,
            "generation": S.generation,
            "processed": len(S.results), "requests_made": S.geo.requests_made if S.geo else 0,
        })


@app.get("/api/download")
def api_download():
    if not S.file_path or not S.config:
        return err("Nothing to download yet. Run geocoding first.")
    if S.running():
        return err("Wait for processing to finish or stop it first.")
    out = os.path.join(WORK_DIR, f"output_{uuid.uuid4().hex}.xlsx")
    m = S.config["mapping"]
    try:
        extra = VERIFY_COLUMNS if any(r.get("v_status") for r in S.results.values()) else []
        excel_io.write_output(S.file_path, out, S.config["sheet"], S.data.header_row,
                              S.results, m["lat"], m["lng"], extra)
    except Exception:
        log.exception("Writing output failed")
        return err("Could not create the output file.", 500)
    name = f"{secure_filename(S.original_name or 'customers') or 'customers'}_geocoded.xlsx"
    return send_file(out, as_attachment=True, download_name=name)


def clear_files(keep_cache):
    if not os.path.isdir(WORK_DIR):
        return
    for n in os.listdir(WORK_DIR):
        if keep_cache and n == os.path.basename(CACHE_PATH):
            continue
        p = os.path.join(WORK_DIR, n)
        shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)


@app.post("/api/clear")
def api_clear():
    if S.running():
        S.stop_event.set()
        S.thread.join(timeout=30)
    clear_files(keep_cache=False)
    S.reset()
    return jsonify({"ok": True})


@app.errorhandler(413)
def too_large(_e):
    return err("File is too large (max 50 MB).", 413)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8765"))
    print(f"\n  Modern Dairy Geocoding Tool running at http://127.0.0.1:{port}\n  Press Ctrl+C to stop.\n")
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)
