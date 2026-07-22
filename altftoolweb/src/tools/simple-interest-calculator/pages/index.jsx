"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "principal",
    label: "Principal Amount",
    type: "number",
    default: "10000",
  },
  {
    key: "rate",
    label: "Annual Interest Rate (%)",
    type: "number",
    default: "8",
  },
  {
    key: "time",
    label: "Time (Years)",
    type: "number",
    default: "5",
  },
];

const format = (n) =>
  Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const compute = (v) => {
  const P = Number(v.principal);
  const R = Number(v.rate);
  const T = Number(v.time);

  if (![P, R, T].every(Number.isFinite) || P <= 0 || R < 0 || T <= 0) {
    return {
      result: "—",
      caption: "Enter valid positive values.",
    };
  }

  const interest = (P * R * T) / 100;
  const maturity = P + interest;

  const yearlyInterest = interest / T;
  const monthlyInterest = yearlyInterest / 12;
  const dailyInterest = yearlyInterest / 365;

  const roi = (interest / P) * 100;

  return {
    result: format(interest),
    caption: "Total Simple Interest Earned",

    rows: [
      ["Principal", format(P)],
      ["Interest Earned", format(interest)],
      ["Maturity Amount", format(maturity)],
      ["Annual Interest", format(yearlyInterest)],
      ["Monthly Interest", format(monthlyInterest)],
      ["Daily Interest", format(dailyInterest)],
      ["Return on Investment", `${format(roi)} %`],
      ["Interest Rate", `${R}% per year`],
      ["Investment Period", `${T} year${T !== 1 ? "s" : ""}`],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Simple Interest Calculator"
      description="Calculate simple interest, maturity amount, annual returns, monthly earnings, and overall return on investment."
      note="Formula used: Simple Interest = (Principal × Rate × Time) ÷ 100"
      fields={fields}
      compute={compute}
    />
  );
}