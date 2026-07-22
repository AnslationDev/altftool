"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, RadioCards, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

const SHAPES = [
  {
    value: "cube",
    label: "Cube",
    desc: "6 × side²",
    inputs: [["s", "Side length"]],
    eq: "SA = 6 × s²",
    sa: (v) => 6 * v.s ** 2,
  },
  {
    value: "box",
    label: "Box",
    desc: "2(lw + lh + wh)",
    inputs: [["l", "Length"], ["w", "Width"], ["h", "Height"]],
    eq: "SA = 2(lw + lh + wh)",
    sa: (v) => 2 * (v.l * v.w + v.l * v.h + v.w * v.h),
  },
  {
    value: "sphere",
    label: "Sphere",
    desc: "4 π r²",
    inputs: [["r", "Radius"]],
    eq: "SA = 4 × π × r²",
    sa: (v) => 4 * Math.PI * v.r ** 2,
  },
  {
    value: "cylinder",
    label: "Cylinder",
    desc: "2 π r (r + h)",
    inputs: [["r", "Radius"], ["h", "Height"]],
    eq: "SA = 2 × π × r × (r + h)",
    sa: (v) => 2 * Math.PI * v.r * (v.r + v.h),
  },
  {
    value: "cone",
    label: "Cone",
    desc: "π r (r + slant)",
    inputs: [["r", "Radius"], ["h", "Height"]],
    eq: "SA = π × r × (r + √(r² + h²))",
    sa: (v) => Math.PI * v.r * (v.r + Math.sqrt(v.r ** 2 + v.h ** 2)),
    extra: (v) => [["Slant height (l)", Math.sqrt(v.r ** 2 + v.h ** 2)]],
  },
];

export default function SurfaceAreaCalculator() {
  const [shape, setShape] = useState("cube");
  const [vals, setVals] = useState({ s: "5", l: "12", w: "8", h: "6", r: "4" });

  const set = (k) => (e) => setVals((prev) => ({ ...prev, [k]: e.target.value }));

  const current = SHAPES.find((s) => s.value === shape);

  const result = useMemo(() => {
    const v = {};
    for (const [k] of current.inputs) {
      const n = num(vals[k]);
      if (n === null || n <= 0) return null;
      v[k] = n;
    }
    return { sa: current.sa(v), extra: current.extra ? current.extra(v) : [] };
  }, [current, vals]);

  return (
    <div className="afc-calc">
      <Field label="Shape">
        <RadioCards
          name="shape"
          value={shape}
          onChange={setShape}
          options={SHAPES.map((s) => ({ label: s.label, value: s.value, desc: s.desc }))}
        />
      </Field>

      <Grid cols={current.inputs.length >= 3 ? 3 : 2}>
        {current.inputs.map(([k, label]) => (
          <Field key={k} label={label}>
            <NumberInput value={vals[k] ?? ""} min="0" step="any" onChange={set(k)} placeholder="0" />
          </Field>
        ))}
      </Grid>

      {result ? (
        <ResultPanel title={`${current.label} surface area`}>
          <ResultStat label="Surface area" value={fmt(result.sa, 4)} sub="square units" accent />
          <div className="afc-result-rows">
            <ResultRow label="Formula" value={current.eq} />
            {result.extra.map(([label, val]) => (
              <ResultRow key={label} label={label} value={fmt(val, 4)} />
            ))}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title={`${current.label} surface area`} muted>
          <p className="afc-note">Enter positive dimensions to calculate the surface area.</p>
        </ResultPanel>
      )}
    </div>
  );
}
