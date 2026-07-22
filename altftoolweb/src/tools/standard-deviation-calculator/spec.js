// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "standard-deviation-calculator",
  "title": "Standard Deviation Calculator",
  "description": "Calculate the standard deviation of a set of numbers.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "calculator",
  "iconColor": "text-amber-600",
  "fields": [
    {
      "key": "amount",
      "label": "Amount",
      "type": "number",
      "default": "1000"
    },
    {
      "key": "values",
      "label": "Values",
      "type": "textarea",
      "default": "1,2,3,4,5"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "amount": "1000",
        "values": "1,2,3,4,5"
      }
    }
  ],
  "note": "Standard Deviation measures the amount of variation or dispersion in a set of values."
},
  compute: (values, mode) => { let nums = values.values.split(',').map(Number); if (nums.some(isNaN)) return { result: 'Invalid input. Please enter numbers separated by commas.' }; let mean = nums.reduce((a, b) => a + b, 0) / nums.length; let variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length; let stdDev = Math.sqrt(variance); return { result: `Standard Deviation: ${stdDev.toFixed(2)}`, rows: [['Mean', mean.toFixed(2)], ['Variance', variance.toFixed(2)]], table: {headers:['Value'],rows:nums.map(n => [n])} }; },
};

export default spec;
