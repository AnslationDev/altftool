"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "amount",
    label: "Amount",
    type: "number",
    default: "49.99",
  },
  {
    key: "rate",
    label: "Sales Tax Rate (%)",
    type: "number",
    default: "8.25",
  },
  {
    key: "mode",
    label: "Calculation",
    type: "select",
    default: "add",
    choices: [
      {
        value: "add",
        label: "Add Sales Tax",
      },
      {
        value: "remove",
        label: "Price Already Includes Tax",
      },
    ],
  },
];

const format = (value) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const compute = (v) => {
  const amount = Number(v.amount);
  const rate = Number(v.rate);

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(rate) ||
    amount < 0 ||
    rate < 0
  ) {
    return {
      result: "—",
      caption: "Enter valid positive values.",
    };
  }

  if (v.mode === "add") {
    const tax = amount * (rate / 100);
    const total = amount + tax;

    return {
      result: format(total),
      caption: "Total Amount (Including Tax)",

      rows: [
        ["Subtotal", format(amount)],
        ["Sales Tax", format(tax)],
        ["Total", format(total)],
        ["Tax Rate", `${rate.toFixed(2)}%`],
        ["Effective Tax", `${((tax / total) * 100).toFixed(2)}% of total`],
      ],
    };
  }

  const subtotal = amount / (1 + rate / 100);
  const tax = amount - subtotal;

  return {
    result: format(subtotal),
    caption: "Subtotal (Tax Removed)",

    rows: [
      ["Total Paid", format(amount)],
      ["Sales Tax", format(tax)],
      ["Subtotal", format(subtotal)],
      ["Tax Rate", `${rate.toFixed(2)}%`],
      ["Effective Tax", `${((tax / amount) * 100).toFixed(2)}% of total`],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Sales Tax Calculator"
      description="Calculate sales tax, subtotal, and total amount, or remove tax from a tax-inclusive price."
      note="Supports both tax-exclusive and tax-inclusive price calculations."
      fields={fields}
      compute={compute}
    />
  );
}