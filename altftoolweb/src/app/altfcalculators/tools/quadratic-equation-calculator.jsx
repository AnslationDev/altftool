"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, round } from "./format";

export default function QuadraticEquationCalculator() {
  const [a, setA] = useState("1");
  const [b, setB] = useState("-3");
  const [c, setC] = useState("2");

  const result = useMemo(() => {
    const A = num(a);
    const B = num(b);
    const C = num(c);
    if (A === null || B === null || C === null) return null;
    if (A === 0) {
      if (B === 0) return null;
      return { linear: true, root: round(-C / B, 4) };
    }
    const disc = B * B - 4 * A * C;
    const twoA = 2 * A;
    if (disc > 0) {
      const sq = Math.sqrt(disc);
      return { type: "real", disc, r1: round((-B + sq) / twoA, 4), r2: round((-B - sq) / twoA, 4) };
    }
    if (disc === 0) {
      return { type: "double", disc, r1: round(-B / twoA, 4) };
    }
    const sq = Math.sqrt(-disc);
    const re = round(-B / twoA, 4);
    const im = round(sq / twoA, 4);
    return { type: "complex", disc, re, im };
  }, [a, b, c]);

  return (
    <div className="afc-calc">
      <p className="afc-note afc-eq">a x² + b x + c = 0</p>
      <Grid cols={3}>
        <Field label="a">
          <NumberInput value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label="b">
          <NumberInput value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
        <Field label="c">
          <NumberInput value={c} onChange={(e) => setC(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Roots">
          {result.linear ? (
            <ResultStat label="Linear equation (a = 0)" value={`x = ${result.root}`} accent />
          ) : result.type === "real" ? (
            <>
              <ResultStat label="Two real roots" value={`x₁ = ${result.r1},  x₂ = ${result.r2}`} accent />
              <div className="afc-result-rows">
                <ResultRow label="Discriminant" value={round(result.disc, 4)} strong />
              </div>
            </>
          ) : result.type === "double" ? (
            <>
              <ResultStat label="One repeated root" value={`x = ${result.r1}`} accent />
              <div className="afc-result-rows">
                <ResultRow label="Discriminant" value={0} strong />
              </div>
            </>
          ) : (
            <>
              <ResultStat
                label="Two complex roots"
                value={`${result.re} ± ${Math.abs(result.im)}i`}
                accent
              />
              <div className="afc-result-rows">
                <ResultRow label="Discriminant" value={round(result.disc, 4)} strong />
              </div>
            </>
          )}
        </ResultPanel>
      ) : (
        <ResultPanel title="Roots" muted>
          <p className="afc-note">Enter coefficients a, b and c (a ≠ 0 for a quadratic).</p>
        </ResultPanel>
      )}
    </div>
  );
}
