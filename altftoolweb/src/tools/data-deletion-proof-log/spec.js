// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "data-deletion-proof-log",
  "title": "Data Deletion Proof Log",
  "description": "Record deletion requests and the system-by-system evidence that each one completed.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Productivity"
  ],
  "icon": "list-checks",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records (one per line)",
      "type": "textarea",
      "default": "DEL-104 | CRM | Contact record | Hard delete | 2026-07-22 11:20 | crm-audit-8841 | AK\nDEL-104 | Backups | Encrypted snapshot | Expiry queued | 2026-07-22 12:10 | backup-job-592 | AK",
      "hint": "Use | between: Request ID | System | Record scope | Action | Completed at | Evidence reference | Reviewer"
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
        "records": "DEL-104 | CRM | Contact record | Hard delete | 2026-07-22 11:20 | crm-audit-8841 | AK\nDEL-104 | Backups | Encrypted snapshot | Expiry queued | 2026-07-22 12:10 | backup-job-592 | AK",
        "required": true
      }
    }
  ],
  "outputLabel": "Structured inventory",
  "confirmReset": "Reset the deletion proof log? This clears every pasted record and cannot be undone."
},
  compute: (values) => {
      const headers = ["Request ID","System","Record scope","Action","Completed at","Evidence reference","Reviewer"];
      const rowLimit = 100;
      const lines = String(values.records || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const parsed = lines.map((line) => line.split("|").map((cell) => cell.trim()));
      // A row is malformed if it has anything other than exactly one cell per
      // header — too few cells (missing columns) *or* too many (a stray "|"
      // inside a field value, which would otherwise silently shift every
      // later column) — or any of its cells is blank.
      const isIncomplete = (row) => row.length !== headers.length || row.some((cell) => !cell);
      const incomplete = values.required ? parsed.filter(isIncomplete).length : 0;
      const tableRows = parsed.map((row) => headers.map((_, index) => row[index] || "—"));
      const truncated = tableRows.length > rowLimit;
      const list = [];
      if (!lines.length) list.push("Add one record per line and separate fields with |.");
      if (truncated) {
        list.push(
          "Showing the first " + rowLimit + " of " + tableRows.length +
            " records. Copy and download only include what's shown here — split larger logs into multiple exports."
        );
      }
      return {
        result: lines.length + " record" + (lines.length === 1 ? "" : "s") + " mapped",
        caption: values.required ? incomplete + " incomplete row(s)" : headers.length + " tracked fields",
        rows: [["Complete rows", Math.max(0, lines.length - incomplete)], ["Needs review", incomplete], ["Columns", headers.length]],
        table: { headers, rows: tableRows.slice(0, rowLimit) },
        list,
      };
    },
};

export default spec;
