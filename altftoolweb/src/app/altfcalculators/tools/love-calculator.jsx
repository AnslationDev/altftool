"use client";

import React, { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Field, TextInput, Grid, ResultPanel, ResultStat, CalcNote } from "./ui";

// Deterministic 0-100 score from two names. Order-independent: we lowercase
// both names, keep only letters, sort every letter, then sum the char codes
// and take mod 101. The same pair of names always yields the same score.
function loveScore(a, b) {
  const letters = (a + b)
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .split("")
    .sort()
    .join("");
  if (!letters) return null;
  let sum = 0;
  for (let i = 0; i < letters.length; i++) sum += letters.charCodeAt(i);
  return sum % 101;
}

function band(score) {
  if (score < 40) return { message: "Keep trying!", accent: false };
  if (score < 70) return { message: "Good match", accent: false };
  if (score < 90) return { message: "Great match", accent: true };
  return { message: "Perfect match!", accent: true };
}

export default function LoveCalculator() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");

  const result = useMemo(() => {
    const a = name1.trim();
    const b = name2.trim();
    if (!a || !b) return null;
    const score = loveScore(a, b);
    if (score === null) return null;
    return { a, b, score, ...band(score) };
  }, [name1, name2]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="First name">
          <TextInput
            value={name1}
            placeholder="e.g. Alex"
            onChange={(e) => setName1(e.target.value)}
          />
        </Field>
        <Field label="Second name">
          <TextInput
            value={name2}
            placeholder="e.g. Riya"
            onChange={(e) => setName2(e.target.value)}
          />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Love score">
          <ResultStat
            label={
              <span>
                <Heart size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                {result.a} &amp; {result.b}
              </span>
            }
            value={`${result.score}%`}
            sub={result.message}
            accent={result.accent}
          />
          <CalcNote>
            Just for fun — this score comes from the letters in the two names,
            not from any real measure of compatibility.
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Love score" muted>
          <p className="afc-note">Enter both names to reveal the score.</p>
        </ResultPanel>
      )}
    </div>
  );
}
