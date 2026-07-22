"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

export default function ExponentCalculator() {
  const [base, setBase] = useState("2");
  const [exp, setExp] = useState("10");

  const r = useMemo(() => {
    const b = num(base), e = num(exp);
    if (b === null || e === null) return null;
    const value = Math.pow(b, e);
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return { error: "Result is undefined for these values (e.g. a negative base with a fractional exponent, or 0 to a negative power)." };
    }
    return { value, b, e };
  }, [base, exp]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Base">
          <NumberInput value={base} step="any" onChange={(e) => setBase(e.target.value)} />
        </Field>
        <Field label="Exponent (power)">
          <NumberInput value={exp} step="any" onChange={(e) => setExp(e.target.value)} />
        </Field>
      </Grid>

      {r && !r.error ? (
        <ResultPanel title="Result">
          <ResultStat label={`${r.b} ^ ${r.e}`} value={fmt(r.value, 8)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Expression" value={`${r.b}^${r.e}`} />
            <ResultRow label="Exact value" value={String(r.value)} strong />
          </div>
          <CalcNote>A negative exponent gives a reciprocal (b⁻ⁿ = 1 / bⁿ) and a fractional exponent gives a root (b^(1/n) = ⁿ√b).</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Result" muted>
          <p className="afc-note">{r?.error || "Enter a base and an exponent."}</p>
        </ResultPanel>
      )}
    </div>
  );
}
