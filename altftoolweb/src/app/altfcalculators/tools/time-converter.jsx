"use client";

import React from "react";
import { LinearConverter } from "./converter";

// factor = value in seconds. Month = 1/12 of an average Gregorian year
// (30.4375 days); year = 365.25 days (Julian year).
const UNITS = [
  { label: "Millisecond (ms)", value: "millisecond", factor: 0.001 },
  { label: "Second (s)", value: "second", factor: 1 },
  { label: "Minute (min)", value: "minute", factor: 60 },
  { label: "Hour (h)", value: "hour", factor: 3600 },
  { label: "Day (d)", value: "day", factor: 86400 },
  { label: "Week (wk)", value: "week", factor: 604800 },
  { label: "Month (avg)", value: "month", factor: 2629800 },
  { label: "Year (avg)", value: "year", factor: 31557600 },
];

export default function TimeConverter() {
  return <LinearConverter units={UNITS} defaultFrom="hour" defaultTo="minute" defaultValue="1" baseLabel="time" />;
}
