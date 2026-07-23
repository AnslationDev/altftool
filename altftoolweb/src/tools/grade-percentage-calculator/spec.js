// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "grade-percentage-calculator",
  "title": "Grade Percentage Calculator",
  "description": "Common percentage calculations.",
  "badge": "Education",
  "category": [
    "Education"
  ],
  "icon": "percent",
  "iconColor": "text-violet-600",
  "fields": [
    {
      "key": "percent",
      "label": "Percent (%)",
      "type": "number",
      "default": "15"
    },
    {
      "key": "value",
      "label": "Of value",
      "type": "number",
      "default": "200"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const r = (num(values.percent) / 100) * num(values.value); return { result: r.toLocaleString(), caption: `${values.percent}% of ${values.value}`, rows: [["Value + %", (num(values.value) + r).toLocaleString()], ["Value − %", (num(values.value) - r).toLocaleString()]] }; },
};

export default spec;
