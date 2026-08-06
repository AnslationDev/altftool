// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "vendor-data-processing-inventory",
  "title": "Vendor Data Processing Inventory",
  "description": "Track vendors with their processing purposes, data categories and retention terms.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Business"
  ],
  "icon": "table-properties",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records (one per line)",
      "type": "textarea",
      "default": "Helpdesk Co | Support | Contact and ticket data | Customers | India | 24 months | DPA-2026-01 | Support\nPayroll Co | Payroll | Identity and bank data | Staff | India | 8 years | DPA-2025-14 | People",
      "hint": "Use | between: Vendor | Purpose | Data categories | People | Location | Retention | DPA / terms | Owner"
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
        "records": "Helpdesk Co | Support | Contact and ticket data | Customers | India | 24 months | DPA-2026-01 | Support\nPayroll Co | Payroll | Identity and bank data | Staff | India | 8 years | DPA-2025-14 | People",
        "required": true
      }
    }
  ],
  "outputLabel": "Structured inventory"
},
  compute: (values) => {
      const headers = ["Vendor","Purpose","Data categories","People","Location","Retention","DPA / terms","Owner"];
      const rowLimit = 100;
      const lines = String(values.records || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const parsed = lines.map((line) => line.split("|").map((cell) => cell.trim()));
      const incomplete = parsed.filter((row) => row.length < headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      const tableRows = parsed.map((row) => headers.map((_, index) => row[index] || "—"));
      // "Require complete rows" / "Flag missing columns" must gate every place
      // the incomplete-row flag is surfaced, not just the caption — when off,
      // treat every row as complete for the stat tiles too.
      const flagIncomplete = Boolean(values.required);
      const needsReview = flagIncomplete ? incomplete : 0;
      const completeRows = flagIncomplete ? Math.max(0, lines.length - incomplete) : lines.length;
      const truncated = tableRows.length > rowLimit;
      const list = lines.length ? [] : ["Add one record per line and separate fields with |."];
      if (truncated) {
        list.push(
          "Showing the first " + rowLimit + " of " + tableRows.length +
            " records. Copy and download only include what's shown here — split larger inventories into multiple exports."
        );
      }
      return {
        result: lines.length + " record" + (lines.length === 1 ? "" : "s") + " mapped",
        caption: flagIncomplete ? incomplete + " incomplete row(s)" : headers.length + " tracked fields",
        rows: [["Complete rows", completeRows], ["Needs review", needsReview], ["Columns", headers.length]],
        table: { headers, rows: tableRows.slice(0, rowLimit) },
        list,
      };
    },
};

export default spec;
