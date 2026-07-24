// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "family-emergency-contact-tree",
  "title": "Family Emergency Contact Tree",
  "description": "Contact priority, responsibilities aur offline printable tree banaye.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Lifestyle",
    "Productivity"
  ],
  "icon": "network",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records (one per line)",
      "type": "textarea",
      "default": "1 | Asha | Family coordinator | Saved mobile | Neighbour | Account for everyone | Printed copy in kitchen\n2 | Dr Rao | Clinician | Clinic number | Patient portal | Medication advice | Medication list attached",
      "hint": "Use | between: Priority | Person / service | Relationship / role | Primary contact | Backup contact | Responsibility | Offline note"
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
        "records": "1 | Asha | Family coordinator | Saved mobile | Neighbour | Account for everyone | Printed copy in kitchen\n2 | Dr Rao | Clinician | Clinic number | Patient portal | Medication advice | Medication list attached",
        "required": true
      }
    }
  ],
  "outputLabel": "Structured inventory",
  "note": "Keep printed/offline copies where appropriate and review regularly. Do not include secrets, passwords, or unnecessary sensitive details in a shared contact tree."
},
  compute: (values) => {
      const headers = ["Priority","Person / service","Relationship / role","Primary contact","Backup contact","Responsibility","Offline note"];
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
