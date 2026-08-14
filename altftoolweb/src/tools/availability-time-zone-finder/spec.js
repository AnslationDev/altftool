// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "availability-time-zone-finder",
  "title": "Availability & Time-Zone Finder",
  "description": "Finds meeting windows that work across several schedules.",
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
      "label": "Members and UTC offsets",
      "type": "textarea",
      "default": "Asha | 5.5 | 09:00-18:00\nBen | -4 | 09:00-17:00\nChirag | 1 | 10:00-19:00",
      "hint": "Name | UTC offset hours | local availability"
    },
    {
      "key": "duration",
      "label": "Meeting duration (minutes)",
      "type": "number",
      "default": 60,
      "min": 15,
      "max": 480
    },
    {
      "key": "step",
      "label": "Search step (minutes)",
      "type": "number",
      "default": 30,
      "min": 15,
      "max": 120
    }
  ],
  "presets": [
    {
      "label": "Three time zones",
      "values": {
        "members": "Asha | 5.5 | 09:00-18:00\nBen | -4 | 09:00-17:00\nChirag | 1 | 10:00-19:00",
        "duration": 60,
        "step": 30
      }
    }
  ],
  "note": "Runs locally from the entered data. The result is a transparent decision aid; participants should agree on the method, inputs, tie-breaks, accessibility needs, and final decision."
},
  compute: (values) => {
      const toMin=(time)=>{const [h,m]=String(time).split(":").map(Number);return h*60+(m||0);}, fmt=(minutes)=>{const m=((minutes%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");};
      const members=String(values.members||"").split(/\r?\n/).map((line)=>{const [name,offset,range]=line.split("|").map((x)=>x.trim()),[start,end]=String(range||"").split("-");return {name,offset:Number(offset)||0,start:toMin(start),end:toMin(end)};}).filter((x)=>x.name&&Number.isFinite(x.start)&&Number.isFinite(x.end)), duration=Math.max(15,Number(values.duration)||60),step=Math.max(15,Number(values.step)||30),slots=[];
      for(let utc=0;utc<1440;utc+=step){const ok=members.every((x)=>{const local=((utc+x.offset*60)%1440+1440)%1440;return local>=x.start&&local+duration<=x.end;});if(ok)slots.push([fmt(utc)+" UTC",...members.map((x)=>fmt(utc+x.offset*60)+"–"+fmt(utc+x.offset*60+duration))]);}
      return {result:slots.length+" common start time(s)",caption:duration+"-minute meeting",table:{headers:["UTC",...members.map((x)=>x.name+" local")],rows:slots.slice(0,100)}};
    },
};

export default spec;
