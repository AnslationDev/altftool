// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "wearable-sleep-csv-analyzer",
  "title": "Wearable Sleep CSV Analyzer",
  "description": "Oura, Whoop aur Fitbit exports ke sleep trends dikhaye.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Health & Fitness",
    "Developer"
  ],
  "icon": "moon-star",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "data",
      "label": "Sleep export rows",
      "type": "textarea",
      "default": "2026-07-20 | 420 | 85 | 72 | 55\n2026-07-21 | 455 | 91 | 68 | 62\n2026-07-22 | 390 | 79 | 75 | 48",
      "hint": "Date | sleep minutes | efficiency % | resting HR | HRV"
    },
    {
      "key": "baseline",
      "label": "Baseline nights",
      "type": "number",
      "default": 7,
      "min": 2
    }
  ],
  "presets": [
    {
      "label": "Three nights",
      "values": {
        "data": "2026-07-20 | 420 | 85 | 72 | 55\n2026-07-21 | 455 | 91 | 68 | 62\n2026-07-22 | 390 | 79 | 75 | 48",
        "baseline": 7
      }
    }
  ],
  "note": "Personal trend summary, not a medical interpretation. Wearable algorithms and fields differ; symptoms, sleep disorders, medication, illness, pregnancy, and clinical decisions require qualified care."
},
  compute: (values) => {
      const rows = String(values.data || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [date, minutes, efficiency, hr, hrv] = line.split("|").map((cell) => cell.trim()); return [date, Number(minutes), Number(efficiency), Number(hr), Number(hrv)]; }).filter((row) => row.slice(1).every(Number.isFinite));
      if (!rows.length) return { result: "—", caption: "Enter valid sleep rows" };
      const average = (index) => rows.reduce((sum, row) => sum + row[index], 0) / rows.length, avgMinutes = average(1), avgEfficiency = average(2), avgHr = average(3), avgHrv = average(4);
      const table = rows.map((row) => [row[0], (row[1] / 60).toFixed(2), row[2].toFixed(1) + "%", row[3], row[4], (row[1] - avgMinutes).toFixed(0) + " min"]);
      return { result: (avgMinutes / 60).toFixed(2) + " h average sleep", caption: rows.length + " night(s) entered", rows: [["Average efficiency", avgEfficiency.toFixed(1) + "%"], ["Average resting HR", avgHr.toFixed(1)], ["Average HRV", avgHrv.toFixed(1)], ["Baseline setting", values.baseline + " nights"]], table: { headers: ["Date", "Sleep hours", "Efficiency", "Resting HR", "HRV", "Sleep vs average"], rows: table } };
    },
};

export default spec;
