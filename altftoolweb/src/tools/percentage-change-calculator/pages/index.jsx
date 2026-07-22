"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "from",
    label: "Original Value",
    type: "number",
    default: "80",
  },
  {
    key: "to",
    label: "New Value",
    type: "number",
    default: "100",
  },
];

const format = (n) =>
  Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const compute = (v) => {
  const original = Number(v.from);
  const current = Number(v.to);

  if (
    !Number.isFinite(original) ||
    !Number.isFinite(current)
  ) {
    return {
      result: "—",
      caption: "Enter valid numbers.",
    };
  }

  if (original === 0) {
    return {
      result: "—",
      caption: "Original value cannot be zero.",
    };
  }

  const difference = current - original;
  const percentChange = (difference / Math.abs(original)) * 100;

  const status =
    difference > 0
      ? "Increase"
      : difference < 0
      ? "Decrease"
      : "No Change";

  const ratio = current / original;

  return {
    result: `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(2)}%`,
    caption: status,

    rows: [
      ["Original Value", format(original)],
      ["New Value", format(current)],
      ["Absolute Change", `${difference >= 0 ? "+" : ""}${format(difference)}`],
      ["Percentage Change", `${percentChange.toFixed(2)}%`],
      ["Status", status],
      ["Value Ratio", `${ratio.toFixed(2)}×`],
      ["Change Amount", format(Math.abs(difference))],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Percentage Change Calculator"
      description="Calculate the percentage increase or decrease between two values with a detailed breakdown."
      note="Formula: ((New Value − Original Value) ÷ Original Value) × 100"
      fields={fields}
      compute={compute}
    />
  );
}