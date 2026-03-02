console.log("🟢 DOMContentLoaded fired");

document.addEventListener("DOMContentLoaded", () => {

    console.log("🟢 DOMContentLoaded fired");

    // =======================
    // CONFIG
    // =======================
    const SHEET_ID = "1KjFuk_ObCCTTROTrGgRGttMQF1vH4R7SUOFxktjaGoQ";
    const SHEET_NAME = "Sheet1";
    const CSV_FALLBACK_URL = "/data/positions.csv";

    console.log("Config:", { SHEET_ID, SHEET_NAME, CSV_FALLBACK_URL });

    const select = document.getElementById("position");
    console.log("🔍 select element:", select);

    if (!select) {
        console.error("❌ STOP: #position not found in DOM");
        return;
    }

    // =======================
    // MAIN FUNCTION
    // =======================
    async function loadPositions() {
        console.log("➡️ loadPositions() START");

        try {
            console.log("➡️ trying Google Sheet...");
            const sheetData = await loadFromGoogleSheet();

            console.log("✅ Google Sheet SUCCESS");
            console.table(sheetData);

            populateSelect(sheetData);
            console.log("✅ populateSelect done");

            updateCSV(sheetData);
            console.log("📤 updateCSV called");

        } catch (err) {
            console.error("❌ Google Sheet FAILED", err);

            console.log("➡️ trying CSV fallback...");
            const csvData = await loadFromCSV();

            console.log("✅ CSV SUCCESS");
            console.table(csvData);

            populateSelect(csvData);
            console.log("✅ populateSelect from CSV done");
        }

        console.log("⬅️ loadPositions() END");
    }

    // =======================
    // LOAD GOOGLE SHEET
    // =======================
    async function loadFromGoogleSheet() {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
        console.log("🌍 Fetching Google Sheet URL:", url);

        const res = await fetch(url);
        console.log("🌐 Response status:", res.status, res.statusText);

        const text = await res.text();
        console.log("📄 Raw response length:", text.length);
        console.log("📄 Raw response preview:", text.substring(0, 300));

        const trimmed = text.substring(47).slice(0, -2);
        console.log("✂️ Trimmed JSON preview:", trimmed.substring(0, 200));

        const json = JSON.parse(trimmed);
        console.log("🧩 Parsed JSON:", json);

        const rows = json.table.rows;
        console.log("📊 Rows count:", rows.length);
        console.log("📊 Rows raw:", rows);

        const mapped = rows.map((r, i) => {
            const obj = {
                role: r.c[2]?.v,   // <-- هنا اسم العمود Role
                title: r.c[3]?.v,  // <-- هنا اسم العمود Title
                type: r.c[4]?.v,   // <-- Type
                level: r.c[5]?.v,  // <-- Level
                active: r.c[6]?.v  // <-- Active (yes/no)
            };
            console.log(`➡️ Row ${i} mapped:`, obj);
            return obj;
        });

        const filtered = mapped.filter(p => p.active === "yes");
        console.log("🟢 Filtered active rows:", filtered);

        if (filtered.length === 0) {
            console.warn("⚠️ No active rows found (active !== 'yes')");
        }

        return filtered;
    }

    // =======================
    // LOAD CSV FALLBACK
    // =======================
    async function loadFromCSV() {
        console.log("📂 Fetching CSV:", CSV_FALLBACK_URL);

        const res = await fetch(CSV_FALLBACK_URL);
        console.log("🌐 CSV status:", res.status);

        const text = await res.text();
        console.log("📄 CSV raw text:", text);

        const rows = text.split("\n").slice(1);
        console.log("📊 CSV rows:", rows);

        const parsed = rows.map((line, i) => {
            const [role, title, type, level, active] = line.split(",");
            const obj = { role, title, type, level, active };
            console.log(`➡️ CSV row ${i}:`, obj);
            return obj;
        }).filter(p => p.active === "yes");

        console.log("🟢 CSV active rows:", parsed);
        return parsed;
    }

    // =======================
    // POPULATE SELECT
    // =======================
    function populateSelect(data) {
        console.log("🧱 populateSelect called with:", data);

        select.innerHTML = `<option value="">— Select —</option>`;

        data.forEach((p, i) => {
            console.log(`➕ Adding option ${i}:`, p);

            const opt = document.createElement("option");
            opt.value = p.role;
            opt.textContent = `${p.title} (${p.type})`;
            select.appendChild(opt);
        });

        console.log("🎉 Select options count:", select.options.length);
    }

    // =======================
    // UPDATE CSV BACKEND
    // =======================
    function updateCSV(data) {
        console.log("📤 Sending data to updateCSV endpoint:", data);

        fetch("/api/update-positions.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(r => {
                console.log("🌐 updateCSV response status:", r.status);
                return r.text();
            })
            .then(t => console.log("📨 updateCSV response body:", t))
            .catch(e => console.error("❌ updateCSV error:", e));
    }

    // =======================
    // START
    // =======================
    loadPositions();
});