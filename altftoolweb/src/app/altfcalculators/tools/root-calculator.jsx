"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

// Real n-th root, correct for negative radicands with odd integer index.
function nthRoot(x, n) {
  if (n === 0) return NaN;
  if (x < 0) {
    if (Number.isInteger(n) && Math.abs(n % 2) === 1) return -Math.pow(-x, 1 / n);
    return NaN;
  }
  return Math.pow(x, 1 / n);
}

export default function RootCalculator() {
  const [type, setType] = useState("sqrt");
  const [number, setNumber] = useState("144");
  const [nth, setNth] = useState("5");

  const r = useMemo(() => {
    const x = num(number);
    if (x === null) return null;
    let n;
    if (type === "sqrt") n = 2;
    else if (type === "cbrt") n = 3;
    else {
      const nn = num(nth);
      if (nn === null || nn === 0) return { error: "Enter a non-zero root index (n)." };
      n = nn;
    }
    const value = nthRoot(x, n);
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return { error: "No real root exists (an even root of a negative number is undefined in real numbers)." };
    }
    const label = n === 2 ? `√${x}` : n === 3 ? `∛${x}` : `${n}√${x}`;
    return { value, n, label, x };
  }, [type, number, nth]);

  return (
    <div className="afc-calc">
      <Field label="Root type">
        <Segmented
          name="type"
          value={type}
          onChange={setType}
          options={[
            { label: "Square root", value: "sqrt" },
            { label: "Cube root", value: "cbrt" },
            { label: "Nth root", value: "nth" },
          ]}
        />
      </Field>

      <Grid cols={2}>
        <Field label="Number">
          <NumberInput value={number} step="any" onChange={(e) => setNumber(e.target.value)} />
        </Field>
        {type === "nth" ? (
          <Field label="Root index (n)">
            <NumberInput value={nth} step="1" onChange={(e) => setNth(e.target.value)} />
          </Field>
        ) : null}
      </Grid>

      {r && !r.error ? (
        <ResultPanel title="Result">
          <ResultStat label={`${r.label}`} value={fmt(r.value, 8)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Verification" value={`${fmt(r.value, 6)} ^ ${r.n} = ${fmt(Math.pow(r.value, r.n), 4)}`} />
            <ResultRow label="Exact value" value={String(r.value)} strong />
          </div>
          <CalcNote>The n-th root of x equals x raised to the power 1/n.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Result" muted>
          <p className="afc-note">{r?.error || "Enter a number to find its root."}</p>
        </ResultPanel>
      )}
    </div>
  );
}
