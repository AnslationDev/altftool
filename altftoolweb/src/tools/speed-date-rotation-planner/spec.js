// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "speed-date-rotation-planner",
  "title": "Speed-Date Rotation Planner",
  "description": "Build a non-repeating round-robin meeting schedule for a speed dating event.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "participants",
      "label": "Participants",
      "type": "textarea",
      "default": "Asha\nBen\nChirag\nDia\nEli\nFaye"
    },
    {
      "key": "minutes",
      "label": "Minutes per meeting",
      "type": "number",
      "default": 5,
      "min": 1
    },
    {
      "key": "break_minutes",
      "label": "Break between rounds",
      "type": "number",
      "default": 1,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Six participants",
      "values": {
        "participants": "Asha\nBen\nChirag\nDia\nEli\nFaye",
        "minutes": 5,
        "break_minutes": 1
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      let list=String(values.participants||"").split(/\r?\n/).map((x)=>x.trim()).filter(Boolean);
      if(list.length<2) return {result:"—",caption:"Enter at least two participant names, one per line."};
      const minutes=Number(values.minutes), breakMinutes=Number(values.break_minutes);
      if(!Number.isFinite(minutes)||minutes<1) return {result:"—",caption:"Minutes per meeting must be at least 1."};
      if(!Number.isFinite(breakMinutes)||breakMinutes<0) return {result:"—",caption:"Break between rounds cannot be negative."};
      const BYE=Symbol("bye");
      if(list.length%2)list.push(BYE);const fixed=list[0], rotating=list.slice(1), rows=[], rounds=list.length-1;
      for(let round=0;round<rounds;round+=1){const current=[fixed,...rotating];for(let i=0;i<current.length/2;i+=1){const a=current[i],b=current[current.length-1-i];rows.push([round+1,round*(minutes+breakMinutes)+" min",a===BYE?"BYE":a,b===BYE?"BYE":b,a===BYE||b===BYE?"Break":"Meet"]);}rotating.unshift(rotating.pop());}
      return {result:rounds+" non-repeating round(s)",caption:(rounds*minutes+(rounds-1)*breakMinutes)+" minutes total",table:{headers:["Round","Starts","Participant A","Participant B","Type"],rows}};
    },
};

export default spec;
