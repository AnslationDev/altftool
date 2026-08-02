// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "fantasy-character-name-generator",
  "title": "Fantasy Character Name Generator",
  "description": "Generate six random two-part fantasy character names in one click.",
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
            const fant = ["Aeloria", "Thornwood", "Kaelith", "Silvarn", "Draven", "Elowen", "Fenrith", "Mirelle", "Zorander", "Ysolde", "Varkon", "Lythia"];
            const out = new Set(); let g = 0;
            while (out.size < 6 && g++ < 60) {
              out.add(fant[Math.floor(Math.random() * fant.length)] + " " + fant[Math.floor(Math.random() * fant.length)]);
            }
            return { list: [...out] };
          },
};

export default spec;
