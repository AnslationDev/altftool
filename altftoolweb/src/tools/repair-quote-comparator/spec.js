// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "repair-quote-comparator",
  "title": "Repair Quote Comparator",
  "description": "Parts, labour, warranty aur exclusions across repair quotes compare kare.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Lifestyle",
    "Business"
  ],
  "icon": "wrench",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "quotes",
      "label": "Repair quotes",
      "type": "textarea",
      "default": "RepairCo A | 2500 | 1200 | 300 | 180 | Parts 12m; labour 3m | Diagnostics excluded\nRepairCo B | 2200 | 1500 | 0 | 120 | Parts 6m; labour 6m | Pickup excluded",
      "hint": "Provider | parts | labour | other | turnaround hours | warranty | exclusions"
    },
    {
      "key": "tax_rate",
      "label": "Tax rate to add (%)",
      "type": "number",
      "default": 18,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Two quotes",
      "values": {
        "quotes": "RepairCo A | 2500 | 1200 | 300 | 180 | Parts 12m | Diagnostics excluded\nRepairCo B | 2200 | 1500 | 0 | 120 | Parts 6m | Pickup excluded",
        "tax_rate": 18
      }
    }
  ],
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions."
},
  compute: (values) => {
      const taxRate = Math.max(0, Number(values.tax_rate) || 0);
      const parsed = String(values.quotes || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const rows = parsed.map((row) => {
        const subtotal = [row[1], row[2], row[3]].reduce((sum, value) => sum + (Number(value) || 0), 0);
        const total = subtotal * (1 + taxRate / 100);
        return [row[0] || "—", subtotal.toFixed(2), total.toFixed(2), row[4] || "—", row[5] || "—", row[6] || "—"];
      }).sort((a, b) => Number(a[2]) - Number(b[2]));
      return { result: rows.length ? rows[0][0] + " has the lowest entered total" : "No quotes entered", caption: taxRate + "% tax assumption", rows: [["Quotes compared", rows.length], ["Lowest total", rows.length ? rows[0][2] : "—"], ["Highest total", rows.length ? rows[rows.length - 1][2] : "—"]], table: { headers: ["Provider", "Subtotal", "Total", "Hours", "Warranty", "Exclusions"], rows } };
    },
};

export default spec;
