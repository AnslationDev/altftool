"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, RadioCards, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

const SHAPES = [
  {
    value: "rectangle",
    label: "Rectangle",
    desc: "length × width",
    inputs: [["l", "Length"], ["w", "Width"]],
    eq: "A = l × w",
    area: (v) => v.l * v.w,
    subbed: (v) => `${fmt(v.l, 4)} × ${fmt(v.w, 4)}`,
  },
  {
    value: "square",
    label: "Square",
    desc: "side²",
    inputs: [["s", "Side length"]],
    eq: "A = s²",
    area: (v) => v.s * v.s,
    subbed: (v) => `${fmt(v.s, 4)}²`,
  },
  {
    value: "triangle",
    label: "Triangle",
    desc: "½ × base × height",
    inputs: [["b", "Base"], ["h", "Height"]],
    eq: "A = ½ × b × h",
    area: (v) => 0.5 * v.b * v.h,
    subbed: (v) => `½ × ${fmt(v.b, 4)} × ${fmt(v.h, 4)}`,
  },
  {
    value: "circle",
    label: "Circle",
    desc: "π × r²",
    inputs: [["r", "Radius"]],
    eq: "A = π × r²",
    area: (v) => Math.PI * v.r * v.r,
    subbed: (v) => `π × ${fmt(v.r, 4)}²`,
  },
  {
    value: "trapezoid",
    label: "Trapezoid",
    desc: "½ (a + b) × height",
    inputs: [["a", "Parallel side a"], ["b", "Parallel side b"], ["h", "Height"]],
    eq: "A = ½ × (a + b) × h",
    area: (v) => 0.5 * (v.a + v.b) * v.h,
    subbed: (v) => `½ × (${fmt(v.a, 4)} + ${fmt(v.b, 4)}) × ${fmt(v.h, 4)}`,
  },
  {
    value: "parallelogram",
    label: "Parallelogram",
    desc: "base × height",
    inputs: [["b", "Base"], ["h", "Height"]],
    eq: "A = b × h",
    area: (v) => v.b * v.h,
    subbed: (v) => `${fmt(v.b, 4)} × ${fmt(v.h, 4)}`,
  },
  {
    value: "ellipse",
    label: "Ellipse",
    desc: "π × a × b (semi-axes)",
    inputs: [["a", "Semi-axis a"], ["b", "Semi-axis b"]],
    eq: "A = π × a × b",
    area: (v) => Math.PI * v.a * v.b,
    subbed: (v) => `π × ${fmt(v.a, 4)} × ${fmt(v.b, 4)}`,
  },
];

export default function AreaCalculator() {
  const [shape, setShape] = useState("rectangle");
  const [vals, setVals] = useState({ l: "12", w: "8", s: "6", b: "9", h: "5", r: "7", a: "6" });

  const set = (k) => (e) => setVals((prev) => ({ ...prev, [k]: e.target.value }));

  const current = SHAPES.find((s) => s.value === shape);

  const result = useMemo(() => {
    const v = {};
    for (const [k] of current.inputs) {
      const n = num(vals[k]);
      if (n === null || n <= 0) return null;
      v[k] = n;
    }
    return { area: current.area(v), subbed: current.subbed(v) };
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
        <ResultPanel title={`${current.label} area`}>
          <ResultStat label="Area" value={fmt(result.area, 4)} sub="square units" accent />
          <div className="afc-result-rows">
            <ResultRow label="Formula" value={current.eq} />
            <ResultRow label="Calculation" value={`${result.subbed} = ${fmt(result.area, 4)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title={`${current.label} area`} muted>
          <p className="afc-note">Enter positive dimensions to calculate the area.</p>
        </ResultPanel>
      )}
    </div>
  );
}
