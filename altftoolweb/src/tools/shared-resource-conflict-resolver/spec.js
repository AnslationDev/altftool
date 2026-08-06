// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "shared-resource-conflict-resolver",
  "title": "Shared-Resource Conflict Resolver",
  "description": "Resolve booking conflicts over shared rooms, vehicles or equipment.",
  "badge": "Fair Decisions & Group Scheduling",
  "category": [
    "Productivity",
    "Business"
  ],
  "icon": "users-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "bookings",
      "label": "Requested bookings",
      "type": "textarea",
      "default": "Room A | 2026-07-25 09:00 | 2026-07-25 10:00 | Asha | 2\nRoom A | 2026-07-25 09:30 | 2026-07-25 11:00 | Ben | 1\nCar 1 | 2026-07-25 08:00 | 2026-07-25 09:00 | Chirag | 1",
      "hint": "Resource | start | end | requester | priority (lower wins)"
    },
    {
      "key": "buffer",
      "label": "Buffer between bookings (minutes)",
      "type": "number",
      "default": 0,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "One conflict",
      "values": {
        "bookings": "Room A | 2026-07-25 09:00 | 2026-07-25 10:00 | Asha | 2\nRoom A | 2026-07-25 09:30 | 2026-07-25 11:00 | Ben | 1\nCar 1 | 2026-07-25 08:00 | 2026-07-25 09:00 | Chirag | 1",
        "buffer": 0
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const buffer=Math.max(0,Number(values.buffer)||0)*60000,items=String(values.bookings||"").split(/\r?\n/).map((line,index)=>{const [resource,start,end,requester,priority]=line.split("|").map((x)=>x.trim());return {index,resource,start:new Date(start).getTime(),end:new Date(end).getTime(),startText:start,endText:end,requester,priority:Number(priority)||999};}).filter((x)=>x.resource&&Number.isFinite(x.start)&&Number.isFinite(x.end)&&x.end>x.start).sort((a,b)=>a.resource.localeCompare(b.resource)||a.start-b.start||a.priority-b.priority),accepted=[],rows=[];
      items.forEach((item)=>{const conflicts=accepted.filter((x)=>x.resource===item.resource&&item.start<x.end+buffer&&item.end+buffer>x.start);if(!conflicts.length){accepted.push(item);rows.push([item.resource,item.startText,item.endText,item.requester,"Accepted","No conflict"]);}else{const best=[item,...conflicts].sort((a,b)=>a.priority-b.priority||a.start-b.start||a.index-b.index)[0];if(best===item){conflicts.forEach((old)=>{const index=accepted.indexOf(old);if(index>=0)accepted.splice(index,1);});accepted.push(item);rows.push([item.resource,item.startText,item.endText,item.requester,"Accepted","Replaces lower-priority conflict"]);}else rows.push([item.resource,item.startText,item.endText,item.requester,"Needs reschedule","Conflicts with "+best.requester]);}});
      return {result:accepted.length+"/"+items.length+" requests accepted",caption:(items.length-accepted.length)+" conflict(s) need review",table:{headers:["Resource","Start","End","Requester","Decision","Reason"],rows}};
    },
};

export default spec;
