// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "solar-self-consumption-optimizer",
  "title": "Solar Self-Consumption Optimizer",
  "description": "Generation aur usage CSV se best appliance timing dikhaye.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "sun",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "intervals",
      "label": "Generation and load intervals",
      "type": "textarea",
      "default": "08:00 | 0.8 | 0.5\n10:00 | 2.4 | 0.8\n12:00 | 3.5 | 1.0\n14:00 | 2.8 | 0.7\n18:00 | 0.2 | 2.0",
      "hint": "Time | solar kWh | household load kWh"
    },
    {
      "key": "flex_load",
      "label": "Flexible appliance energy (kWh)",
      "type": "number",
      "default": 2,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Day profile",
      "values": {
        "intervals": "08:00 | 0.8 | 0.5\n10:00 | 2.4 | 0.8\n12:00 | 3.5 | 1.0\n14:00 | 2.8 | 0.7\n18:00 | 0.2 | 2.0",
        "flex_load": 2
      }
    }
  ],
  "note": "Interval energy-shift illustration. It assumes the flexible load can fit one interval and ignores power limits, duration, battery, forecast error, export caps, safety, appliance needs, and tariffs."
},
  compute: (values) => {
      const flex = Math.max(0, Number(values.flex_load) || 0), rows = String(values.intervals || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [time, solar, load] = line.split("|").map((cell) => cell.trim()); const generation = Number(solar) || 0, demand = Number(load) || 0, direct = Math.min(generation, demand); return [time, generation, demand, direct, Math.max(0, generation - demand)]; });
      const totalSolar = rows.reduce((sum, row) => sum + row[1], 0), direct = rows.reduce((sum, row) => sum + row[3], 0), best = [...rows].sort((a, b) => b[4] - a[4])[0], shifted = best ? Math.min(flex, best[4]) : 0;
      return { result: best ? "Best entered start: " + best[0] : "No intervals", caption: shifted.toFixed(3) + " kWh flexible load covered by surplus", rows: [["Solar generation", totalSolar.toFixed(3) + " kWh"], ["Direct self-consumption", direct.toFixed(3) + " kWh"], ["Current self-consumption", totalSolar ? (direct / totalSolar * 100).toFixed(2) + "%" : "—"], ["After one shift", totalSolar ? ((direct + shifted) / totalSolar * 100).toFixed(2) + "%" : "—"]], table: { headers: ["Time", "Solar", "Load", "Direct use", "Surplus"], rows: rows.map((row) => [row[0], ...row.slice(1).map((value) => value.toFixed(3))]) } };
    },
};

export default spec;
