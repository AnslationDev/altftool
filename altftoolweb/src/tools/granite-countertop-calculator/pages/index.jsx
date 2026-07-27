"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gem, RotateCcw } from "lucide-react";

import { EDGE_PROFILES, STANDARD_COUNTER_DEPTH_FT, computeGraniteCountertop } from "../lib";

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
const sqft = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} sq ft` : DASH);

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  counterLengthFt: "12",
  counterDepthFt: "2",
  backsplashLengthFt: "12",
  backsplashHeightIn: "4",
  faciaHeightIn: "0",
  edgeLengthFt: "12",
  edgeProfileId: "full-bullnose",
  edgeExtraPerRft: "100",
  ratePerSqft: "180",
  fabricationPerSqft: "80",
  sinkCutouts: "1",
  sinkCutoutRate: "800",
  hobCutouts: "1",
  hobCutoutRate: "600",
  wastagePct: "10",
};

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const setProfile = (event) => {
    const id = event.target.value;
    const chosen = EDGE_PROFILES.find((p) => p.id === id);
    setForm((prev) => ({
      ...prev,
      edgeProfileId: id,
      edgeExtraPerRft: chosen ? String(chosen.extraPerRft) : prev.edgeExtraPerRft,
    }));
  };

  const result = useMemo(
    () =>
      computeGraniteCountertop({
        counterLengthFt: toNum(form.counterLengthFt),
        counterDepthFt: toNum(form.counterDepthFt),
        backsplashLengthFt: toNum(form.backsplashLengthFt),
        backsplashHeightIn: toNum(form.backsplashHeightIn),
        faciaHeightIn: toNum(form.faciaHeightIn),
        edgeLengthFt: toNum(form.edgeLengthFt),
        edgeProfileId: form.edgeProfileId,
        edgeExtraPerRft: toNum(form.edgeExtraPerRft),
        ratePerSqft: toNum(form.ratePerSqft),
        fabricationPerSqft: toNum(form.fabricationPerSqft),
        sinkCutouts: toNum(form.sinkCutouts),
        sinkCutoutRate: toNum(form.sinkCutoutRate),
        hobCutouts: toNum(form.hobCutouts),
        hobCutoutRate: toNum(form.hobCutoutRate),
        wastagePct: toNum(form.wastagePct),
      }),
    [form],
  );

  const ok = !result.error;
  const profile = EDGE_PROFILES.find((p) => p.id === form.edgeProfileId) ?? EDGE_PROFILES[0];

  const summary = ok
    ? [
        "Granite Countertop Calculator",
        `Platform ${NUM1.format(result.counterLengthFt)} ft x ${NUM1.format(result.counterDepthFt)} ft = ${sqft(result.counterArea)}`,
        `Backsplash ${NUM1.format(result.backsplashLengthFt)} ft x ${NUM1.format(result.backsplashHeightIn)} in = ${sqft(result.backsplashArea)}`,
        result.faciaArea > 0 ? `Front facia ${NUM1.format(result.faciaHeightIn)} in = ${sqft(result.faciaArea)}` : null,
        `Net ${sqft(result.netArea)}, order ${sqft(result.orderArea)} with ${NUM1.format(result.wastagePct)}% wastage`,
        `Equivalent running feet at ${STANDARD_COUNTER_DEPTH_FT} ft depth: ${NUM2.format(result.equivalentRunningFeet)} rft`,
        "",
        `Stone: ${money(result.stoneCost)}`,
        `Fabrication and fixing: ${money(result.fabricationCost)}`,
        `${result.profile.label} edge on ${NUM1.format(result.edgeLengthFt)} rft: ${money(result.edgeCost)}`,
        `Cutouts (${result.sinkCutouts} sink, ${result.hobCutouts} hob): ${money(result.cutoutCost)}`,
        `Total: ${money(result.totalCost)} — ${money2(result.costPerSqft)} per sq ft, ${money(result.costPerRunningFoot)} per running foot`,
      ]
        .filter(Boolean)
        .join("\n")
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
          <Gem className="h-4 w-4" aria-hidden="true" />
          Tiling and flooring
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Granite Countertop Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Granite quotes mix square feet, running feet and per-piece charges in the same line. This
          separates them: the stone area including backsplash and facia, the running feet the
          supplier is quoting against, and the edge profile and cutouts that are billed on top.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Platform</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="gc-length">
              Counter length (ft)
            </label>
            <input
              id="gc-length"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={form.counterLengthFt}
              onChange={set("counterLengthFt")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-depth">
              Counter depth (ft)
            </label>
            <input
              id="gc-depth"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="6"
              step="0.25"
              value={form.counterDepthFt}
              onChange={set("counterDepthFt")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-splash-length">
              Backsplash length (ft)
            </label>
            <input
              id="gc-splash-length"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.backsplashLengthFt}
              onChange={set("backsplashLengthFt")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-splash-height">
              Backsplash height (in)
            </label>
            <input
              id="gc-splash-height"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="36"
              step="1"
              value={form.backsplashHeightIn}
              onChange={set("backsplashHeightIn")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-facia">
              Front facia height (in)
            </label>
            <input
              id="gc-facia"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="36"
              step="0.5"
              value={form.faciaHeightIn}
              onChange={set("faciaHeightIn")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-wastage">
              Wastage allowance (%)
            </label>
            <input
              id="gc-wastage"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={form.wastagePct}
              onChange={set("wastagePct")}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Set the facia to 0 if the front is just the polished slab edge. Use it when a vertical
          strip is bonded on to make the platform look thicker.
        </p>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Edge profile</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="gc-profile">
              Profile
            </label>
            <select
              id="gc-profile"
              className={INPUT}
              value={form.edgeProfileId}
              onChange={setProfile}
            >
              {EDGE_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{profile.note}</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-edge-length">
              Exposed edge length (ft)
            </label>
            <input
              id="gc-edge-length"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.edgeLengthFt}
              onChange={set("edgeLengthFt")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-edge-rate">
              Edge charge (per running ft)
            </label>
            <input
              id="gc-edge-rate"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.edgeExtraPerRft}
              onChange={set("edgeExtraPerRft")}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Rates and cutouts</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="gc-rate">
              Granite rate (per sq ft)
            </label>
            <input
              id="gc-rate"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.ratePerSqft}
              onChange={set("ratePerSqft")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-fab">
              Fabrication + fixing (per sq ft)
            </label>
            <input
              id="gc-fab"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.fabricationPerSqft}
              onChange={set("fabricationPerSqft")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-sinks">
              Sink cutouts
            </label>
            <input
              id="gc-sinks"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={form.sinkCutouts}
              onChange={set("sinkCutouts")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-sink-rate">
              Charge per sink cutout
            </label>
            <input
              id="gc-sink-rate"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.sinkCutoutRate}
              onChange={set("sinkCutoutRate")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-hobs">
              Hob / cooktop cutouts
            </label>
            <input
              id="gc-hobs"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={form.hobCutouts}
              onChange={set("hobCutouts")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="gc-hob-rate">
              Charge per hob cutout
            </label>
            <input
              id="gc-hob-rate"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.hobCutoutRate}
              onChange={set("hobCutoutRate")}
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
              Total cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.totalCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money(result.costPerRunningFoot)} per running foot of platform · order ${sqft(result.orderArea)}`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the granite countertop estimate"
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
                ["Platform area", sqft(result.counterArea)],
                ["Backsplash area", sqft(result.backsplashArea)],
                ["Front facia area", result.faciaArea > 0 ? sqft(result.faciaArea) : "None"],
                ["Net granite area", sqft(result.netArea)],
                ["Wastage added", sqft(result.wastageArea)],
                ["Area to order", sqft(result.orderArea)],
                ["Platform running feet", `${NUM1.format(result.runningFeet)} rft`],
                [
                  `Equivalent running feet at ${STANDARD_COUNTER_DEPTH_FT} ft depth`,
                  `${NUM2.format(result.equivalentRunningFeet)} rft`,
                ],
                ["Stone cost", `${money(result.stoneCost)} (${NUM.format(result.stoneSharePct)}% of total)`],
                ["Fabrication and fixing", money(result.fabricationCost)],
                [
                  `${result.profile.label} edge`,
                  `${money(result.edgeCost)} on ${NUM1.format(result.edgeLengthFt)} rft`,
                ],
                ["Sink cutouts", `${NUM.format(result.sinkCutouts)} — ${money(result.sinkCost)}`],
                ["Hob cutouts", `${NUM.format(result.hobCutouts)} — ${money(result.hobCost)}`],
                ["Total", money(result.totalCost)],
                ["Cost per sq ft of finished top", money2(result.costPerSqft)],
              ]
            : [
                ["Net granite area", DASH],
                ["Area to order", DASH],
                ["Stone cost", DASH],
                ["Total", DASH],
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
          <h2 className="text-base font-semibold">Edge profiles and what they add</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Profile
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Indicative per rft
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    What it is
                  </th>
                </tr>
              </thead>
              <tbody>
                {EDGE_PROFILES.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      p.id === result.profile.id ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">{p.label}</td>
                    <td className="py-2.5 pr-3 text-right">{money(p.extraPerRft)}</td>
                    <td className="py-2.5 text-[var(--muted-foreground)]">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Edge rates are indicative and vary widely by city and fabricator — the figure in the box
            above is the one used in the calculation, so change it to the rate you have been quoted.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Real slabs come in fixed sizes, so an awkward run can waste far more
        than the allowance here, and matching the pattern across a joint costs more stone again.
        Confirm the slab size, thickness and joint positions with your fabricator before ordering.
      </p>
    </main>
  );
}
