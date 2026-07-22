"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function LoanEmiCalculator() {
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("10");
  const [tenure, setTenure] = useState("12");
  const [unit, setUnit] = useState("months");

  const result = useMemo(() => {
    const P = num(principal);
    const annual = num(rate);
    const t = num(tenure);
    if (P === null || annual === null || t === null || P <= 0 || t <= 0) return null;

    const n = unit === "years" ? Math.round(t * 12) : Math.round(t);
    if (n <= 0) return null;
    const r = annual / 12 / 100;

    let emi;
    if (r === 0) emi = P / n;
    else emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const total = emi * n;
    const interest = total - P;
    return { emi, total, interest, principal: P, months: n };
  }, [principal, rate, tenure, unit]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Loan amount">
          <NumberInput prefix="₹" value={principal} min="0" onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="Interest rate (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Loan tenure">
          <NumberInput value={tenure} min="0" onChange={(e) => setTenure(e.target.value)} />
        </Field>
        <Field label="Tenure unit">
          <Segmented
            name="tenure unit"
            value={unit}
            onChange={setUnit}
            options={[
              { label: "Months", value: "months" },
              { label: "Years", value: "years" },
            ]}
          />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Your loan summary">
          <ResultStat label="Monthly EMI" value={`₹ ${money(result.emi)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Principal amount" value={`₹ ${money(result.principal)}`} />
            <ResultRow label="Total interest" value={`₹ ${money(result.interest)}`} />
            <ResultRow label={`Total payable (${result.months} months)`} value={`₹ ${money(result.total)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Your loan summary" muted>
          <p className="afc-note">Enter a loan amount, rate and tenure to see the EMI.</p>
        </ResultPanel>
      )}
    </div>
  );
}
