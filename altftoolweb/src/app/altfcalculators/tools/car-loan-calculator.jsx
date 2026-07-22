"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function CarLoanCalculator() {
  const [price, setPrice] = useState("1000000");
  const [down, setDown] = useState("200000");
  const [rate, setRate] = useState("9.5");
  const [tenure, setTenure] = useState("5");
  const [unit, setUnit] = useState("years");

  const r = useMemo(() => {
    const onroad = num(price);
    const a = num(rate);
    const t = num(tenure);
    if (onroad === null || a === null || t === null || onroad <= 0 || t <= 0) return null;

    const dp = num(down) === null ? 0 : num(down);
    const P = onroad - dp;
    if (P <= 0) return { error: "Down payment must be less than the on-road price." };

    const n = unit === "years" ? Math.round(t * 12) : Math.round(t);
    if (n <= 0) return null;
    const i = a / 12 / 100;
    const emi = i === 0 ? P / n : (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = emi * n;
    return { emi, total, interest: total - P, loan: P, months: n };
  }, [price, down, rate, tenure, unit]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="On-road price">
          <NumberInput prefix="₹" value={price} min="0" onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Down payment">
          <NumberInput prefix="₹" value={down} min="0" onChange={(e) => setDown(e.target.value)} />
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
              { label: "Years", value: "years" },
              { label: "Months", value: "months" },
            ]}
          />
        </Field>
      </Grid>

      {r && !r.error ? (
        <ResultPanel title="Car loan summary">
          <ResultStat label="Monthly EMI" value={`₹ ${money(r.emi)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Loan amount" value={`₹ ${money(r.loan)}`} />
            <ResultRow label="Total interest" value={`₹ ${money(r.interest)}`} />
            <ResultRow label={`Total payable (${r.months} months)`} value={`₹ ${money(r.total)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Car loan summary" muted>
          <p className="afc-note">{r && r.error ? r.error : "Enter the on-road price, down payment, rate and tenure."}</p>
        </ResultPanel>
      )}
    </div>
  );
}
