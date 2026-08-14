// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "breach-notification-timeline-planner",
  "title": "Breach Notification Timeline Planner",
  "description": "Map the review and notification milestones required from the date a breach is discovered.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Productivity"
  ],
  "icon": "clock-alert",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "discovered",
      "label": "Incident discovery",
      "type": "date",
      "default": "2026-07-24"
    },
    {
      "key": "authority_hours",
      "label": "Authority review target (hours)",
      "type": "number",
      "default": 72,
      "min": 1
    },
    {
      "key": "people_hours",
      "label": "Affected-person review target (hours)",
      "type": "number",
      "default": 96,
      "min": 1
    },
    {
      "key": "jurisdiction",
      "label": "Jurisdiction / policy",
      "type": "text",
      "default": "Internal incident response policy"
    }
  ],
  "presets": [
    {
      "label": "72-hour review",
      "values": {
        "discovered": "2026-07-24",
        "authority_hours": 72,
        "people_hours": 96,
        "jurisdiction": "Selected policy"
      }
    }
  ],
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions."
},
  compute: (values) => {
      const start = new Date(values.discovered + "T09:00:00");
      const add = (hours) => new Date(start.getTime() + Math.max(1, Number(hours) || 1) * 3600000);
      const authority = add(values.authority_hours);
      const people = add(values.people_hours);
      const format = (date) => date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
      return { result: "Timeline starts " + format(start), caption: values.jurisdiction, table: { headers: ["Milestone", "Target"], rows: [["Preserve evidence and contain", format(add(4))], ["Initial scope and risk review", format(add(12))], ["Legal / authority decision", format(authority)], ["Affected-person decision", format(people)], ["Post-incident review", format(add(168))]] }, list: ["Document when awareness occurred", "Keep decision evidence even when notification is not required", "Confirm the current law and regulator guidance"] };
    },
};

export default spec;
