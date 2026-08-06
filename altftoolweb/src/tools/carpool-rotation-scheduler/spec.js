// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "carpool-rotation-scheduler",
  "title": "Carpool Rotation Scheduler",
  "description": "Build a recurring, fair driving rota across your carpool's drivers and passengers.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "members",
      "label": "Members and driver availability",
      "type": "textarea",
      "default": "Asha | yes | 4\nBen | yes | 3\nChirag | no | 0\nDia | yes | 4",
      "hint": "Member | can drive yes/no | seats including driver"
    },
    {
      "key": "trips",
      "label": "Trip dates",
      "type": "textarea",
      "default": "2026-08-01\n2026-08-08\n2026-08-15\n2026-08-22"
    }
  ],
  "presets": [
    {
      "label": "Four trips",
      "values": {
        "members": "Asha | yes | 4\nBen | yes | 3\nChirag | no | 0\nDia | yes | 4",
        "trips": "2026-08-01\n2026-08-08\n2026-08-15\n2026-08-22"
      }
    }
  ],
  "note": "Rotation organizer only. Confirm licence, insurance, vehicle safety, child restraints, accessibility, fatigue, sobriety, emergency plans, pickup consent, and local transport rules."
},
  compute: (values) => {
      const members=String(values.members||"").split(/\r?\n/).map((line)=>{const [name,can,seats]=line.split("|").map((x)=>x.trim());return {name,can:/^y/i.test(can),seats:Number(seats)||0,count:0};}).filter((x)=>x.name), drivers=members.filter((x)=>x.can&&x.seats>1), trips=String(values.trips||"").split(/\r?\n/).map((x)=>x.trim()).filter(Boolean), rows=[];
      trips.forEach((date)=>{drivers.sort((a,b)=>a.count-b.count||b.seats-a.seats||a.name.localeCompare(b.name));const d=drivers[0];if(d)d.count+=1;rows.push([date,d?.name||"No eligible driver",d?.seats||0,members.filter((x)=>x!==d).map((x)=>x.name).join(", "),d&&d.seats>=members.length?"Seats fit":"Capacity review"]);});
      return {result:rows.length+" trip(s) scheduled",caption:drivers.length+" eligible driver(s)",table:{headers:["Date","Driver","Seats","Passengers","Check"],rows}};
    },
};

export default spec;
