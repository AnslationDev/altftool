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
      "default": "6",
      "min": 2,
      "max": 1000,
      "step": 1
    },
    {
      "key": "count",
      "label": "How many",
      "type": "number",
      "default": "2",
      "min": 1,
      "max": 10,
      "step": 1
    }
  ],
  "regenerate": true
},
  compute: (values, _mode, random) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const c = num(values.count); const s = num(values.sides); if (!Number.isInteger(c) || c < 1 || c > 10) return { result: "", error: "How many must be a whole number from 1 to 10." }; if (!Number.isInteger(s) || s < 2 || s > 1000) return { result: "", error: "Sides must be a whole number from 2 to 1000." }; const r = Array.from({ length: c }, () => 1 + Math.floor(random() * s)); return { result: r.join(" + ") + " = " + r.reduce((a, b) => a + b, 0) }; },
};

export default spec;
