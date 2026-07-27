"use client";

import { useMemo, useState } from "react";
import { Bed, Check, Copy, RotateCcw } from "lucide-react";

import {
  POSITION_BASE_FIRMNESS,
  SIDE_CLEARANCE_CM,
  WIDTH_PER_ADULT_COMFORT_CM,
  recommendMattress,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const cm = (value) => (Number.isFinite(value) ? `${NUM.format(value)} cm` : DASH);

const DEFAULTS = {
  sleepers: "2",
  height: "175",
  weight: "75",
  position: "side",
  children: "0",
  pet: false,
  roomWidth: "320",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const POSITION_OPTIONS = Object.entries(POSITION_BASE_FIRMNESS).map(([id, item]) => ({
  id,
  label: item.label,
}));

export default function ToolHome() {
  const [sleepers, setSleepers] = useState(DEFAULTS.sleepers);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [position, setPosition] = useState(DEFAULTS.position);
  const [children, setChildren] = useState(DEFAULTS.children);
  const [pet, setPet] = useState(DEFAULTS.pet);
  const [roomWidth, setRoomWidth] = useState(DEFAULTS.roomWidth);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      recommendMattress({
        sleepers: sleepers.trim() === "" ? NaN : Number(sleepers),
        tallestHeightCm: height.trim() === "" ? NaN : Number(height),
        heaviestWeightKg: weight.trim() === "" ? NaN : Number(weight),
        position,
        children: children.trim() === "" ? NaN : Number(children),
        pet,
        roomWidthCm: roomWidth.trim() === "" ? null : roomWidth,
      }),
    [sleepers, height, weight, position, children, pet, roomWidth],
  );

  const error = result.error || null;
  const chosen = error ? null : result.chosen;

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Mattress Size Selector",
      `Sleepers: ${sleepers} adult(s), tallest ${height} cm, heaviest ${weight} kg`,
      `Sleeping position: ${result.positionLabel}`,
      chosen
        ? `Recommended size: ${chosen.label} — ${NUM.format(chosen.widthCm)} x ${NUM.format(chosen.lengthCm)} cm (${chosen.widthIn} x ${chosen.lengthIn} in)`
        : "Recommended size: no standard size fits — custom mattress needed",
      chosen ? `Width per sleeper: ${NUM.format(result.perSleeperWidthCm)} cm` : "",
      `Recommended thickness: ${result.thicknessMinCm}-${result.thicknessMaxCm} cm`,
      `Recommended firmness: ${result.firmnessLabel} (${NUM.format(result.firmnessScore)} on 1-10)`,
      `Minimum length needed: ${NUM.format(result.minLengthCm)} cm`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [error, result, chosen, sleepers, height, weight]);

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
    setSleepers(DEFAULTS.sleepers);
    setHeight(DEFAULTS.height);
    setWeight(DEFAULTS.weight);
    setPosition(DEFAULTS.position);
    setChildren(DEFAULTS.children);
    setPet(DEFAULTS.pet);
    setRoomWidth(DEFAULTS.roomWidth);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Bed className="h-4 w-4" aria-hidden="true" />
          Mattress fit
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Mattress Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter who sleeps on the bed and how they sleep. You get the smallest standard size that
          still gives {WIDTH_PER_ADULT_COMFORT_CM} cm of width per adult, plus a thickness band and a
          firmness rating.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-sleepers">
              Adults sharing the bed
            </label>
            <select
              id="ms-sleepers"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sleepers}
              onChange={(event) => setSleepers(event.target.value)}
            >
              <option value="1">1 adult</option>
              <option value="2">2 adults</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-position">
              Main sleeping position
            </label>
            <select
              id="ms-position"
              className={`mt-2 ${INPUT_CLASS}`}
              value={position}
              onChange={(event) => setPosition(event.target.value)}
            >
              {POSITION_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-height">
              Tallest sleeper height (cm)
            </label>
            <input
              id="ms-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="250"
              step="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-weight">
              Heaviest sleeper weight (kg)
            </label>
            <input
              id="ms-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="250"
              step="1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-children">
              Co-sleeping children
            </label>
            <select
              id="ms-children"
              className={`mt-2 ${INPUT_CLASS}`}
              value={children}
              onChange={(event) => setChildren(event.target.value)}
            >
              <option value="0">None</option>
              <option value="1">1 child</option>
              <option value="2">2 children</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-room">
              Room width (cm, optional)
            </label>
            <input
              id="ms-room"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={roomWidth}
              onChange={(event) => setRoomWidth(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
          htmlFor="ms-pet"
        >
          <input
            id="ms-pet"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={pet}
            onChange={(event) => setPet(event.target.checked)}
          />
          A pet sleeps on the bed
        </label>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Recommended mattress
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error || !chosen ? DASH : chosen.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error || !chosen
                ? DASH
                : `${NUM.format(chosen.widthCm)} × ${NUM.format(chosen.lengthCm)} cm · ${chosen.widthIn} × ${chosen.lengthIn} in`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy mattress recommendation"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Thickness band",
              error ? DASH : `${result.thicknessMinCm}–${result.thicknessMaxCm} cm`,
            ],
            [
              "Firmness",
              error ? DASH : `${result.firmnessLabel} · ${NUM.format(result.firmnessScore)} on 1–10`,
            ],
            ["Width per adult in this size", error || !chosen ? DASH : cm(result.perSleeperWidthCm)],
            ["Spare length above the tallest sleeper", error || !chosen ? DASH : cm(result.legroomCm)],
            ["Minimum length you need", error ? DASH : cm(result.minLengthCm)],
            ["Comfortable width you need", error ? DASH : cm(result.comfortWidthCm)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.positionWhy} {result.thicknessNote}
          </p>
        ) : null}

        {!error && result.notes.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {!error && result.roomCheck ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Room width check</h2>
          {result.roomCheck.error ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {result.roomCheck.error}
            </p>
          ) : (
            <>
              <p
                className={`mt-3 text-sm font-semibold ${result.roomCheck.hasWalkway ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
              >
                {result.roomCheck.fits
                  ? result.roomCheck.hasWalkway
                    ? `Fits with ${NUM.format(result.roomCheck.eachSideCm)} cm of walkway on each side.`
                    : `Fits, but only ${NUM.format(result.roomCheck.eachSideCm)} cm per side — below the ${SIDE_CLEARANCE_CM} cm walkway minimum.`
                  : "This mattress is wider than the room you entered."}
              </p>
              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Room width entered", cm(result.roomCheck.roomWidthCm)],
                  ["Floor left over", cm(result.roomCheck.spareCm)],
                  ["Walkway on each side", cm(result.roomCheck.eachSideCm)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational sizing guidance only. Firmness feel varies between brands even at the same
        stated rating, and any persistent back, hip or shoulder pain should be discussed with a
        doctor or physiotherapist rather than solved by a mattress alone.
      </p>
    </main>
  );
}
