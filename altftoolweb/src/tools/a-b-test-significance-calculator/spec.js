// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "a-b-test-significance-calculator",
  "title": "A/B Test Significance Calculator",
  "description": "Calculate the p-value and confidence level from your A/B test conversion data.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Business",
    "Calculator"
  ],
  "icon": "split",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "visitors_a",
      "label": "Variant A visitors",
      "type": "number",
      "default": 1000,
      "min": 1
    },
    {
      "key": "conversions_a",
      "label": "Variant A conversions",
      "type": "number",
      "default": 100,
      "min": 0
    },
    {
      "key": "visitors_b",
      "label": "Variant B visitors",
      "type": "number",
      "default": 1000,
      "min": 1
    },
    {
      "key": "conversions_b",
      "label": "Variant B conversions",
      "type": "number",
      "default": 125,
      "min": 0
    },
    {
      "key": "confidence",
      "label": "Confidence target (%)",
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
    }
  ],
  "presets": [
    {
      "label": "10% vs 12.5%",
      "values": {
        "visitors_a": 1000,
        "conversions_a": 100,
        "visitors_b": 1000,
        "conversions_b": 125,
        "confidence": "95"
      }
    }
  ],
  "note": "Two-sided pooled z-test approximation. It assumes independent randomized observations, one planned analysis, and valid conversion counting; sequential peeking and multiple comparisons need correction."
},
  compute: (values) => {
      const n1 = Number(values.visitors_a), x1 = Number(values.conversions_a), n2 = Number(values.visitors_b), x2 = Number(values.conversions_b);
      if (!(n1 > 0 && n2 > 0 && x1 >= 0 && x2 >= 0 && x1 <= n1 && x2 <= n2)) return { result: "—", caption: "Conversions must be between 0 and visitors" };
      const p1 = x1 / n1, p2 = x2 / n2, pooled = (x1 + x2) / (n1 + n2), se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
      const z = se ? (p2 - p1) / se : 0;
      const erf = (x) => { const sign = x < 0 ? -1 : 1; const a = Math.abs(x); const t = 1 / (1 + 0.3275911 * a); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a); return sign * y; };
      const cdf = (value) => 0.5 * (1 + erf(value / Math.sqrt(2)));
      const pValue = 2 * (1 - cdf(Math.abs(z)));
      const alpha = 1 - Number(values.confidence) / 100, significant = pValue < alpha;
      const uplift = p1 ? ((p2 - p1) / p1) * 100 : 0;
      return { result: significant ? "Statistically significant" : "Not significant at target", caption: "Two-sided p-value " + pValue.toFixed(6), rows: [["A conversion", (p1 * 100).toFixed(3) + "%"], ["B conversion", (p2 * 100).toFixed(3) + "%"], ["Relative uplift", uplift.toFixed(3) + "%"], ["z score", z.toFixed(5)], ["p-value", pValue.toFixed(6)], ["Confidence target", values.confidence + "%"]] };
    },
};

export default spec;
