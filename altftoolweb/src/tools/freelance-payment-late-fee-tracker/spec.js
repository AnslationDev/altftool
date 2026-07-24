// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "freelance-payment-late-fee-tracker",
  "title": "Freelance Payment & Late-Fee Tracker",
  "description": "Due dates, payments aur agreed late fees track kare.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Finance",
    "Business"
  ],
  "icon": "calendar-clock",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records, one per line",
      "type": "textarea",
      "default": "INV-101 | Client A | 2026-06-01 | 2026-06-30 | 50000 | Unpaid | 1% per month in signed contract | Contract §5\nINV-102 | Client B | 2026-07-01 | 2026-07-15 | 18000 | 2026-07-14 | None | Bank reference",
      "hint": "Use | between: Invoice | Client | Issued | Due | Amount | Paid date / status | Agreed late-fee term | Evidence"
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
        "records": "INV-101 | Client A | 2026-06-01 | 2026-06-30 | 50000 | Unpaid | 1% per month in signed contract | Contract §5\nINV-102 | Client B | 2026-07-01 | 2026-07-15 | 18000 | 2026-07-14 | None | Bank reference",
        "complete": true
      }
    }
  ],
  "note": "Tracking organizer only. Apply late fees only where the signed agreement and applicable law allow them; confirm tax, interest caps, notice, dispute, and collection rules."
},
  compute: (values) => {
      const headers = ["Invoice","Client","Issued","Due","Amount","Paid date / status","Agreed late-fee term","Evidence"];
      const rows = String(values.records || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const incomplete = rows.filter((row) => row.length < headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      return { result: rows.length + " structured record(s)", caption: values.complete ? incomplete + " incomplete row(s)" : headers.length + " tracked fields", rows: [["Complete", Math.max(0, rows.length - incomplete)], ["Needs review", incomplete], ["Columns", headers.length]], table: { headers, rows: rows.map((row) => headers.map((_, index) => row[index] || "—")).slice(0, 200) } };
    },
};

export default spec;
