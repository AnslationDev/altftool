"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat } from "./ui";
import { num, fmt, round } from "./format";

const MODES = [
  { label: "% of a number", value: "of" },
  { label: "X is what % of Y", value: "isWhat" },
  { label: "% change", value: "change" },
];

export default function PercentageCalculator() {
  const [mode, setMode] = useState("of");
  const [a, setA] = useState("25");
  const [b, setB] = useState("200");

  const result = useMemo(() => {
    const x = num(a);
    const y = num(b);
    if (x === null || y === null) return null;

    if (mode === "of") {
      return { value: (x / 100) * y, label: `${round(x, 4)}% of ${round(y, 4)}` };
    }
    if (mode === "isWhat") {
      if (y === 0) return null;
      return { value: (x / y) * 100, label: `${round(x, 4)} is this % of ${round(y, 4)}`, suffix: "%" };
    }
    // change from x to y
    if (x === 0) return null;
    const change = ((y - x) / Math.abs(x)) * 100;
    return {
      value: change,
      label: `Change from ${round(x, 4)} to ${round(y, 4)}`,
      suffix: "%",
      sub: change >= 0 ? "Increase" : "Decrease",
    };
  }, [mode, a, b]);

  const labels =
    mode === "of"
      ? ["Percentage", "Of number"]
      : mode === "isWhat"
      ? ["Number (X)", "Total (Y)"]
      : ["From value", "To value"];

  return (
    <div className="afc-calc">
      <Field label="What do you want to calculate?">
        <Segmented name="mode" value={mode} onChange={setMode} options={MODES} />
      </Field>
      <Grid cols={2}>
        <Field label={labels[0]}>
          <NumberInput suffix={mode === "of" ? "%" : ""} value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label={labels[1]}>
          <NumberInput value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Answer">
          <ResultStat
            label={result.label}
            value={`${fmt(result.value, 4)}${result.suffix || ""}`}
            sub={result.sub}
            accent
          />
        </ResultPanel>
      ) : (
        <ResultPanel title="Answer" muted>
          <p className="afc-note">Enter both values to calculate.</p>
        </ResultPanel>
      )}
    </div>
  );
}
