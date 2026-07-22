"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "value",
    label: "Temperature",
    type: "number",
    default: "100",
  },
  {
    key: "unit",
    label: "Convert From",
    type: "select",
    default: "C",
    choices: [
      { value: "C", label: "Celsius (°C)" },
      { value: "F", label: "Fahrenheit (°F)" },
      { value: "K", label: "Kelvin (K)" },
    ],
  },
];

const round = (n) => Number(n).toFixed(2);

const compute = (v) => {
  const input = Number(v.value);

  if (!Number.isFinite(input)) {
    return {
      result: "Enter a valid temperature.",
      rows: [],
    };
  }

  let celsius;

  switch (v.unit) {
    case "F":
      celsius = (input - 32) * 5 / 9;
      break;

    case "K":
      celsius = input - 273.15;
      break;

    default:
      celsius = input;
  }

  const fahrenheit = celsius * 9 / 5 + 32;
  const kelvin = celsius + 273.15;

  const values = {
    C: `${round(celsius)} °C`,
    F: `${round(fahrenheit)} °F`,
    K: `${round(kelvin)} K`,
  };

  const labels = {
    C: "Celsius",
    F: "Fahrenheit",
    K: "Kelvin",
  };

  return {
    result: `${labels[v.unit]}: ${values[v.unit]}`,
    rows: [
      ["Celsius", values.C],
      ["Fahrenheit", values.F],
      ["Kelvin", values.K],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Temperature Converter"
      description="Convert temperatures instantly between Celsius, Fahrenheit, and Kelvin."
      note="Supports scientific, educational, and everyday temperature conversions."
      fields={fields}
      compute={compute}
    />
  );
}