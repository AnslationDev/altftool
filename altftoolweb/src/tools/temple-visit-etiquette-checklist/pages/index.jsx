"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";
import { TIER_WEIGHTS, TRADITIONS, scoreChecklist } from "../lib";

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = { traditionId: "theravada", checkedIds: [] };

const TIER_LABEL = {
  blocker: "Will get you turned away",
  important: "Worshippers will notice",
  courtesy: "Small courtesies",
};

const TIER_ORDER = ["blocker", "important", "courtesy"];

const BAND_TEXT = {
  blocked: "text-[var(--danger)]",
  unprepared: "text-[var(--danger)]",
  gaps: "text-[var(--foreground)]",
  almost: "text-[var(--primary)]",
  ready: "text-[var(--success)]",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

export default function ToolHome() {
  const [traditionId, setTraditionId] = useState(DEFAULTS.traditionId);
  const [checkedIds, setCheckedIds] = useState(DEFAULTS.checkedIds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreChecklist({ traditionId, checkedIds }),
    [traditionId, checkedIds],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setCheckedIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );
  };

  const changeTradition = (id) => {
    setTraditionId(id);
    setCheckedIds([]);
    setCopied(false);
  };

  const grouped = useMemo(() => {
    if (hasError) return [];
    return TIER_ORDER.map((tier) => ({
      tier,
      items: result.items.filter((item) => item.tier === tier),
    })).filter((group) => group.items.length > 0);
  }, [result, hasError]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Temple Visit Etiquette Checklist",
      result.tradition.label,
      `Readiness: ${PCT.format(result.percent)}% (${result.earnedWeight} of ${result.totalWeight} weighted points)`,
      result.verdict,
      "",
      "Still outstanding:",
      ...TIER_ORDER.flatMap((tier) =>
        result.unmet[tier].map((item) => `- [${tier}] ${item.text}`),
      ),
    ].join("\n");
  }, [result, hasError]);

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
    setTraditionId(DEFAULTS.traditionId);
    setCheckedIds(DEFAULTS.checkedIds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Temple etiquette
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Temple Visit Etiquette Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose the tradition, then tick what you have covered. Rules are weighted by
          consequence: anything that gets you turned away at the door counts for five times a
          small courtesy, and one unmet rule of that kind holds the verdict back however high the
          percentage climbs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="temple-tradition">
          Which tradition are you visiting?
        </label>
        <select
          id="temple-tradition"
          className={`mt-2 ${INPUT_CLASS}`}
          value={traditionId}
          onChange={(event) => changeTradition(event.target.value)}
        >
          {TRADITIONS.map((tradition) => (
            <option key={tradition.id} value={tradition.id}>
              {tradition.label}
            </option>
          ))}
        </select>
      </section>

      {hasError ? (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Readiness
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--foreground)]" : BAND_TEXT[result.band]
              }`}
            >
              {hasError ? DASH : `${PCT.format(result.percent)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the temple etiquette checklist result"
              className={GHOST_BTN}
              disabled={hasError}
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
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Weighted points",
              hasError ? DASH : `${result.earnedWeight} of ${result.totalWeight}`,
            ],
            [
              "Items ticked",
              hasError ? DASH : `${result.metCount} of ${result.itemCount}`,
            ],
            [
              "Entry-blocking rules outstanding",
              hasError ? DASH : String(result.blockersOutstanding),
            ],
            [
              "Weighting used",
              `blocker ${TIER_WEIGHTS.blocker} · important ${TIER_WEIGHTS.important} · courtesy ${TIER_WEIGHTS.courtesy}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.blockersOutstanding > 0 ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Still open at the door: {result.unmet.blocker.map((item) => item.text).join("; ")}.
          </p>
        ) : null}
      </section>

      {!hasError
        ? grouped.map((group) => (
            <section
              key={group.tier}
              className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <h2 className="text-base font-semibold">{TIER_LABEL[group.tier]}</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Worth {TIER_WEIGHTS[group.tier]} point
                {TIER_WEIGHTS[group.tier] === 1 ? "" : "s"} each
              </p>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => {
                  const active = checkedIds.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label
                        htmlFor={`temple-${item.id}`}
                        className={`flex min-h-11 cursor-pointer gap-3 rounded-md border px-3 py-3 text-sm transition ${
                          active
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        <input
                          id={`temple-${item.id}`}
                          type="checkbox"
                          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                          checked={active}
                          onChange={() => toggle(item.id)}
                        />
                        <span>
                          <span className="font-semibold">{item.text}</span>
                          <span className="mt-1 block leading-6 text-[var(--muted-foreground)]">
                            {item.detail}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are the standing conventions of each tradition. Individual sites post their own
        conditions and a notice at the door always overrides a general convention — read it before
        you go in, and follow whatever the people already inside are doing.
      </p>
    </main>
  );
}
