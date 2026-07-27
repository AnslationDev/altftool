"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Heart, RotateCcw } from "lucide-react";
import { computeEngagementRate, engagementsNeeded } from "../lib";

const DEFAULTS = {
  followers: "25000",
  posts: "12",
  likes: "9000",
  comments: "600",
  shares: "300",
  saves: "1200",
  reach: "180000",
  impressions: "240000",
  target: "3",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const count = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : DASH);

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  return text === "" ? 0 : Number(text);
};

const FIELDS = [
  ["followers", "Followers", "1", "Total follower count right now"],
  ["posts", "Posts these totals cover", "1", "How many posts the numbers below add up"],
  ["likes", "Total likes", "0", ""],
  ["comments", "Total comments", "0", ""],
  ["shares", "Total shares / sends", "0", ""],
  ["saves", "Total saves / bookmarks", "0", ""],
  ["reach", "Total reach (optional)", "0", "Unique accounts — leave 0 if you do not have it"],
  ["impressions", "Total impressions (optional)", "0", "Every view, including repeats"],
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeEngagementRate({
        followers: toNumber(values.followers),
        posts: toNumber(values.posts),
        likes: toNumber(values.likes),
        comments: toNumber(values.comments),
        shares: toNumber(values.shares),
        saves: toNumber(values.saves),
        reach: toNumber(values.reach),
        impressions: toNumber(values.impressions),
      }),
    [values],
  );

  const target = useMemo(
    () =>
      engagementsNeeded({
        followers: toNumber(values.followers),
        targetPercent: toNumber(values.target),
      }),
    [values.followers, values.target],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Engagement Rate",
      `Followers: ${count(result.followers)} (${result.tier ? result.tier.label : DASH} tier)`,
      `Posts measured: ${count(result.posts)}`,
      `Total engagements: ${count(result.engagements)} (${count(result.perPost)} per post)`,
      `ER by followers: ${pct(result.erByFollowers)}${result.band ? ` — ${result.band.label}` : ""}`,
      result.erByReach === null ? "" : `ER by reach: ${pct(result.erByReach)}`,
      result.erByImpressions === null ? "" : `ER by impressions: ${pct(result.erByImpressions)}`,
      result.reachRate === null ? "" : `Reach rate vs followers: ${pct(result.reachRate)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Heart className="h-4 w-4" aria-hidden="true" />
          Creator analytics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Influencer Engagement Rate Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the totals for a batch of posts and get engagement rate by followers, by reach and
          by impressions from the same engagement number — the three figures brands ask for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label, min, hint]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`er-${key}`}>
                {label}
              </label>
              <input
                id={`er-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={min}
                step="1"
                value={values[key]}
                onChange={setField(key)}
                aria-describedby={hint ? `er-${key}-hint` : undefined}
              />
              {hint ? (
                <p id={`er-${key}-hint`} className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {hint}
                </p>
              ) : null}
            </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Engagement rate by followers
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? pct(result.erByFollowers) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok && result.band
                ? `${result.band.label} — ${result.band.note}`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy engagement rate result"
              className={GHOST_BTN}
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
          {[
            ["Creator tier", ok && result.tier ? result.tier.label : DASH],
            ["Total engagements", ok ? count(result.engagements) : DASH],
            ["Engagements per post", ok ? count(result.perPost) : DASH],
            ["ER by reach", ok && result.erByReach !== null ? pct(result.erByReach) : DASH],
            [
              "ER by impressions",
              ok && result.erByImpressions !== null ? pct(result.erByImpressions) : DASH,
            ],
            ["Reach rate vs followers", ok && result.reachRate !== null ? pct(result.reachRate) : DASH],
            [
              "Impressions per reached account",
              ok && result.frequency !== null ? NUM2.format(result.frequency) : DASH,
            ],
            ["Comments as share of engagement", ok ? pct(result.commentRatio) : DASH],
            ["Saves as share of engagement", ok ? pct(result.saveRatio) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What a target rate needs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="er-target">
              Target ER by followers (%)
            </label>
            <input
              id="er-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={values.target}
              onChange={setField("target")}
            />
          </div>
          <div className="flex items-end">
            {target.error ? (
              <p
                role="alert"
                className="w-full rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {target.error}
              </p>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                You need{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {count(target.needed)}
                </span>{" "}
                engagements on a single post to hit {pct(target.targetPercent)}.
              </p>
            )}
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates vary hugely by platform, format and follower size, so compare a creator against their
        own trailing average and against peers of a similar size rather than a single benchmark.
      </p>
    </main>
  );
}
