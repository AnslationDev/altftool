"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FolderGit2, RotateCcw } from "lucide-react";

import { CHANGE_RATES, EXPERTISE_LEVELS, chooseSharingStrategy } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  hasRegistry: true,
  changeRate: "monthly",
  editInConsumer: false,
  expertise: "medium",
  consumerCount: "3",
  needExactPin: false,
};

export default function ToolHome() {
  const [hasRegistry, setHasRegistry] = useState(DEFAULTS.hasRegistry);
  const [changeRate, setChangeRate] = useState(DEFAULTS.changeRate);
  const [editInConsumer, setEditInConsumer] = useState(DEFAULTS.editInConsumer);
  const [expertise, setExpertise] = useState(DEFAULTS.expertise);
  const [consumerCount, setConsumerCount] = useState(DEFAULTS.consumerCount);
  const [needExactPin, setNeedExactPin] = useState(DEFAULTS.needExactPin);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      chooseSharingStrategy({
        hasRegistry,
        changeRate,
        editInConsumer,
        expertise,
        consumerCount: consumerCount.trim() === "" ? Number.NaN : Number(consumerCount),
        needExactPin,
      }),
    [hasRegistry, changeRate, editInConsumer, expertise, consumerCount, needExactPin],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Code-sharing mechanism fit",
      ...result.ranking.map(
        (o, i) => `${i + 1}. ${o.name} — ${o.score}/${result.maxScore}\n   ${o.summary}`,
      ),
    ].join("\n");
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
    setHasRegistry(DEFAULTS.hasRegistry);
    setChangeRate(DEFAULTS.changeRate);
    setEditInConsumer(DEFAULTS.editInConsumer);
    setExpertise(DEFAULTS.expertise);
    setConsumerCount(DEFAULTS.consumerCount);
    setNeedExactPin(DEFAULTS.needExactPin);
    setCopied(false);
  };

  const checkboxes = [
    {
      id: "st-registry",
      label: "We have a package registry available (npm, PyPI, Artifactory, GitHub Packages…)",
      checked: hasRegistry,
      set: setHasRegistry,
    },
    {
      id: "st-edit",
      label: "Developers need to edit the shared code from inside consumer repos and push it back",
      checked: editInConsumer,
      set: setEditInConsumer,
    },
    {
      id: "st-pin",
      label: "Consumers must pin an exact commit, not a version range",
      checked: needExactPin,
      set: setNeedExactPin,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FolderGit2 className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Git Submodule vs Subtree Chooser
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sharing code across repositories? Score git submodules, git subtree and a published
          package dependency against your workflow — with the reasoning for every point.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="st-rate">
              How often does the shared code change?
            </label>
            <select
              id="st-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={changeRate}
              onChange={(event) => setChangeRate(event.target.value)}
            >
              {CHANGE_RATES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-expertise">
              Team git expertise
            </label>
            <select
              id="st-expertise"
              className={`mt-2 ${INPUT_CLASS}`}
              value={expertise}
              onChange={(event) => setExpertise(event.target.value)}
            >
              {EXPERTISE_LEVELS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-consumers">
              Repositories consuming the shared code
            </label>
            <input
              id="st-consumers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={consumerCount}
              onChange={(event) => setConsumerCount(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 grid gap-1">
          {checkboxes.map((box) => (
            <label
              key={box.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={box.id}
            >
              <input
                id={box.id}
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={box.checked}
                onChange={(event) => box.set(event.target.checked)}
              />
              {box.label}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best fit for your answers
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.best.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the code-sharing recommendation"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <ol className="mt-5 space-y-4">
            {result.ranking.map((o, index) => (
              <li
                key={o.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">
                    {index + 1}. {o.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold">
                    {o.score} / {result.maxScore}
                  </span>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${o.name} scores ${o.score} of ${result.maxScore}`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{
                      width: `${result.maxScore > 0 ? Math.round((o.score / result.maxScore) * 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{o.summary}</p>
                {o.reasons.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                    {o.reasons.map((r) => (
                      <li key={r} className="text-[var(--success)]">
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {o.cautions.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                    {o.cautions.map((c) => (
                      <li key={c} className="text-[var(--danger)]">
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}

        <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
          Heuristic scoring based on the Pro Git submodules chapter, git's contrib/subtree
          documentation and standard package-registry practice — a starting point for the
          decision, not a verdict.
        </p>
      </section>
    </main>
  );
}
