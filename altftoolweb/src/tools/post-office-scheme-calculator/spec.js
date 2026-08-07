// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "post-office-scheme-calculator",
  "title": "Post Office Scheme Calculator",
  "description": "Compare maturity estimates across post office NSC, KVP and MIS savings schemes.",
  "badge": "India-Specific Utilities",
  "category": [
    "Finance",
    "India",
    "Calculator"
  ],
  "icon": "landmark",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "scheme",
      "label": "Scheme",
      "type": "select",
      "default": "nsc",
      "choices": [
        {
          "value": "nsc",
          "label": "NSC — compound maturity estimate"
        },
        {
          "value": "kvp",
          "label": "KVP — maturity estimate"
        },
        {
          "value": "mis",
          "label": "MIS — monthly income estimate"
        }
      ]
    },
    {
      "key": "principal",
      "label": "Deposit (₹)",
      "type": "number",
      "default": 100000,
      "min": 0
    },
    {
      "key": "rate",
      "label": "Annual rate (%)",
      "type": "number",
      "default": 7.7,
      "min": 0
    },
    {
      "key": "years",
      "label": "Term (years)",
      "type": "number",
      "default": 5,
      "min": 0.1
    },
    {
      "key": "compound",
      "label": "Compounds per year",
      "type": "number",
      "default": 1,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "NSC example",
      "values": {
        "scheme": "nsc",
        "principal": 100000,
        "rate": 7.7,
        "years": 5,
        "compound": 1
      }
    },
    {
      "label": "MIS example",
      "values": {
        "scheme": "mis",
        "principal": 100000,
        "rate": 7.4,
        "years": 5,
        "compound": 1
      }
    }
  ],
  "note": "User-supplied-rate estimate only. Verify current India Post rates, limits, eligibility, compounding method, tax treatment, and premature-closure rules officially."
},
  compute: (values) => {
      const principal = Math.max(0, Number(values.principal) || 0);
      const ratePercent = Math.max(0, Number(values.rate) || 0);
      const rate = ratePercent / 100;
      const years = Math.max(0.1, Number(values.years) || 0.1);
      const compounds = Math.max(1, Math.round(Number(values.compound) || 1));
      const maturity = principal * Math.pow(1 + rate / compounds, compounds * years);
      const monthly = principal * rate / 12;
      const money = (number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(number);
      if (values.scheme === "mis") return { result: money(monthly) + " estimated monthly income", caption: ratePercent + "% user-supplied rate", rows: [["Deposit", money(principal)], ["Annual income", money(monthly * 12)], ["Term income", money(monthly * 12 * years)], ["Principal returned separately", money(principal)]] };
      return { result: money(maturity) + " estimated maturity", caption: values.scheme === "kvp" ? "KVP-style compound estimate" : "NSC-style compound estimate", rows: [["Deposit", money(principal)], ["Estimated interest", money(maturity - principal)], ["Term", years + " years"], ["Compounding", compounds + "× / year"]] };
    },
};

export default spec;
