// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "deliverable-revision-ledger",
  "title": "Deliverable Revision Ledger",
  "description": "Record versions, feedback, approvals and how many included revisions remain.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Business",
    "Productivity"
  ],
  "icon": "history",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "records",
      "label": "Records, one per line",
      "type": "textarea",
      "default": "Landing page | v1 | 2026-07-10 | Client email | Shorter hero copy | Included 1/2 | Pending | msg-104\nLanding page | v2 | 2026-07-14 | Client call | Approved | Included 2/2 | Approved | call-notes-22",
      "hint": "Use | between: Deliverable | Version | Sent at | Feedback source | Requested change | Included / extra | Approval | Evidence ref"
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
        "records": "Landing page | v1 | 2026-07-10 | Client email | Shorter hero copy | Included 1/2 | Pending | msg-104\nLanding page | v2 | 2026-07-14 | Client call | Approved | Included 2/2 | Approved | call-notes-22",
        "complete": true
      }
    }
  ]
},
  compute: (values) => {
      const headers = ["Deliverable","Version","Sent at","Feedback source","Requested change","Included / extra","Approval","Evidence ref"];
      const rows = String(values.records || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const incomplete = rows.filter((row) => row.length < headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      return { result: rows.length + " structured record(s)", caption: values.complete ? incomplete + " incomplete row(s)" : headers.length + " tracked fields", rows: [["Complete", Math.max(0, rows.length - incomplete)], ["Needs review", incomplete], ["Columns", headers.length]], table: { headers, rows: rows.map((row) => headers.map((_, index) => row[index] || "—")).slice(0, 200) } };
    },
};

export default spec;
