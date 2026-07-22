"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Select, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

const ACTIVITY = [
  { label: "Sedentary (little/no exercise)", value: "1.2" },
  { label: "Light (exercise 1–3 days/week)", value: "1.375" },
  { label: "Moderate (exercise 3–5 days/week)", value: "1.55" },
  { label: "Active (exercise 6–7 days/week)", value: "1.725" },
  { label: "Very active (hard exercise / physical job)", value: "1.9" },
];

export default function TdeeCalculator() {
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [activity, setActivity] = useState("1.55");

  const result = useMemo(() => {
    const a = num(age);
    const kg = num(weight);
    const cm = num(height);
    const act = num(activity);
    if (a === null || kg === null || cm === null || act === null) return null;
    if (a <= 0 || kg <= 0 || cm <= 0 || act <= 0) return null;
    // Mifflin-St Jeor equation
    const base = 10 * kg + 6.25 * cm - 5 * a;
    const bmr = sex === "male" ? base + 5 : base - 161;
    const tdee = bmr * act;
    return { bmr, tdee };
  }, [sex, age, weight, height, activity]);

  return (
    <div className="afc-calc">
      <Field label="Sex">
        <Segmented
          name="sex"
          value={sex}
          onChange={setSex}
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
        />
      </Field>
      <Grid cols={3}>
        <Field label="Age (years)">
          <NumberInput value={age} min="0" onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label="Weight">
          <NumberInput suffix="kg" value={weight} min="0" onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <Field label="Height">
          <NumberInput suffix="cm" value={height} min="0" onChange={(e) => setHeight(e.target.value)} />
        </Field>
      </Grid>
      <Field label="Activity level">
        <Select value={activity} onChange={(e) => setActivity(e.target.value)}>
          {ACTIVITY.map((x) => (
            <option key={x.value} value={x.value}>{x.label}</option>
          ))}
        </Select>
      </Field>

      {result ? (
        <ResultPanel title="Total Daily Energy Expenditure">
          <ResultStat label="Maintenance calories (TDEE)" value={`${fmt(result.tdee, 0)} kcal/day`} accent />
          <div className="afc-result-rows">
            <ResultRow label="BMR (Basal Metabolic Rate)" value={`${fmt(result.bmr, 0)} kcal/day`} strong />
            <ResultRow label="Activity multiplier applied" value={`× ${activity}`} />
          </div>
          <CalcNote>BMR is calculated with the Mifflin-St Jeor equation. TDEE is your BMR multiplied by an activity factor — it is the number of calories that keeps your weight stable.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Total Daily Energy Expenditure" muted>
          <p className="afc-note">Enter your age, weight, height and activity level to estimate your daily calorie burn.</p>
        </ResultPanel>
      )}
    </div>
  );
}
