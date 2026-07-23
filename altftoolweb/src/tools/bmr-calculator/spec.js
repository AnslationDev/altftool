// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bmr-calculator",
  "title": "BMR Calculator",
  "description": "Basal metabolic rate (calories at rest) via the Mifflin-St Jeor equation, plus daily needs.",
  "badge": "Health",
  "category": [
    "Health"
  ],
  "icon": "flame",
  "iconColor": "text-orange-600",
  "fields": [
    {
      "key": "sex",
      "label": "Sex",
      "type": "select",
      "default": "male",
      "choices": [
        {
          "value": "male",
          "label": "Male"
        },
        {
          "value": "female",
          "label": "Female"
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
      "key": "height",
      "label": "Height (cm)",
      "type": "number",
      "default": "175"
    },
    {
      "key": "age",
      "label": "Age",
      "type": "number",
      "default": "30"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const bmr = 10 * num(values.weight) + 6.25 * num(values.height) - 5 * num(values.age) + (values.sex === "female" ? -161 : 5);
      return { result: Math.round(bmr).toLocaleString() + " kcal/day", caption: "at complete rest", rows: [["Sedentary", Math.round(bmr * 1.2).toLocaleString()], ["Lightly active", Math.round(bmr * 1.375).toLocaleString()], ["Active", Math.round(bmr * 1.55).toLocaleString()], ["Very active", Math.round(bmr * 1.725).toLocaleString()]] };
    },
};

export default spec;
