// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "body-surface-area-calculator",
  "title": "Body Surface Area Calculator",
  "description": "Estimate body surface area (BSA) using the Mosteller and Du Bois formulas.",
  "badge": "Health",
  "category": [
    "Health"
  ],
  "icon": "ruler",
  "iconColor": "text-teal-600",
  "fields": [
    {
      "key": "weight",
      "label": "Weight (kg)",
      "type": "number",
      "default": "70"
    },
    {
      "key": "height",
      "label": "Height (cm)",
      "type": "number",
      "default": "175"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const w = num(values.weight), h = num(values.height);
      if (w <= 0 || h <= 0) return { result: "—", caption: "Enter weight and height" };
      const mosteller = Math.sqrt((h * w) / 3600);
      const dubois = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
      return { result: mosteller.toFixed(2) + " m²", caption: "Mosteller formula", rows: [["Du Bois formula", dubois.toFixed(2) + " m²"]] };
    },
};

export default spec;
