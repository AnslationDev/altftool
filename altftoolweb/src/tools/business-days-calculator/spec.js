// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "business-days-calculator",
  "title": "Business Days Calculator",
  "description": "Count working days (Mon–Fri) between two dates, excluding weekends.",
  "badge": "Calculator",
  "category": [
    "Calculator"
  ],
  "icon": "briefcase",
  "iconColor": "text-blue-600",
  "fields": [
    {
      "key": "start",
      "label": "Start date",
      "type": "date",
      "default": ""
    },
    {
      "key": "end",
      "label": "End date",
      "type": "date",
      "default": ""
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const parseLocalDate = (v) => { if (typeof v === "string") { const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])); } return new Date(v); };
      const a = parseLocalDate(values.start), b = parseLocalDate(values.end);
      if (isNaN(a) || isNaN(b) || b < a) return { result: "—", caption: "Pick a valid date range" };
      let count = 0; const d = new Date(a);
      while (d <= b) { const g = d.getDay(); if (g !== 0 && g !== 6) count++; d.setDate(d.getDate() + 1); }
      const total = Math.round((b - a) / 86400000) + 1;
      return { result: count.toLocaleString() + " business days", rows: [["Total days", total], ["Weekend days", total - count]] };
    },
};

export default spec;
