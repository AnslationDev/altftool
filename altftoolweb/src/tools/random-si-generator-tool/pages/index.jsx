"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lightbulb, RotateCcw, Shuffle } from "lucide-react";

import {
  AUDIENCES,
  formatIdea,
  generateIdea,
  MAX_SEED,
  MODELS,
  TOTAL_COMBINATIONS,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const FIRST_SEED = 2026;
const NUM = new Intl.NumberFormat("en-IN");

const newSeed = () => Math.floor(Math.random() * MAX_SEED) + 1;

export default function ToolHome() {
  const [seed, setSeed] = useState(FIRST_SEED);
  const [lockAudience, setLockAudience] = useState("");
  const [lockModel, setLockModel] = useState("");
  const [saved, setSaved] = useState([]);
  const [copied, setCopied] = useState(false);

  const idea = useMemo(
    () => generateIdea({ seed, lockAudience, lockModel }),
    [seed, lockAudience, lockModel],
  );

  const failed = Boolean(idea.error);

  const shuffle = () => {
    setSeed(newSeed());
    setCopied(false);
  };

  const reset = () => {
    setSeed(FIRST_SEED);
    setLockAudience("");
    setLockModel("");
    setSaved([]);
    setCopied(false);
  };

  const save = () => {
    if (failed) return;
    setSaved((prev) =>
      prev.some((item) => item.combinationIndex === idea.combinationIndex)
        ? prev
        : [{ combinationIndex: idea.combinationIndex, headline: idea.headline, score: idea.score, seed }, ...prev].slice(0, 8),
    );
  };

  const copy = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(formatIdea(idea));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Lightbulb className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Random Startup Idea Generator
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Five slots — audience, problem, delivery, twist and pricing — combine into{" "}
          {NUM.format(TOTAL_COMBINATIONS)} distinct ideas. Lock a slot to explore one corner of
          the space.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="idea-audience">
            Lock the audience
          </label>
          <select
            id="idea-audience"
            className={`${INPUT_CLASS} mt-1.5`}
            value={lockAudience}
            onChange={(event) => {
              setLockAudience(event.target.value);
              setCopied(false);
            }}
          >
            <option value="">Surprise me</option>
            {AUDIENCES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="idea-model">
            Lock the delivery model
          </label>
          <select
            id="idea-model"
            className={`${INPUT_CLASS} mt-1.5`}
            value={lockModel}
            onChange={(event) => {
              setLockModel(event.target.value);
              setCopied(false);
            }}
          >
            <option value="">Surprise me</option>
            {MODELS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="idea-seed">
            Seed (the same seed rebuilds the same idea)
          </label>
          <input
            id="idea-seed"
            type="number"
            min="1"
            max={MAX_SEED}
            className={`${INPUT_CLASS} mt-1.5`}
            value={seed}
            onChange={(event) => {
              const next = Number(event.target.value);
              setSeed(Number.isFinite(next) ? next : FIRST_SEED);
              setCopied(false);
            }}
          />
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {idea.error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
          Idea {failed ? DASH : `#${NUM.format(idea.combinationIndex + 1)}`} of{" "}
          {NUM.format(TOTAL_COMBINATIONS)}
        </p>
        <h2 className="mt-2 text-xl leading-snug font-bold text-[var(--foreground)] sm:text-2xl">
          {failed ? DASH : idea.headline}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {failed ? DASH : idea.pitch}
        </p>

        <div className="mt-5 flex items-baseline gap-3 border-t border-[var(--border)] pt-4">
          <span className="text-4xl font-bold text-[var(--primary)]">
            {failed ? DASH : `${idea.score}/10`}
          </span>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {failed ? DASH : idea.band.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {failed ? DASH : idea.band.detail}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted-foreground)]">Audience</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {failed ? DASH : idea.audience.label}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Problem</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {failed ? DASH : idea.problem.label}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Delivery</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {failed ? DASH : idea.model.label}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Differentiator</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {failed ? DASH : idea.twist.label}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Pricing</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {failed ? DASH : idea.pricing.label}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Raw effort weight</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {failed ? DASH : `${idea.rawEffort} of 25`}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={shuffle} className={`${PRIMARY_BTN} flex-1 sm:flex-none`}>
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          New idea
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={failed}
          aria-label="Copy the full idea brief"
          className={`${GHOST_BTN} disabled:opacity-50`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={failed}
          className={`${GHOST_BTN} disabled:opacity-50`}
          aria-label="Shortlist this idea"
        >
          Shortlist
        </button>
        <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset the generator">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {saved.length > 0 ? (
        <section className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left text-sm">
            <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
              Shortlist (last 8, kept in this tab only)
            </caption>
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="py-2 pr-4 font-semibold text-[var(--foreground)]">
                  Idea
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold text-[var(--foreground)]">
                  Seed
                </th>
                <th scope="col" className="py-2 text-right font-semibold text-[var(--foreground)]">
                  Effort
                </th>
              </tr>
            </thead>
            <tbody>
              {saved.map((item) => (
                <tr key={item.combinationIndex} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 text-[var(--muted-foreground)]">{item.headline}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--muted-foreground)]">{item.seed}</td>
                  <td className="py-2 text-right font-semibold text-[var(--foreground)]">
                    {item.score}/10
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
