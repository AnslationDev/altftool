// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "days-between-dates-calculator",
  "title": "Days Between Dates Calculator",
  "description": "Count the days, weeks and months between any two dates.",
  "badge": "Calculator",
  "category": [
    "Calculator"
  ],
  "icon": "calendar-range",
  "iconColor": "text-[var(--primary)]",
  "fields": [
    {
      "key": "start",
      "label": "Start date",
      "type": "date",
      "default": ""
    },
    {
      "key": "end",
      "label": "End date",
      "type": "date",
      "default": ""
    }
  ],
  "presets": [
    {
      "label": "This year",
      "values": {
        "start": "2026-01-01",
        "end": "2026-12-31"
      }
    }
  ]
},
  compute: (values) => {
      const a = new Date(values.start), b = new Date(values.end);
      if (isNaN(a) || isNaN(b)) return { result: "—", caption: "Pick both dates" };
      const days = Math.round((b - a) / 86400000);
      const abs = Math.abs(days);
      return { result: abs.toLocaleString() + " days", caption: days < 0 ? "end is before start" : `${Math.floor(abs / 7)} weeks ${abs % 7} days`, rows: [["Weeks", (abs / 7).toFixed(1)], ["Months", (abs / 30.44).toFixed(1)], ["Years", (abs / 365.25).toFixed(2)]] };
    },
};

export default spec;
