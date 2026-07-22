"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

const MODES = [
  { label: "Find hypotenuse (c)", value: "hyp" },
  { label: "Find a leg", value: "leg" },
];

export default function PythagoreanTheoremCalculator() {
  const [mode, setMode] = useState("hyp");
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("13");
  const [leg, setLeg] = useState("5");

  const result = useMemo(() => {
    if (mode === "hyp") {
      const aa = num(a), bb = num(b);
      if (aa === null || bb === null || aa <= 0 || bb <= 0) return null;
      return { ok: true, label: "Hypotenuse (c)", value: Math.sqrt(aa * aa + bb * bb), eq: "c = √(a² + b²)" };
    }
    const cc = num(c), lg = num(leg);
    if (cc === null || lg === null || cc <= 0 || lg <= 0) return null;
    if (cc <= lg) return { ok: false };
    return { ok: true, label: "Other leg", value: Math.sqrt(cc * cc - lg * lg), eq: "leg = √(c² − a²)" };
  }, [mode, a, b, c, leg]);

  return (
    <div className="afc-calc">
      <Field label="Solve for">
        <Segmented name="mode" options={MODES} value={mode} onChange={setMode} />
      </Field>

      {mode === "hyp" ? (
        <Grid cols={2}>
          <Field label="Leg a"><NumberInput value={a} min="0" step="any" onChange={(e) => setA(e.target.value)} placeholder="0" /></Field>
          <Field label="Leg b"><NumberInput value={b} min="0" step="any" onChange={(e) => setB(e.target.value)} placeholder="0" /></Field>
        </Grid>
      ) : (
        <Grid cols={2}>
          <Field label="Hypotenuse c"><NumberInput value={c} min="0" step="any" onChange={(e) => setC(e.target.value)} placeholder="0" /></Field>
          <Field label="Known leg"><NumberInput value={leg} min="0" step="any" onChange={(e) => setLeg(e.target.value)} placeholder="0" /></Field>
        </Grid>
      )}

      {result && result.ok ? (
        <ResultPanel title="Right-triangle side">
          <ResultStat label={result.label} value={fmt(result.value, 6)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Formula" value={result.eq} strong />
          </div>
        </ResultPanel>
      ) : result && result.ok === false ? (
        <ResultPanel title="Right-triangle side" muted>
          <p className="afc-error">The hypotenuse must be longer than the known leg.</p>
        </ResultPanel>
      ) : (
        <ResultPanel title="Right-triangle side" muted>
          <p className="afc-note">Enter positive side lengths to solve.</p>
        </ResultPanel>
      )}
    </div>
  );
}
