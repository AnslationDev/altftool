"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, round } from "./format";

export default function IdealWeightCalculator() {
  const [sex, setSex] = useState("male");
  const [height, setHeight] = useState("175");

  const result = useMemo(() => {
    const cm = num(height);
    if (cm === null || cm <= 0) return null;
    const inchesOver5ft = Math.max(0, cm / 2.54 - 60); // inches above 5 ft
    const meters = cm / 100;

    // Devine, Robinson, Miller formulas (kg)
    const devine = (sex === "male" ? 50 : 45.5) + 2.3 * inchesOver5ft;
    const robinson = (sex === "male" ? 52 : 49) + (sex === "male" ? 1.9 : 1.7) * inchesOver5ft;
    const miller = (sex === "male" ? 56.2 : 53.1) + (sex === "male" ? 1.41 : 1.36) * inchesOver5ft;

    // Healthy BMI range (18.5–24.9)
    const bmiLow = 18.5 * meters * meters;
    const bmiHigh = 24.9 * meters * meters;

    return {
      devine: round(devine, 1),
      robinson: round(robinson, 1),
      miller: round(miller, 1),
      bmiLow: round(bmiLow, 1),
      bmiHigh: round(bmiHigh, 1),
    };
  }, [sex, height]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
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
        <Field label="Height">
          <NumberInput suffix="cm" value={height} min="0" onChange={(e) => setHeight(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Ideal body weight">
          <ResultStat
            label="Healthy BMI range"
            value={`${result.bmiLow}–${result.bmiHigh} kg`}
            accent
          />
          <div className="afc-result-rows">
            <ResultRow label="Devine formula" value={`${result.devine} kg`} />
            <ResultRow label="Robinson formula" value={`${result.robinson} kg`} />
            <ResultRow label="Miller formula" value={`${result.miller} kg`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Ideal body weight" muted>
          <p className="afc-note">Enter your height to see ideal weight estimates.</p>
        </ResultPanel>
      )}
    </div>
  );
}
