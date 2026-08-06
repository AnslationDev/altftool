// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "factorial-calculator",
  "title": "Factorial Calculator",
  "description": "Exact factorial (n!) of a whole number using big integers.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "x",
  "iconColor": "text-rose-600",
  "fields": [
    {
      "key": "n",
      "label": "n (0–2000)",
      "type": "number",
      "default": "20"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const n = Math.floor(num(values.n));
      if (isNaN(n) || n < 0 || n > 2000) return { result: "—", caption: "Enter a whole number 0–2000" };
      let f = 1n; for (let i = 2n; i <= BigInt(n); i++) f *= i;
      const s = f.toString();
      return { result: n + "! = " + (s.length > 30 ? s.slice(0, 30) + "…" : s), caption: s.length + (s.length === 1 ? " digit" : " digits"), rows: [["Full value", s]] };
    },
};

export default spec;
