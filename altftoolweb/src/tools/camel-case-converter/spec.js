// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "camel-case-converter",
  "title": "Camel Case Converter",
  "description": "Convert any phrase to camelCase — plus PascalCase and CONSTANT_CASE.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "case-sensitive",
  "iconColor": "text-blue-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": "my variable name here"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const parts = String(values.text).trim().split(/[^a-zA-Z0-9]+/).filter(Boolean);
      if (!parts.length) return { result: "—", caption: "Enter some text" };
      const camel = parts.map((p, i) => i === 0 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase()).join("");
      return { result: camel, rows: [["PascalCase", camel[0].toUpperCase() + camel.slice(1)], ["CONSTANT_CASE", parts.map((p) => p.toUpperCase()).join("_")]] };
    },
};

export default spec;
