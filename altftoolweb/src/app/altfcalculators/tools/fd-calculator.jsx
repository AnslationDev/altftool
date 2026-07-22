"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Select, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

const FREQ = [
  { label: "Yearly", value: 1 },
  { label: "Half-yearly", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
];

export default function FdCalculator() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("5");
  const [freq, setFreq] = useState("4");

  const result = useMemo(() => {
    const P = num(principal);
    const annual = num(rate);
    const y = num(years);
    const f = num(freq);
    if (P === null || annual === null || y === null || f === null || P <= 0 || y < 0 || f <= 0) return null;

    const maturity = P * Math.pow(1 + annual / (100 * f), f * y);
    return { maturity, principal: P, interest: maturity - P };
  }, [principal, rate, years, freq]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Deposit amount">
          <NumberInput prefix="₹" value={principal} min="0" onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="Interest rate (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Tenure (years)">
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
        <ResultPanel title="Maturity value">
          <ResultStat label="Maturity amount" value={`₹ ${money(result.maturity)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Principal" value={`₹ ${money(result.principal)}`} />
            <ResultRow label="Interest earned" value={`₹ ${money(result.interest)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Maturity value" muted>
          <p className="afc-note">Enter deposit amount, rate, tenure and compounding.</p>
        </ResultPanel>
      )}
    </div>
  );
}
