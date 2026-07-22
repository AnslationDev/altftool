"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Field,
  NumberInput,
  Button,
  Grid,
  ResultPanel,
  ResultStat,
  ResultRow,
  CalcNote,
} from "./ui";
import { num, money, plural } from "./format";
import { Plus, Trash2 } from "lucide-react";

export default function CgpaCalculator() {
  const idRef = useRef(3);
  const [semesters, setSemesters] = useState([
    { id: 1, sgpa: "8.2", credits: "22" },
    { id: 2, sgpa: "8.6", credits: "24" },
    { id: 3, sgpa: "7.9", credits: "20" },
  ]);

  const addSemester = () => {
    idRef.current += 1;
    setSemesters((s) => [...s, { id: idRef.current, sgpa: "", credits: "" }]);
  };
  const removeSemester = (id) =>
    setSemesters((ss) => (ss.length > 1 ? ss.filter((s) => s.id !== id) : ss));
  const update = (id, key, val) =>
    setSemesters((ss) => ss.map((s) => (s.id === id ? { ...s, [key]: val } : s)));

  const result = useMemo(() => {
    let totalCredits = 0;
    let weighted = 0;
    let counted = 0;
    for (const s of semesters) {
      const g = num(s.sgpa);
      const c = num(s.credits);
      if (g === null || c === null || c <= 0) continue;
      totalCredits += c;
      weighted += g * c;
      counted += 1;
    }
    if (totalCredits <= 0) return null;
    const cgpa = weighted / totalCredits;
    return { cgpa, totalCredits, counted, percentage: cgpa * 9.5 };
  }, [semesters]);

  return (
    <div className="afc-calc">
      {semesters.map((s, i) => (
        <Grid cols={3} key={s.id}>
          <Field label={`Semester ${i + 1} — SGPA`}>
            <NumberInput
              value={s.sgpa}
              min="0"
              max="10"
              step="0.01"
              placeholder="0–10"
              onChange={(e) => update(s.id, "sgpa", e.target.value)}
            />
          </Field>
          <Field label="Credits">
            <NumberInput
              value={s.credits}
              min="0"
              step="1"
              placeholder="e.g. 22"
              onChange={(e) => update(s.id, "credits", e.target.value)}
            />
          </Field>
          <Field label={" "}>
            <Button
              variant="danger"
              onClick={() => removeSemester(s.id)}
              disabled={semesters.length <= 1}
            >
              <Trash2 size={15} /> Remove
            </Button>
          </Field>
        </Grid>
      ))}

      <div className="afc-actions">
        <Button variant="ghost" onClick={addSemester}>
          <Plus size={15} /> Add semester
        </Button>
      </div>

      {result ? (
        <ResultPanel title="Cumulative grade point average">
          <ResultStat label="CGPA (10-point scale)" value={money(result.cgpa, 2)} accent />
          <div className="afc-result-rows">
            <ResultRow
              label="Semesters counted"
              value={plural(result.counted, "semester", "semesters")}
            />
            <ResultRow label="Total credits" value={money(result.totalCredits, 0)} />
            <ResultRow
              label="Approx. percentage"
              value={`${money(result.percentage, 2)}%`}
              strong
            />
          </div>
          <CalcNote>
            The percentage uses the common CGPA × 9.5 rule (CBSE / many Indian universities). Your
            institution may use a different conversion, so treat it as an estimate.
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Cumulative grade point average" muted>
          <p className="afc-note">Add at least one semester with SGPA and credits above zero.</p>
        </ResultPanel>
      )}
    </div>
  );
}
