// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "magic-8-ball",
  "title": "Magic 8 Ball",
  "description": "Get an answer to your yes/no question.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "magic-wand",
  "iconColor": "text-violet-600",
  "fields": [
    {
      "key": "question",
      "label": "Your Question",
      "type": "text",
      "default": ""
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "question": "Will I win the lottery?"
      }
    }
  ],
  "note": "This is a fun tool for getting an answer to your yes/no question."
},
  compute: (values, mode) => { return { result: Math.random() < 0.5 ? 'Yes' : 'No', caption: '', rows: [['Question', values.question]] }; },
};

export default spec;
