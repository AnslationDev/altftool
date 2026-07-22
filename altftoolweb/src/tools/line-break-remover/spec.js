// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "line-break-remover",
  "title": "Line Break Remover",
  "description": "Remove unwanted line breaks from text.",
  "badge": "Text",
  "category": [
    "Text"
  ],
  "icon": "type",
  "iconColor": "text-blue-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": ""
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "text": "Hello\nWorld"
      }
    }
  ],
  "note": "This tool removes all line breaks from the input text."
},
  compute: (values, mode) => { return { result: values.text.replace(/\n/g, ' ') }; },
};

export default spec;
