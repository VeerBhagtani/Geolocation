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
