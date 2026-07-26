"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// WHO (2008) waist-hip ratio cut-off points for substantially increased metabolic risk.
const BANDS = {
  male: [
    { id: "low", label: "Low risk", max: 0.9, range: "below 0.90" },
    { id: "moderate", label: "Moderate risk", max: 1.0, range: "0.90 - 0.99" },
    { id: "high", label: "High risk", max: Infinity, range: "1.00 and above" },
  ],
  female: [
    { id: "low", label: "Low risk", max: 0.8, range: "below 0.80" },
    { id: "moderate", label: "Moderate risk", max: 0.85, range: "0.80 - 0.84" },
    { id: "high", label: "High risk", max: Infinity, range: "0.85 and above" },
  ],
};

// WHO waist circumference thresholds (cm), plus IDF South Asian / Asian cut-offs.
const WAIST_LIMITS = {
  male: { increased: 94, substantial: 102, asian: 90 },
  female: { increased: 80, substantial: 88, asian: 80 },
};

const DEFAULTS = { unit: "cm", sex: "male", waist: "88", hip: "100" };

const twoDecimal = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const oneDecimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [hip, setHip] = useState(DEFAULTS.hip);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const waistRaw = toNumber(waist);
    const hipRaw = toNumber(hip);
    const factor = unit === "cm" ? 1 : 2.54;
    const waistCm = waistRaw * factor;
    const hipCm = hipRaw * factor;

    if (!Number.isFinite(waistCm) || waistCm < 40 || waistCm > 200) {
      return {
        error:
          unit === "cm"
            ? "Enter a waist measurement between 40 cm and 200 cm."
            : "Enter a waist measurement between 16 in and 79 in.",
      };
    }
    if (!Number.isFinite(hipCm) || hipCm < 40 || hipCm > 200) {
      return {
        error:
          unit === "cm"
            ? "Enter a hip measurement between 40 cm and 200 cm."
            : "Enter a hip measurement between 16 in and 79 in.",
      };
    }

    const ratio = waistCm / hipCm;
    const bands = BANDS[sex];
    const band = bands.find((item) => ratio < item.max) || bands[bands.length - 1];
    const limits = WAIST_LIMITS[sex];

    let waistNote;
    if (waistCm >= limits.substantial) {
      waistNote = `Your waist of ${oneDecimal.format(waistCm)} cm is at or above the WHO ${limits.substantial} cm mark for substantially increased risk.`;
    } else if (waistCm >= limits.increased) {
      waistNote = `Your waist of ${oneDecimal.format(waistCm)} cm is at or above the WHO ${limits.increased} cm mark for increased risk.`;
    } else if (waistCm >= limits.asian) {
      waistNote = `Your waist of ${oneDecimal.format(waistCm)} cm is at or above the ${limits.asian} cm cut-off used for South Asian populations, though below the general WHO threshold.`;
    } else {
      waistNote = `Your waist of ${oneDecimal.format(waistCm)} cm is below the ${limits.asian} cm cut-off used for South Asian populations.`;
    }

    const shapeThreshold = sex === "male" ? 0.9 : 0.8;
    const shape = ratio > shapeThreshold ? "Apple (android) — fat carried around the abdomen" : "Pear (gynoid) — fat carried around hips and thighs";

    // How much waist reduction would move you into the low-risk band, if applicable.
    const targetRatio = shapeThreshold;
    const targetWaistCm = hipCm * targetRatio;
    const waistToLose = waistCm - targetWaistCm;

    return {
      ratio,
      band,
      bands,
      waistCm,
      hipCm,
      waistNote,
      shape,
      targetWaistCm,
      waistToLose,
      lowRiskRange: bands[0].range,
    };
  }, [hip, sex, unit, waist]);

  const reset = () => {
    setUnit(DEFAULTS.unit);
    setSex(DEFAULTS.sex);
    setWaist(DEFAULTS.waist);
    setHip(DEFAULTS.hip);
    setCopied(false);
  };

  const showLength = (cm) => (unit === "cm" ? `${oneDecimal.format(cm)} cm` : `${oneDecimal.format(cm / 2.54)} in`);

  const copySummary = async () => {
    if (calc.error) return;
    const text = [
      "Waist to Hip Ratio Calculator",
      `Waist: ${showLength(calc.waistCm)}`,
      `Hip: ${showLength(calc.hipCm)}`,
      `Waist-to-hip ratio: ${twoDecimal.format(calc.ratio)}`,
      `WHO risk band (${sex === "male" ? "men" : "women"}): ${calc.band.label} (${calc.band.range})`,
      `Body shape: ${calc.shape}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Ruler className="h-4 w-4" aria-hidden="true" />
            Body composition
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Waist to Hip Ratio Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Divide your waist measurement by your hip measurement to see where you carry fat — and which WHO risk
            band that ratio falls into for men and for women.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your measurements
            </h2>

            <div className="mt-4 grid gap-4">
              <div>
                <span className="text-sm font-semibold" id="whr-unit-label">
                  Units
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-labelledby="whr-unit-label">
                  {[
                    { id: "cm", label: "Centimetres" },
                    { id: "in", label: "Inches" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={unit === option.id}
                      onClick={() => setUnit(option.id)}
                      className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        unit === option.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="whr-sex" className="text-sm font-semibold">
                  Sex at birth
                </label>
                <select
                  id="whr-sex"
                  value={sex}
                  onChange={(event) => setSex(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="whr-waist" className="text-sm font-semibold">
                    Waist ({unit})
                  </label>
                  <input
                    id="whr-waist"
                    type="number"
                    inputMode="decimal"
                    value={waist}
                    onChange={(event) => setWaist(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="whr-hip" className="text-sm font-semibold">
                    Hips ({unit})
                  </label>
                  <input
                    id="whr-hip"
                    type="number"
                    inputMode="decimal"
                    value={hip}
                    onChange={(event) => setHip(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
              </div>

              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                <p className="font-semibold text-[var(--foreground)]">How to measure</p>
                <p className="mt-1">
                  Waist: midway between the bottom rib and the top of the hip bone, at the end of a normal breath
                  out. Hips: around the widest part of the buttocks. Keep the tape level and snug without
                  compressing the skin.
                </p>
              </div>

              <button type="button" onClick={reset} className={GHOST_BTN_CLASS} aria-label="Reset all inputs">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {calc.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {calc.error}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Waist-to-hip ratio
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                      {twoDecimal.format(calc.ratio)}
                    </p>
                    <p
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        calc.band.id === "low"
                          ? "bg-[var(--muted)] text-[var(--success)]"
                          : calc.band.id === "moderate"
                            ? "bg-[var(--muted)] text-[var(--foreground)]"
                            : "bg-[var(--danger-soft)] text-[var(--danger)]"
                      }`}
                    >
                      {calc.band.label}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copySummary}
                    aria-label="Copy waist to hip ratio result to clipboard"
                    className={PRIMARY_BTN_CLASS}
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                <dl className="mt-5 divide-y divide-[var(--border)] rounded-md ring-1 ring-[var(--border)]">
                  {[
                    ["Waist", showLength(calc.waistCm)],
                    ["Hips", showLength(calc.hipCm)],
                    ["Body shape", calc.shape],
                    [
                      "Waist for a low-risk ratio",
                      calc.waistToLose > 0
                        ? `${showLength(calc.targetWaistCm)} (${showLength(calc.waistToLose)} less)`
                        : `${showLength(calc.targetWaistCm)} — already met`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 px-3 py-2.5 text-sm">
                      <dt className="text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="text-right font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    WHO risk bands for {sex === "male" ? "men" : "women"}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {calc.bands.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-md border p-3 ${
                          item.id === calc.band.id
                            ? "border-[var(--primary)] bg-[var(--muted)]"
                            : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold">{item.range}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  {calc.waistNote}
                </p>

                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Waist-to-hip ratio is a marker of where fat is stored, and abdominal fat is more strongly linked
                  to metabolic risk than fat on the hips and thighs. It should be read alongside BMI, blood
                  pressure and blood results — it is not a diagnosis. This is general information, not medical
                  advice; discuss any concerns with a doctor.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
