// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "invoice-to-time-log-reconciler",
  "title": "Invoice-to-Time-Log Reconciler",
  "description": "Surface mismatches between your billable hours and the invoice line items.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Finance",
    "Business"
  ],
  "icon": "clock-3",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "logs",
      "label": "Time-log rows",
      "type": "textarea",
      "default": "Research | 5.5 | 1500\nDesign | 8 | 1800\nReview | 2 | 1500",
      "hint": "Activity | hours | rate"
    },
    {
      "key": "invoice",
      "label": "Invoice lines",
      "type": "textarea",
      "default": "Research | 8250\nDesign | 14400\nReview | 2500",
      "hint": "Activity | invoiced amount"
    },
    {
      "key": "tolerance",
      "label": "Amount tolerance",
      "type": "number",
      "default": 1,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Three lines",
      "values": {
        "logs": "Research | 5.5 | 1500\nDesign | 8 | 1800\nReview | 2 | 1500",
        "invoice": "Research | 8250\nDesign | 14400\nReview | 2500",
        "tolerance": 1
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision.",
  "confirmReset": "Reset and replace the pasted time-log and invoice lines with the example data? This cannot be undone."
},
  compute: (values) => {
      const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
      // Strip $, thousands commas and stray whitespace (regular + non-breaking) so pasted
      // currency text like "$8,250.00" parses instead of silently falling back to 0.
      const parseAmount = (raw) => { const n = Number(String(raw ?? "").replace(/[$,\s]/g, "")); return Number.isFinite(n) ? n : 0; };
      const tolerance = Math.max(0, Number(values.tolerance) || 0), expected = new Map(), invoiced = new Map();
      for (const line of String(values.logs || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) { const [name, hours, rate] = line.split("|").map((cell) => cell.trim()); expected.set(name, (expected.get(name) || 0) + parseAmount(hours) * parseAmount(rate)); }
      for (const line of String(values.invoice || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) { const [name, amount] = line.split("|").map((cell) => cell.trim()); invoiced.set(name, (invoiced.get(name) || 0) + parseAmount(amount)); }
      const names = [...new Set([...expected.keys(), ...invoiced.keys()])], rows = names.map((name) => { const exp = round2(expected.get(name) || 0), inv = round2(invoiced.get(name) || 0), variance = round2(inv - exp); return [name, exp.toFixed(2), inv.toFixed(2), variance.toFixed(2), Math.abs(variance) <= tolerance ? "Match" : "Review"]; });
      return { result: rows.filter((row) => row[4] === "Match").length + "/" + rows.length + " lines match", caption: "Tolerance ±" + tolerance, table: { headers: ["Activity", "Expected from log", "Invoiced", "Variance", "Status"], rows } };
    },
};

export default spec;
