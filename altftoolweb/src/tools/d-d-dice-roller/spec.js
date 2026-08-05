// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "d-d-dice-roller",
  "title": "D&D Dice Roller",
  "description": "Roll one or more virtual D&D dice, choose the number of sides, and total every result instantly.",
  "badge": "Game",
  "category": [
    "Game"
  ],
  "icon": "shuffle",
  "iconColor": "text-fuchsia-600",
  "fields": [
    {
      "key": "sides",
      "label": "Sides",
      "type": "number",
      "default": "6"
    },
    {
      "key": "count",
      "label": "How many",
      "type": "number",
      "default": "2"
    }
  ],
  "regenerate": true
},
  compute: (values, _mode, random) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const c = Math.max(1, Math.min(10, num(values.count))); const s = Math.max(2, num(values.sides)); const r = Array.from({ length: c }, () => 1 + Math.floor(random() * s)); return { result: r.join(" + ") + " = " + r.reduce((a, b) => a + b, 0) }; },
};

export default spec;
