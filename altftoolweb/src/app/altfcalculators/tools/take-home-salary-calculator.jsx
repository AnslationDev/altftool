"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, money } from "./format";

export default function TakeHomeSalaryCalculator() {
  const [ctc, setCtc] = useState("1200000");
  const [basicPct, setBasicPct] = useState("40");
  const [pfPct, setPfPct] = useState("12");
  const [profTax, setProfTax] = useState("2400");
  const [incomeTax, setIncomeTax] = useState("0");

  const result = useMemo(() => {
    const C = num(ctc);
    const bp = num(basicPct);
    const pp = num(pfPct);
    const pt = num(profTax);
    const it = num(incomeTax);
    if (C === null || C <= 0) return null;
    if (bp === null || bp < 0 || pp === null || pp < 0) return null;
    if (pt === null || pt < 0 || it === null || it < 0) return null;

    const basic = (C * bp) / 100;
    const pf = (basic * pp) / 100;
    const deductions = pf + pt + it;
    const netAnnual = C - deductions;

    return {
      grossMonthly: C / 12,
      pf,
      profTax: pt,
      incomeTax: it,
      deductions,
      netAnnual,
      netMonthly: netAnnual / 12,
    };
  }, [ctc, basicPct, pfPct, profTax, incomeTax]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Annual CTC">
          <NumberInput prefix="₹" value={ctc} min="0" step="10000" onChange={(e) => setCtc(e.target.value)} />
        </Field>
        <Field label="Basic (% of CTC)">
          <NumberInput suffix="%" value={basicPct} min="0" max="100" step="1" onChange={(e) => setBasicPct(e.target.value)} />
        </Field>
        <Field label="Employee PF (% of basic)">
          <NumberInput suffix="%" value={pfPct} min="0" max="100" step="1" onChange={(e) => setPfPct(e.target.value)} />
        </Field>
        <Field label="Professional tax / year">
          <NumberInput prefix="₹" value={profTax} min="0" step="100" onChange={(e) => setProfTax(e.target.value)} />
        </Field>
        <Field label="Income tax / year" hint="Enter your estimated annual income tax">
          <NumberInput prefix="₹" value={incomeTax} min="0" step="1000" onChange={(e) => setIncomeTax(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Take-home summary">
          <ResultStat label="Net monthly (in-hand)" value={`₹ ${money(result.netMonthly)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Gross monthly" value={`₹ ${money(result.grossMonthly)}`} />
            <ResultRow label="Employee PF" value={`₹ ${money(result.pf)}`} />
            <ResultRow label="Professional tax" value={`₹ ${money(result.profTax)}`} />
            <ResultRow label="Income tax" value={`₹ ${money(result.incomeTax)}`} />
            <ResultRow label="Total deductions / year" value={`₹ ${money(result.deductions)}`} />
            <ResultRow label="Net annual" value={`₹ ${money(result.netAnnual)}`} strong />
          </div>
          <CalcNote>
            Simplified estimate. Real take-home depends on your exact salary structure, employer PF, gratuity,
            HRA exemptions and actual tax. Use it as a rough guide.
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Take-home summary" muted>
          <p className="afc-note">Enter your CTC and deduction assumptions to estimate in-hand pay.</p>
        </ResultPanel>
      )}
    </div>
  );
}
