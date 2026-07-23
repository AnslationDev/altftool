// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "churn-rate-calculator",
  "title": "Churn Rate Calculator",
  "description": "Customer churn and retention rate for a period.",
  "badge": "Marketing",
  "category": [
    "Marketing"
  ],
  "icon": "user-minus",
  "iconColor": "text-red-600",
  "fields": [
    {
      "key": "start_customers",
      "label": "Customers at start",
      "type": "number",
      "default": "1000"
    },
    {
      "key": "churned",
      "label": "Customers lost",
      "type": "number",
      "default": "50"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const s = num(values.start_customers);
      if (s <= 0) return { result: "—", caption: "Enter starting customers" };
      const churn = (num(values.churned) / s) * 100;
      return { result: churn.toFixed(2) + "% churn", rows: [["Retention rate", (100 - churn).toFixed(2) + "%"], ["Customers remaining", (s - num(values.churned)).toLocaleString()]] };
    },
};

export default spec;
