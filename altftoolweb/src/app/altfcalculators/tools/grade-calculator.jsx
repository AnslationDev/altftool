"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Field,
  TextInput,
  NumberInput,
  Button,
  Grid,
  ResultPanel,
  ResultStat,
  ResultRow,
  CalcNote,
} from "./ui";
import { num, money } from "./format";
import { Plus, Trash2 } from "lucide-react";

export default function GradeCalculator() {
  const idRef = useRef(3);
  const [rows, setRows] = useState([
    { id: 1, name: "Homework", score: "88", weight: "20" },
    { id: 2, name: "Quizzes", score: "92", weight: "15" },
    { id: 3, name: "Midterm", score: "80", weight: "25" },
  ]);
  const [desired, setDesired] = useState("85");
  const [finalWeight, setFinalWeight] = useState("40");

  const addRow = () => {
    idRef.current += 1;
    setRows((r) => [...r, { id: idRef.current, name: "", score: "", weight: "" }]);
  };
  const removeRow = (id) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));
  const update = (id, key, val) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: val } : r)));

  const current = useMemo(() => {
    let sumW = 0;
    let sumSW = 0;
    for (const r of rows) {
      const s = num(r.score);
      const w = num(r.weight);
      if (s === null || w === null || w <= 0) continue;
      sumW += w;
      sumSW += s * w;
    }
    if (sumW <= 0) return null;
    return { grade: sumSW / sumW, totalWeight: sumW };
  }, [rows]);

  const finalNeeded = useMemo(() => {
    if (!current) return null;
    const target = num(desired);
    const w = num(finalWeight);
    if (target === null || w === null || w <= 0 || w > 100) return null;
    const wf = w / 100;
    const required = (target - current.grade * (1 - wf)) / wf;
    return { required, target, w };
  }, [current, desired, finalWeight]);

  return (
    <div className="afc-calc">
      <ResultPanel title="Current weighted grade">
        {rows.map((r, i) => (
          <Grid cols={4} key={r.id}>
            <Field label={`Assessment ${i + 1}`}>
              <TextInput
                value={r.name}
                placeholder="e.g. Midterm"
                onChange={(e) => update(r.id, "name", e.target.value)}
              />
            </Field>
            <Field label="Score">
              <NumberInput
                suffix="%"
                value={r.score}
                min="0"
                step="0.1"
                placeholder="0–100"
                onChange={(e) => update(r.id, "score", e.target.value)}
              />
            </Field>
            <Field label="Weight">
              <NumberInput
                suffix="%"
                value={r.weight}
                min="0"
                step="0.1"
                placeholder="e.g. 20"
                onChange={(e) => update(r.id, "weight", e.target.value)}
              />
            </Field>
            <Field label={" "}>
              <Button
                variant="danger"
                onClick={() => removeRow(r.id)}
                disabled={rows.length <= 1}
              >
                <Trash2 size={15} /> Remove
              </Button>
            </Field>
          </Grid>
        ))}

        <div className="afc-actions">
          <Button variant="ghost" onClick={addRow}>
            <Plus size={15} /> Add assessment
          </Button>
        </div>

        {current ? (
          <>
            <ResultStat label="Current grade" value={`${money(current.grade, 2)}%`} accent />
            <div className="afc-result-rows">
              <ResultRow
                label="Total weight counted"
                value={`${money(current.totalWeight, 1)}%`}
                strong
              />
            </div>
            {Math.abs(current.totalWeight - 100) > 0.01 ? (
              <CalcNote>
                Weights add up to {money(current.totalWeight, 1)}%. The grade above is the weighted
                average of the assessments entered so far, not the full course total.
              </CalcNote>
            ) : null}
          </>
        ) : (
          <p className="afc-note">Enter a score and weight for at least one assessment.</p>
        )}
      </ResultPanel>

      <ResultPanel title="Score needed on the final">
        <Grid cols={2}>
          <Field label="Desired overall grade" hint="Your target for the whole course.">
            <NumberInput
              suffix="%"
              value={desired}
              min="0"
              step="0.1"
              onChange={(e) => setDesired(e.target.value)}
            />
          </Field>
          <Field label="Final exam weight" hint="Share of the total course grade.">
            <NumberInput
              suffix="%"
              value={finalWeight}
              min="0"
              max="100"
              step="0.1"
              onChange={(e) => setFinalWeight(e.target.value)}
            />
          </Field>
        </Grid>

        {finalNeeded ? (
          <>
            <ResultStat
              label="Required score on the final"
              value={`${money(finalNeeded.required, 2)}%`}
              accent
            />
            {finalNeeded.required > 100 ? (
              <CalcNote>
                Reaching {money(finalNeeded.target, 1)}% overall is not possible with a perfect
                final — you would need above 100%. Aim for the highest score you can, or revise your
                target.
              </CalcNote>
            ) : finalNeeded.required <= 0 ? (
              <CalcNote>
                You have already secured {money(finalNeeded.target, 1)}% overall — even a 0% on the
                final keeps you at or above your target.
              </CalcNote>
            ) : (
              <CalcNote>
                Uses your current grade of {money(current.grade, 2)}% as the pre-final work
                ({money(100 - finalNeeded.w, 1)}% of the course).
              </CalcNote>
            )}
          </>
        ) : (
          <p className="afc-note">
            Enter your assessments above, then a target and final weight to see the score you need.
          </p>
        )}
      </ResultPanel>
    </div>
  );
}
