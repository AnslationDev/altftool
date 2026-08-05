// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "band-name-generator",
  "title": "Band Name Generator",
  "description": "Generate band name ideas by genre.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "music",
  "iconColor": "text-purple-600",
  "fields": [
    {
      "key": "genre",
      "label": "Genre",
      "type": "select",
      "default": "rock",
      "choices": [
        {
          "value": "rock",
          "label": "Rock"
        },
        {
          "value": "indie",
          "label": "Indie"
        },
        {
          "value": "metal",
          "label": "Metal"
        },
        {
          "value": "electronic",
          "label": "Electronic"
        }
      ]
    }
  ],
  "regenerate": true
},
  compute: (values, _mode, random) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const words = {
        rock: [["Electric", "Velvet", "Midnight", "Broken", "Wild"], ["Wolves", "Kings", "Riot", "Echoes", "Thunder"]],
        indie: [["Lonely", "Paper", "Golden", "Quiet", "Neon"], ["Foxes", "Waves", "Ghosts", "Rivers", "Bloom"]],
        metal: [["Iron", "Blackened", "Savage", "Eternal", "Crimson"], ["Reign", "Abyss", "Vein", "Wrath", "Tombs"]],
        electronic: [["Neon", "Digital", "Chrome", "Solar", "Static"], ["Pulse", "Circuit", "Drift", "Signal", "Void"]],
      };
      const [a, b] = words[values.genre] || words.rock;
      const pick = () => "The " + a[Math.floor(random() * a.length)] + " " + b[Math.floor(random() * b.length)];
      const set = new Set(); while (set.size < 5) set.add(pick());
      return { list: [...set] };
    },
};

export default spec;
