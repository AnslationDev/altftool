// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bmr-calculator",
  "title": "BMR Calculator",
  "description": "Calculate your Basal Metabolic Rate (BMR) to understand how many calories your body burns at rest.",
  "badge": "Health",
  "category": [
    "Health"
  ],
  "icon": "calculator",
  "iconColor": "text-rose-600",
  "fields": [
    {
      "key": "age",
      "label": "Age",
      "type": "number",
      "default": "30"
    },
    {
      "key": "weight",
      "label": "Weight",
      "type": "number",
      "default": "150",
      "suffix": "lbs"
    },
    {
      "key": "height",
      "label": "Height",
      "type": "number",
      "default": "60",
      "suffix": "in"
    },
    {
      "key": "gender",
      "label": "Gender",
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
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "age": "30",
        "weight": "150",
        "height": "60",
        "gender": "male"
      }
    }
  ],
  "note": "BMR is an estimate and can vary based on individual factors."
},
  compute: (values, mode) => { const { age, weight, height, gender } = values; let bmr; if (gender === 'male') { bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age); } else { bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age); } return { result: `${Math.round(bmr)} calories/day`, caption: 'Your Basal Metabolic Rate (BMR) is the number of calories your body burns at rest.', rows: [['Age', age], ['Weight', weight + ' lbs'], ['Height', height + ' in'], ['Gender', gender]] }; },
};

export default spec;
