"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PawPrint, RotateCcw } from "lucide-react";

import { COMMITMENTS, PET_TYPES, REQUEST_CONTEXTS, buildPetNocRequest } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  petTypeId: "dog-medium",
  contextId: "fresh",
  letterDate: "2026-01-15",
  replyDays: 15,
  commitmentIds: ["licence", "vaccination", "leash", "waste", "damage"],
  lastVaccination: "2025-09-01",
  petName: "Simba",
  residentName: "Ananya Iyer",
  flatNumber: "A-302",
  societyName: "Sunrise Residency CHS Ltd",
};

export default function ToolHome() {
  const [petTypeId, setPetTypeId] = useState(DEFAULTS.petTypeId);
  const [contextId, setContextId] = useState(DEFAULTS.contextId);
  const [letterDate, setLetterDate] = useState(DEFAULTS.letterDate);
  const [replyDays, setReplyDays] = useState(String(DEFAULTS.replyDays));
  const [commitmentIds, setCommitmentIds] = useState(DEFAULTS.commitmentIds);
  const [lastVaccination, setLastVaccination] = useState(DEFAULTS.lastVaccination);
  const [petName, setPetName] = useState(DEFAULTS.petName);
  const [residentName, setResidentName] = useState(DEFAULTS.residentName);
  const [flatNumber, setFlatNumber] = useState(DEFAULTS.flatNumber);
  const [societyName, setSocietyName] = useState(DEFAULTS.societyName);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildPetNocRequest({
        petTypeId,
        contextId,
        letterDate,
        replyDays: Number(replyDays),
        commitmentIds,
        lastVaccination,
        petName,
        residentName,
        flatNumber,
        societyName,
      }),
    [
      petTypeId,
      contextId,
      letterDate,
      replyDays,
      commitmentIds,
      lastVaccination,
      petName,
      residentName,
      flatNumber,
      societyName,
    ],
  );

  const hasError = Boolean(result.error);
  const petType = PET_TYPES.find((p) => p.id === petTypeId);
  const showVaccination = Boolean(petType?.licensable);
  const visibleCommitments = COMMITMENTS.filter((c) => (showVaccination ? true : !c.petOnly));

  const toggleCommitment = (id) => {
    setCommitmentIds((current) =>
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
    setPetTypeId(DEFAULTS.petTypeId);
    setContextId(DEFAULTS.contextId);
    setLetterDate(DEFAULTS.letterDate);
    setReplyDays(String(DEFAULTS.replyDays));
    setCommitmentIds(DEFAULTS.commitmentIds);
    setLastVaccination(DEFAULTS.lastVaccination);
    setPetName(DEFAULTS.petName);
    setResidentName(DEFAULTS.residentName);
    setFlatNumber(DEFAULTS.flatNumber);
    setSocietyName(DEFAULTS.societyName);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PawPrint className="h-4 w-4" aria-hidden="true" />
          Property Notices
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Pet Ownership NOC Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft a polite, well-documented request for your society&rsquo;s no-objection to keeping a
          pet — with the commitments a committee actually cares about, your anti-rabies booster
          status, and a readiness score showing what is still missing.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-pet">
              Kind of pet
            </label>
            <select
              id="noc-pet"
              className={`mt-2 ${INPUT_CLASS}`}
              value={petTypeId}
              onChange={(event) => setPetTypeId(event.target.value)}
            >
              {PET_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-context">
              Situation
            </label>
            <select
              id="noc-context"
              className={`mt-2 ${INPUT_CLASS}`}
              value={contextId}
              onChange={(event) => {
                const next = event.target.value;
                setContextId(next);
                const chosen = REQUEST_CONTEXTS.find((c) => c.id === next);
                if (chosen) setReplyDays(String(chosen.defaultReplyDays));
              }}
            >
              {REQUEST_CONTEXTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-petname">
              Pet&rsquo;s name (optional)
            </label>
            <input
              id="noc-petname"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={petName}
              onChange={(event) => setPetName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-date">
              Date of the letter
            </label>
            <input
              id="noc-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={letterDate}
              onChange={(event) => setLetterDate(event.target.value)}
            />
          </div>
          {showVaccination ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="noc-vaccination">
                Last anti-rabies vaccination
              </label>
              <input
                id="noc-vaccination"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={lastVaccination}
                onChange={(event) => setLastVaccination(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-reply">
              Reply requested within (days)
            </label>
            <input
              id="noc-reply"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="3"
              max="60"
              step="1"
              inputMode="numeric"
              value={replyDays}
              onChange={(event) => setReplyDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-resident">
              Your name
            </label>
            <input
              id="noc-resident"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={residentName}
              onChange={(event) => setResidentName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-flat">
              Flat number
            </label>
            <input
              id="noc-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={flatNumber}
              onChange={(event) => setFlatNumber(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="noc-society">
              Society / association name
            </label>
            <input
              id="noc-society"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={societyName}
              onChange={(event) => setSocietyName(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Commitments you can honestly make</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {visibleCommitments.map((item) => (
              <label
                key={item.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`noc-commit-${item.id}`}
              >
                <input
                  id={`noc-commit-${item.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={commitmentIds.includes(item.id)}
                  onChange={() => toggleCommitment(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
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
              Request readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.readinessScore}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.readinessLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the NOC request letter"
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
            <dt className="font-semibold text-[var(--muted-foreground)]">Reply requested by</dt>
            <dd className="mt-1 leading-6">{hasError ? DASH : result.replyByLong}</dd>
          </div>
          {showVaccination ? (
            <div>
              <dt className="font-semibold text-[var(--muted-foreground)]">Anti-rabies booster</dt>
              <dd
                className={`mt-1 leading-6 ${
                  !hasError && result.vaccination?.status === "overdue"
                    ? "text-[var(--danger)]"
                    : !hasError && result.vaccination?.status === "due-soon"
                      ? "text-[var(--warning)]"
                      : "text-[var(--muted-foreground)]"
                }`}
              >
                {hasError ? DASH : result.vaccination?.note}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Still uncovered</dt>
            <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : result.missing.length === 0
                  ? "Nothing — every commitment on the list is covered."
                  : result.missing.join(", ")}
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
        Informational template, not legal advice. The position stated in the letter reflects the
        Animal Welfare Board of India&rsquo;s circular of 26 February 2015 on pets in housing
        societies; municipal registration rules and your society&rsquo;s registered bye-laws also
        apply and differ by city. Consult an advocate before treating a society notice as
        unenforceable.
      </p>
    </main>
  );
}
