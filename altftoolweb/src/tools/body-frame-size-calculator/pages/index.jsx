"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";

import {
  computeBodyFrame,
  formatFeetInches,
  resolveHeightCm,
  resolveWristCm,
  FRAME_LABEL,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const NUM2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DEFAULTS = {
  sex: "female",
  heightUnit: "cm",
  heightCm: "163",
  heightFt: "5",
  heightIn: "4",
  wristUnit: "cm",
  wrist: "15.5",
  method: "wrist",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const DASH = "—";

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [heightUnit, setHeightUnit] = useState(DEFAULTS.heightUnit);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [wristUnit, setWristUnit] = useState(DEFAULTS.wristUnit);
  const [wrist, setWrist] = useState(DEFAULTS.wrist);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const cm = resolveHeightCm({
      unit: heightUnit,
      cm: toNumber(heightCm),
      feet: toNumber(heightFt),
      inches: toNumber(heightIn),
    });
    const wristCm = resolveWristCm({ unit: wristUnit, value: toNumber(wrist) });
    return computeBodyFrame({ sex, heightCm: cm, wristCm, method });
  }, [sex, heightUnit, heightCm, heightFt, heightIn, wristUnit, wrist, method]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Body Frame Size Calculator",
      `Height: ${NUM1.format(result.heightCm)} cm (${formatFeetInches(result.heightCm)})`,
      `Wrist circumference: ${NUM1.format(result.wristCm)} cm (${NUM2.format(result.wristIn)} in)`,
      `Frame from wrist + height table: ${FRAME_LABEL[result.wristFrame]}`,
      `Frame from height-to-wrist ratio ${NUM2.format(result.ratio)}: ${FRAME_LABEL[result.ratioFrame]}`,
      `Reported frame: ${result.frameLabel}`,
      `Frame-adjusted ideal weight (Hamwi): ${NUM1.format(result.idealWeightKg)} kg (${NUM1.format(result.idealWeightLb)} lb)`,
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
    setSex(DEFAULTS.sex);
    setHeightUnit(DEFAULTS.heightUnit);
    setHeightCm(DEFAULTS.heightCm);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setWristUnit(DEFAULTS.wristUnit);
    setWrist(DEFAULTS.wrist);
    setMethod(DEFAULTS.method);
    setCopied(false);
  };

  const rows = [
    [
      "Wrist circumference",
      ok ? `${NUM1.format(result.wristCm)} cm · ${NUM2.format(result.wristIn)} in` : DASH,
    ],
    [
      "Height",
      ok ? `${NUM1.format(result.heightCm)} cm · ${formatFeetInches(result.heightCm)}` : DASH,
    ],
    ["Height band used", ok ? result.bandLabel : DASH],
    ["Wrist + height table says", ok ? FRAME_LABEL[result.wristFrame] : DASH],
    [
      "Height ÷ wrist ratio",
      ok ? `${NUM2.format(result.ratio)} → ${FRAME_LABEL[result.ratioFrame]}` : DASH,
    ],
    [
      "Frame-adjusted ideal weight",
      ok
        ? `${NUM1.format(result.idealWeightKg)} kg · ${NUM1.format(result.idealWeightLb)} lb`
        : DASH,
    ],
    ["Medium-frame reference weight", ok ? `${NUM1.format(result.mediumWeightKg)} kg` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Body composition
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Body Frame Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measure your wrist just above the wrist bone, add your height, and read your skeletal
          frame size against the MedlinePlus wrist bands and the height-to-wrist ratio table.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="frame-sex">
              Reference table
            </label>
            <select
              id="frame-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="frame-method">
              Method for the headline result
            </label>
            <select
              id="frame-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option value="wrist">Wrist + height bands (MedlinePlus)</option>
              <option value="ratio">Height ÷ wrist ratio</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="frame-height-unit">
              Height unit
            </label>
            <select
              id="frame-height-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={heightUnit}
              onChange={(event) => setHeightUnit(event.target.value)}
            >
              <option value="cm">Centimetres</option>
              <option value="ftin">Feet &amp; inches</option>
            </select>
          </div>

          {heightUnit === "cm" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="frame-height-cm">
                Height (cm)
              </label>
              <input
                id="frame-height-cm"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="100"
                max="250"
                step="0.5"
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="frame-height-ft">
                  Height (feet)
                </label>
                <input
                  id="frame-height-ft"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="3"
                  max="8"
                  step="1"
                  value={heightFt}
                  onChange={(event) => setHeightFt(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="frame-height-in">
                  and inches
                </label>
                <input
                  id="frame-height-in"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="11.9"
                  step="0.5"
                  value={heightIn}
                  onChange={(event) => setHeightIn(event.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="frame-wrist-unit">
              Wrist unit
            </label>
            <select
              id="frame-wrist-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={wristUnit}
              onChange={(event) => setWristUnit(event.target.value)}
            >
              <option value="cm">Centimetres</option>
              <option value="in">Inches</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="frame-wrist">
              Wrist circumference ({wristUnit === "cm" ? "cm" : "in"})
            </label>
            <input
              id="frame-wrist"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step={wristUnit === "cm" ? "0.1" : "0.05"}
              value={wrist}
              onChange={(event) => setWrist(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Your body frame
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.frameLabel : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.methodsAgree
                  ? "Both methods agree on this result."
                  : `The other method reads ${FRAME_LABEL[
                      method === "wrist" ? result.ratioFrame : result.wristFrame
                    ].toLowerCase()} — you sit close to a boundary.`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy body frame size result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
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

        {ok && result.extrapolated && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs leading-5 text-[var(--warning)]">
            The published male wrist table only covers heights above 5 ft 5 in. The same band has
            been applied here, so treat the wrist-table result as an approximation.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The bands being used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Frame
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Wrist ({ok ? result.bandLabel : "height band"})
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Height ÷ wrist
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-semibold">Small</td>
                <td className="py-2 pr-3">
                  {ok ? `under ${NUM2.format(result.bandSmallBelowIn)} in` : DASH}
                </td>
                <td className="py-2">
                  {ok ? `above ${NUM1.format(result.ratioSmallAbove)}` : DASH}
                </td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-semibold">Medium</td>
                <td className="py-2 pr-3">
                  {ok
                    ? `${NUM2.format(result.bandSmallBelowIn)} to ${NUM2.format(result.bandMediumMaxIn)} in`
                    : DASH}
                </td>
                <td className="py-2">
                  {ok
                    ? `${NUM1.format(result.ratioLargeBelow)} to ${NUM1.format(result.ratioSmallAbove)}`
                    : DASH}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Large</td>
                <td className="py-2 pr-3">
                  {ok ? `over ${NUM2.format(result.bandMediumMaxIn)} in` : DASH}
                </td>
                <td className="py-2">
                  {ok ? `below ${NUM1.format(result.ratioLargeBelow)}` : DASH}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Frame size is a rough proxy for skeletal build and diagnoses nothing;
        the Hamwi ideal weight is a reference figure, not a target. Speak to a clinician or a
        registered dietitian before acting on it.
      </p>
    </main>
  );
}
