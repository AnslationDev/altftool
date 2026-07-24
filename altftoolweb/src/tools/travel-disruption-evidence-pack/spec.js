// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "travel-disruption-evidence-pack",
  "title": "Travel Disruption Evidence Pack",
  "description": "Delays, bookings, receipts aur claim evidence organize kare.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Travel",
    "Productivity"
  ],
  "icon": "plane",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records (one per line)",
      "type": "textarea",
      "default": "Delay notification | 2026-07-20 18:40 | Example Air | PNR123 | — | screenshot-01.png | Shows announced delay\nReplacement hotel | 2026-07-21 00:10 | Example Hotel | INV-92 | 6800 | receipt-92.pdf | Consequential expense",
      "hint": "Use | between: Evidence item | Date / time | Provider | Booking / claim ref | Amount | File / message reference | Why it matters"
    },
    {
      "key": "required",
      "label": "Require complete rows",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Flag missing columns"
    }
  ],
  "presets": [
    {
      "label": "Example records",
      "values": {
        "records": "Delay notification | 2026-07-20 18:40 | Example Air | PNR123 | — | screenshot-01.png | Shows announced delay\nReplacement hotel | 2026-07-21 00:10 | Example Hotel | INV-92 | 6800 | receipt-92.pdf | Consequential expense",
        "required": true
      }
    }
  ],
  "outputLabel": "Structured inventory",
  "note": "Builds a local claim index. Preserve original files, headers, booking terms, receipts, provider messages, and official disruption records; eligibility and deadlines vary."
},
  compute: (values) => {
      const headers = ["Evidence item","Date / time","Provider","Booking / claim ref","Amount","File / message reference","Why it matters"];
      const lines = String(values.records || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const parsed = lines.map((line) => line.split("|").map((cell) => cell.trim()));
      const incomplete = parsed.filter((row) => row.length < headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      const tableRows = parsed.map((row) => headers.map((_, index) => row[index] || "—"));
      return {
        result: lines.length + " record" + (lines.length === 1 ? "" : "s") + " mapped",
        caption: values.required ? incomplete + " incomplete row(s)" : headers.length + " tracked fields",
        rows: [["Complete rows", Math.max(0, lines.length - incomplete)], ["Needs review", incomplete], ["Columns", headers.length]],
        table: { headers, rows: tableRows.slice(0, 100) },
        list: lines.length ? [] : ["Add one record per line and separate fields with |."],
      };
    },
};

export default spec;
