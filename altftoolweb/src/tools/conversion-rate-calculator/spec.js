// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "conversion-rate-calculator",
  "title": "Conversion Rate Calculator",
  "description": "Conversion rate from visitors and conversions, with optional revenue.",
  "badge": "Marketing",
  "category": [
    "Marketing"
  ],
  "icon": "percent",
  "iconColor": "text-violet-600",
  "fields": [
    {
      "key": "visitors",
      "label": "Visitors",
      "type": "number",
      "default": "5000"
    },
    {
      "key": "conversions",
      "label": "Conversions",
      "type": "number",
      "default": "150"
    },
    {
      "key": "value",
      "label": "Value per conversion",
      "type": "number",
      "default": "0",
      "required": false
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const v = num(values.visitors);
      if (v <= 0) return { result: "—", caption: "Enter visitor count" };
      const rate = (num(values.conversions) / v) * 100;
      const rows = [["Visitors per conversion", num(values.conversions) > 0 ? Math.round(v / num(values.conversions)) : "—"]];
      if (num(values.value) > 0) rows.push(["Revenue", money(num(values.conversions) * num(values.value))]);
      return { result: rate.toFixed(2) + "% conversion", rows };
    },
};

export default spec;
