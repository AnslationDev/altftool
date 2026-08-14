// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "dsar-request-tracker",
  "title": "DSAR Request Tracker",
  "description": "Manage data-access requests with their deadlines, responses and supporting evidence.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Productivity"
  ],
  "icon": "calendar-clock",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "requests",
      "label": "Requests",
      "type": "textarea",
      "default": "DSAR-001 | 2026-07-01 | 30 | In progress | Privacy\nDSAR-002 | 2026-06-01 | 30 | Completed | Privacy",
      "hint": "ID | received date | deadline days | status | owner"
    },
    {
      "key": "as_of",
      "label": "Review date",
      "type": "date",
      "default": "2026-07-24"
    }
  ],
  "presets": [
    {
      "label": "Example queue",
      "values": {
        "requests": "DSAR-001 | 2026-07-01 | 30 | In progress | Privacy\nDSAR-002 | 2026-06-01 | 30 | Completed | Privacy",
        "as_of": "2026-07-24"
      }
    }
  ],
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions."
},
  compute: (values) => {
      const asOf = new Date(values.as_of + "T00:00:00");
      const rows = String(values.requests || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const table = rows.map((row) => {
        const received = new Date((row[1] || "") + "T00:00:00");
        const days = Math.max(1, Number(row[2]) || 30);
        if (Number.isNaN(received.getTime())) {
          return [row[0] || "—", row[1] || "—", "Invalid date", row[3] || "Open", row[4] || "—", "Review date"];
        }
        const due = new Date(received);
        due.setDate(due.getDate() + days);
        const status = row[3] || "Open";
        const remaining = Math.ceil((due - asOf) / 86400000);
        const clock = /complete|closed/i.test(status) ? "Closed" : remaining < 0 ? Math.abs(remaining) + "d overdue" : remaining + "d left";
        return [row[0] || "—", row[1] || "—", due.toISOString().slice(0, 10), status, row[4] || "—", clock];
      });
      const overdue = table.filter((row) => /overdue/.test(row[5])).length;
      return { result: table.length + " request(s) tracked", caption: overdue + " overdue open request(s)", rows: [["Open", table.filter((row) => row[3] !== "Completed").length], ["Overdue", overdue]], table: { headers: ["ID", "Received", "Due", "Status", "Owner", "Clock"], rows: table } };
    },
};

export default spec;
