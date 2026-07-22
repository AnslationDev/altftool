"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

const KNOWN = [
  { label: "Radius", value: "r" },
  { label: "Diameter", value: "d" },
  { label: "Circumference", value: "c" },
  { label: "Area", value: "a" },
];

const LABELS = { r: "Radius (r)", d: "Diameter (d)", c: "Circumference (C)", a: "Area (A)" };

export default function CircleCalculator() {
  const [known, setKnown] = useState("r");
  const [value, setValue] = useState("7");

  const result = useMemo(() => {
    const x = num(value);
    if (x === null || x <= 0) return null;
    let r;
    if (known === "r") r = x;
    else if (known === "d") r = x / 2;
    else if (known === "c") r = x / (2 * Math.PI);
    else r = Math.sqrt(x / Math.PI); // area
    return {
      r,
      d: 2 * r,
      c: 2 * Math.PI * r,
      a: Math.PI * r * r,
    };
  }, [known, value]);

  return (
    <div className="afc-calc">
      <Field label="Known value" hint="Pick which property you already have.">
        <Segmented name="known" options={KNOWN} value={known} onChange={setKnown} />
      </Field>

      <Field label={LABELS[known]}>
        <NumberInput value={value} min="0" step="any" onChange={(e) => setValue(e.target.value)} placeholder="0" />
      </Field>

      {result ? (
        <ResultPanel title="Circle properties">
          <ResultStat label="Radius" value={fmt(result.r, 4)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Diameter" value={fmt(result.d, 4)} />
            <ResultRow label="Circumference" value={fmt(result.c, 4)} />
            <ResultRow label="Area" value={fmt(result.a, 4)} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Circle properties" muted>
          <p className="afc-note">Enter a positive value to solve the circle.</p>
        </ResultPanel>
      )}
    </div>
  );
}
