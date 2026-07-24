// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "advance-tax-installment-planner",
  "title": "Advance Tax Installment Planner",
  "description": "Estimated tax ko applicable installments me schedule kare.",
  "badge": "India-Specific Utilities",
  "category": [
    "Finance",
    "India",
    "Calculator"
  ],
  "icon": "calendar-range",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "estimated_tax",
      "label": "Estimated annual tax liability (₹)",
      "type": "number",
      "default": 250000,
      "min": 0
    },
    {
      "key": "tds",
      "label": "Expected TDS / TCS credits (₹)",
      "type": "number",
      "default": 50000,
      "min": 0
    },
    {
      "key": "paid",
      "label": "Advance tax already paid (₹)",
      "type": "number",
      "default": 0,
      "min": 0
    },
    {
      "key": "presumptive",
      "label": "Eligible presumptive taxpayer",
      "type": "toggle",
      "default": false,
      "checkboxLabel": "Use single 100% target by 15 March"
    }
  ],
  "presets": [
    {
      "label": "Regular schedule",
      "values": {
        "estimated_tax": 250000,
        "tds": 50000,
        "paid": 0,
        "presumptive": false
      }
    },
    {
      "label": "Presumptive",
      "values": {
        "estimated_tax": 120000,
        "tds": 10000,
        "paid": 0,
        "presumptive": true
      }
    }
  ],
  "note": "Planning estimate only. Confirm eligibility, due dates, interest, credits, relief, and current assessment-year rules with official Income Tax guidance."
},
  compute: (values) => {
      const net = Math.max(0, (Number(values.estimated_tax) || 0) - (Number(values.tds) || 0));
      const paid = Math.max(0, Number(values.paid) || 0);
      const targets = values.presumptive ? [["15 Mar", 1]] : [["15 Jun", 0.15], ["15 Sep", 0.45], ["15 Dec", 0.75], ["15 Mar", 1]];
      const money = (number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.max(0, number));
      let previous = paid;
      const rows = targets.map(([date, fraction]) => {
        const cumulative = net * fraction;
        const installment = Math.max(0, cumulative - previous);
        previous += installment;
        return [date, Math.round(fraction * 100) + "%", money(cumulative), money(installment)];
      });
      return { result: money(Math.max(0, net - paid)) + " remaining", caption: values.presumptive ? "Presumptive schedule selected" : "Regular cumulative schedule", rows: [["Net advance-tax base", money(net)], ["Already paid", money(paid)]], table: { headers: ["Target date", "Cumulative target", "Cumulative amount", "Next amount"], rows } };
    },
};

export default spec;
