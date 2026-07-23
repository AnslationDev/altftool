// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "margin-calculator",
  "title": "Profit Margin Calculator",
  "description": "Gross margin, markup and profit from cost and selling price.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "badge-percent",
  "iconColor": "text-green-600",
  "fields": [
    {
      "key": "cost",
      "label": "Cost",
      "type": "number",
      "default": "60"
    },
    {
      "key": "price",
      "label": "Selling price",
      "type": "number",
      "default": "100"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const c = num(values.cost), p = num(values.price);
      if (p <= 0) return { result: "—", caption: "Enter a selling price" };
      const profit = p - c;
      return { result: ((profit / p) * 100).toFixed(2) + "% margin", rows: [["Profit", money(profit)], ["Markup", c > 0 ? ((profit / c) * 100).toFixed(2) + "%" : "—"]] };
    },
};

export default spec;
