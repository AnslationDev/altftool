"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PackageOpen, RotateCcw } from "lucide-react";

import {
  DECISION_METHODS,
  DEFAULT_SECONDS_PER_ITEM,
  DEFAULT_SESSION_MINUTES,
  ROOM_PRESETS,
  TONES,
  buildDeclutterPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FIRST_ROOM = ROOM_PRESETS[0];
const DASH = "—";

const DEFAULTS = {
  roomId: FIRST_ROOM.id,
  roomLabel: FIRST_ROOM.label,
  zonesText: FIRST_ROOM.zones.join("\n"),
  itemCount: String(FIRST_ROOM.items),
  methodId: "four-box",
  secondsPerItem: String(DEFAULT_SECONDS_PER_ITEM),
  sessionMinutes: String(DEFAULT_SESSION_MINUTES),
  toneId: "neutral",
  constraints: "",
  includeDisposal: true,
};

export default function ToolHome() {
  const [roomId, setRoomId] = useState(DEFAULTS.roomId);
  const [roomLabel, setRoomLabel] = useState(DEFAULTS.roomLabel);
  const [zonesText, setZonesText] = useState(DEFAULTS.zonesText);
  const [itemCount, setItemCount] = useState(DEFAULTS.itemCount);
  const [methodId, setMethodId] = useState(DEFAULTS.methodId);
  const [secondsPerItem, setSecondsPerItem] = useState(DEFAULTS.secondsPerItem);
  const [sessionMinutes, setSessionMinutes] = useState(DEFAULTS.sessionMinutes);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [constraints, setConstraints] = useState(DEFAULTS.constraints);
  const [includeDisposal, setIncludeDisposal] = useState(DEFAULTS.includeDisposal);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildDeclutterPrompt({
        roomLabel,
        methodId,
        zones: zonesText.split("\n"),
        itemCount: itemCount.trim() === "" ? Number.NaN : Number(itemCount),
        secondsPerItem: secondsPerItem.trim() === "" ? Number.NaN : Number(secondsPerItem),
        sessionMinutes: sessionMinutes.trim() === "" ? Number.NaN : Number(sessionMinutes),
        toneId,
        constraints,
        includeDisposal,
      }),
    [
      roomLabel,
      methodId,
      zonesText,
      itemCount,
      secondsPerItem,
      sessionMinutes,
      toneId,
      constraints,
      includeDisposal,
    ],
  );

  const hasError = Boolean(result.error);

  const applyRoom = (id) => {
    const preset = ROOM_PRESETS.find((entry) => entry.id === id);
    setRoomId(id);
    if (preset) {
      setRoomLabel(preset.label);
      setZonesText(preset.zones.join("\n"));
      setItemCount(String(preset.items));
    }
  };

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRoomId(DEFAULTS.roomId);
    setRoomLabel(DEFAULTS.roomLabel);
    setZonesText(DEFAULTS.zonesText);
    setItemCount(DEFAULTS.itemCount);
    setMethodId(DEFAULTS.methodId);
    setSecondsPerItem(DEFAULTS.secondsPerItem);
    setSessionMinutes(DEFAULTS.sessionMinutes);
    setToneId(DEFAULTS.toneId);
    setConstraints(DEFAULTS.constraints);
    setIncludeDisposal(DEFAULTS.includeDisposal);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Sessions needed", DASH],
        ["Items per session", DASH],
        ["Total hands-on time", DASH],
        ["Zones in the plan", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Sessions needed", `${NUM.format(result.plan.sessions)}`],
        ["Items per session", NUM.format(result.plan.itemsPerSession)],
        ["Total hands-on time", `${NUM.format(result.plan.totalMinutes)} min`],
        ["Zones in the plan", NUM.format(result.plan.zones)],
        ["Minutes per zone", `${NUM.format(result.plan.minutesPerZone)} min`],
        ["Decision rule", result.method.label],
        ["Prompt length", `${NUM.format(result.characters)} characters`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PackageOpen className="h-4 w-4" aria-hidden="true" />
          Keep or let go
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Decluttering Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a room, a decision rule and how long you can work for. You get a zone-by-zone prompt
          to paste into any AI assistant, plus a session plan sized to the number of items.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-room">
              Room preset
            </label>
            <select
              id="dc-room"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roomId}
              onChange={(event) => applyRoom(event.target.value)}
            >
              {ROOM_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-label">
              Space as you would describe it
            </label>
            <input
              id="dc-label"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={roomLabel}
              onChange={(event) => setRoomLabel(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dc-zones">
              Zones, in the order you will work through them (one per line)
            </label>
            <textarea
              id="dc-zones"
              rows={5}
              className={`mt-2 ${AREA_CLASS}`}
              value={zonesText}
              onChange={(event) => setZonesText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-items">
              Items you expect to review
            </label>
            <input
              id="dc-items"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={itemCount}
              onChange={(event) => setItemCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-method">
              Decision rule
            </label>
            <select
              id="dc-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={methodId}
              onChange={(event) => setMethodId(event.target.value)}
            >
              {DECISION_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label} — {method.short}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-seconds">
              Seconds per decision
            </label>
            <input
              id="dc-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={secondsPerItem}
              onChange={(event) => setSecondsPerItem(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-session">
              Session length (minutes)
            </label>
            <input
              id="dc-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-tone">
              Tone
            </label>
            <select
              id="dc-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dc-constraints">
              Constraints (optional)
            </label>
            <textarea
              id="dc-constraints"
              rows={3}
              className={`mt-2 ${AREA_CLASS}`}
              placeholder="Shared flat, nothing of my partner's, no car so donations must be walkable…"
              value={constraints}
              onChange={(event) => setConstraints(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="dc-disposal"
        >
          <input
            id="dc-disposal"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={includeDisposal}
            onChange={(event) => setIncludeDisposal(event.target.checked)}
          />
          Ask for a disposal route for every discard pile
        </label>
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
              Sessions to clear the space
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.plan.sessions)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `${NUM.format(result.plan.itemsPerSession)} items in each ${sessionMinutes}-minute block.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the decluttering prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-full whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 20/20 and 90/90 rules come from The Minimalists; the category order comes from Marie
        Kondo&apos;s KonMari method. Timings are planning estimates — adjust the seconds-per-decision
        figure after your first real session.
      </p>
    </main>
  );
}
