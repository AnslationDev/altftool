// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "age-in-days-calculator",
  "title": "Age in Days Calculator",
  "description": "Calculate the age of something in days based on its creation date.",
  "badge": "Calculator",
  "category": [
    "Calculator"
  ],
  "icon": "calendar",
  "iconColor": "text-rose-600",
  "fields": [
    {
      "key": "creationdate",
      "label": "Creation Date",
      "type": "date",
      "default": "2023-01-01"
    },
    {
      "key": "currentdate",
      "label": "Current Date",
      "type": "date",
      "default": "today"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "creationDate": "2023-01-01"
      }
    }
  ],
  "note": "Ensure both dates are valid and in the correct format."
},
  compute: (values, mode) => { const creation = new Date(values.creationDate); const current = new Date(values.currentDate); if (isNaN(creation.getTime()) || isNaN(current.getTime())) return { result: 'Invalid date(s)' }; const diffTime = Math.abs(current - creation); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); return { result: `${diffDays} days`, caption: `The age of the item from its creation date to the current date is ${diffDays} days.` }; },
};

export default spec;
