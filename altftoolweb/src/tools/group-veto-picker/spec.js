// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "group-veto-picker",
  "title": "Group Veto Picker",
  "description": "Narrow a shortlist down to one choice as each member spends their vetoes.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "options",
      "label": "Options",
      "type": "textarea",
      "default": "Movie A\nMovie B\nMovie C\nMovie D"
    },
    {
      "key": "vetoes",
      "label": "Member vetoes",
      "type": "textarea",
      "default": "Asha | Movie D\nBen | Movie A\nChirag | Movie D",
      "hint": "Member | option, option"
    },
    {
      "key": "max",
      "label": "Vetoes allowed per member",
      "type": "number",
      "default": 1,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Four options",
      "values": {
        "options": "Movie A\nMovie B\nMovie C\nMovie D",
        "vetoes": "Asha | Movie D\nBen | Movie A\nChirag | Movie D",
        "max": 1
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const options=String(values.options||"").split(/\r?\n/).map((x)=>x.trim()).filter(Boolean), max=Math.max(0,Math.round(Number(values.max)||0)), counts=new Map(options.map((x)=>[x,0])), rows=[];
      String(values.vetoes||"").split(/\r?\n/).forEach((line)=>{const [member,raw]=line.split("|").map((x)=>x.trim()), vetoes=String(raw||"").split(",").map((x)=>x.trim()).filter(Boolean);vetoes.slice(0,max).forEach((option)=>{if(counts.has(option))counts.set(option,counts.get(option)+1);});rows.push([member,vetoes.slice(0,max).join(", ")||"None",Math.max(0,vetoes.length-max)]);});
      const ranked=[...counts].sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0])), minimum=ranked[0]?.[1];
      return {result:ranked.filter((x)=>x[1]===minimum).map((x)=>x[0]).join(", ")||"No options",caption:"Fewest vetoes: "+(minimum??0),rows:[["Options",options.length],["Member rows",rows.length]],table:{headers:["Option","Veto count","Status"],rows:ranked.map((x)=>[x[0],x[1],x[1]===minimum?"Finalist":"Narrowed out"])}};
    },
};

export default spec;
