// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "slug-generator",
  "title": "Slug Generator",
  "description": "Turn a title into a clean URL slug.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "type",
  "iconColor": "text-violet-600",
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
      "label": "Sample",
      "values": {
        "text": "Hello World",
        "times": "3"
      }
    }
  ]
},
  compute: (values) => ({ result: String(values.text).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-") || "—" }),
};

export default spec;
