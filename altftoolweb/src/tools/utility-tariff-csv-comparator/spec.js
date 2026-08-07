// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "utility-tariff-csv-comparator",
  "title": "Utility Tariff CSV Comparator",
  "description": "Compare the same electricity usage profile across multiple tariff plans.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "scale",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "usage",
      "label": "Usage by tariff label",
      "type": "textarea",
      "default": "off-peak | 180\nstandard | 220\npeak | 90",
      "hint": "Label | kWh"
    },
    {
      "key": "tariffs",
      "label": "Tariff plans",
      "type": "textarea",
      "default": "Plan A | 150 | off-peak:5, standard:8, peak:12\nPlan B | 250 | off-peak:4, standard:7.5, peak:11",
      "hint": "Plan | fixed charge | label:price, label:price"
    },
    {
      "key": "tax",
      "label": "Tax / surcharge (%)",
      "type": "number",
      "default": 0,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Two plans",
      "values": {
        "usage": "off-peak | 180\nstandard | 220\npeak | 90",
        "tariffs": "Plan A | 150 | off-peak:5, standard:8, peak:12\nPlan B | 250 | off-peak:4, standard:7.5, peak:11",
        "tax": 0
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const usage = new Map(String(values.usage || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [label, kwh] = line.split("|").map((cell) => cell.trim()); return [label, Math.max(0, Number(kwh) || 0)]; })), tax = Math.max(0, Number(values.tax) || 0) / 100;
      const rows = String(values.tariffs || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name, fixedRaw, ratesRaw] = line.split("|").map((cell) => cell.trim()), fixed = Math.max(0, Number(fixedRaw) || 0), rates = new Map(String(ratesRaw || "").split(",").map((pair) => pair.trim()).filter(Boolean).map((pair) => { const idx = pair.indexOf(":"); if (idx === -1) return null; const label = pair.slice(0, idx).trim(), price = pair.slice(idx + 1).trim(); return label && price !== "" && Number.isFinite(Number(price)) ? [label, Number(price)] : null; }).filter((entry) => entry !== null));
        const energy = [...usage.entries()].reduce((sum, [label, kwh]) => sum + kwh * (rates.get(label) || 0), 0), subtotal = fixed + energy, total = subtotal * (1 + tax);
        return [name || "Plan", fixed.toFixed(2), energy.toFixed(2), total.toFixed(2), [...usage.keys()].filter((label) => !rates.has(label)).join(", ") || "None"];
      }).sort((a, b) => Number(a[3]) - Number(b[3]));
      return { result: rows.length ? rows[0][0] + " is lowest for entered profile" : "No plans", caption: rows.length ? rows[0][3] + " estimated total" : "Add tariff rows", rows: [["Usage labels", usage.size], ["Plans", rows.length], ["Tax / surcharge", (tax * 100).toFixed(2) + "%"]], table: { headers: ["Plan", "Fixed", "Energy", "Total", "Missing labels"], rows } };
    },
};

export default spec;
