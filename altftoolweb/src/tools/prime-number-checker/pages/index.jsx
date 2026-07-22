"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [{"key":"n","label":"Number","type":"number","default":"97"}];
const compute = (v) => { const n = Math.floor(Number(v.n)); if (!n || n < 2) return { result: "—", caption: "Enter a whole number ≥ 2" }; for (let i = 2; i * i <= n; i++) { if (n % i === 0) return { result: "Not prime", caption: n + " = " + i + " × " + (n / i) }; } return { result: "Prime ✓", caption: n + " has no divisors other than 1 and itself" }; };

export default function Page() {
  return (
    <CalcTool title={"Prime Number Checker"} description={"Check whether a number is prime and see its factors if it isn't."} note={""} fields={fields} compute={compute} />
  );
}
