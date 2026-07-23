// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "iso-8601-formatter",
  "title": "ISO 8601 Formatter",
  "description": "Convert a date/time to ISO-8601 and other formats.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "code",
  "iconColor": "text-cyan-600",
  "fields": [
    {
      "key": "input",
      "label": "Date/time",
      "type": "text",
      "default": "2026-07-20 15:30"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const dt = new Date(values.input); if (isNaN(dt)) return { result: "—", caption: "Enter a valid date/time" }; return { result: dt.toISOString(), rows: [["Unix (s)", Math.floor(dt.getTime() / 1000)], ["UTC", dt.toUTCString()], ["Local", dt.toString().replace(/ GMT.*/, "")]] }; },
};

export default spec;
