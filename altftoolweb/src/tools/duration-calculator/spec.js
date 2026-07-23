// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "duration-calculator",
  "title": "Duration Calculator",
  "description": "Turn a number of seconds into a human-readable duration.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "code",
  "iconColor": "text-cyan-600",
  "fields": [
    {
      "key": "seconds",
      "label": "Seconds",
      "type": "number",
      "default": "90061"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; let s = Math.max(0, Math.floor(num(values.seconds))); const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60; return { result: [d && d + "d", h && h + "h", m && m + "m", (s || (!d && !h && !m)) && s + "s"].filter(Boolean).join(" "), rows: [["Days", d], ["Hours", h], ["Minutes", m], ["Seconds", s]] }; },
};

export default spec;
