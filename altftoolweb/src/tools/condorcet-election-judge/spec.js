// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "condorcet-election-judge",
  "title": "Condorcet Election Judge",
  "description": "Pairwise comparison se winner ya voting cycle dikhaye.",
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
      "default": "A > B > C\nA > C > B\nB > C > A\nC > B > A\nC > A > B"
    }
  ],
  "presets": [
    {
      "label": "Five ballots",
      "values": {
        "ballots": "A > B > C\nA > C > B\nB > C > A\nC > B > A\nC > A > B"
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const ballots=String(values.ballots||"").split(/\r?\n/).map((line)=>line.split(">").map((x)=>x.trim()).filter(Boolean)).filter((x)=>x.length), candidates=[...new Set(ballots.flat())], wins=new Map(candidates.map((x)=>[x,0])), rows=[];
      for(let i=0;i<candidates.length;i+=1)for(let j=i+1;j<candidates.length;j+=1){const a=candidates[i],b=candidates[j];let av=0,bv=0;ballots.forEach((vote)=>{const ai=vote.indexOf(a),bi=vote.indexOf(b);if(ai>=0&&(bi<0||ai<bi))av+=1;else if(bi>=0)bv+=1;});const winner=av>bv?a:bv>av?b:"Tie";if(winner!=="Tie")wins.set(winner,wins.get(winner)+1);rows.push([a,b,av,bv,winner]);}
      const needed=Math.max(0,candidates.length-1), winner=[...wins].find((x)=>x[1]===needed);
      return {result:winner?winner[0]+" is Condorcet winner":"No Condorcet winner (tie or cycle)",caption:candidates.length+" candidates · "+ballots.length+" ballots",table:{headers:["Candidate A","Candidate B","A preferred","B preferred","Pair winner"],rows}};
    },
};

export default spec;
