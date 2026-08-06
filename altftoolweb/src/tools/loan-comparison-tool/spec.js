// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "loan-comparison-tool",
  "title": "Loan Comparison Tool",
  "description": "Monthly payment, total interest and total cost of a loan.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "landmark",
  "iconColor": "text-blue-600",
  "fields": [
    {
      "key": "amount",
      "label": "Loan amount",
      "type": "number",
      "default": "200000"
    },
    {
      "key": "rate",
      "label": "Interest rate (%/yr)",
      "type": "number",
      "default": "7"
    },
    {
      "key": "years",
      "label": "Term (years)",
      "type": "number",
      "default": "20"
    }
  ],
  "presets": [
    {
      "label": "200k @7% / 20y",
      "values": {
        "amount": "200000",
        "rate": "7",
        "years": "20"
      }
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const P = num(values.amount), rate = num(values.rate), r = rate / 100 / 12, n = num(values.years) * 12; if (P <= 0 && n <= 0) return { result: "—", caption: "Loan amount and term must be greater than zero." }; if (P <= 0) return { result: "—", caption: "Loan amount must be greater than zero." }; if (n <= 0) return { result: "—", caption: "Term must be greater than zero." }; if (rate < 0) return { error: "Interest rate cannot be negative." }; const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1); return { result: money(emi) + " / month", rows: [["Total interest", money(emi * n - P)], ["Total payable", money(emi * n)]] }; },
};

export default spec;
