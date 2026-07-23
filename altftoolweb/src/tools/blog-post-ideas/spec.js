// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "blog-post-ideas",
  "title": "Blog Post Idea Generator",
  "description": "Generate fresh blog post angles for any topic.",
  "badge": "Content Creation",
  "category": [
    "Content Creation"
  ],
  "icon": "lightbulb",
  "iconColor": "text-amber-500",
  "fields": [
    {
      "key": "topic",
      "label": "Topic / niche",
      "type": "text",
      "default": "home fitness"
    }
  ],
  "regenerate": true
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const t = (values.topic || "your topic").trim();
      const templates = [`The ultimate beginner's guide to ${t}`, `10 common ${t} mistakes (and how to fix them)`, `${t} on a budget: what really works`, `A day in the life of a ${t} enthusiast`, `${t} myths everyone still believes`, `How I improved my ${t} in 30 days`, `The best ${t} tools of 2026`, `${t} vs. the alternatives: an honest comparison`];
      return { list: [...templates].sort(() => Math.random() - 0.5).slice(0, 5) };
    },
};

export default spec;
