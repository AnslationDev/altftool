// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "multi-currency-payout-reconciler",
  "title": "Multi-Currency Payout Reconciler",
  "description": "Match payout CSVs against invoices, allowing for FX, fees and withholding.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Finance",
    "Business"
  ],
  "icon": "arrow-left-right",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "payouts",
      "label": "Payout rows",
      "type": "textarea",
      "default": "INV-101 | USD | 1000 | 83.10 | 25 | 50 | 80525\nINV-102 | EUR | 500 | 90.20 | 10 | 25 | 43975",
      "hint": "Invoice | currency | gross foreign | FX to base | platform fee base | withholding base | received base"
    },
    {
      "key": "tolerance",
      "label": "Match tolerance (base currency)",
      "type": "number",
      "default": 1,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "USD/EUR payouts",
      "values": {
        "payouts": "INV-101 | USD | 1000 | 83.10 | 25 | 50 | 80525\nINV-102 | EUR | 500 | 90.20 | 10 | 25 | 43975",
        "tolerance": 1
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const tolerance = Math.max(0, Number(values.tolerance) || 0);
      const rows = String(values.payouts || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [invoice, currency, grossRaw, fxRaw, feeRaw, withholdingRaw, receivedRaw] = line.split("|").map((cell) => cell.trim());
        const gross = Number(grossRaw) || 0, fx = Number(fxRaw) || 0, fee = Number(feeRaw) || 0, withholding = Number(withholdingRaw) || 0, received = Number(receivedRaw) || 0, expected = gross * fx - fee - withholding, variance = received - expected;
        return [invoice || "—", currency || "—", gross.toFixed(2), fx.toFixed(6), expected.toFixed(2), received.toFixed(2), variance.toFixed(2), Math.abs(variance) <= tolerance ? "Match" : "Review"];
      });
      return { result: rows.filter((row) => row[7] === "Match").length + "/" + rows.length + " payouts match", caption: "Tolerance ±" + tolerance, table: { headers: ["Invoice", "Currency", "Gross", "FX", "Expected base", "Received", "Variance", "Status"], rows } };
    },
};

export default spec;
