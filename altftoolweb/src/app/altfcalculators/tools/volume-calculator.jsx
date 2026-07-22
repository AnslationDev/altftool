"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, RadioCards, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

const SHAPES = [
  {
    value: "cube",
    label: "Cube",
    desc: "side³",
    inputs: [["s", "Side length"]],
    eq: "V = s³",
    vol: (v) => v.s ** 3,
    subbed: (v) => `${fmt(v.s, 4)}³`,
  },
  {
    value: "box",
    label: "Box",
    desc: "length × width × height",
    inputs: [["l", "Length"], ["w", "Width"], ["h", "Height"]],
    eq: "V = l × w × h",
    vol: (v) => v.l * v.w * v.h,
    subbed: (v) => `${fmt(v.l, 4)} × ${fmt(v.w, 4)} × ${fmt(v.h, 4)}`,
  },
  {
    value: "sphere",
    label: "Sphere",
    desc: "4⁄3 π r³",
    inputs: [["r", "Radius"]],
    eq: "V = 4⁄3 × π × r³",
    vol: (v) => (4 / 3) * Math.PI * v.r ** 3,
    subbed: (v) => `4⁄3 × π × ${fmt(v.r, 4)}³`,
  },
  {
    value: "cylinder",
    label: "Cylinder",
    desc: "π r² h",
    inputs: [["r", "Radius"], ["h", "Height"]],
    eq: "V = π × r² × h",
    vol: (v) => Math.PI * v.r ** 2 * v.h,
    subbed: (v) => `π × ${fmt(v.r, 4)}² × ${fmt(v.h, 4)}`,
  },
  {
    value: "cone",
    label: "Cone",
    desc: "1⁄3 π r² h",
    inputs: [["r", "Radius"], ["h", "Height"]],
    eq: "V = 1⁄3 × π × r² × h",
    vol: (v) => (1 / 3) * Math.PI * v.r ** 2 * v.h,
    subbed: (v) => `1⁄3 × π × ${fmt(v.r, 4)}² × ${fmt(v.h, 4)}`,
  },
  {
    value: "pyramid",
    label: "Pyramid",
    desc: "1⁄3 × base l × w × h",
    inputs: [["l", "Base length"], ["w", "Base width"], ["h", "Height"]],
    eq: "V = 1⁄3 × l × w × h",
    vol: (v) => (1 / 3) * v.l * v.w * v.h,
    subbed: (v) => `1⁄3 × ${fmt(v.l, 4)} × ${fmt(v.w, 4)} × ${fmt(v.h, 4)}`,
  },
];

export default function VolumeCalculator() {
  const [shape, setShape] = useState("box");
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
    return { vol: current.vol(v), subbed: current.subbed(v) };
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
        <ResultPanel title={`${current.label} volume`}>
          <ResultStat label="Volume" value={fmt(result.vol, 4)} sub="cubic units" accent />
          <div className="afc-result-rows">
            <ResultRow label="Formula" value={current.eq} />
            <ResultRow label="Calculation" value={`${result.subbed} = ${fmt(result.vol, 4)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title={`${current.label} volume`} muted>
          <p className="afc-note">Enter positive dimensions to calculate the volume.</p>
        </ResultPanel>
      )}
    </div>
  );
}
