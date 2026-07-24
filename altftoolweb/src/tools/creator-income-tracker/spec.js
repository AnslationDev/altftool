// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "creator-income-tracker",
  "title": "Creator Income Tracker",
  "description": "Sponsorship, affiliate aur platform payouts locally track kare.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Business",
    "Finance"
  ],
  "icon": "wallet-cards",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records, one per line",
      "type": "textarea",
      "default": "2026-07-01 | Brand A | Sponsorship | 50000 | 5000 | 5000 | 40000 | INV-101\n2026-07-15 | Platform B | Ad revenue | 18000 | 900 | 1800 | 15300 | PAY-77",
      "hint": "Use | between: Date | Client / platform | Income stream | Gross | Fees | Withholding | Net received | Invoice / payout ref"
    },
    {
      "key": "complete",
      "label": "Completeness review",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Flag rows with missing columns"
    }
  ],
  "presets": [
    {
      "label": "Example records",
      "values": {
        "records": "2026-07-01 | Brand A | Sponsorship | 50000 | 5000 | 5000 | 40000 | INV-101\n2026-07-15 | Platform B | Ad revenue | 18000 | 900 | 1800 | 15300 | PAY-77",
        "complete": true
      }
    }
  ]
},
  compute: (values) => {
      const headers = ["Date","Client / platform","Income stream","Gross","Fees","Withholding","Net received","Invoice / payout ref"];
      const rows = String(values.records || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const incomplete = rows.filter((row) => row.length < headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      return { result: rows.length + " structured record(s)", caption: values.complete ? incomplete + " incomplete row(s)" : headers.length + " tracked fields", rows: [["Complete", Math.max(0, rows.length - incomplete)], ["Needs review", incomplete], ["Columns", headers.length]], table: { headers, rows: rows.map((row) => headers.map((_, index) => row[index] || "—")).slice(0, 200) } };
    },
};

export default spec;
