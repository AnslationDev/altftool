// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "crc32-calculator",
  "title": "CRC32 Calculator",
  "description": "Calculate the CRC32 checksum for text or binary data.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "hash",
  "iconColor": "text-indigo-600",
  "fields": [
    {
      "key": "data",
      "label": "Data",
      "type": "textarea",
      "default": ""
    },
    {
      "key": "encoding",
      "label": "Encoding",
      "type": "select",
      "default": "utf-8",
      "choices": [
        {
          "value": "utf-8",
          "label": "UTF-8"
        },
        {
          "value": "ascii",
          "label": "ASCII"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "data": "Hello, world!"
      }
    }
  ],
  "note": "The CRC32 checksum is a cyclic redundancy check used to detect errors in data transmission or storage."
},
  compute: (values, mode) => { const data = values.data; const encoding = values.encoding; if (!data) return { result: 'Please enter some data.' }; try { const encoder = new TextEncoder(); const buffer = encoder.encode(data); const crc32 = (function() { function update(crc, buf) { for (let i = 0, l = buf.length; i < l; ++i) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF]; return crc; } const table = new Array(256); for (let n = 0; n < 256; ++n) { let c = n, k; for (k = 0; k < 8; ++k) c = (c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1); table[n] = c; } return function crc32(buf) { let crc = 0xFFFFFFFF; for (let i = 0, l = buf.length; i < l; ++i) crc = update(crc, [buf[i]]); return crc ^ 0xFFFFFFFF; }; })(); const result = crc32(buffer).toString(16).padStart(8, '0'); return { result: `CRC32: ${result}` }; } catch (e) { return { result: 'Error calculating CRC32.' }; }},
};

export default spec;
