// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "car-loan-calculator",
  "title": "Car Loan Calculator",
  "description": "Monthly payment, total interest and total cost for a car loan.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "car",
  "iconColor": "text-blue-600",
  "fields": [
    {
      "key": "price",
      "label": "Car price",
      "type": "number",
      "default": "25000"
    },
    {
      "key": "down",
      "label": "Down payment",
      "type": "number",
      "default": "5000"
    },
    {
      "key": "rate",
      "label": "Interest rate (%/yr)",
      "type": "number",
      "default": "7"
    },
    {
      "key": "years",
      "label": "Loan term (years)",
      "type": "number",
      "default": "5"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const loan = Math.max(0, num(values.price) - num(values.down));
      const r = num(values.rate) / 100 / 12, n = num(values.years) * 12;
      if (loan <= 0 || n <= 0) return { result: "—", caption: "Enter loan amount and term" };
      const emi = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      return { result: money(emi) + " / month", rows: [["Loan amount", money(loan)], ["Total interest", money(total - loan)], ["Total cost", money(total + num(values.down))]] };
    },
};

export default spec;
