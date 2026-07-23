// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "capital-gains-calculator",
  "title": "Capital Gains Calculator",
  "description": "Work out your capital gain, tax owed and net profit on an investment.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "coins",
  "iconColor": "text-amber-600",
  "fields": [
    {
      "key": "buy_price",
      "label": "Buy price (per unit)",
      "type": "number",
      "default": "100"
    },
    {
      "key": "sell_price",
      "label": "Sell price (per unit)",
      "type": "number",
      "default": "150"
    },
    {
      "key": "quantity",
      "label": "Quantity",
      "type": "number",
      "default": "100"
    },
    {
      "key": "tax_rate",
      "label": "Tax rate (%)",
      "type": "number",
      "default": "15"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const gain = (num(values.sell_price) - num(values.buy_price)) * num(values.quantity);
      const tax = gain > 0 ? gain * (num(values.tax_rate) / 100) : 0;
      return { result: (gain >= 0 ? "Gain " : "Loss ") + money(Math.abs(gain)), rows: [["Tax owed", money(tax)], ["Net profit", money(gain - tax)], ["Return", (((num(values.sell_price) - num(values.buy_price)) / num(values.buy_price)) * 100).toFixed(2) + "%"]] };
    },
};

export default spec;
