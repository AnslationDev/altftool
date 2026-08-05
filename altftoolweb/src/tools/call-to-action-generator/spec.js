// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "call-to-action-generator",
  "title": "Call-to-Action Generator",
  "description": "Generate punchy CTA button and headline variations.",
  "badge": "Marketing",
  "category": [
    "Marketing"
  ],
  "icon": "megaphone",
  "iconColor": "text-red-500",
  "fields": [
    {
      "key": "offer",
      "label": "What you're offering",
      "type": "text",
      "default": "free trial"
    }
  ],
  "regenerate": true
},
  compute: (values, _mode, random) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const o = (values.offer || "it").trim();
      const ctas = [`Start your ${o} now`, `Get ${o} — free`, `Claim your ${o} today`, `Yes, I want ${o}!`, `Try ${o} risk-free`, `Unlock ${o} instantly`, `Grab ${o} before it's gone`, `Join now and get ${o}`];
      const shuffled = [...ctas];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { list: shuffled.slice(0, 5) };
    },
};

export default spec;
