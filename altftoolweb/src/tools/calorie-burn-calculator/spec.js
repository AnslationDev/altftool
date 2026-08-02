// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "calorie-burn-calculator",
  "title": "Calorie Burn Calculator",
  "description": "Estimate calories burned for an activity using MET values, weight and time.",
  "badge": "Fitness",
  "category": [
    "Fitness"
  ],
  "icon": "activity",
  "iconColor": "text-orange-600",
  "fields": [
    {
      "key": "activity",
      "label": "Activity",
      "type": "select",
      "default": "5",
      "choices": [
        {
          "value": "3.5",
          "label": "Walking (brisk)"
        },
        {
          "value": "8",
          "label": "Running"
        },
        {
          "value": "7.5",
          "label": "Cycling"
        },
        {
          "value": "6",
          "label": "Swimming"
        },
        {
          "value": "5",
          "label": "Weight training"
        },
        {
          "value": "8.5",
          "label": "Jump rope"
        }
      ]
    },
    {
      "key": "weight",
      "label": "Weight (kg)",
      "type": "number",
      "default": "70"
    },
    {
      "key": "minutes",
      "label": "Duration (minutes)",
      "type": "number",
      "default": "30"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const met = num(values.activity);
      const perMinuteCals = (met * 3.5 * num(values.weight)) / 200;
      const cals = perMinuteCals * num(values.minutes);
      return { result: Math.round(cals).toLocaleString() + " kcal", rows: [["Per minute", perMinuteCals.toFixed(1) + " kcal"], ["Per hour", Math.round(perMinuteCals * 60).toLocaleString() + " kcal"]] };
    },
};

export default spec;
