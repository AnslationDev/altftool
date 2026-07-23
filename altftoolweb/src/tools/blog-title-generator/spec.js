// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "blog-title-generator",
  "title": "Blog Title Generator",
  "description": "Generate catchy blog title ideas from a keyword and tone.",
  "badge": "Content Creation",
  "category": [
    "Content Creation"
  ],
  "icon": "heading",
  "iconColor": "text-fuchsia-600",
  "fields": [
    {
      "key": "keyword",
      "label": "Topic / keyword",
      "type": "text",
      "default": "email marketing"
    },
    {
      "key": "tone",
      "label": "Tone",
      "type": "select",
      "default": "howto",
      "choices": [
        {
          "value": "howto",
          "label": "How-to"
        },
        {
          "value": "listicle",
          "label": "Listicle"
        },
        {
          "value": "bold",
          "label": "Bold"
        }
      ]
    }
  ],
  "regenerate": true
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const k = (values.keyword || "your topic").trim();
      const K = k.replace(/\b\w/g, (c) => c.toUpperCase());
      const n = [7, 9, 11, 13, 5][Math.floor(Math.random() * 5)];
      const pools = {
        howto: [`How to Master ${K} in 2026`, `A Beginner's Guide to ${K}`, `How to Get Started With ${K} (Step by Step)`, `The Right Way to Do ${K}`],
        listicle: [`${n} ${K} Tips That Actually Work`, `${n} Mistakes to Avoid With ${K}`, `${n} ${K} Tools You Need Today`, `Top ${n} ${K} Ideas for Beginners`],
        bold: [`Everything You Know About ${K} Is Wrong`, `Why ${K} Matters More Than Ever`, `The Ultimate Guide to ${K}`, `Stop Struggling With ${K} — Do This Instead`],
      };
      const pool = pools[values.tone] || pools.howto;
      const pick = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
      return { list: pick };
    },
};

export default spec;
