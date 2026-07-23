// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "line-break-remover",
  "title": "Line Break Remover",
  "description": "Join multi-line text into one line with your chosen separator.",
  "badge": "Text",
  "category": [
    "Text"
  ],
  "icon": "wrap-text",
  "iconColor": "text-cyan-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": "line one\nline two\nline three"
    },
    {
      "key": "separator",
      "label": "Join with",
      "type": "select",
      "default": "space",
      "choices": [
        {
          "value": "space",
          "label": "Space"
        },
        {
          "value": "comma",
          "label": "Comma"
        },
        {
          "value": "none",
          "label": "Nothing"
        }
      ]
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const sep = values.separator === "comma" ? ", " : values.separator === "none" ? "" : " ";
      const lines = String(values.text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      return { result: lines.join(sep) || "—", rows: [["Lines joined", lines.length], ["Characters", lines.join(sep).length]] };
    },
};

export default spec;
