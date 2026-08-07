// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "kebab-case-converter",
  "title": "Kebab Case Converter",
  "description": "Convert any phrase to kebab-case — plus snake_case and dot.case.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "case-sensitive",
  "iconColor": "text-amber-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": "My Variable Name Here"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const raw = String(values.text).trim();
      const parts = raw.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((p) => p.toLowerCase());
      if (!parts.length) return { result: "—", caption: raw ? "No ASCII letters or digits found — try adding plain Latin characters" : "Enter some text" };
      return { result: parts.join("-"), rows: [["snake_case", parts.join("_")], ["dot.case", parts.join(".")]] };
    },
};

export default spec;
