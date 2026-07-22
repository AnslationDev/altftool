"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Select, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

const PITCHES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function RoofingCalculator() {
  const [length, setLength] = useState("40");
  const [width, setWidth] = useState("30");
  const [rise, setRise] = useState("6");

  const r = useMemo(() => {
    const L = num(length), W = num(width), ri = num(rise);
    if (L === null || W === null || ri === null || L <= 0 || W <= 0 || ri < 0) return null;
    const footprint = L * W;
    const mult = Math.sqrt(ri * ri + 144) / 12; // √(rise² + 12²) / 12
    const roofArea = footprint * mult;
    const squares = roofArea / 100;
    const bundles = Math.ceil(squares * 3); // ~3 bundles per square
    return { footprint, mult, roofArea, squares, bundles };
  }, [length, width, rise]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Footprint length">
          <NumberInput suffix="ft" value={length} min="0" onChange={(e) => setLength(e.target.value)} />
        </Field>
        <Field label="Footprint width">
          <NumberInput suffix="ft" value={width} min="0" onChange={(e) => setWidth(e.target.value)} />
        </Field>
        <Field label="Roof pitch (rise / 12)">
          <Select value={rise} onChange={(e) => setRise(e.target.value)}>
            {PITCHES.map((p) => (
              <option key={p} value={String(p)}>{p}/12</option>
            ))}
          </Select>
        </Field>
      </Grid>

      {r ? (
        <ResultPanel title="Roof estimate">
          <ResultStat label="Roof surface area" value={`${fmt(r.roofArea, 0)} ft²`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Footprint area" value={`${fmt(r.footprint, 0)} ft²`} />
            <ResultRow label="Pitch multiplier" value={fmt(r.mult, 4)} />
            <ResultRow label="Roofing squares" value={`${fmt(r.squares, 2)} squares`} />
            <ResultRow label="Shingle bundles (3 / square)" value={fmt(r.bundles, 0)} strong />
          </div>
          <CalcNote>
            A roofing "square" covers 100 ft² of roof surface. Most architectural shingles come 3
            bundles to a square. Add roughly 10% extra for waste, starter courses, hips and ridge
            caps. This estimates one continuous roof plane at the chosen pitch.
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Roof estimate" muted>
          <p className="afc-note">Enter the building footprint and choose a roof pitch.</p>
        </ResultPanel>
      )}
    </div>
  );
}
