"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function PersonalLoanCalculator() {
  const [amount, setAmount] = useState("500000");
  const [rate, setRate] = useState("14");
  const [tenure, setTenure] = useState("36");
  const [unit, setUnit] = useState("months");

  const r = useMemo(() => {
    const P = num(amount);
    const a = num(rate);
    const t = num(tenure);
    if (P === null || a === null || t === null || P <= 0 || t <= 0) return null;

    const n = unit === "years" ? Math.round(t * 12) : Math.round(t);
    if (n <= 0) return null;
    const i = a / 12 / 100;
    const emi = i === 0 ? P / n : (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = emi * n;
    return { emi, total, interest: total - P, principal: P, months: n };
  }, [amount, rate, tenure, unit]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Loan amount">
          <NumberInput prefix="₹" value={amount} min="0" onChange={(e) => setAmount(e.target.value)} />
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

      {r ? (
        <ResultPanel title="Personal loan summary">
          <ResultStat label="Monthly EMI" value={`₹ ${money(r.emi)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Principal amount" value={`₹ ${money(r.principal)}`} />
            <ResultRow label="Total interest" value={`₹ ${money(r.interest)}`} />
            <ResultRow label={`Total payable (${r.months} months)`} value={`₹ ${money(r.total)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Personal loan summary" muted>
          <p className="afc-note">Enter loan amount, interest rate and tenure to see your EMI.</p>
        </ResultPanel>
      )}
    </div>
  );
}
