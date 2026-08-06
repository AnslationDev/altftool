// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "gig-platform-fee-normalizer",
  "title": "Gig Platform Fee Normalizer",
  "description": "Compare effective hourly pay across gig platforms after fees, travel and admin time.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Finance",
    "Business"
  ],
  "icon": "scale",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "offers",
      "label": "Gig offers",
      "type": "textarea",
      "default": "Platform A | 5000 | 15 | 300 | 6 | 2\nPlatform B | 4600 | 8 | 150 | 5 | 1.5",
      "hint": "Platform | gross | fee % | travel/expenses | paid hours | unpaid admin hours"
    },
    {
      "key": "tax_rate",
      "label": "Estimated withholding / tax reserve (%)",
      "type": "number",
      "default": 10,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Two platforms",
      "values": {
        "offers": "Platform A | 5000 | 15 | 300 | 6 | 2\nPlatform B | 4600 | 8 | 150 | 5 | 1.5",
        "tax_rate": 10
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const tax = Math.max(0, Number(values.tax_rate) || 0) / 100;
      const rows = String(values.offers || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name, grossRaw, feeRaw, expenseRaw, paidRaw, adminRaw] = line.split("|").map((cell) => cell.trim());
        const gross = Number(grossRaw) || 0, fee = gross * (Number(feeRaw) || 0) / 100, expense = Number(expenseRaw) || 0, hours = Math.max(0.01, (Number(paidRaw) || 0) + (Number(adminRaw) || 0)), net = (gross - fee - expense) * (1 - tax);
        return [name || "Platform", gross.toFixed(2), fee.toFixed(2), expense.toFixed(2), hours.toFixed(2), net.toFixed(2), (net / hours).toFixed(2)];
      }).sort((a, b) => Number(b[6]) - Number(a[6]));
      return { result: rows.length ? rows[0][0] + " has highest entered effective rate" : "No offers entered", caption: (tax * 100).toFixed(2) + "% reserve assumption", table: { headers: ["Platform", "Gross", "Fee", "Expenses", "Total hours", "Net after reserve", "Effective/hour"], rows } };
    },
};

export default spec;
