"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PaintRoller, RotateCcw } from "lucide-react";

import {
  PRIMER_SPREADING_RATE,
  PUTTY_COVERAGE_SQFT_PER_KG,
  TIERS,
  computePaintCostPerSqft,
} from "../lib";

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
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  area: "1000",
  coats: "2",
  primerCoats: "1",
  includePutty: true,
  puttyPricePerKg: "28",
  labourRatePerSqft: "18",
  primerPricePerLitre: "150",
  economy: "110",
  premium: "250",
  luxury: "450",
  selectedTier: "premium",
};

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const toggle = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const result = useMemo(
    () =>
      computePaintCostPerSqft({
        area: toNum(form.area),
        coats: toNum(form.coats),
        primerCoats: toNum(form.primerCoats),
        includePutty: form.includePutty,
        puttyPricePerKg: toNum(form.puttyPricePerKg),
        labourRatePerSqft: toNum(form.labourRatePerSqft),
        primerPricePerLitre: toNum(form.primerPricePerLitre),
        tierPrices: {
          economy: toNum(form.economy),
          premium: toNum(form.premium),
          luxury: toNum(form.luxury),
        },
        selectedTier: form.selectedTier,
      }),
    [form],
  );

  const ok = !result.error;
  const sel = ok ? result.selected : null;

  const summary = ok
    ? [
        "Paint Cost Per Square Foot (India)",
        `${NUM.format(result.area)} sq ft, ${result.coats} coat(s), ${result.primerCoats} primer coat(s)${result.includePutty ? ", putty included" : ""}`,
        `Selected tier: ${sel.label} (${sel.product}) at ${money(sel.pricePerLitre)}/litre`,
        `Cost per sq ft: ${money2(sel.costPerSqft)}  (material ${money2(sel.materialPerSqft)} + labour ${money2(sel.labourPerSqft)})`,
        `Paint needed: ${NUM1.format(sel.paintLitres)} L, buy ${NUM.format(sel.paintLitresBought)} L — ${money(sel.paintCost)}`,
        `Primer: ${NUM1.format(sel.primerLitres)} L, buy ${NUM.format(sel.primerLitresBought)} L — ${money(sel.primerCost)}`,
        `Putty: ${NUM.format(sel.puttyKg)} kg, ${NUM.format(sel.puttyBags)} bag(s) — ${money(sel.puttyCost)}`,
        `Labour: ${money(sel.labourCost)}`,
        `Total: ${money(sel.totalCost)}`,
        "",
        ...result.tiers.map(
          (t) => `${t.label}: ${money2(t.costPerSqft)}/sq ft, total ${money(t.totalCost)}`,
        ),
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
          <PaintRoller className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Paint Cost Per Square Foot India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Painters quote per square foot, but the number hides three separate costs — paint, primer
          and putty, and labour. Enter the wall area and your quoted rates and this splits the
          per-sq-ft figure across economy, premium and luxury emulsion, buying paint in the cheapest
          combination of 1 L, 4 L, 10 L and 20 L packs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The job</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="pc-area">
              Paintable area (sq ft)
            </label>
            <input
              id="pc-area"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={form.area}
              onChange={set("area")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pc-coats">
              Coats of finish paint
            </label>
            <input
              id="pc-coats"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="5"
              step="1"
              value={form.coats}
              onChange={set("coats")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pc-primer-coats">
              Primer coats
            </label>
            <input
              id="pc-primer-coats"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              max="3"
              step="1"
              value={form.primerCoats}
              onChange={set("primerCoats")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pc-primer-price">
              Primer price (per litre)
            </label>
            <input
              id="pc-primer-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.primerPricePerLitre}
              onChange={set("primerPricePerLitre")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pc-labour">
              Labour rate (per sq ft)
            </label>
            <input
              id="pc-labour"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.labourRatePerSqft}
              onChange={set("labourRatePerSqft")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pc-putty-price">
              Wall putty (per kg)
            </label>
            <input
              id="pc-putty-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.puttyPricePerKg}
              onChange={set("puttyPricePerKg")}
              disabled={!form.includePutty}
            />
          </div>
        </div>
        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold"
          htmlFor="pc-putty"
        >
          <input
            id="pc-putty"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.includePutty}
            onChange={toggle("includePutty")}
          />
          Include wall putty ({PUTTY_COVERAGE_SQFT_PER_KG} sq ft per kg, two coats)
        </label>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Paint price per litre by tier</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          These are indicative 20 L-pack rates. Replace them with the rates your dealer or contractor
          has quoted — that is where most of the difference between quotes comes from.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div key={tier.id}>
              <label className={LABEL} htmlFor={`pc-price-${tier.id}`}>
                {tier.label}
              </label>
              <input
                id={`pc-price-${tier.id}`}
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="1"
                step="10"
                value={form[tier.id]}
                onChange={set(tier.id)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {tier.product} · {tier.spreadingRate} sq ft/L/coat
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="pc-tier">
            Tier to break down below
          </label>
          <select
            id="pc-tier"
            className={INPUT}
            value={form.selectedTier}
            onChange={set("selectedTier")}
          >
            {TIERS.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.label} — {tier.product}
              </option>
            ))}
          </select>
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
              All-in cost per square foot
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(sel.costPerSqft) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${sel.label} tier · ${money(sel.totalCost)} for ${NUM.format(result.area)} sq ft`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the painting cost estimate"
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
                  "Finish paint needed",
                  `${NUM1.format(sel.paintLitres)} L — buy ${NUM.format(sel.paintLitresBought)} L`,
                ],
                ["Finish paint cost", money(sel.paintCost)],
                [
                  "Primer needed",
                  sel.primerLitres > 0
                    ? `${NUM1.format(sel.primerLitres)} L — buy ${NUM.format(sel.primerLitresBought)} L`
                    : "Not included",
                ],
                ["Primer cost", money(sel.primerCost)],
                [
                  "Wall putty",
                  result.includePutty
                    ? `${NUM.format(sel.puttyKg)} kg — ${NUM.format(sel.puttyBags)} bag(s)`
                    : "Not included",
                ],
                ["Putty cost", money(sel.puttyCost)],
                ["Material subtotal", `${money(sel.materialCost)} (${NUM.format(sel.materialSharePct)}% of total)`],
                ["Labour", money(sel.labourCost)],
                ["Material per sq ft", money2(sel.materialPerSqft)],
                ["Labour per sq ft", money2(sel.labourPerSqft)],
                ["Grand total", money(sel.totalCost)],
                ["Gap between cheapest and dearest tier", `${money2(result.spreadBetweenTiers)} per sq ft`],
              ]
            : [
                ["Finish paint needed", DASH],
                ["Material subtotal", DASH],
                ["Labour", DASH],
                ["Grand total", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && sel.paintPacks.length > 0 ? (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Cheapest pack combination for the finish paint:{" "}
            {sel.paintPacks.map((p) => `${p.count} x ${p.litres} L`).join(" + ")}.
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Tier comparison</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Tier
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Litres
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Material
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Total
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Per sq ft
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.tiers.map((tier) => (
                  <tr key={tier.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="block font-semibold">{tier.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {tier.product}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right">{NUM1.format(tier.paintLitres)}</td>
                    <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(tier.materialCost)}
                    </td>
                    <td className="py-2.5 pr-3 text-right">{money(tier.totalCost)}</td>
                    <td
                      className={`py-2.5 text-right font-semibold ${
                        tier.id === result.cheapest.id
                          ? "text-[var(--success)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {money2(tier.costPerSqft)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            A costlier tier needs fewer litres because it spreads further — luxury emulsion at 160 sq
            ft per litre per coat against 100 for distemper — so the price gap on the wall is always
            smaller than the price gap on the tin. Primer is costed at {PRIMER_SPREADING_RATE} sq ft
            per litre per coat.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Spreading rates fall on rough plaster, porous surfaces and dark-to-light
        colour changes, and labour rates vary widely by city and by whether scaffolding, sanding or
        crack filling is in scope. Use it to sanity-check a contractor's quote, not to replace a site
        measurement.
      </p>
    </main>
  );
}
