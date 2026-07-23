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
      "default": "2"
    }
  ],
  "note": "An estimate only — never use it to decide whether to drive."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      if (num(values.weight) <= 0 || num(values.drinks) < 0) return { result: "—", caption: "Enter a valid weight and number of drinks" }; const grams = num(values.drinks) * 14;
      const r = values.sex === "female" ? 0.55 : 0.68;
      const bac = Math.max(0, (grams / (num(values.weight) * 1000 * r)) * 100 - 0.015 * num(values.hours));
      return { result: bac.toFixed(3) + "% BAC", caption: bac >= 0.08 ? "Over the common 0.08% legal limit" : "Under 0.08%", rows: [["Alcohol consumed", grams.toFixed(0) + " g"], ["Approx. burned off", (0.015 * num(values.hours) * 100).toFixed(1) + " units"]] };
    },
};

export default spec;
