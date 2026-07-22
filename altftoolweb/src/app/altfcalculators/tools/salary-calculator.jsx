"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Select, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

const WEEKS_PER_YEAR = 52;

export default function SalaryCalculator() {
  const [amount, setAmount] = useState("50000");
  const [per, setPer] = useState("month");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [daysPerWeek, setDaysPerWeek] = useState("5");

  const result = useMemo(() => {
    const a = num(amount);
    const hpw = num(hoursPerWeek);
    const dpw = num(daysPerWeek);
    if (a === null || a < 0) return null;
    if (hpw === null || hpw <= 0 || dpw === null || dpw <= 0) return null;

    // Convert the entered pay to an annual figure.
    let annual;
    switch (per) {
      case "hour":
        annual = a * hpw * WEEKS_PER_YEAR;
        break;
      case "day":
        annual = a * dpw * WEEKS_PER_YEAR;
        break;
      case "week":
        annual = a * WEEKS_PER_YEAR;
        break;
      case "month":
        annual = a * 12;
        break;
      case "year":
      default:
        annual = a;
        break;
    }

    return {
      hourly: annual / (hpw * WEEKS_PER_YEAR),
      daily: annual / (dpw * WEEKS_PER_YEAR),
      weekly: annual / WEEKS_PER_YEAR,
      monthly: annual / 12,
      yearly: annual,
    };
  }, [amount, per, hoursPerWeek, daysPerWeek]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Amount">
          <NumberInput prefix="₹" value={amount} min="0" onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Per">
          <Select value={per} onChange={(e) => setPer(e.target.value)}>
            <option value="hour">Hour</option>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </Select>
        </Field>
        <Field label="Hours per week">
          <NumberInput value={hoursPerWeek} min="1" max="168" step="1" onChange={(e) => setHoursPerWeek(e.target.value)} />
        </Field>
        <Field label="Days per week">
          <NumberInput value={daysPerWeek} min="1" max="7" step="1" onChange={(e) => setDaysPerWeek(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Equivalent pay">
          <ResultStat label="Annual salary" value={`₹ ${money(result.yearly)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Hourly" value={`₹ ${money(result.hourly)}`} />
            <ResultRow label="Daily" value={`₹ ${money(result.daily)}`} />
            <ResultRow label="Weekly" value={`₹ ${money(result.weekly)}`} />
            <ResultRow label="Monthly" value={`₹ ${money(result.monthly)}`} />
            <ResultRow label="Yearly" value={`₹ ${money(result.yearly)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Equivalent pay" muted>
          <p className="afc-note">Enter your pay and working schedule to convert across periods.</p>
        </ResultPanel>
      )}
    </div>
  );
}
