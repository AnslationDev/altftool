// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "probability-distribution-fitter",
  "title": "Probability Distribution Fitter",
  "description": "Fit your dataset against common probability distributions and compare goodness of fit.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "chart-spline",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "data",
      "label": "Numeric sample",
      "type": "textarea",
      "default": "4.2, 5.1, 5.4, 5.8, 6.0, 6.3, 6.9, 7.2"
    },
    {
      "key": "positive_only",
      "label": "Compare positive-only models",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Include exponential and lognormal when all values are positive"
    }
  ],
  "presets": [
    {
      "label": "Positive sample",
      "values": {
        "data": "4.2, 5.1, 5.4, 5.8, 6.0, 6.3, 6.9, 7.2",
        "positive_only": true
      }
    }
  ],
  "note": "Method-of-moments parameters and AIC-style log-likelihood ranking for exploratory comparison. It is not a goodness-of-fit test and does not validate independence, censoring, tails, mixtures, or model assumptions."
},
  compute: (values) => {
      const data = String(values.data || "").split(/[\s,;]+/).map(Number).filter(Number.isFinite);
      if (data.length < 2) return { result: "—", caption: "Enter at least two numbers" };
      const n = data.length, mean = data.reduce((sum, value) => sum + value, 0) / n, variance = data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n, sd = Math.sqrt(Math.max(variance, 1e-12));
      const normalLL = data.reduce((sum, value) => sum - Math.log(sd * Math.sqrt(2 * Math.PI)) - ((value - mean) ** 2) / (2 * variance), 0);
      const models = [["Normal", mean.toFixed(5) + ", " + sd.toFixed(5), (2 * 2 - 2 * normalLL).toFixed(4)]];
      if (values.positive_only && data.every((value) => value > 0)) {
        const lambda = 1 / mean, expLL = data.reduce((sum, value) => sum + Math.log(lambda) - lambda * value, 0);
        const logs = data.map(Math.log), logMean = logs.reduce((sum, value) => sum + value, 0) / n, logVar = logs.reduce((sum, value) => sum + (value - logMean) ** 2, 0) / n, logSd = Math.sqrt(Math.max(logVar, 1e-12));
        const logLL = data.reduce((sum, value) => sum - Math.log(value * logSd * Math.sqrt(2 * Math.PI)) - ((Math.log(value) - logMean) ** 2) / (2 * logVar), 0);
        models.push(["Exponential", "λ=" + lambda.toFixed(5), (2 - 2 * expLL).toFixed(4)]);
        models.push(["Lognormal", "μ=" + logMean.toFixed(5) + ", σ=" + logSd.toFixed(5), (4 - 2 * logLL).toFixed(4)]);
      }
      models.sort((a, b) => Number(a[2]) - Number(b[2]));
      return { result: models[0][0] + " ranks first by entered-data AIC", caption: "Lower AIC is better only within these candidate models", rows: [["Observations", n], ["Mean", mean.toFixed(6)], ["Std. deviation", sd.toFixed(6)]], table: { headers: ["Model", "Estimated parameters", "AIC"], rows: models } };
    },
};

export default spec;
