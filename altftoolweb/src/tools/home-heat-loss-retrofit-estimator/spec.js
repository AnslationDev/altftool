// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "home-heat-loss-retrofit-estimator",
  "title": "Home Heat-Loss & Retrofit Estimator",
  "description": "Compare insulation retrofit scenarios using your room dimensions and current insulation.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "house",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "surfaces",
      "label": "Building surfaces",
      "type": "textarea",
      "default": "Walls | 120 | 1.5 | 0.3\nRoof | 80 | 0.8 | 0.18\nWindows | 20 | 3.0 | 1.2",
      "hint": "Surface | area m² | current U W/m²K | improved U"
    },
    {
      "key": "delta_t",
      "label": "Design indoor-outdoor difference (K)",
      "type": "number",
      "default": 20,
      "min": 0
    },
    {
      "key": "hours",
      "label": "Annual equivalent heating hours",
      "type": "number",
      "default": 1800,
      "min": 0
    },
    {
      "key": "heat_cost",
      "label": "Useful heat cost per kWh",
      "type": "number",
      "default": 5,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Walls, roof, windows",
      "values": {
        "surfaces": "Walls | 120 | 1.5 | 0.3\nRoof | 80 | 0.8 | 0.18\nWindows | 20 | 3.0 | 1.2",
        "delta_t": 20,
        "hours": 1800,
        "heat_cost": 5
      }
    }
  ],
  "note": "Steady-state fabric-only illustration. A proper assessment needs climate data, geometry, thermal bridges, airtightness/ventilation, moisture, solar/internal gains, system efficiency, comfort, embodied impacts, and local retrofit practice."
},
  compute: (values) => {
      const delta = Math.max(0, Number(values.delta_t) || 0), hours = Math.max(0, Number(values.hours) || 0), cost = Math.max(0, Number(values.heat_cost) || 0);
      const rows = String(values.surfaces || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [name, area, currentU, improvedU] = line.split("|").map((cell) => cell.trim()); const A = Number(area) || 0, oldU = Number(currentU) || 0, newU = Number(improvedU) || 0, oldLoss = A * oldU * delta, newLoss = A * newU * delta; return [name || "Surface", A, oldU, newU, oldLoss, newLoss, oldLoss - newLoss]; });
      const oldWatts = rows.reduce((sum, row) => sum + row[4], 0), newWatts = rows.reduce((sum, row) => sum + row[5], 0), savedKwh = (oldWatts - newWatts) * hours / 1000;
      return { result: savedKwh.toFixed(2) + " kWh/year fabric saving", caption: (savedKwh * cost).toFixed(2) + " entered-cost saving", rows: [["Current design heat loss", oldWatts.toFixed(2) + " W"], ["Improved design heat loss", newWatts.toFixed(2) + " W"], ["Reduction", oldWatts ? ((oldWatts - newWatts) / oldWatts * 100).toFixed(2) + "%" : "—"]], table: { headers: ["Surface", "Area", "Current U", "Improved U", "Current W", "Improved W", "Saved W"], rows: rows.map((row) => [...row.slice(0, 4), ...row.slice(4).map((value) => value.toFixed(2))]) } };
    },
};

export default spec;
