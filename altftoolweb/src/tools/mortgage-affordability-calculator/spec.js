// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "mortgage-affordability-calculator",
  "title": "Mortgage Affordability Calculator",
  "description": "How much home you can afford, using the 28/36 debt-to-income rule.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "home",
  "iconColor": "text-teal-600",
  "fields": [
    {
      "key": "annual_income",
      "label": "Gross annual income",
      "type": "number",
      "default": "90000"
    },
    {
      "key": "monthly_debts",
      "label": "Other monthly debts",
      "type": "number",
      "default": "500"
    },
    {
      "key": "rate",
      "label": "Interest rate (%/yr)",
      "type": "number",
      "default": "6.5"
    },
    {
      "key": "years",
      "label": "Term (years)",
      "type": "number",
      "default": "30"
    },
    {
      "key": "down",
      "label": "Down payment",
      "type": "number",
      "default": "40000"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const monthly = num(values.annual_income) / 12;
      if (monthly <= 0) return { result: "—", caption: "Enter your income" };
      const maxPayment = Math.min(monthly * 0.28, monthly * 0.36 - num(values.monthly_debts));
      if (maxPayment <= 0) return { result: "—", caption: "Existing debts exceed the 36% limit" };
      const r = num(values.rate) / 100 / 12, n = num(values.years) * 12;
      const loan = r === 0 ? maxPayment * n : (maxPayment * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
      return { result: "Home up to " + money(loan + num(values.down)), rows: [["Max monthly payment", money(maxPayment)], ["Max loan", money(loan)], ["+ your down payment", money(num(values.down))]] };
    },
};

export default spec;
