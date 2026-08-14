// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "salary-slip-anomaly-checker",
  "title": "Salary Slip Anomaly Checker",
  "description": "Verify the totals and deductions on a salary slip and flag month-to-month changes.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Finance",
    "Productivity"
  ],
  "icon": "file-chart-column",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "slips",
      "label": "Monthly salary figures",
      "type": "textarea",
      "default": "2026-05 | 80000 | 12000 | 68000\n2026-06 | 80000 | 12000 | 68000\n2026-07 | 80000 | 18000 | 62000",
      "hint": "Month | gross | deductions | net"
    },
    {
      "key": "tolerance",
      "label": "Change alert threshold (%)",
      "type": "number",
      "default": 5,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Three months",
      "values": {
        "slips": "2026-05 | 80000 | 12000 | 68000\n2026-06 | 80000 | 12000 | 68000\n2026-07 | 80000 | 18000 | 62000",
        "tolerance": 5
      }
    }
  ],
  "note": "Arithmetic and month-to-month anomaly aid only. It does not determine tax, payroll, employment rights, or whether a deduction is lawful."
},
  compute: (values) => {
      const tolerance = Math.max(0, Number(values.tolerance) || 0);
      const source = String(values.slips || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      let previousNet = null;
      const rows = source.map((row) => {
        const gross = Number(row[1]) || 0, deductions = Number(row[2]) || 0, net = Number(row[3]) || 0;
        const mathGap = net - (gross - deductions);
        const change = previousNet ? ((net - previousNet) / Math.abs(previousNet)) * 100 : 0;
        const flags = [Math.abs(mathGap) > 0.01 ? "Totals mismatch" : "", previousNet && Math.abs(change) > tolerance ? "Net changed " + change.toFixed(1) + "%" : ""].filter(Boolean).join("; ") || "No configured anomaly";
        previousNet = net;
        return [row[0] || "—", gross, deductions, net, mathGap.toFixed(2), flags];
      });
      const flagged = rows.filter((row) => row[5] !== "No configured anomaly").length;
      return { result: flagged + " month(s) flagged", caption: tolerance + "% net-change threshold", rows: [["Months", rows.length], ["Flagged", flagged]], table: { headers: ["Month", "Gross", "Deductions", "Net", "Math gap", "Review"], rows } };
    },
};

export default spec;
