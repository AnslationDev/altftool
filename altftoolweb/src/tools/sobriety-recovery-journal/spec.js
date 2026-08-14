// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "sobriety-recovery-journal",
  "title": "Sobriety Recovery Journal",
  "description": "Privately track sober days, urges, triggers and the coping wins in between.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Health & Wellness",
    "Productivity"
  ],
  "icon": "calendar-heart",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "entries",
      "label": "Private journal entries",
      "type": "textarea",
      "default": "2026-07-22 | 4 | Stress after work | Walked and called a friend | Stayed sober\n2026-07-23 | 2 | Social invitation | Chose alcohol-free option | Left early and rested\n2026-07-24 | 3 | Poor sleep | Ate, hydrated, attended meeting | Asked for support",
      "hint": "Date | urge 0–10 | trigger | coping response | win / note"
    },
    {
      "key": "start",
      "label": "Recovery start date",
      "type": "date",
      "default": "2026-07-01"
    }
  ],
  "presets": [
    {
      "label": "Three private entries",
      "values": {
        "entries": "2026-07-22 | 4 | Stress | Walked and called a friend | Stayed sober\n2026-07-23 | 2 | Social invitation | Alcohol-free option | Left early",
        "start": "2026-07-01"
      }
    }
  ],
  "note": "Private reflection aid, not addiction treatment or a safety monitor. A setback is information, not failure; seek qualified and trusted support for withdrawal risk, emergencies, or treatment decisions."
},
  compute: (values) => {
      const rows = String(values.entries || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const urges = rows.map((row) => Math.max(0, Math.min(10, Number(row[1]) || 0)));
      const average = urges.length ? urges.reduce((sum, value) => sum + value, 0) / urges.length : 0;
      const today = new Date();
      const start = new Date(values.start + "T00:00:00");
      const days = Number.isNaN(start.getTime()) ? 0 : Math.max(0, Math.floor((today - start) / 86400000));
      const triggers = new Map();
      for (const row of rows) if (row[2]) triggers.set(row[2], (triggers.get(row[2]) || 0) + 1);
      const common = [...triggers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      return { result: days + " day(s) since selected start", caption: rows.length + " journal entries · average urge " + average.toFixed(1) + "/10", rows: [["Entries", rows.length], ["Average urge", average.toFixed(1)], ["Highest urge", urges.length ? Math.max(...urges) : 0], ["Distinct triggers", triggers.size]], table: { headers: ["Trigger", "Times noted"], rows: common }, list: rows.slice(-5).map((row) => (row[0] || "Date") + ": " + (row[4] || row[3] || "Reflection recorded")) };
    },
};

export default spec;
