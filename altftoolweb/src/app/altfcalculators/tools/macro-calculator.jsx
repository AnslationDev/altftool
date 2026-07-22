"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, RadioCards, Grid, ResultPanel, ResultStat, CalcNote } from "./ui";
import { num, round } from "./format";

// Percentages are carbs / protein / fat.
const SPLITS = {
  balanced: { c: 40, p: 30, f: 30 },
  "low-carb": { c: 25, p: 40, f: 35 },
  "high-protein": { c: 40, p: 40, f: 20 },
};

const SPLIT_OPTIONS = [
  { label: "Balanced", value: "balanced", desc: "40% carbs / 30% protein / 30% fat" },
  { label: "Low-carb", value: "low-carb", desc: "25% carbs / 40% protein / 35% fat" },
  { label: "High-protein", value: "high-protein", desc: "40% carbs / 40% protein / 20% fat" },
];

export default function MacroCalculator() {
  const [calories, setCalories] = useState("2000");
  const [split, setSplit] = useState("balanced");

  const result = useMemo(() => {
    const cal = num(calories);
    if (cal === null || cal <= 0) return null;
    const s = SPLITS[split];
    const carbs = { pct: s.c, kcal: (cal * s.c) / 100, grams: (cal * s.c) / 100 / 4 };
    const protein = { pct: s.p, kcal: (cal * s.p) / 100, grams: (cal * s.p) / 100 / 4 };
    const fat = { pct: s.f, kcal: (cal * s.f) / 100, grams: (cal * s.f) / 100 / 9 };
    return { carbs, protein, fat };
  }, [calories, split]);

  return (
    <div className="afc-calc">
      <Field label="Daily calories" hint="Your target intake, e.g. from a TDEE or calorie calculator.">
        <NumberInput suffix="kcal" value={calories} min="0" onChange={(e) => setCalories(e.target.value)} />
      </Field>
      <Field label="Macro split">
        <RadioCards name="split" value={split} onChange={setSplit} options={SPLIT_OPTIONS} />
      </Field>

      {result ? (
        <ResultPanel title="Your daily macros">
          <Grid cols={3}>
            <ResultStat label="Carbohydrates" value={`${round(result.carbs.grams, 0)} g`} sub={`${result.carbs.pct}% · ${round(result.carbs.kcal, 0)} kcal`} accent />
            <ResultStat label="Protein" value={`${round(result.protein.grams, 0)} g`} sub={`${result.protein.pct}% · ${round(result.protein.kcal, 0)} kcal`} accent />
            <ResultStat label="Fat" value={`${round(result.fat.grams, 0)} g`} sub={`${result.fat.pct}% · ${round(result.fat.kcal, 0)} kcal`} accent />
          </Grid>
          <CalcNote>Grams come from the energy density of each macronutrient: 4 kcal/g for carbs and protein, 9 kcal/g for fat.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Your daily macros" muted>
          <p className="afc-note">Enter your daily calorie target and choose a split to see grams of each macronutrient.</p>
        </ResultPanel>
      )}
    </div>
  );
}
