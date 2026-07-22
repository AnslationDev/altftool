"use client";

import React, { useMemo, useState } from "react";
import {
  Field,
  NumberInput,
  Segmented,
  Grid,
  ResultPanel,
  ResultStat,
  ResultRow,
  CalcNote,
} from "./ui";
import { num, fmt } from "./format";

// A duration in seconds from hours / minutes / seconds fields.
// Empty fields count as 0; returns null only when every field is empty.
function durationSeconds(h, m, s) {
  const H = num(h);
  const M = num(m);
  const S = num(s);
  if (H === null && M === null && S === null) return null;
  return (H || 0) * 3600 + (M || 0) * 60 + (S || 0);
}

function hms(totalSeconds) {
  const t = Math.round(Math.abs(totalSeconds));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimeCalculator() {
  const [h1, setH1] = useState("2");
  const [m1, setM1] = useState("30");
  const [s1, setS1] = useState("0");
  const [op, setOp] = useState("add");
  const [h2, setH2] = useState("1");
  const [m2, setM2] = useState("45");
  const [s2, setS2] = useState("30");

  const result = useMemo(() => {
    const d1 = durationSeconds(h1, m1, s1);
    const d2 = durationSeconds(h2, m2, s2);
    if (d1 === null && d2 === null) return null;
    const a = d1 || 0;
    const b = d2 || 0;
    const combined = op === "subtract" ? a - b : a + b;
    const negative = combined < 0;
    const value = negative ? 0 : combined;
    return {
      negative,
      hms: hms(value),
      totalSeconds: value,
      totalMinutes: value / 60,
      totalHours: value / 3600,
    };
  }, [h1, m1, s1, op, h2, m2, s2]);

  return (
    <div className="afc-calc">
      <Field label="First duration (h : m : s)">
        <Grid cols={3}>
          <NumberInput suffix="h" value={h1} min="0" step="1" onChange={(e) => setH1(e.target.value)} />
          <NumberInput suffix="m" value={m1} min="0" step="1" onChange={(e) => setM1(e.target.value)} />
          <NumberInput suffix="s" value={s1} min="0" step="1" onChange={(e) => setS1(e.target.value)} />
        </Grid>
      </Field>

      <Field label="Operation">
        <Segmented
          name="op"
          value={op}
          onChange={setOp}
          options={[
            { label: "Add ( + )", value: "add" },
            { label: "Subtract ( − )", value: "subtract" },
          ]}
        />
      </Field>

      <Field label="Second duration (h : m : s)">
        <Grid cols={3}>
          <NumberInput suffix="h" value={h2} min="0" step="1" onChange={(e) => setH2(e.target.value)} />
          <NumberInput suffix="m" value={m2} min="0" step="1" onChange={(e) => setM2(e.target.value)} />
          <NumberInput suffix="s" value={s2} min="0" step="1" onChange={(e) => setS2(e.target.value)} />
        </Grid>
      </Field>

      {result ? (
        <ResultPanel title="Result">
          <ResultStat label="Duration (H:MM:SS)" value={result.hms} accent />
          <div className="afc-result-rows">
            <ResultRow label="Total hours" value={`${fmt(result.totalHours, 4)} h`} />
            <ResultRow label="Total minutes" value={`${fmt(result.totalMinutes, 2)} min`} />
            <ResultRow label="Total seconds" value={`${fmt(result.totalSeconds, 0)} s`} strong />
          </div>
          {result.negative ? (
            <CalcNote>The second duration is larger than the first, so subtracting gives a negative time. Showing 0:00:00 — swap the durations to see the gap.</CalcNote>
          ) : null}
        </ResultPanel>
      ) : (
        <ResultPanel title="Result" muted>
          <p className="afc-note">Enter at least one duration to combine.</p>
        </ResultPanel>
      )}
    </div>
  );
}
