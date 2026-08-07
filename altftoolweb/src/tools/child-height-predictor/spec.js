// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "child-height-predictor",
  "title": "Child Height Predictor",
  "description": "Predict a child's adult height from the parents' heights (mid-parental method).",
  "badge": "Health",
  "category": [
    "Health"
  ],
  "icon": "ruler",
  "iconColor": "text-indigo-500",
  "fields": [
    {
      "key": "mother",
      "label": "Mother's height (cm)",
      "type": "number",
      "default": "165"
    },
    {
      "key": "father",
      "label": "Father's height (cm)",
      "type": "number",
      "default": "178"
    },
    {
      "key": "sex",
      "label": "Child's sex",
      "type": "select",
      "default": "male",
      "choices": [
        {
          "value": "male",
          "label": "Boy"
        },
        {
          "value": "female",
          "label": "Girl"
        }
      ]
    }
  ],
  "note": "A statistical estimate (±8.5 cm). Actual height depends on nutrition, health and genetics."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const m = num(values.mother), f = num(values.father);
      if (m <= 0 || f <= 0) return { result: "—", caption: "Enter both parents' heights" };
      const mid = values.sex === "female" ? (m + f - 13) / 2 : (m + f + 13) / 2;
      const totalIn = Math.round(mid / 2.54); const ft = Math.floor(totalIn / 12); const inch = totalIn % 12;
      return { result: mid.toFixed(1) + " cm", caption: "predicted adult height", rows: [["Likely range", (mid - 8.5).toFixed(0) + "–" + (mid + 8.5).toFixed(0) + " cm"], ["In feet", ft + "′" + inch + "″"]] };
    },
};

export default spec;
