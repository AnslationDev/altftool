// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "markup-calculator",
  "title": "Markup Calculator",
  "description": "Add a markup percentage to a cost to get the selling price and profit.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "tag",
  "iconColor": "text-orange-600",
  "fields": [
    {
      "key": "cost",
      "label": "Cost",
      "type": "number",
      "default": "60"
    },
    {
      "key": "markup",
      "label": "Markup (%)",
      "type": "number",
      "default": "40"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const c = num(values.cost), price = c * (1 + num(values.markup) / 100);
      return { result: money(price), caption: "selling price", rows: [["Profit", money(price - c)], ["Margin", price > 0 ? (((price - c) / price) * 100).toFixed(2) + "%" : "—"]] };
    },
};

export default spec;
