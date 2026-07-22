"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "investment",
    label: "Amount Invested",
    type: "number",
    default: "5000",
  },
  {
    key: "returned",
    label: "Amount Returned",
    type: "number",
    default: "7500",
  },
];

const format = (n) =>
  Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const compute = (v) => {
  const investment = Number(v.investment);
  const returned = Number(v.returned);

  if (
    !Number.isFinite(investment) ||
    !Number.isFinite(returned) ||
    investment <= 0 ||
    returned < 0
  ) {
    return {
      result: "—",
      caption: "Enter valid investment values.",
    };
  }

  const profit = returned - investment;
  const roi = (profit / investment) * 100;
  const multiple = returned / investment;

  const status =
    profit > 0
      ? "Profit"
      : profit < 0
      ? "Loss"
      : "Break-even";

  return {
    result: `${roi.toFixed(2)}% ROI`,
    caption: status,

    rows: [
      ["Investment", format(investment)],
      ["Amount Returned", format(returned)],
      ["Net Profit / Loss", format(profit)],
      ["ROI", `${roi.toFixed(2)}%`],
      ["Return Multiple", `${multiple.toFixed(2)}×`],
      ["Net Value", format(returned)],
      ["Profit Margin", `${((profit / returned) * 100 || 0).toFixed(2)}%`],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="ROI Calculator"
      description="Calculate return on investment (ROI), profit or loss, return multiple, and overall investment performance."
      note="Formula: ROI = ((Amount Returned − Amount Invested) ÷ Amount Invested) × 100"
      fields={fields}
      compute={compute}
    />
  );
}