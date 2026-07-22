"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Field, NumberInput, Button, CopyField, ResultPanel, ResultRow } from "./ui";
import { clamp } from "./format";

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  number: "0123456789",
  symbol: "!@#$%^&*()-_=+[]{};:,.?/",
};

const TOGGLES = [
  { key: "upper", label: "Uppercase" },
  { key: "lower", label: "Lowercase" },
  { key: "number", label: "Numbers" },
  { key: "symbol", label: "Symbols" },
];

// Uniformly pick an index in [0, max) using crypto, with rejection sampling
// to avoid modulo bias.
function secureIndex(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

// Fisher–Yates shuffle using secure indices.
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function strengthLabel(bits) {
  if (bits < 28) return { label: "Very weak", accent: false };
  if (bits < 36) return { label: "Weak", accent: false };
  if (bits < 60) return { label: "Reasonable", accent: false };
  if (bits < 128) return { label: "Strong", accent: true };
  return { label: "Very strong", accent: true };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState("16");
  const [enabled, setEnabled] = useState({
    upper: true,
    lower: true,
    number: true,
    symbol: false,
  });
  const [password, setPassword] = useState("");

  const anySelected = Object.values(enabled).some(Boolean);
  const len = clamp(Math.round(Number(length) || 0), 4, 64);

  const generate = useCallback(() => {
    const activeKeys = TOGGLES.map((t) => t.key).filter((k) => enabled[k]);
    if (!activeKeys.length) {
      setPassword("");
      return;
    }
    const pool = activeKeys.map((k) => SETS[k]).join("");
    const chars = [];
    // Guarantee at least one character from each selected set.
    activeKeys.forEach((k) => {
      chars.push(SETS[k][secureIndex(SETS[k].length)]);
    });
    while (chars.length < len) {
      chars.push(pool[secureIndex(pool.length)]);
    }
    // If len < number of sets, trim then shuffle.
    setPassword(shuffle(chars.slice(0, len)).join(""));
  }, [enabled, len]);

  // Auto-generate on mount and whenever options change.
  useEffect(() => {
    generate();
  }, [generate]);

  const toggle = (key) => {
    setEnabled((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!Object.values(next).some(Boolean)) return prev; // keep >=1 set
      return next;
    });
  };

  const poolSize = TOGGLES.reduce(
    (n, t) => n + (enabled[t.key] ? SETS[t.key].length : 0),
    0
  );
  const bits = poolSize > 0 ? Math.round(len * Math.log2(poolSize)) : 0;
  const strength = strengthLabel(bits);

  return (
    <div className="afc-calc">
      <Field label="Length" hint="Between 4 and 64 characters.">
        <NumberInput
          value={length}
          min="4"
          max="64"
          step="1"
          onChange={(e) => setLength(e.target.value)}
        />
      </Field>

      <Field label="Include" hint="At least one set must stay on.">
        <div className="afc-actions">
          {TOGGLES.map((t) => (
            <Button
              key={t.key}
              variant={enabled[t.key] ? "primary" : "ghost"}
              onClick={() => toggle(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </Field>

      <div className="afc-actions">
        <Button variant="primary" onClick={generate} disabled={!anySelected}>
          <RefreshCw size={15} /> Generate
        </Button>
      </div>

      {password ? (
        <ResultPanel title="Your password">
          <CopyField value={password} label="Generated password" />
          <div className="afc-result-rows">
            <ResultRow label="Strength" value={strength.label} strong />
            <ResultRow label="Entropy" value={`${bits} bits`} />
            <ResultRow label="Character pool" value={`${poolSize} symbols`} />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Your password" muted>
          <p className="afc-note">Select at least one character set to generate a password.</p>
        </ResultPanel>
      )}
    </div>
  );
}
