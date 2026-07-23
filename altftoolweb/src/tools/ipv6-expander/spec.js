// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ipv6-expander",
  "title": "IPv6 Expander",
  "description": "Expand a shortened IPv6 address to its full form.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "code",
  "iconColor": "text-cyan-600",
  "fields": [
    {
      "key": "addr",
      "label": "IPv6 address",
      "type": "text",
      "default": "2001:db8::1"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const a = String(values.addr).trim(); if (!a.includes(":")) return { result: "—", caption: "Enter an IPv6 address" }; const parts = a.split("::"); let head = parts[0] ? parts[0].split(":") : []; let tail = parts[1] !== undefined ? (parts[1] ? parts[1].split(":") : []) : []; const miss = 8 - head.length - tail.length; const full = [...head, ...Array(Math.max(0, miss)).fill("0"), ...tail].map((h) => (h || "0").padStart(4, "0")); return { result: full.join(":"), caption: "expanded" }; },
};

export default spec;
