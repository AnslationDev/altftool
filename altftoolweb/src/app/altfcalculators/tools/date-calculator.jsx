"use client";

import React, { useMemo, useState } from "react";
import {
  Field,
  TextInput,
  NumberInput,
  Select,
  Segmented,
  Grid,
  ResultPanel,
  ResultStat,
  ResultRow,
  CalcNote,
} from "./ui";
import { num, fmt, plural } from "./format";

// Parse a "YYYY-MM-DD" date-input string into a LOCAL midnight Date.
// Parsing manually (rather than new Date(str)) avoids the UTC-vs-local
// off-by-one that bites date-only strings in negative timezones.
function parseDate(str) {
  if (!str) return null;
  const parts = String(str).split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  // Reject overflow like 2026-02-30 (which JS would roll to March).
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

// Calendar years / months / days between two ordered dates (from <= to).
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

// Add `months` to a date, clamping the day to the target month's last day
// (e.g. Jan 31 + 1 month -> Feb 28/29 rather than rolling into March).
function addMonths(date, months) {
  const targetIndex = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(targetIndex / 12);
  const normMonth = ((targetIndex % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normMonth + 1, 0).getDate();
  return new Date(targetYear, normMonth, Math.min(date.getDate(), lastDay));
}

const readable = (d) =>
  d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const isoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const MS_PER_DAY = 86400000;

export default function DateCalculator() {
  const [mode, setMode] = useState("diff");

  // Difference mode
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-07-21");

  // Add / subtract mode
  const [baseDate, setBaseDate] = useState("2026-07-21");
  const [op, setOp] = useState("add");
  const [amount, setAmount] = useState("30");
  const [unit, setUnit] = useState("days");

  const diff = useMemo(() => {
    const a = parseDate(start);
    const b = parseDate(end);
    if (!a || !b) return null;
    const from = a <= b ? a : b;
    const to = a <= b ? b : a;
    // Round to snap away DST-induced 23/25h days into whole calendar days.
    const totalDays = Math.round((to - from) / MS_PER_DAY);
    const ymd = diffYMD(from, to);
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays - weeks * 7;
    return {
      totalDays,
      ymd,
      weeks,
      remDays,
      totalWeeks: totalDays / 7,
      swapped: a > b,
      same: totalDays === 0,
    };
  }, [start, end]);

  const addSub = useMemo(() => {
    const base = parseDate(baseDate);
    const n = num(amount);
    if (!base || n === null || n < 0) return null;
    const signed = op === "subtract" ? -n : n;
    let result;
    if (unit === "days") {
      result = new Date(base);
      result.setDate(result.getDate() + signed);
    } else if (unit === "weeks") {
      result = new Date(base);
      result.setDate(result.getDate() + signed * 7);
    } else if (unit === "months") {
      result = addMonths(base, signed);
    } else {
      result = addMonths(base, signed * 12);
    }
    if (Number.isNaN(result.getTime())) return null;
    const dayDelta = Math.round((result - base) / MS_PER_DAY);
    return { result, dayDelta };
  }, [baseDate, op, amount, unit]);

  return (
    <div className="afc-calc">
      <Field label="Mode">
        <Segmented
          name="mode"
          value={mode}
          onChange={setMode}
          options={[
            { label: "Difference", value: "diff" },
            { label: "Add / Subtract", value: "add" },
          ]}
        />
      </Field>

      {mode === "diff" ? (
        <>
          <Grid cols={2}>
            <Field label="Start date">
              <TextInput type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="End date">
              <TextInput type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </Grid>

          {diff ? (
            <ResultPanel title="Date difference">
              <ResultStat
                label={diff.same ? "The two dates are the same" : "Total days between"}
                value={diff.same ? "0 days" : plural(diff.totalDays, "day", "days")}
                accent
              />
              <div className="afc-result-rows">
                <ResultRow
                  label="Years, months, days"
                  value={`${diff.ymd.years} y  ${diff.ymd.months} m  ${diff.ymd.days} d`}
                />
                <ResultRow
                  label="In weeks"
                  value={`${fmt(diff.weeks, 0)} weeks, ${diff.remDays} days`}
                />
                <ResultRow label="Total weeks" value={fmt(diff.totalWeeks, 2)} />
                <ResultRow label="Total days" value={fmt(diff.totalDays, 0)} strong />
              </div>
              {diff.swapped ? (
                <CalcNote>The end date is earlier than the start date, so the gap is measured the other way round.</CalcNote>
              ) : null}
            </ResultPanel>
          ) : (
            <ResultPanel title="Date difference" muted>
              <p className="afc-note">Pick a valid start and end date.</p>
            </ResultPanel>
          )}
        </>
      ) : (
        <>
          <Field label="Start date">
            <TextInput type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} />
          </Field>
          <Grid cols={3}>
            <Field label="Operation">
              <Segmented
                name="op"
                value={op}
                onChange={setOp}
                options={[
                  { label: "Add", value: "add" },
                  { label: "Subtract", value: "subtract" },
                ]}
              />
            </Field>
            <Field label="Amount">
              <NumberInput value={amount} min="0" step="1" onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Unit">
              <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </Select>
            </Field>
          </Grid>

          {addSub ? (
            <ResultPanel title="Resulting date">
              <ResultStat label="Result" value={readable(addSub.result)} accent />
              <div className="afc-result-rows">
                <ResultRow label="ISO date" value={isoDate(addSub.result)} />
                <ResultRow
                  label="Day of week"
                  value={addSub.result.toLocaleDateString(undefined, { weekday: "long" })}
                />
                <ResultRow
                  label="Offset from start"
                  value={`${addSub.dayDelta >= 0 ? "+" : ""}${fmt(addSub.dayDelta, 0)} days`}
                  strong
                />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel title="Resulting date" muted>
              <p className="afc-note">Pick a start date and enter a whole amount to add or subtract.</p>
            </ResultPanel>
          )}
        </>
      )}
    </div>
  );
}
