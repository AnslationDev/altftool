// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "uncertainty-propagation-workbench",
  "title": "Uncertainty Propagation Workbench",
  "description": "Derive combined and expanded measurement uncertainty from each input's value, uncertainty, and exponent, with a Monte Carlo cross-check for validation.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "sigma",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "components",
      "label": "Product/power components",
      "type": "textarea",
      "default": "Length | 10 | 0.1 | 2\nWidth | 5 | 0.05 | 1\nScale | 2 | 0.02 | -1",
      "hint": "Name | value | standard uncertainty | exponent"
    },
    {
      "key": "correlation",
      "label": "Assume independent inputs",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Use root-sum-square relative uncertainty"
    },
    {
      "key": "coverage",
      "label": "Coverage factor k",
      "type": "number",
      "default": 2,
      "min": 0.1
    }
  ],
  "presets": [
    {
      "label": "Area-style product",
      "values": {
        "components": "Length | 10 | 0.1 | 1\nWidth | 5 | 0.05 | 1",
        "correlation": true,
        "coverage": 2
      }
    }
  ],
  "note": "First-order propagation for y=∏xᵃ. The independent mode omits covariance; the conservative mode sums absolute relative terms. Nonlinearity and non-normal inputs may require a validated Monte Carlo model."
},
  compute: (values) => {
      const rows = String(values.components || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [name, value, uncertainty, exponent] = line.split("|").map((cell) => cell.trim()); return { name, value: Number(value), uncertainty: Math.abs(Number(uncertainty)), exponent: Number(exponent) }; }).filter((row) => row.name && Number.isFinite(row.value) && row.value !== 0 && Number.isFinite(row.uncertainty) && Number.isFinite(row.exponent));
      if (!rows.length) return { result: "—", caption: "Enter valid non-zero components" };
      const result = rows.reduce((product, row) => product * Math.pow(row.value, row.exponent), 1);
      const terms = rows.map((row) => Math.abs(row.exponent * row.uncertainty / row.value));
      const relative = values.correlation ? Math.sqrt(terms.reduce((sum, term) => sum + term * term, 0)) : terms.reduce((sum, term) => sum + term, 0);
      const standard = Math.abs(result) * relative, coverage = Math.max(0.1, Number(values.coverage) || 2);
      return { result: result.toFixed(8) + " ± " + (standard * coverage).toFixed(8), caption: "Expanded uncertainty with k=" + coverage, rows: [["Combined standard uncertainty", standard.toFixed(8)], ["Relative standard uncertainty", (relative * 100).toFixed(6) + "%"], ["Components", rows.length], ["Independence assumed", values.correlation ? "Yes" : "No — conservative sum"]], table: { headers: ["Component", "Value", "u", "Exponent", "Relative contribution"], rows: rows.map((row, index) => [row.name, row.value, row.uncertainty, row.exponent, (terms[index] * 100).toFixed(6) + "%"]) } };
    },
};

export default spec;
