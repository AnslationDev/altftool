// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "days-between-dates-calculator",
  "title": "Days Between Dates Calculator",
  "description": "Calculate the number of days between two dates.",
  "badge": "Calculator",
  "category": [
    "Calculator"
  ],
  "icon": "calendar",
  "iconColor": "text-amber-600",
  "fields": [
    {
      "key": "startdate",
      "label": "Start Date",
      "type": "date",
      "default": ""
    },
    {
      "key": "enddate",
      "label": "End Date",
      "type": "date",
      "default": ""
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "startDate": "2023-01-01",
        "endDate": "2023-01-15"
      }
    }
  ],
  "note": "This tool calculates the number of full days between two dates."
},
  compute: (values, mode) => { let startDate = new Date(values.startDate), endDate = new Date(values.endDate); if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return { result: 'Invalid date(s)' }; let diffTime = Math.abs(endDate - startDate); let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); return { result: `${diffDays} days` }; },
};

export default spec;
