// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ranked-choice-vote-tabulator",
  "title": "Ranked-Choice Vote Tabulator",
  "description": "Tabulate ranked-choice voting with every instant-runoff round shown.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "ballots",
      "label": "Ranked ballots",
      "type": "textarea",
      "default": "A > B > C\nA > C > B\nB > C > A\nC > B > A\nC > A > B",
      "hint": "One ballot per line, highest to lowest separated by >"
    },
    {
      "key": "tie",
      "label": "Tie-break order",
      "type": "text",
      "default": "A, B, C"
    }
  ],
  "presets": [
    {
      "label": "Five ballots",
      "values": {
        "ballots": "A > B > C\nA > C > B\nB > C > A\nC > B > A\nC > A > B",
        "tie": "A, B, C"
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const ballots=String(values.ballots||"").split(/\r?\n/).map((line)=>line.split(">").map((x)=>x.trim()).filter(Boolean)).filter((x)=>x.length), tie=String(values.tie||"").split(",").map((x)=>x.trim()), active=new Set(ballots.flat()), rounds=[];
      const missing=[...active].filter((candidate)=>!tie.includes(candidate));
      if(missing.length) return {error:"Add every candidate name to the tie-break order: "+missing.join(", ")};
      let roundNum=0;
      while(active.size>1){ roundNum+=1; const counts=new Map([...active].map((x)=>[x,0])); let valid=0; ballots.forEach((ballot)=>{const pick=ballot.find((x)=>active.has(x));if(pick){counts.set(pick,counts.get(pick)+1);valid+=1;}}); const sorted=[...counts].sort((a,b)=>b[1]-a[1]||tie.indexOf(a[0])-tie.indexOf(b[0])); const winner=sorted.find((x)=>x[1]>valid/2); rounds.push(...sorted.map((x)=>[roundNum,x[0],x[1],valid?(x[1]/valid*100).toFixed(2)+"%":"0%"])); if(winner)return {result:winner[0]+" wins",caption:"Majority in round "+roundNum,table:{headers:["Round","Candidate","Votes","Share"],rows:rounds}}; const low=Math.min(...sorted.map((x)=>x[1])), losers=sorted.filter((x)=>x[1]===low).sort((a,b)=>tie.indexOf(b[0])-tie.indexOf(a[0])); active.delete(losers[0][0]); rounds.push([roundNum,losers[0][0],"Eliminated","—"]); }
      return {result:[...active][0]||"No winner",caption:ballots.length+" ballot(s)",table:{headers:["Round","Candidate","Votes","Share"],rows:rounds}};
    },
};

export default spec;
