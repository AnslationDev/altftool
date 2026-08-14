// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "data-retention-schedule-builder",
  "title": "Data Retention Schedule Builder",
  "description": "Define review and deletion periods for each of your data categories.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "table-properties",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records (one per line)",
      "type": "textarea",
      "default": "Support tickets | Customer service | Helpdesk | 24 months | Ticket closed | Hard delete | Support\nFailed applicants | Recruitment | ATS | 12 months | Decision date | Vendor deletion | People",
      "hint": "Use | between: Data category | Purpose | System | Retention period | Trigger | Deletion method | Owner"
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
        "records": "Support tickets | Customer service | Helpdesk | 24 months | Ticket closed | Hard delete | Support\nFailed applicants | Recruitment | ATS | 12 months | Decision date | Vendor deletion | People",
        "required": true
      }
    }
  ],
  "outputLabel": "Structured inventory"
},
  compute: (values) => {
      const headers = ["Data category","Purpose","System","Retention period","Trigger","Deletion method","Owner"];
      const rowLimit = 100;
      const lines = String(values.records || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const parsed = lines.map((line) => line.split("|").map((cell) => cell.trim()));
      const incomplete = parsed.filter((row) => row.length < headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      const tableRows = parsed.map((row) => headers.map((_, index) => row[index] || "—"));
      const truncated = tableRows.length > rowLimit;
      const list = lines.length ? [] : ["Add one record per line and separate fields with |."];
      if (truncated) {
        list.push(
          "Showing the first " + rowLimit + " of " + tableRows.length +
            " records. Copy and download only include what's shown here — split larger schedules into multiple exports."
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
