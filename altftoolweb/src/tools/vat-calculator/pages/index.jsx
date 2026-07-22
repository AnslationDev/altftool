"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "amount",
    label: "Amount",
    type: "number",
    default: "1000",
  },
  {
    key: "rate",
    label: "VAT / GST Rate (%)",
    type: "number",
    default: "18",
  },
  {
    key: "mode",
    label: "Calculation",
    type: "select",
    default: "add",
    choices: [
      { value: "add", label: "Add VAT / GST" },
      { value: "remove", label: "Remove VAT / GST" },
    ],
  },
];

const format = (n) =>
  Number(n).toLocaleString(undefined, {
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
    const vat = amount * (rate / 100);
    const gross = amount + vat;

    return {
      result: format(gross),
      caption: "Gross Amount (Including VAT)",

      rows: [
        ["Net Amount", format(amount)],
        ["VAT Amount", format(vat)],
        ["Gross Amount", format(gross)],
        ["VAT Rate", `${rate.toFixed(2)}%`],
        ["Tax Fraction", `${(rate / (100 + rate) * 100).toFixed(2)}% of gross`],
      ],
    };
  }

  const net = amount / (1 + rate / 100);
  const vat = amount - net;

  return {
    result: format(net),
    caption: "Net Amount (VAT Removed)",

    rows: [
      ["Gross Amount", format(amount)],
      ["VAT Amount", format(vat)],
      ["Net Amount", format(net)],
      ["VAT Rate", `${rate.toFixed(2)}%`],
      ["Tax Fraction", `${(rate / (100 + rate) * 100).toFixed(2)}% of gross`],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="VAT Calculator"
      description="Add or remove VAT/GST from any amount. Instantly calculate net amount, VAT amount, and gross total."
      note="Works with any VAT or GST rate used around the world."
      fields={fields}
      compute={compute}
    />
  );
}