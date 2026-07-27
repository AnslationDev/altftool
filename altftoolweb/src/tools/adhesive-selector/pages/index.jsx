"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import {
  LOW_SURFACE_ENERGY_THRESHOLD,
  MATERIALS,
  STRUCTURAL_STRENGTH_MPA,
  selectAdhesive,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const DEFAULTS = {
  materialA: "wood",
  materialB: "steel",
  gap: "1",
  temp: "30",
  wet: false,
  moves: false,
  loadBearing: true,
  paintOver: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_LABEL =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [materialA, setMaterialA] = useState(DEFAULTS.materialA);
  const [materialB, setMaterialB] = useState(DEFAULTS.materialB);
  const [gap, setGap] = useState(DEFAULTS.gap);
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [wet, setWet] = useState(DEFAULTS.wet);
  const [moves, setMoves] = useState(DEFAULTS.moves);
  const [loadBearing, setLoadBearing] = useState(DEFAULTS.loadBearing);
  const [paintOver, setPaintOver] = useState(DEFAULTS.paintOver);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      selectAdhesive({
        materialA,
        materialB,
        gapMm: toNumber(gap),
        maxTempC: toNumber(temp),
        wet,
        moves,
        loadBearing,
        paintOver,
      }),
    [materialA, materialB, gap, temp, wet, moves, loadBearing, paintOver],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Adhesive Selector",
      `Joining ${result.materialA.label} to ${result.materialB.label}`,
      `Gap ${result.gapMm} mm, up to ${result.maxTempC} °C${result.wet ? ", wet or exterior" : ""}${result.moves ? ", joint moves" : ""}${result.loadBearing ? ", load bearing" : ""}${result.paintOver ? ", must be paintable" : ""}`,
      "",
      "Ranked:",
      ...result.ranked
        .slice(0, 4)
        .map(
          (entry, index) =>
            `${index + 1}. ${entry.adhesive.label} — ${entry.score}/${result.maxScore}${entry.warnings.length ? ` (${entry.warnings.join(" ")})` : ""}`,
        ),
      "",
      result.verdict,
    ].join("\n");
  }, [failed, result]);

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
    setMaterialA(DEFAULTS.materialA);
    setMaterialB(DEFAULTS.materialB);
    setGap(DEFAULTS.gap);
    setTemp(DEFAULTS.temp);
    setWet(DEFAULTS.wet);
    setMoves(DEFAULTS.moves);
    setLoadBearing(DEFAULTS.loadBearing);
    setPaintOver(DEFAULTS.paintOver);
    setCopied(false);
  };

  const toggles = [
    ["ad-wet", "Wet, damp or outdoors", wet, setWet],
    ["ad-moves", "The joint flexes or expands", moves, setMoves],
    ["ad-load", "Carries real load", loadBearing, setLoadBearing],
    ["ad-paint", "Must be painted over", paintOver, setPaintOver],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Bonding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Adhesive Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Most glue failures are not a shortage of strength. They are the wrong gap, a surface the
          adhesive cannot wet, or a rigid bond across a joint that moves. Enter both materials and
          the conditions, and every family gets scored against them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-a">
              First material
            </label>
            <select
              id="ad-a"
              className={`mt-2 ${INPUT_CLASS}`}
              value={materialA}
              onChange={(event) => setMaterialA(event.target.value)}
            >
              {MATERIALS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-b">
              Second material
            </label>
            <select
              id="ad-b"
              className={`mt-2 ${INPUT_CLASS}`}
              value={materialB}
              onChange={(event) => setMaterialB(event.target.value)}
            >
              {MATERIALS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-gap">
              Gap to bridge (mm)
            </label>
            <input
              id="ad-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={gap}
              onChange={(event) => setGap(event.target.value)}
            />
            <p className={HINT_CLASS}>
              0 for a machined fit, 0.1 for a good woodworking joint, several mm for a gunned bead.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-temp">
              Highest service temperature (°C)
            </label>
            <input
              id="ad-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-60"
              max="300"
              step="5"
              value={temp}
              onChange={(event) => setTemp(event.target.value)}
            />
            <p className={HINT_CLASS}>A parked car interior reaches 60 to 70 °C in summer sun.</p>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className={LABEL_CLASS}>Conditions</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {toggles.map(([id, label, value, setter]) => (
                <label key={id} htmlFor={id} className={CHECKBOX_LABEL}>
                  <input
                    id={id}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={value}
                    onChange={() => setter((prev) => !prev)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best match
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {failed ? DASH : result.best.adhesive.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Adjust the materials or conditions above."
                : `${result.best.score} of ${result.maxScore} against your conditions`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the adhesive shortlist"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.lowEnergy.length > 0
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Gap it suits",
              failed
                ? DASH
                : `${result.best.adhesive.minGapMm} to ${result.best.adhesive.gapFillMm} mm`,
            ],
            [
              "Typical lap shear",
              failed ? DASH : `${num1(result.best.adhesive.strengthMPa)} MPa`,
            ],
            [
              "Joint movement",
              failed ? DASH : `±${NUM0.format(result.best.adhesive.movementPct)} %`,
            ],
            [
              "Water",
              failed
                ? DASH
                : result.best.adhesive.waterproof
                  ? "Waterproof"
                  : result.best.adhesive.waterResistant
                    ? "Water resistant only"
                    : "Interior, dry only",
            ],
            ["Upper service temperature", failed ? DASH : `${result.best.adhesive.maxTempC} °C`],
            ["Open time", failed ? DASH : `${num1(result.best.adhesive.openTimeMin)} min`],
            [
              "Clamping",
              failed
                ? DASH
                : result.best.adhesive.clampMin > 0
                  ? `${num1(result.best.adhesive.clampMin)} min`
                  : "None needed",
            ],
            ["Full cure", failed ? DASH : `${num1(result.best.adhesive.fullCureH)} h`],
            ["Paintable", failed ? DASH : result.best.adhesive.paintable ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Everything that bonds this pair</h2>
          <ul className="mt-3 space-y-4">
            {result.ranked.map((entry) => (
              <li
                key={entry.adhesive.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{entry.adhesive.label}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      entry.suitable
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--warning-soft)] text-[var(--warning)]"
                    }`}
                  >
                    {entry.score} / {result.maxScore}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  {entry.adhesive.note}
                </p>
                {entry.warnings.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {entry.warnings.map((warning) => (
                      <li key={warning} className="text-xs font-medium text-[var(--warning)]">
                        {warning}
                      </li>
                    ))}
                  </ul>
                )}
                {entry.reasons.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {entry.reasons.map((reason) => (
                      <li key={reason} className="text-xs text-[var(--success)]">
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!failed && result.rejected.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Ruled out</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Adhesive
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Why not
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rejected.map((entry) => (
                  <tr key={entry.adhesive.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 align-top font-semibold">{entry.adhesive.label}</td>
                    <td className="py-2 align-top text-[var(--muted-foreground)]">{entry.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Why glue fails</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="font-semibold">The surface is too slippery to wet</dt>
            <dd className="mt-1 text-[var(--muted-foreground)]">
              Below about {LOW_SURFACE_ENERGY_THRESHOLD} mN/m of surface energy, ordinary adhesives
              bead up instead of spreading. Polypropylene sits at 29, polyethylene at 31, silicone
              rubber at 24 and PTFE at 18 — all need abrading and priming, or a polyolefin-specific
              product.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">The gap is wrong in one direction or the other</dt>
            <dd className="mt-1 text-[var(--muted-foreground)]">
              Super glue and PVA need contact within a tenth of a millimetre. Sealants need a real
              bead to work — squeeze one into a hairline and there is nothing there to stretch.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Something rigid was used on something that moves</dt>
            <dd className="mt-1 text-[var(--muted-foreground)]">
              Two materials with different thermal expansion will shear a rigid bond line apart over
              a season. That is what the movement rating is for.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Nobody prepared the surface</dt>
            <dd className="mt-1 text-[var(--muted-foreground)]">
              Abrade, degrease, dry. On aluminium, abrade and bond within the hour — the oxide layer
              reforms in minutes and the bond is only as good as the layer it lands on.
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Strengths are typical published lap-shear figures for the family, useful for comparison but
        not for design — a bond carrying load above {STRUCTURAL_STRENGTH_MPA} MPa should be
        specified from the actual product datasheet with a safety factor, and anything structural in
        a building or vehicle needs an engineer. Follow the manufacturer&apos;s ventilation and skin
        protection instructions; solvent-based contact adhesives and isocyanate-containing
        polyurethanes both need airflow.
      </p>
    </main>
  );
}
