"use client";

import React from "react";
import { LinearConverter } from "./converter";

// factor = value in grams
const UNITS = [
  { label: "Milligram (mg)", value: "mg", factor: 0.001 },
  { label: "Gram (g)", value: "g", factor: 1 },
  { label: "Kilogram (kg)", value: "kg", factor: 1000 },
  { label: "Tonne (t)", value: "t", factor: 1000000 },
  { label: "Ounce (oz)", value: "oz", factor: 28.349523125 },
  { label: "Pound (lb)", value: "lb", factor: 453.59237 },
  { label: "Stone (st)", value: "st", factor: 6350.29318 },
];

export default function WeightConverter() {
  return <LinearConverter units={UNITS} defaultFrom="kg" defaultTo="lb" defaultValue="1" baseLabel="weight" />;
}
