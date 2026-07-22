"use client";

import React from "react";
import { LinearConverter } from "./converter";

// factor = value in metres per second
const UNITS = [
  { label: "Metre/second (m/s)", value: "mps", factor: 1 },
  { label: "Kilometre/hour (km/h)", value: "kmh", factor: 1 / 3.6 },
  { label: "Mile/hour (mph)", value: "mph", factor: 0.44704 },
  { label: "Knot (kn)", value: "kn", factor: 0.514444 },
  { label: "Foot/second (ft/s)", value: "fps", factor: 0.3048 },
];

export default function SpeedConverter() {
  return <LinearConverter units={UNITS} defaultFrom="kmh" defaultTo="mph" defaultValue="100" baseLabel="speed" />;
}
