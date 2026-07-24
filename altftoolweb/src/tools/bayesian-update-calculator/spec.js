// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bayesian-update-calculator",
  "title": "Bayesian Update Calculator",
  "description": "Prior aur evidence se posterior probability calculate kare.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "brain-circuit",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "prior",
      "label": "Prior probability (%)",
      "type": "number",
      "default": 10,
      "min": 0,
      "max": 100
    },
    {
      "key": "sensitivity",
      "label": "P(evidence | hypothesis) (%)",
      "type": "number",
      "default": 90,
      "min": 0,
      "max": 100
    },
    {
      "key": "false_positive",
      "label": "P(evidence | not hypothesis) (%)",
      "type": "number",
      "default": 5,
      "min": 0,
      "max": 100
    }
  ],
  "presets": [
    {
      "label": "10% prior, strong evidence",
      "values": {
        "prior": 10,
        "sensitivity": 90,
        "false_positive": 5
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const prior = Math.max(0, Math.min(1, Number(values.prior) / 100)), sensitivity = Math.max(0, Math.min(1, Number(values.sensitivity) / 100)), falsePositive = Math.max(0, Math.min(1, Number(values.false_positive) / 100));
      const evidence = sensitivity * prior + falsePositive * (1 - prior);
      const posterior = evidence ? (sensitivity * prior) / evidence : 0;
      const priorOdds = prior < 1 ? prior / Math.max(1e-12, 1 - prior) : Number.MAX_SAFE_INTEGER;
      const likelihoodRatio = falsePositive ? sensitivity / falsePositive : Number.MAX_SAFE_INTEGER;
      return { result: (posterior * 100).toFixed(6) + "% posterior", rows: [["Prior", (prior * 100).toFixed(4) + "%"], ["Evidence probability", (evidence * 100).toFixed(4) + "%"], ["Prior odds", priorOdds.toFixed(6)], ["Likelihood ratio", likelihoodRatio.toFixed(6)], ["Posterior odds", (priorOdds * likelihoodRatio).toFixed(6)]] };
    },
};

export default spec;
