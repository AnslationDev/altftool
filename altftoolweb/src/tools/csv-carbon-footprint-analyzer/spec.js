// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "csv-carbon-footprint-analyzer",
  "title": "CSV Carbon Footprint Analyzer",
  "description": "Utility aur travel exports se estimated footprint calculate kare.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "leaf",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "activities",
      "label": "Activity rows",
      "type": "textarea",
      "default": "Grid electricity | 1200 | kWh | 0.7\nPetrol | 180 | litre | 2.31\nFlight | 1500 | passenger-km | 0.15",
      "hint": "Activity | quantity | unit | kg CO₂e per unit"
    },
    {
      "key": "household",
      "label": "People sharing footprint",
      "type": "number",
      "default": 1,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Energy and travel",
      "values": {
        "activities": "Grid electricity | 1200 | kWh | 0.7\nPetrol | 180 | litre | 2.31\nFlight | 1500 | passenger-km | 0.15",
        "household": 1
      }
    }
  ],
  "note": "User-supplied-factor estimate. Emission factors vary by country, year, fuel pathway, radiative forcing, allocation, and scope; use an authoritative inventory for reporting."
},
  compute: (values) => {
      const people = Math.max(1, Number(values.household) || 1), rows = String(values.activities || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [activity, quantity, unit, factor] = line.split("|").map((cell) => cell.trim()); const q = Number(quantity) || 0, f = Number(factor) || 0; return [activity || "Activity", q, unit || "unit", f, q * f]; });
      const total = rows.reduce((sum, row) => sum + row[4], 0);
      return { result: total.toFixed(3) + " kg CO₂e entered total", caption: (total / people).toFixed(3) + " kg CO₂e per person", rows: [["Activities", rows.length], ["People", people], ["Tonnes CO₂e", (total / 1000).toFixed(6)]], table: { headers: ["Activity", "Quantity", "Unit", "Factor kg/unit", "kg CO₂e"], rows: rows.map((row) => [...row.slice(0, 4), row[4].toFixed(3)]) } };
    },
};

export default spec;
