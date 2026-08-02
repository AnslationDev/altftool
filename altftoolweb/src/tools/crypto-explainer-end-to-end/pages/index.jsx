"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lock, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  MODIFIERS,
  analyseChannel,
  compareChannels,
  formatAnalysis,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  channel: "whatsapp",
  compareTo: "signal",
  modifiers: { cloudBackup: true, managedDevice: false, deviceShared: false, screenshots: false },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [channel, setChannel] = useState(DEFAULTS.channel);
  const [compareTo, setCompareTo] = useState(DEFAULTS.compareTo);
  const [modifiers, setModifiers] = useState(DEFAULTS.modifiers);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseChannel({ channelId: channel, modifiers }), [channel, modifiers]);
  const comparison = useMemo(
    () => compareChannels(channel, compareTo, modifiers),
    [channel, compareTo, modifiers],
  );
  const summary = useMemo(() => formatAnalysis(result), [result]);
  const hasError = Boolean(result.error);

  const toggleModifier = (id) => setModifiers((current) => ({ ...current, [id]: !current[id] }));

  const reset = () => {
    setChannel(DEFAULTS.channel);
    setCompareTo(DEFAULTS.compareTo);
    setModifiers(DEFAULTS.modifiers);
    setCopied(false);
  };

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Cryptography learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          End-to-End Encryption Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Follow one message along its real path and see, at every hop, who can read the content and
          who can see the metadata. Encrypted in transit and end-to-end encrypted are not the same
          claim, and the difference sits at exactly one hop.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="e2ee-channel">
              How are you sending it?
            </label>
            <select
              id="e2ee-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
            >
              {CHANNELS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="e2ee-compare">
              Compare against
            </label>
            <select
              id="e2ee-compare"
              className={`mt-2 ${INPUT_CLASS}`}
              value={compareTo}
              onChange={(event) => setCompareTo(event.target.value)}
            >
              {CHANNELS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">What else is true?</legend>
          <div className="mt-3 grid gap-2">
            {MODIFIERS.map((modifier) => (
              <label
                key={modifier.id}
                htmlFor={`e2ee-${modifier.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`e2ee-${modifier.id}`}
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={Boolean(modifiers[modifier.id])}
                  onChange={() => toggleModifier(modifier.id)}
                />
                <span className="font-semibold">{modifier.label}</span>
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Third parties who can read the content
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : NUM.format(result.readerCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Pick a channel above."
                : result.readerCount === 0
                  ? "Only you and the person you are talking to."
                  : result.readers.map((hop) => hop.label).join(", ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              aria-label="Copy the hop-by-hop analysis"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy analysis"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the explainer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Protection score", hasError ? "—" : `${result.score}/100 — ${result.band.label}`],
            ["Third parties who see the metadata", hasError ? "—" : NUM.format(result.metadataCount)],
            ["Hops on the path", hasError ? "—" : NUM.format(result.hops.length)],
            ["Protections in place", hasError ? "—" : `${result.earned.length} of ${result.earned.length + result.missing.length}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div className="mt-5">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Protection score ${result.effectiveScore} out of 100${result.bandCapped ? " (capped by endpoint exposure)" : ""}`}
              >
                <span className="block h-full bg-[var(--primary)]" style={{ width: `${result.effectiveScore}%` }} />
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{result.band.advice}</p>
            </div>
            {result.bandCapped && (
              <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                The rating is held down because something can read plaintext at an endpoint. No
                amount of encryption in transit changes that — plaintext has to exist where the
                message is written and read.
              </p>
            )}
            <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              {result.channel.note}
            </p>
          </>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Hop by hop</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[440px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Hop</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Content</th>
                    <th scope="col" className="py-2 font-semibold">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {result.hops.map((hop) => (
                    <tr key={hop.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{hop.label}</td>
                      <td
                        className={`py-2 pr-3 font-semibold ${hop.contentReadable ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
                      >
                        {hop.contentReadable ? "Readable" : "Encrypted"}
                      </td>
                      <td className="py-2">{hop.metadataReadable ? "Visible" : "Hidden"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ol className="mt-5 space-y-3">
              {result.hops.map((hop, index) => (
                <li key={`${hop.id}-detail`} className="flex gap-3 text-sm leading-6">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  <span>
                    <span className="font-semibold">{hop.label}</span>
                    <span className="block text-[var(--muted-foreground)]">{hop.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {!comparison.error && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">What switching would change</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[460px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Channel</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Score</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Content readers</th>
                      <th scope="col" className="py-2 text-right font-semibold">Metadata holders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[comparison.a, comparison.b].map((entry) => (
                      <tr key={entry.channel.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{entry.channel.label}</td>
                        <td className="py-2 pr-3 text-right">{entry.score}</td>
                        <td className="py-2 pr-3 text-right">{NUM.format(entry.readerCount)}</td>
                        <td className="py-2 text-right">{NUM.format(entry.metadataCount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Switching to {comparison.b.channel.label} changes the protection score by{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {comparison.scoreDelta > 0 ? "+" : ""}
                  {comparison.scoreDelta}
                </span>{" "}
                and the number of third parties who can read the content by{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {comparison.readerDelta > 0 ? "+" : ""}
                  {comparison.readerDelta}
                </span>
                .
              </p>
              <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {comparison.b.channel.note}
              </p>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Protections present and missing</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {result.earned.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                  <span>
                    {item.label}
                    <span className="ml-2 text-xs text-[var(--muted-foreground)]">+{item.weight}</span>
                  </span>
                </li>
              ))}
              {result.missing.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-[var(--muted-foreground)]">
                  <span className="mt-1 h-4 w-4 shrink-0 text-center font-bold text-[var(--danger)]" aria-hidden="true">
                    –
                  </span>
                  <span>
                    {item.label} — not available here
                    <span className="ml-2 text-xs">({item.weight} points lost)</span>
                  </span>
                </li>
              ))}
            </ul>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {MODIFIERS.filter((modifier) => modifiers[modifier.id]).map((modifier) => (
                <li key={`${modifier.id}-note`}>
                  <span className="font-semibold text-[var(--foreground)]">{modifier.label}: </span>
                  {modifier.note}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A teaching model of how these systems are documented to work, not an audit of any product.
        Defaults change: verify the current behaviour in the app's own security settings before
        relying on it, and remember that metadata — who you contacted, when, and how often — is
        rarely protected even when the content is.
      </p>
    </main>
  );
}
