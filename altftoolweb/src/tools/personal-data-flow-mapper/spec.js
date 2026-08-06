// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "personal-data-flow-mapper",
  "title": "Personal Data Flow Mapper",
  "description": "Diagram how personal data flows from collection through storage and processors to deletion.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Business"
  ],
  "icon": "workflow",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records (one per line)",
      "type": "textarea",
      "default": "1 | Signup form | Email | Create account | Identity service | Account life + 30d | TLS and role access\n2 | Identity service | User ID | Product access | App database | Account life | Pseudonymous key",
      "hint": "Use | between: Step | Source | Data | Purpose | Destination | Retention / deletion | Control"
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
        "records": "1 | Signup form | Email | Create account | Identity service | Account life + 30d | TLS and role access\n2 | Identity service | User ID | Product access | App database | Account life | Pseudonymous key",
        "required": true
      }
    }
  ],
  "outputLabel": "Structured inventory"
},
  compute: (values) => {
      const headers = ["Step","Source","Data","Purpose","Destination","Retention / deletion","Control"];
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
