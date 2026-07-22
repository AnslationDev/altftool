"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, money, round } from "./format";

// India New Tax Regime — FY 2024-25 (AY 2025-26) slabs.
const SLABS = [
  [300000, 0],
  [700000, 0.05],
  [1000000, 0.10],
  [1200000, 0.15],
  [1500000, 0.20],
  [Infinity, 0.30],
];

function slabTax(taxable) {
  let tax = 0;
  let prev = 0;
  for (const [limit, r] of SLABS) {
    if (taxable > prev) {
      const slice = Math.min(taxable, limit) - prev;
      tax += slice * r;
      prev = limit;
    } else break;
  }
  return tax;
}

export default function TaxCalculator() {
  const [income, setIncome] = useState("1200000");
  const [type, setType] = useState("salaried");

  const result = useMemo(() => {
    const gross = num(income);
    if (gross === null || gross < 0) return null;

    const stdDeduction = type === "salaried" ? 75000 : 0;
    const taxable = Math.max(0, gross - stdDeduction);

    // Section 87A rebate: no tax if taxable income <= 7,00,000.
    let taxBeforeCess = taxable <= 700000 ? 0 : slabTax(taxable);
    const cess = taxBeforeCess * 0.04;
    const totalTax = taxBeforeCess + cess;
    const effective = gross > 0 ? (totalTax / gross) * 100 : 0;

    return { taxable, taxBeforeCess, cess, totalTax, effective, stdDeduction };
  }, [income, type]);

  return (
    <div className="afc-calc">
      <Field label="Taxpayer type">
        <Segmented
          name="taxpayer type"
          value={type}
          onChange={setType}
          options={[
            { label: "Salaried / pension", value: "salaried" },
            { label: "Other", value: "other" },
          ]}
        />
      </Field>
      <Grid cols={type === "salaried" ? 2 : 1}>
        <Field label="Annual gross income" hint="Total income before deductions">
          <NumberInput prefix="₹" value={income} min="0" step="1000" onChange={(e) => setIncome(e.target.value)} />
        </Field>
        {type === "salaried" ? (
          <Field label="Standard deduction" hint="Auto-applied for salaried / pensioners">
            <NumberInput prefix="₹" value="75000" readOnly />
          </Field>
        ) : null}
      </Grid>

      {result ? (
        <ResultPanel title="Tax estimate (New Regime)">
          <ResultStat
            label="Total tax payable"
            value={`₹ ${money(result.totalTax)}`}
            sub={`Effective rate ${round(result.effective, 2)}%`}
            accent
          />
          <div className="afc-result-rows">
            <ResultRow label="Taxable income" value={`₹ ${money(result.taxable)}`} />
            <ResultRow label="Tax before cess" value={`₹ ${money(result.taxBeforeCess)}`} />
            <ResultRow label="Health & education cess (4%)" value={`₹ ${money(result.cess)}`} />
            <ResultRow label="Total tax (incl. cess)" value={`₹ ${money(result.totalTax)}`} strong />
          </div>
          <CalcNote>
            Indicative estimate for the New Tax Regime (FY 2024-25). Excludes surcharge on high incomes and any
            special-rate income. Consult a tax professional before filing.
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Tax estimate (New Regime)" muted>
          <p className="afc-note">Enter your annual gross income to estimate your tax.</p>
        </ResultPanel>
      )}
    </div>
  );
}
