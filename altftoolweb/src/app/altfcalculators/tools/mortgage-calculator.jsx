"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function MortgageCalculator() {
  const [price, setPrice] = useState("5000000");
  const [down, setDown] = useState("1000000");
  const [rate, setRate] = useState("8.5");
  const [term, setTerm] = useState("20");
  const [taxPct, setTaxPct] = useState("1");
  const [insurance, setInsurance] = useState("15000");

  const r = useMemo(() => {
    const home = num(price);
    const a = num(rate);
    const years = num(term);
    if (home === null || a === null || years === null || home <= 0 || years <= 0) return null;

    const dp = num(down) === null ? 0 : num(down);
    const P = home - dp;
    if (P <= 0) return { error: "Down payment must be less than the home price." };

    const n = Math.round(years * 12);
    if (n <= 0) return null;
    const i = a / 12 / 100;
    const pi = i === 0 ? P / n : (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

    const tax = num(taxPct) === null ? 0 : num(taxPct);
    const ins = num(insurance) === null ? 0 : num(insurance);
    const monthlyTaxIns = (home * (tax / 100) + ins) / 12;

    const totalPI = pi * n;
    return {
      pi,
      monthlyTaxIns,
      totalMonthly: pi + monthlyTaxIns,
      interest: totalPI - P,
      loan: P,
      months: n,
    };
  }, [price, down, rate, term, taxPct, insurance]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Home price">
          <NumberInput prefix="₹" value={price} min="0" onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Down payment">
          <NumberInput prefix="₹" value={down} min="0" onChange={(e) => setDown(e.target.value)} />
        </Field>
        <Field label="Interest rate (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.05" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Loan term (years)">
          <NumberInput value={term} min="0" onChange={(e) => setTerm(e.target.value)} />
        </Field>
        <Field label="Property tax (per year)" hint="As a percentage of the home price">
          <NumberInput suffix="%" value={taxPct} min="0" step="0.1" onChange={(e) => setTaxPct(e.target.value)} />
        </Field>
        <Field label="Home insurance (per year)">
          <NumberInput prefix="₹" value={insurance} min="0" onChange={(e) => setInsurance(e.target.value)} />
        </Field>
      </Grid>

      {r && !r.error ? (
        <ResultPanel title="Monthly payment breakdown">
          <ResultStat label="Total monthly payment" value={`₹ ${money(r.totalMonthly)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Principal & interest" value={`₹ ${money(r.pi)}`} />
            <ResultRow label="Taxes & insurance" value={`₹ ${money(r.monthlyTaxIns)}`} />
            <ResultRow label="Loan amount" value={`₹ ${money(r.loan)}`} />
            <ResultRow label={`Total interest (${r.months} months)`} value={`₹ ${money(r.interest)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Monthly payment breakdown" muted>
          <p className="afc-note">{r && r.error ? r.error : "Enter the home price, down payment, rate and term."}</p>
        </ResultPanel>
      )}
    </div>
  );
}
