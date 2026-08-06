// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "creator-contract-rights-timeline",
  "title": "Creator Contract Rights Timeline",
  "description": "Extract usage, exclusivity, whitelisting and renewal dates from a creator contract.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Business",
    "Text & Writing"
  ],
  "icon": "calendar-range",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "terms",
      "label": "Contract rights and dates",
      "type": "textarea",
      "default": "Campaign starts 2026-08-01 and ends 2026-08-31. Brand may use the content in paid social for 90 days. Category exclusivity lasts 60 days after posting. Renewal option requires written agreement 15 days before expiry."
    },
    {
      "key": "anchor",
      "label": "Posting / effective date",
      "type": "date",
      "default": "2026-08-15"
    },
    {
      "key": "usage_days",
      "label": "Usage duration (days)",
      "type": "number",
      "default": 90,
      "min": 0
    },
    {
      "key": "exclusive_days",
      "label": "Exclusivity duration (days)",
      "type": "number",
      "default": 60,
      "min": 0
    },
    {
      "key": "notice_days",
      "label": "Renewal notice before expiry (days)",
      "type": "number",
      "default": 15,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "90-day usage",
      "values": {
        "terms": "Paid social usage for 90 days; category exclusivity for 60 days.",
        "anchor": "2026-08-15",
        "usage_days": 90,
        "exclusive_days": 60,
        "notice_days": 15
      }
    }
  ],
  "note": "Timeline organizer only, not contract interpretation or legal advice. The signed wording controls; review territory, media, sublicensing, edits, AI use, name/likeness, termination, morality, indemnity, and payment."
},
  compute: (values) => {
      const anchor = new Date(values.anchor + "T00:00:00");
      const add = (days) => { const date = new Date(anchor); date.setDate(date.getDate() + Math.max(0, Number(days) || 0)); return date; };
      const usageEnd = add(values.usage_days), exclusiveEnd = add(values.exclusive_days), notice = new Date(usageEnd); notice.setDate(notice.getDate() - Math.max(0, Number(values.notice_days) || 0));
      const format = (date) => Number.isNaN(date.getTime()) ? "Invalid date" : date.toISOString().slice(0, 10);
      const text = String(values.terms || "").toLowerCase();
      const signals = [["Paid usage", /paid|whitelist|boost/.test(text)], ["Exclusivity", /exclusiv|competitor/.test(text)], ["Renewal", /renew|extend/.test(text)], ["Territory", /territory|worldwide|country/.test(text)], ["Edits / derivatives", /edit|derivative|modify/.test(text)]];
      return { result: "Rights timeline from " + format(anchor), caption: signals.filter((row) => row[1]).length + " clause signal(s) found", rows: [["Usage end", format(usageEnd)], ["Exclusivity end", format(exclusiveEnd)], ["Renewal review", format(notice)]], table: { headers: ["Clause signal", "Mentioned"], rows: signals.map((row) => [row[0], row[1] ? "Yes" : "Not found"]) } };
    },
};

export default spec;
