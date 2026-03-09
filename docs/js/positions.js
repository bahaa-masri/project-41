
const CONFIG = {
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzhtrDwC0GdV0tjZ4hjKh8cteuykOh5xqQhdIec_Tk9CWGHPVgMW-sQpVvA0WNToLbf9A/exec",
    FETCH_TIMEOUT_MS: 8000,
    CSV_FALLBACK_URL: "./data/positions.csv"
};

const fallbackPositions = [
    { role: "loading", title: "Loading positions...", type: "", level: "" }
];

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("position");
    const jobsContainer = document.getElementById("jobs-list");
    if (!select || !jobsContainer) return;

    select.disabled = true;
    renderAll(fallbackPositions); // immediate UI
    loadPositions(); // GS -> CSV -> fallback
});

/* -------------------------
   Main flow
   ------------------------- */
async function loadPositions() {
    let data = [];
    try {
        data = await loadFromGSLikeOld(); // <-- uses SCRIPT_URL but does old-style parsing
    } catch (e) {
        console.warn("GS load failed:", e);
        try {
            data = await loadFromCSV(CONFIG.CSV_FALLBACK_URL);
            console.log("Loaded from CSV fallback");
        } catch (e2) {
            console.warn("CSV fallback failed:", e2);
            data = fallbackPositions;
        }
    }
    renderAll(data);
}

/* -------------------------
   fetch helper
   ------------------------- */
async function fetchWithTimeout(url, opts = {}, timeoutMs = CONFIG.FETCH_TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal, cache: "no-store", ...opts });
        clearTimeout(id);
        return res;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}


async function loadFromGSLikeOld() {
    if (!CONFIG.SCRIPT_URL) throw new Error("SCRIPT_URL not set");

    const url = `${CONFIG.SCRIPT_URL}?t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {}, CONFIG.FETCH_TIMEOUT_MS);
    if (!res.ok) {
        const txt = await tryReadTextSafe(res);
        throw new Error(`GS response ${res.status} ${res.statusText} ${txt ? "- " + txt.slice(0, 200) : ""}`);
    }

    const contentType = res.headers.get("content-type") || "";

    // try parse as JSON first
    if (contentType.includes("application/json") || contentType.includes("text/json")) {
        const json = await res.json();
        // case A: array of objects
        if (Array.isArray(json) && json.length && typeof json[0] === "object" && !Array.isArray(json[0])) {
            return mapObjectsToOldStyleRows(json);
        }
        // case B alt: GS might return {table: {rows: [...]}} (gviz-like already parsed)
        if (json && json.table && Array.isArray(json.table.rows)) {
            return parseGvizRowsToObjects(json.table.rows);
        }
        // case C: maybe GS returned 2D array
        if (Array.isArray(json) && json.length && Array.isArray(json[0])) {
            return parse2DArrayToObjects(json);
        }
        throw new Error("Unrecognized JSON shape from GS");
    }

    // if not JSON, try as text (maybe gviz/tq raw)
    const text = await res.text();
    // try gviz style: starts with some prefix "/*O_o*/google.visualization.Query.setResponse("
    if (text && text.length > 100 && text.indexOf("google.visualization.Query.setResponse") !== -1) {
        // extract inner JSON like old code
        try {
            const trimmed = text.substring(text.indexOf("(") + 1).slice(0, -2); // safe-ish
            const parsed = JSON.parse(trimmed);
            if (parsed && parsed.table && Array.isArray(parsed.table.rows)) {
                return parseGvizRowsToObjects(parsed.table.rows);
            }
        } catch (e) {
            console.warn("Failed to parse gviz text:", e);
        }
    }

    // as a last attempt: treat text as CSV-like body
    try {
        const rowsRaw = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
        if (rowsRaw.length) {
            // reuse CSV parsing path: parse first line for headers, then convert
            const firstCells = parseCsvLine(rowsRaw[0]).map(h => String(h).toLowerCase().trim());
            const hasHeaderNames = firstCells.some(h => ["role", "title", "type", "level", "active"].includes(h));
            const dataLines = hasHeaderNames ? rowsRaw.slice(1) : rowsRaw;
            const headers = hasHeaderNames ? firstCells : ["role", "title", "type", "level", "active"];
            const parsed = dataLines.map(line => {
                const cells = parseCsvLine(line);
                return {
                    role: String(cells[headers.indexOf("role")] || "").trim(),
                    title: String(cells[headers.indexOf("title")] || "").trim(),
                    type: String(cells[headers.indexOf("type")] || "").trim(),
                    level: String(cells[headers.indexOf("level")] || "").trim(),
                    active: String(cells[headers.indexOf("active")] || "yes").trim()
                };
            });
            return parsed.filter(p => p.role && p.title && String(p.active || "").toLowerCase() === "yes");
        }
    } catch (e) {
        /* ignore */
    }

    throw new Error("Unable to parse GS response");
}

/* -------------------------
   helpers to parse shapes
   ------------------------- */
function mapObjectsToOldStyleRows(arr) {
    // arr: [{role:'x', title:'y', ...}, ...]
    // normalize keys, then filter active=yes
    const normalized = arr.map(row => ({
        role: String(row.role ?? row.Role ?? row.ROLE ?? "").trim(),
        title: String(row.title ?? row.Title ?? row.TITLE ?? "").trim(),
        type: String(row.type ?? row.Type ?? "").trim(),
        level: String(row.level ?? row.Level ?? "").trim(),
        active: String(row.active ?? row.Active ?? "yes").trim()
    }));
    return normalized.filter(p => p.role && p.title && String(p.active || "").toLowerCase() === "yes");
}

function parse2DArrayToObjects(arr2d) {
    // arr2d: [ [header1,header2,...], [r1c1,r1c2,...], ... ]
    const headers = (arr2d[0] || []).map(h => String(h || "").toLowerCase().trim());
    const dataRows = arr2d.slice(1);
    const fallbackIndices = { role: 0, title: 1, type: 2, level: 3, active: 4 };
    const findIndex = name => {
        const idx = headers.indexOf(name);
        return idx >= 0 ? idx : null;
    };
    const getIndex = (foundIdx, key) => (foundIdx !== null ? foundIdx : fallbackIndices[key]);
    const mapIdx = {
        role: getIndex(findIndex("role"), "role"),
        title: getIndex(findIndex("title"), "title"),
        type: getIndex(findIndex("type"), "type"),
        level: getIndex(findIndex("level"), "level"),
        active: getIndex(findIndex("active"), "active")
    };
    const mapped = dataRows.map(r => ({
        role: String(r[mapIdx.role] || "").trim(),
        title: String(r[mapIdx.title] || "").trim(),
        type: String(r[mapIdx.type] || "").trim(),
        level: String(r[mapIdx.level] || "").trim(),
        active: String(r[mapIdx.active] || "yes").trim()
    }));
    return mapped.filter(p => p.role && p.title && String(p.active || "").toLowerCase() === "yes");
}

function parseGvizRowsToObjects(rows) {
    // rows is the gviz rows array (each r.c is array of cells {v:...})
    if (!Array.isArray(rows) || rows.length === 0) return [];
    // header detection from first row
    const headerRow = (rows[0].c || []).map(c => (c && c.v ? String(c.v).toLowerCase().trim() : ""));
    const findIndex = name => {
        const idx = headerRow.indexOf(name);
        return idx >= 0 ? idx : null;
    };
    const fallbackIndices = { role: 0, title: 1, type: 2, level: 3, active: 4 };
    const getIndex = (foundIdx, key) => (foundIdx !== null ? foundIdx : fallbackIndices[key]);
    const mapIdx = {
        role: getIndex(findIndex("role"), "role"),
        title: getIndex(findIndex("title"), "title"),
        type: getIndex(findIndex("type"), "type"),
        level: getIndex(findIndex("level"), "level"),
        active: getIndex(findIndex("active"), "active")
    };
    const dataRows = rows.slice(1);
    const mapped = dataRows.map(r => {
        const cell = idx => (Array.isArray(r.c) && r.c[idx] && r.c[idx].v != null ? r.c[idx].v : "");
        return {
            role: String(cell(mapIdx.role)).trim(),
            title: String(cell(mapIdx.title)).trim(),
            type: String(cell(mapIdx.type)).trim(),
            level: String(cell(mapIdx.level)).trim(),
            active: String(cell(mapIdx.active) ?? "yes").trim()
        };
    });
    return mapped.filter(p => p.role && p.title && String(p.active || "").toLowerCase() === "yes");
}

async function tryReadTextSafe(res) {
    try { return await res.text(); } catch (e) { return ""; }
}

/* -------------------------
   CSV loader (same as old)
   ------------------------- */
async function loadFromCSV(url) {
    const res = await fetchWithTimeout(url, {}, CONFIG.FETCH_TIMEOUT_MS);
    if (!res.ok) throw new Error("CSV not loaded");
    const text = await res.text();
    const rowsRaw = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    if (!rowsRaw.length) return [];

    const firstCells = parseCsvLine(rowsRaw[0]).map(h => String(h).toLowerCase().trim());
    const hasHeaderNames = firstCells.some(h => ["role", "title", "type", "level", "active"].includes(h));

    let headers = [], dataLines = [];
    if (hasHeaderNames) { headers = firstCells; dataLines = rowsRaw.slice(1); }
    else { headers = ["role", "title", "type", "level", "active"]; dataLines = rowsRaw; }

    const idx = {
        role: headers.indexOf("role"),
        title: headers.indexOf("title"),
        type: headers.indexOf("type"),
        level: headers.indexOf("level"),
        active: headers.indexOf("active")
    };

    const parsed = dataLines.map(line => {
        const cells = parseCsvLine(line);
        return {
            role: String(cells[idx.role] || "").trim(),
            title: String(cells[idx.title] || "").trim(),
            type: String(cells[idx.type] || "").trim(),
            level: String(cells[idx.level] || "").trim(),
            active: String(cells[idx.active] || "yes").trim()
        };
    });

    return parsed.filter(p => p.role && p.title && String(p.active || "").toLowerCase() === "yes");
}

function parseCsvLine(line) {
    const res = []; let cur = ""; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && line[i - 1] !== "\\") { inQuotes = !inQuotes; continue; }
        if (ch === "," && !inQuotes) { res.push(cur); cur = ""; continue; }
        cur += ch;
    }
    res.push(cur);
    return res.map(s => s.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'));
}

/* -------------------------
   UI rendering (same as old)
   ------------------------- */
function renderAll(data) {
    populateSelect(data);
    populateJobs(data);
}

function populateSelect(data) {
    const select = document.getElementById("position");
    if (!select) return;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "— Select —";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    const frag = document.createDocumentFragment();
    data.forEach(p => {
        if (!p.role || !p.title) return;
        const opt = document.createElement("option");
        opt.value = p.role;
        opt.textContent = `${p.title} (${p.type || ""})`;
        frag.appendChild(opt);
    });
    select.appendChild(frag);
    select.disabled = select.options.length <= 1;
}

function populateJobs(data) {
    const jobsContainer = document.getElementById("jobs-list");
    if (!jobsContainer) return;
    jobsContainer.innerHTML = "";
    const frag = document.createDocumentFragment();
    data.forEach(p => {
        if (!p.role || !p.title) return;
        const article = document.createElement("article");
        article.className = "job";
        article.dataset.role = p.role;
        article.innerHTML = `<div class="meta"><h4>${escapeHtml(p.title)}</h4><small>${escapeHtml(p.type)}</small></div><div class="pill">${escapeHtml(p.level || "")}</div>`;
        frag.appendChild(article);
    });
    jobsContainer.appendChild(frag);
}

function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}