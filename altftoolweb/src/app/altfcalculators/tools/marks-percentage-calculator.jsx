"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Field,
  TextInput,
  NumberInput,
  Segmented,
  Button,
  Grid,
  ResultPanel,
  ResultStat,
  ResultRow,
} from "./ui";
import { num, money } from "./format";
import { Plus, Trash2 } from "lucide-react";

const MODES = [
  { label: "Single", value: "single" },
  { label: "Subjects", value: "subjects" },
];

function gradeBand(pct) {
  if (pct >= 90) return "A+ — Outstanding";
  if (pct >= 80) return "A — Excellent";
  if (pct >= 70) return "B+ — Very good";
  if (pct >= 60) return "B — Good";
  if (pct >= 50) return "C — Average";
  if (pct >= 40) return "D — Pass";
  return "F — Fail";
}

export default function MarksPercentageCalculator() {
  const [mode, setMode] = useState("single");

  // Single mode
  const [obtained, setObtained] = useState("437");
  const [total, setTotal] = useState("500");

  // Subjects mode
  const idRef = useRef(3);
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Mathematics", got: "92", max: "100" },
    { id: 2, name: "Science", got: "85", max: "100" },
    { id: 3, name: "English", got: "78", max: "100" },
  ]);

  const addSubject = () => {
    idRef.current += 1;
    setSubjects((s) => [...s, { id: idRef.current, name: "", got: "", max: "100" }]);
  };
  const removeSubject = (id) =>
    setSubjects((ss) => (ss.length > 1 ? ss.filter((s) => s.id !== id) : ss));
  const update = (id, key, val) =>
    setSubjects((ss) => ss.map((s) => (s.id === id ? { ...s, [key]: val } : s)));

  const single = useMemo(() => {
    const o = num(obtained);
    const t = num(total);
    if (o === null || t === null || t <= 0) return null;
    const pct = (o / t) * 100;
    return { pct, o, t };
  }, [obtained, total]);

  const multi = useMemo(() => {
    let sumGot = 0;
    let sumMax = 0;
    let counted = 0;
    for (const s of subjects) {
      const g = num(s.got);
      const m = num(s.max);
      if (g === null || m === null || m <= 0) continue;
      sumGot += g;
      sumMax += m;
      counted += 1;
    }
    if (sumMax <= 0) return null;
    return { pct: (sumGot / sumMax) * 100, sumGot, sumMax, counted };
  }, [subjects]);

  return (
    <div className="afc-calc">
      <Field label="Mode">
        <Segmented options={MODES} value={mode} onChange={setMode} name="marks-mode" />
      </Field>

      {mode === "single" ? (
        <>
          <Grid cols={2}>
            <Field label="Marks obtained">
              <NumberInput
                value={obtained}
                min="0"
                step="0.5"
                placeholder="e.g. 437"
                onChange={(e) => setObtained(e.target.value)}
              />
            </Field>
            <Field label="Total marks">
              <NumberInput
                value={total}
                min="0"
                step="0.5"
                placeholder="e.g. 500"
                onChange={(e) => setTotal(e.target.value)}
              />
            </Field>
          </Grid>

          {single ? (
            <ResultPanel title="Percentage">
              <ResultStat label="Percentage" value={`${money(single.pct, 2)}%`} accent />
              <div className="afc-result-rows">
                <ResultRow
                  label="Marks"
                  value={`${money(single.o, 2)} / ${money(single.t, 2)}`}
                />
                <ResultRow label="Grade band" value={gradeBand(single.pct)} strong />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel title="Percentage" muted>
              <p className="afc-note">Enter marks obtained and a total above zero.</p>
            </ResultPanel>
          )}
        </>
      ) : (
        <>
          {subjects.map((s, i) => (
            <Grid cols={4} key={s.id}>
              <Field label={`Subject ${i + 1}`}>
                <TextInput
                  value={s.name}
                  placeholder="e.g. Science"
                  onChange={(e) => update(s.id, "name", e.target.value)}
                />
              </Field>
              <Field label="Obtained">
                <NumberInput
                  value={s.got}
                  min="0"
                  step="0.5"
                  placeholder="e.g. 85"
                  onChange={(e) => update(s.id, "got", e.target.value)}
                />
              </Field>
              <Field label="Out of">
                <NumberInput
                  value={s.max}
                  min="0"
                  step="0.5"
                  placeholder="e.g. 100"
                  onChange={(e) => update(s.id, "max", e.target.value)}
                />
              </Field>
              <Field label={" "}>
                <Button
                  variant="danger"
                  onClick={() => removeSubject(s.id)}
                  disabled={subjects.length <= 1}
                >
                  <Trash2 size={15} /> Remove
                </Button>
              </Field>
            </Grid>
          ))}

          <div className="afc-actions">
            <Button variant="ghost" onClick={addSubject}>
              <Plus size={15} /> Add subject
            </Button>
          </div>

          {multi ? (
            <ResultPanel title="Overall percentage">
              <ResultStat label="Overall percentage" value={`${money(multi.pct, 2)}%`} accent />
              <div className="afc-result-rows">
                <ResultRow
                  label="Total marks"
                  value={`${money(multi.sumGot, 2)} / ${money(multi.sumMax, 2)}`}
                />
                <ResultRow label="Grade band" value={gradeBand(multi.pct)} strong />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel title="Overall percentage" muted>
              <p className="afc-note">
                Enter obtained and maximum marks for at least one subject.
              </p>
            </ResultPanel>
          )}
        </>
      )}
    </div>
  );
}
