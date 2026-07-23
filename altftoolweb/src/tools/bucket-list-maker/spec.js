// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bucket-list-maker",
  "title": "Bucket List Goal Planner",
  "description": "Turn a goal and target date into a plan with a countdown and milestones.",
  "badge": "Lifestyle",
  "category": [
    "Lifestyle"
  ],
  "icon": "map-pin",
  "iconColor": "text-rose-500",
  "fields": [
    {
      "key": "goal",
      "label": "Your goal",
      "type": "text",
      "default": "Visit Japan"
    },
    {
      "key": "target",
      "label": "Target date",
      "type": "date",
      "default": ""
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const goal = (values.goal || "").trim();
      if (!goal) return { result: "—", caption: "Enter a goal" };
      const rows = [];
      let caption = "";
      const t = new Date(values.target);
      if (!isNaN(t)) {
        const days = Math.ceil((t - new Date()) / 86400000);
        caption = days >= 0 ? `${days} days to go` : `${Math.abs(days)} days overdue`;
        rows.push(["Target", t.toLocaleDateString()], ["Countdown", (days >= 0 ? days : 0) + " days"], ["Save per week", "set a small weekly step"]);
      }
      return { result: "🎯 " + goal, caption, rows, list: ["1. Break it into 3 milestones", "2. Set a monthly reminder", "3. Track progress weekly"] };
    },
};

export default spec;
