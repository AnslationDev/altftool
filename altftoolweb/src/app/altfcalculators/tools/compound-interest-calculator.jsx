"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Select, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

const FREQ = [
  { label: "Annually", value: 1 },
  { label: "Semi-annually", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("5");
  const [freq, setFreq] = useState("12");

  const result = useMemo(() => {
    const P = num(principal);
    const annual = num(rate);
    const t = num(years);
    const n = num(freq);
    if (P === null || annual === null || t === null || P < 0 || t < 0) return null;

    const r = annual / 100;
    const amount = P * Math.pow(1 + r / n, n * t);
    const interest = amount - P;
    return { amount, interest, principal: P };
  }, [principal, rate, years, freq]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Principal amount">
          <NumberInput prefix="₹" value={principal} min="0" onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="Interest rate (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Time period (years)">
          <NumberInput value={years} min="0" step="0.5" onChange={(e) => setYears(e.target.value)} />
        </Field>
        <Field label="Compounding frequency">
          <Select value={freq} onChange={(e) => setFreq(e.target.value)}>
            {FREQ.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Future value">
          <ResultStat label="Final amount" value={`₹ ${money(result.amount)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Principal" value={`₹ ${money(result.principal)}`} />
            <ResultRow label="Interest earned" value={`₹ ${money(result.interest)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Future value" muted>
          <p className="afc-note">Enter a principal, rate and period to project the growth.</p>
        </ResultPanel>
      )}
    </div>
  );
}
