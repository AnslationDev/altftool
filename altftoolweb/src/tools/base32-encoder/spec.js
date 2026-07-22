// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "base32-encoder",
  "title": "Base32 Encoder / Decoder",
  "description": "Converts text to Base32 and vice versa.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "base64",
  "iconColor": "text-rose-600",
  "fields": [
    {
      "key": "input",
      "label": "Input",
      "type": "textarea",
      "default": ""
    },
    {
      "key": "mode",
      "label": "Mode",
      "type": "select",
      "default": "encode",
      "choices": [
        {
          "value": "encode",
          "label": "Encode to Base32"
        },
        {
          "value": "decode",
          "label": "Decode from Base32"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "input": "Hello, World!"
      }
    }
  ],
  "note": "Base32 encoding is a binary-to-text encoding scheme that represents binary data in an ASCII string format by translating it into a radix-32 representation."
},
  compute: (values, mode) => { let result = ''; if (mode === 'encode') { result = btoa(values.input).replace(/=/g, ''); } else if (mode === 'decode') { try { const decoded = atob(values.input); result = decoded; } catch(e) { result = 'Invalid Base32 input'; } } return { result: result }; },
};

export default spec;
