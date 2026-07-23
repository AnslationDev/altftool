// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "cagr-calculator",
  "title": "CAGR Calculator",
  "description": "Compound annual growth rate from a starting value, ending value and number of years.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "trending-up",
  "iconColor": "text-lime-600",
  "fields": [
    {
      "key": "initial",
      "label": "Initial value",
      "type": "number",
      "default": "10000"
    },
    {
      "key": "final",
      "label": "Final value",
      "type": "number",
      "default": "25000"
    },
    {
      "key": "years",
      "label": "Years",
      "type": "number",
      "default": "5"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const p = num(values.initial), f = num(values.final), y = num(values.years);
      if (p <= 0 || y <= 0) return { result: "—", caption: "Enter positive initial value and years" };
      const cagr = (Math.pow(f / p, 1 / y) - 1) * 100;
      return { result: cagr.toFixed(2) + "% per year", rows: [["Total growth", ((f / p - 1) * 100).toFixed(2) + "%"], ["Multiple", (f / p).toFixed(2) + "×"], ["Absolute gain", money(f - p)]] };
    },
};

export default spec;
