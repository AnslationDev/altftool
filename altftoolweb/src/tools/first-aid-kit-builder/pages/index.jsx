"use client";

import { useMemo, useState } from "react";
import { BriefcaseMedical, Check, Copy, RotateCcw } from "lucide-react";

import {
  KIT_CHECK_INTERVAL_MONTHS,
  KIT_PROFILES,
  REMOTENESS_LEVELS,
  buildFirstAidKit,
  kitToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const KG = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULT_PROFILE = KIT_PROFILES[0];

const todayIso = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export default function ToolHome() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE.id);
  const [people, setPeople] = useState(String(DEFAULT_PROFILE.people));
  const [days, setDays] = useState(String(DEFAULT_PROFILE.days));
  const [remoteness, setRemoteness] = useState(DEFAULT_PROFILE.remoteness);
  const [includeChildren, setIncludeChildren] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(todayIso);
  const [packed, setPacked] = useState({});
  const [copied, setCopied] = useState(false);

  const applyProfile = (id) => {
    const preset = KIT_PROFILES.find((entry) => entry.id === id);
    setProfile(id);
    if (preset) {
      setPeople(String(preset.people));
      setDays(String(preset.days));
      setRemoteness(preset.remoteness);
    }
    setPacked({});
  };

  const kit = useMemo(
    () =>
      buildFirstAidKit({
        profile,
        people: Number(people),
        days: Number(days),
        remoteness,
        includeChildren,
        purchaseDate,
      }),
    [profile, people, days, remoteness, includeChildren, purchaseDate],
  );

  const hasResult = !kit.error;
  const packedCount = hasResult ? kit.items.filter((item) => packed[item.id]).length : 0;

  const togglePacked = (id) => {
    setPacked((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const copyList = async () => {
    if (!hasResult) return;
    try {
      await navigator.clipboard.writeText(kitToText(kit));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    applyProfile(DEFAULT_PROFILE.id);
    setIncludeChildren(false);
    setPurchaseDate(todayIso());
    setPacked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BriefcaseMedical className="h-4 w-4" aria-hidden="true" />
          First aid
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">First Aid Kit Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick where the kit lives, how many people it covers and how far you are from help. The
          list scales the consumables and, for workplace kits, holds every item at the ANSI/ISEA
          Z308.1 Class A minimum.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fak-profile">
              Kit type
            </label>
            <select
              id="fak-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profile}
              onChange={(event) => applyProfile(event.target.value)}
            >
              {KIT_PROFILES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fak-remoteness">
              Distance from professional help
            </label>
            <select
              id="fak-remoteness"
              className={`mt-2 ${INPUT_CLASS}`}
              value={remoteness}
              onChange={(event) => setRemoteness(event.target.value)}
            >
              {REMOTENESS_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fak-people">
              People covered
            </label>
            <input
              id="fak-people"
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={people}
              onChange={(event) => setPeople(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fak-days">
              Days of coverage before restock
            </label>
            <input
              id="fak-days"
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fak-purchase">
              Packed or bought on
            </label>
            <input
              id="fak-purchase"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold"
              htmlFor="fak-children"
            >
              <input
                id="fak-children"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeChildren}
                onChange={(event) => setIncludeChildren(event.target.checked)}
              />
              Children are covered
            </label>
          </div>
        </div>
      </section>

      {kit.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {kit.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Items to stock
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? NUM.format(kit.lineCount) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasResult
                ? `${NUM.format(kit.totalUnits)} units, about ${KG.format(kit.totalWeightG / 1000)} kg packed`
                : "Fix the error above to see the list."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyList}
              disabled={!hasResult}
              aria-label="Copy the first aid kit checklist"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the kit builder" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Kit type", hasResult ? kit.profile : DASH],
            ["People covered", hasResult ? NUM.format(kit.people) : DASH],
            ["Days of coverage", hasResult ? NUM.format(kit.days) : DASH],
            ["Consumable multiplier", hasResult ? `${kit.consumableFactor.toFixed(2)}×` : DASH],
            ["Kits recommended", hasResult ? NUM.format(kit.kitsRequired) : DASH],
            ["ANSI Class A floor applied", hasResult ? (kit.appliedAnsiFloor ? "Yes" : "No") : DASH],
            ["Shortest shelf life", hasResult && kit.shortestShelfLifeMonths ? `${kit.shortestShelfLifeMonths} months` : DASH],
            ["First item to expire", hasResult && kit.firstReplaceBy ? kit.firstReplaceBy : DASH],
            [
              "Next kit check",
              hasResult && kit.nextCheckDate ? `${kit.nextCheckDate} (${KIT_CHECK_INTERVAL_MONTHS} months)` : DASH,
            ],
            ["Packed so far", hasResult ? `${packedCount} of ${kit.lineCount}` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasResult && kit.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {kit.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {hasResult &&
        kit.groups.map((group) => (
          <section key={group.category} className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">{group.category}</h2>
            <ul className="mt-3 divide-y divide-[var(--border)]">
              {group.items.map((item) => (
                <li key={item.id} className="py-2">
                  <label
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                    htmlFor={`fak-item-${item.id}`}
                  >
                    <input
                      id={`fak-item-${item.id}`}
                      type="checkbox"
                      className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={Boolean(packed[item.id])}
                      onChange={() => togglePacked(item.id)}
                    />
                    <span className="flex-1">
                      <span className={packed[item.id] ? "line-through opacity-60" : ""}>{item.name}</span>
                      {item.meetsAnsiFloor && (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                          ANSI min {item.ansiFloor}
                        </span>
                      )}
                      {item.replaceBy && (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          Replace by {item.replaceBy}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-right font-semibold">
                      {NUM.format(item.quantity)} {item.unit}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning list only. Stocking a kit is not the same as knowing how to use it —
        take a certified first aid course, follow the label for any medicine, and check local rules
        before adding prescription items or a tourniquet to a workplace kit.
      </p>
    </main>
  );
}
