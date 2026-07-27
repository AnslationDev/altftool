"use client";

import { useMemo, useState } from "react";
import { Brush, Check, Copy, RotateCcw } from "lucide-react";

import { DOOR_EDGE_ALLOWANCE_PCT, SYSTEMS, computeWoodPolish } from "../lib";

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
const litres = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} L` : DASH);

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  systemId: "melamine",
  furnitureArea: "250",
  doorCount: "4",
  doorHeight: "6.5",
  doorWidth: "3",
  doorSides: "2",
  sealerCoats: "1",
  topCoats: "2",
  wastagePct: "10",
  sealerPrice: "450",
  topPrice: "550",
  hardenerPrice: "500",
  thinnerPrice: "180",
};

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeWoodPolish({
        furnitureArea: toNum(form.furnitureArea),
        doors: {
          count: toNum(form.doorCount),
          heightFt: toNum(form.doorHeight),
          widthFt: toNum(form.doorWidth),
          sides: toNum(form.doorSides),
        },
        systemId: form.systemId,
        sealerCoats: toNum(form.sealerCoats),
        topCoats: toNum(form.topCoats),
        wastagePct: toNum(form.wastagePct),
        sealerPricePerLitre: toNum(form.sealerPrice),
        topPricePerLitre: toNum(form.topPrice),
        hardenerPricePerLitre: toNum(form.hardenerPrice),
        thinnerPricePerLitre: toNum(form.thinnerPrice),
      }),
    [form],
  );

  const ok = !result.error;
  const system = SYSTEMS.find((s) => s.id === form.systemId) ?? SYSTEMS[0];

  const summary = ok
    ? [
        "Wood Polish Quantity Calculator",
        `${result.system.label} — ${NUM.format(result.area)} sq ft (${NUM.format(result.furnitureArea)} furniture + ${NUM.format(result.doorsArea)} doors)`,
        `${result.sealerCoats} sealer coat(s) + ${result.topCoats} topcoat(s), ${NUM.format(result.wastagePct)}% wastage`,
        "",
        `Sealer base: ${litres(result.sealerBaseLitres)}`,
        `Topcoat base: ${litres(result.topBaseLitres)}`,
        `Hardener: ${litres(result.hardenerLitres)}`,
        `Thinner: ${litres(result.thinnerLitres)}`,
        `Ready-to-spray volume: ${litres(result.readyLitres)}`,
        "",
        `Material cost: ${money(result.totalCost)} (${money2(result.costPerSqft)} per sq ft)`,
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
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Brush className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Wood Polish Quantity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Polish is quoted for the sprayed mix, not the tin — so this works out the ready-to-spray
          litres your doors and furniture need, then splits them back into base, hardener and thinner
          in the ratio your system actually uses.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Polish system</h2>
        <div className="mt-3">
          <label className={LABEL} htmlFor="wp-system">
            Finish
          </label>
          <select
            id="wp-system"
            className={INPUT}
            value={form.systemId}
            onChange={set("systemId")}
          >
            {SYSTEMS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{system.note}</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="wp-sealer-coats">
              Sealer coats
            </label>
            <input
              id="wp-sealer-coats"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              max="5"
              step="1"
              value={form.sealerCoats}
              onChange={set("sealerCoats")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wp-top-coats">
              Topcoats
            </label>
            <input
              id="wp-top-coats"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={form.topCoats}
              onChange={set("topCoats")}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Surface to polish</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="wp-furniture">
              Furniture / panelling area (sq ft)
            </label>
            <input
              id="wp-furniture"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.furnitureArea}
              onChange={set("furnitureArea")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wp-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="wp-wastage"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.wastagePct}
              onChange={set("wastagePct")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wp-door-count">
              Number of doors
            </label>
            <input
              id="wp-door-count"
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
            <label className={LABEL} htmlFor="wp-door-sides">
              Faces polished per door
            </label>
            <select
              id="wp-door-sides"
              className={INPUT}
              value={form.doorSides}
              onChange={set("doorSides")}
            >
              <option value="1">One face</option>
              <option value="2">Both faces</option>
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="wp-door-height">
              Door height (ft)
            </label>
            <input
              id="wp-door-height"
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
            <label className={LABEL} htmlFor="wp-door-width">
              Door width (ft)
            </label>
            <input
              id="wp-door-width"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.doorWidth}
              onChange={set("doorWidth")}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Door area includes a {DOOR_EDGE_ALLOWANCE_PCT}% allowance for the four edges of the
          shutter, which the face measurement misses.
        </p>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Rates per litre</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="wp-sealer-price">
              Sealer
            </label>
            <input
              id="wp-sealer-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.sealerPrice}
              onChange={set("sealerPrice")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wp-top-price">
              Topcoat
            </label>
            <input
              id="wp-top-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.topPrice}
              onChange={set("topPrice")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wp-hardener-price">
              Hardener
            </label>
            <input
              id="wp-hardener-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.hardenerPrice}
              onChange={set("hardenerPrice")}
              disabled={!system.hasHardener}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="wp-thinner-price">
              Thinner
            </label>
            <input
              id="wp-thinner-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.thinnerPrice}
              onChange={set("thinnerPrice")}
            />
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Ready-to-spray polish needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? litres(result.readyLitres) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.system.label} on ${NUM.format(result.area)} sq ft, ${result.totalCoats} coats in all`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the wood polish quantity result"
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
                [
                  "Total area",
                  `${NUM.format(result.area)} sq ft (${NUM.format(result.doorsArea)} from doors)`,
                ],
                ["Sealer to buy", litres(result.sealerBaseLitres)],
                ["Topcoat to buy", litres(result.topBaseLitres)],
                [
                  "Hardener to buy",
                  result.system.hasHardener ? litres(result.hardenerLitres) : "Not used",
                ],
                ["Thinner to buy", litres(result.thinnerLitres)],
                ["Total tinned material", litres(result.concentrateLitres)],
                ["Sealer cost", money(result.sealerCost)],
                ["Topcoat cost", money(result.topCost)],
                ["Hardener cost", money(result.hardenerCost)],
                ["Thinner cost", money(result.thinnerCost)],
                ["Material total", money(result.totalCost)],
                ["Material cost per sq ft", money2(result.costPerSqft)],
              ]
            : [
                ["Total area", DASH],
                ["Sealer to buy", DASH],
                ["Topcoat to buy", DASH],
                ["Material total", DASH],
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
          <h2 className="text-base font-semibold">Coat by coat</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Layer
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Coats
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Ready mix
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Base
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Hardener
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Thinner
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Sealer", result.sealerCoats, result.sealer, result.system.sealer.spreadingRate],
                  ["Topcoat", result.topCoats, result.top, result.system.top.spreadingRate],
                ].map(([name, coats, layer, rate]) => (
                  <tr key={name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="block font-semibold">{name}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {NUM.format(rate)} sq ft/L/coat
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right">{NUM.format(coats)}</td>
                    <td className="py-2.5 pr-3 text-right font-semibold">
                      {NUM2.format(layer.readyLitres)}
                    </td>
                    <td className="py-2.5 pr-3 text-right">{NUM2.format(layer.base)}</td>
                    <td className="py-2.5 pr-3 text-right">{NUM2.format(layer.hardener)}</td>
                    <td className="py-2.5 text-right">{NUM2.format(layer.thinner)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            All figures are litres and already carry the {NUM1.format(result.wastagePct)}% wastage
            allowance. Mix only what you can spray inside the pot life — 2K PU is unusable a few
            hours after the hardener goes in.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Spreading rates depend on the timber — open-grained teak and rough
        veneer soak up far more sealer than close-grained MDF — and on whether you spray, brush or
        pad the material. Always read the product datasheet for the mixing ratio, pot life and
        recoat window, and use the ventilation and respiratory protection it specifies.
      </p>
    </main>
  );
}
