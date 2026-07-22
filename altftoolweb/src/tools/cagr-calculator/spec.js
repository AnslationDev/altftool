// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "cagr-calculator",
  "title": "CAGR Calculator",
  "description": "Calculate Compound Annual Growth Rate for investments or financial growth.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "calculator",
  "iconColor": "text-cyan-600",
  "fields": [
    {
      "key": "initialamount",
      "label": "Initial Amount",
      "type": "number",
      "default": "1000",
      "suffix": "$"
    },
    {
      "key": "finalamount",
      "label": "Final Amount",
      "type": "number",
      "default": "2000",
      "suffix": "$"
    },
    {
      "key": "years",
      "label": "Years",
      "type": "number",
      "default": "5"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "initialAmount": "1000",
        "finalAmount": "2000",
        "years": "5"
      }
    }
  ],
  "note": "CAGR is a useful measure of the average annual growth rate of an investment over a specified period."
},
  compute: (values) => { let { initialAmount, finalAmount, years } = values; if (years === 0 || initialAmount === 0) return { result: 'Invalid input', caption: 'Initial amount and years must be greater than zero.' }; let cagr = Math.pow(finalAmount / initialAmount, 1 / years) - 1; return { result: `${(cagr * 100).toFixed(2)}%`, caption: 'Compound Annual Growth Rate (CAGR)' }; },
};

export default spec;
