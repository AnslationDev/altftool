"use client";

import { useMemo, useState } from "react";
import { AirVent, Check, Copy, RotateCcw } from "lucide-react";

import { COOKING_INTENSITIES, LAYOUTS, QUIET_HEADROOM, selectChimney } from "../lib";

const DASH = "—";
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const n0 = (v) => (Number.isFinite(v) ? N0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? N1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? N2.format(v) : DASH);

const DEFAULTS = {
  length: "3.6",
  width: "3",
  height: "3",
  intensity: "heavy",
  burners: "4",
  layout: "closed",
  ducted: "yes",
  ductMetres: "3",
  bends: "2",
  hob: "60",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const isDucted = form.ducted === "yes";

  const result = useMemo(
    () =>
      selectChimney({
        lengthM: toNum(form.length),
        widthM: toNum(form.width),
        heightM: toNum(form.height),
        intensity: form.intensity,
        burners: toNum(form.burners),
        layout: form.layout,
        ducted: form.ducted === "yes",
        ductMetres: form.ductMetres.trim() === "" ? 0 : toNum(form.ductMetres),
        bends: form.bends.trim() === "" ? 0 : toNum(form.bends),
        hobWidthCm: toNum(form.hob),
      }),
    [form],
  );

  const ok = !result.error;

  const summary = ok
    ? [
        "Kitchen Chimney Suction Selector",
        `Kitchen: ${form.length} x ${form.width} x ${form.height} m = ${n1(result.volume)} m3`,
        `Air changes assumed: ${result.ach} per hour`,
        `Airflow needed at the hood: ${n0(result.captureAirflow)} m3/h`,
        `Duct lets through ${n0(result.ductEfficiencyPct)}% of the rated free-air figure`,
        `Minimum rating to shop for: ${n0(result.minimumRating)} m3/h`,
        `Recommended with quiet-running headroom: ${result.recommended} m3/h`,
        result.chimneyWidthCm
          ? `Chimney width: ${result.chimneyWidthCm} cm for a ${form.hob} cm hob`
          : `No standard chimney is as wide as a ${form.hob} cm hob — look at commercial hoods.`,
        `Mount ${result.mountHeightCm[0]}-${result.mountHeightCm[1]} cm above the hob.`,
      ].join("\n")
    : "";

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AirVent className="h-4 w-4" aria-hidden="true" />
          Appliance sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kitchen Chimney Suction Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Suction is kitchen volume times air changes per hour — then corrected for the duct,
          because the m3/h on the box is measured with no duct attached at all.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="k-length">
              Kitchen length (m)
            </label>
            <input
              id="k-length"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="20"
              step="0.1"
              value={form.length}
              onChange={set("length")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="k-width">
              Kitchen width (m)
            </label>
            <input
              id="k-width"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="20"
              step="0.1"
              value={form.width}
              onChange={set("width")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="k-height">
              Ceiling height (m)
            </label>
            <input
              id="k-height"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="20"
              step="0.1"
              value={form.height}
              onChange={set("height")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="k-intensity">
              How heavily you cook
            </label>
            <select
              id="k-intensity"
              className={INPUT}
              value={form.intensity}
              onChange={set("intensity")}
            >
              {COOKING_INTENSITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="k-burners">
              Burners on the hob
            </label>
            <input
              id="k-burners"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="8"
              step="1"
              value={form.burners}
              onChange={set("burners")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="k-layout">
              Kitchen layout
            </label>
            <select id="k-layout" className={INPUT} value={form.layout} onChange={set("layout")}>
              {LAYOUTS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="k-ducted">
              Venting
            </label>
            <select id="k-ducted" className={INPUT} value={form.ducted} onChange={set("ducted")}>
              <option value="yes">Ducted outside</option>
              <option value="no">Recirculating (charcoal filter)</option>
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="k-hob">
              Hob width (cm)
            </label>
            <input
              id="k-hob"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="30"
              max="150"
              step="1"
              value={form.hob}
              onChange={set("hob")}
            />
          </div>
          {isDucted ? (
            <>
              <div>
                <label className={LABEL} htmlFor="k-duct">
                  Duct length (m)
                </label>
                <input
                  id="k-duct"
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="15"
                  step="0.5"
                  value={form.ductMetres}
                  onChange={set("ductMetres")}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="k-bends">
                  90° bends in the duct
                </label>
                <input
                  id="k-bends"
                  className={INPUT}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="6"
                  step="1"
                  value={form.bends}
                  onChange={set("bends")}
                />
              </div>
            </>
          ) : null}
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
              Suction to shop for
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n0(result.recommended)} m³/h` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.exceedsCatalogue
                  ? `This kitchen wants ${n0(result.withHeadroom)} m³/h — past any domestic chimney. Shorten the duct, close the layout off, or fit a commercial hood.`
                  : `${n0(result.minimumRating)} m³/h is the bare minimum; the extra buys quiet running on speed 1-2`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the recommended chimney suction"
              className={GHOST_BTN}
              disabled={!ok}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Kitchen volume", ok ? `${n2(result.volume)} m³` : DASH],
            ["Air changes assumed", ok ? `${result.ach} per hour` : DASH],
            ["Airflow from volume alone", ok ? `${n0(result.baseAirflow)} m³/h` : DASH],
            ["Burner allowance", ok ? `x ${n2(result.burnerFactor)}` : DASH],
            ["Layout allowance", ok ? `x ${n2(result.layoutFactor)}` : DASH],
            ["Airflow needed at the hood", ok ? `${n0(result.captureAirflow)} m³/h` : DASH],
            [
              "Duct efficiency",
              ok ? `${n0(result.ductEfficiencyPct)}% (loses ${n0(result.ductLossPct)}%)` : DASH,
            ],
            ["Minimum free-air rating", ok ? `${n0(result.ratedRequired)} m³/h` : DASH],
            [`With ${QUIET_HEADROOM}x quiet headroom`, ok ? `${n0(result.withHeadroom)} m³/h` : DASH],
            [
              "Chimney width",
              ok ? (result.chimneyWidthCm ? `${result.chimneyWidthCm} cm` : "No standard size") : DASH,
            ],
            [
              "Mounting height above the hob",
              ok ? `${result.mountHeightCm[0]} - ${result.mountHeightCm[1]} cm` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.widthWarning ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Domestic chimneys stop at 90 cm. A wider hob needs a commercial hood or two units side by
            side, otherwise the outer burners escape capture.
          </p>
        ) : null}

        {ok && !result.ducted ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            A recirculating hood filters oil and odour but returns the heat and moisture to the
            kitchen, and the charcoal filter needs replacing every 6-12 months. Duct outside wherever
            the building allows it.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the duct costs you</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Same kitchen, same cooking — only the pipe run changes.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Duct
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Efficiency
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Rating needed
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { metres: 1, bends: 0, label: "1 m, straight out" },
                { metres: 3, bends: 1, label: "3 m, one bend" },
                { metres: 5, bends: 2, label: "5 m, two bends" },
                { metres: 8, bends: 3, label: "8 m, three bends" },
              ].map((option) => {
                const row = selectChimney({
                  lengthM: toNum(form.length),
                  widthM: toNum(form.width),
                  heightM: toNum(form.height),
                  intensity: form.intensity,
                  burners: toNum(form.burners),
                  layout: form.layout,
                  ducted: true,
                  ductMetres: option.metres,
                  bends: option.bends,
                  hobWidthCm: toNum(form.hob),
                });
                return (
                  <tr key={option.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{option.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.error ? DASH : `${n0(row.ductEfficiencyPct)}%`}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {row.error ? DASH : `${n0(row.recommended)} m³/h`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Duct diameter matters as much as length — never neck a 150 mm outlet down to a smaller pipe.
        Suction ratings are measured free air, so two chimneys with the same number can perform very
        differently once installed.
      </p>
    </main>
  );
}
