// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "hourly-to-salary-calculator",
  "title": "Hourly to Salary Calculator",
  "description": "Convert hourly wage to annual salary based on hours worked per year.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "calculator",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "hourlywage",
      "label": "Hourly Wage",
      "type": "number",
      "default": "50",
      "suffix": "$"
    },
    {
      "key": "hoursperweek",
      "label": "Hours Per Week",
      "type": "number",
      "default": "40"
    },
    {
      "key": "weeksperyear",
      "label": "Weeks Per Year",
      "type": "number",
      "default": "52"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "hourlyWage": "50",
        "hoursPerWeek": "40",
        "weeksPerYear": "52"
      }
    }
  ],
  "note": "This calculator assumes standard work hours and does not account for overtime or taxes."
},
  compute: (values, mode) => { let hourlyWage = values.hourlyWage || 0; let hoursPerWeek = values.hoursPerWeek || 0; let weeksPerYear = values.weeksPerYear || 0; if (hoursPerWeek === 0 || weeksPerYear === 0) return { result: 'Please enter valid hours per week and weeks per year.' }; let annualSalary = hourlyWage * hoursPerWeek * weeksPerYear; return { result: '$' + annualSalary.toFixed(2), caption: 'Annual Salary', rows: [['Hourly Wage', values.hourlyWage + '$'], ['Hours Per Week', values.hoursPerWeek], ['Weeks Per Year', values.weeksPerYear]] }; },
};

export default spec;
