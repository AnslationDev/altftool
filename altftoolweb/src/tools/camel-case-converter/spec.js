// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "camel-case-converter",
  "title": "Camel Case Converter",
  "description": "Convert text to Camel Case format.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "code",
  "iconColor": "text-violet-600",
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
        "text": "hello world"
      }
    }
  ],
  "note": "This tool converts text to Camel Case format, removing any non-alphanumeric characters and capitalizing the first letter of each word except for the first one."
},
  compute: (values, mode) => { let result = values.text.trim().replace(/[^a-zA-Z0-9 ]/g, ''); if (result === '') return { result: 'Please enter some text.' }; result = result.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(''); return { result: result }; },
};

export default spec;
