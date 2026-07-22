"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, RadioCards, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, round } from "./format";

const GOALS = [
  { label: "Sedentary", value: "0.8", desc: "0.8 g/kg — general health" },
  { label: "Active", value: "1.4", desc: "1.4 g/kg — regular exercise" },
  { label: "Build muscle", value: "1.8", desc: "1.8 g/kg — strength & hypertrophy" },
  { label: "Fat loss", value: "2.0", desc: "2.0 g/kg — preserve muscle in a deficit" },
];

export default function ProteinCalculator() {
  const [weight, setWeight] = useState("70");
  const [goal, setGoal] = useState("1.4");

  const result = useMemo(() => {
    const kg = num(weight);
    const factor = num(goal);
    if (kg === null || factor === null || kg <= 0) return null;
    const grams = kg * factor;
    const low = kg * Math.max(0.1, factor - 0.2);
    const high = kg * (factor + 0.2);
    return { grams, low, high };
  }, [weight, goal]);

  return (
    <div className="afc-calc">
      <Field label="Body weight">
        <NumberInput suffix="kg" value={weight} min="0" onChange={(e) => setWeight(e.target.value)} />
      </Field>
      <Field label="Goal">
        <RadioCards name="goal" value={goal} onChange={setGoal} options={GOALS} />
      </Field>

      {result ? (
        <ResultPanel title="Daily protein target">
          <ResultStat label="Recommended protein" value={`${round(result.grams, 0)} g/day`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Sensible range" value={`${round(result.low, 0)}–${round(result.high, 0)} g/day`} strong />
          </div>
          <CalcNote>Target = body weight × selected g/kg factor. Spread intake across 3–4 meals of 20–40 g for best muscle-protein synthesis. Athletes and people in a calorie deficit sit at the higher end.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Daily protein target" muted>
          <p className="afc-note">Enter your body weight and pick a goal to see your protein target.</p>
        </ResultPanel>
      )}
    </div>
  );
}
