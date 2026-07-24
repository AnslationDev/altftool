// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "apr-to-apy-converter",
  "title": "APR-to-APY Converter",
  "description": "Compounding frequency se nominal APR ko effective APY me badle.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Finance",
    "Calculator"
  ],
  "icon": "percent",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "apr",
      "label": "Nominal APR (%)",
      "type": "number",
      "default": 12
    },
    {
      "key": "compounds",
      "label": "Compounds per year",
      "type": "number",
      "default": 12,
      "min": 1
    },
    {
      "key": "continuous",
      "label": "Continuous compounding",
      "type": "toggle",
      "default": false,
      "checkboxLabel": "Use e^APR instead of periodic compounding"
    }
  ],
  "presets": [
    {
      "label": "12% monthly",
      "values": {
        "apr": 12,
        "compounds": 12,
        "continuous": false
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const apr = Number(values.apr) / 100, n = Math.max(1, Number(values.compounds) || 1);
      const apy = values.continuous ? Math.exp(apr) - 1 : Math.pow(1 + apr / n, n) - 1;
      return { result: (apy * 100).toFixed(6) + "% APY", caption: values.continuous ? "Continuous compounding" : n + " compounding period(s) per year", rows: [["Nominal APR", (apr * 100).toFixed(6) + "%"], ["Effective APY", (apy * 100).toFixed(6) + "%"], ["Effective uplift", ((apy - apr) * 100).toFixed(6) + " percentage points"]] };
    },
};

export default spec;
