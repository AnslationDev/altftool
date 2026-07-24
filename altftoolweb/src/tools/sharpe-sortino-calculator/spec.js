// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "sharpe-sortino-calculator",
  "title": "Sharpe & Sortino Calculator",
  "description": "Return series ka risk-adjusted performance compare kare.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Finance",
    "Calculator"
  ],
  "icon": "chart-line",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "returns",
      "label": "Periodic returns (%)",
      "type": "textarea",
      "default": "1.2, -0.4, 2.1, 0.8, -1.1, 1.7, 0.5, 1.0"
    },
    {
      "key": "risk_free",
      "label": "Risk-free return per period (%)",
      "type": "number",
      "default": 0.2
    },
    {
      "key": "target",
      "label": "Minimum acceptable return (%)",
      "type": "number",
      "default": 0
    },
    {
      "key": "periods",
      "label": "Periods per year",
      "type": "number",
      "default": 12,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Monthly series",
      "values": {
        "returns": "1.2, -0.4, 2.1, 0.8, -1.1, 1.7, 0.5, 1.0",
        "risk_free": 0.2,
        "target": 0,
        "periods": 12
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const series = String(values.returns || "").split(/[\s,;]+/).map(Number).filter(Number.isFinite).map((value) => value / 100);
      if (series.length < 2) return { result: "—", caption: "Enter at least two returns" };
      const rf = Number(values.risk_free) / 100, target = Number(values.target) / 100, periods = Math.max(1, Number(values.periods) || 1);
      const mean = series.reduce((sum, value) => sum + value, 0) / series.length;
      const variance = series.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (series.length - 1);
      const stdev = Math.sqrt(variance);
      const downside = Math.sqrt(series.reduce((sum, value) => sum + Math.min(0, value - target) ** 2, 0) / series.length);
      const sharpe = stdev ? ((mean - rf) / stdev) * Math.sqrt(periods) : 0;
      const sortino = downside ? ((mean - target) / downside) * Math.sqrt(periods) : 0;
      return { result: sharpe.toFixed(4) + " Sharpe", caption: sortino.toFixed(4) + " Sortino", rows: [["Observations", series.length], ["Mean / period", (mean * 100).toFixed(4) + "%"], ["Std. deviation", (stdev * 100).toFixed(4) + "%"], ["Downside deviation", (downside * 100).toFixed(4) + "%"], ["Annualized Sharpe", sharpe.toFixed(4)], ["Annualized Sortino", sortino.toFixed(4)]] };
    },
};

export default spec;
