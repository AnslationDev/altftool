"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Select, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt, round } from "./format";

// MET = Metabolic Equivalent of Task (moderate-intensity reference values).
const ACTIVITIES = [
  { label: "Walking (brisk)", value: "3.5" },
  { label: "Running", value: "9.8" },
  { label: "Cycling", value: "7.5" },
  { label: "Swimming", value: "8.0" },
  { label: "Yoga", value: "3.0" },
  { label: "Weight training", value: "5.0" },
  { label: "HIIT", value: "8.0" },
  { label: "Dancing", value: "5.5" },
];

export default function CaloriesBurnedCalculator() {
  const [met, setMet] = useState("3.5");
  const [weight, setWeight] = useState("70");
  const [minutes, setMinutes] = useState("30");

  const result = useMemo(() => {
    const m = num(met);
    const kg = num(weight);
    const mins = num(minutes);
    if (m === null || kg === null || mins === null) return null;
    if (kg <= 0 || mins <= 0) return null;
    const calories = m * kg * (mins / 60);
    const perMinute = calories / mins;
    return { calories, perMinute, met: m };
  }, [met, weight, minutes]);

  return (
    <div className="afc-calc">
      <Field label="Activity">
        <Select value={met} onChange={(e) => setMet(e.target.value)}>
          {ACTIVITIES.map((a) => (
            <option key={a.label} value={a.value}>{`${a.label} (${a.value} MET)`}</option>
          ))}
        </Select>
      </Field>
      <Grid cols={2}>
        <Field label="Body weight">
          <NumberInput suffix="kg" value={weight} min="0" onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <Field label="Duration">
          <NumberInput suffix="min" value={minutes} min="0" onChange={(e) => setMinutes(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Calories burned">
          <ResultStat label="Total energy burned" value={`${fmt(result.calories, 0)} kcal`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Burn rate" value={`${round(result.perMinute, 1)} kcal/min`} />
            <ResultRow label="MET value used" value={`${result.met}`} strong />
          </div>
          <CalcNote>Calories = MET × body weight (kg) × time (hours). MET values are averages — actual burn varies with intensity, fitness and terrain.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Calories burned" muted>
          <p className="afc-note">Pick an activity, then enter your weight and duration.</p>
        </ResultPanel>
      )}
    </div>
  );
}
