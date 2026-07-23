// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "blog-outline-generator",
  "title": "Blog Outline Generator",
  "description": "Generate a structured blog outline (intro, sections, conclusion, FAQ) for any topic.",
  "badge": "Content Creation",
  "category": [
    "Content Creation"
  ],
  "icon": "list-tree",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "topic",
      "label": "Topic",
      "type": "text",
      "default": "starting a podcast"
    },
    {
      "key": "sections",
      "label": "Main sections",
      "type": "range",
      "default": 4,
      "min": 2,
      "max": 8,
      "step": 1
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const t = (values.topic || "your topic").trim();
      const T = t.replace(/\b\w/g, (c) => c.toUpperCase());
      const n = Math.max(2, Math.min(8, num(values.sections)));
      const angles = ["Why it matters", "Getting started", "Key steps", "Common mistakes", "Best tools", "Tips for beginners", "Advanced strategies", "Real examples"];
      const list = [`# ${T}: The Complete Guide`, `## Introduction — hook + what readers will learn`];
      for (let i = 0; i < n; i++) list.push(`## ${i + 1}. ${angles[i]} of ${t}`);
      list.push("## Conclusion — recap + call to action", "## FAQ — 3 common questions");
      return { result: `Outline with ${n + 4} sections`, list };
    },
};

export default spec;
