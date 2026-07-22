// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "tweet-character-counter",
  "title": "Tweet Character Counter",
  "description": "Count characters, words, lines and sentences in your text instantly.",
  "badge": "Social Media",
  "category": [
    "Social Media"
  ],
  "icon": "type",
  "iconColor": "text-cyan-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": "",
      "placeholder": "Paste your text…"
    }
  ],
  "presets": [
    {
      "label": "Sample",
      "values": {
        "text": "The quick brown fox jumps over the lazy dog."
      }
    }
  ],
  "note": "Runs entirely in your browser — your data never leaves your device."
},
  compute: (values) => { const t = values.text || ''; const words = (t.match(/\S+/g) || []).length; const lines = t ? t.split(/\n/).length : 0; const sentences = (t.match(/[.!?]+/g) || []).length; return { result: words + ' words', rows: [['Characters', t.length], ['Characters (no spaces)', t.replace(/\s/g,'').length], ['Lines', lines], ['Sentences', sentences]] }; },
};

export default spec;
