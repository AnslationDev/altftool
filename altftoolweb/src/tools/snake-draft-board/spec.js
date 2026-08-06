// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "snake-draft-board",
  "title": "Snake Draft Board",
  "description": "Run a snake draft with serpentine pick order and live selection tracking.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "players",
      "label": "Players in seed order",
      "type": "textarea",
      "default": "Asha\nBen\nChirag\nDia"
    },
    {
      "key": "rounds",
      "label": "Rounds",
      "type": "number",
      "default": 4,
      "min": 1,
      "max": 50
    },
    {
      "key": "picks",
      "label": "Recorded selections",
      "type": "textarea",
      "default": "Asha | Item 1\nBen | Item 2",
      "hint": "Player | selection"
    }
  ],
  "presets": [
    {
      "label": "Four-player draft",
      "values": {
        "players": "Asha\nBen\nChirag\nDia",
        "rounds": 4,
        "picks": "Asha | Item 1\nBen | Item 2"
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const players = String(values.players || "").split(/\r?\n/).map((x)=>x.trim()).filter(Boolean), rounds = Math.max(1,Math.round(Number(values.rounds)||1));
      const recorded = String(values.picks || "").split(/\r?\n/).map((line)=>line.split("|").map((x)=>x.trim())).filter((row)=>row[0]);
      const order=[]; for(let round=1;round<=rounds;round+=1){ const list=round%2?players:[...players].reverse(); list.forEach((player)=>order.push([order.length+1,round,player,recorded[order.length]?.[1]||"Open",recorded[order.length]?.[0]&&recorded[order.length][0]!==player?"Player mismatch":"Ready"])); }
      return { result: order.length+" total draft slots", caption: recorded.length+" selection(s) entered", table:{headers:["Pick","Round","Player","Selection","Check"],rows:order} };
    },
};

export default spec;
