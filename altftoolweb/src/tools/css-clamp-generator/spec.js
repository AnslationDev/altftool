// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "css-clamp-generator",
  "title": "CSS Clamp Generator",
  "description": "Build a responsive CSS clamp() value.",
  "badge": "Design",
  "category": [
    "Design"
  ],
  "icon": "square",
  "iconColor": "text-indigo-500",
  "fields": [
    {
      "key": "min",
      "label": "Min (px)",
      "type": "number",
      "default": "16"
    },
    {
      "key": "max",
      "label": "Max (px)",
      "type": "number",
      "default": "48"
    },
    {
      "key": "vw",
      "label": "Preferred (vw)",
      "type": "number",
      "default": "4"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; return { result: `clamp(${num(values.min)}px, ${num(values.vw)}vw, ${num(values.max)}px)`, caption: "responsive size", rows: [["Min", num(values.min) + "px"], ["Max", num(values.max) + "px"]] }; },
};

export default spec;
