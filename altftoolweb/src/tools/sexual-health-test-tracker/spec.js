// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "sexual-health-test-tracker",
  "title": "Sexual Health Test Tracker",
  "description": "Keep test dates, results and retest reminders in one private place.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Health & Wellness",
    "Productivity"
  ],
  "icon": "shield-plus",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "tests",
      "label": "Private test records",
      "type": "textarea",
      "default": "HIV screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal\nSyphilis screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal",
      "hint": "Test | date | result / status | next review date | private reference"
    },
    {
      "key": "as_of",
      "label": "Review date",
      "type": "date",
      "default": "2026-07-24"
    },
    {
      "key": "warn_days",
      "label": "Reminder window (days)",
      "type": "number",
      "default": 30,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Private example",
      "values": {
        "tests": "HIV screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal\nSyphilis screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal",
        "as_of": "2026-07-24",
        "warn_days": 30
      }
    }
  ],
  "note": "Private reminder organizer, not medical interpretation. Testing type, timing, window periods, exposure-specific prophylaxis, vaccination, and follow-up require a qualified clinician; urgent exposures may be time-sensitive."
},
  compute: (values) => {
      const asOf = new Date(values.as_of + "T00:00:00");
      const warning = Math.max(1, Number(values.warn_days) || 30);
      const rows = String(values.tests || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [test = "Test", date = "", result = "", next = "", reference = ""] = line.split("|").map((cell) => cell.trim());
        const nextDate = new Date(next + "T00:00:00");
        const days = Math.ceil((nextDate - asOf) / 86400000);
        const status = Number.isNaN(days) ? "Review date" : days < 0 ? Math.abs(days) + "d overdue" : days <= warning ? days + "d · upcoming" : days + "d";
        return [test, date || "—", result || "—", next || "—", status, reference || "—"];
      });
      const due = rows.filter((row) => /overdue|upcoming|Review/.test(row[4])).length;
      return { result: rows.length + " private record(s)", caption: due + " reminder(s) need review", rows: [["Records", rows.length], ["Reminder window", warning + " days"], ["Needs review", due]], table: { headers: ["Test", "Date", "Entered result", "Next review", "Reminder", "Reference"], rows } };
    },
};

export default spec;
