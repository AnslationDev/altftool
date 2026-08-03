// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "measurement-error-budget-builder",
  "title": "Measurement Error-Budget Builder",
  "description": "Combine uncertainty sources, their distributions, and a coverage factor into a combined and expanded measurement uncertainty.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "list-tree",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "sources",
      "label": "Uncertainty sources",
      "type": "textarea",
      "default": "Repeatability | 0.12 | normal | 1\nResolution | 0.05 | rectangular | 1\nReference standard | 0.08 | normal-k2 | 1",
      "hint": "Source | stated uncertainty | distribution | sensitivity coefficient"
    },
    {
      "key": "coverage",
      "label": "Output coverage factor k",
      "type": "number",
      "default": 2,
      "min": 0.1
    },
    {
      "key": "correlated",
      "label": "Treat sources as independent",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Combine standard components by root-sum-square"
    }
  ],
  "presets": [
    {
      "label": "Three sources",
      "values": {
        "sources": "Repeatability | 0.12 | normal | 1\nResolution | 0.05 | rectangular | 1\nReference standard | 0.08 | normal-k2 | 1",
        "coverage": 2,
        "correlated": true
      }
    }
  ],
  "note": "GUM-style first-order organizer. Distribution labels are simplified: rectangular÷√3, triangular÷√6, normal-k2÷2. Correlations, degrees of freedom, bias, drift, model uncertainty, and traceability need expert review."
},
  compute: (values) => {
      const rows = String(values.sources || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name = "Source", stated = "0", distribution = "normal", sensitivity = "1"] = line.split("|").map((cell) => cell.trim());
        const divisor = distribution === "rectangular" ? Math.sqrt(3) : distribution === "triangular" ? Math.sqrt(6) : distribution === "normal-k2" ? 2 : 1;
        const standard = Math.abs(Number(stated) || 0) / divisor, coefficient = Number(sensitivity) || 0, contribution = standard * coefficient;
        return { name, stated: Math.abs(Number(stated) || 0), distribution, coefficient, standard, contribution };
      });
      const combined = values.correlated ? Math.sqrt(rows.reduce((sum, row) => sum + row.contribution ** 2, 0)) : rows.reduce((sum, row) => sum + Math.abs(row.contribution), 0);
      const coverage = Math.max(0.1, Number(values.coverage) || 2), expanded = combined * coverage;
      return { result: expanded.toFixed(8) + " expanded uncertainty", caption: "Combined standard uncertainty " + combined.toFixed(8) + " · k=" + coverage, rows: [["Sources", rows.length], ["Independent RSS", values.correlated ? "Yes" : "No — absolute sum"], ["Coverage factor", coverage]], table: { headers: ["Source", "Stated u", "Distribution", "Sensitivity", "Standard u", "Contribution"], rows: rows.map((row) => [row.name, row.stated, row.distribution, row.coefficient, row.standard.toFixed(8), row.contribution.toFixed(8)]) } };
    },
};

export default spec;
