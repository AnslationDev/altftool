// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ev-battery-degradation-analyzer",
  "title": "EV Battery Degradation Analyzer",
  "description": "Charge logs se range aur capacity trend estimate kare.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "battery-medium",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "logs",
      "label": "Battery observations",
      "type": "textarea",
      "default": "2025-01-01 | 60 | 330 | 20000\n2025-07-01 | 58.5 | 320 | 32000\n2026-01-01 | 57.8 | 315 | 45000\n2026-07-01 | 56.9 | 309 | 59000",
      "hint": "Date | estimated usable kWh | displayed range km | odometer km"
    },
    {
      "key": "nominal",
      "label": "New usable capacity (kWh)",
      "type": "number",
      "default": 60,
      "min": 0.1
    }
  ],
  "presets": [
    {
      "label": "Four observations",
      "values": {
        "logs": "2025-01-01 | 60 | 330 | 20000\n2025-07-01 | 58.5 | 320 | 32000\n2026-01-01 | 57.8 | 315 | 45000\n2026-07-01 | 56.9 | 309 | 59000",
        "nominal": 60
      }
    }
  ],
  "note": "Trend estimate from user-entered observations, not a battery-health diagnostic or warranty test. Range varies with conditions; use consistent measurement methods and official service diagnostics."
},
  compute: (values) => {
      const nominal = Number(values.nominal), rows = String(values.logs || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [date, capacity, range, odometer] = line.split("|").map((cell) => cell.trim()); return [date, Number(capacity), Number(range), Number(odometer)]; }).filter((row) => row.slice(1).every(Number.isFinite));
      const table = rows.map((row) => [row[0], row[1].toFixed(2), nominal > 0 ? (row[1] / nominal * 100).toFixed(2) + "%" : "—", row[2], row[3]]);
      const first = rows[0], last = rows.at(-1), loss = first && last ? first[1] - last[1] : 0, km = first && last ? last[3] - first[3] : 0;
      return { result: last && nominal > 0 ? (last[1] / nominal * 100).toFixed(2) + "% latest entered capacity" : "No observations", caption: loss.toFixed(3) + " kWh change across entered period", rows: [["Observations", rows.length], ["Capacity change", (-loss).toFixed(3) + " kWh"], ["Odometer span", km + " km"], ["Change per 10,000 km", km ? (-loss / km * 10000).toFixed(3) + " kWh" : "—"]], table: { headers: ["Date", "Usable kWh", "% of new", "Range km", "Odometer"], rows: table } };
    },
};

export default spec;
