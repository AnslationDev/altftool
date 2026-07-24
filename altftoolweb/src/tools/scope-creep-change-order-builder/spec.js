// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "scope-creep-change-order-builder",
  "title": "Scope-Creep Change-Order Builder",
  "description": "Original scope aur new request ka price/deadline delta banaye.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Business",
    "Productivity"
  ],
  "icon": "file-plus-2",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "project",
      "label": "Project",
      "type": "text",
      "default": "Website launch"
    },
    {
      "key": "original",
      "label": "Original included scope",
      "type": "textarea",
      "default": "Five pages, one revision round, delivery by 2026-08-15."
    },
    {
      "key": "request",
      "label": "New request",
      "type": "textarea",
      "default": "Add three landing pages and a second revision round."
    },
    {
      "key": "hours",
      "label": "Additional hours",
      "type": "number",
      "default": 18,
      "min": 0
    },
    {
      "key": "rate",
      "label": "Hourly / blended rate",
      "type": "number",
      "default": 1500,
      "min": 0
    },
    {
      "key": "expenses",
      "label": "Additional expenses",
      "type": "number",
      "default": 3000,
      "min": 0
    },
    {
      "key": "days",
      "label": "Deadline extension (days)",
      "type": "number",
      "default": 7,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Extra pages",
      "values": {
        "project": "Website launch",
        "original": "Five pages, one revision.",
        "request": "Three extra pages and another revision.",
        "hours": 18,
        "rate": 1500,
        "expenses": 3000,
        "days": 7
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const labour = Math.max(0, Number(values.hours) || 0) * Math.max(0, Number(values.rate) || 0), expenses = Math.max(0, Number(values.expenses) || 0), total = labour + expenses;
      return { result: total.toFixed(2) + " change-order value", caption: Math.max(0, Number(values.days) || 0) + " calendar-day extension", rows: [["Project", values.project], ["Additional labour", labour.toFixed(2)], ["Expenses", expenses.toFixed(2)], ["Additional hours", values.hours], ["Extension", values.days + " days"]], list: ["Original scope: " + values.original, "Requested change: " + values.request, "Acceptance: confirm price, schedule, dependencies, revision count, and authorized approver before work starts."] };
    },
};

export default spec;
