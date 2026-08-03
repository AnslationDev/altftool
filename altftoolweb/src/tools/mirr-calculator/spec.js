// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "mirr-calculator",
  "title": "MIRR Calculator",
  "description": "Calculate a project's Modified Internal Rate of Return from its cash flows using separate finance and reinvestment rates.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Finance",
    "Calculator"
  ],
  "icon": "chart-no-axes-combined",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "cashflows",
      "label": "Cash flows from period 0",
      "type": "textarea",
      "default": "-100000, 25000, 30000, 35000, 40000"
    },
    {
      "key": "finance_rate",
      "label": "Finance rate (%)",
      "type": "number",
      "default": 8
    },
    {
      "key": "reinvest_rate",
      "label": "Reinvestment rate (%)",
      "type": "number",
      "default": 10
    }
  ],
  "presets": [
    {
      "label": "Five periods",
      "values": {
        "cashflows": "-100000, 25000, 30000, 35000, 40000",
        "finance_rate": 8,
        "reinvest_rate": 10
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const flows = String(values.cashflows || "").split(/[\s,;]+/).map(Number).filter(Number.isFinite);
      if (flows.length < 2) return { result: "—", caption: "Enter at least two cash flows" };
      const fr = Number(values.finance_rate) / 100, rr = Number(values.reinvest_rate) / 100, n = flows.length - 1;
      let pvNegative = 0, fvPositive = 0;
      flows.forEach((flow, index) => {
        if (flow < 0) pvNegative += flow / Math.pow(1 + fr, index);
        else if (flow > 0) fvPositive += flow * Math.pow(1 + rr, n - index);
      });
      if (!(pvNegative < 0 && fvPositive > 0)) return { result: "—", caption: "Series needs at least one negative and one positive flow" };
      const mirr = Math.pow(fvPositive / -pvNegative, 1 / n) - 1;
      return { result: (mirr * 100).toFixed(5) + "% MIRR per period", rows: [["Periods", n], ["PV of negative flows", pvNegative.toFixed(2)], ["FV of positive flows", fvPositive.toFixed(2)], ["Finance rate", (fr * 100).toFixed(3) + "%"], ["Reinvestment rate", (rr * 100).toFixed(3) + "%"]] };
    },
};

export default spec;
