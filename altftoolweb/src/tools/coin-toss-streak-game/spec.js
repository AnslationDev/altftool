// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "coin-toss-streak-game",
  "title": "Coin Toss Streak Game",
  "description": "Flip 20 coins at once and see the longest run of the same side.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "circle-dollar-sign",
  "iconColor": "text-amber-600",
  "fields": [],
  "regenerate": true
},
  compute: (_values, _mode, random) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      let seq = "", best = 1, cur = 1, last = "";
      for (let i = 0; i < 20; i++) { const f = random() < 0.5 ? "H" : "T"; seq += f; if (f === last) { cur++; best = Math.max(best, cur); } else cur = 1; last = f; }
      const heads = seq.split("").filter((c) => c === "H").length;
      return { result: seq.match(/.{1,10}/g).join(" "), caption: "Longest streak: " + best, rows: [["Heads", heads], ["Tails", 20 - heads]] };
    },
};

export default spec;
