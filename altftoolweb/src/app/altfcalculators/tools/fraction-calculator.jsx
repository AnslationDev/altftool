"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Select, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, round, gcd } from "./format";

export default function FractionCalculator() {
  const [n1, setN1] = useState("1");
  const [d1, setD1] = useState("2");
  const [op, setOp] = useState("+");
  const [n2, setN2] = useState("1");
  const [d2, setD2] = useState("3");

  const r = useMemo(() => {
    const N1 = num(n1), D1 = num(d1), N2 = num(n2), D2 = num(d2);
    if (N1 === null || D1 === null || N2 === null || D2 === null) return null;
    if (D1 === 0 || D2 === 0) return { error: "A denominator cannot be zero." };

    let n, d;
    if (op === "+") { n = N1 * D2 + N2 * D1; d = D1 * D2; }
    else if (op === "-") { n = N1 * D2 - N2 * D1; d = D1 * D2; }
    else if (op === "*") { n = N1 * N2; d = D1 * D2; }
    else {
      if (N2 === 0) return { error: "Cannot divide by a fraction equal to zero." };
      n = N1 * D2; d = D1 * N2;
    }
    if (d === 0) return { error: "Result is undefined (division by zero)." };

    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    const sn = n / g;
    const sd = d / g;
    const decimal = n / d;

    const fractionText = sd === 1 ? `${sn}` : `${sn}/${sd}`;
    let mixed = null;
    if (sd !== 1 && Math.abs(sn) > sd) {
      const whole = Math.trunc(sn / sd);
      const rem = Math.abs(sn % sd);
      mixed = `${whole} ${rem}/${sd}`;
    }
    return { fractionText, decimal: round(decimal, 6), mixed };
  }, [n1, d1, op, n2, d2]);

  const opSymbol = { "+": "+", "-": "−", "*": "×", "/": "÷" }[op];

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Numerator 1">
          <NumberInput value={n1} step="1" onChange={(e) => setN1(e.target.value)} />
        </Field>
        <Field label="Denominator 1">
          <NumberInput value={d1} step="1" onChange={(e) => setD1(e.target.value)} />
        </Field>
        <Field label="Operation">
          <Select value={op} onChange={(e) => setOp(e.target.value)}>
            <option value="+">Add (+)</option>
            <option value="-">Subtract (−)</option>
            <option value="*">Multiply (×)</option>
            <option value="/">Divide (÷)</option>
          </Select>
        </Field>
      </Grid>
      <Grid cols={2}>
        <Field label="Numerator 2">
          <NumberInput value={n2} step="1" onChange={(e) => setN2(e.target.value)} />
        </Field>
        <Field label="Denominator 2">
          <NumberInput value={d2} step="1" onChange={(e) => setD2(e.target.value)} />
        </Field>
      </Grid>

      {r && !r.error ? (
        <ResultPanel title="Result">
          <ResultStat label={`${n1}/${d1} ${opSymbol} ${n2}/${d2}`} value={r.fractionText} accent />
          <div className="afc-result-rows">
            <ResultRow label="Decimal" value={r.decimal} strong />
            {r.mixed ? <ResultRow label="Mixed number" value={r.mixed} /> : null}
          </div>
          <CalcNote>Enter whole numbers for numerators and denominators. The answer is reduced to lowest terms.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Result" muted>
          <p className="afc-note">{r?.error || "Enter both fractions to calculate."}</p>
        </ResultPanel>
      )}
    </div>
  );
}
