"use client";

import { useMemo, useState } from "react";
import { Camera, Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";

import {
  MAX_MITIGATION_CREDIT,
  MITIGATIONS,
  TICKABLE_RISK_FACTORS,
  assessSharingExposure,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus:outline-none";
const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

/** First paint: the ordinary family-holiday habit, posted live from a public-ish account. */
const DEFAULT_RISKS = ["public-account", "platform-geotag", "checkins", "stories-auto"];
const DEFAULT_MITIGATIONS = ["neighbour-told"];
const DEFAULT_NIGHTS = "10";
const DEFAULT_FIRST_DAY = "1";

const RISK_GROUPS = TICKABLE_RISK_FACTORS.reduce((groups, factor) => {
  const found = groups.find((entry) => entry.name === factor.group);
  if (found) found.items.push(factor);
  else groups.push({ name: factor.group, items: [factor] });
  return groups;
}, []);

function toggle(list, id) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [riskIds, setRiskIds] = useState(DEFAULT_RISKS);
  const [mitigationIds, setMitigationIds] = useState(DEFAULT_MITIGATIONS);
  const [nights, setNights] = useState(DEFAULT_NIGHTS);
  const [firstDay, setFirstDay] = useState(DEFAULT_FIRST_DAY);
  const [postAfterReturn, setPostAfterReturn] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessSharingExposure({
        riskIds,
        mitigationIds,
        tripNights: toNumber(nights),
        firstPostDay: toNumber(firstDay),
        postAfterReturn,
      }),
    [riskIds, mitigationIds, nights, firstDay, postAfterReturn],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Holiday photo sharing exposure",
      `Exposure: ${result.exposurePercent}% — ${result.band.label}`,
      `Raw risk before mitigations: ${result.rawPercent}%`,
      result.live
        ? `Absence publicised for ${result.exposureNights} of ${result.tripNights} night(s).`
        : "Nothing published until you are home — no absence signal.",
      `Mitigations in place: ${result.mitigationCount} of ${result.totalMitigations} (${result.mitigationPercent}%)`,
      result.hardRuleTriggered
        ? "WARNING: public, live posting alongside your home details or your dates."
        : "",
      "",
      result.topFixes.length
        ? `Fix first:\n${result.topFixes.map((fix, index) => `${index + 1}. ${fix.label}`).join("\n")}`
        : "No risk factors ticked.",
      "",
      result.verdict,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

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
    setRiskIds(DEFAULT_RISKS);
    setMitigationIds(DEFAULT_MITIGATIONS);
    setNights(DEFAULT_NIGHTS);
    setFirstDay(DEFAULT_FIRST_DAY);
    setPostAfterReturn(false);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Nights the absence is public", DASH],
        ["Raw risk before mitigations", DASH],
        ["Risk factors active", DASH],
        ["Mitigations in place", DASH],
      ]
    : [
        [
          "Nights the absence is public",
          result.live
            ? `${NUM.format(result.exposureNights)} of ${NUM.format(result.tripNights)}`
            : "0 — posting held until you return",
        ],
        [
          "Raw risk before mitigations",
          `${NUM.format(result.rawPercent)}% (${NUM.format(result.riskWeight)} of ${NUM.format(result.maxRiskWeight)} points)`,
        ],
        [
          "Risk factors active",
          `${NUM.format(result.activeRiskCount)} of ${NUM.format(result.totalRiskCount)}`,
        ],
        [
          "Mitigations in place",
          `${NUM.format(result.mitigationCount)} of ${NUM.format(result.totalMitigations)} (${NUM.format(result.mitigationPercent)}%)`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Travel security
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Family Holiday Photo Sharing Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The photograph is rarely the problem — the published absence is. Set your posting
          schedule, tick what your accounts actually do, and see how many nights of an empty house
          you are advertising, plus which single change removes most of it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. When you post</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="trip-nights">
              Nights away
            </label>
            <input
              id="trip-nights"
              className={`mt-2 ${FIELD}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              value={nights}
              onChange={(event) => setNights(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="first-day">
              Day of the trip your first post goes up
            </label>
            <input
              id="first-day"
              className={`mt-2 ${FIELD} disabled:opacity-50`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              value={firstDay}
              disabled={postAfterReturn}
              onChange={(event) => setFirstDay(event.target.value)}
            />
          </div>
        </div>
        <label className={`mt-3 ${CHECK_ROW}`} htmlFor="after-return">
          <input
            id="after-return"
            type="checkbox"
            className={CHECKBOX}
            checked={postAfterReturn}
            onChange={(event) => setPostAfterReturn(event.target.checked)}
          />
          <span className="leading-6">
            Nothing gets posted until everyone is home
            <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
              The single largest factor in the score, and it costs nothing but patience.
            </span>
          </span>
        </label>
      </section>

      {RISK_GROUPS.map((group) => (
        <section
          key={group.name}
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        >
          <h2 className="text-base font-semibold">{group.name}</h2>
          <div className="mt-3 grid gap-2">
            {group.items.map((factor) => (
              <label key={factor.id} className={CHECK_ROW} htmlFor={`risk-${factor.id}`}>
                <input
                  id={`risk-${factor.id}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={riskIds.includes(factor.id)}
                  onChange={() => setRiskIds((current) => toggle(current, factor.id))}
                />
                <span className="leading-6">
                  <span className="font-medium">{factor.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {factor.why}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What the house has going for it</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          These reduce the score by at most {NUM.format(MAX_MITIGATION_CREDIT * 100)}% — a
          published absence cannot be un-published.
        </p>
        <div className="mt-3 grid gap-2">
          {MITIGATIONS.map((item) => (
            <label key={item.id} className={CHECK_ROW} htmlFor={`mit-${item.id}`}>
              <input
                id={`mit-${item.id}`}
                type="checkbox"
                className={CHECKBOX}
                checked={mitigationIds.includes(item.id)}
                onChange={() => setMitigationIds((current) => toggle(current, item.id))}
              />
              <span className="leading-6">
                <span className="font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                  {item.why}
                </span>
              </span>
            </label>
          ))}
        </div>
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Exposure after mitigations
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.band.tone]}`}
            >
              {hasError ? DASH : `${NUM.format(result.exposurePercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm font-semibold">
              {hasError ? DASH : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the photo sharing exposure result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset the guide to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.hardRuleTriggered ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Public account, posting live, and either your home is identifiable or your dates are
              stated. That combination is what makes a holiday album useful to a stranger.
            </span>
          </p>
        ) : null}

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {hasError ? "Fix the input above to see a verdict." : result.verdict}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[24rem] text-left text-sm">
              <caption className="sr-only">Risk points by group</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Group
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Active
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.groups.map((group) => (
                  <tr key={group.group} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">{group.group}</td>
                    <td className="py-2.5 pr-3">
                      {NUM.format(group.active)} / {NUM.format(group.count)}
                    </td>
                    <td className="py-2.5 font-semibold">
                      {NUM.format(group.weight)} / {NUM.format(group.maxWeight)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!hasError && result.topFixes.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Change these first
            </h3>
            <ol className="mt-2 grid gap-2 text-sm leading-6">
              {result.topFixes.map((fix, index) => (
                <li key={fix.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">{index + 1}.</span>
                  <span>
                    {fix.label}
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {fix.why}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {!hasError && result.missingMitigations.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Still to arrange at home
            </h3>
            <ul className="mt-2 grid gap-1.5 text-sm leading-6">
              {result.missingMitigations.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    &bull;
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not insurance or legal advice. Home insurers have publicly warned that
        advertising an absence can be raised against a claim, and policy wording differs — read
        yours. Nothing you tick here leaves your browser.
      </p>
    </main>
  );
}
