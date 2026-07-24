// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "confidence-interval-calculator",
  "title": "Confidence Interval Calculator",
  "description": "Means aur proportions ke confidence intervals nikale.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "brackets",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "estimate",
      "label": "Sample estimate",
      "type": "number",
      "default": 50
    },
    {
      "key": "standard_error",
      "label": "Standard error",
      "type": "number",
      "default": 2.5,
      "min": 0
    },
    {
      "key": "confidence",
      "label": "Confidence level",
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
      "key": "percent",
      "label": "Display estimate as percent",
      "type": "toggle",
      "default": false,
      "checkboxLabel": "Append percentage units"
    }
  ],
  "presets": [
    {
      "label": "Mean 50 ± SE 2.5",
      "values": {
        "estimate": 50,
        "standard_error": 2.5,
        "confidence": "95",
        "percent": false
      }
    }
  ],
  "note": "Normal critical-value interval from an already-computed standard error. Small samples, skew, clustering, weighting, finite populations, and estimated variance may require a t, exact, bootstrap, or survey-specific method."
},
  compute: (values) => {
      const estimate = Number(values.estimate), se = Math.max(0, Number(values.standard_error) || 0), critical = { "90": 1.644854, "95": 1.959964, "99": 2.575829 }[values.confidence] || 1.959964;
      const margin = critical * se, suffix = values.percent ? "%" : "";
      return { result: (estimate - margin).toFixed(6) + suffix + " to " + (estimate + margin).toFixed(6) + suffix, caption: values.confidence + "% normal confidence interval", rows: [["Estimate", estimate + suffix], ["Standard error", se + suffix], ["Critical value", critical], ["Margin of error", margin.toFixed(6) + suffix]] };
    },
};

export default spec;
