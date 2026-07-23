// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "media-query-generator",
  "title": "Media Query Generator",
  "description": "Generate a CSS media query for a breakpoint.",
  "badge": "Design",
  "category": [
    "Design"
  ],
  "icon": "square",
  "iconColor": "text-indigo-500",
  "fields": [
    {
      "key": "min",
      "label": "Min width (px, 0 = none)",
      "type": "number",
      "default": "768"
    },
    {
      "key": "max",
      "label": "Max width (px, 0 = none)",
      "type": "number",
      "default": "0"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const parts = []; if (num(values.min) > 0) parts.push(`(min-width: ${num(values.min)}px)`); if (num(values.max) > 0) parts.push(`(max-width: ${num(values.max)}px)`); const q = parts.join(" and ") || "all"; return { result: `@media ${q} { /* … */ }`, rows: [["Query", q]] }; },
};

export default spec;
