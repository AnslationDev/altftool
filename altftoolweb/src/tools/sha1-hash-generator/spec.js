// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "sha1-hash-generator",
  "title": "SHA1 Hash Generator",
  "description": "Generate a SHA1 hash of any text, in your browser.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "shield",
  "iconColor": "text-slate-700",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": "hello world"
    }
  ],
  "presets": [
    {
      "label": "hello world",
      "values": {
        "text": "hello world"
      }
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const A = "SHA-1"; return crypto.subtle.digest(A, new TextEncoder().encode(String(values.text))).then((b) => ({ result: [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""), rows: [["Algorithm", A], ["Length", String(values.text).length + " chars"]] })); },
};

export default spec;
