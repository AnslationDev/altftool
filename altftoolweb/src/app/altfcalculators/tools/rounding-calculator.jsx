"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Select, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

const MODES = {
  d0: { step: 1, label: "Nearest whole number", places: 0 },
  d1: { step: 0.1, label: "1 decimal place", places: 1 },
  d2: { step: 0.01, label: "2 decimal places", places: 2 },
  d3: { step: 0.001, label: "3 decimal places", places: 3 },
  n10: { step: 10, label: "Nearest 10", places: 0 },
  n100: { step: 100, label: "Nearest 100", places: 0 },
  n1000: { step: 1000, label: "Nearest 1000", places: 0 },
};

export default function RoundingCalculator() {
  const [number, setNumber] = useState("3.14159");
  const [mode, setMode] = useState("d2");

  const r = useMemo(() => {
    const x = num(number);
    if (x === null) return null;
    const m = MODES[mode];
    const q = x / m.step;
    const rounded = Math.round(q) * m.step;
    const down = Math.floor(q) * m.step;
    const up = Math.ceil(q) * m.step;
    // Clean floating-point residue to the mode's precision.
    const p = m.places;
    const clean = (v) => Math.round((v + Number.EPSILON) * 1e6) / 1e6;
    return { rounded: clean(rounded), down: clean(down), up: clean(up), places: p, label: m.label };
  }, [number, mode]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Number">
          <NumberInput value={number} step="any" onChange={(e) => setNumber(e.target.value)} />
        </Field>
        <Field label="Round to">
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="d0">Nearest whole number</option>
            <option value="d1">1 decimal place</option>
            <option value="d2">2 decimal places</option>
            <option value="d3">3 decimal places</option>
            <option value="n10">Nearest 10</option>
            <option value="n100">Nearest 100</option>
            <option value="n1000">Nearest 1000</option>
          </Select>
        </Field>
      </Grid>

      {r ? (
        <ResultPanel title="Rounded value">
          <ResultStat label={`Rounded — ${r.label}`} value={fmt(r.rounded, Math.max(r.places, 0))} accent />
          <div className="afc-result-rows">
            <ResultRow label="Rounded down (floor)" value={fmt(r.down, Math.max(r.places, 0))} />
            <ResultRow label="Rounded up (ceil)" value={fmt(r.up, Math.max(r.places, 0))} />
          </div>
          <CalcNote>The headline value uses round-half-up (a trailing 5 rounds toward the larger value).</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Rounded value" muted>
          <p className="afc-note">Enter a number to round.</p>
        </ResultPanel>
      )}
    </div>
  );
}
