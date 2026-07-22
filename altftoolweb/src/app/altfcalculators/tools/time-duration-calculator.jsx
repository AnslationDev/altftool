"use client";

import React, { useMemo, useState } from "react";
import { Field, TextInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { fmt, round } from "./format";

function toMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export default function TimeDurationCalculator() {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:30");
  const [overnight, setOvernight] = useState("no");

  const result = useMemo(() => {
    const s = toMinutes(start);
    let e = toMinutes(end);
    if (s === null || e === null) return null;
    if (e < s || overnight === "yes") {
      if (e <= s) e += 24 * 60; // roll over midnight
    }
    let mins = e - s;
    if (mins < 0) return null;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return { hours, minutes, totalMinutes: mins, decimalHours: round(mins / 60, 2) };
  }, [start, end, overnight]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Start time">
          <TextInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="End time">
          <TextInput type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </Grid>
      <Field label="Crosses midnight?">
        <Segmented
          name="overnight"
          value={overnight}
          onChange={setOvernight}
          options={[
            { label: "No", value: "no" },
            { label: "Yes (overnight)", value: "yes" },
          ]}
        />
      </Field>

      {result ? (
        <ResultPanel title="Duration">
          <ResultStat label="Hours and minutes" value={`${result.hours} h  ${result.minutes} m`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Total minutes" value={fmt(result.totalMinutes, 0)} />
            <ResultRow label="Decimal hours" value={result.decimalHours} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Duration" muted>
          <p className="afc-note">Enter a start and end time.</p>
        </ResultPanel>
      )}
    </div>
  );
}
