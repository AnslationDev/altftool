// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "standard-deviation-calculator",
  "title": "Standard Deviation Calculator",
  "description": "Population or sample standard deviation, variance and mean.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "sigma",
  "iconColor": "text-cyan-600",
  "fields": [
    {
      "key": "numbers",
      "label": "Numbers",
      "type": "textarea",
      "default": "2, 4, 4, 4, 5, 5, 7, 9"
    },
    {
      "key": "type",
      "label": "Type",
      "type": "select",
      "default": "population",
      "choices": [
        {
          "value": "population",
          "label": "Population"
        },
        {
          "value": "sample",
          "label": "Sample"
        }
      ]
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const arr = (String(values.numbers).match(/-?\d+(\.\d+)?/g) || []).map(Number);
      if (arr.length < 2) return { result: "—", caption: "Enter at least two numbers" };
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const div = values.type === "sample" ? arr.length - 1 : arr.length;
      const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / div;
      return { result: "σ = " + Math.sqrt(variance).toFixed(4), caption: values.type + " standard deviation", rows: [["Variance", variance.toFixed(4)], ["Mean", mean.toFixed(4)], ["Count", arr.length]] };
    },
};

export default spec;
