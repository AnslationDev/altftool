// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "css-clamp-generator",
  "title": "CSS Clamp Generator",
  "description": "Build a responsive CSS clamp() value.",
  "badge": "Design",
  "category": [
    "Design"
  ],
  "icon": "square",
  "iconColor": "text-indigo-500",
  "fields": [
    {
      "key": "min",
      "label": "Min (px)",
      "type": "number",
      "default": "16"
    },
    {
      "key": "max",
      "label": "Max (px)",
      "type": "number",
      "default": "48"
    },
    {
      "key": "vw",
      "label": "Preferred (vw)",
      "type": "number",
      "default": "4"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const min=num(values.min); const max=num(values.max); const vw=num(values.vw); if(!Number.isFinite(min)||!Number.isFinite(max)||!Number.isFinite(vw)) return { error: "Enter valid numbers for Min, Preferred and Max." }; if(min<0||max<0) return { error: "Min and Max should not be negative." }; if(max<min) return { error: "Max must be greater than or equal to Min." }; return { result: `clamp(${min}px, ${vw}vw, ${max}px)`, caption: "responsive size", rows: [["Min", min + "px"], ["Max", max + "px"]] }; },
};

export default spec;
