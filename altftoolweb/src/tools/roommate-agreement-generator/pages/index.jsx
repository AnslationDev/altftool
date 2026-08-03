"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  CHORE_PRESETS,
  DEFAULT_NOTICE_DAYS,
  MAX_DEPOSIT_MONTHS_RESIDENTIAL,
  MAX_OCCUPANTS,
  MIN_OCCUPANTS,
  SPLIT_METHODS,
  buildAgreement,
  buildChoreRotation,
  splitCosts,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(Number(value)) ? Number(value) : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_OCCUPANTS = [
  { id: 1, name: "Asha", weight: "120" },
  { id: 2, name: "Rohit", weight: "110" },
  { id: 3, name: "Meera", weight: "90" },
];

const DEFAULTS = {
  address: "Flat 3B, Palm Grove Residency, 12th Main",
  city: "Bengaluru",
  rent: "45000",
  utilities: "6000",
  deposit: "90000",
  method: "equal",
  startDate: "2026-09-01",
  agreementDate: "2026-08-20",
  termMonths: "11",
  noticeDays: String(DEFAULT_NOTICE_DAYS),
  guestNights: "3",
  quietFrom: "22:00",
  quietTo: "07:00",
  rotationWeeks: "4",
};

const EM_DASH = "—";

export default function ToolHome() {
  const [address, setAddress] = useState(DEFAULTS.address);
  const [city, setCity] = useState(DEFAULTS.city);
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [utilities, setUtilities] = useState(DEFAULTS.utilities);
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [occupants, setOccupants] = useState(DEFAULT_OCCUPANTS);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [agreementDate, setAgreementDate] = useState(DEFAULTS.agreementDate);
  const [termMonths, setTermMonths] = useState(DEFAULTS.termMonths);
  const [noticeDays, setNoticeDays] = useState(DEFAULTS.noticeDays);
  const [guestNights, setGuestNights] = useState(DEFAULTS.guestNights);
  const [quietFrom, setQuietFrom] = useState(DEFAULTS.quietFrom);
  const [quietTo, setQuietTo] = useState(DEFAULTS.quietTo);
  const [rotationWeeks, setRotationWeeks] = useState(DEFAULTS.rotationWeeks);
  const [chores, setChores] = useState(CHORE_PRESETS.slice(0, 3));
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const split = useMemo(
    () =>
      splitCosts({
        monthlyRent: Number(rent),
        monthlyUtilities: Number(utilities),
        securityDeposit: Number(deposit),
        occupants: occupants.map((person) => ({
          name: person.name,
          weight: Number(person.weight),
        })),
        method,
      }),
    [rent, utilities, deposit, occupants, method],
  );

  const agreement = useMemo(
    () =>
      buildAgreement({
        propertyAddress: address,
        city,
        startDate,
        termMonths: Number(termMonths),
        agreementDate,
        noticeDays: Number(noticeDays),
        guestNights: Number(guestNights),
        quietFrom,
        quietTo,
        petsAllowed,
        smokingAllowed,
        chores,
        rotationWeeks: Number(rotationWeeks),
        split,
        currencyFormatter: money,
      }),
    [
      address,
      city,
      startDate,
      termMonths,
      agreementDate,
      noticeDays,
      guestNights,
      quietFrom,
      quietTo,
      petsAllowed,
      smokingAllowed,
      chores,
      rotationWeeks,
      split,
    ],
  );

  const rotation = useMemo(
    () =>
      split.error
        ? { error: split.error }
        : buildChoreRotation({
            occupants: split.rows,
            chores,
            weeks: Number(rotationWeeks),
          }),
    [split, chores, rotationWeeks],
  );

  const error = split.error || agreement.error || "";
  const ok = !error;

  const updateOccupant = (id, field, value) => {
    setOccupants((list) =>
      list.map((person) => (person.id === id ? { ...person, [field]: value } : person)),
    );
  };

  const addOccupant = () => {
    setOccupants((list) => {
      if (list.length >= MAX_OCCUPANTS) return list;
      const nextId = list.reduce((max, person) => Math.max(max, person.id), 0) + 1;
      return [...list, { id: nextId, name: `Flatmate ${list.length + 1}`, weight: "100" }];
    });
  };

  const removeOccupant = (id) => {
    setOccupants((list) => (list.length <= MIN_OCCUPANTS ? list : list.filter((p) => p.id !== id)));
  };

  const toggleChore = (chore) => {
    setChores((list) => (list.includes(chore) ? list.filter((c) => c !== chore) : [...list, chore]));
  };

  const copyResult = () => {
    if (!ok) return;
    copy("agreement", agreement.text, { label: "roommate agreement" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace the address, dates, flatmates, chores and house rules with the demo example values and cannot be undone.",
      )
    ) {
      return;
    }
    setAddress(DEFAULTS.address);
    setCity(DEFAULTS.city);
    setRent(DEFAULTS.rent);
    setUtilities(DEFAULTS.utilities);
    setDeposit(DEFAULTS.deposit);
    setMethod(DEFAULTS.method);
    setOccupants(DEFAULT_OCCUPANTS);
    setStartDate(DEFAULTS.startDate);
    setAgreementDate(DEFAULTS.agreementDate);
    setTermMonths(DEFAULTS.termMonths);
    setNoticeDays(DEFAULTS.noticeDays);
    setGuestNights(DEFAULTS.guestNights);
    setQuietFrom(DEFAULTS.quietFrom);
    setQuietTo(DEFAULTS.quietTo);
    setRotationWeeks(DEFAULTS.rotationWeeks);
    setChores(CHORE_PRESETS.slice(0, 3));
    setPetsAllowed(false);
    setSmokingAllowed(false);
    resetCopyState();
  };

  const weightLabel =
    method === "room" ? "Room area (sq ft)" : method === "custom" ? "Share (%)" : "Share";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Flat share
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Roommate Agreement Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split rent, utilities and the security deposit between flatmates, build a chore rotation,
          and generate a written agreement covering guests, quiet hours, notice and exit.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The flat</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rm-address">
              Flat address
            </label>
            <input
              id="rm-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-city">
              City
            </label>
            <input
              id="rm-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-term">
              Term (months)
            </label>
            <input
              id="rm-term"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              value={termMonths}
              onChange={(event) => setTermMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-start">
              Move-in date
            </label>
            <input
              id="rm-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-signed">
              Agreement date
            </label>
            <input
              id="rm-signed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={agreementDate}
              onChange={(event) => setAgreementDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-rent">
              Total monthly rent (INR)
            </label>
            <input
              id="rm-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={rent}
              onChange={(event) => setRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-utilities">
              Monthly utilities (INR)
            </label>
            <input
              id="rm-utilities"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={utilities}
              onChange={(event) => setUtilities(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-deposit">
              Total security deposit (INR)
            </label>
            <input
              id="rm-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-method">
              Split method
            </label>
            <select
              id="rm-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {SPLIT_METHODS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {SPLIT_METHODS.find((option) => option.id === method)?.hint}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Flatmates</h2>
          <button
            type="button"
            onClick={addOccupant}
            className={GHOST_BTN}
            aria-label="Add another flatmate"
            disabled={occupants.length >= MAX_OCCUPANTS}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add flatmate
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {occupants.map((person, index) => (
            <div key={person.id} className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`rm-name-${person.id}`}>
                  Flatmate {index + 1} name
                </label>
                <input
                  id={`rm-name-${person.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={person.name}
                  onChange={(event) => updateOccupant(person.id, "name", event.target.value)}
                />
              </div>
              <div className={method === "equal" ? "hidden" : ""}>
                <label className={LABEL_CLASS} htmlFor={`rm-weight-${person.id}`}>
                  {weightLabel}
                </label>
                <input
                  id={`rm-weight-${person.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={person.weight}
                  onChange={(event) => updateOccupant(person.id, "weight", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeOccupant(person.id)}
                className={GHOST_BTN}
                aria-label={`Remove ${person.name || `flatmate ${index + 1}`}`}
                disabled={occupants.length <= MIN_OCCUPANTS}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">House rules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-notice">
              Notice to leave (days)
            </label>
            <input
              id="rm-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              value={noticeDays}
              onChange={(event) => setNoticeDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-guest">
              Guest nights without consent
            </label>
            <input
              id="rm-guest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="31"
              value={guestNights}
              onChange={(event) => setGuestNights(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-quiet-from">
              Quiet hours start
            </label>
            <input
              id="rm-quiet-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={quietFrom}
              onChange={(event) => setQuietFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-quiet-to">
              Quiet hours end
            </label>
            <input
              id="rm-quiet-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={quietTo}
              onChange={(event) => setQuietTo(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rm-rotation">
              Chore rotation length (weeks)
            </label>
            <input
              id="rm-rotation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              value={rotationWeeks}
              onChange={(event) => setRotationWeeks(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex min-h-11 items-center gap-2 text-sm font-medium" htmlFor="rm-pets">
              <input
                id="rm-pets"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={petsAllowed}
                onChange={(event) => setPetsAllowed(event.target.checked)}
              />
              Pets allowed
            </label>
            <label
              className="flex min-h-11 items-center gap-2 text-sm font-medium"
              htmlFor="rm-smoking"
            >
              <input
                id="rm-smoking"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={smokingAllowed}
                onChange={(event) => setSmokingAllowed(event.target.checked)}
              />
              Smoking allowed (balcony only)
            </label>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Chores in the rotation</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHORE_PRESETS.map((chore) => {
              const active = chores.includes(chore);
              return (
                <button
                  key={chore}
                  type="button"
                  onClick={() => toggleChore(chore)}
                  aria-pressed={active}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {chore}
                </button>
              );
            })}
          </div>
        </fieldset>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total monthly cost per flat
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(split.totals.monthly) : EM_DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${split.rows.length} flatmates · rent ${money(split.totals.rent)} + utilities ${money(
                    split.totals.utilities,
                  )}`
                : "Fix the highlighted problem to see the split."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("agreement") ? "Copied the roommate agreement to clipboard" : "Copy the roommate agreement text"}
              className={GHOST_BTN}
              disabled={!ok}
            >
              {isCopied("agreement") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("agreement") ? "Copied!" : "Copy agreement"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total rent", ok ? money(split.totals.rent) : EM_DASH],
            ["Total utilities", ok ? money(split.totals.utilities) : EM_DASH],
            ["Total security deposit", ok ? money(split.totals.deposit) : EM_DASH],
            [
              "Deposit in months of rent",
              ok ? `${split.depositMonths} months` : EM_DASH,
            ],
            ["Agreement ends", ok ? agreement.endDate : EM_DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div aria-live="polite" role="status">
          {ok && split.depositExceedsCap ? (
            <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              The deposit is {split.depositMonths} months of rent. The Model Tenancy Act, 2021 caps a
              residential security deposit at {MAX_DEPOSIT_MONTHS_RESIDENTIAL} months in states that
              have adopted it — check your state&apos;s rent law.
            </p>
          ) : null}
        </div>

        {ok ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Flatmate
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Rent
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Utilities
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Deposit
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Monthly
                  </th>
                </tr>
              </thead>
              <tbody>
                {split.rows.map((row, index) => (
                  <tr key={`${row.name}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.name}
                      <span className="ml-1 font-normal text-[var(--muted-foreground)]">
                        ({row.sharePct}%)
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.rent)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.utilities)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.deposit)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.monthlyTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {ok && !rotation.error ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Chore rotation</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Week
                  </th>
                  {rotation.chores.map((chore) => (
                    <th key={chore} scope="col" className="py-2 pr-3 font-semibold">
                      {chore}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rotation.rows.map((row) => (
                  <tr key={row.week} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.week}</td>
                    {row.assignments.map((item) => (
                      <td key={item.chore} className="py-2 pr-3">
                        {item.name}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Agreement text</h2>
          <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)]">
            {agreement.text}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
