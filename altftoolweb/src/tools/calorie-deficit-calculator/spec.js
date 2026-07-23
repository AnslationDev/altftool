// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "calorie-deficit-calculator",
  "title": "Calorie Deficit Calculator",
  "description": "The daily calorie deficit needed to reach a goal weight by a target date.",
  "badge": "Fitness",
  "category": [
    "Fitness"
  ],
  "icon": "trending-down",
  "iconColor": "text-lime-600",
  "fields": [
    {
      "key": "current_weight",
      "label": "Current weight (kg)",
      "type": "number",
      "default": "80"
    },
    {
      "key": "goal_weight",
      "label": "Goal weight (kg)",
      "type": "number",
      "default": "72"
    },
    {
      "key": "weeks",
      "label": "Weeks to goal",
      "type": "number",
      "default": "12"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const lose = num(values.current_weight) - num(values.goal_weight);
      if (lose <= 0) return { result: "—", caption: "Goal should be below current weight" };
      if (num(values.weeks) <= 0) return { result: "—", caption: "Enter a number of weeks" };
      const dailyDeficit = (lose * 7700) / (num(values.weeks) * 7);
      return { result: Math.round(dailyDeficit).toLocaleString() + " kcal/day deficit", caption: `to lose ${lose} kg in ${num(values.weeks)} weeks`, rows: [["Weekly loss", (lose / num(values.weeks)).toFixed(2) + " kg"], ["Total to lose", lose.toFixed(1) + " kg"]] };
    },
};

export default spec;
