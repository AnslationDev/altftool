// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "hourly-to-salary-calculator",
  "title": "Hourly to Salary Calculator",
  "description": "Convert an hourly wage into daily, weekly, monthly and yearly pay.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "banknote",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "rate",
      "label": "Hourly rate",
      "type": "number",
      "default": "25"
    },
    {
      "key": "hours",
      "label": "Hours per week",
      "type": "number",
      "default": "40"
    },
    {
      "key": "weeks",
      "label": "Weeks per year",
      "type": "number",
      "default": "52"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const weekly = num(values.rate) * num(values.hours);
      const annual = weekly * num(values.weeks);
      return { result: money(annual) + " / year", rows: [["Monthly", money(annual / 12)], ["Weekly", money(weekly)], ["Daily", money(num(values.rate) * (num(values.hours) / 5))]] };
    },
};

export default spec;
