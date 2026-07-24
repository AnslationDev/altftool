// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "calibration-curve-lod-loq-workbench",
  "title": "Calibration Curve LOD/LOQ Workbench",
  "description": "Fit, residuals, confidence bands aur detection limits calculate kare.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "chart-scatter",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "points",
      "label": "Calibration points",
      "type": "textarea",
      "default": "0 | 0.02\n1 | 1.03\n2 | 2.05\n3 | 3.08\n4 | 4.02\n5 | 5.11",
      "hint": "Concentration x | response y"
    },
    {
      "key": "lod_factor",
      "label": "LOD sigma factor",
      "type": "number",
      "default": 3.3,
      "min": 0
    },
    {
      "key": "loq_factor",
      "label": "LOQ sigma factor",
      "type": "number",
      "default": 10,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Six-point curve",
      "values": {
        "points": "0 | 0.02\n1 | 1.03\n2 | 2.05\n3 | 3.08\n4 | 4.02\n5 | 5.11",
        "lod_factor": 3.3,
        "loq_factor": 10
      }
    }
  ],
  "note": "Unweighted ordinary least-squares and residual-standard-deviation illustration. Validated analytical methods may require blank SD, replicate low levels, weighting, heteroscedasticity checks, matrix effects, and jurisdiction-specific guidance."
},
  compute: (values) => {
      const points = String(values.points || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map(Number)).filter((row) => row.length >= 2 && row.every(Number.isFinite));
      if (points.length < 3) return { result: "—", caption: "Enter at least three valid x/y points" };
      const n = points.length, mx = points.reduce((sum, row) => sum + row[0], 0) / n, my = points.reduce((sum, row) => sum + row[1], 0) / n;
      const sxx = points.reduce((sum, row) => sum + (row[0] - mx) ** 2, 0), sxy = points.reduce((sum, row) => sum + (row[0] - mx) * (row[1] - my), 0);
      if (!sxx) return { result: "—", caption: "x values need variation" };
      const slope = sxy / sxx, intercept = my - slope * mx;
      const residuals = points.map((row) => row[1] - (intercept + slope * row[0])), sigma = Math.sqrt(residuals.reduce((sum, value) => sum + value * value, 0) / Math.max(1, n - 2));
      const syy = points.reduce((sum, row) => sum + (row[1] - my) ** 2, 0), r2 = syy ? 1 - residuals.reduce((sum, value) => sum + value * value, 0) / syy : 1;
      const lod = slope ? Number(values.lod_factor) * sigma / Math.abs(slope) : 0, loq = slope ? Number(values.loq_factor) * sigma / Math.abs(slope) : 0;
      return { result: "LOD " + lod.toFixed(8) + " · LOQ " + loq.toFixed(8), caption: "y = " + slope.toFixed(8) + "x + " + intercept.toFixed(8), rows: [["Slope", slope.toFixed(8)], ["Intercept", intercept.toFixed(8)], ["Residual SD", sigma.toFixed(8)], ["R²", r2.toFixed(8)], ["Points", n]], table: { headers: ["x", "y", "Fitted y", "Residual"], rows: points.map((row, index) => [row[0], row[1], (intercept + slope * row[0]).toFixed(8), residuals[index].toFixed(8)]) } };
    },
};

export default spec;
