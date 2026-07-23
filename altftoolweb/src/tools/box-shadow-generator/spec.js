// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "box-shadow-generator",
  "title": "CSS Box Shadow Generator",
  "description": "Build a CSS box-shadow and copy the ready-to-use rule.",
  "badge": "Design",
  "category": [
    "Design"
  ],
  "icon": "square",
  "iconColor": "text-indigo-500",
  "fields": [
    {
      "key": "x",
      "label": "Horizontal offset (px)",
      "type": "range",
      "default": 4,
      "min": -50,
      "max": 50,
      "step": 1
    },
    {
      "key": "y",
      "label": "Vertical offset (px)",
      "type": "range",
      "default": 6,
      "min": -50,
      "max": 50,
      "step": 1
    },
    {
      "key": "blur",
      "label": "Blur (px)",
      "type": "range",
      "default": 12,
      "min": 0,
      "max": 100,
      "step": 1
    },
    {
      "key": "spread",
      "label": "Spread (px)",
      "type": "range",
      "default": 0,
      "min": -50,
      "max": 50,
      "step": 1
    },
    {
      "key": "color",
      "label": "Color",
      "type": "text",
      "default": "rgba(0,0,0,0.25)"
    },
    {
      "key": "inset",
      "label": "Inset",
      "type": "toggle",
      "default": false,
      "checkboxLabel": "Inner shadow"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const css = `${values.inset ? "inset " : ""}${num(values.x)}px ${num(values.y)}px ${num(values.blur)}px ${num(values.spread)}px ${values.color}`;
      return { result: css, caption: "box-shadow value", rows: [["Full rule", `box-shadow: ${css};`]] };
    },
};

export default spec;
