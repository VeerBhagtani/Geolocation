const $ = (id) => document.getElementById(id);
const LABELS = {
  SUCCESS_PRECISE: "Precise", SUCCESS_APPROXIMATE: "Approximate", REVIEW_REQUIRED: "Review required",
  NOT_FOUND: "Not found", API_ERROR: "API error", MISSING_ADDRESS: "Missing address", SKIPPED_EXISTING: "Skipped (existing)",
};
let headers = [], seq = 0, generation = null, polling = null, estTimer = null;
const rowEls = new Map();

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
    ["setup", "run"].forEach((id) => $(id).classList.remove("hidden"));
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
  try {
    const d = await post("/api/start", config(mode));
    if (!d.started) { showMsg(d.message, "info"); await poll(); return; }
    setRunning(true);
    poll();
  } catch (e) { showMsg(e.message); }
}
$("startBtn").onclick = () => start("all");
$("retryBtn").onclick = () => start("retry");
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
  const running = d.state === "running" || d.state === "stopping";
  if (!running) {
    setRunning(false);
    $("downloadBtn").disabled = d.processed === 0;
    $("retryBtn").disabled = !(c.API_ERROR || c.NOT_FOUND || c.REVIEW_REQUIRED);
    if (d.state === "error") showMsg(d.error);
    else if (d.state === "stopped") showMsg("Stopped. Click Start Geocoding to resume the remaining rows.", "info");
    else if (d.state === "done") showMsg("Finished. Review the flagged rows, then download the updated Excel.", "info");
    updateEstimate();
  }
}

function renderRow(r) {
  $("resultsSec").classList.remove("hidden");
  let tr = rowEls.get(r.row);
  if (!tr) { tr = document.createElement("tr"); rowEls.set(r.row, tr); $("results").tBodies[0].appendChild(tr); }
  const num = (v) => (v === null || v === undefined ? "" : (+v).toFixed(7));
  tr.dataset.status = r.status;
  tr.innerHTML = [r.row, r.name, r.address, num(r.lat), num(r.lng), r.matched, r.loc_type].map((v) => `<td>${esc(v ?? "")}</td>`).join("") +
    `<td class="s-${r.status}">${esc(r.status)}</td><td>${esc(r.note ?? "")}</td>`;
  applyFilter(tr);
}
const applyFilter = (tr) => { const f = $("filter").value; tr.classList.toggle("hidden", !!f && tr.dataset.status !== f); };
$("filter").onchange = () => rowEls.forEach(applyFilter);

function clearResults() { rowEls.clear(); $("results").tBodies[0].innerHTML = ""; seq = 0; $("summary").innerHTML = ""; $("bar").style.width = "0"; $("progressText").textContent = ""; }
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
