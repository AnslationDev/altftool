// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "friend-elo-ladder",
  "title": "Friend ELO Ladder",
  "description": "Friendly matches ka persistent ELO rating track kare.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "ratings",
      "label": "Starting ratings",
      "type": "textarea",
      "default": "Asha | 1200\nBen | 1200\nChirag | 1200"
    },
    {
      "key": "matches",
      "label": "Matches in order",
      "type": "textarea",
      "default": "Asha | Ben | 1\nChirag | Asha | 0.5\nBen | Chirag | 0",
      "hint": "Player A | Player B | A score (1 win, 0.5 draw, 0 loss)"
    },
    {
      "key": "k",
      "label": "K-factor",
      "type": "number",
      "default": 32,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Three matches",
      "values": {
        "ratings": "Asha | 1200\nBen | 1200\nChirag | 1200",
        "matches": "Asha | Ben | 1\nChirag | Asha | 0.5\nBen | Chirag | 0",
        "k": 32
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const ratings=new Map(String(values.ratings||"").split(/\r?\n/).map((line)=>{const [name,rating]=line.split("|").map((x)=>x.trim());return [name,Number(rating)||1200];}).filter((x)=>x[0])), k=Math.max(1,Number(values.k)||32), history=[];
      String(values.matches||"").split(/\r?\n/).forEach((line,index)=>{const [a,b,scoreRaw]=line.split("|").map((x)=>x.trim()),score=Math.max(0,Math.min(1,Number(scoreRaw)));if(!a||!b||!Number.isFinite(score))return;if(!ratings.has(a))ratings.set(a,1200);if(!ratings.has(b))ratings.set(b,1200);const ra=ratings.get(a),rb=ratings.get(b),expected=1/(1+Math.pow(10,(rb-ra)/400)),newA=ra+k*(score-expected),newB=rb+k*((1-score)-(1-expected));ratings.set(a,newA);ratings.set(b,newB);history.push([index+1,a,b,score,newA.toFixed(1),newB.toFixed(1)]);});
      const ladder=[...ratings].sort((a,b)=>b[1]-a[1]).map((x,index)=>[index+1,x[0],x[1].toFixed(1)]);
      return {result:ladder[0]?.[1]||"No players",caption:"Current ladder leader · "+history.length+" match(es)",table:{headers:["Rank","Player","Elo"],rows:ladder},list:history.map((x)=>"Match "+x[0]+": "+x[1]+" vs "+x[2]+" → "+x[4]+" / "+x[5])};
    },
};

export default spec;
