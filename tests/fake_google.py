"""Fake Google Geocoding API used by tests (no network, no real key).

Behaviour is keyed on words in the address:
  nowhere -> ZERO_RESULTS        quota -> OVER_QUERY_LIMIT     flaky -> UNKNOWN_ERROR once
  invalid -> INVALID_REQUEST     ambiguous -> 2 far-apart results
  street  -> RANGE_INTERPOLATED  only city/PIN -> locality centre (APPROXIMATE)
  anything else with a street address -> ROOFTOP premise at a coordinate derived from the text
Key "bad-key" -> REQUEST_DENIED.
"""
import hashlib
import json
import re
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

calls = []
_flaky_seen = set()


def _coord(text):
    h = int(hashlib.md5(text.encode()).hexdigest(), 16)
    return 18.4 + (h % 10000) / 50000, 73.7 + (h // 10000 % 10000) / 50000


def _result(addr, lat, lng, loc_type, types, postal="411001", partial=False):
    r = {"formatted_address": f"Matched: {addr}", "geometry": {"location": {"lat": lat, "lng": lng}, "location_type": loc_type},
         "types": types, "place_id": "PID_" + hashlib.md5(addr.encode()).hexdigest()[:10],
         "address_components": [{"long_name": postal, "types": ["postal_code"]}]}
    if partial:
        r["partial_match"] = True
    return r


def respond(params):
    addr, key = params.get("address", ""), params.get("key", "")
    calls.append(addr)
    low = addr.lower()
    if key == "bad-key":
        return {"status": "REQUEST_DENIED", "error_message": "The provided API key is invalid."}
    if "quota" in low:
        return {"status": "OVER_QUERY_LIMIT", "error_message": "You have exceeded your rate-limit."}
    if "flaky" in low and addr not in _flaky_seen:
        _flaky_seen.add(addr)
        return {"status": "UNKNOWN_ERROR"}
    if "invalid" in low:
        return {"status": "INVALID_REQUEST"}
    if "nowhere" in low:
        return {"status": "ZERO_RESULTS", "results": []}
    lat, lng = _coord(low)
    if "ambiguous" in low:
        return {"status": "OK", "results": [_result(addr, lat, lng, "ROOFTOP", ["premise"]),
                                            _result(addr, lat + 0.5, lng, "ROOFTOP", ["premise"])]}
    if "street" in low:
        return {"status": "OK", "results": [_result(addr, lat, lng, "RANGE_INTERPOLATED", ["street_address"])]}
    first = addr.split(",")[0].strip().lower()
    if first in ("pune", "mumbai", "411001", "411045") or first.isdigit():
        return {"status": "OK", "results": [_result(addr, 18.5204, 73.8567, "APPROXIMATE", ["locality", "political"])]}
    m = re.search(r"\b(\d{6})\b", addr)
    postal = "400001" if "wrongpin" in low else (m.group(1) if m else "411001")
    return {"status": "OK", "results": [_result(addr, lat, lng, "ROOFTOP", ["premise"], postal)]}


class FakeResponse:
    def __init__(self, data, code=200):
        self._d, self.status_code = data, code

    def json(self):
        return self._d


class FakeSession:
    def get(self, url, params=None, timeout=None):
        return FakeResponse(respond(params or {}))


class _Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        q = {k: v[0] for k, v in parse_qs(urlparse(self.path).query).items()}
        body = json.dumps(respond(q)).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


def serve(port):
    srv = HTTPServer(("127.0.0.1", port), _Handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


if __name__ == "__main__":  # python tests/fake_google.py 8999
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8999
    print(f"Fake Google Geocoding API on http://127.0.0.1:{port}/")
    HTTPServer(("127.0.0.1", port), _Handler).serve_forever()
