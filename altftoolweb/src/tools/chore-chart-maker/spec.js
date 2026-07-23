// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "chore-chart-maker",
  "title": "Chore Chart Maker",
  "description": "Fairly assign a list of chores across people, round-robin.",
  "badge": "Productivity",
  "category": [
    "Productivity"
  ],
  "icon": "list-checks",
  "iconColor": "text-teal-600",
  "fields": [
    {
      "key": "chores",
      "label": "Chores (one per line)",
      "type": "textarea",
      "default": "Dishes\nVacuum\nTrash\nLaundry\nBathroom\nGroceries"
    },
    {
      "key": "people",
      "label": "People (one per line)",
      "type": "textarea",
      "default": "Alex\nSam\nJordan"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const chores = String(values.chores).split("\n").map((l) => l.trim()).filter(Boolean);
      const people = String(values.people).split("\n").map((l) => l.trim()).filter(Boolean);
      if (!chores.length || !people.length) return { result: "—", caption: "Add chores and people" };
      const rows = chores.map((c, i) => [c, people[i % people.length]]);
      return { result: `${chores.length} chores across ${people.length} people`, table: { headers: ["Chore", "Assigned to"], rows } };
    },
};

export default spec;
