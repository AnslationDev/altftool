// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "tds-calculator-by-section",
  "title": "TDS Calculator by Section",
  "description": "Selected section, threshold aur rate se TDS calculate kare.",
  "badge": "India-Specific Utilities",
  "category": [
    "Finance",
    "India",
    "Calculator"
  ],
  "icon": "badge-indian-rupee",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "section",
      "label": "Section / payment type",
      "type": "select",
      "default": "194c_individual",
      "choices": [
        {
          "value": "194c_individual",
          "label": "194C contractor — individual/HUF (1%)"
        },
        {
          "value": "194c_other",
          "label": "194C contractor — other (2%)"
        },
        {
          "value": "194h",
          "label": "194H commission (5%)"
        },
        {
          "value": "194i_land",
          "label": "194-I land/building rent (10%)"
        },
        {
          "value": "194i_plant",
          "label": "194-I plant/equipment rent (2%)"
        },
        {
          "value": "194j_professional",
          "label": "194J professional fee (10%)"
        },
        {
          "value": "194j_technical",
          "label": "194J technical fee (2%)"
        },
        {
          "value": "194q",
          "label": "194Q purchase of goods (0.1%)"
        }
      ]
    },
    {
      "key": "amount",
      "label": "Payment / aggregate amount (₹)",
      "type": "number",
      "default": 100000,
      "min": 0
    },
    {
      "key": "pan",
      "label": "Valid PAN available",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Deductee has furnished a valid PAN"
    },
    {
      "key": "custom_rate",
      "label": "Override rate (%) — 0 keeps section rate",
      "type": "number",
      "default": 0,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "194J professional",
      "values": {
        "section": "194j_professional",
        "amount": 100000,
        "pan": true,
        "custom_rate": 0
      }
    },
    {
      "label": "194C contractor",
      "values": {
        "section": "194c_individual",
        "amount": 50000,
        "pan": true,
        "custom_rate": 0
      }
    }
  ],
  "note": "Illustrative calculation using common section rates and simplified thresholds. Rates, thresholds, surcharge, treaty, lower-deduction certificates, PAN rules, and Finance Act changes must be checked for the relevant year."
},
  compute: (values) => {
      const rules = {
        "194c_individual": { label: "194C individual/HUF contractor", rate: 1, threshold: 30000 },
        "194c_other": { label: "194C other contractor", rate: 2, threshold: 30000 },
        "194h": { label: "194H commission", rate: 5, threshold: 15000 },
        "194i_land": { label: "194-I land/building rent", rate: 10, threshold: 240000 },
        "194i_plant": { label: "194-I plant/equipment rent", rate: 2, threshold: 240000 },
        "194j_professional": { label: "194J professional fee", rate: 10, threshold: 30000 },
        "194j_technical": { label: "194J technical fee", rate: 2, threshold: 30000 },
        "194q": { label: "194Q purchase of goods", rate: 0.1, threshold: 5000000 },
      };
      const rule = rules[values.section] || rules["194c_individual"];
      const amount = Math.max(0, Number(values.amount) || 0);
      let rate = Number(values.custom_rate) > 0 ? Number(values.custom_rate) : rule.rate;
      if (!values.pan) rate = Math.max(rate, 20);
      const baseAmount = amount > rule.threshold ? amount : 0;
      const tds = baseAmount * rate / 100;
      const money = (number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(number);
      return { result: money(tds) + " estimated TDS", caption: baseAmount ? rate + "% applied" : "Simplified threshold not crossed", rows: [["Section", rule.label], ["Amount", money(amount)], ["Threshold used", money(rule.threshold)], ["Rate", rate + "%"], ["Net after TDS", money(amount - tds)]] };
    },
};

export default spec;
