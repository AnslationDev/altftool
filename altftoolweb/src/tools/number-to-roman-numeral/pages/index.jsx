"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "number",
    label: "Number (1–3999)",
    type: "number",
    default: "2024",
  },
];

const ROMAN_MAP = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

const compute = (v) => {
  const input = Number(v.number);

  if (!Number.isInteger(input) || input < 1 || input > 3999) {
    return {
      result: "—",
      caption: "Enter a whole number between 1 and 3999.",
    };
  }

  let value = input;
  let roman = "";
  const breakdown = [];

  for (const [num, symbol] of ROMAN_MAP) {
    while (value >= num) {
      roman += symbol;
      value -= num;
      breakdown.push(symbol);
    }
  }

  const digits = {
    Thousands: Math.floor(input / 1000),
    Hundreds: Math.floor((input % 1000) / 100),
    Tens: Math.floor((input % 100) / 10),
    Ones: input % 10,
  };

  return {
    result: roman,
    caption: `${input.toLocaleString()} in Roman numerals`,

    rows: [
      ["Decimal Number", input.toLocaleString()],
      ["Roman Numeral", roman],
      ["Length", `${roman.length} characters`],
      ["Composition", breakdown.join(" + ")],
      ["Thousands", digits.Thousands],
      ["Hundreds", digits.Hundreds],
      ["Tens", digits.Tens],
      ["Ones", digits.Ones],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Number to Roman Numeral"
      description="Convert any whole number from 1 to 3999 into Roman numerals with a detailed breakdown."
      note="Standard Roman numerals use the symbols I, V, X, L, C, D, and M."
      fields={fields}
      compute={compute}
    />
  );
}