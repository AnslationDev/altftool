// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "quadratic-equation-solver",
  "title": "Quadratic Equation Solver",
  "description": "Solve ax² + bx + c = 0 — real or complex roots, discriminant and vertex.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "sigma",
  "iconColor": "text-indigo-600",
  "fields": [
    {
      "key": "a",
      "label": "a",
      "type": "number",
      "default": "1"
    },
    {
      "key": "b",
      "label": "b",
      "type": "number",
      "default": "-3"
    },
    {
      "key": "c",
      "label": "c",
      "type": "number",
      "default": "2"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const a = num(values.a), b = num(values.b), c = num(values.c);
      if (a === 0) return { result: "—", caption: "a can't be zero (not quadratic)" };
      const d = b * b - 4 * a * c;
      const vx = -b / (2 * a), vy = a * vx * vx + b * vx + c;
      let res;
      if (d > 0) { const s = Math.sqrt(d); res = `x₁ = ${((-b + s) / (2 * a)).toFixed(3)}, x₂ = ${((-b - s) / (2 * a)).toFixed(3)}`; }
      else if (d === 0) res = `x = ${(-b / (2 * a)).toFixed(3)} (double root)`;
      else { const s = Math.sqrt(-d); res = `x = ${(-b / (2 * a)).toFixed(2)} ± ${(s / (2 * a)).toFixed(2)}i`; }
      return { result: res, rows: [["Discriminant", d.toFixed(2)], ["Nature", d > 0 ? "two real roots" : d === 0 ? "one real root" : "two complex roots"], ["Vertex", `(${vx.toFixed(2)}, ${vy.toFixed(2)})`]] };
    },
};

export default spec;
