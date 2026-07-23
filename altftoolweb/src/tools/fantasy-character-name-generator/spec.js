// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "fantasy-character-name-generator",
  "title": "Fantasy Character Name Generator",
  "description": "Generate fresh fantasy character names from a keyword.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "shuffle",
  "iconColor": "text-violet-600",
  "fields": [
    {
      "key": "keyword",
      "label": "Theme (optional)",
      "type": "text",
      "default": "",
      "required": false
    }
  ],
  "regenerate": true
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
            const isFantasy = true;
            const k = String(values.keyword || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
            const A = ["Nova", "Lumen", "Vertex", "Quartz", "Harbor", "Ember", "Cascade", "Cobalt", "Nimbus", "Zephyr", "Onyx", "Delta", "Pixel", "Echo", "Aster", "Flux", "Vela", "Rune"];
            const B = ["ly", "ify", "hub", "labs", "kit", "flow", "wave", "forge", "spark", "loop", "base", "grid", "works", "craft"];
            const fant = ["Aeloria", "Thornwood", "Kaelith", "Silvarn", "Draven", "Elowen", "Fenrith", "Mirelle", "Zorander", "Ysolde", "Varkon", "Lythia"];
            const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            const out = new Set(); let g = 0;
            while (out.size < 6 && g++ < 60) {
              if (isFantasy) out.add(fant[Math.floor(Math.random() * fant.length)] + " " + fant[Math.floor(Math.random() * fant.length)]);
              else { const a = A[Math.floor(Math.random() * A.length)]; const b = B[Math.floor(Math.random() * B.length)]; out.add(k ? cap(k) + b : a + b); }
            }
            return { list: [...out] };
          },
};

export default spec;
