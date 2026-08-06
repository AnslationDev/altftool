// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ropa-builder",
  "title": "ROPA Builder",
  "description": "Build a structured register of your personal-data processing activities.",
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
      "default": "Customer support | Resolve tickets | Contact and message data | Customers | Helpdesk vendor | 24 months | Role access\nPayroll | Pay employees | Identity and bank data | Staff | Payroll processor | 8 years | Encryption",
      "hint": "Use | between: Activity | Purpose | Data categories | People | Processor | Retention | Safeguards"
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
        "records": "Customer support | Resolve tickets | Contact and message data | Customers | Helpdesk vendor | 24 months | Role access\nPayroll | Pay employees | Identity and bank data | Staff | Payroll processor | 8 years | Encryption",
        "required": true
      }
    }
  ],
  "outputLabel": "Structured inventory",
  "note": "This creates a working ROPA inventory, not a legal filing. Validate lawful basis, transfers, retention, and jurisdiction-specific fields."
},
  compute: (values) => {
      const headers = ["Activity","Purpose","Data categories","People","Processor","Retention","Safeguards"];
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
            " records. Copy and download only include what's shown here — split larger registers into multiple exports."
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
