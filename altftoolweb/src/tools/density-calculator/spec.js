// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "density-calculator",
  "title": "Density Calculator",
  "description": "Density from mass and volume, with common unit conversions.",
  "badge": "Science",
  "category": [
    "Science"
  ],
  "icon": "box",
  "iconColor": "text-cyan-600",
  "fields": [
    {
      "key": "mass",
      "label": "Mass (g)",
      "type": "number",
      "default": "100"
    },
    {
      "key": "volume",
      "label": "Volume (cm³ / mL)",
      "type": "number",
      "default": "50"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const v = num(values.volume);
      if (v === 0) return { result: "—", caption: "Volume can't be zero" };
      const d = num(values.mass) / v;
      return { result: d.toFixed(3) + " g/cm³", rows: [["kg/m³", (d * 1000).toFixed(0)], ["vs water", d > 1 ? "sinks" : "floats"]] };
    },
};

export default spec;
