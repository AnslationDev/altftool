"use client";

import React, { useMemo, useState } from "react";
import { Field, TextInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { fmt } from "./format";

export default function DateDifferenceCalculator() {
  const [start, setStart] = useState("2024-01-01");
  const [end, setEnd] = useState("2024-12-31");

  const result = useMemo(() => {
    if (!start || !end) return null;
    let a = new Date(start);
    let b = new Date(end);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
    if (b < a) [a, b] = [b, a];

    const msPerDay = 86400000;
    const totalDays = Math.round((b - a) / msPerDay);
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;

    // Y / M / D breakdown
    let years = b.getFullYear() - a.getFullYear();
    let months = b.getMonth() - a.getMonth();
    let days = b.getDate() - a.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { totalDays, weeks, remDays, years, months, days };
  }, [start, end]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Start date">
          <TextInput type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="End date">
          <TextInput type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Difference">
          <ResultStat label="Total days" value={fmt(result.totalDays, 0)} accent />
          <div className="afc-result-rows">
            <ResultRow label="In years, months, days" value={`${result.years} y  ${result.months} m  ${result.days} d`} />
            <ResultRow label="In weeks" value={`${fmt(result.weeks, 0)} weeks, ${result.remDays} days`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Difference" muted>
          <p className="afc-note">Pick two dates to see the difference.</p>
        </ResultPanel>
      )}
    </div>
  );
}
