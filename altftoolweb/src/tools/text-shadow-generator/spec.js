// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "text-shadow-generator",
  "title": "Text Shadow Generator",
  "description": "Build a CSS text-shadow.",
  "badge": "Design",
  "category": [
    "Design"
  ],
  "icon": "square",
  "iconColor": "text-indigo-500",
  "fields": [
    {
      "key": "x",
      "label": "X offset",
      "type": "range",
      "default": 2,
      "min": -20,
      "max": 20,
      "step": 1
    },
    {
      "key": "y",
      "label": "Y offset",
      "type": "range",
      "default": 2,
      "min": -20,
      "max": 20,
      "step": 1
    },
    {
      "key": "blur",
      "label": "Blur",
      "type": "range",
      "default": 4,
      "min": 0,
      "max": 40,
      "step": 1
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const css = `${num(values.x)}px ${num(values.y)}px ${num(values.blur)}px rgba(0,0,0,0.5)`; return { result: css, rows: [["Full rule", "text-shadow: " + css + ";"]] }; },
};

export default spec;
