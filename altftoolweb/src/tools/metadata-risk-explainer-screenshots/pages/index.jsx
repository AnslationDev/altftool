"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, MonitorSmartphone, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  SEVERITY_LABEL,
  assessScreenshotRisk,
  groupedItems,
} from "../lib";

const DEFAULT_SELECTED = [
  "filename-timestamp",
  "status-bar-clock",
  "notifications",
  "desktop-context",
];
const DEFAULT_CHANNEL = "chat";

const GROUPS = groupedItems();

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const severityTone = (severity) => {
  if (severity === "high") return "text-[var(--danger)]";
  if (severity === "medium") return "text-[var(--warning)]";
  return "text-[var(--muted-foreground)]";
};

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [channelId, setChannelId] = useState(DEFAULT_CHANNEL);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const result = useMemo(
    () => assessScreenshotRisk({ selectedIds: selected, channelId }),
    [selected, channelId],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Screenshot metadata risk",
      `Sharing channel: ${result.channel.label}`,
      `Exposure score: ${result.score}/100 (${result.band.label})`,
      `Signals ticked: ${result.selectedCount} — ${result.surviving.length} still reach the recipient, ${result.removed.length} removed in transit`,
      "",
      "Still exposed:",
      ...(result.actions.length
        ? result.actions.map(
            (action) => `- [${SEVERITY_LABEL[action.severity]}] ${action.label} — ${action.fix}`,
          )
        : ["- nothing"]),
    ];
    return lines.join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSelected(DEFAULT_SELECTED);
    setChannelId(DEFAULT_CHANNEL);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MonitorSmartphone className="h-4 w-4" aria-hidden="true" />
          Metadata literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Screenshot Metadata Risk Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what is present in your screenshot, pick where it is going, and see which signals
          survive the trip — filenames, timestamps, status bars and data left behind a crop.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className="block text-sm font-semibold" htmlFor="ss-channel">
          Where will you share it?
        </label>
        <select
          id="ss-channel"
          className={`mt-2 ${SELECT_CLASS}`}
          value={channelId}
          onChange={(event) => {
            setChannelId(event.target.value);
            setCopied(false);
          }}
        >
          {CHANNELS.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.label}
            </option>
          ))}
        </select>
        {!hasError && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.channel.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What is in the screenshot?</h2>
        <div className="mt-4 grid gap-5">
          {GROUPS.map((group) => (
            <fieldset key={group.name} className="border-0 p-0">
              <legend className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {group.name}
              </legend>
              <div className="mt-2 grid gap-2">
                {group.items.map((item) => {
                  const inputId = `ss-item-${item.id}`;
                  return (
                    <div
                      key={item.id}
                      className="flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        className="mt-1 h-5 w-5 flex-none accent-[var(--primary)]"
                        checked={selected.includes(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      <div className="min-w-0">
                        <label
                          className="block text-sm font-semibold leading-6"
                          htmlFor={inputId}
                        >
                          {item.label}{" "}
                          <span className={`text-xs font-medium ${severityTone(item.severity)}`}>
                            · {SEVERITY_LABEL[item.severity]}
                          </span>
                        </label>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.reveals}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </fieldset>
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
              Exposure score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "—" : `${result.band.label} · ${result.band.advice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy screenshot metadata risk summary"
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
            ["Signals ticked", hasError ? "—" : String(result.selectedCount)],
            [
              "Still reaching the recipient",
              hasError ? "—" : `${result.surviving.length} of ${result.selectedCount}`,
            ],
            [
              "Removed by this channel",
              hasError ? "—" : `${result.removed.length} (${result.removedShare}% of the risk weight)`,
            ],
            [
              "High-severity signals left",
              hasError ? "—" : String(result.bySeverity.high),
            ],
            [
              "Weight surviving",
              hasError ? "—" : `${result.survivingWeight} of ${result.maxWeight} catalogue points`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={hasError ? "No score available" : `Exposure score ${result.score} of 100`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: hasError ? "0%" : `${result.score}%` }}
            />
          </div>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fix these before you share</h2>
          {result.actions.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--success)]">
              Nothing you ticked survives this channel.
            </p>
          ) : (
            <ol className="mt-3 grid gap-3">
              {result.actions.map((action) => (
                <li key={action.label} className="text-sm leading-6">
                  <span className={`font-semibold ${severityTone(action.severity)}`}>
                    {SEVERITY_LABEL[action.severity]}
                  </span>{" "}
                  <span className="font-semibold">{action.label}</span>
                  <span className="block text-[var(--muted-foreground)]">{action.fix}</span>
                </li>
              ))}
            </ol>
          )}
          {result.removed.length > 0 && (
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Removed in transit: {result.removed.map((item) => item.label).join(", ")}. Do not rely
              on this — save a clean copy anyway, because a forward or a download can reintroduce the
              original file.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational guidance, not a scan of your file — nothing is uploaded. Platform behaviour
        changes; verify with a metadata viewer on a test upload before trusting any channel to strip
        tags for you.
      </p>
    </main>
  );
}
