// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "hrv-readiness-trend-tracker",
  "title": "HRV Readiness Trend Tracker",
  "description": "Track your personal HRV baseline and how far each morning deviates from it.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Health & Fitness",
    "Productivity"
  ],
  "icon": "heart-pulse",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "data",
      "label": "Daily HRV readings",
      "type": "textarea",
      "default": "2026-07-17 | 55\n2026-07-18 | 58\n2026-07-19 | 60\n2026-07-20 | 54\n2026-07-21 | 62\n2026-07-22 | 48\n2026-07-23 | 51",
      "hint": "Date | personal HRV value"
    },
    {
      "key": "window",
      "label": "Rolling baseline window",
      "type": "number",
      "default": 7,
      "min": 3
    },
    {
      "key": "threshold",
      "label": "Deviation flag (%)",
      "type": "number",
      "default": 15,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Seven readings",
      "values": {
        "data": "2026-07-17 | 55\n2026-07-18 | 58\n2026-07-19 | 60\n2026-07-20 | 54\n2026-07-21 | 62\n2026-07-22 | 48\n2026-07-23 | 51",
        "window": 7,
        "threshold": 15
      }
    }
  ],
  "note": "Personal-device trend aid, not a readiness score, diagnosis, or training prescription. Compare only consistent device/conditions and consider sleep, illness, alcohol, medication, stress, and symptoms."
},
  compute: (values) => {
      const readings = String(values.data || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [date, value] = line.split("|").map((cell) => cell.trim()); return [date, value === "" ? NaN : Number(value)]; }).filter((row) => Number.isFinite(row[1]));
      const windowRaw = values.window, windowInput = Number(windowRaw); const window = Math.max(3, Math.round(windowRaw === "" || windowRaw === undefined || windowRaw === null || !Number.isFinite(windowInput) ? 7 : windowInput)), threshold = Math.max(0, Number(values.threshold) || 0);
      const table = readings.map((row, index) => { const start = Math.max(0, index - window), previous = readings.slice(start, index), baseline = previous.length ? previous.reduce((sum, item) => sum + item[1], 0) / previous.length : row[1], deviation = baseline ? (row[1] - baseline) / baseline * 100 : 0; return [row[0], row[1], baseline.toFixed(2), deviation.toFixed(2) + "%", Math.abs(deviation) >= threshold && previous.length >= 3 ? "Review context" : "Within entered band"]; });
      const last = table.at(-1);
      return { result: last ? last[3] + " latest baseline deviation" : "No readings", caption: window + "-reading window · ±" + threshold + "% flag", rows: [["Readings", readings.length], ["Latest HRV", last ? last[1] : "—"], ["Latest baseline", last ? last[2] : "—"]], table: { headers: ["Date", "HRV", "Prior baseline", "Deviation", "Context flag"], rows: table } };
    },
};

export default spec;
