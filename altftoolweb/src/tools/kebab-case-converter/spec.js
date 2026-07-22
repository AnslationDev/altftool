// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "kebab-case-converter",
  "title": "Kebab Case Converter",
  "description": "Convert any phrase into kebab case.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "case-sensitive",
  "iconColor": "text-violet-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "text",
      "default": ""
    }
  ],
  "presets": [
    {
      "label": "Sample",
      "values": {
        "text": "My Variable Name"
      }
    }
  ],
  "note": "Runs entirely in your browser — your data never leaves your device."
},
  compute: (values) => { const parts = (values.text||'').trim().split(/[^a-zA-Z0-9]+/).filter(Boolean); const m='kebab'; let out=''; if(m==='snake') out=parts.map(p=>p.toLowerCase()).join('_'); else if(m==='kebab') out=parts.map(p=>p.toLowerCase()).join('-'); else out=parts.map((p,i)=>{const c=p.charAt(0).toUpperCase()+p.slice(1).toLowerCase(); return (m==='camel'&&i===0)?p.toLowerCase():c;}).join(''); return { result: out || '—' }; },
};

export default spec;
