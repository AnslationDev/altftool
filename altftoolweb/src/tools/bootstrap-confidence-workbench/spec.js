// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bootstrap-confidence-workbench",
  "title": "Bootstrap Confidence Workbench",
  "description": "Calculate a seeded, reproducible bootstrap confidence interval for the mean from your numeric sample, with adjustable iterations and confidence level.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "repeat-2",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "data",
      "label": "Numeric sample",
      "type": "textarea",
      "default": "12, 15, 18, 19, 22, 25, 27, 31"
    },
    {
      "key": "iterations",
      "label": "Bootstrap iterations",
      "type": "number",
      "default": 2000,
      "min": 100,
      "max": 20000
    },
    {
      "key": "confidence",
      "label": "Confidence level (%)",
      "type": "select",
      "default": "95",
      "choices": [
        {
          "value": "90",
          "label": "90%"
        },
        {
          "value": "95",
          "label": "95%"
        },
        {
          "value": "99",
          "label": "99%"
        }
      ]
    },
    {
      "key": "seed",
      "label": "Seed",
      "type": "number",
      "default": 104729
    }
  ],
  "presets": [
    {
      "label": "Eight values",
      "values": {
        "data": "12, 15, 18, 19, 22, 25, 27, 31",
        "iterations": 2000,
        "confidence": "95",
        "seed": 104729
      }
    }
  ],
  "note": "Seeded percentile bootstrap for the sample mean. Dependence, time series, clusters, small or biased samples, extreme tails, and parameter boundaries may need a different bootstrap design or BCa interval."
},
  compute: (values) => {
      const data = String(values.data || "").split(/[\s,;]+/).map(Number).filter(Number.isFinite);
      if (!data.length) return { result: "—", caption: "Enter numeric sample values" };
      const iterations = Math.max(100, Math.min(20000, Math.round(Number(values.iterations) || 1000)));
      let seed = (Math.round(Number(values.seed)) >>> 0) || 1;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      const means = [];
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        let total = 0;
        for (let index = 0; index < data.length; index += 1) total += data[Math.floor(random() * data.length)];
        means.push(total / data.length);
      }
      means.sort((a, b) => a - b);
      const alpha = (100 - Number(values.confidence)) / 200;
      const quantile = (p) => means[Math.min(means.length - 1, Math.max(0, Math.floor(p * (means.length - 1))))];
      const sampleMean = data.reduce((sum, value) => sum + value, 0) / data.length;
      return { result: quantile(alpha).toFixed(6) + " to " + quantile(1 - alpha).toFixed(6), caption: values.confidence + "% seeded percentile interval for mean", rows: [["Sample size", data.length], ["Sample mean", sampleMean.toFixed(6)], ["Iterations", iterations], ["Seed", values.seed], ["Bootstrap median", quantile(0.5).toFixed(6)]] };
    },
};

export default spec;
