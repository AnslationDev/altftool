// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "permutation-combination-calculator",
  "title": "Permutation & Combination Calculator",
  "description": "nPr and nCr for choosing r items from n.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "shuffle",
  "iconColor": "text-violet-600",
  "fields": [
    {
      "key": "n",
      "label": "Total items (n)",
      "type": "number",
      "default": "6"
    },
    {
      "key": "r",
      "label": "Chosen (r)",
      "type": "number",
      "default": "3"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const n = Math.floor(num(values.n)), r = Math.floor(num(values.r));
      if (n < 0 || r < 0 || r > n) return { result: "—", caption: "Need 0 ≤ r ≤ n" };
      const fact = (x) => { let f = 1; for (let i = 2; i <= x; i++) f *= i; return f; };
      const nPr = fact(n) / fact(n - r);
      const nCr = nPr / fact(r);
      return { result: `${nCr.toLocaleString()} combinations`, rows: [["Permutations (nPr)", nPr.toLocaleString()], ["Combinations (nCr)", nCr.toLocaleString()]] };
    },
};

export default spec;
