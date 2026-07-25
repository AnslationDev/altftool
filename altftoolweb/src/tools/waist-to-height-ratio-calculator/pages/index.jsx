"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "waist",
    label: "Waist Circumference (cm)",
    type: "number",
    default: "80",
  },
  {
    key: "height",
    label: "Height (cm)",
    type: "number",
    default: "175",
  },
];

const format = (n) =>
  Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const compute = (v) => {
  const waist = Number(v.waist);
  const height = Number(v.height);

  if (
    !Number.isFinite(waist) ||
    !Number.isFinite(height) ||
    waist <= 0 ||
    height <= 0
  ) {
    return {
      result: "—",
      caption: "Enter valid waist and height measurements.",
    };
  }

  const ratio = waist / height;

  let category;
  let advice;

  if (ratio < 0.40) {
    category = "Low";
    advice = "Below the typical healthy range.";
  } else if (ratio < 0.50) {
    category = "Healthy";
    advice = "Generally associated with lower health risk.";
  } else if (ratio < 0.60) {
    category = "Increased Risk";
    advice = "Consider lifestyle changes to reduce abdominal fat.";
  } else {
    category = "High Risk";
    advice = "Higher risk of cardiometabolic diseases.";
  }

  const recommendedWaist = height * 0.5;
  const difference = waist - recommendedWaist;

  return {
    result: ratio.toFixed(2),
    caption: category,

    rows: [
      ["Risk Category", category],
      ["Health Advice", advice],
      ["Waist Circumference", `${format(waist)} cm`],
      ["Height", `${format(height)} cm`],
      ["Recommended Max Waist", `${format(recommendedWaist)} cm`],
      [
        "Difference from Target",
        `${difference >= 0 ? "+" : ""}${format(difference)} cm`,
      ],
      ["Healthy Target Ratio", "< 0.50"],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Waist-to-Height Ratio Calculator"
      description="Calculate your waist-to-height ratio (WHtR) to assess abdominal fat and estimate cardiometabolic health risk."
      note="A waist circumference less than half your height (WHtR < 0.50) is generally considered a healthy target for most adults."
      fields={fields}
      compute={compute}
    />
  );
}