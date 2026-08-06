"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanLine, TriangleAlert } from "lucide-react";

import { decodeTyreCode } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const mm = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} mm`;
const kg = (value) => `${INT.format(Number.isFinite(value) ? value : 0)} kg`;

const DEFAULTS = { code: "205/55 R16 91V", tyres: "4", gvw: "" };

const EXAMPLES = ["205/55 R16 91V", "215/65 R16 98H", "LT265/75R16 123/120Q", "90/90-18 51P", "245/40 ZR18 97Y"];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const optionalNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [code, setCode] = useState(DEFAULTS.code);
  const [tyres, setTyres] = useState(DEFAULTS.tyres);
  const [gvw, setGvw] = useState(DEFAULTS.gvw);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      decodeTyreCode(code, {
        tyresOnVehicle: Number(tyres) || 4,
        grossVehicleWeightKg: optionalNumber(gvw),
      }),
    [code, tyres, gvw],
  );

  const ok = !result.error;

  const speedText = ok && result.speedKmh !== null
    ? `${result.speedIsMinimum ? "above " : ""}${INT.format(result.speedKmh)} km/h (${NUM.format(result.speedMph)} mph)`
    : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Tyre code: ${result.input}`,
      `Section width ${result.widthMm} mm, aspect ${result.aspect}%, ${result.constructionLabel}, ${result.rimInch}" rim`,
      `Sidewall height ${mm(result.sidewallMm)}, overall diameter ${mm(result.overallDiameterMm)}`,
      `Load index ${result.loadIndex} = ${kg(result.loadKg)} per tyre; ${result.tyresOnVehicle} tyres = ${kg(result.totalCapacityKg)}`,
      result.speedSymbol ? `Speed symbol ${result.speedSymbol} = ${speedText}` : "No speed symbol found",
      `Revolutions per km: ${NUM.format(result.revsPerKmGeometric)} geometric, ${NUM.format(result.revsPerKmLoaded)} loaded`,
    ].join("\n");
  }, [ok, result, speedText]);

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
    setCode(DEFAULTS.code);
    setTyres(DEFAULTS.tyres);
    setGvw(DEFAULTS.gvw);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanLine className="h-4 w-4" aria-hidden="true" />
          Sidewall markings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tyre Load Speed Rating Decoder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Read a sidewall code into real limits — kilograms per tyre from the ETRTO load index
          table, km/h from the speed symbol, plus diameter and revolutions per kilometre.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="tl-code">
              Tyre code from the sidewall
            </label>
            <input
              id="tl-code"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoCapitalize="characters"
              spellCheck="false"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="tl-count">
                Tyres on the vehicle
              </label>
              <input
                id="tl-count"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="12"
                step="1"
                value={tyres}
                onChange={(event) => setTyres(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tl-gvw">
                Gross vehicle weight (kg, optional)
              </label>
              <input
                id="tl-gvw"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="10"
                placeholder="From the VIN plate"
                value={gvw}
                onChange={(event) => setGvw(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => setCode(example)} className={CHIP_BTN}>
              {example}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Load per tyre
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kg(result.loadKg) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Load index ${result.loadIndex} · speed ${result.speedSymbol ?? "not stated"} · ${speedText}`
                : "Enter a valid tyre code to decode it"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy decoded tyre rating"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the decoder" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sizing standard", ok ? result.prefixLabel : DASH],
            ["Section width", ok ? mm(result.widthMm) : DASH],
            ["Aspect ratio", ok ? `${result.aspect}% of section width` : DASH],
            ["Construction", ok ? result.constructionLabel : DASH],
            ["Rim diameter", ok ? `${result.rimInch}" (${mm(result.rimMm)})` : DASH],
            ["Sidewall height", ok ? mm(result.sidewallMm) : DASH],
            [
              "Overall diameter",
              ok ? `${mm(result.overallDiameterMm)} (${NUM.format(result.overallDiameterInch)}")` : DASH,
            ],
            ["Circumference", ok ? mm(result.circumferenceMm) : DASH],
            ["Revolutions per km (geometric)", ok ? NUM.format(result.revsPerKmGeometric) : DASH],
            ["Revolutions per km (loaded, 3% deflection)", ok ? NUM.format(result.revsPerKmLoaded) : DASH],
            ["Capacity per axle (2 tyres)", ok ? kg(result.axleCapacityKg) : DASH],
            [
              `Capacity for ${ok ? result.tyresOnVehicle : ""} tyres`,
              ok ? kg(result.totalCapacityKg) : DASH,
            ],
            [
              "Second load index (dual fitment)",
              ok ? (result.loadIndexDual ? `${result.loadIndexDual} = ${kg(result.loadDualKg)} per tyre` : "Not marked") : DASH,
            ],
            ["Rated speed", speedText],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.gvwCheck ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.gvwCheck.sufficient
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.gvwCheck.sufficient
              ? `Capacity check passed: ${kg(result.gvwCheck.capacityKg)} against ${kg(result.gvwCheck.gvwKg)} gross weight, a margin of ${kg(result.gvwCheck.marginKg)}.`
              : `Capacity check failed: ${kg(result.gvwCheck.capacityKg)} against ${kg(result.gvwCheck.gvwKg)} gross weight — short by ${kg(Math.abs(result.gvwCheck.marginKg))}.`}
          </p>
        ) : null}

        {ok && result.capacityNote ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.capacityNote}
          </p>
        ) : null}

        {ok && result.speedNote ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.speedNote}
          </p>
        ) : null}

        {ok && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((message) => (
              <li
                key={message}
                className="flex gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                <span>{message}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Load and speed ratings hold only at the tyre&apos;s specified inflation
        pressure and within its rated load; the vehicle placard sets the minimum index and symbol
        you may fit. Ask a tyre professional before changing size, index or symbol.
      </p>
    </main>
  );
}
