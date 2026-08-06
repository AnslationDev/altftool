// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "smart-meter-interval-analyzer",
  "title": "Smart-Meter Interval Analyzer",
  "description": "Find demand peaks and time-of-use savings in your smart meter CSV export.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "gauge",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "intervals",
      "label": "Interval energy rows",
      "type": "textarea",
      "default": "2026-07-20 00:00 | 0.4 | off-peak\n2026-07-20 00:30 | 0.3 | off-peak\n2026-07-20 18:00 | 2.2 | peak\n2026-07-20 18:30 | 2.5 | peak",
      "hint": "Timestamp | kWh | tariff label"
    },
    {
      "key": "peak_threshold",
      "label": "High interval threshold (kWh)",
      "type": "number",
      "default": 2,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Four intervals",
      "values": {
        "intervals": "2026-07-20 00:00 | 0.4 | off-peak\n2026-07-20 00:30 | 0.3 | off-peak\n2026-07-20 18:00 | 2.2 | peak\n2026-07-20 18:30 | 2.5 | peak",
        "peak_threshold": 2
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const threshold = Math.max(0, Number(values.peak_threshold) || 0), rows = String(values.intervals || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [time, kwh, tariff] = line.split("|").map((cell) => cell.trim()); return [time, Number(kwh), tariff || "Unlabelled"]; }).filter((row) => Number.isFinite(row[1]));
      const total = rows.reduce((sum, row) => sum + row[1], 0), groups = new Map();
      for (const row of rows) groups.set(row[2], (groups.get(row[2]) || 0) + row[1]);
      const high = rows.filter((row) => row[1] >= threshold).sort((a, b) => b[1] - a[1]);
      return { result: total.toFixed(4) + " kWh entered usage", caption: high.length + " high interval(s)", rows: [["Intervals", rows.length], ["Average", rows.length ? (total / rows.length).toFixed(4) + " kWh" : "—"], ["Maximum", rows.length ? Math.max(...rows.map((row) => row[1])).toFixed(4) + " kWh" : "—"]], table: { headers: ["Tariff label", "kWh", "Share"], rows: [...groups.entries()].map(([label, value]) => [label, value.toFixed(4), total ? (value / total * 100).toFixed(2) + "%" : "0%"]) }, list: high.slice(0, 10).map((row) => row[0] + ": " + row[1] + " kWh") };
    },
};

export default spec;
