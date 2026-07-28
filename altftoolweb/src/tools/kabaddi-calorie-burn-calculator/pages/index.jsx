"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shield } from "lucide-react";

import {
  KABADDI_ROLES,
  MATCH_HALF_MINUTES,
  MATCH_HALVES,
  MATCH_INTERVAL_MINUTES,
  computeKabaddiCalories,
  toKilograms,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = { weight: "75", unit: "kg", mat: "40", bench: "5", role: "raider" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [mat, setMat] = useState(DEFAULTS.mat);
  const [bench, setBench] = useState(DEFAULTS.bench);
  const [role, setRole] = useState(DEFAULTS.role);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeKabaddiCalories({
        weightKg: toKilograms(weight, unit),
        matMinutes: Number(String(mat).trim()),
        benchMinutes: String(bench).trim() === "" ? 0 : Number(String(bench).trim()),
        roleId: role,
      }),
    [weight, unit, mat, bench, role],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Kabaddi Calorie Burn",
      `${result.roleLabel} (${result.met} MET)`,
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Mat time: ${NUM0.format(result.matMinutes)} min · Bench: ${NUM0.format(result.benchMinutes)} min`,
      `Total calories: ${NUM0.format(result.totalKcal)} kcal`,
      `On the mat: ${NUM0.format(result.matKcal)} kcal`,
      `Net of resting burn: ${NUM0.format(result.netKcal)} kcal`,
      `Equivalent to ${NUM2.format(result.matchEquivalents)} full matches of mat time`,
    ].join("\n");
  }, [ok, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setWeight(DEFAULTS.weight);
    setUnit(DEFAULTS.unit);
    setMat(DEFAULTS.mat);
    setBench(DEFAULTS.bench);
    setRole(DEFAULTS.role);
    setCopied(false);
  };

  const applyMatchPreset = () => {
    setMat(String(MATCH_HALF_MINUTES * MATCH_HALVES));
    setBench(String(MATCH_INTERVAL_MINUTES));
  };

  const rows = [
    ["Burned on the mat", ok ? `${NUM0.format(result.matKcal)} kcal` : DASH],
    ["Burned on the bench", ok ? `${NUM0.format(result.benchKcal)} kcal` : DASH],
    ["Net of resting metabolism", ok ? `${NUM0.format(result.netKcal)} kcal` : DASH],
    ["Mat burn rate", ok ? `${NUM1.format(result.matRate)} kcal/min` : DASH],
    ["Per hour on the mat", ok ? `${NUM0.format(result.kcalPerHourOnMat)} kcal/hour` : DASH],
    ["Full matches of mat time", ok ? NUM2.format(result.matchEquivalents) : DASH],
    ["MET value used", ok ? `${result.met} MET` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Shield className="h-4 w-4" aria-hidden="true" />
          Kabaddi
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kabaddi Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Raiding is repeated sprinting into contact; defending is short explosive holds. This tool
          prices both from your body weight and mat time, using MET values borrowed from the closest
          sports the Compendium of Physical Activities does publish.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="kb-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                id="kb-unit"
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="kb-role">
              Role and setting
            </label>
            <select
              id="kb-role"
              className={`mt-2 ${INPUT_CLASS}`}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {KABADDI_ROLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="kb-mat">
              Time on the mat (minutes)
            </label>
            <input
              id="kb-mat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={mat}
              onChange={(event) => setMat(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="kb-bench">
              Time out or on the bench (minutes)
            </label>
            <input
              id="kb-bench"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={bench}
              onChange={(event) => setBench(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={applyMatchPreset} className={CHIP_BTN}>
            Full match ({MATCH_HALVES} x {MATCH_HALF_MINUTES} min)
          </button>
          {[20, 60, 90].map((preset) => (
            <button key={preset} type="button" onClick={() => setMat(String(preset))} className={CHIP_BTN}>
              {preset} min mat
            </button>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM0.format(result.totalKcal)} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.roleLabel} · ${NUM0.format(result.matMinutes)} min on the mat`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy kabaddi calorie result"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            MET basis ({result.basis}): {result.source}.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where each MET value comes from</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The Compendium of Physical Activities has no kabaddi entry, so every value below is
          anchored to a listed sport with the same sprint-and-grapple pattern.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Role</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">MET</th>
                <th scope="col" className="py-2 text-right font-semibold">Basis</th>
              </tr>
            </thead>
            <tbody>
              {KABADDI_ROLES.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2 pr-3 text-right">{item.met}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{item.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Because kabaddi has no published MET value, these figures are
        modelled from comparable contact sports and should be read as a range, not a measurement.
        Consult a doctor or sports dietitian before using them for weight or fuelling decisions.
      </p>
    </main>
  );
}
