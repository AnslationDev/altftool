"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "value",
    label: "Number",
    type: "text",
    default: "0.00042",
  },
];

const trim = (n) =>
  n
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.0+$/, "")
    .replace(/\.$/, "");

const compute = (v) => {
  const input = v.value.trim();

  if (!input) {
    return {
      result: "—",
      caption: "Enter a number.",
    };
  }

  const number = Number(input);

  if (!Number.isFinite(number)) {
    return {
      result: "—",
      caption: "Enter a valid numeric value.",
    };
  }

  if (number === 0) {
    return {
      result: "0 × 10⁰",
      caption: "Zero has no order of magnitude.",
      rows: [
        ["Scientific", "0 × 10⁰"],
        ["Engineering", "0 × 10⁰"],
        ["Exponent", "0"],
      ],
    };
  }

  // Scientific notation
  const exponent = Math.floor(Math.log10(Math.abs(number)));
  const mantissa = number / Math.pow(10, exponent);

  // Engineering notation
  const engExponent = Math.floor(exponent / 3) * 3;
  const engMantissa = number / Math.pow(10, engExponent);

  return {
    result: `${trim(mantissa.toPrecision(10))} × 10^${exponent}`,
    caption: "Scientific notation",

    rows: [
      ["Decimal", number.toLocaleString(undefined, { maximumFractionDigits: 20 })],
      ["Scientific", `${trim(mantissa.toPrecision(10))} × 10^${exponent}`],
      ["E Notation", number.toExponential()],
      ["Engineering", `${trim(engMantissa.toPrecision(10))} × 10^${engExponent}`],
      ["Mantissa", trim(mantissa.toPrecision(10))],
      ["Exponent", exponent],
      ["Order of Magnitude", `10^${exponent}`],
      ["Sign", number >= 0 ? "Positive" : "Negative"],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Scientific Notation Converter"
      description="Convert numbers to scientific notation, E notation, and engineering notation with mantissa and exponent details."
      note="Scientific notation expresses numbers as a value between 1 and 10 multiplied by a power of ten."
      fields={fields}
      compute={compute}
    />
  );
}