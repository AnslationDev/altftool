"use client";

import React, { useMemo, useRef, useState } from "react";
import { Field, NumberInput, Select, Button, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money, plural } from "./format";
import { Plus, Trash2 } from "lucide-react";

const GRADE_OPTIONS = [
  { label: "A (4.0)", value: "4" },
  { label: "A− (3.7)", value: "3.7" },
  { label: "B+ (3.3)", value: "3.3" },
  { label: "B (3.0)", value: "3" },
  { label: "B− (2.7)", value: "2.7" },
  { label: "C+ (2.3)", value: "2.3" },
  { label: "C (2.0)", value: "2" },
  { label: "D (1.0)", value: "1" },
  { label: "F (0.0)", value: "0" },
];

export default function GpaCalculator() {
  const idRef = useRef(3);
  const [courses, setCourses] = useState([
    { id: 1, credit: "3", grade: "4" },
    { id: 2, credit: "4", grade: "3.7" },
    { id: 3, credit: "3", grade: "3.3" },
  ]);

  const addCourse = () => {
    idRef.current += 1;
    setCourses((c) => [...c, { id: idRef.current, credit: "3", grade: "4" }]);
  };
  const removeCourse = (id) =>
    setCourses((cs) => (cs.length > 1 ? cs.filter((c) => c.id !== id) : cs));
  const update = (id, key, val) =>
    setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, [key]: val } : c)));

  const result = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    let counted = 0;
    for (const c of courses) {
      const cr = num(c.credit);
      const pt = num(c.grade);
      if (cr === null || pt === null || cr <= 0) continue;
      totalCredits += cr;
      totalPoints += cr * pt;
      counted += 1;
    }
    if (totalCredits <= 0) return null;
    return { gpa: totalPoints / totalCredits, totalCredits, totalPoints, counted };
  }, [courses]);

  return (
    <div className="afc-calc">
      {courses.map((c, i) => (
        <Grid cols={3} key={c.id}>
          <Field label={`Course ${i + 1} — credit hours`}>
            <NumberInput
              value={c.credit}
              min="0"
              step="0.5"
              placeholder="e.g. 3"
              onChange={(e) => update(c.id, "credit", e.target.value)}
            />
          </Field>
          <Field label="Grade">
            <Select value={c.grade} onChange={(e) => update(c.id, "grade", e.target.value)}>
              {GRADE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={" "}>
            <Button
              variant="danger"
              onClick={() => removeCourse(c.id)}
              disabled={courses.length <= 1}
            >
              <Trash2 size={15} /> Remove
            </Button>
          </Field>
        </Grid>
      ))}

      <div className="afc-actions">
        <Button variant="ghost" onClick={addCourse}>
          <Plus size={15} /> Add course
        </Button>
      </div>

      {result ? (
        <ResultPanel title="Grade point average">
          <ResultStat label="GPA (4.0 scale)" value={money(result.gpa, 2)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Courses counted" value={plural(result.counted, "course", "courses")} />
            <ResultRow label="Total credit hours" value={money(result.totalCredits, 1)} />
            <ResultRow label="Total quality points" value={money(result.totalPoints, 2)} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Grade point average" muted>
          <p className="afc-note">Add at least one course with credit hours above zero.</p>
        </ResultPanel>
      )}
    </div>
  );
}
