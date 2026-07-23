// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "css-triangle-generator",
  "title": "CSS Triangle Generator",
  "description": "Generate a CSS triangle using the border trick.",
  "badge": "Design",
  "category": [
    "Design"
  ],
  "icon": "square",
  "iconColor": "text-indigo-500",
  "fields": [
    {
      "key": "size",
      "label": "Size (px)",
      "type": "range",
      "default": 40,
      "min": 4,
      "max": 200,
      "step": 2
    },
    {
      "key": "direction",
      "label": "Direction",
      "type": "select",
      "default": "up",
      "choices": [
        {
          "value": "up",
          "label": "up"
        },
        {
          "value": "down",
          "label": "down"
        },
        {
          "value": "left",
          "label": "left"
        },
        {
          "value": "right",
          "label": "right"
        }
      ]
    },
    {
      "key": "color",
      "label": "Color",
      "type": "text",
      "default": "#4f46e5"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const s = num(values.size), c = values.color, T = "transparent"; const m = { up: `border-left:${s}px solid ${T};border-right:${s}px solid ${T};border-bottom:${s}px solid ${c};`, down: `border-left:${s}px solid ${T};border-right:${s}px solid ${T};border-top:${s}px solid ${c};`, left: `border-top:${s}px solid ${T};border-bottom:${s}px solid ${T};border-right:${s}px solid ${c};`, right: `border-top:${s}px solid ${T};border-bottom:${s}px solid ${T};border-left:${s}px solid ${c};` }; return { result: "width:0;height:0;" + m[values.direction], rows: [["Direction", values.direction]] }; },
};

export default spec;
