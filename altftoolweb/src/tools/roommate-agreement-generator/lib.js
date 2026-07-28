/**
 * Roommate / flatmate agreement helpers.
 *
 * Pure module: no React, no DOM, no Date.now(). All dates are passed in as
 * ISO "YYYY-MM-DD" strings so the same input always produces the same output.
 */

/**
 * Model Tenancy Act, 2021 (India), s.11(1): the security deposit for premises
 * let out for residential purposes shall not exceed two months' rent.
 */
export const MAX_DEPOSIT_MONTHS_RESIDENTIAL = 2;

/**
 * Model Tenancy Act, 2021, s.21 read with the Transfer of Property Act, 1882,
 * s.106: a month-to-month residential tenancy is terminable on 15 days' notice,
 * and one clear month (30 days) is the ordinary contractual default.
 */
export const DEFAULT_NOTICE_DAYS = 30;

/**
 * Registration Act, 1908, s.17(1)(d): a lease of immovable property from year
 * to year, or for any term exceeding one year, must be compulsorily registered.
 */
export const REGISTRATION_THRESHOLD_MONTHS = 12;

/** Practical cap used to reject nonsense terms in the form. */
export const MAX_TERM_MONTHS = 120;

/** A flat share needs at least two people to be a flat share. */
export const MIN_OCCUPANTS = 2;
export const MAX_OCCUPANTS = 8;

export const SPLIT_METHODS = [
  { id: "equal", label: "Equal split", hint: "Everyone pays the same share." },
  { id: "room", label: "By private room area", hint: "Weight by each person's private room in sq ft." },
  { id: "custom", label: "Custom percentage", hint: "Enter each share; must total 100%." },
];

export const CHORE_PRESETS = [
  "Kitchen and dishes",
  "Bathrooms",
  "Common area sweep and mop",
  "Rubbish and recycling",
  "Groceries and household supplies",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const round2 = (value) => Math.round(value * 100) / 100;

/** Parse an ISO date into UTC parts. Returns null when the date is not real. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, m - 1, d);
  const date = new Date(ms);
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d, ms };
}

/** Add whole months to an ISO date, clamping to the last valid day of the month. */
export function addMonths(iso, months) {
  const parsed = parseIsoDate(iso);
  if (!parsed || !Number.isFinite(months)) return null;
  const total = parsed.y * 12 + (parsed.m - 1) + Math.trunc(months);
  const year = Math.floor(total / 12);
  const month = total - year * 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(parsed.d, lastDay);
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** Human-readable long date, e.g. "1 September 2026". */
export function formatLongDate(iso) {
  const parsed = parseIsoDate(iso);
  if (!parsed) return "";
  return `${parsed.d} ${MONTH_NAMES[parsed.m - 1]} ${parsed.y}`;
}

/**
 * Split rent, utilities and the security deposit between flatmates.
 *
 * @param {object} input
 * @param {number} input.monthlyRent    Total monthly rent for the whole flat.
 * @param {number} input.monthlyUtilities Shared monthly utilities/maintenance.
 * @param {number} input.securityDeposit Total deposit held by the landlord.
 * @param {Array<{name: string, weight: number}>} input.occupants
 * @param {"equal"|"room"|"custom"} input.method
 * @returns {object} rows + totals, or { error }
 */
export function splitCosts({
  monthlyRent,
  monthlyUtilities = 0,
  securityDeposit = 0,
  occupants,
  method = "equal",
}) {
  if (!Array.isArray(occupants) || occupants.length < MIN_OCCUPANTS) {
    return { error: `Add at least ${MIN_OCCUPANTS} flatmates to split the rent.` };
  }
  if (occupants.length > MAX_OCCUPANTS) {
    return { error: `This tool handles up to ${MAX_OCCUPANTS} flatmates.` };
  }
  const rent = Number(monthlyRent);
  const utilities = Number(monthlyUtilities);
  const deposit = Number(securityDeposit);
  if (![rent, utilities, deposit].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for rent, utilities and deposit." };
  }
  if (rent <= 0) return { error: "Monthly rent must be greater than zero." };
  if (utilities < 0 || deposit < 0) return { error: "Utilities and deposit cannot be negative." };
  if (occupants.some((person) => !String(person.name || "").trim())) {
    return { error: "Give every flatmate a name." };
  }

  let weights;
  if (method === "equal") {
    weights = occupants.map(() => 1);
  } else {
    weights = occupants.map((person) => Number(person.weight));
    if (!weights.every((value) => Number.isFinite(value) && value >= 0)) {
      return {
        error:
          method === "room"
            ? "Enter a valid room area for every flatmate."
            : "Enter a valid percentage share for every flatmate.",
      };
    }
    if (method === "custom") {
      const sum = weights.reduce((acc, value) => acc + value, 0);
      if (Math.abs(sum - 100) > 0.01) {
        return { error: `Custom shares must add up to 100%. They currently total ${round2(sum)}%.` };
      }
    }
  }

  const weightSum = weights.reduce((acc, value) => acc + value, 0);
  if (!(weightSum > 0)) {
    return { error: "The shares add up to zero, so there is nothing to split." };
  }

  // Allocate to whole rupees, then hand any rounding remainder to the first
  // flatmate so the shares always add back to the exact total.
  const allocate = (total) => {
    const raw = weights.map((weight) => (total * weight) / weightSum);
    const floored = raw.map((value) => Math.floor(value));
    let remainder = Math.round(total) - floored.reduce((acc, value) => acc + value, 0);
    const out = floored.slice();
    let index = 0;
    while (remainder > 0 && out.length > 0) {
      out[index % out.length] += 1;
      remainder -= 1;
      index += 1;
    }
    return out;
  };

  const rentParts = allocate(rent);
  const utilityParts = allocate(utilities);
  const depositParts = allocate(deposit);

  const rows = occupants.map((person, index) => ({
    name: String(person.name).trim(),
    sharePct: round2((weights[index] / weightSum) * 100),
    rent: rentParts[index],
    utilities: utilityParts[index],
    deposit: depositParts[index],
    monthlyTotal: rentParts[index] + utilityParts[index],
  }));

  const depositMonths = round2(deposit / rent);

  return {
    rows,
    method,
    totals: {
      rent: Math.round(rent),
      utilities: Math.round(utilities),
      deposit: Math.round(deposit),
      monthly: Math.round(rent) + Math.round(utilities),
    },
    depositMonths,
    depositExceedsCap: depositMonths > MAX_DEPOSIT_MONTHS_RESIDENTIAL,
  };
}

/**
 * Rotate a list of chores through the flatmates week by week.
 * Week 1 gives chore i to occupant i; each later week shifts by one person.
 */
export function buildChoreRotation({ occupants, chores, weeks = 4 }) {
  const names = (occupants || []).map((person) => String(person.name || "").trim()).filter(Boolean);
  const jobs = (chores || []).map((chore) => String(chore || "").trim()).filter(Boolean);
  const count = Math.trunc(Number(weeks));
  if (names.length < MIN_OCCUPANTS) return { error: "Add at least two named flatmates." };
  if (jobs.length === 0) return { error: "Add at least one chore to build a rotation." };
  if (!Number.isFinite(count) || count < 1 || count > 12) {
    return { error: "Choose a rotation between 1 and 12 weeks." };
  }
  const rows = [];
  for (let week = 1; week <= count; week += 1) {
    rows.push({
      week,
      assignments: jobs.map((job, jobIndex) => ({
        chore: job,
        name: names[(jobIndex + week - 1) % names.length],
      })),
    });
  }
  return { chores: jobs, names, rows };
}

const clause = (n, title, body) => `${n}. ${title.toUpperCase()}\n${body}`;

/**
 * Build the full plain-text roommate agreement.
 * @returns {{ text: string, endDate: string, needsRegistration: boolean } | { error: string }}
 */
export function buildAgreement({
  propertyAddress,
  city,
  startDate,
  termMonths,
  agreementDate,
  noticeDays = DEFAULT_NOTICE_DAYS,
  guestNights = 3,
  quietFrom = "22:00",
  quietTo = "07:00",
  petsAllowed = false,
  smokingAllowed = false,
  chores = [],
  rotationWeeks = 4,
  split,
  currencyFormatter,
}) {
  if (!split || split.error) {
    return { error: split && split.error ? split.error : "Fix the cost split first." };
  }
  const address = String(propertyAddress || "").trim();
  if (!address) return { error: "Enter the address of the flat." };
  const start = parseIsoDate(startDate);
  if (!start) return { error: "Enter a valid start date (YYYY-MM-DD)." };
  const signed = parseIsoDate(agreementDate);
  if (!signed) return { error: "Enter a valid agreement date (YYYY-MM-DD)." };
  const term = Math.trunc(Number(termMonths));
  if (!Number.isFinite(term) || term < 1 || term > MAX_TERM_MONTHS) {
    return { error: `Term must be between 1 and ${MAX_TERM_MONTHS} months.` };
  }
  const notice = Math.trunc(Number(noticeDays));
  if (!Number.isFinite(notice) || notice < 0 || notice > 180) {
    return { error: "Notice period must be between 0 and 180 days." };
  }
  const nights = Math.trunc(Number(guestNights));
  if (!Number.isFinite(nights) || nights < 0 || nights > 31) {
    return { error: "Consecutive guest nights must be between 0 and 31." };
  }

  const fmt =
    typeof currencyFormatter === "function"
      ? currencyFormatter
      : (value) => `INR ${Math.round(value).toLocaleString("en-IN")}`;

  const endDate = addMonths(startDate, term);
  const names = split.rows.map((row) => row.name);
  const nameList = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];

  const shareLines = split.rows
    .map(
      (row) =>
        `   - ${row.name}: rent ${fmt(row.rent)} + utilities ${fmt(row.utilities)} = ${fmt(
          row.monthlyTotal,
        )} per month (${row.sharePct}% share); deposit contribution ${fmt(row.deposit)}.`,
    )
    .join("\n");

  const rotation = buildChoreRotation({
    occupants: split.rows,
    chores: chores.length ? chores : CHORE_PRESETS.slice(0, 3),
    weeks: rotationWeeks,
  });
  const choreText = rotation.error
    ? "   Chores are shared by mutual agreement and reviewed monthly."
    : rotation.rows
        .map(
          (row) =>
            `   Week ${row.week}: ${row.assignments
              .map((item) => `${item.chore} - ${item.name}`)
              .join("; ")}.`,
        )
        .join("\n");

  const needsRegistration = term >= REGISTRATION_THRESHOLD_MONTHS;

  const body = [
    "ROOMMATE (FLAT SHARE) AGREEMENT",
    "",
    `This agreement is made on ${formatLongDate(agreementDate)} between ${nameList} (together, "the Flatmates").`,
    "",
    clause(
      1,
      "The premises",
      `   The Flatmates share the residential premises at ${address}${city ? `, ${city}` : ""} ("the Flat"). This agreement governs only the arrangement between the Flatmates. It does not replace the tenancy agreement or leave and licence agreement signed with the landlord, and it does not give any Flatmate rights against the landlord.`,
    ),
    "",
    clause(
      2,
      "Term",
      `   The shared occupation begins on ${formatLongDate(startDate)} and runs for ${term} month${term === 1 ? "" : "s"}, ending on ${formatLongDate(endDate)}, unless extended in writing signed by all Flatmates.`,
    ),
    "",
    clause(
      3,
      "Rent, utilities and deposit",
      `   Total monthly rent for the Flat is ${fmt(split.totals.rent)} and shared monthly utilities and maintenance are budgeted at ${fmt(
        split.totals.utilities,
      )}. The total security deposit held by the landlord is ${fmt(split.totals.deposit)} (${split.depositMonths} months' rent). Each Flatmate's share is:\n${shareLines}\n   Each Flatmate pays their share to the nominated account on or before the 5th of each month. Utilities are reconciled against actual bills each month and any difference is settled in the following month.`,
    ),
    "",
    clause(
      4,
      "Security deposit refund",
      `   Deposit contributions are refunded to each Flatmate only after the landlord releases the deposit, less that Flatmate's share of any deduction for damage, unpaid rent or unpaid bills. A Flatmate who leaves early is repaid by the incoming replacement, or by the remaining Flatmates if they choose to keep the room vacant.`,
    ),
    "",
    clause(
      5,
      "Cleaning and chores",
      `   The Flatmates run the following ${rotation.error ? "" : `${rotationWeeks}-week `}rotation and each person completes their task before the end of that week:\n${choreText}\n   Everyone cleans up after themselves in shared spaces the same day.`,
    ),
    "",
    clause(
      6,
      "Guests",
      `   A guest may stay up to ${nights} consecutive night${nights === 1 ? "" : "s"} without the other Flatmates' consent. Longer or repeated stays need the written agreement of all Flatmates. A guest who stays more than ${
        nights * 4
      } nights in any calendar month is treated as an occupant and must contribute a proportionate share of rent and utilities.`,
    ),
    "",
    clause(
      7,
      "Quiet hours and shared living",
      `   Quiet hours are ${quietFrom} to ${quietTo} on every day of the week. ${
        smokingAllowed ? "Smoking is permitted only on the balcony or outside the Flat." : "Smoking is not permitted anywhere inside the Flat."
      } ${petsAllowed ? "Pets are permitted, and the owner is responsible for all damage, noise and cleaning caused by the pet." : "Pets are not permitted without the prior written consent of all Flatmates."}`,
    ),
    "",
    clause(
      8,
      "Personal property and shared items",
      `   Each Flatmate keeps ownership of items they bought alone. Items bought jointly are owned in the same proportion as the purchase contribution, and on departure the leaving Flatmate is either bought out at a value agreed in writing or the item is sold and the proceeds split in the same proportion. No Flatmate may use another's belongings without permission.`,
    ),
    "",
    clause(
      9,
      "Leaving the flat",
      `   A Flatmate who wishes to leave must give ${notice} days' written notice to the other Flatmates and to the landlord where the tenancy requires it. The leaving Flatmate remains liable for their share of rent and bills for the whole notice period, and must help find a replacement acceptable to the remaining Flatmates and the landlord. A replacement must sign a copy of this agreement before moving in.`,
    ),
    "",
    clause(
      10,
      "Breach and disputes",
      `   If a Flatmate fails to pay their share within 7 days of the due date, the other Flatmates may pay it to protect the tenancy and recover the amount from that Flatmate. The Flatmates will first try to resolve any dispute by discussion, and then by mediation, before taking any other step. Nothing in this agreement limits any right a Flatmate has under the tenancy agreement or applicable rent law.`,
    ),
    "",
    "SIGNED BY THE FLATMATES",
    "",
    ...names.map(
      (name) => `${name}\nSignature: ____________________    Date: ______________\n`,
    ),
    needsRegistration
      ? `Note: the shared occupation runs for ${term} months. Under the Registration Act, 1908, s.17(1)(d), a lease of immovable property for a term of 12 months or more must be registered - check whether the head tenancy for this flat has been registered and stamped.`
      : "Note: this is a private arrangement between flatmates. Stamping and registration requirements apply to the head tenancy, not to this side agreement.",
    "",
    "This document is an informational template, not legal advice. Have a lawyer review it before you rely on it.",
  ].join("\n");

  return { text: body, endDate, needsRegistration };
}
