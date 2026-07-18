"use client";

import { useMemo, useState } from "react";
import { CircleAlert, Copy, Divide, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const INT_RE = /^-?\d+$/;

const parseBig = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!INT_RE.test(trimmed)) return null;
  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
};

const absBig = (x) => (x < 0n ? -x : x);

function gcdBig(a, b) {
  let x = absBig(a);
  let y = absBig(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0n ? 1n : x;
}

const lcmBig = (a, b) => (absBig(a) / gcdBig(a, b)) * absBig(b);

const fmtDecimal = (n, d) => {
  const value = Number(n) / Number(d);
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 6 }).format(value);
};

const describeMixed = (n, d) => {
  if (d === 1n || absBig(n) < d) return null;
  const whole = n / d;
  const rem = absBig(n % d);
  return rem === 0n ? `${whole}` : `${whole} ${rem}/${d}`;
};

function readFraction(frac, mixed, label) {
  const num = parseBig(frac.num === "" ? "0" : frac.num);
  const den = parseBig(frac.den);
  const whole = mixed ? parseBig(frac.whole === "" ? "0" : frac.whole) : 0n;
  if (num === null || whole === null || (frac.den !== "" && den === null)) {
    return { error: `${label}: use whole numbers only (like 3 or -2).` };
  }
  if (frac.den === "" || den === null) {
    return { error: `${label}: fill in the denominator (the bottom number).` };
  }
  if (den === 0n) {
    return { error: `${label}: the denominator can't be 0 — dividing by zero is undefined.` };
  }
  let n = num;
  let d = den;
  if (d < 0n) {
    d = -d;
    n = -n;
  }
  let note = null;
  if (whole !== 0n) {
    const sign = whole < 0n ? -1n : 1n;
    const improper = sign * (absBig(whole) * d + absBig(n));
    note = `${whole} ${absBig(n)}/${d} = ${improper}/${d}`;
    n = improper;
  }
  return { n, d, note };
}

const operations = [
  { id: "add", symbol: "+", label: "Add" },
  { id: "sub", symbol: "−", label: "Subtract" },
  { id: "mul", symbol: "×", label: "Multiply" },
  { id: "div", symbol: "÷", label: "Divide" },
];

const opSymbols = { add: "+", sub: "−", mul: "×", div: "÷" };

const presets = [
  { label: "3/4 + 1/6", mixed: false, a: { whole: "", num: "3", den: "4" }, b: { whole: "", num: "1", den: "6" }, op: "add" },
  { label: "5/6 − 3/8", mixed: false, a: { whole: "", num: "5", den: "6" }, b: { whole: "", num: "3", den: "8" }, op: "sub" },
  { label: "2 1/2 × 4/5", mixed: true, a: { whole: "2", num: "1", den: "2" }, b: { whole: "", num: "4", den: "5" }, op: "mul" },
  { label: "7/8 ÷ 3/4", mixed: false, a: { whole: "", num: "7", den: "8" }, b: { whole: "", num: "3", den: "4" }, op: "div" },
];

function FractionGlyph({ n, d, className }) {
  if (d === 1n) {
    return <span className={className}>{n.toString()}</span>;
  }
  return (
    <span
      role="img"
      aria-label={`${n} over ${d}`}
      className={`inline-flex flex-col items-center align-middle ${className || ""}`}
    >
      <span aria-hidden="true" className="leading-tight">
        {n.toString()}
      </span>
      <span aria-hidden="true" className="my-1 h-0.5 w-full min-w-6 rounded bg-current" />
      <span aria-hidden="true" className="leading-tight">
        {d.toString()}
      </span>
    </span>
  );
}

function FractionInputGroup({ title, frac, onChange, mixed }) {
  const inputClass =
    "mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-center text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";
  return (
    <fieldset className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
      <legend className="px-1 text-xs font-semibold uppercase text-[var(--muted-foreground)]">{title}</legend>
      <div className="flex items-center justify-center gap-4">
        {mixed && (
          <label className="block w-16">
            <span className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Whole</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={frac.whole}
              onChange={(event) => onChange({ ...frac, whole: event.target.value })}
              className={inputClass}
            />
          </label>
        )}
        <div className="w-24">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Numerator</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={frac.num}
              onChange={(event) => onChange({ ...frac, num: event.target.value })}
              className={inputClass}
            />
          </label>
          <div className="my-2 h-0.5 rounded bg-[var(--foreground)]" aria-hidden="true" />
          <label className="block">
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={frac.den}
              onChange={(event) => onChange({ ...frac, den: event.target.value })}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-center text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
            <span className="mt-1 block text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
              Denominator
            </span>
          </label>
        </div>
      </div>
    </fieldset>
  );
}

function StepsList({ steps }) {
  return (
    <ol className="mt-3 grid gap-2">
      {steps.map((step, index) => (
        <li
          key={`${index}-${step}`}
          className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
            {index + 1}
          </span>
          <span className="leading-6">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function ErrorPanel({ message }) {
  return (
    <div
      className="mt-4 flex items-start gap-3 rounded-md p-4 text-sm font-semibold"
      style={{ background: "var(--anslation-ds-danger-soft)", color: "var(--anslation-ds-danger)" }}
      role="alert"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export default function ToolHome() {
  const [tab, setTab] = useState("calculate");
  const [mixed, setMixed] = useState(false);
  const [fracA, setFracA] = useState({ whole: "", num: "3", den: "4" });
  const [fracB, setFracB] = useState({ whole: "", num: "1", den: "6" });
  const [op, setOp] = useState("add");
  const [sNum, setSNum] = useState("18");
  const [sDen, setSDen] = useState("24");
  const [dec, setDec] = useState("3.25");
  const [copied, setCopied] = useState(null);

  const calc = useMemo(() => {
    const A = readFraction(fracA, mixed, "First fraction");
    if (A.error) return { error: A.error };
    const B = readFraction(fracB, mixed, "Second fraction");
    if (B.error) return { error: B.error };
    const steps = [];
    if (A.note || B.note) {
      steps.push(
        `Convert mixed numbers to improper fractions: ${[A.note, B.note].filter(Boolean).join(" and ")}.`
      );
    }
    let n;
    let d;
    if (op === "add" || op === "sub") {
      const common = lcmBig(A.d, B.d);
      const n1 = A.n * (common / A.d);
      const n2 = B.n * (common / B.d);
      if (A.d === B.d) {
        steps.push(`Both fractions already share the denominator ${A.d}.`);
      } else {
        steps.push(`Find the LCM of the denominators ${A.d} and ${B.d} → ${common}.`);
        steps.push(
          `Convert to equivalent fractions: ${A.n}/${A.d} = ${n1}/${common} and ${B.n}/${B.d} = ${n2}/${common}.`
        );
      }
      n = op === "add" ? n1 + n2 : n1 - n2;
      d = common;
      steps.push(
        op === "add"
          ? `Add the numerators: ${n1} + ${n2} = ${n}, giving ${n}/${common}.`
          : `Subtract the numerators: ${n1} − ${n2} = ${n}, giving ${n}/${common}.`
      );
    } else if (op === "mul") {
      n = A.n * B.n;
      d = A.d * B.d;
      steps.push(`Multiply the numerators: ${A.n} × ${B.n} = ${n}.`);
      steps.push(`Multiply the denominators: ${A.d} × ${B.d} = ${d}, giving ${n}/${d}.`);
    } else {
      if (B.n === 0n) {
        return { error: "Can't divide by zero — the second fraction equals 0." };
      }
      let rn = B.d;
      let rd = B.n;
      if (rd < 0n) {
        rd = -rd;
        rn = -rn;
      }
      steps.push(`Flip the second fraction (take its reciprocal): ${B.n}/${B.d} → ${rn}/${rd}.`);
      steps.push(`Multiply instead of dividing: ${A.n}/${A.d} × ${rn}/${rd}.`);
      n = A.n * rn;
      d = A.d * rd;
      steps.push(`Multiply numerators and denominators: ${A.n} × ${rn} = ${n} and ${A.d} × ${rd} = ${d}, giving ${n}/${d}.`);
    }
    const g = gcdBig(n, d);
    if (g > 1n) {
      steps.push(`Divide top and bottom by their GCD ${g}: ${n}/${d} = ${n / g}/${d / g}.`);
    } else if (d !== 1n && n !== 0n) {
      steps.push(`GCD of ${absBig(n)} and ${d} is 1 — the result is already in simplest form.`);
    }
    let sn = n / g;
    let sd = d / g;
    if (sn === 0n) sd = 1n;
    return {
      expr: `${A.n}/${A.d} ${opSymbols[op]} ${B.n}/${B.d}`,
      n: sn,
      d: sd,
      mixedText: describeMixed(sn, sd),
      decimal: fmtDecimal(sn, sd),
      steps,
    };
  }, [fracA, fracB, op, mixed]);

  const simplifyCalc = useMemo(() => {
    const num = parseBig(sNum === "" ? "0" : sNum);
    const den = parseBig(sDen);
    if (num === null || (sDen !== "" && den === null)) {
      return { error: "Use whole numbers only (like 18 and 24)." };
    }
    if (sDen === "" || den === null) {
      return { error: "Fill in the denominator (the bottom number)." };
    }
    if (den === 0n) {
      return { error: "The denominator can't be 0 — dividing by zero is undefined." };
    }
    let n = num;
    let d = den;
    if (d < 0n) {
      d = -d;
      n = -n;
    }
    const g = gcdBig(n, d);
    const steps = [];
    if (g > 1n) {
      steps.push(`GCD of ${absBig(n)} and ${d} = ${g}.`);
      steps.push(`Divide top and bottom by ${g}: ${n}/${d} = ${n / g}/${d / g}.`);
    } else {
      steps.push(`GCD of ${absBig(n)} and ${d} is 1 — the fraction is already in simplest form.`);
    }
    let sn = n / g;
    let sd = d / g;
    if (sn === 0n) sd = 1n;
    return { n: sn, d: sd, mixedText: describeMixed(sn, sd), decimal: fmtDecimal(sn, sd), steps };
  }, [sNum, sDen]);

  const decCalc = useMemo(() => {
    const trimmed = dec.trim();
    if (!trimmed) return { error: "Enter a decimal like 0.375." };
    const match = /^(-?)(\d*)(?:\.(\d*))?$/.exec(trimmed);
    if (!match || (!match[2] && !match[3])) {
      return { error: "Enter a valid decimal number like 0.375 or 2.5." };
    }
    const sign = match[1] === "-" ? -1n : 1n;
    const intPart = match[2] || "0";
    const fracPart = match[3] || "";
    if (fracPart.length > 6) {
      return { error: "Up to 6 decimal places are supported — trim the extra digits." };
    }
    if (fracPart.length === 0) {
      const n = sign * BigInt(intPart);
      return { n, d: 1n, mixedText: null, steps: [`${trimmed} is a whole number, so it is simply ${n}/1.`] };
    }
    const den = 10n ** BigInt(fracPart.length);
    const n = sign * BigInt(intPart + fracPart);
    const steps = [
      `${trimmed} has ${fracPart.length} decimal place${fracPart.length > 1 ? "s" : ""}, so write it over 10^${fracPart.length}: ${n}/${den}.`,
    ];
    const g = gcdBig(n, den);
    if (g > 1n) {
      steps.push(`GCD of ${absBig(n)} and ${den} = ${g} — divide both: ${n / g}/${den / g}.`);
    } else {
      steps.push(`GCD of ${absBig(n)} and ${den} is 1 — already in simplest form.`);
    }
    const sn = n / g;
    const sd = den / g;
    return { n: sn, d: sd, mixedText: describeMixed(sn, sd), steps };
  }, [dec]);

  const copyText = async (id, text) => {
    const success = await safeCopyText(text);
    if (!success) return;
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  const applyPreset = (preset) => {
    setTab("calculate");
    setMixed(preset.mixed);
    setFracA(preset.a);
    setFracB(preset.b);
    setOp(preset.op);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Divide className="h-4 w-4" />
            Maths helper
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Fraction Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Add, subtract, multiply, and divide fractions — with the full step-by-step working shown,
            plus simplification and decimal conversion.
          </p>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:max-w-md">
          {[
            { id: "calculate", label: "Calculate" },
            { id: "simplify", label: "Simplify & Convert" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
                tab === item.id
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "calculate" ? (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <FractionInputGroup title="First fraction" frac={fracA} onChange={setFracA} mixed={mixed} />

              <div className="my-4">
                <p className="text-sm font-semibold">Operation</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {operations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOp(item.id)}
                      aria-label={item.label}
                      title={item.label}
                      className={`h-11 rounded-md border text-lg font-semibold transition ${
                        op === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {item.symbol}
                    </button>
                  ))}
                </div>
              </div>

              <FractionInputGroup title="Second fraction" frac={fracB} onChange={setFracB} mixed={mixed} />

              <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={mixed}
                  onChange={(event) => setMixed(event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Mixed numbers (add a whole-number part)
              </label>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">Quick examples</span>
                  <button
                    type="button"
                    onClick={() => applyPreset(presets[0])}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {calc.error ? "Result" : calc.expr}
                </p>
                {!calc.error && (
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "calc",
                        `${calc.expr} = ${calc.d === 1n ? calc.n : `${calc.n}/${calc.d}`}${
                          calc.mixedText && calc.d !== 1n ? ` = ${calc.mixedText}` : ""
                        } ≈ ${calc.decimal}`
                      )
                    }
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    {copied === "calc" ? "Copied" : "Copy result"}
                  </button>
                )}
              </div>

              {calc.error ? (
                <ErrorPanel message={calc.error} />
              ) : (
                <div aria-live="polite">
                  <div className="mt-4 flex flex-wrap items-center gap-5">
                    <div className="rounded-lg bg-[var(--muted)] px-6 py-5">
                      <FractionGlyph n={calc.n} d={calc.d} className="text-3xl font-semibold text-[var(--primary)]" />
                    </div>
                    <div className="grid gap-1.5 text-sm">
                      <p className="text-[var(--muted-foreground)]">
                        Simplified: <span className="font-semibold text-[var(--foreground)]">{calc.d === 1n ? `${calc.n}` : `${calc.n}/${calc.d}`}</span>
                      </p>
                      {calc.mixedText && calc.d !== 1n && (
                        <p className="text-[var(--muted-foreground)]">
                          Mixed number: <span className="font-semibold text-[var(--foreground)]">{calc.mixedText}</span>
                        </p>
                      )}
                      <p className="text-[var(--muted-foreground)]">
                        Decimal: <span className="font-semibold text-[var(--foreground)]">≈ {calc.decimal}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold">Step-by-step working</p>
                    <StepsList steps={calc.steps} />
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Simplify a fraction</p>
                {!simplifyCalc.error && (
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "simplify",
                        `${sNum}/${sDen} = ${simplifyCalc.d === 1n ? simplifyCalc.n : `${simplifyCalc.n}/${simplifyCalc.d}`} ≈ ${simplifyCalc.decimal}`
                      )
                    }
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    {copied === "simplify" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Numerator</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={sNum}
                    onChange={(event) => setSNum(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-center font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Denominator</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={sDen}
                    onChange={(event) => setSDen(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-center font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>

              {simplifyCalc.error ? (
                <ErrorPanel message={simplifyCalc.error} />
              ) : (
                <div aria-live="polite">
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="rounded-lg bg-[var(--muted)] px-5 py-4">
                      <FractionGlyph
                        n={simplifyCalc.n}
                        d={simplifyCalc.d}
                        className="text-2xl font-semibold text-[var(--primary)]"
                      />
                    </div>
                    <div className="grid gap-1 text-sm text-[var(--muted-foreground)]">
                      {simplifyCalc.mixedText && simplifyCalc.d !== 1n && (
                        <p>
                          Mixed: <span className="font-semibold text-[var(--foreground)]">{simplifyCalc.mixedText}</span>
                        </p>
                      )}
                      <p>
                        Decimal: <span className="font-semibold text-[var(--foreground)]">≈ {simplifyCalc.decimal}</span>
                      </p>
                    </div>
                  </div>
                  <StepsList steps={simplifyCalc.steps} />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Decimal to fraction</p>
                {!decCalc.error && (
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "decimal",
                        `${dec.trim()} = ${decCalc.d === 1n ? decCalc.n : `${decCalc.n}/${decCalc.d}`}${
                          decCalc.mixedText && decCalc.d !== 1n ? ` = ${decCalc.mixedText}` : ""
                        }`
                      )
                    }
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    {copied === "decimal" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Decimal number (up to 6 decimal places)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  maxLength={16}
                  value={dec}
                  onChange={(event) => setDec(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                {["0.5", "0.375", "3.25", "0.125", "2.6"].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setDec(example)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {example}
                  </button>
                ))}
              </div>

              {decCalc.error ? (
                <ErrorPanel message={decCalc.error} />
              ) : (
                <div aria-live="polite">
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="rounded-lg bg-[var(--muted)] px-5 py-4">
                      <FractionGlyph
                        n={decCalc.n}
                        d={decCalc.d}
                        className="text-2xl font-semibold text-[var(--primary)]"
                      />
                    </div>
                    {decCalc.mixedText && decCalc.d !== 1n && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Mixed: <span className="font-semibold text-[var(--foreground)]">{decCalc.mixedText}</span>
                      </p>
                    )}
                  </div>
                  <StepsList steps={decCalc.steps} />
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
