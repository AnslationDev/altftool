// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "blood-alcohol-content-calculator",
  "title": "Blood Alcohol Content Calculator",
  "description": "Estimate BAC from standard drinks using the Widmark formula. For education only.",
  "badge": "Health",
  "category": [
    "Health"
  ],
  "icon": "wine",
  "iconColor": "text-rose-600",
  "fields": [
    {
      "key": "drinks",
      "label": "Standard drinks",
      "type": "number",
      "default": "3"
    },
    {
      "key": "weight",
      "label": "Body weight (kg)",
      "type": "number",
      "default": "70"
    },
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
      "key": "hours",
      "label": "Hours since first drink",
      "type": "number",
      "default": "2",
      "min": 0
    }
  ],
  "note": "An estimate only — never use it to decide whether to drive."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v);
      if (num(values.weight) <= 0 || num(values.drinks) < 0 || num(values.hours) < 0) return { result: "—", caption: "Enter a valid weight, number of drinks and hours" }; const grams = num(values.drinks) * 14;
      const r = values.sex === "female" ? 0.55 : 0.68;
      const eliminatedPct = 0.015 * num(values.hours);
      const bac = Number(Math.max(0, (grams / (num(values.weight) * 1000 * r)) * 100 - eliminatedPct).toFixed(3));
      const burnedGrams = (eliminatedPct * num(values.weight) * 1000 * r) / 100;
      return { result: bac.toFixed(3) + "% BAC", caption: bac >= 0.08 ? "Over the common 0.08% legal limit" : "Under 0.08%", rows: [["Alcohol consumed", grams.toFixed(0) + " g"], ["Approx. burned off", burnedGrams.toFixed(1) + " g"]] };
    },
};

export default spec;
