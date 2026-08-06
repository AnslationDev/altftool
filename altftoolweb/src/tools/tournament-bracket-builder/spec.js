// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "tournament-bracket-builder",
  "title": "Tournament Bracket Builder",
  "description": "Generate single or double elimination brackets, with byes placed automatically.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "entrants",
      "label": "Entrants in seed order",
      "type": "textarea",
      "default": "Asha\nBen\nChirag\nDia\nEli\nFaye"
    },
    {
      "key": "format",
      "label": "Format",
      "type": "select",
      "default": "single",
      "choices": [
        {
          "value": "single",
          "label": "Single elimination"
        },
        {
          "value": "double",
          "label": "Double elimination outline"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "Six entrants",
      "values": {
        "entrants": "Asha\nBen\nChirag\nDia\nEli\nFaye",
        "format": "single"
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const entrants=String(values.entrants||"").split(/\r?\n/).map((x)=>x.trim()).filter(Boolean), size=Math.pow(2,Math.ceil(Math.log2(Math.max(2,entrants.length)))), seeded=[...entrants,...Array(size-entrants.length).fill("BYE")], rows=[];
      for(let i=0;i<size/2;i+=1){const a=seeded[i],b=seeded[size-1-i];rows.push([1,i+1,a,b,a==="BYE"?b:b==="BYE"?a:"TBD"]);} const rounds=Math.log2(size); for(let r=2;r<=rounds;r+=1)for(let m=1;m<=size/Math.pow(2,r);m+=1)rows.push([r,m,"Winner R"+(r-1)+"M"+(m*2-1),"Winner R"+(r-1)+"M"+(m*2),"TBD"]); if(values.format==="double")rows.push(["L","Outline","Losers-bracket seeding","depends on results","Use live results"]);
      return {result:rounds+" winner-bracket round(s)",caption:(size-entrants.length)+" bye(s) · "+values.format+" format",table:{headers:["Round","Match","Side A","Side B","Advances"],rows}};
    },
};

export default spec;
