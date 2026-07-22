"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Dices } from "lucide-react";
import { Field, NumberInput, Select, Button, ResultPanel, ResultStat } from "./ui";
import { clamp } from "./format";

const SIDES = [4, 6, 8, 10, 12, 20];

// Pip layout for a six-sided die: which cells of a 3x3 grid hold a dot.
const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// Uniform integer in [1, sides] from crypto, with rejection sampling to avoid
// modulo bias.
function rollDie(sides) {
  const limit = Math.floor(0x100000000 / sides) * sides;
  const buf = new Uint32Array(1);
  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return (x % sides) + 1;
}

function DieFace({ value, sides }) {
  if (sides === 6) {
    const on = new Set(PIPS[value] || []);
    return (
      <div className="afc-die" aria-label={`Die showing ${value}`}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 5,
            width: 40,
            height: 40,
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: on.has(i) ? "var(--afc-ink)" : "transparent",
                justifySelf: "center",
                alignSelf: "center",
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="afc-die" aria-label={`Die showing ${value}`}>
      {value}
    </div>
  );
}

export default function DiceRoller() {
  const [count, setCount] = useState("2");
  const [sides, setSides] = useState("6");
  const [dice, setDice] = useState([]);

  const n = clamp(Math.round(Number(count) || 0), 1, 10);
  const s = Number(sides);

  const roll = useCallback(() => {
    setDice(Array.from({ length: n }, () => rollDie(s)));
  }, [n, s]);

  // Roll once on mount and whenever the number of dice or sides changes.
  useEffect(() => {
    roll();
  }, [roll]);

  const total = dice.reduce((a, b) => a + b, 0);

  return (
    <div className="afc-calc">
      <div className="afc-grid afc-grid-2">
        <Field label="Number of dice" hint="Between 1 and 10.">
          <NumberInput
            value={count}
            min="1"
            max="10"
            step="1"
            onChange={(e) => setCount(e.target.value)}
          />
        </Field>
        <Field label="Sides per die">
          <Select value={sides} onChange={(e) => setSides(e.target.value)}>
            {SIDES.map((v) => (
              <option key={v} value={v}>
                d{v}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="afc-actions">
        <Button variant="primary" onClick={roll}>
          <Dices size={15} /> Roll {n} × d{s}
        </Button>
      </div>

      {dice.length ? (
        <ResultPanel title="Result">
          <div className="afc-dice">
            {dice.map((v, i) => (
              <DieFace key={i} value={v} sides={s} />
            ))}
          </div>
          <ResultStat
            label={dice.length > 1 ? "Total of all dice" : "You rolled"}
            value={total}
            accent
          />
        </ResultPanel>
      ) : (
        <ResultPanel title="Result" muted>
          <p className="afc-note">Press Roll to throw the dice.</p>
        </ResultPanel>
      )}
    </div>
  );
}
