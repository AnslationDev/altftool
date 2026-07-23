// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "baby-growth-percentile-calculator",
  "title": "Baby Growth Percentile Calculator",
  "description": "A rough weight-for-age percentile estimate for babies 0–24 months.",
  "badge": "Health",
  "category": [
    "Health"
  ],
  "icon": "baby",
  "iconColor": "text-pink-500",
  "fields": [
    {
      "key": "sex",
      "label": "Sex",
      "type": "select",
      "default": "male",
      "choices": [
        {
          "value": "male",
          "label": "Boy"
        },
        {
          "value": "female",
          "label": "Girl"
        }
      ]
    },
    {
      "key": "age_months",
      "label": "Age (months)",
      "type": "number",
      "default": "6"
    },
    {
      "key": "weight",
      "label": "Weight (kg)",
      "type": "number",
      "default": "7.5"
    }
  ],
  "note": "A simplified estimate — always use your pediatrician's official growth charts."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const a = Math.max(0, Math.min(24, num(values.age_months)));
      // Approximate WHO median + SD (kg) by age, interpolated.
      const base = values.sex === "female" ? 3.2 : 3.3;
      const median = base + a * (a < 6 ? 0.7 : 0.35);
      const sd = 0.35 + a * 0.03;
      const z = (num(values.weight) - median) / sd;
      const pct = Math.round(100 * (0.5 * (1 + erf(z / Math.SQRT2))));
      function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
      return { result: "~" + Math.max(1, Math.min(99, pct)) + "th percentile", caption: `Median for age ≈ ${median.toFixed(1)} kg`, rows: [["Your baby", num(values.weight).toFixed(1) + " kg"], ["Z-score", z.toFixed(2)]] };
    },
};

export default spec;
