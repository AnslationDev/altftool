// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "correlation-simpsons-paradox-visualizer",
  "title": "Correlation & Simpson's Paradox Visualizer",
  "description": "Compare per-group and aggregate correlations from grouped x/y data, then flag potential Simpson's-paradox reversals where the trends disagree.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "chart-scatter",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "data",
      "label": "Grouped x/y observations",
      "type": "textarea",
      "default": "A | 1 | 4\nA | 2 | 5\nA | 3 | 6\nB | 6 | 1\nB | 7 | 2\nB | 8 | 3",
      "hint": "Group | x | y"
    },
    {
      "key": "minimum",
      "label": "Minimum observations per group",
      "type": "number",
      "default": 2,
      "min": 2
    }
  ],
  "presets": [
    {
      "label": "Reversal example",
      "values": {
        "data": "A | 1 | 4\nA | 2 | 5\nA | 3 | 6\nB | 6 | 1\nB | 7 | 2\nB | 8 | 3",
        "minimum": 2
      }
    }
  ],
  "note": "Exploratory Pearson correlations. Correlation is not causation; small samples, nonlinear relationships, outliers, weighting, measurement error, and omitted variables can dominate the result."
},
  compute: (values) => {
      const rows = String(values.data || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [group, x, y] = line.split("|").map((cell) => cell.trim()); return { group, x: Number(x), y: Number(y) }; }).filter((row) => row.group && Number.isFinite(row.x) && Number.isFinite(row.y));
      const corr = (items) => { if (items.length < 2) return 0; const mx = items.reduce((sum, row) => sum + row.x, 0) / items.length, my = items.reduce((sum, row) => sum + row.y, 0) / items.length; const num = items.reduce((sum, row) => sum + (row.x - mx) * (row.y - my), 0), dx = Math.sqrt(items.reduce((sum, row) => sum + (row.x - mx) ** 2, 0)), dy = Math.sqrt(items.reduce((sum, row) => sum + (row.y - my) ** 2, 0)); return dx && dy ? num / (dx * dy) : 0; };
      const groups = new Map();
      for (const row of rows) groups.set(row.group, [...(groups.get(row.group) || []), row]);
      const minimum = Math.max(2, Number(values.minimum) || 2);
      const groupRows = [...groups.entries()].filter(([, items]) => items.length >= minimum).map(([group, items]) => [group, items.length, corr(items).toFixed(6)]);
      const aggregate = corr(rows);
      const groupSigns = groupRows.map((row) => Math.sign(Number(row[2]))).filter(Boolean);
      const reversal = groupSigns.length && groupSigns.every((sign) => sign === groupSigns[0]) && Math.sign(aggregate) && Math.sign(aggregate) !== groupSigns[0];
      return { result: reversal ? "Possible Simpson’s-paradox reversal" : "No full sign reversal detected", caption: "Aggregate r = " + aggregate.toFixed(6), rows: [["Observations", rows.length], ["Groups", groups.size], ["Aggregate correlation", aggregate.toFixed(6)]], table: { headers: ["Group", "n", "Within-group Pearson r"], rows: groupRows }, list: ["Inspect group definitions, sample sizes, plots, weights, and plausible confounders before interpreting any correlation."] };
    },
};

export default spec;
