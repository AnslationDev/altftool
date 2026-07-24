// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "data-deletion-proof-log",
  "title": "Data Deletion Proof Log",
  "description": "Deletion requests aur system-wise completion evidence record kare.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Productivity"
  ],
  "icon": "file-check-2",
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
  "outputLabel": "Structured inventory"
},
  compute: (values) => {
      const headers = ["Request ID","System","Record scope","Action","Completed at","Evidence reference","Reviewer"];
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
