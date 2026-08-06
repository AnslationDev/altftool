// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "gig-earnings-mileage-analyzer",
  "title": "Gig Earnings & Mileage Analyzer",
  "description": "Calculate what you really earn per hour once mileage and expenses come out.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Finance",
    "Business"
  ],
  "icon": "car",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "shifts",
      "label": "Gig shifts",
      "type": "textarea",
      "default": "2026-07-20 | 4200 | 8 | 75 | 12 | 300\n2026-07-21 | 3600 | 6.5 | 52 | 8 | 250",
      "hint": "Date | gross earnings | total hours | business km | other expenses | tips included"
    },
    {
      "key": "cost_per_km",
      "label": "Vehicle cost per km",
      "type": "number",
      "default": 8,
      "min": 0
    },
    {
      "key": "reserve",
      "label": "Tax / reserve (%)",
      "type": "number",
      "default": 10,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Two shifts",
      "values": {
        "shifts": "2026-07-20 | 4200 | 8 | 75 | 12 | 300\n2026-07-21 | 3600 | 6.5 | 52 | 8 | 250",
        "cost_per_km": 8,
        "reserve": 10
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const kmCost = Math.max(0, Number(values.cost_per_km) || 0), reserveRate = Math.max(0, Number(values.reserve) || 0) / 100;
      const rows = String(values.shifts || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [date, grossRaw, hoursRaw, kmRaw, expenseRaw] = line.split("|").map((cell) => cell.trim());
        const gross = Number(grossRaw) || 0, hours = Math.max(0.01, Number(hoursRaw) || 0), km = Math.max(0, Number(kmRaw) || 0), expense = Math.max(0, Number(expenseRaw) || 0), vehicle = km * kmCost, preReserve = gross - vehicle - expense, net = preReserve * (1 - reserveRate);
        return [date || "—", gross.toFixed(2), hours.toFixed(2), km.toFixed(1), vehicle.toFixed(2), expense.toFixed(2), net.toFixed(2), (net / hours).toFixed(2)];
      });
      const totals = rows.reduce((acc, row) => [acc[0] + Number(row[1]), acc[1] + Number(row[2]), acc[2] + Number(row[3]), acc[3] + Number(row[6])], [0, 0, 0, 0]);
      return { result: totals[3].toFixed(2) + " estimated net", caption: totals[1] ? (totals[3] / totals[1]).toFixed(2) + " effective per hour" : "No hours", rows: [["Gross", totals[0].toFixed(2)], ["Hours", totals[1].toFixed(2)], ["Business km", totals[2].toFixed(1)]], table: { headers: ["Date", "Gross", "Hours", "km", "Vehicle cost", "Other expense", "Net", "Net/hour"], rows } };
    },
};

export default spec;
