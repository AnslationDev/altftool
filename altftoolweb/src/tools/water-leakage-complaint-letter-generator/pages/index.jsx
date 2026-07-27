"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { DAMAGE_ITEMS, LEAK_SOURCES, STAGES, buildLeakageComplaint } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  sourceId: "terrace",
  stageId: "first",
  letterDate: "2026-01-15",
  deadlineDays: 15,
  observedDays: 30,
  damageIds: ["damp-patch", "peeling"],
  senderName: "Rohit Sharma",
  senderFlat: "B-704",
  societyName: "Green Meadows CHS Ltd",
  sourceFlat: "B-804",
  copyToSociety: true,
};

export default function ToolHome() {
  const [sourceId, setSourceId] = useState(DEFAULTS.sourceId);
  const [stageId, setStageId] = useState(DEFAULTS.stageId);
  const [letterDate, setLetterDate] = useState(DEFAULTS.letterDate);
  const [deadlineDays, setDeadlineDays] = useState(String(DEFAULTS.deadlineDays));
  const [observedDays, setObservedDays] = useState(String(DEFAULTS.observedDays));
  const [damageIds, setDamageIds] = useState(DEFAULTS.damageIds);
  const [senderName, setSenderName] = useState(DEFAULTS.senderName);
  const [senderFlat, setSenderFlat] = useState(DEFAULTS.senderFlat);
  const [societyName, setSocietyName] = useState(DEFAULTS.societyName);
  const [sourceFlat, setSourceFlat] = useState(DEFAULTS.sourceFlat);
  const [copyToSociety, setCopyToSociety] = useState(DEFAULTS.copyToSociety);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildLeakageComplaint({
        sourceId,
        stageId,
        letterDate,
        deadlineDays: Number(deadlineDays),
        observedDays: Number(observedDays),
        damageIds,
        senderName,
        senderFlat,
        societyName,
        sourceFlat,
        copyToSociety,
      }),
    [
      sourceId,
      stageId,
      letterDate,
      deadlineDays,
      observedDays,
      damageIds,
      senderName,
      senderFlat,
      societyName,
      sourceFlat,
      copyToSociety,
    ],
  );

  const hasError = Boolean(result.error);
  const needsSourceFlat = LEAK_SOURCES.find((s) => s.id === sourceId)?.party === "member";

  const toggleDamage = (id) => {
    setDamageIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyLetter = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSourceId(DEFAULTS.sourceId);
    setStageId(DEFAULTS.stageId);
    setLetterDate(DEFAULTS.letterDate);
    setDeadlineDays(String(DEFAULTS.deadlineDays));
    setObservedDays(String(DEFAULTS.observedDays));
    setDamageIds(DEFAULTS.damageIds);
    setSenderName(DEFAULTS.senderName);
    setSenderFlat(DEFAULTS.senderFlat);
    setSocietyName(DEFAULTS.societyName);
    setSourceFlat(DEFAULTS.sourceFlat);
    setCopyToSociety(DEFAULTS.copyToSociety);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Property Notices
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Water Leakage Complaint Letter Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe where the water is coming from and this drafts the complaint to the right party —
          the society for terrace, façade and common lines, the neighbour for a leak inside their
          flat — with a dated repair deadline and the bye-law it rests on.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="leak-source">
              Where the water comes from
            </label>
            <select
              id="leak-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sourceId}
              onChange={(event) => setSourceId(event.target.value)}
            >
              {LEAK_SOURCES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leak-stage">
              Stage of the complaint
            </label>
            <select
              id="leak-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stageId}
              onChange={(event) => {
                const next = event.target.value;
                setStageId(next);
                const stage = STAGES.find((s) => s.id === next);
                if (stage) setDeadlineDays(String(stage.defaultDeadlineDays));
              }}
            >
              {STAGES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leak-date">
              Date of the letter
            </label>
            <input
              id="leak-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={letterDate}
              onChange={(event) => setLetterDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leak-deadline">
              Days allowed for the repair
            </label>
            <input
              id="leak-deadline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="90"
              step="1"
              inputMode="numeric"
              value={deadlineDays}
              onChange={(event) => setDeadlineDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leak-observed">
              Days the leak has been visible
            </label>
            <input
              id="leak-observed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max="3650"
              step="1"
              inputMode="numeric"
              value={observedDays}
              onChange={(event) => setObservedDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leak-society">
              Society / association name
            </label>
            <input
              id="leak-society"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={societyName}
              onChange={(event) => setSocietyName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leak-name">
              Your name
            </label>
            <input
              id="leak-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leak-flat">
              Your flat number
            </label>
            <input
              id="leak-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={senderFlat}
              onChange={(event) => setSenderFlat(event.target.value)}
            />
          </div>
          {needsSourceFlat ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="leak-source-flat">
                Flat the water comes from
              </label>
              <input
                id="leak-source-flat"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={sourceFlat}
                onChange={(event) => setSourceFlat(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Damage visible in your flat</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {DAMAGE_ITEMS.map((item) => (
              <label
                key={item.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`leak-damage-${item.id}`}
              >
                <input
                  id={`leak-damage-${item.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={damageIds.includes(item.id)}
                  onChange={() => toggleDamage(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        {needsSourceFlat ? (
          <label
            className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="leak-copy-society"
          >
            <input
              id="leak-copy-society"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={copyToSociety}
              onChange={(event) => setCopyToSociety(event.target.checked)}
            />
            Mark a copy to the managing committee
          </label>
        ) : null}
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
              Repair deadline
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.deadlineLong}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the complaint letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
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

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Responsible for the repair</dt>
            <dd className="mt-1 leading-6">{hasError ? DASH : result.responsibleParty}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Addressed to</dt>
            <dd className="mt-1 leading-6">{hasError ? DASH : result.addressee}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Bye-law relied on</dt>
            <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">
              {hasError ? DASH : result.byelawNote}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Letter</dt>
            <dd className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6 whitespace-pre-wrap">
              {hasError ? DASH : result.letter}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. The society/member repair split shown here follows
        the Model Bye-laws for Co-operative Housing Societies (Bye-law No. 160 for society property,
        No. 161 for repairs inside a flat); your society&rsquo;s registered bye-laws and your state
        law govern. Send the letter by a method that leaves proof of delivery, and consult an
        advocate before starting any proceeding.
      </p>
    </main>
  );
}
