/**
 * Travel document folder organiser.
 *
 * The ordering rule is not aesthetic: an international air journey is a fixed
 * sequence of checkpoints, and each checkpoint asks for a known, published set
 * of documents. If the folder is stacked in that sequence, every document
 * surfaces exactly when it is asked for and nothing is dug out twice.
 *
 * The checkpoint sequence used here is the standard IATA/ICAO passenger flow:
 * terminal entry -> airline check-in and bag drop -> outbound immigration
 * (emigration) -> security screening -> boarding gate -> in flight ->
 * arrival immigration -> customs -> ground transport -> hotel check-in ->
 * during the stay.
 *
 * The validity checks are real entry rules, not guesses:
 *  - The "six-month rule": a large group of states (most of South-East Asia,
 *    the Gulf, Indonesia, Thailand, Singapore, UAE, Egypt, Kenya and others)
 *    require the passport to remain valid for at least six months beyond the
 *    date of intended departure from their territory.
 *  - Schengen: Regulation (EU) 2016/399 (Schengen Borders Code), Article 6(1)(a)
 *    requires a travel document that is valid for at least three months after
 *    the intended date of departure from the Schengen area AND that was issued
 *    within the previous ten years.
 *  - Some states (UK, most of the Americas) only require validity for the
 *    duration of the stay.
 *
 * Everything here is pure: dates are passed in as ISO strings, nothing reads
 * the clock, and the same input always produces the same folder order.
 */

/** Days used for the "six month" rule. Six calendar months, applied as months. */
export const SIX_MONTH_RULE_MONTHS = 6;

/** Schengen Borders Code Art. 6(1)(a): three months beyond intended departure. */
export const SCHENGEN_VALIDITY_MONTHS = 3;

/** Schengen Borders Code Art. 6(1)(a): passport issued within the previous 10 years. */
export const SCHENGEN_MAX_PASSPORT_AGE_YEARS = 10;

/**
 * Minimum medical cover a Schengen visa applicant must hold, set by the Visa
 * Code (Regulation (EC) 810/2009), Article 15.
 */
export const SCHENGEN_INSURANCE_MIN_EUR = 30000;

/** Cash declaration thresholds travellers most often trip over. */
export const CASH_DECLARATION_THRESHOLDS = [
  { region: "European Union", amount: "EUR 10,000", note: "Regulation (EU) 2018/1672, cash entering or leaving the EU." },
  { region: "United States", amount: "USD 10,000", note: "FinCEN Form 105, currency or monetary instruments." },
  { region: "India", amount: "USD 5,000 in notes / USD 10,000 total", note: "Currency Declaration Form on arrival." },
];

/** Number of photocopies of the identity page that is normally enough. */
export const PASSPORT_COPIES = 2;

export const MAX_TRIP_DAYS = 400;

/** Passenger-flow checkpoints in the order they are encountered. */
export const CHECKPOINTS = [
  { id: "terminal", order: 1, label: "Terminal entry", note: "Many airports check a ticket and photo ID at the door." },
  { id: "checkin", order: 2, label: "Airline check-in & bag drop", note: "The agent runs the document check the airline is fined for getting wrong." },
  { id: "emigration", order: 3, label: "Emigration / outbound immigration", note: "Exit stamp, and departure card where one is still used." },
  { id: "security", order: 4, label: "Security screening", note: "Boarding pass scanned; nothing else is normally asked for." },
  { id: "gate", order: 5, label: "Boarding gate", note: "Final passport-to-boarding-pass match before the aircraft." },
  { id: "inflight", order: 6, label: "In flight", note: "Arrival and customs forms are handed out here — fill them before landing." },
  { id: "arrival", order: 7, label: "Arrival immigration", note: "The heaviest document check of the whole trip." },
  { id: "customs", order: 8, label: "Baggage claim & customs", note: "Declaration, receipts and anything you are carrying for someone else." },
  { id: "transport", order: 9, label: "Ground transport / car hire", note: "Licence and permit are checked at the rental desk, not at the border." },
  { id: "hotel", order: 10, label: "Hotel check-in", note: "Passport plus a photocopy; many countries register guests with the police." },
  { id: "stay", order: 11, label: "During the stay", note: "Kept in the folder but rarely opened — until it matters." },
];

const CHECKPOINT_BY_ID = Object.fromEntries(CHECKPOINTS.map((c) => [c.id, c]));

/** Where a document should physically live. */
export const HOLD_PLACES = {
  person: { label: "On your person", note: "Pocket or neck wallet — never in a bag you might put down." },
  folder: { label: "In the folder", note: "Slot it in the printed running order." },
  cabin: { label: "Cabin bag", note: "Reachable in flight, never checked in." },
  phone: { label: "Phone / cloud backup", note: "Screenshot as well as the file — airport Wi-Fi fails." },
};

/**
 * The document catalogue. `when` is the toggle that switches a document on;
 * `checkpoint` is the FIRST place it is asked for, which is what sets the
 * folder order.
 */
export const DOCUMENTS = [
  { id: "passport", label: "Passport", checkpoint: "terminal", within: 1, hold: "person", copies: PASSPORT_COPIES, when: "international", note: "Identity page photocopy separately in the cabin bag and one left with someone at home." },
  { id: "national-id", label: "Government photo ID", checkpoint: "terminal", within: 1, hold: "person", copies: 1, when: "domestic", note: "Domestic flights accept a national ID or driving licence in most countries." },
  { id: "itinerary", label: "Printed e-ticket / PNR sheet", checkpoint: "terminal", within: 2, hold: "folder", copies: 1, when: "always", note: "One page per passenger with the PNR in large type — it is what the door staff scan." },
  { id: "visa", label: "Visa or e-visa approval letter", checkpoint: "checkin", within: 1, hold: "folder", copies: 2, when: "visa", note: "Airlines are fined for boarding a passenger without one, so this is checked before the border is." },
  { id: "onward-ticket", label: "Onward or return ticket", checkpoint: "checkin", within: 2, hold: "folder", copies: 1, when: "international", note: "Asked for at check-in far more often than at the border itself." },
  { id: "health-cert", label: "Vaccination certificate (e.g. ICVP yellow fever card)", checkpoint: "checkin", within: 3, hold: "folder", copies: 1, when: "health", note: "The WHO International Certificate of Vaccination is the yellow booklet — the original, not a copy." },
  { id: "excess-baggage", label: "Prepaid baggage / excess receipt", checkpoint: "checkin", within: 4, hold: "folder", copies: 1, when: "bags", note: "Prepaid allowances sometimes fail to appear on the agent's screen." },
  { id: "departure-card", label: "Departure / emigration card", checkpoint: "emigration", within: 1, hold: "folder", copies: 1, when: "international", note: "Where one is still used it is usually handed out landside — fill it in the queue, not at the desk." },
  { id: "boarding-pass", label: "Boarding pass", checkpoint: "security", within: 1, hold: "person", copies: 1, when: "always", note: "Print one even if you have a mobile pass; scanners and phone batteries both fail." },
  { id: "arrival-card", label: "Arrival / landing card", checkpoint: "inflight", within: 1, hold: "cabin", copies: 1, when: "international", note: "Needs the hotel address, so keep the booking reachable in the seat pocket." },
  { id: "customs-form", label: "Customs declaration form", checkpoint: "inflight", within: 2, hold: "cabin", copies: 1, when: "international", note: "One per family in most countries, one per person in some." },
  { id: "accommodation", label: "Hotel or host address confirmation", checkpoint: "arrival", within: 1, hold: "folder", copies: 1, when: "hotel", note: "Immigration asks where you are staying before it asks anything else." },
  { id: "funds", label: "Proof of funds (statement or card)", checkpoint: "arrival", within: 2, hold: "folder", copies: 1, when: "funds", note: "A recent statement page is enough; carrying the card alone often is not." },
  { id: "insurance", label: "Travel insurance policy", checkpoint: "arrival", within: 3, hold: "folder", copies: 1, when: "insurance", note: `A Schengen visa requires at least EUR ${SCHENGEN_INSURANCE_MIN_EUR.toLocaleString("en-GB")} of medical cover.` },
  { id: "invite-letter", label: "Invitation or sponsorship letter", checkpoint: "arrival", within: 4, hold: "folder", copies: 1, when: "invite", note: "Signed original if you have it, with the host's phone number on the same page." },
  { id: "child-consent", label: "Child birth certificate & consent letter", checkpoint: "arrival", within: 5, hold: "folder", copies: 2, when: "child", note: "Required when a child crosses a border without both parents; several states refuse boarding without it." },
  { id: "prescription", label: "Doctor's letter for prescription medicine", checkpoint: "customs", within: 1, hold: "cabin", copies: 1, when: "medication", note: "Generic drug names, not brand names — brands differ between countries." },
  { id: "cash-declaration", label: "Currency declaration", checkpoint: "customs", within: 2, hold: "folder", copies: 1, when: "cash", note: "Thresholds are per traveller and per direction; a family's cash is usually summed." },
  { id: "high-value", label: "Receipts for laptops, cameras and jewellery", checkpoint: "customs", within: 3, hold: "folder", copies: 1, when: "highvalue", note: "Protects you on the way back in as much as on the way out." },
  { id: "driving", label: "Driving licence + International Driving Permit", checkpoint: "transport", within: 1, hold: "folder", copies: 1, when: "driving", note: "The IDP is only valid alongside the home licence, never on its own." },
  { id: "car-voucher", label: "Car hire voucher & insurance cover note", checkpoint: "transport", within: 2, hold: "folder", copies: 1, when: "driving", note: "Print the excess-waiver terms; desks upsell hardest when you cannot show them." },
  { id: "transfer", label: "Airport transfer or rail booking", checkpoint: "transport", within: 3, hold: "folder", copies: 1, when: "transfer", note: "Include the driver's number and the meeting point, not just the reference." },
  { id: "hotel-voucher", label: "Hotel voucher + passport photocopy", checkpoint: "hotel", within: 1, hold: "folder", copies: 1, when: "hotel", note: "Handing over a copy means the original never leaves your hand at the desk." },
  { id: "emergency", label: "Emergency contact & embassy card", checkpoint: "stay", within: 1, hold: "person", copies: 2, when: "always", note: "One card in the folder and one in a different pocket, on paper, in the local language if possible." },
  { id: "vat-refund", label: "VAT / GST refund forms", checkpoint: "stay", within: 2, hold: "folder", copies: 1, when: "vat", note: "The customs stamp has to be collected before you check the goods in on the way home." },
  { id: "loyalty", label: "Loyalty, student or senior cards", checkpoint: "stay", within: 3, hold: "folder", copies: 1, when: "discounts", note: "Museum and rail discounts are refused without the physical card surprisingly often." },
];

/** Passport validity regimes at the destination border. */
export const VALIDITY_RULES = [
  { id: "six-month", label: "Six months beyond departure (most of Asia, the Gulf, much of Africa)", months: SIX_MONTH_RULE_MONTHS, tenYear: false },
  { id: "schengen", label: "Schengen area — 3 months beyond departure, issued within 10 years", months: SCHENGEN_VALIDITY_MONTHS, tenYear: true },
  { id: "duration", label: "Valid for the duration of the stay only (UK, USA, much of the Americas)", months: 0, tenYear: false },
];

const RULE_BY_ID = Object.fromEntries(VALIDITY_RULES.map((r) => [r.id, r]));

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO date into a UTC-midnight Date, or null. */
export function parseISODate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value.trim())) return null;
  const [y, m, d] = value.trim().split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date;
}

const MS_PER_DAY = 86400000;

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Add whole calendar months, clamping to the end of a short month. */
export function addMonths(date, months) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const target = new Date(Date.UTC(y, m + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target;
}

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Build the folder plan.
 *
 * @param {object} input
 * @param {"international"|"domestic"} input.tripType
 * @param {string} input.departureDate  ISO date of the outbound flight
 * @param {string} input.returnDate     ISO date you leave the destination
 * @param {string} input.passportExpiry ISO date, ignored for domestic trips
 * @param {string} input.passportIssued ISO date, only used by the Schengen rule
 * @param {string} input.validityRule   one of VALIDITY_RULES ids
 * @param {number} input.travellers
 * @param {object} input.flags          toggles keyed by DOCUMENTS[].when
 */
export function buildDocumentPlan(input) {
  const {
    tripType = "international",
    departureDate,
    returnDate,
    passportExpiry,
    passportIssued,
    validityRule = "six-month",
    travellers = 1,
    flags = {},
  } = input || {};

  if (tripType !== "international" && tripType !== "domestic") {
    return { error: "Choose either an international or a domestic trip." };
  }

  const people = Number(travellers);
  if (!Number.isFinite(people) || !Number.isInteger(people) || people < 1 || people > 12) {
    return { error: "Enter a whole number of travellers between 1 and 12." };
  }

  const depart = parseISODate(departureDate);
  const back = parseISODate(returnDate);
  if (!depart) return { error: "Enter the outbound date as YYYY-MM-DD." };
  if (!back) return { error: "Enter the return date as YYYY-MM-DD." };

  const tripDays = daysBetween(depart, back);
  if (tripDays < 0) return { error: "The return date cannot be before the outbound date." };
  if (tripDays > MAX_TRIP_DAYS) {
    return { error: `A trip longer than ${MAX_TRIP_DAYS} days needs a residence permit, not a document folder.` };
  }

  const rule = RULE_BY_ID[validityRule] || RULE_BY_ID["six-month"];
  const checks = [];

  if (tripType === "international") {
    const expiry = parseISODate(passportExpiry);
    if (!expiry) return { error: "Enter the passport expiry date as YYYY-MM-DD." };

    const requiredUntil = addMonths(back, rule.months);
    const marginDays = daysBetween(requiredUntil, expiry);
    checks.push({
      id: "validity",
      label: "Passport validity at the border",
      ok: marginDays >= 0,
      detail:
        marginDays >= 0
          ? `Valid until ${toISO(expiry)}, which is ${marginDays} day${marginDays === 1 ? "" : "s"} past the ${rule.months === 0 ? "end of the stay" : `${rule.months}-month requirement`} (${toISO(requiredUntil)}).`
          : `Short by ${Math.abs(marginDays)} day${Math.abs(marginDays) === 1 ? "" : "s"}. This border wants validity to ${toISO(requiredUntil)} but the passport ends ${toISO(expiry)}.`,
    });

    if (rule.tenYear) {
      const issued = parseISODate(passportIssued);
      if (!issued) return { error: "The Schengen rule needs the passport issue date as YYYY-MM-DD." };
      const tenYearsFromIssue = addMonths(issued, SCHENGEN_MAX_PASSPORT_AGE_YEARS * 12);
      const ageMarginDays = daysBetween(depart, tenYearsFromIssue);
      checks.push({
        id: "ten-year",
        label: "Passport issued within the previous 10 years",
        ok: ageMarginDays >= 0,
        detail:
          ageMarginDays >= 0
            ? `Issued ${toISO(issued)}, so it stays inside the 10-year window until ${toISO(tenYearsFromIssue)}.`
            : `Issued ${toISO(issued)}. The 10-year window closed on ${toISO(tenYearsFromIssue)}, ${Math.abs(ageMarginDays)} day${Math.abs(ageMarginDays) === 1 ? "" : "s"} before you fly — extended passports are refused at Schengen borders.`,
      });
    }
  }

  const active = new Set(["always", tripType]);
  Object.entries(flags).forEach(([key, on]) => {
    if (on) active.add(key);
  });

  const selected = DOCUMENTS.filter((doc) => active.has(doc.when));
  if (selected.length === 0) return { error: "Nothing to organise — switch on at least one document." };

  const ordered = selected
    .map((doc) => ({ ...doc, cp: CHECKPOINT_BY_ID[doc.checkpoint] }))
    .sort((a, b) => (a.cp.order - b.cp.order) || (a.within - b.within) || a.label.localeCompare(b.label))
    .map((doc, index) => {
      const perPerson = doc.id === "customs-form" ? 1 : people;
      return {
        seq: index + 1,
        id: doc.id,
        label: doc.label,
        checkpointId: doc.cp.id,
        checkpointLabel: doc.cp.label,
        checkpointNote: doc.cp.note,
        hold: doc.hold,
        holdLabel: HOLD_PLACES[doc.hold].label,
        note: doc.note,
        originals: perPerson,
        photocopies: Math.max(0, doc.copies - 1) * perPerson,
      };
    });

  const stages = CHECKPOINTS.filter((cp) => ordered.some((doc) => doc.checkpointId === cp.id)).map((cp) => ({
    ...cp,
    docs: ordered.filter((doc) => doc.checkpointId === cp.id),
  }));

  const totals = ordered.reduce(
    (acc, doc) => {
      acc.originals += doc.originals;
      acc.photocopies += doc.photocopies;
      acc.byHold[doc.hold] = (acc.byHold[doc.hold] || 0) + 1;
      return acc;
    },
    { originals: 0, photocopies: 0, byHold: {} },
  );

  const neverCheckIn = ordered.filter((doc) => doc.hold === "person" || doc.hold === "cabin").map((doc) => doc.label);

  const warnings = [];
  if (tripDays === 0) warnings.push("Outbound and return are the same day — check the return leg's date, not just its time.");
  if (flags.cash) {
    warnings.push("Cash declaration thresholds are per traveller and per direction, and a family's cash is normally added together.");
  }
  if (flags.driving) {
    warnings.push("An International Driving Permit is only valid presented with the home licence, and many are issued for one year only.");
  }
  if (!flags.hotel && tripType === "international") {
    warnings.push("No accommodation proof selected. Arrival immigration asks for an address on the landing card almost everywhere.");
  }

  return {
    tripDays,
    travellers: people,
    ruleLabel: rule.label,
    order: ordered,
    stages,
    totals,
    neverCheckIn,
    checks,
    warnings,
  };
}

/** A plain-text folder running order suitable for the clipboard. */
export function formatPlanText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    "Travel document folder — running order",
    `${plan.travellers} traveller${plan.travellers === 1 ? "" : "s"}, ${plan.tripDays} day trip`,
    "",
  ];
  plan.stages.forEach((stage) => {
    lines.push(`${stage.order}. ${stage.label}`);
    stage.docs.forEach((doc) => {
      const copies = doc.photocopies > 0 ? ` (+${doc.photocopies} photocopy)` : "";
      lines.push(`   ${doc.seq}. ${doc.label} — ${doc.holdLabel}${copies}`);
    });
  });
  lines.push("", `Originals to print or pack: ${plan.totals.originals}`, `Photocopies: ${plan.totals.photocopies}`);
  plan.checks.forEach((check) => lines.push(`${check.ok ? "OK" : "PROBLEM"}: ${check.label} — ${check.detail}`));
  return lines.join("\n");
}
