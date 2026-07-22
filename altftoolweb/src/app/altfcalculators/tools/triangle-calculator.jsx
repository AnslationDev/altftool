"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

const MODES = [
  { label: "Base & height", value: "bh" },
  { label: "Three sides", value: "sides" },
];

export default function TriangleCalculator() {
  const [mode, setMode] = useState("bh");
  const [base, setBase] = useState("10");
  const [height, setHeight] = useState("6");
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("5");

  const result = useMemo(() => {
    if (mode === "bh") {
      const bb = num(base), hh = num(height);
      if (bb === null || hh === null || bb <= 0 || hh <= 0) return null;
      return { ok: true, area: 0.5 * bb * hh };
    }
    const aa = num(a), bb = num(b), cc = num(c);
    if (aa === null || bb === null || cc === null || aa <= 0 || bb <= 0 || cc <= 0) return null;
    // Triangle inequality: sum of any two sides must exceed the third.
    if (aa + bb <= cc || aa + cc <= bb || bb + cc <= aa) return { ok: false };
    const s = (aa + bb + cc) / 2;
    const area = Math.sqrt(s * (s - aa) * (s - bb) * (s - cc));
    return { ok: true, area, perimeter: aa + bb + cc, s };
  }, [mode, base, height, a, b, c]);

  return (
    <div className="afc-calc">
      <Field label="Method">
        <Segmented name="mode" options={MODES} value={mode} onChange={setMode} />
      </Field>

      {mode === "bh" ? (
        <Grid cols={2}>
          <Field label="Base"><NumberInput value={base} min="0" step="any" onChange={(e) => setBase(e.target.value)} placeholder="0" /></Field>
          <Field label="Height"><NumberInput value={height} min="0" step="any" onChange={(e) => setHeight(e.target.value)} placeholder="0" /></Field>
        </Grid>
      ) : (
        <Grid cols={3}>
          <Field label="Side a"><NumberInput value={a} min="0" step="any" onChange={(e) => setA(e.target.value)} placeholder="0" /></Field>
          <Field label="Side b"><NumberInput value={b} min="0" step="any" onChange={(e) => setB(e.target.value)} placeholder="0" /></Field>
          <Field label="Side c"><NumberInput value={c} min="0" step="any" onChange={(e) => setC(e.target.value)} placeholder="0" /></Field>
        </Grid>
      )}

      {result && result.ok ? (
        <ResultPanel title="Triangle area">
          <ResultStat label="Area" value={fmt(result.area, 4)} sub="square units" accent />
          <div className="afc-result-rows">
            {mode === "bh" ? (
              <ResultRow label="Formula" value="A = ½ × base × height" />
            ) : (
              <>
                <ResultRow label="Formula" value="A = √(s(s−a)(s−b)(s−c))" />
                <ResultRow label="Semi-perimeter (s)" value={fmt(result.s, 4)} />
                <ResultRow label="Perimeter" value={fmt(result.perimeter, 4)} strong />
              </>
            )}
          </div>
        </ResultPanel>
      ) : result && result.ok === false ? (
        <ResultPanel title="Triangle area" muted>
          <p className="afc-error">These side lengths cannot form a triangle. Each side must be shorter than the sum of the other two.</p>
        </ResultPanel>
      ) : (
        <ResultPanel title="Triangle area" muted>
          <p className="afc-note">Enter positive values to calculate the area.</p>
        </ResultPanel>
      )}
    </div>
  );
}
