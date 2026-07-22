"use client";

import React, { useMemo, useState } from "react";
import { Field, TextInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { fmt } from "./format";

function diffYMD(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export default function AgeCalculator() {
  const [dob, setDob] = useState("2000-01-01");
  const [asOf, setAsOf] = useState("");

  const result = useMemo(() => {
    if (!dob) return null;
    const from = new Date(dob);
    const to = asOf ? new Date(asOf) : new Date();
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
    if (to < from) return { invalid: true };

    const ymd = diffYMD(from, to);
    const msPerDay = 86400000;
    const totalDays = Math.floor((to - from) / msPerDay);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = ymd.years * 12 + ymd.months;
    const totalHours = totalDays * 24;

    return { ...ymd, totalDays, totalWeeks, totalMonths, totalHours };
  }, [dob, asOf]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Date of birth">
          <TextInput type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </Field>
        <Field label="Age at date" hint="Leave blank for today.">
          <TextInput type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </Field>
      </Grid>

      {result && !result.invalid ? (
        <ResultPanel title="Your age">
          <ResultStat
            label="Years, months, days"
            value={`${result.years} y  ${result.months} m  ${result.days} d`}
            accent
          />
          <div className="afc-result-rows">
            <ResultRow label="In months" value={`${fmt(result.totalMonths, 0)} months`} />
            <ResultRow label="In weeks" value={`${fmt(result.totalWeeks, 0)} weeks`} />
            <ResultRow label="In days" value={`${fmt(result.totalDays, 0)} days`} />
            <ResultRow label="In hours" value={`${fmt(result.totalHours, 0)} hours`} strong />
          </div>
        </ResultPanel>
      ) : result && result.invalid ? (
        <ResultPanel title="Your age" muted>
          <p className="afc-note">The second date must be after the date of birth.</p>
        </ResultPanel>
      ) : (
        <ResultPanel title="Your age" muted>
          <p className="afc-note">Pick a date of birth to calculate your age.</p>
        </ResultPanel>
      )}
    </div>
  );
}
