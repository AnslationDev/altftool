// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "lcm-and-gcd-calculator",
  "title": "LCM and GCD Calculator",
  "description": "Greatest common divisor and least common multiple of two numbers.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "divide",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "a",
      "label": "First number",
      "type": "number",
      "default": "12"
    },
    {
      "key": "b",
      "label": "Second number",
      "type": "number",
      "default": "18"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      let a = Math.floor(Math.abs(num(values.a))), b = Math.floor(Math.abs(num(values.b)));
      if (!a || !b) return { result: "—", caption: "Enter two whole numbers" };
      const gcd = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
      const g = gcd(a, b);
      return { result: `GCD ${g} · LCM ${(a / g) * b}`, rows: [["GCD (HCF)", g], ["LCM", (a / g) * b]] };
    },
};

export default spec;
