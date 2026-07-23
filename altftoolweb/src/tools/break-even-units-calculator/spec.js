// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "break-even-units-calculator",
  "title": "Break-Even Units Calculator",
  "description": "How many units you must sell to cover your costs.",
  "badge": "Business",
  "category": [
    "Business"
  ],
  "icon": "target",
  "iconColor": "text-rose-600",
  "fields": [
    {
      "key": "fixed_costs",
      "label": "Fixed costs",
      "type": "number",
      "default": "10000"
    },
    {
      "key": "price",
      "label": "Price per unit",
      "type": "number",
      "default": "50"
    },
    {
      "key": "variable_cost",
      "label": "Variable cost per unit",
      "type": "number",
      "default": "30"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const cm = num(values.price) - num(values.variable_cost);
      if (cm <= 0) return { result: "—", caption: "Price must exceed variable cost" };
      const units = num(values.fixed_costs) / cm;
      return { result: Math.ceil(units).toLocaleString() + " units", rows: [["Contribution margin/unit", money(cm)], ["Break-even revenue", money(Math.ceil(units) * num(values.price))]] };
    },
};

export default spec;
