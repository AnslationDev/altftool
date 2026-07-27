"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";

import {
  AMENITY_ADJUSTMENTS,
  DEFAULT_COMMON_SHARE_PERCENT,
  MAX_OCCUPANTS_PER_ROOM,
  MAX_ROOMS,
  splitSharedRent,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const DEFAULT_ROOMS = [
  { id: 1, name: "Master bedroom", areaSqft: "200", occupants: "1", amenities: { attachedBathroom: true, airConditioning: true } },
  { id: 2, name: "Middle bedroom", areaSqft: "150", occupants: "1", amenities: { balcony: true } },
  { id: 3, name: "Small bedroom", areaSqft: "120", occupants: "2", amenities: {} },
];

const DEFAULTS = {
  totalRent: "60000",
  sharedBills: "6000",
  commonSharePercent: String(DEFAULT_COMMON_SHARE_PERCENT),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [totalRent, setTotalRent] = useState(DEFAULTS.totalRent);
  const [sharedBills, setSharedBills] = useState(DEFAULTS.sharedBills);
  const [commonSharePercent, setCommonSharePercent] = useState(DEFAULTS.commonSharePercent);
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [copied, setCopied] = useState(false);

  const updateRoom = (id, patch) => {
    setRooms((previous) =>
      previous.map((room) => (room.id === id ? { ...room, ...patch } : room)),
    );
  };

  const toggleAmenity = (id, key) => {
    setRooms((previous) =>
      previous.map((room) =>
        room.id === id
          ? { ...room, amenities: { ...room.amenities, [key]: !room.amenities[key] } }
          : room,
      ),
    );
  };

  const addRoom = () => {
    setRooms((previous) => {
      if (previous.length >= MAX_ROOMS) return previous;
      // Derive the next id from the list itself, never from a ref.
      const nextId = previous.reduce((highest, room) => Math.max(highest, room.id), 0) + 1;
      return [
        ...previous,
        { id: nextId, name: `Room ${previous.length + 1}`, areaSqft: "120", occupants: "1", amenities: {} },
      ];
    });
  };

  const removeRoom = (id) => {
    setRooms((previous) => (previous.length <= 1 ? previous : previous.filter((room) => room.id !== id)));
  };

  const result = useMemo(() => {
    const rent = toNumber(totalRent);
    const bills = toNumber(sharedBills);
    const common = toNumber(commonSharePercent);

    if ([rent, bills, common].some((value) => Number.isNaN(value))) {
      return { error: "Enter the total rent, shared bills and common-area share as numbers." };
    }

    const parsedRooms = rooms.map((room) => ({
      name: room.name.trim() || "Room",
      areaSqft: toNumber(room.areaSqft),
      occupants: Math.round(toNumber(room.occupants)),
      amenities: room.amenities,
    }));

    if (parsedRooms.some((room) => Number.isNaN(room.areaSqft) || Number.isNaN(room.occupants))) {
      return { error: "Every room needs a floor area and a number of occupants." };
    }

    return splitSharedRent({
      totalRent: rent,
      sharedBills: bills,
      commonSharePercent: common,
      rooms: parsedRooms,
    });
  }, [totalRent, sharedBills, commonSharePercent, rooms]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Shared flat rent split",
      `Rent ${money(result.totalRent)} plus bills ${money(result.sharedBills)} across ${result.totalPeople} people`,
      `Common-area share charged per head: ${pct(result.commonSharePercent)} of rent (${money(result.commonPerPerson)} each)`,
      "",
      ...result.rooms.map(
        (room) =>
          `${room.name} — ${room.areaSqft} sq ft, ${room.occupants} person(s): ${room.occupantShares.map((share) => money(share)).join(" + ")} = ${money(room.roomTotal)}`,
      ),
      "",
      `Equal split would be ${money(result.equalSplit)} each`,
    ].join("\n");
  }, [hasError, result]);

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
    setTotalRent(DEFAULTS.totalRent);
    setSharedBills(DEFAULTS.sharedBills);
    setCommonSharePercent(DEFAULTS.commonSharePercent);
    setRooms(DEFAULT_ROOMS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Flatshare
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Shared Flat Rent Split Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Common areas are charged equally per head; bedrooms are charged by floor area adjusted for
          an attached bathroom, a balcony, air conditioning or a bad outlook. Every share is a whole
          rupee and they add up to the rent exactly.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rs-rent">
              Total monthly rent (INR)
            </label>
            <input
              id="rs-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="500"
              value={totalRent}
              onChange={(event) => setTotalRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rs-bills">
              Shared bills each month (INR)
            </label>
            <input
              id="rs-bills"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={sharedBills}
              onChange={(event) => setSharedBills(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Electricity, internet, help and society charges. Split equally per person.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rs-common">
              Rent attributed to common areas (%)
            </label>
            <input
              id="rs-common"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={commonSharePercent}
              onChange={(event) => setCommonSharePercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Kitchen, living room, hallway and shared bathroom. At 100% everyone pays the same; at
              0% rent follows bedroom size alone.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Bedrooms</h2>
          <button
            type="button"
            onClick={addRoom}
            className={GHOST_BTN}
            disabled={rooms.length >= MAX_ROOMS}
            aria-label="Add another bedroom"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add room
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {rooms.map((room, index) => (
            <div key={room.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`rs-name-${room.id}`}>
                    Room {index + 1} name
                  </label>
                  <input
                    id={`rs-name-${room.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={room.name}
                    onChange={(event) => updateRoom(room.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rs-area-${room.id}`}>
                    Floor area (sq ft)
                  </label>
                  <input
                    id={`rs-area-${room.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="5"
                    value={room.areaSqft}
                    onChange={(event) => updateRoom(room.id, { areaSqft: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rs-occ-${room.id}`}>
                    People sharing this room
                  </label>
                  <input
                    id={`rs-occ-${room.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={MAX_OCCUPANTS_PER_ROOM}
                    step="1"
                    value={room.occupants}
                    onChange={(event) => updateRoom(room.id, { occupants: event.target.value })}
                  />
                </div>
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-semibold">Room features</legend>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                  {Object.entries(AMENITY_ADJUSTMENTS).map(([key, entry]) => (
                    <label
                      key={key}
                      className="flex min-h-11 items-center gap-2 text-sm"
                      htmlFor={`rs-${key}-${room.id}`}
                    >
                      <input
                        id={`rs-${key}-${room.id}`}
                        type="checkbox"
                        className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        checked={Boolean(room.amenities[key])}
                        onChange={() => toggleAmenity(room.id, key)}
                      />
                      {entry.label}
                      <span className="text-[var(--muted-foreground)]">
                        {entry.percent > 0 ? "+" : ""}
                        {entry.percent}%
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoom(room.id)}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  aria-label={`Remove ${room.name || `room ${index + 1}`}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove room
                </button>
              )}
            </div>
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
              Highest share
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? "—" : money(result.highestShare)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs to see the split"
                : `Lowest ${money(result.lowestShare)} — a spread of ${money(result.spread)} across ${result.totalPeople} people`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the rent split"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["People in the flat", hasError ? "—" : String(result.totalPeople)],
            ["Common-area pool", hasError ? "—" : `${money(result.commonPool)} (${money(result.commonPerPerson)} each)`],
            ["Bedroom pool", hasError ? "—" : money(result.privatePool)],
            ["Shared bills per person", hasError ? "—" : money(result.billsPerPerson)],
            ["A plain equal split would be", hasError ? "—" : `${money(result.equalSplit)} each`],
            ["Total allocated", hasError ? "—" : money(result.allocated)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Who pays what</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Room</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per person</th>
                  <th scope="col" className="py-2 text-right font-semibold">Room total</th>
                </tr>
              </thead>
              <tbody>
                {result.rooms.map((room) => (
                  <tr key={room.name + room.areaSqft} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{room.name}</span>
                      <span className="block text-[var(--muted-foreground)]">
                        {room.areaSqft} sq ft, {room.occupants} person
                        {room.occupants > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {pct(room.weightShare)}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {room.sharesAreEqual
                        ? money(room.perOccupant)
                        : room.occupantShares.map((share) => money(share)).join(" / ")}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {room.differenceFromEqual >= 0 ? "+" : "-"}
                        {money(room.differenceFromEqualAbs)} vs equal
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold">{money(room.roomTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The amenity percentages are conventions, not law — change the common-area share until the
        result matches what the flat actually agrees. Note that only the tenants named on the
        agreement are liable to the landlord, whatever the internal split says, and rent paid to a
        flatmate rather than the landlord is usually not accepted as HRA proof without a formal
        sub-tenancy.
      </p>
    </main>
  );
}
