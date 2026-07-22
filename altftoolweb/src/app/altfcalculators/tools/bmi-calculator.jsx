"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, round } from "./format";

function category(bmi) {
  if (bmi < 18.5) return { label: "Underweight", tone: "warn" };
  if (bmi < 25) return { label: "Normal weight", tone: "good" };
  if (bmi < 30) return { label: "Overweight", tone: "warn" };
  return { label: "Obese", tone: "bad" };
}

export default function BmiCalculator() {
  const [units, setUnits] = useState("metric");
  const [weight, setWeight] = useState("70");
  const [heightCm, setHeightCm] = useState("175");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [lb, setLb] = useState("154");

  const result = useMemo(() => {
    let kg;
    let meters;
    if (units === "metric") {
      kg = num(weight);
      const cm = num(heightCm);
      if (kg === null || cm === null || kg <= 0 || cm <= 0) return null;
      meters = cm / 100;
    } else {
      const w = num(lb);
      const ft = num(feet) || 0;
      const inch = num(inches) || 0;
      const totalInch = ft * 12 + inch;
      if (w === null || w <= 0 || totalInch <= 0) return null;
      kg = w * 0.45359237;
      meters = totalInch * 0.0254;
    }
    const bmi = kg / (meters * meters);
    if (!Number.isFinite(bmi)) return null;
    const healthyLow = 18.5 * meters * meters;
    const healthyHigh = 24.9 * meters * meters;
    return { bmi: round(bmi, 1), cat: category(bmi), meters, healthyLow, healthyHigh, metric: units === "metric" };
  }, [units, weight, heightCm, feet, inches, lb]);

  const rangeUnit = result?.metric ? "kg" : "lb";
  const toDisplayWeight = (kg) => (result?.metric ? kg : kg / 0.45359237);

  return (
    <div className="afc-calc">
      <Field label="Units">
        <Segmented
          name="units"
          value={units}
          onChange={setUnits}
          options={[
            { label: "Metric (kg, cm)", value: "metric" },
            { label: "Imperial (lb, ft)", value: "imperial" },
          ]}
        />
      </Field>

      {units === "metric" ? (
        <Grid cols={2}>
          <Field label="Weight">
            <NumberInput suffix="kg" value={weight} min="0" onChange={(e) => setWeight(e.target.value)} />
          </Field>
          <Field label="Height">
            <NumberInput suffix="cm" value={heightCm} min="0" onChange={(e) => setHeightCm(e.target.value)} />
          </Field>
        </Grid>
      ) : (
        <Grid cols={3}>
          <Field label="Weight">
            <NumberInput suffix="lb" value={lb} min="0" onChange={(e) => setLb(e.target.value)} />
          </Field>
          <Field label="Height (ft)">
            <NumberInput suffix="ft" value={feet} min="0" onChange={(e) => setFeet(e.target.value)} />
          </Field>
          <Field label="Height (in)">
            <NumberInput suffix="in" value={inches} min="0" onChange={(e) => setInches(e.target.value)} />
          </Field>
        </Grid>
      )}

      {result ? (
        <ResultPanel title="Your BMI">
          <ResultStat label={result.cat.label} value={result.bmi} accent />
          <div className="afc-result-rows">
            <ResultRow
              label="Healthy weight for your height"
              value={`${round(toDisplayWeight(result.healthyLow), 1)}–${round(toDisplayWeight(result.healthyHigh), 1)} ${rangeUnit}`}
              strong
            />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Your BMI" muted>
          <p className="afc-note">Enter your weight and height to calculate BMI.</p>
        </ResultPanel>
      )}
    </div>
  );
}
