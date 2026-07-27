"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";

import {
  EVENT_TYPES,
  SPACING_OPTIONS,
  SQFT_PER_PERSON,
  TABLE_TYPES,
  assignGuests,
  parseGuestList,
  planSeating,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-32 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULT_GUESTS = [
  "Aarav Mehta, Bride's family",
  "Diya Mehta, Bride's family",
  "Rohan Mehta, Bride's family",
  "Sana Mehta, Bride's family",
  "Kabir Shah, Groom's family",
  "Neha Shah, Groom's family",
  "Vikram Shah, Groom's family",
  "Priya Nair, College friends",
  "Arjun Nair, College friends",
  "Meera Iyer, College friends",
  "Tara Bose, Work",
  "Nikhil Bose, Work",
].join("\n");

const DEFAULTS = {
  eventId: "wedding",
  tableTypeId: "round-60",
  spacingId: "standard",
  seatEnds: true,
  roomLengthFt: "60",
  roomWidthFt: "40",
  guestText: DEFAULT_GUESTS,
};

export default function ToolHome() {
  const [eventId, setEventId] = useState(DEFAULTS.eventId);
  const [tableTypeId, setTableTypeId] = useState(DEFAULTS.tableTypeId);
  const [spacingId, setSpacingId] = useState(DEFAULTS.spacingId);
  const [seatEnds, setSeatEnds] = useState(DEFAULTS.seatEnds);
  const [roomLengthFt, setRoomLengthFt] = useState(DEFAULTS.roomLengthFt);
  const [roomWidthFt, setRoomWidthFt] = useState(DEFAULTS.roomWidthFt);
  const [guestText, setGuestText] = useState(DEFAULTS.guestText);
  const [copied, setCopied] = useState(false);

  const guests = useMemo(() => parseGuestList(guestText), [guestText]);

  const plan = useMemo(
    () =>
      planSeating({
        guestCount: guests.length,
        tableTypeId,
        spacingId,
        seatEnds,
        roomLengthFt: Number(roomLengthFt),
        roomWidthFt: Number(roomWidthFt),
      }),
    [guests.length, tableTypeId, spacingId, seatEnds, roomLengthFt, roomWidthFt],
  );

  const hasError = Boolean(plan.error);

  const seating = useMemo(() => {
    if (hasError) return { tables: [], splitGroups: [], tablesUsed: 0 };
    return assignGuests(guests, plan.seatsPerTable);
  }, [hasError, guests, plan.seatsPerTable]);

  const selectedTable = TABLE_TYPES.find((entry) => entry.id === tableTypeId) ?? TABLE_TYPES[0];
  const isRect = selectedTable.shape === "rect";

  const applyEventPreset = (id) => {
    const preset = EVENT_TYPES.find((entry) => entry.id === id);
    setEventId(id);
    if (preset) {
      setTableTypeId(preset.defaultTable);
      setSpacingId(preset.defaultSpacing);
    }
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (hasError || seating.error) return "";
    const lines = [
      `Seating plan — ${guests.length} guests`,
      `${plan.table.label} at ${plan.spacing.inches} in per guest = ${plan.seatsPerTable} seats per table`,
      `Tables needed: ${plan.tablesNeeded} (${plan.seatsProvided} seats, ${plan.emptySeats} spare)`,
      `Allow ${NUM1.format(plan.tablePitchFt)} ft centre-to-centre between tables`,
      "",
    ];
    seating.tables.forEach((table) => {
      lines.push(`Table ${table.number}: ${table.guests.map((guest) => guest.name).join(", ")}`);
    });
    return lines.join("\n");
  }, [hasError, seating, guests.length, plan]);

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
    setEventId(DEFAULTS.eventId);
    setTableTypeId(DEFAULTS.tableTypeId);
    setSpacingId(DEFAULTS.spacingId);
    setSeatEnds(DEFAULTS.seatEnds);
    setRoomLengthFt(DEFAULTS.roomLengthFt);
    setRoomWidthFt(DEFAULTS.roomWidthFt);
    setGuestText(DEFAULTS.guestText);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Seats per table", DASH],
        ["How that is worked out", DASH],
        ["Total seats laid", DASH],
        ["Spare seats", DASH],
        ["Table pitch (centre to centre)", DASH],
        ["Room occupant load", DASH],
      ]
    : [
        ["Seats per table", NUM.format(plan.seatsPerTable)],
        ["How that is worked out", plan.capacityMethod],
        ["Total seats laid", NUM.format(plan.seatsProvided)],
        [
          "Spare seats",
          `${NUM.format(plan.emptySeats)} (${NUM.format(plan.utilisation)}% of seats used)`,
        ],
        ["Table pitch (centre to centre)", `${NUM1.format(plan.tablePitchFt)} ft`],
        [
          "Room occupant load",
          plan.room
            ? `${NUM.format(plan.room.occupantLoad)} people at ${SQFT_PER_PERSON} sq ft each (${NUM.format(plan.room.areaSqFt)} sq ft room)`
            : "Enter room dimensions to check",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Event planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Interactive Seating Chart Maker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a guest list, choose a table size, and get the table count, the per-table guest
          assignment with groups kept together, and a room-capacity check against the NFPA 101
          occupant-load figure of {SQFT_PER_PERSON} sq ft per seated person.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-event">
              Event type (sets the defaults)
            </label>
            <select
              id="sc-event"
              className={`mt-2 ${INPUT_CLASS}`}
              value={eventId}
              onChange={(event) => applyEventPreset(event.target.value)}
            >
              {EVENT_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-table">
              Table type
            </label>
            <select
              id="sc-table"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tableTypeId}
              onChange={(event) => {
                setTableTypeId(event.target.value);
                setCopied(false);
              }}
            >
              {TABLE_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-spacing">
              Space per guest
            </label>
            <select
              id="sc-spacing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={spacingId}
              onChange={(event) => {
                setSpacingId(event.target.value);
                setCopied(false);
              }}
            >
              {SPACING_OPTIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          {isRect ? (
            <div className="flex items-end">
              <label
                className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3"
                htmlFor="sc-ends"
              >
                <input
                  id="sc-ends"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={seatEnds}
                  onChange={(event) => {
                    setSeatEnds(event.target.checked);
                    setCopied(false);
                  }}
                />
                <span className="text-sm font-medium">Seat the short ends too</span>
              </label>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-length">
              Room length (ft)
            </label>
            <input
              id="sc-length"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roomLengthFt}
              onChange={(event) => setRoomLengthFt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-width">
              Room width (ft)
            </label>
            <input
              id="sc-width"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roomWidthFt}
              onChange={(event) => setRoomWidthFt(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sc-guests">
              Guest list — one per line, optional group after a comma
            </label>
            <textarea
              id="sc-guests"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={guestText}
              onChange={(event) => {
                setGuestText(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {guests.length} guest{guests.length === 1 ? "" : "s"} read from the list.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Tables needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.tablesNeeded)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${plan.table.label} seating ${plan.seatsPerTable} each for ${plan.guestCount} guests.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the seating plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the seating planner to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.room && !plan.room.fits ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            The room holds {NUM.format(plan.room.occupantLoad)} seated guests at{" "}
            {SQFT_PER_PERSON} sq ft each — {NUM.format(plan.room.shortfall)} too few for this list.
          </p>
        ) : null}
      </section>

      {!hasError && seating.tables.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-lg font-semibold">Table assignments</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Groups are packed largest first, so parties stay together whenever they fit on one
            table.
          </p>
          {seating.splitGroups.length > 0 ? (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
              Larger than one table, so split across tables: {seating.splitGroups.join(", ")}.
            </p>
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {seating.tables.map((table) => (
              <div
                key={table.number}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Table {table.number}</h3>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {table.guests.length}/{plan.seatsPerTable} seats
                  </span>
                </div>
                <ol className="mt-2 space-y-1 text-sm">
                  {table.guests.map((guest, index) => (
                    <li key={`${table.number}-${guest.name}-${index}`} className="flex gap-2">
                      <span className="text-[var(--muted-foreground)]">{index + 1}.</span>
                      <span>
                        {guest.name}
                        {guest.group && guest.group !== "Unassigned" ? (
                          <span className="text-[var(--muted-foreground)]"> · {guest.group}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Capacities come from the standard banquet allowance of 20–24 inches of linear table edge per
        cover. Confirm the final layout with your venue: fire-code occupant load, aisle widths and
        exit routes are set by the venue&apos;s own licence, not by table maths.
      </p>
    </main>
  );
}
