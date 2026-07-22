"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, round } from "./format";

function gcd(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

export default function RatioCalculator() {
  // Solve A : B = C : D with exactly one field blank.
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("9");
  const [d, setD] = useState("");

  const result = useMemo(() => {
    const vals = { a: num(a), b: num(b), c: num(c), d: num(d) };
    const blanks = Object.keys(vals).filter((k) => vals[k] === null);
    if (blanks.length !== 1) return null;
    const missing = blanks[0];
    const { a: A, b: B, c: C, d: D } = vals;

    let solved;
    // A/B = C/D
    if (missing === "d") {
      if (A === 0) return null;
      solved = (B * C) / A;
    } else if (missing === "c") {
      if (B === 0) return null;
      solved = (A * D) / B;
    } else if (missing === "b") {
      if (C === 0) return null;
      solved = (A * D) / C;
    } else {
      if (D === 0) return null;
      solved = (B * C) / D;
    }
    if (!Number.isFinite(solved)) return null;

    const full = { ...vals, [missing]: solved };
    // Simplify the left ratio if both are integers
    let simplified = null;
    if (Number.isInteger(full.a) && Number.isInteger(full.b) && full.b !== 0) {
      const g = gcd(full.a, full.b);
      simplified = `${full.a / g} : ${full.b / g}`;
    }
    return { missing, solved: round(solved, 4), full, simplified };
  }, [a, b, c, d]);

  return (
    <div className="afc-calc">
      <p className="afc-note afc-eq">A : B = C : D  ·  leave one box empty to solve for it</p>
      <Grid cols={4}>
        <Field label="A">
          <NumberInput value={a} onChange={(e) => setA(e.target.value)} placeholder="A" />
        </Field>
        <Field label="B">
          <NumberInput value={b} onChange={(e) => setB(e.target.value)} placeholder="B" />
        </Field>
        <Field label="C">
          <NumberInput value={c} onChange={(e) => setC(e.target.value)} placeholder="C" />
        </Field>
        <Field label="D">
          <NumberInput value={d} onChange={(e) => setD(e.target.value)} placeholder="D" />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Solved">
          <ResultStat label={`Missing value (${result.missing.toUpperCase()})`} value={result.solved} accent />
          <div className="afc-result-rows">
            <ResultRow
              label="Full proportion"
              value={`${round(result.full.a, 4)} : ${round(result.full.b, 4)} = ${round(result.full.c, 4)} : ${round(result.full.d, 4)}`}
            />
            {result.simplified ? (
              <ResultRow label="Simplified left ratio" value={result.simplified} strong />
            ) : null}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Solved" muted>
          <p className="afc-note">Fill three boxes and leave exactly one empty to solve.</p>
        </ResultPanel>
      )}
    </div>
  );
}
