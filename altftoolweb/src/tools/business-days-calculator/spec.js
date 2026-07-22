// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "business-days-calculator",
  "title": "Business Days Calculator",
  "description": "Calculate the number of business days between two dates.",
  "badge": "Calculator",
  "category": [
    "Calculator"
  ],
  "icon": "calendar",
  "iconColor": "text-indigo-600",
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
        "startDate": "2023-10-01",
        "endDate": "2023-10-10"
      }
    }
  ],
  "note": "Weekends (Saturday and Sunday) are excluded from the calculation."
},
  compute: (values, mode) => { const startDate = new Date(values.startDate); const endDate = new Date(values.endDate); if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return { result: 'Invalid date' }; let businessDays = 0; while (startDate <= endDate) { if (startDate.getDay() !== 6 && startDate.getDay() !== 0) businessDays++; startDate.setDate(startDate.getDate() + 1); } return { result: `${businessDays} business days` }; },
};

export default spec;
