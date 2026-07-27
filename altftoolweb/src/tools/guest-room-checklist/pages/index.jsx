"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";
import { SEASONS, buildGuestChecklist } from "../lib";

const DEFAULTS = {
  adults: "2",
  children: "1",
  nights: "4",
  season: "winter",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const num = (value, decimals = 1) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(value);

const quantityText = (entry) =>
  entry.qty === null ? "" : `${num(entry.qty)}${entry.unit ? ` ${entry.unit}` : ""}`;

export default function ToolHome() {
  const [adults, setAdults] = useState(DEFAULTS.adults);
  const [children, setChildren] = useState(DEFAULTS.children);
  const [nights, setNights] = useState(DEFAULTS.nights);
  const [season, setSeason] = useState(DEFAULTS.season);
  const [privateBathroom, setPrivateBathroom] = useState(true);
  const [hasInfant, setHasInfant] = useState(false);
  const [hasElderly, setHasElderly] = useState(false);
  const [working, setWorking] = useState(false);
  const [international, setInternational] = useState(false);
  const [pet, setPet] = useState(false);
  const [done, setDone] = useState({});
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildGuestChecklist({
        adults: toNumber(adults),
        children: toNumber(children),
        nights: toNumber(nights),
        season,
        privateBathroom,
        hasInfant,
        hasElderlyGuest: hasElderly,
        workingGuest: working,
        internationalGuest: international,
        bringingPet: pet,
      }),
    [adults, children, nights, season, privateBathroom, hasInfant, hasElderly, working, international, pet],
  );

  const error = result.error || "";
  const sections = error ? [] : result.sections;
  const summary = error ? null : result.summary;

  const checkedCount = useMemo(() => {
    if (error) return 0;
    return sections.reduce(
      (count, section) =>
        count + section.items.filter((entry) => done[`${section.title}:${entry.label}`]).length,
      0,
    );
  }, [error, sections, done]);

  const toggle = (key) => {
    setDone((current) => ({ ...current, [key]: !current[key] }));
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (error) return "";
    const lines = [
      `Guest room checklist — ${summary.guests} guest(s), ${summary.nights} night(s)`,
      "",
    ];
    for (const section of sections) {
      lines.push(section.title.toUpperCase());
      for (const entry of section.items) {
        const qty = quantityText(entry);
        lines.push(`[ ] ${entry.label}${qty ? ` — ${qty}` : ""}${entry.note ? ` (${entry.note})` : ""}`);
      }
      lines.push("");
    }
    return lines.join("\n").trim();
  }, [error, sections, summary]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAdults(DEFAULTS.adults);
    setChildren(DEFAULTS.children);
    setNights(DEFAULTS.nights);
    setSeason(DEFAULTS.season);
    setPrivateBathroom(true);
    setHasInfant(false);
    setHasElderly(false);
    setWorking(false);
    setInternational(false);
    setPet(false);
    setDone({});
    setCopied(false);
  };

  const toggles = [
    ["guest-private", "Private bathroom", privateBathroom, setPrivateBathroom],
    ["guest-infant", "Travelling with an infant", hasInfant, setHasInfant],
    ["guest-elderly", "An elderly guest", hasElderly, setHasElderly],
    ["guest-work", "Someone will be working", working, setWorking],
    ["guest-intl", "Arriving from abroad", international, setInternational],
    ["guest-pet", "Bringing a pet", pet, setPet],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Hosting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Guest Room Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it who is coming and for how long, and it works out the towel, linen, toiletry and
          water quantities from housekeeping change intervals — then builds the room checklist
          around them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="guest-adults">
              Adults
            </label>
            <input
              id="guest-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={adults}
              onChange={(event) => setAdults(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guest-children">
              Children
            </label>
            <input
              id="guest-children"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={children}
              onChange={(event) => setChildren(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guest-nights">
              Nights they stay
            </label>
            <input
              id="guest-nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={nights}
              onChange={(event) => setNights(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="guest-season">
              Season
            </label>
            <select
              id="guest-season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              {SEASONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {toggles.map(([id, label, value, setter]) => (
            <label key={id} className={CHECK_ROW} htmlFor={id}>
              <input
                id={id}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={value}
                onChange={(event) => setter(event.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Things to get ready
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : summary.totalLines}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : `${checkedCount} ticked off · ${summary.guests} guest(s) across ${summary.beds} bed(s) for ${summary.nights} night(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the guest room checklist"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            ["Bath towels to set out", error ? DASH : summary.bathTowels],
            ["Hand towels", error ? DASH : summary.handTowels],
            ["Bed linen sets", error ? DASH : summary.linenSets],
            ["Pillows", error ? DASH : summary.pillows],
            ["Toilet rolls", error ? DASH : summary.toiletRolls],
            ["Drinking water", error ? DASH : `${num(summary.waterLitres)} litres`],
            ["Hangers", error ? DASH : summary.hangers],
            ["Beds to make", error ? DASH : `${summary.doubleBeds} double, ${summary.singleBeds} single`],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{section.title}</h2>
          <ul className="mt-3 space-y-2">
            {section.items.map((entry) => {
              const key = `${section.title}:${entry.label}`;
              const isDone = Boolean(done[key]);
              return (
                <li key={key}>
                  <label
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    htmlFor={key}
                  >
                    <input
                      id={key}
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                      checked={isDone}
                      onChange={() => toggle(key)}
                    />
                    <span className={isDone ? "text-[var(--muted-foreground)] line-through" : ""}>
                      <span className="font-semibold">{entry.label}</span>
                      {entry.qty === null ? null : (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                          {quantityText(entry)}
                        </span>
                      )}
                      {entry.note ? (
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{entry.note}</span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where the quantities come from</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Towels are counted on a three-night change and bed linen on a four-night change, the
          intervals ordinary housekeeping practice uses, so a four-night stay for three people needs
          six bath towels and two linen sets rather than one of each. Toilet rolls assume one roll per
          person per four days, and drinking water is 2.5 litres per person per day — raise that in
          summer. Everything else is switched on by who is coming: an infant, an elderly guest, a
          shared bathroom or a guest who has to work all change the list.
        </p>
      </section>
    </main>
  );
}
