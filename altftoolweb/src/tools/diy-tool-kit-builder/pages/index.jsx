"use client";

import { useMemo, useState } from "react";
import { Boxes, Check, Copy, RotateCcw } from "lucide-react";

import { JOBS, TIERS, TOOLS, buildToolKit } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);

const DEFAULTS = {
  jobIds: ["shelves", "flat-pack"],
  tier: "mid",
  ownedIds: [],
  uses: "3",
  budget: "0",
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
  const [jobIds, setJobIds] = useState(DEFAULTS.jobIds);
  const [tier, setTier] = useState(DEFAULTS.tier);
  const [ownedIds, setOwnedIds] = useState(DEFAULTS.ownedIds);
  const [uses, setUses] = useState(DEFAULTS.uses);
  const [budget, setBudget] = useState(DEFAULTS.budget);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildToolKit({
        jobIds,
        tier,
        ownedIds,
        expectedUses: toNumber(uses),
        budgetLimit: toNumber(budget),
      }),
    [jobIds, tier, ownedIds, uses, budget],
  );

  const failed = Boolean(result.error);

  const toggleJob = (id) =>
    setJobIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleOwned = (id) =>
    setOwnedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "DIY Tool Kit",
      `Jobs: ${result.jobs.map((job) => job.label).join(", ")}`,
      `Tier: ${result.tier.label}, expecting ${result.expectedUses} uses of each hireable tool`,
      "",
    ];
    for (const phase of result.phases) {
      if (phase.items.length === 0) continue;
      lines.push(`${phase.label} — ${INR.format(phase.cost)}`);
      for (const item of phase.items) {
        lines.push(
          `  - ${item.label}: ${INR.format(item.price)}${item.shouldHire ? ` (hire for ${INR.format(item.hireTotal)} instead)` : ""}`,
        );
      }
      lines.push("");
    }
    lines.push(`Essential now: ${INR.format(result.essentialCost)}`);
    lines.push(`Everything: ${INR.format(result.totalCost)}`);
    if (result.hireSaving > 0) lines.push(`Saved by hiring: ${INR.format(result.hireSaving)}`);
    lines.push(result.verdict);
    return lines.join("\n");
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
    setJobIds(DEFAULTS.jobIds);
    setTier(DEFAULTS.tier);
    setOwnedIds(DEFAULTS.ownedIds);
    setUses(DEFAULTS.uses);
    setBudget(DEFAULTS.budget);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Boxes className="h-4 w-4" aria-hidden="true" />
          Kitting out
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">DIY Tool Kit Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the jobs you actually plan to do and this returns the tools they need, split into
          what you need before starting and what can wait — with a buy-or-hire test on everything
          expensive.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Jobs you plan to do</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {JOBS.map((job) => (
              <label key={job.id} htmlFor={`dk-job-${job.id}`} className={CHECKBOX_LABEL}>
                <input
                  id={`dk-job-${job.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={jobIds.includes(job.id)}
                  onChange={() => toggleJob(job.id)}
                />
                <span>{job.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dk-tier">
              Quality tier
            </label>
            <select
              id="dk-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tier}
              onChange={(event) => setTier(event.target.value)}
            >
              {TIERS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{TIERS.find((entry) => entry.id === tier).note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dk-uses">
              Times you expect to use each big tool
            </label>
            <input
              id="dk-uses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="200"
              step="1"
              value={uses}
              onChange={(event) => setUses(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Buy when the price is below this many days of hire; hire when it is above.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dk-budget">
              Budget ceiling (0 for none)
            </label>
            <input
              id="dk-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
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
              Needed before you start
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.essentialCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Pick at least one job above."
                : `${money(result.totalCost)} for the full kit across ${result.jobs.length} job${result.jobs.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the tool list and budget"
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
              result.withinBudget
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tools on the list", failed ? DASH : NUM0.format(result.entries.length)],
            ["Still to buy or hire", failed ? DASH : NUM0.format(result.toBuyCount)],
            ["Already owned", failed ? DASH : `${NUM0.format(result.ownedCount)} (${money(result.ownedValue)})`],
            ["Essential phase", failed ? DASH : money(result.essentialCost)],
            ["If you bought everything", failed ? DASH : money(result.totalListPrice)],
            ["Saved by hiring instead", failed ? DASH : money(result.hireSaving)],
            ["Total as planned", failed ? DASH : money(result.totalCost)],
            ["Average per job", failed ? DASH : money(result.costPerJob)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed &&
        result.phases
          .filter((phase) => phase.items.length > 0)
          .map((phase) => (
            <section
              key={phase.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">
                  {phase.label} — {phase.items.length} items
                </h2>
                <span className="text-sm font-semibold text-[var(--primary)]">
                  {money(phase.cost)}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{phase.note}</p>
              <ul className="mt-3 space-y-3">
                {phase.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-sm font-semibold">
                        {item.shouldHire ? (
                          <>
                            <span className="text-[var(--muted-foreground)] line-through">
                              {money(item.price)}
                            </span>{" "}
                            <span className="text-[var(--success)]">
                              hire {money(item.hireTotal)}
                            </span>
                          </>
                        ) : (
                          money(item.price)
                        )}
                      </p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                      {item.why}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      For: {item.jobs.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

      {!failed && result.hireItems.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Cheaper to hire at {result.expectedUses} uses</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Tool
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Buy
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Hire / day
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Hire total
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Saved
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.hireItems.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{money(item.price)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {money(item.hireDaily)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{money(item.hireTotal)}</td>
                    <td className="py-2 whitespace-nowrap font-semibold text-[var(--success)]">
                      {money(item.saving)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={HINT_CLASS}>
            Break-even is purchase price ÷ daily hire rate. Above that many uses, owning wins.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Tools you already have</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick anything you own and it drops out of the budget.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <label key={tool.id} htmlFor={`dk-own-${tool.id}`} className={CHECKBOX_LABEL}>
              <input
                id={`dk-own-${tool.id}`}
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={ownedIds.includes(tool.id)}
                onChange={() => toggleOwned(tool.id)}
              />
              <span className="min-w-0 truncate">{tool.label}</span>
            </label>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Prices are indicative Indian retail bands for planning, not quotations, and vary widely by
        brand and region. Safety equipment is on the essential list for a reason — eye protection,
        a fitted dust mask and hearing protection cost less than any tool here. Electrical and gas
        work is legally restricted to licensed trades in many places; check what applies where you
        live before starting, and use a qualified electrician or plumber for anything beyond a
        like-for-like replacement.
      </p>
    </main>
  );
}
