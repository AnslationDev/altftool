// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "shift-rotation-fairness-auditor",
  "title": "Shift-Rotation Fairness Auditor",
  "description": "Score how fairly nights, weekends and workload are split across team members.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "shifts",
      "label": "Assigned shifts",
      "type": "textarea",
      "default": "2026-07-01 | Asha | night | 8\n2026-07-02 | Ben | day | 8\n2026-07-05 | Asha | weekend | 8\n2026-07-06 | Ben | weekend | 6\n2026-07-07 | Chirag | night | 10",
      "hint": "Date | member | type | hours"
    },
    {
      "key": "night_weight",
      "label": "Night burden weight",
      "type": "number",
      "default": 1.5,
      "min": 0
    },
    {
      "key": "weekend_weight",
      "label": "Weekend burden weight",
      "type": "number",
      "default": 1.25,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Five shifts",
      "values": {
        "shifts": "2026-07-01 | Asha | night | 8\n2026-07-02 | Ben | day | 8\n2026-07-05 | Asha | weekend | 8\n2026-07-06 | Ben | weekend | 6\n2026-07-07 | Chirag | night | 10",
        "night_weight": 1.5,
        "weekend_weight": 1.25
      }
    }
  ],
  "note": "Descriptive workload audit only. Fair scheduling must also account for contracts, availability, disability/accommodation, rest, leave, seniority rules, safety, preferences, protected status, and local labour law."
},
  compute: (values) => {
      const map=new Map();String(values.shifts||"").split(/\r?\n/).forEach((line)=>{const [date,name,type,hoursRaw]=line.split("|").map((x)=>x.trim()),hours=Math.max(0,Number(hoursRaw)||0),weight=/night/i.test(type)?Number(values.night_weight):/weekend/i.test(type)?Number(values.weekend_weight):1;if(!name)return;const row=map.get(name)||{hours:0,nights:0,weekends:0,burden:0,count:0};row.hours+=hours;row.count+=1;row.nights+=/night/i.test(type)?1:0;row.weekends+=/weekend/i.test(type)?1:0;row.burden+=hours*weight;map.set(name,row);});
      const rows=[...map].map(([name,x])=>[name,x.count,x.hours.toFixed(2),x.nights,x.weekends,x.burden.toFixed(2)]),burdens=rows.map((x)=>Number(x[5])),mean=burdens.reduce((a,b)=>a+b,0)/Math.max(1,burdens.length),spread=burdens.length?Math.max(...burdens)-Math.min(...burdens):0;
      return {result:spread.toFixed(2)+" weighted-hour spread",caption:"Mean burden "+mean.toFixed(2),table:{headers:["Member","Shifts","Hours","Nights","Weekends","Weighted burden"],rows}};
    },
};

export default spec;
