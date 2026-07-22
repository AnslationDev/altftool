"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, ResultPanel, ResultStat, ResultRow, CopyField, CalcNote } from "./ui";
import { num, fmt, plural } from "./format";

const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const sup = (n) => String(n).split("").map((c) => SUP[c] || c).join("");

const MAX = 1e7;

export default function FactorCalculator() {
  const [value, setValue] = useState("360");

  const r = useMemo(() => {
    const n = num(value);
    if (n === null) return null;
    if (!Number.isInteger(n) || n < 1) return { error: "Enter a whole number of 1 or more." };
    if (n > MAX) return { error: "Please enter a number up to 10,000,000." };

    // All divisors.
    const factors = [];
    for (let i = 1; i * i <= n; i++) {
      if (n % i === 0) {
        factors.push(i);
        if (i !== n / i) factors.push(n / i);
      }
    }
    factors.sort((a, b) => a - b);

    // Prime factorization.
    const primes = [];
    let m = n;
    for (let p = 2; p * p <= m; p++) {
      if (m % p === 0) {
        let e = 0;
        while (m % p === 0) { m /= p; e++; }
        primes.push([p, e]);
      }
    }
    if (m > 1) primes.push([m, 1]);

    const primeText =
      n === 1
        ? "1 has no prime factors"
        : primes.map(([p, e]) => (e === 1 ? `${p}` : `${p}${sup(e)}`)).join(" × ");

    const isPrime = n > 1 && primes.length === 1 && primes[0][1] === 1;

    return { n, factors, primeText, count: factors.length, isPrime };
  }, [value]);

  return (
    <div className="afc-calc">
      <Field label="Number" hint="Positive whole number, up to 10,000,000.">
        <NumberInput value={value} min="1" step="1" onChange={(e) => setValue(e.target.value)} />
      </Field>

      {r && !r.error ? (
        <ResultPanel title="Factors">
          <ResultStat
            label={r.isPrime ? `${fmt(r.n, 0)} is a prime number` : `Factors of ${fmt(r.n, 0)}`}
            value={plural(r.count, "factor", "factors")}
            accent
          />
          <div className="afc-result-rows">
            <ResultRow label="Prime factorization" value={r.primeText} strong />
            <ResultRow label="Factor count" value={r.count} />
          </div>
          <div style={{ marginTop: 12 }}>
            <CopyField label="All factors" multiline value={r.factors.join(", ")} />
          </div>
          <CalcNote>Factors (divisors) divide the number evenly with no remainder. Every whole number above 1 has a unique prime factorization.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Factors" muted>
          <p className="afc-note">{r?.error || "Enter a positive whole number."}</p>
        </ResultPanel>
      )}
    </div>
  );
}
