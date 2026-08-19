"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, SquareStack } from "lucide-react";

import { computeTwoTonePaint } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const sqft = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} sq ft` : DASH);

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  lengthFt: "12",
  widthFt: "10",
  wallHeightFt: "10",
  dadoHeightFt: "4",
  doorCount: "1",
  doorWidth: "3",
  doorHeight: "7",
  windowCount: "2",
  windowWidth: "4",
  windowHeight: "4",
  windowSill: "3",
  lowerCoats: "2",
  upperCoats: "2",
  lowerRate: "140",
  upperRate: "140",
  lowerPrice: "250",
  upperPrice: "250",
  wastagePct: "10",
};

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeTwoTonePaint({
        lengthFt: toNum(form.lengthFt),
        widthFt: toNum(form.widthFt),
        wallHeightFt: toNum(form.wallHeightFt),
        dadoHeightFt: toNum(form.dadoHeightFt),
        doors: {
          count: toNum(form.doorCount),
          widthFt: toNum(form.doorWidth),
          heightFt: toNum(form.doorHeight),
        },
        windows: {
          count: toNum(form.windowCount),
          widthFt: toNum(form.windowWidth),
          heightFt: toNum(form.windowHeight),
          sillFt: toNum(form.windowSill),
        },
        lowerCoats: toNum(form.lowerCoats),
        upperCoats: toNum(form.upperCoats),
        lowerSpreadingRate: toNum(form.lowerRate),
        upperSpreadingRate: toNum(form.upperRate),
        lowerPricePerLitre: toNum(form.lowerPrice),
        upperPricePerLitre: toNum(form.upperPrice),
        wastagePct: toNum(form.wastagePct),
      }),
    [form],
  );

  const ok = !result.error;

  const summary = ok
    ? [
        "Two Tone Wall Paint Calculator",
        `Perimeter ${NUM1.format(result.perimeter)} ft, wall height ${NUM1.format(result.wallHeightFt)} ft, dado at ${NUM1.format(result.dadoHeightFt)} ft`,
        `Gross ${sqft(result.grossArea)} less ${sqft(result.totalDeduction)} of openings = ${sqft(result.netArea)} to paint`,
        "",
        `Lower band: ${sqft(result.lower.netArea)}, ${NUM2.format(result.lower.litres)} L needed, buy ${NUM.format(result.lower.litresToBuy)} L — ${money(result.lower.cost)}`,
        `Upper band: ${sqft(result.upper.netArea)}, ${NUM2.format(result.upper.litres)} L needed, buy ${NUM.format(result.upper.litresToBuy)} L — ${money(result.upper.cost)}`,
        "",
        `Total paint cost: ${money(result.totalCost)} (${money2(result.costPerSqft)} per sq ft)`,
        `Dado line to mask: ${NUM1.format(result.dividerLengthFt)} running feet`,
      ].join("\n")
    : "";

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
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
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <SquareStack className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Two Tone Wall Paint Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two colours meeting at a dado line need two separate quantities, and the doors and windows
          have to come off the band they actually sit in. A window sill at 3 ft with a dado at 4 ft
          takes one foot out of the lower colour and three out of the upper — this does that split
          properly.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Room</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="tt-length">
              Room length (ft)
            </label>
            <input
              id="tt-length"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={form.lengthFt}
              onChange={set("lengthFt")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-width">
              Room width (ft)
            </label>
            <input
              id="tt-width"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={form.widthFt}
              onChange={set("widthFt")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-height">
              Wall height (ft)
            </label>
            <input
              id="tt-height"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.25"
              value={form.wallHeightFt}
              onChange={set("wallHeightFt")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-dado">
              Dado height (ft from floor)
            </label>
            <input
              id="tt-dado"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.25"
              value={form.dadoHeightFt}
              onChange={set("dadoHeightFt")}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Openings</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="tt-door-count">
              Doors
            </label>
            <input
              id="tt-door-count"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.doorCount}
              onChange={set("doorCount")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-window-count">
              Windows
            </label>
            <input
              id="tt-window-count"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.windowCount}
              onChange={set("windowCount")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-door-width">
              Door width (ft)
            </label>
            <input
              id="tt-door-width"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.doorWidth}
              onChange={set("doorWidth")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-window-width">
              Window width (ft)
            </label>
            <input
              id="tt-window-width"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.windowWidth}
              onChange={set("windowWidth")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-door-height">
              Door height (ft)
            </label>
            <input
              id="tt-door-height"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.doorHeight}
              onChange={set("doorHeight")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-window-height">
              Window height (ft)
            </label>
            <input
              id="tt-window-height"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.windowHeight}
              onChange={set("windowHeight")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-window-sill">
              Window sill height (ft)
            </label>
            <input
              id="tt-window-sill"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.windowSill}
              onChange={set("windowSill")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tt-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="tt-wastage"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="1"
              value={form.wastagePct}
              onChange={set("wastagePct")}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Doors are taken as starting at floor level. Sill height is measured from the floor to the
          bottom of the window.
        </p>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          { id: "lower", title: "Lower band colour", coats: "lowerCoats", rate: "lowerRate", price: "lowerPrice" },
          { id: "upper", title: "Upper band colour", coats: "upperCoats", rate: "upperRate", price: "upperPrice" },
        ].map((band) => (
          <section key={band.id} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">{band.title}</h2>
            <div className="mt-3 grid gap-4">
              <div>
                <label className={LABEL} htmlFor={`tt-${band.id}-coats`}>
                  Coats
                </label>
                <input
                  id={`tt-${band.id}-coats`}
                  className={INPUT}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="5"
                  step="1"
                  value={form[band.coats]}
                  onChange={set(band.coats)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor={`tt-${band.id}-rate`}>
                  Spreading rate (sq ft/L/coat)
                </label>
                <input
                  id={`tt-${band.id}-rate`}
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="5"
                  value={form[band.rate]}
                  onChange={set(band.rate)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor={`tt-${band.id}-price`}>
                  Price per litre
                </label>
                <input
                  id={`tt-${band.id}-price`}
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={form[band.price]}
                  onChange={set(band.price)}
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Paint to buy in total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM.format(result.totalLitresToBuy)} L` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM2.format(result.totalLitres)} L actually needed for ${sqft(result.netArea)} — ${money(result.totalCost)}`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the two-tone paint result"
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
          {(ok
            ? [
                ["Room perimeter", `${NUM1.format(result.perimeter)} ft`],
                ["Gross wall area", sqft(result.grossArea)],
                ["Openings deducted", sqft(result.totalDeduction)],
                ["Net area to paint", sqft(result.netArea)],
                [
                  "Lower band",
                  `${sqft(result.lower.netArea)} (${NUM1.format(result.lowerSharePct)}%)`,
                ],
                [
                  "Upper band",
                  `${sqft(result.upper.netArea)} (${NUM1.format(result.upperSharePct)}%)`,
                ],
                ["Lower band paint", `${NUM2.format(result.lower.litres)} L needed`],
                ["Upper band paint", `${NUM2.format(result.upper.litres)} L needed`],
                ["Lower band cost", money(result.lower.cost)],
                ["Upper band cost", money(result.upper.cost)],
                ["Total paint cost", money(result.totalCost)],
                ["Cost per sq ft of wall", money2(result.costPerSqft)],
                ["Masking tape for the dado line", `${NUM1.format(result.dividerLengthFt)} running ft`],
              ]
            : [
                ["Net area to paint", DASH],
                ["Lower band paint", DASH],
                ["Upper band paint", DASH],
                ["Total paint cost", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Band by band</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Band
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Gross
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Doors off
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Windows off
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Net
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Litres
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Packs to buy
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.bands.map((band) => (
                  <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="block font-semibold">{band.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {NUM1.format(band.heightFt)} ft tall · {NUM.format(band.coats)} coat(s)
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(band.grossArea)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(band.doorDeduction)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(band.windowDeduction)}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold">
                      {NUM1.format(band.netArea)}
                    </td>
                    <td className="py-2.5 pr-3 text-right">{NUM2.format(band.litres)}</td>
                    <td className="py-2.5">
                      {band.packs.length > 0
                        ? band.packs.map((p) => `${p.count} x ${p.litres} L`).join(" + ")
                        : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Litres already include the {NUM1.format(result.wastagePct)}% wastage allowance. Pack
            suggestions are the cheapest combination of 1 L, 4 L, 10 L and 20 L tins at your entered
            rate — small tins cost more per litre.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. It treats the room as a rectangle with a continuous dado line and
        assumes doors sit on the floor. Alcoves, columns, sloped ceilings and wardrobes change the
        area, and a strong colour over a pale wall often needs an extra coat that no area calculation
        can predict.
      </p>
    </main>
  );
}
