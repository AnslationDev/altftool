// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "personal-data-flow-mapper",
  "title": "Personal Data Flow Mapper",
  "description": "Build a structured table of how personal data flows from collection through storage and processors to deletion.",
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
  "outputLabel": "Structured inventory",
  "confirmReset": "Reset and replace the pasted data-flow inventory with the example data? This cannot be undone."
},
  compute: (values) => {
      const headers = ["Step","Source","Data","Purpose","Destination","Retention / deletion","Control"];
      const rowLimit = 100;
      const lines = String(values.records || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const parsed = lines.map((line) => line.split("|").map((cell) => cell.trim()));
      // A row is incomplete if it has too few segments (missing trailing
      // fields), too many segments (an extra "|" somewhere upstream of the
      // expected column count), or any blank cell among the expected columns.
      const incomplete = parsed.filter((row) => row.length !== headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      const tableRows = parsed.map((row) => {
        if (row.length <= headers.length) return headers.map((_, index) => row[index] || "—");
        // More segments than expected columns: keep the leading columns
        // positional and fold every extra trailing segment into the last
        // column instead of silently dropping it.
        const lastIndex = headers.length - 1;
        const merged = [...row.slice(0, lastIndex), row.slice(lastIndex).join(" | ")];
        return headers.map((_, index) => merged[index] || "—");
      });
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
        caption: values.required ? incomplete + " incomplete row(s)" : headers.length + " tracked fields",
        rows: values.required
          ? [["Complete rows", Math.max(0, lines.length - incomplete)], ["Needs review", incomplete], ["Columns", headers.length]]
          : [["Records", lines.length], ["Columns", headers.length]],
        table: { headers, rows: tableRows.slice(0, rowLimit) },
        list,
      };
    },
};

export default spec;
