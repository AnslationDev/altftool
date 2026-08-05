// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "domain-name-ideas-generator",
  "title": "Domain Name Ideas Generator",
  "description": "Generate fresh name ideas from a keyword.",
  "badge": "Startup",
  "category": [
    "Startup"
  ],
  "icon": "shuffle",
  "iconColor": "text-violet-600",
  "fields": [
    {
      "key": "keyword",
      "label": "Keyword",
      "type": "text",
      "default": "cloud",
      "required": false
    }
  ],
  "regenerate": true
},
  compute: (values, _mode, random) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
            const isFantasy = false;
            const k = String(values.keyword || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
            const A = ["Nova", "Lumen", "Vertex", "Quartz", "Harbor", "Ember", "Cascade", "Cobalt", "Nimbus", "Zephyr", "Onyx", "Delta", "Pixel", "Echo", "Aster", "Flux", "Vela", "Rune"];
            const B = ["ly", "ify", "hub", "labs", "kit", "flow", "wave", "forge", "spark", "loop", "base", "grid", "works", "craft"];
            const fant = ["Aeloria", "Thornwood", "Kaelith", "Silvarn", "Draven", "Elowen", "Fenrith", "Mirelle", "Zorander", "Ysolde", "Varkon", "Lythia"];
            const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            const out = new Set(); let g = 0;
            while (out.size < 6 && g++ < 60) {
              if (isFantasy) out.add(fant[Math.floor(random() * fant.length)] + " " + fant[Math.floor(random() * fant.length)]);
              else { const a = A[Math.floor(random() * A.length)]; const b = B[Math.floor(random() * B.length)]; out.add(k ? cap(k) + b : a + b); }
            }
            return { list: [...out] };
          },
};

export default spec;
