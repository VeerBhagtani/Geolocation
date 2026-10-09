const $ = (id) => document.getElementById(id);
const LABELS = {
  SUCCESS_PRECISE: "Precise", SUCCESS_APPROXIMATE: "Approximate", REVIEW_REQUIRED: "Review required",
  NOT_FOUND: "Not found", API_ERROR: "API error", MISSING_ADDRESS: "Missing address", SKIPPED_EXISTING: "Skipped (existing)",
  FROM_FILE: "From file",
};
const VLABELS = {
  NAME_VERIFIED: "Name verified", NAME_VERIFIED_FAR: "Name found, but far away", NAME_MISMATCH: "Different business at Google",
  NO_BUSINESS_FOUND: "No business found", BUSINESS_CLOSED: "Business closed", VERIFY_ERROR: "Name check error",
};
let lastMode = "all";
const COLORS = {
  SUCCESS_PRECISE: "#1a7f37", SUCCESS_APPROXIMATE: "#d29922", REVIEW_REQUIRED: "#cf222e", NOT_FOUND: "#cf222e",
  API_ERROR: "#cf222e", SKIPPED_EXISTING: "#6e7781", FROM_FILE: "#1f6feb",
};
let headers = [], seq = 0, generation = null, polling = null, estTimer = null;
const rowEls = new Map(), rowData = new Map(), markers = new Map();
let gmap = null, info = null, AdvMarker = null, Pin = null, bizMarker = null;

function showMsg(text, kind = "error") {
  const m = $("message");
  m.textContent = text || "";
  m.className = "msg " + kind + (text ? "" : " hidden");
}

async function api(url, opts = {}) {
  let res;
  try { res = await fetch(url, opts); } catch { throw new Error("Cannot reach the local server. Is it still running?"); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
const post = (url, body) => api(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });

function config(mode = "all") {
  const mapping = {};
  document.querySelectorAll("#mapping select").forEach((s) => (mapping[s.dataset.field] = s.value === "" ? null : +s.value));
  return {
    sheet: $("sheet").value, header_row: +$("headerRow").value || null, mapping,
    skip_existing: $("skipExisting").checked, default_country: $("defaultCountry").value, mode,
  };
}

// ---- upload & preview ----
$("file").addEventListener("change", async () => {
  const f = $("file").files[0];
  if (!f) return;
  showMsg("");
  $("uploadInfo").textContent = "Reading file…";
  const fd = new FormData();
  fd.append("file", f);
  try {
    const d = await api("/api/upload", { method: "POST", body: fd });
    $("uploadInfo").textContent = `${f.name} — ${d.sheets.length} worksheet(s)` +
      (d.xls ? " (old .xls format: values kept, cell formatting cannot be carried over)" : "");
    $("sheet").innerHTML = d.sheets.map((s) => `<option>${esc(s)}</option>`).join("");
    clearResults();
    $("headerRow").value = "";
    await loadPreview();
    ["setup", "run", "mapSec"].forEach((id) => $(id).classList.remove("hidden"));
  } catch (e) { $("uploadInfo").textContent = ""; showMsg(e.message); }
});

$("sheet").addEventListener("change", () => { $("headerRow").value = ""; loadPreview(); });
$("headerRow").addEventListener("change", loadPreview);

async function loadPreview() {
  try {
    const hr = $("headerRow").value;
    const d = await api(`/api/preview?sheet=${encodeURIComponent($("sheet").value)}` + (hr ? `&header_row=${hr}` : ""));
    headers = d.headers;
    $("headerRow").value = d.header_row;
    $("preview").innerHTML = `<p class="muted">${d.row_count} data rows. First rows:</p><table><thead><tr>` +
      headers.map((h) => `<th>${esc(h)}</th>`).join("") + "</tr></thead><tbody>" +
      d.sample.map((r) => "<tr>" + headers.map((_, i) => `<td>${esc(r[i] ?? "")}</td>`).join("") + "</tr>").join("") +
      "</tbody></table>";
    document.querySelectorAll("#mapping select").forEach((s) => {
      const g = d.guess[s.dataset.field];
      s.innerHTML = `<option value="">— not in file —</option>` +
        headers.map((h, i) => `<option value="${i}"${g === i ? " selected" : ""}>${esc(h)}</option>`).join("");
    });
    updateEstimate();
  } catch (e) { showMsg(e.message); }
}

// ---- estimate ----
document.querySelectorAll("#mapping select, #skipExisting, #defaultCountry").forEach((el) =>
  el.addEventListener("change", updateEstimate));

function updateEstimate() {
  clearTimeout(estTimer);
  estTimer = setTimeout(async () => {
    const box = $("estimate");
    try {
      const e = await post("/api/estimate", config());
      let t = `${e.total_rows} rows · ${e.to_process} to process · ${e.skip_existing} already have coordinates (skip option) · ` +
        `${e.missing_address} missing address` + (e.duplicates ? ` · ${e.duplicates} rows share an address with another row` : "") +
        `\nEstimated Google API requests: ${e.min_requests}` + (e.max_requests > e.min_requests ? ` to ${e.max_requests} (extra searches with the customer name when the address alone is weak)` : "") +
        " — cached results are not re-requested.";
      if (e.cost_min !== undefined) {
        t += `\nApprox. cost at your configured price: ${e.currency} ${e.cost_min}` + (e.cost_max > e.cost_min ? `–${e.cost_max}` : "") +
          (e.free_monthly ? ` before the free monthly allowance of ${e.free_monthly} requests` : "") + ". Verify current pricing in Google Cloud.";
      } else {
        t += "\nCheck current Geocoding API pricing: https://developers.google.com/maps/billing-and-pricing/pricing";
      }
      box.textContent = t;
      box.className = "msg info";
    } catch (err) { box.textContent = err.message; box.className = "msg error"; }
  }, 250);
}

// ---- run ----
async function start(mode) {
  showMsg("");
  lastMode = mode;
  try {
    if (mode === "verify") {
      const e = await post("/api/estimate", config("verify"));
      if (!e.to_process) { showMsg("All rows with a customer name are already checked.", "info"); return; }
      if (!confirm(`Check ${e.to_process} customer names on Google (Places API)?\n\nThis makes up to ${e.to_process} Places requests, ` +
        "billed separately from geocoding at a higher price. Your key must have 'Places API (New)' enabled.")) return;
    }
    const d = await post("/api/start", config(mode));
    if (!d.started) { showMsg(d.message, "info"); await poll(); return; }
    setRunning(true);
    poll();
  } catch (e) { showMsg(e.message); }
}
$("startBtn").onclick = () => start("all");
$("retryBtn").onclick = () => start("retry");
$("verifyBtn").onclick = () => start("verify");
$("usePlaceBtn").onclick = async () => {
  if (!confirm("Replace the coordinates of these rows with the location of the matching Google business listing?\n\n" +
    "Only rows where the customer name matches Google's listing and the address-based result was weak or far away are changed.")) return;
  try { const d = await post("/api/use_place", { all: true }); showMsg(`Updated ${d.updated} rows.`, "info"); poll(); }
  catch (e) { showMsg(e.message); }
};
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-use-row]");
  if (!b) return;
  try { await post("/api/use_place", { row: +b.dataset.useRow }); await poll(); openInfo(+b.dataset.useRow); }
  catch (err) { showMsg(err.message); }
});
$("stopBtn").onclick = async () => { await post("/api/stop").catch(() => {}); $("stopBtn").disabled = true; };
$("downloadBtn").onclick = async () => {
  showMsg("");
  try {
    const res = await fetch("/api/download");
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Download failed.");
    const blob = await res.blob();
    const name = (res.headers.get("Content-Disposition") || "").match(/filename\*?=(?:UTF-8'')?"?([^";]+)/)?.[1] || "customers_geocoded.xlsx";
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: decodeURIComponent(name) });
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) { showMsg(e.message); }
};
$("clearBtn").onclick = async () => {
  if (!confirm("Clear the current session, uploaded file, results and the geocoding cache?")) return;
  await post("/api/clear").catch(() => {});
  location.reload();
};

function setRunning(on) {
  $("startBtn").disabled = on; $("retryBtn").disabled = on; $("downloadBtn").disabled = on;
  $("verifyBtn").disabled = on; $("usePlaceBtn").disabled = on;
  $("stopBtn").disabled = !on; $("file").disabled = on;
  document.querySelectorAll("#setup select, #setup input").forEach((el) => (el.disabled = on));
  clearInterval(polling);
  if (on) polling = setInterval(poll, 1000);
}

async function poll() {
  let d;
  try { d = await api(`/api/status?since=${seq}`); } catch (e) { showMsg(e.message); return; }
  if (generation !== null && d.generation !== generation) { clearResults(); d = await api("/api/status?since=0"); }
  generation = d.generation;
  for (const r of d.results) renderRow(r);
  seq = Math.max(seq, d.seq);
  const pct = d.total ? Math.round((100 * d.completed) / d.total) : 0;
  $("bar").style.width = pct + "%";
  $("progressText").textContent = d.total ? `${d.completed} / ${d.total} rows (${pct}%) · state: ${d.state} · API requests this session: ${d.requests_made}` : "";
  const c = d.counts;
  $("summary").innerHTML = Object.keys(LABELS).filter((k) => c[k]).map((k) => `<span>${LABELS[k]}: <b>${c[k]}</b></span>`).join("");
  const v = d.vcounts || {};
  $("vsummary").innerHTML = Object.keys(v).length ? "<b>Name check:</b> " +
    Object.keys(VLABELS).filter((k) => v[k]).map((k) => `<span class="v-${k}">${VLABELS[k]}: ${v[k]}</span>`).join("") : "";
  $("usePlaceBtn").textContent = `Use Google business location for ${d.use_place_count} rows`;
  $("usePlaceBtn").classList.toggle("hidden", !d.use_place_count);
  const running = d.state === "running" || d.state === "stopping";
  if (!running) {
    setRunning(false);
    $("downloadBtn").disabled = d.processed === 0;
    $("retryBtn").disabled = !(c.API_ERROR || c.NOT_FOUND || c.REVIEW_REQUIRED);
    $("verifyBtn").disabled = d.processed === 0;
    if (d.state === "error") showMsg(d.error);
    else if (d.state === "stopped") showMsg(`Stopped. Click ${lastMode === "verify" ? "Verify names" : "Start Geocoding"} to resume the remaining rows.`, "info");
    else if (d.state === "done" && polling !== null) showMsg(lastMode === "verify"
      ? "Name check finished. Filter by 'Name check' to review problems; click a row to compare on the map."
      : "Finished. Review the flagged rows, then download the updated Excel. Optional: Verify names with Google.", "info");
    updateEstimate();
  }
}

function renderRow(r) {
  $("resultsSec").classList.remove("hidden");
  let tr = rowEls.get(r.row);
  if (!tr) { tr = document.createElement("tr"); rowEls.set(r.row, tr); $("results").tBodies[0].appendChild(tr); }
  const num = (v) => (v === null || v === undefined ? "" : (+v).toFixed(7));
  tr.dataset.status = r.status;
  tr.dataset.row = r.row;
  rowData.set(r.row, r);
  const check = r.v_status ? `<span class="v-${r.v_status}">${esc(VLABELS[r.v_status] || r.v_status)}</span>` +
    (r.place_name ? `<br>Google: ${esc(r.place_name)} (${r.name_score}% match${r.distance_m != null ? `, ${r.distance_m} m` : ""})` : "") : "";
  tr.innerHTML = [r.row, r.name, r.address, num(r.lat), num(r.lng), r.matched, r.loc_type].map((v) => `<td>${esc(v ?? "")}</td>`).join("") +
    `<td class="s-${r.status}">${esc(r.status)}</td><td>${esc(r.note ?? "")}</td><td>${check}</td><td class="links">${links(r)}</td>`;
  applyFilter(tr);
  if (gmap) setMarker(r);
}
const hasCoords = (r) => r.lat !== null && r.lat !== undefined && r.lng !== null && r.lng !== undefined;
const gmapsLink = (r) => `<a href="https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}" target="_blank" rel="noopener">Open pin</a>`;
const ext = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${text}</a>`;
// Free check: Google Maps search for "name, address" shows the business listing Google knows
const nameSearchUrl = (r) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([r.name, r.address].filter(Boolean).join(", "));
function links(r) {
  return [hasCoords(r) ? gmapsLink(r) : "", r.name ? ext(nameSearchUrl(r), "Search name") : "",
    r.place_uri ? ext(r.place_uri, "Google listing") : ""].join("");
}
const shown = (r) => {
  const f = $("filter").value;
  return !f || (f.startsWith("v:") ? r.v_status === f.slice(2) : r.status === f);
};
const applyFilter = (tr) => tr.classList.toggle("hidden", !shown(rowData.get(+tr.dataset.row) || {}));
$("filter").onchange = () => {
  rowEls.forEach(applyFilter);
  markers.forEach((m, row) => (m.map = shown(rowData.get(row)) ? gmap : null));
};

// ---- Google map ----
$("loadMapBtn").onclick = () => {
  const key = $("mapsKey").value.trim();
  if (!key) return showMsg("Enter your Maps JavaScript API key.");
  if (window.google?.maps) return initMap();
  window.gm_authFailure = () => showMsg("Google rejected the Maps key. Check that the Maps JavaScript API is enabled, billing is on, " +
    "and the key's website restriction includes http://127.0.0.1:8765/*");
  window.initMap = initMap;
  const sc = document.createElement("script");
  sc.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=initMap&v=weekly`;
  sc.onerror = () => showMsg("Could not load Google Maps. Check your internet connection.");
  document.head.appendChild(sc);
  $("mapsKey").value = "";
};

async function initMap() {
  try {
    const { Map: GMap, InfoWindow } = await google.maps.importLibrary("maps");
    ({ AdvancedMarkerElement: AdvMarker, PinElement: Pin } = await google.maps.importLibrary("marker"));
    gmap = new GMap($("map"), { center: { lat: 18.5204, lng: 73.8567 }, zoom: 11, mapId: "DEMO_MAP_ID" });
    info = new InfoWindow();
  } catch (e) { showMsg("Could not start Google Maps: " + e.message); return; }
  ["mapKeyEntry"].forEach((id) => $(id).classList.add("hidden"));
  ["mapTools", "map"].forEach((id) => $(id).classList.remove("hidden"));
  rowData.forEach(setMarker);
  fitMap();
}

function setMarker(r) {
  let m = markers.get(r.row);
  if (!hasCoords(r)) { if (m) { m.map = null; markers.delete(r.row); } return; }
  const glyph = r.v_status === "NAME_VERIFIED" ? "✓" : r.v_status ? "!" : "";
  const pin = new Pin({ background: COLORS[r.status] || "#1f6feb", borderColor: "#ffffff", glyphColor: "#ffffff", glyph, scale: 0.9 });
  if (!m) {
    m = new AdvMarker({ map: null, gmpClickable: true });
    m.addListener("click", () => openInfo(m.rowNum));
    markers.set(r.row, m);
  }
  m.rowNum = r.row;
  m.position = { lat: +r.lat, lng: +r.lng };
  m.title = `${r.name || "Row " + r.row}`;
  m.content = pin.element;
  m.map = shown(r) ? gmap : null;
}

function openInfo(row) {
  const r = rowData.get(row), m = markers.get(row);
  if (!r || !m) return;
  const biz = r.place_name != null;
  info.setContent(`<div class="info"><b>${esc(r.name || "(no name)")}</b>Row ${r.row} · ${esc(LABELS[r.status] || r.status)} · ${esc(r.loc_type || "")}` +
    `<table><tr><th></th><th>Your sheet</th><th>Google</th></tr>` +
    `<tr><th>Name</th><td>${esc(r.name || "-")}</td><td>${biz ? esc(r.place_name) + ` (${r.name_score}% match)` : r.v_status ? "—" : "<i>not checked</i>"}</td></tr>` +
    `<tr><th>Address</th><td>${esc(r.address || "-")}</td><td>${esc(r.matched || "-")}${biz && r.place_address !== r.matched ? `<br><i>Listing:</i> ${esc(r.place_address)}` : ""}</td></tr></table>` +
    (r.v_status ? `<span class="v-${r.v_status}">${esc(VLABELS[r.v_status])}</span>: ${esc(r.v_note || "")}<br>` : "") +
    (r.note ? `<small>${esc(r.note)}</small><br>` : "") +
    `${(+r.lat).toFixed(6)}, ${(+r.lng).toFixed(6)} · ${links(r).replaceAll("</a><a", "</a> · <a")}` +
    (biz && r.distance_m > 0 ? `<br><button data-use-row="${r.row}">Use Google business location (${r.distance_m} m away)</button>` : "") +
    `</div>`);
  info.open({ anchor: m, map: gmap });
  // Show the business listing's own position as a second pin "B"
  if (bizMarker) bizMarker.map = null;
  if (biz && r.place_lat != null && r.distance_m > 0) {
    bizMarker = new AdvMarker({ map: gmap, position: { lat: +r.place_lat, lng: +r.place_lng }, title: "Google listing: " + r.place_name,
      content: new Pin({ background: "#8250df", borderColor: "#fff", glyphColor: "#fff", glyph: "B" }).element });
  }
}

function fitMap() {
  const pts = [...markers.values()].filter((m) => m.map).map((m) => m.position);
  if (!pts.length) return;
  const b = new google.maps.LatLngBounds();
  pts.forEach((p) => b.extend(p));
  gmap.fitBounds(b);
  if (pts.length === 1) gmap.setZoom(16);
}

$("results").addEventListener("click", (e) => {
  const tr = e.target.closest("tr[data-row]");
  if (!tr || e.target.tagName === "A" || !gmap) return;
  const row = +tr.dataset.row, m = markers.get(row);
  if (!m) return showMsg("This row has no coordinates.", "info");
  gmap.panTo(m.position); gmap.setZoom(17); openInfo(row);
  $("map").scrollIntoView({ behavior: "smooth", block: "center" });
});

$("fileMapBtn").onclick = async () => {
  showMsg("");
  try {
    const d = await post("/api/mapdata", config());
    clearResults();
    d.rows.forEach(renderRow);
    fitMap();
    showMsg(`Loaded ${d.rows.length} rows with coordinates from the file` + (d.without_coords ? ` (${d.without_coords} rows have none).` : "."), "info");
  } catch (e) { showMsg(e.message); }
};

function clearResults() { markers.forEach((m) => (m.map = null)); markers.clear(); rowData.clear(); rowEls.clear(); $("results").tBodies[0].innerHTML = ""; seq = 0; $("summary").innerHTML = ""; $("bar").style.width = "0"; $("progressText").textContent = ""; }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// ---- API key ----
function showKey(saved) {
  $("keySaved").classList.toggle("hidden", !saved);
  $("keyEntry").classList.toggle("hidden", saved);
}
$("saveKeyBtn").onclick = async () => {
  showMsg("");
  $("saveKeyBtn").disabled = true;
  $("saveKeyBtn").textContent = "Checking…";
  try {
    const d = await post("/api/key", { key: $("apiKey").value });
    $("apiKey").value = "";
    showKey(d.key_configured);
    if (d.key_configured) showMsg("API key works.", "info");
  } catch (e) { showMsg(e.message); }
  $("saveKeyBtn").disabled = false;
  $("saveKeyBtn").textContent = "Save key";
};
$("apiKey").addEventListener("keydown", (e) => e.key === "Enter" && $("saveKeyBtn").click());
$("changeKeyBtn").onclick = () => showKey(false);
api("/api/config").then((d) => showKey(d.key_configured)).catch(() => {});
