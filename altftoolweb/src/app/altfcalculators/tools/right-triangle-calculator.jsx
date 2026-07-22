"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

export default function RightTriangleCalculator() {
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");

  const result = useMemo(() => {
    const aa = num(a), bb = num(b);
    if (aa === null || bb === null || aa <= 0 || bb <= 0) return null;
    const c = Math.sqrt(aa * aa + bb * bb);
    const area = 0.5 * aa * bb;
    const perimeter = aa + bb + c;
    const angleA = (Math.atan(aa / bb) * 180) / Math.PI; // angle opposite leg a
    const angleB = 90 - angleA; // angle opposite leg b
    return { c, area, perimeter, angleA, angleB };
  }, [a, b]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Leg a"><NumberInput value={a} min="0" step="any" onChange={(e) => setA(e.target.value)} placeholder="0" /></Field>
        <Field label="Leg b"><NumberInput value={b} min="0" step="any" onChange={(e) => setB(e.target.value)} placeholder="0" /></Field>
      </Grid>

      {result ? (
        <ResultPanel title="Right triangle">
          <ResultStat label="Hypotenuse (c)" value={fmt(result.c, 6)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Area" value={`${fmt(result.area, 4)} sq units`} />
            <ResultRow label="Perimeter" value={fmt(result.perimeter, 4)} />
            <ResultRow label="Angle A (opposite a)" value={`${fmt(result.angleA, 2)}°`} />
            <ResultRow label="Angle B (opposite b)" value={`${fmt(result.angleB, 2)}°`} />
            <ResultRow label="Right angle" value="90°" strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Right triangle" muted>
          <p className="afc-note">Enter both leg lengths to solve the triangle.</p>
        </ResultPanel>
      )}
    </div>
  );
}
