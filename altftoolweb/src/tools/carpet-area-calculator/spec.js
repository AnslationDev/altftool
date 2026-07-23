// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "carpet-area-calculator",
  "title": "Carpet / Floor Area Calculator",
  "description": "Calculate floor area and material needed for a room.",
  "badge": "Utility",
  "category": [
    "Utility"
  ],
  "icon": "ruler",
  "iconColor": "text-teal-600",
  "fields": [
    {
      "key": "length",
      "label": "Length",
      "type": "number",
      "default": "5"
    },
    {
      "key": "width",
      "label": "Width",
      "type": "number",
      "default": "4"
    },
    {
      "key": "unit",
      "label": "Unit",
      "type": "select",
      "default": "m",
      "choices": [
        {
          "value": "m",
          "label": "Meters"
        },
        {
          "value": "ft",
          "label": "Feet"
        }
      ]
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const l = num(values.length), w = num(values.width);
      if (l <= 0 || w <= 0) return { result: "—", caption: "Enter length and width" };
      const area = l * w;
      const sqm = values.unit === "ft" ? area * 0.092903 : area;
      const sqft = values.unit === "ft" ? area : area * 10.7639;
      return { result: area.toFixed(2) + " " + (values.unit === "ft" ? "sq ft" : "m²"), rows: [["Square meters", sqm.toFixed(2)], ["Square feet", sqft.toFixed(2)], ["+10% wastage", (area * 1.1).toFixed(2)]] };
    },
};

export default spec;
