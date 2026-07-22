"use client";

import { useState, useMemo } from "react";
import { ArrowRight, Info } from "lucide-react";
import {
  fractionToDecimal,
  decimalToFraction,
  fractionToPercent,
  percentToFraction,
  decimalToPercent,
  percentToDecimal,
  simplifyFraction,
  toMixedNumber,
  toImproper,
  detectRepeatingDecimal,
  getStepByStep,
} from "../utils/conversions";
import { CONVERSION_MODES, QUICK_FRACTIONS, QUICK_DECIMALS, QUICK_PERCENTAGES } from "../constants";
import FractionBarViz from "./FractionBarViz";

function FractionInput({ numerator, denominator, onNumChange, onDenomChange, label, disabled }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-semibold text-[var(--muted-foreground)]">{label}</span>
      <div className="flex flex-col items-center">
        <input
          type="number"
          min="0"
          max="9999"
          value={numerator}
          onChange={(e) => onNumChange(parseInt(e.target.value) || 0)}
          disabled={disabled}
          className="h-12 w-24 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] disabled:opacity-50"
        />
        <div className="my-1 h-0.5 w-20 bg-[var(--foreground)]" />
        <input
          type="number"
          min="1"
          max="9999"
          value={denominator}
          onChange={(e) => onDenomChange(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={disabled}
          className="h-12 w-24 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] disabled:opacity-50"
        />
      </div>
    </div>
  );
}

function MixedInput({ whole, numerator, denominator, onWholeChange, onNumChange, onDenomChange, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-semibold text-[var(--muted-foreground)]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={whole}
          onChange={(e) => onWholeChange(parseInt(e.target.value) || 0)}
          className="h-12 w-16 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
        />
        <div className="flex flex-col items-center">
          <input
            type="number"
            min="0"
            value={numerator}
            onChange={(e) => onNumChange(parseInt(e.target.value) || 0)}
            className="h-12 w-20 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
          />
          <div className="my-1 h-0.5 w-16 bg-[var(--foreground)]" />
          <input
            type="number"
            min="1"
            value={denominator}
            onChange={(e) => onDenomChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-12 w-20 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
          />
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, detail, color = "var(--primary)" }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold" style={{ color }}>{value}</p>
      {detail && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{detail}</p>}
    </div>
  );
}

export default function ConversionPanel() {
  const [mode, setMode] = useState("fraction-to-decimal");

  const [fracN, setFracN] = useState(1);
  const [fracD, setFracD] = useState(4);
  const [decimalVal, setDecimalVal] = useState(0.25);
  const [percentVal, setPercentVal] = useState(25);
  const [mixedWhole, setMixedWhole] = useState(1);
  const [mixedN, setMixedN] = useState(1);
  const [mixedD, setMixedD] = useState(4);
  const [impN, setImpN] = useState(5);
  const [impD, setImpD] = useState(4);

  const currentMode = CONVERSION_MODES.find((m) => m.id === mode);

  const results = useMemo(() => {
    const simplified = simplifyFraction(fracN, fracD);
    const decimal = fractionToDecimal(fracN, fracD);
    const percent = fractionToPercent(fracN, fracD);
    const mixed = toMixedNumber(fracN, fracD);
    const repeating = detectRepeatingDecimal(fracN, fracD);

    return { simplified, decimal, percent, mixed, repeating };
  }, [fracN, fracD]);

  const conversionResult = useMemo(() => {
    switch (mode) {
      case "fraction-to-decimal": {
        const dec = fractionToDecimal(fracN, fracD);
        const rep = detectRepeatingDecimal(fracN, fracD);
        const pct = fractionToPercent(fracN, fracD);
        return {
          primary: rep.isRepeating ? rep.display : String(dec),
          secondary: `${pct}%`,
          detail: rep.isRepeating ? `Repeating: ${rep.repeatingPart}` : `Terminating decimal`,
          steps: getStepByStep("fraction", "decimal", { n: fracN, d: fracD }),
        };
      }
      case "decimal-to-fraction": {
        const { n, d } = decimalToFraction(decimalVal);
        const s = simplifyFraction(n, d);
        return {
          primary: `${s.n}/${s.d}`,
          secondary: `${fractionToPercent(s.n, s.d)}%`,
          detail: `GCD: ${gcd(Math.abs(n), d)}`,
          steps: getStepByStep("decimal", "fraction", decimalVal),
        };
      }
      case "fraction-to-percent": {
        const pct = fractionToPercent(fracN, fracD);
        return {
          primary: `${pct}%`,
          secondary: `${fractionToDecimal(fracN, fracD)}`,
          detail: `= ${fracN}/${fracD} × 100`,
          steps: getStepByStep("fraction", "percent", { n: fracN, d: fracD }),
        };
      }
      case "percent-to-fraction": {
        const { n, d } = percentToFraction(percentVal);
        const s = simplifyFraction(n, d);
        return {
          primary: `${s.n}/${s.d}`,
          secondary: `${percentToDecimal(percentVal)}`,
          detail: `Simplified from ${Math.round(percentVal * 100)}/10000`,
          steps: getStepByStep("percent", "fraction", percentVal),
        };
      }
      case "decimal-to-percent": {
        const pct = decimalToPercent(decimalVal);
        return {
          primary: `${pct}%`,
          secondary: `${pct / 100}`,
          detail: `= ${decimalVal} × 100`,
          steps: getStepByStep("decimal", "percent", decimalVal),
        };
      }
      case "percent-to-decimal": {
        const dec = percentToDecimal(percentVal);
        return {
          primary: String(dec),
          secondary: `${fractionToPercent(Math.round(dec * 1000), 1000)}%`,
          detail: `= ${percentVal} ÷ 100`,
          steps: getStepByStep("percent", "decimal", percentVal),
        };
      }
      case "mixed-to-improper": {
        const imp = toImproper(mixedWhole, mixedN, mixedD);
        return {
          primary: `${imp}/${mixedD}`,
          secondary: `${fractionToDecimal(imp, mixedD)}`,
          detail: `${Math.abs(mixedWhole)} × ${mixedD} + ${mixedN} = ${imp}`,
          steps: getStepByStep("mixed", "improper", { whole: mixedWhole, n: mixedN, d: mixedD }),
        };
      }
      case "improper-to-mixed": {
        const m = toMixedNumber(impN, impD);
        return {
          primary: `${m.whole} ${m.n}/${m.d}`,
          secondary: `${fractionToDecimal(impN, impD)}`,
          detail: `${impN} ÷ ${impD} = ${Math.floor(impN / impD)} R ${impN % impD}`,
          steps: getStepByStep("improper", "mixed", { n: impN, d: impD }),
        };
      }
      default:
        return { primary: "0", secondary: "0", detail: "", steps: [] };
    }
  }, [mode, fracN, fracD, decimalVal, percentVal, mixedWhole, mixedN, mixedD, impN, impD]);

  const handleQuickFraction = (n, d) => {
    setFracN(n);
    setFracD(d);
    setDecimalVal(Math.round((n / d) * 10000) / 10000);
    setPercentVal(Math.round((n / d) * 10000) / 100);
  };

  const handleQuickDecimal = (val) => {
    setDecimalVal(val);
    const { n, d } = decimalToFraction(val);
    setFracN(n);
    setFracD(d);
    setPercentVal(Math.round(val * 10000) / 100);
  };

  const handleQuickPercent = (val) => {
    setPercentVal(val);
    const { n, d } = percentToFraction(val);
    setFracN(n);
    setFracD(d);
    setDecimalVal(Math.round((val / 100) * 10000) / 10000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
          <ArrowRight className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Conversion Type</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CONVERSION_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  mode === m.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <p className="text-sm font-bold text-[var(--foreground)]">{m.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{m.from} → {m.to}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input + Result */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* Input Panel */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h4 className="mb-4 text-sm font-bold uppercase text-[var(--muted-foreground)]">Input</h4>

          {(mode === "fraction-to-decimal" || mode === "fraction-to-percent") && (
            <div className="space-y-4">
              <FractionInput
                numerator={fracN}
                denominator={fracD}
                onNumChange={setFracN}
                onDenomChange={setFracD}
                label="Fraction"
              />
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">Quick Select</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FRACTIONS.map(([n, d]) => (
                    <button
                      key={`${n}-${d}`}
                      onClick={() => handleQuickFraction(n, d)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                        fracN === n && fracD === d
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                      }`}
                    >
                      {n}/{d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(mode === "decimal-to-fraction" || mode === "decimal-to-percent") && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">Decimal</span>
                <input
                  type="number"
                  step="0.0001"
                  value={decimalVal}
                  onChange={(e) => setDecimalVal(parseFloat(e.target.value) || 0)}
                  className="h-14 w-full max-w-xs rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-center text-2xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">Quick Select</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_DECIMALS.map((val) => (
                    <button
                      key={val}
                      onClick={() => handleQuickDecimal(val)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                        decimalVal === val
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(mode === "percent-to-fraction" || mode === "percent-to-decimal") && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">Percentage</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10000"
                    value={percentVal}
                    onChange={(e) => setPercentVal(parseFloat(e.target.value) || 0)}
                    className="h-14 w-full max-w-xs rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-center text-2xl font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                  />
                  <span className="ml-2 text-2xl font-bold text-[var(--muted-foreground)]">%</span>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">Quick Select</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PERCENTAGES.map((val) => (
                    <button
                      key={val}
                      onClick={() => handleQuickPercent(val)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                        percentVal === val
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === "mixed-to-improper" && (
            <div className="flex flex-col items-center gap-4">
              <MixedInput
                whole={mixedWhole}
                numerator={mixedN}
                denominator={mixedD}
                onWholeChange={setMixedWhole}
                onNumChange={setMixedN}
                onDenomChange={setMixedD}
                label="Mixed Number"
              />
            </div>
          )}

          {mode === "improper-to-mixed" && (
            <div className="flex flex-col items-center gap-4">
              <FractionInput
                numerator={impN}
                denominator={impD}
                onNumChange={setImpN}
                onDenomChange={setImpD}
                label="Improper Fraction"
              />
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="hidden items-center justify-center lg:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-md">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        {/* Result Panel */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h4 className="mb-4 text-sm font-bold uppercase text-[var(--muted-foreground)]">Result</h4>
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 p-6 text-center">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Converted Value</p>
              <p className="mt-2 text-4xl font-extrabold text-[var(--primary)]">{conversionResult.primary}</p>
              {conversionResult.secondary && (
                <p className="mt-1 text-lg font-bold text-[var(--foreground)]">= {conversionResult.secondary}</p>
              )}
              {conversionResult.detail && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">{conversionResult.detail}</p>
              )}
            </div>

            {/* All Equivalents */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">All Equivalents</p>
              <ResultCard label="Fraction" value={`${results.simplified.n}/${results.simplified.d}`} color="var(--primary)" />
              <ResultCard label="Decimal" value={results.repeating.isRepeating ? results.repeating.display : String(results.decimal)} color="#22D3EE" />
              <ResultCard label="Percentage" value={`${results.percent}%`} color="#8B5CF6" />
              {results.mixed.whole !== 0 && (
                <ResultCard label="Mixed Number" value={`${results.mixed.whole} ${results.mixed.n}/${results.mixed.d}`} color="#F59E0B" />
              )}
            </div>

            {/* Visual */}
            <div className="flex justify-center pt-2">
              <FractionBarViz
                numerator={Math.abs(results.simplified.n)}
                denominator={results.simplified.d}
                width={300}
                height={36}
                color="var(--primary)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step */}
      {conversionResult.steps.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-base font-bold text-[var(--foreground)]">Step-by-Step Solution</h3>
          </div>
          <ol className="space-y-2">
            {conversionResult.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[var(--foreground)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="text-center text-xs text-[var(--muted-foreground)]">
        All calculations run in your browser. No data is stored or uploaded.
      </p>
    </div>
  );
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
