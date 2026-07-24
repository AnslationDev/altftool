// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "swiss-pairing-engine",
  "title": "Swiss Pairing Engine",
  "description": "Scores se pairings banaye aur rematches avoid kare.",
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
      "label": "Standings",
      "type": "textarea",
      "default": "Asha | 3 | Ben,Dia\nBen | 2 | Asha\nChirag | 2 | Dia\nDia | 1 | Asha,Chirag\nEli | 1 |\nFaye | 0 |",
      "hint": "Player | score | previous opponents comma-separated"
    },
    {
      "key": "round",
      "label": "Round",
      "type": "number",
      "default": 4,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Six-player round",
      "values": {
        "players": "Asha | 3 | Ben,Dia\nBen | 2 | Asha\nChirag | 2 | Dia\nDia | 1 | Asha,Chirag\nEli | 1 |\nFaye | 0 |",
        "round": 4
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const players=String(values.players||"").split(/\r?\n/).map((line)=>{const [name,score,old]=line.split("|").map((x)=>x.trim());return {name,score:Number(score)||0,old:new Set(String(old||"").split(",").map((x)=>x.trim()).filter(Boolean))};}).filter((x)=>x.name).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)), rows=[], pool=[...players];
      while(pool.length>1){const a=pool.shift();let index=pool.findIndex((b)=>!a.old.has(b.name));if(index<0)index=0;const b=pool.splice(index,1)[0];rows.push([a.name,a.score,b.name,b.score,a.old.has(b.name)?"Rematch unavoidable":"No prior match"]);}if(pool.length)rows.push([pool[0].name,pool[0].score,"BYE","—","Unpaired"]);
      return {result:rows.length+" pairing(s) for round "+values.round,caption:"Score-adjacent greedy pairing",table:{headers:["Player A","Score","Player B","Score","Check"],rows}};
    },
};

export default spec;
