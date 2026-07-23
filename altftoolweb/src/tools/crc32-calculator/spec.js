// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "crc32-calculator",
  "title": "CRC32 Calculator",
  "description": "Compute the CRC32 checksum of text as a hex value.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "hash",
  "iconColor": "text-orange-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": "hello world"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const t = String(values.text);
      let c; const table = [];
      for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
      let crc = 0xffffffff;
      for (let i = 0; i < t.length; i++) crc = table[(crc ^ t.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
      crc = (crc ^ 0xffffffff) >>> 0;
      return { result: "0x" + crc.toString(16).padStart(8, "0"), rows: [["Decimal", crc.toString()], ["Length", t.length + " chars"]] };
    },
};

export default spec;
