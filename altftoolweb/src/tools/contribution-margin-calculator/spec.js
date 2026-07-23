// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "contribution-margin-calculator",
  "title": "Contribution Margin Calculator",
  "description": "Contribution margin per unit, ratio and total.",
  "badge": "Business",
  "category": [
    "Business"
  ],
  "icon": "chart-column",
  "iconColor": "text-indigo-600",
  "fields": [
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
    },
    {
      "key": "units",
      "label": "Units sold",
      "type": "number",
      "default": "1000"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const cm = num(values.price) - num(values.variable_cost);
      return { result: money(cm) + " / unit", rows: [["CM ratio", num(values.price) > 0 ? ((cm / num(values.price)) * 100).toFixed(1) + "%" : "—"], ["Total contribution", money(cm * num(values.units))]] };
    },
};

export default spec;
