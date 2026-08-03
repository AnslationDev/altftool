// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "wacc-calculator",
  "title": "WACC Calculator",
  "description": "Calculate a company's weighted average cost of capital from its equity, debt, and tax inputs.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Finance",
    "Calculator"
  ],
  "icon": "scale",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "equity",
      "label": "Market value of equity",
      "type": "number",
      "default": 800000,
      "min": 0
    },
    {
      "key": "debt",
      "label": "Market value of debt",
      "type": "number",
      "default": 200000,
      "min": 0
    },
    {
      "key": "cost_equity",
      "label": "Cost of equity (%)",
      "type": "number",
      "default": 12
    },
    {
      "key": "cost_debt",
      "label": "Pre-tax cost of debt (%)",
      "type": "number",
      "default": 7
    },
    {
      "key": "tax",
      "label": "Marginal tax rate (%)",
      "type": "number",
      "default": 25
    }
  ],
  "presets": [
    {
      "label": "80/20 structure",
      "values": {
        "equity": 800000,
        "debt": 200000,
        "cost_equity": 12,
        "cost_debt": 7,
        "tax": 25
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const E = Math.max(0, Number(values.equity) || 0), D = Math.max(0, Number(values.debt) || 0), total = E + D;
      if (!total) return { result: "—", caption: "Enter equity or debt value" };
      const Re = Number(values.cost_equity) / 100, Rd = Number(values.cost_debt) / 100, tax = Number(values.tax) / 100;
      const afterDebt = Rd * (1 - tax), wacc = (E / total) * Re + (D / total) * afterDebt;
      return { result: (wacc * 100).toFixed(3) + "% WACC", rows: [["Equity weight", ((E / total) * 100).toFixed(2) + "%"], ["Debt weight", ((D / total) * 100).toFixed(2) + "%"], ["After-tax debt cost", (afterDebt * 100).toFixed(3) + "%"], ["Equity contribution", ((E / total) * Re * 100).toFixed(3) + "%"], ["Debt contribution", ((D / total) * afterDebt * 100).toFixed(3) + "%"]] };
    },
};

export default spec;
