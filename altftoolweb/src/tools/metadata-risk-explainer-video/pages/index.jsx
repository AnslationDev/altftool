"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Video } from "lucide-react";

import {
  CHANNELS,
  SIGNALS,
  assessVideoMetadataRisk,
  groupedSignals,
} from "../lib";

const DEFAULT_SELECTED = SIGNALS.filter((signal) => signal.severity !== "low").map(
  (signal) => signal.id,
);
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const BAND_TEXT = {
  none: "text-[var(--success)]",
  low: "text-[var(--primary)]",
  moderate: "text-[var(--warning)]",
  high: "text-[var(--danger)]",
  severe: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [channelId, setChannelId] = useState("chat");
  const [copied, setCopied] = useState(false);
  const groups = useMemo(() => groupedSignals(), []);
  const result = useMemo(
    () => assessVideoMetadataRisk({ selectedIds: selected, channelId }),
    [selected, channelId],
  );
  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setSelected(DEFAULT_SELECTED);
    setChannelId("chat");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Video metadata privacy check",
      `Channel: ${result.channel.label}`,
      `Exposure score: ${result.score}/100 (${result.band.label})`,
      `Selected signals: ${result.selectedCount}`,
      `Surviving signals: ${result.surviving.length}`,
      "",
      ...result.actions.map((action) => `- [${action.severity}] ${action.label}: ${action.fix}`),
    ].join("\n");
  }, [hasError, result]);

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
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Video className="h-4 w-4" aria-hidden="true" />
          Video privacy
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          What Your Video Metadata Reveals
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Model the privacy traces inside MP4 and QuickTime videos: capture time, GPS,
          device model, filenames, thumbnails, subtitles, voices, reflections and location clues.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={CARD}>
          <label>
            <span className={LABEL_CLASS}>Sharing channel</span>
            <select
              className={`${SELECT_CLASS} mt-2`}
              value={channelId}
              onChange={(event) => setChannelId(event.target.value)}
            >
              {CHANNELS.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.label}
                </option>
              ))}
            </select>
          </label>
          {!hasError ? (
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.channel.note}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={BTN} onClick={() => setSelected(SIGNALS.map((signal) => signal.id))}>
              Select all
            </button>
            <button type="button" className={BTN} onClick={() => setSelected([])}>
              Clear
            </button>
            <button type="button" className={BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {groups.map((group) => (
              <fieldset key={group.name} className="rounded-lg border border-[var(--border)] p-4">
                <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
                  {group.name}
                </legend>
                <div className="mt-3 grid gap-3">
                  {group.items.map((signal) => (
                    <label
                      key={signal.id}
                      className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-[var(--primary)]"
                        checked={selected.includes(signal.id)}
                        onChange={() => toggle(signal.id)}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--foreground)]">
                          {signal.label}
                          <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--primary)]">
                            {signal.severity}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {signal.reveals}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          {hasError ? (
            <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {result.error}
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Exposure score
              </p>
              <p className={`mt-2 text-5xl font-bold ${BAND_TEXT[result.band.id] || "text-[var(--primary)]"}`}>
                {result.score}
                <span className="text-lg text-[var(--muted-foreground)]">/100</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                {result.band.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.band.advice}
              </p>

              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                  <strong className="text-[var(--foreground)]">{result.surviving.length}</strong>{" "}
                  selected signals survive this sharing channel.
                </div>
                {result.actions.slice(0, 5).map((action) => (
                  <div key={action.label} className="rounded-lg bg-[var(--background)] p-3 text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                    <p className="font-semibold text-[var(--foreground)]">{action.label}</p>
                    <p className="mt-1 text-xs leading-5">{action.fix}</p>
                  </div>
                ))}
              </div>

              <button type="button" className={`${PRIMARY_BTN} mt-5 w-full`} onClick={copySummary}>
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy summary"}
              </button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
