"""Google Geocoding API client, address building, result classification and cache."""
import json
import logging
import math
import os
import re
import threading
import time

import requests

log = logging.getLogger("geocoder")

DEFAULT_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"

# Output status values
PRECISE = "SUCCESS_PRECISE"
APPROXIMATE = "SUCCESS_APPROXIMATE"
REVIEW = "REVIEW_REQUIRED"
NOT_FOUND = "NOT_FOUND"
API_ERROR = "API_ERROR"
SKIPPED = "SKIPPED_EXISTING"
MISSING = "MISSING_ADDRESS"

RANK = {PRECISE: 4, APPROXIMATE: 3, REVIEW: 2, NOT_FOUND: 1, API_ERROR: 0}

# Result types that point at a specific building / business
PRECISE_TYPES = {
    "street_address", "premise", "subpremise", "establishment", "point_of_interest",
    "restaurant", "food", "cafe", "bakery", "bar", "store", "lodging", "meal_takeaway",
    "meal_delivery", "supermarket", "grocery_or_supermarket", "shopping_mall",
}
# Street-level or interpolated: usable but not exact
STREET_TYPES = {"route", "intersection", "plus_code"}
# Area-level results: never treated as an exact location
AREA_TYPES = {
    "locality", "sublocality", "sublocality_level_1", "sublocality_level_2", "sublocality_level_3",
    "neighborhood", "postal_code", "administrative_area_level_1", "administrative_area_level_2",
    "administrative_area_level_3", "country", "colloquial_area",
}

EMPTY_TOKENS = {"", "nan", "none", "null", "-", "--", "na", "n/a", "nil", "0"}


class FatalApiError(Exception):
    """Errors that make further requests pointless (bad key, billing, quota)."""


def clean(value):
    """Turn an Excel cell value into a trimmed string ('' if empty)."""
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        value = int(value)  # PIN codes often read as 411001.0
    s = re.sub(r"\s+", " ", str(value)).strip().strip(",").strip()
    return "" if s.lower() in EMPTY_TOKENS else s


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def _contains(haystack_norm, needle):
    n = norm(needle)
    return bool(n) and re.search(r"(^| )" + re.escape(n) + r"( |$)", haystack_norm) is not None


def build_address(parts, default_country=""):
    """Join address, city, state, PIN, country; skip empty or already-present components."""
    out, acc = [], ""
    for key in ("address", "city", "state", "pin", "country"):
        v = clean(parts.get(key))
        if key == "country" and not v:
            v = clean(default_country)
        if not v or _contains(acc, v):
            continue
        out.append(v)
        acc += " " + norm(v)
    return ", ".join(out)


def build_queries(parts, default_country=""):
    """Return the ordered list of queries to try for one row ([] = not enough address data).

    With a street address: try the address alone first (most reliable for the Geocoding
    API), then name + address as a fallback. Without one: name + city/PIN is the only option.
    """
    has_street = bool(clean(parts.get("address")))
    has_area = any(clean(parts.get(k)) for k in ("city", "pin"))
    if not has_street and not has_area:
        return []
    base = build_address(parts, default_country)
    name = clean(parts.get("name"))
    with_name = None
    if name and not _contains(norm(base), name):
        with_name = f"{name}, {base}"
    if has_street:
        return [base] + ([with_name] if with_name else [])
    return [with_name] if with_name else [base]


def valid_coords(lat, lng):
    try:
        lat, lng = float(lat), float(lng)
    except (TypeError, ValueError):
        return False
    if math.isnan(lat) or math.isnan(lng):
        return False
    return -90 <= lat <= 90 and -180 <= lng <= 180 and not (lat == 0 and lng == 0)


def _distance_km(a, b):
    lat1, lng1, lat2, lng2 = map(math.radians, (a["lat"], a["lng"], b["lat"], b["lng"]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


def _slim(result):
    """Keep only the fields we need (smaller cache, nothing extra stored)."""
    postal = next((c.get("long_name") for c in result.get("address_components", [])
                   if "postal_code" in c.get("types", [])), None)
    geo = result.get("geometry", {})
    return {
        "formatted_address": result.get("formatted_address", ""),
        "location": geo.get("location", {}),
        "location_type": geo.get("location_type", ""),
        "types": result.get("types", []),
        "partial_match": bool(result.get("partial_match")),
        "place_id": result.get("place_id", ""),
        "postal_code": postal,
    }


def classify(results, pin=""):
    """Decide how trustworthy the top result is. Returns (status, result, note)."""
    if not results:
        return NOT_FOUND, None, "No match found"
    r = results[0]
    lt = r["location_type"]
    types = set(r["types"])
    notes = []

    if lt == "ROOFTOP" and not types & AREA_TYPES:
        status = PRECISE
    elif types & PRECISE_TYPES:
        status = APPROXIMATE
        notes.append(f"Building/business match but {lt.lower()} accuracy")
    elif lt == "RANGE_INTERPOLATED" or types & STREET_TYPES:
        status = APPROXIMATE
        notes.append("Street-level match only")
    else:
        status = REVIEW
        notes.append("Matched only an area/locality/PIN centre (" + ", ".join(sorted(types)) + ")")

    if r["partial_match"]:
        notes.append("Partial match")
        if status == PRECISE:
            status = APPROXIMATE
        else:
            status = REVIEW

    pin_digits = re.sub(r"\D", "", clean(pin))
    if len(pin_digits) == 6 and r.get("postal_code") and r["postal_code"] != pin_digits:
        status = REVIEW
        notes.append(f"PIN mismatch (sheet {pin_digits}, Google {r['postal_code']})")

    if len(results) > 1:
        far = [x for x in results[1:] if x["location"] and _distance_km(r["location"], x["location"]) > 1]
        if far:
            status = REVIEW
            notes.append(f"{len(results)} candidates returned, up to "
                         f"{max(_distance_km(r['location'], x['location']) for x in far):.1f} km apart")
    return status, r, "; ".join(notes)


class Geocoder:
    """Throttled, retrying, caching client. One instance per app."""

    def __init__(self, api_key, cache_path=None, rps=10.0, max_retries=3, region="in",
                 api_url=None, session=None, sleep=time.sleep):
        self.api_key = api_key
        self.cache_path = cache_path
        self.min_interval = 1.0 / rps if rps > 0 else 0
        self.max_retries = max_retries
        self.region = region
        self.api_url = api_url or DEFAULT_API_URL
        self.session = session or requests.Session()
        self.sleep = sleep
        self.requests_made = 0
        self._last_call = 0.0
        self._lock = threading.Lock()
        self.cache = {}
        if cache_path and os.path.exists(cache_path):
            try:
                with open(cache_path, encoding="utf-8") as f:
                    self.cache = json.load(f)
            except (OSError, ValueError):
                self.cache = {}

    @staticmethod
    def key(query):
        return norm(query)

    def is_cached(self, query):
        return self.key(query) in self.cache

    def save_cache(self):
        if not self.cache_path:
            return
        tmp = self.cache_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(self.cache, f)
        os.replace(tmp, self.cache_path)

    def _throttle(self):
        wait = self._last_call + self.min_interval - time.monotonic()
        if wait > 0:
            self.sleep(wait)
        self._last_call = time.monotonic()

    def lookup(self, query, use_cache=True):
        """Return {'status': ..., 'results': [...], 'error': str}. Raises FatalApiError."""
        k = self.key(query)
        if use_cache and k in self.cache:
            return self.cache[k]
        if not self.api_key:
            raise FatalApiError("No Google API key entered. Enter it at the top of the page.")

        params = {"address": query, "key": self.api_key}
        if self.region:
            params["region"] = self.region
        last_err = ""
        for attempt in range(self.max_retries + 1):
            if attempt:
                self.sleep(min(2 ** attempt, 30))
            with self._lock:
                self._throttle()
                self.requests_made += 1
            try:
                resp = self.session.get(self.api_url, params=params, timeout=20)
                if resp.status_code == 429 or resp.status_code >= 500:
                    last_err = f"HTTP {resp.status_code}"
                    continue
                data = resp.json()
            except requests.RequestException as e:
                last_err = f"Network error ({type(e).__name__})"
                continue
            except ValueError:
                last_err = f"Invalid response (HTTP {resp.status_code})"
                continue

            status = data.get("status", "UNKNOWN_ERROR")
            msg = data.get("error_message", "")
            if status in ("OK", "ZERO_RESULTS"):
                out = {"status": status, "results": [_slim(r) for r in data.get("results", [])][:5]}
                self.cache[k] = out
                return out
            if status in ("REQUEST_DENIED", "OVER_DAILY_LIMIT"):
                raise FatalApiError(
                    f"Google rejected the request ({status}). Check that the API key is correct, "
                    f"the Geocoding API is enabled and billing is active. Google says: {msg or 'no details'}")
            if status in ("OVER_QUERY_LIMIT", "UNKNOWN_ERROR"):
                last_err = f"{status}{': ' + msg if msg else ''}"
                continue
            # INVALID_REQUEST or anything unexpected: no point retrying
            return {"status": status, "results": [], "error": f"{status}{': ' + msg if msg else ''}"}

        if last_err.startswith("OVER_QUERY_LIMIT"):
            raise FatalApiError(
                "Google quota / rate limit exceeded (OVER_QUERY_LIMIT) even after retries. Processing was "
                "paused; completed rows are kept. Wait (or raise the quota in Google Cloud) and click "
                "Start Geocoding again to resume.")
        return {"status": "API_ERROR", "results": [], "error": last_err or "Unknown error"}

    def places_search(self, text, lat=None, lng=None, use_cache=True):
        """Text Search (New). Returns {'status': 'OK'|'ZERO_RESULTS'|'ERROR', 'places': [...], 'error': str}."""
        bias = f"{lat:.3f},{lng:.3f}" if lat is not None and lng is not None else ""
        k = "places|" + self.key(text) + "|" + bias
        if use_cache and k in self.cache:
            return self.cache[k]
        if not self.api_key:
            raise FatalApiError("No Google API key entered. Enter it at the top of the page.")
        body = {"textQuery": text, "pageSize": 3}
        if self.region:
            body["regionCode"] = self.region.upper()
        if bias:
            body["locationBias"] = {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": 3000.0}}
        headers = {"X-Goog-Api-Key": self.api_key, "X-Goog-FieldMask": PLACES_FIELDS}
        url = os.environ.get("PLACES_API_URL") or DEFAULT_PLACES_URL
        last_err = ""
        for attempt in range(self.max_retries + 1):
            if attempt:
                self.sleep(min(2 ** attempt, 30))
            with self._lock:
                self._throttle()
                self.requests_made += 1
            try:
                resp = self.session.post(url, json=body, headers=headers, timeout=20)
                data = resp.json() if resp.content else {}
            except requests.RequestException as e:
                last_err = f"Network error ({type(e).__name__})"
                continue
            except ValueError:
                last_err = f"Invalid response (HTTP {resp.status_code})"
                continue
            code = resp.status_code
            msg = (data.get("error") or {}).get("message", "") if isinstance(data, dict) else ""
            if code == 200:
                places = [{
                    "id": p.get("id"), "name": (p.get("displayName") or {}).get("text", ""),
                    "address": p.get("formattedAddress", ""),
                    "lat": (p.get("location") or {}).get("latitude"), "lng": (p.get("location") or {}).get("longitude"),
                    "business_status": p.get("businessStatus"), "uri": p.get("googleMapsUri"),
                } for p in data.get("places", [])]
                out = {"status": "OK" if places else "ZERO_RESULTS", "places": places}
                self.cache[k] = out
                return out
            if code in (401, 403):
                raise FatalApiError(
                    "Google refused the name check (Places API). In Google Cloud: enable 'Places API (New)', and if "
                    "your key has API restrictions, add 'Places API (New)' to them. Google says: " + (msg or f"HTTP {code}"))
            if code == 429 or code >= 500:
                last_err = f"HTTP {code}{': ' + msg if msg else ''}"
                continue
            return {"status": "ERROR", "places": [], "error": f"HTTP {code}{': ' + msg if msg else ''}"}
        if last_err.startswith("HTTP 429"):
            raise FatalApiError("Google Places quota / rate limit exceeded. Name checks paused; finished rows are kept. "
                                "Wait, then click 'Verify names' again to continue.")
        return {"status": "ERROR", "places": [], "error": last_err or "Unknown error"}


# ---------- Business-name verification (Places API "Text Search (New)") ----------

DEFAULT_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"
PLACES_FIELDS = ("places.id,places.displayName,places.formattedAddress,places.location,"
                 "places.businessStatus,places.googleMapsUri")

V_OK = "NAME_VERIFIED"            # Google listing with this name at/near our coordinates
V_FAR = "NAME_VERIFIED_FAR"       # name matches, but the listing is far from our coordinates
V_MISMATCH = "NAME_MISMATCH"      # Google's nearest listing has a different name
V_NONE = "NO_BUSINESS_FOUND"
V_CLOSED = "BUSINESS_CLOSED"
V_ERR = "VERIFY_ERROR"

NAME_MATCH_MIN = 70   # % similarity to accept a name
NEAR_M = 300          # max metres between geocode and listing to call it "same place"

# Generic words that shouldn't decide whether two business names match
NAME_STOPWORDS = {
    "the", "and", "of", "restaurant", "restaurants", "restro", "resto", "hotel", "hotels", "cafe", "caf",
    "bar", "kitchen", "foods", "food", "family", "veg", "pure", "pvt", "ltd", "private", "limited", "llp",
    "co", "company", "dhaba", "eatery", "bistro", "lounge", "n", "s",
}


def _name_tokens(s):
    toks = norm(s.replace("&", " and ")).split()
    core = [t for t in toks if t not in NAME_STOPWORDS]
    return core or toks


def name_score(sheet_name, google_name):
    """0-100 similarity between our customer name and Google's business name."""
    from difflib import SequenceMatcher
    a, b = _name_tokens(sheet_name), _name_tokens(google_name)
    if not a or not b:
        return 0
    seq = SequenceMatcher(None, " ".join(a), " ".join(b)).ratio()
    sa, sb = set(a), set(b)
    shared = sa & sb
    # "Shreyas" vs "Shreyas Pure Veg" counts as a match, but not a lone short word like "Sai" or "Om"
    contain = len(shared) / min(len(sa), len(sb)) if sum(map(len, shared)) >= 5 else 0
    return round(100 * max(seq, contain))


def distance_m(lat1, lng1, lat2, lng2):
    return round(1000 * _distance_km({"lat": lat1, "lng": lng1}, {"lat": lat2, "lng": lng2}))


def verify_name(places, sheet_name, lat=None, lng=None):
    """Pick the best Google listing for this customer and judge it."""
    if not places:
        return {"v_status": V_NONE, "v_note": "No Google business listing found for this name"}
    scored = []
    for p in places:
        d = distance_m(lat, lng, p["lat"], p["lng"]) if lat is not None and p.get("lat") is not None else None
        scored.append((name_score(sheet_name, p["name"]), -(d if d is not None else 0), d, p))
    score, _, d, p = max(scored, key=lambda x: (x[0] >= NAME_MATCH_MIN, x[1] if x[0] >= NAME_MATCH_MIN else x[0], x[0]))
    out = {"place_name": p["name"], "place_address": p["address"], "place_lat": p.get("lat"),
           "place_lng": p.get("lng"), "place_uri": p.get("uri"), "place_ref": p.get("id"),
           "name_score": score, "distance_m": d}
    where = f", {d} m from the geocoded point" if d is not None else ""
    if p.get("business_status") == "CLOSED_PERMANENTLY" and score >= NAME_MATCH_MIN:
        out.update(v_status=V_CLOSED, v_note=f"Google lists '{p['name']}' as permanently closed")
    elif score < NAME_MATCH_MIN:
        out.update(v_status=V_MISMATCH, v_note=f"Closest Google listing is '{p['name']}' ({score}% name match{where})")
    elif d is not None and d > NEAR_M:
        out.update(v_status=V_FAR, v_note=f"'{p['name']}' found {d} m away from the geocoded point - "
                                          "the coordinates may be wrong")
    else:
        out.update(v_status=V_OK, v_note=f"Google listing '{p['name']}' matches ({score}%{where})")
    return out

