/**
 * Gym / club membership refund, freeze and transfer policy generator.
 *
 * The refund maths is a straight pro-rata of the UNUSED entitlement:
 *
 *   pro-rata refund = plan fee x (unused days / term days)
 *
 * where frozen days are not counted as used, because a freeze suspends the
 * entitlement rather than consuming it. The rules the drafted clauses rest on:
 *
 *  - Consumer Protection Act 2019, Section 2(46) and Section 2(47): a contract
 *    term that imposes an unreasonable charge or condition putting the consumer
 *    at a disadvantage is an unfair contract, and refusing a refund that the
 *    contract promises is an unfair trade practice. A blanket "no refund under
 *    any circumstances" clause is therefore flagged by this module.
 *  - Consumer Protection Act 2019, Section 2(11): a club that closes, moves or
 *    stops offering the facility sold is in deficiency of service, so the
 *    unused period must be returned in full without a cancellation charge.
 *  - Consumer Protection Act 2019, Section 69: a consumer has two years from
 *    the cause of action to file a complaint.
 *  - CBIC Circular No. 178/10/2022-GST dated 3 August 2022: an amount retained
 *    as a cancellation charge is taxed at the same GST rate as the underlying
 *    supply, so GST is returned only on the refunded slice.
 *  - Health club and fitness centre services (SAC 999723) are taxed at 18% GST,
 *    which is the default rate offered below; confirm your own classification.
 *  - Consumer Protection (E-Commerce) Rules 2020, Rule 4(5): complaints
 *    acknowledged within 48 hours and redressed within one month.
 *
 * Informational only; not legal or tax advice.
 */

/** Default GST rate for health club / fitness centre services, SAC 999723. */
export const FITNESS_GST_PERCENT = 18;
/** Rule 4(5), Consumer Protection (E-Commerce) Rules 2020. */
export const ACK_HOURS_LIMIT = 48;
/** Rule 4(5) outer limit for redressal, in days. */
export const REDRESS_DAYS_LIMIT = 30;
/** Section 69, Consumer Protection Act 2019. */
export const COMPLAINT_LIMITATION_YEARS = 2;

const MS_PER_DAY = 86400000;
/** Longest membership term this calculator will accept (10 years). */
const MAX_TERM_DAYS = 3653;
/** Longest a free-text field may run. */
const MAX_FIELD = 120;

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

/** Why a member is leaving, and what that does to the cancellation charge. */
export const EXIT_REASONS = [
  {
    id: "member-choice",
    label: "Member simply wants to stop",
    waivesCharge: false,
    waivesLockIn: false,
    note: "The ordinary pro-rata rule and cancellation charge apply.",
  },
  {
    id: "medical",
    label: "Medical reason, with a doctor's certificate",
    waivesCharge: true,
    waivesLockIn: true,
    note: "A documented medical bar on exercise is outside the member's control, so the unused period is returned without a cancellation charge.",
  },
  {
    id: "relocation",
    label: "Relocation beyond reach of any branch",
    waivesCharge: true,
    waivesLockIn: true,
    note: "The member can no longer use what was sold, so the unused period is returned without a cancellation charge.",
  },
  {
    id: "club-closure",
    label: "The club closed, moved or withdrew the facility",
    waivesCharge: true,
    waivesLockIn: true,
    note: "Failure to provide the facility sold is a deficiency in service under Section 2(11) of the Consumer Protection Act 2019, so the whole unused period is refunded.",
  },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function roundPaise(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

/**
 * Whole days from the first date to the second. Negative if the second is earlier.
 * @param {string} fromIso
 * @param {string} toIso
 * @returns {number|null}
 */
export function daysBetween(fromIso, toIso) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (from === null || to === null) return null;
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Add whole days to a yyyy-mm-dd date.
 * @param {string} iso
 * @param {number} days
 * @returns {{iso:string, long:string}|null}
 */
export function addDays(iso, days) {
  const start = parseIsoDate(iso);
  if (start === null || !Number.isInteger(days)) return null;
  const end = new Date(start + days * MS_PER_DAY);
  const yyyy = String(end.getUTCFullYear()).padStart(4, "0");
  const mm = String(end.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(end.getUTCDate()).padStart(2, "0");
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    long: `${end.getUTCDate()} ${MONTH_NAMES[end.getUTCMonth()]} ${end.getUTCFullYear()}`,
  };
}

/**
 * Format yyyy-mm-dd as "1 July 2026".
 * @param {string} iso
 * @returns {string|null}
 */
export function formatIsoLong(iso) {
  const result = addDays(iso, 0);
  return result ? result.long : null;
}

/**
 * Price one membership cancellation.
 *
 * Term length is inclusive of both the start and the end date, so a plan that
 * runs 1 January to 31 December of a common year is 365 days.
 *
 * @param {object} input
 * @param {number} input.planFee            Plan fee excluding GST and joining fee.
 * @param {number} [input.joiningFee]       One-time admission fee, excluding GST.
 * @param {number} [input.gstPercent]       GST charged on the membership.
 * @param {string} input.startDate          yyyy-mm-dd the term begins.
 * @param {string} input.endDate            yyyy-mm-dd the term ends.
 * @param {string} input.cancelDate         yyyy-mm-dd the cancellation takes effect.
 * @param {number} [input.freezeDaysUsed]   Days already frozen before cancelling.
 * @param {number} [input.cancellationFeePercent] Charge on the pro-rata amount.
 * @param {number} [input.cancellationFeeCap]     Rupee cap on that charge, 0 = no cap.
 * @param {number} [input.lockInDays]       Days before any refund is allowed.
 * @param {boolean} [input.joiningFeeRefundable]
 * @param {string} [input.reasonId]         One of EXIT_REASONS ids.
 * @returns {{termDays:number, activeDaysUsed:number, unusedDays:number,
 *            grossPaid:number, proRataRefund:number, cancellationCharge:number,
 *            joiningRefund:number, refundExGst:number, gstRefund:number,
 *            totalRefund:number, retained:number, refundSharePercent:number,
 *            lockInBlocked:boolean, extendedEndDate:string, reasonNote:string}
 *          | {error:string}}
 */
export function computeMembershipRefund({
  planFee,
  joiningFee = 0,
  gstPercent = FITNESS_GST_PERCENT,
  startDate,
  endDate,
  cancelDate,
  freezeDaysUsed = 0,
  cancellationFeePercent = 0,
  cancellationFeeCap = 0,
  lockInDays = 0,
  joiningFeeRefundable = false,
  reasonId = "member-choice",
}) {
  const plan = Number(planFee);
  const joining = Number(joiningFee);
  const gst = Number(gstPercent);
  const frozen = Number(freezeDaysUsed);
  const chargePercent = Number(cancellationFeePercent);
  const chargeCap = Number(cancellationFeeCap);
  const lockIn = Number(lockInDays);

  if (![plan, joining, gst, frozen, chargePercent, chargeCap, lockIn].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers for the fees, GST rate, freeze days and charges." };
  }
  if (!(plan > 0)) return { error: "Plan fee must be greater than zero." };
  if (joining < 0 || chargeCap < 0) return { error: "Fees and caps cannot be negative." };
  if (gst < 0 || gst > 100) return { error: "GST rate must be between 0% and 100%." };
  if (chargePercent < 0 || chargePercent > 100) {
    return { error: "Cancellation charge must be between 0% and 100% of the refundable amount." };
  }
  if (!Number.isInteger(frozen) || frozen < 0) {
    return { error: "Freeze days must be a whole number of days, zero or more." };
  }
  if (!Number.isInteger(lockIn) || lockIn < 0) {
    return { error: "Lock-in must be a whole number of days, zero or more." };
  }

  const reason = EXIT_REASONS.find((item) => item.id === reasonId);
  if (!reason) return { error: "Choose the reason the membership is ending." };

  const span = daysBetween(startDate, endDate);
  if (span === null) return { error: "Enter valid start and end dates in yyyy-mm-dd form." };
  if (span < 0) return { error: "The membership end date falls before its start date." };
  const termDays = span + 1;
  if (termDays > MAX_TERM_DAYS) {
    return { error: "A membership term longer than ten years is outside what this tool handles." };
  }

  const elapsed = daysBetween(startDate, cancelDate);
  if (elapsed === null) return { error: "Enter a valid cancellation date in yyyy-mm-dd form." };
  if (elapsed < 0) {
    return { error: "The cancellation date falls before the membership starts." };
  }
  if (frozen > elapsed) {
    return { error: "Freeze days cannot exceed the days that have passed since the start date." };
  }

  const activeDaysUsed = Math.min(Math.max(elapsed - frozen, 0), termDays);
  const unusedDays = Math.max(termDays - activeDaysUsed, 0);

  const gstOnPlan = roundPaise(plan * (gst / 100));
  const gstOnJoining = roundPaise(joining * (gst / 100));
  const grossPaid = roundPaise(plan + joining + gstOnPlan + gstOnJoining);

  const lockInBlocked = !reason.waivesLockIn && activeDaysUsed < lockIn;

  const proRataRefund = lockInBlocked ? 0 : roundPaise((plan * unusedDays) / termDays);

  let cancellationCharge = 0;
  if (!lockInBlocked && !reason.waivesCharge) {
    cancellationCharge = roundPaise(proRataRefund * (chargePercent / 100));
    if (chargeCap > 0) cancellationCharge = Math.min(cancellationCharge, chargeCap);
  }

  const joiningRefund =
    reason.id === "club-closure" || joiningFeeRefundable ? roundPaise(joining) : 0;

  const refundExGst = roundPaise(Math.max(proRataRefund - cancellationCharge, 0) + joiningRefund);
  const gstRefund = roundPaise(refundExGst * (gst / 100));
  const totalRefund = roundPaise(refundExGst + gstRefund);
  const retained = roundPaise(grossPaid - totalRefund);

  const extended = addDays(endDate, frozen);

  return {
    termDays,
    activeDaysUsed,
    unusedDays,
    grossPaid,
    proRataRefund,
    cancellationCharge,
    joiningRefund,
    refundExGst,
    gstRefund,
    totalRefund,
    retained,
    refundSharePercent: roundPaise((totalRefund / grossPaid) * 100),
    lockInBlocked,
    extendedEndDate: extended ? extended.long : "",
    reasonNote: lockInBlocked
      ? `The member is still inside the ${lockIn}-day lock-in, so no pro-rata refund is due under this policy. Consider whether that is defensible - an unreasonable lock-in can be challenged as an unfair contract term under Section 2(46) of the Consumer Protection Act 2019.`
      : reason.note,
  };
}

/**
 * Assemble the published membership policy.
 *
 * @param {object} input
 * @param {string} input.clubName
 * @param {string} input.city
 * @param {string} input.contactEmail
 * @param {string} input.effectiveDate      yyyy-mm-dd
 * @param {number} input.lockInDays
 * @param {number} input.noticeDays         Written notice before cancellation bites.
 * @param {number} input.cancellationFeePercent
 * @param {number} input.cancellationFeeCap
 * @param {boolean} input.joiningFeeRefundable
 * @param {boolean} input.freezeAllowed
 * @param {number} input.maxFreezeDaysPerYear
 * @param {number} input.minFreezeBlockDays
 * @param {boolean} input.transferAllowed
 * @param {number} input.transferFee
 * @param {number} input.ackHours
 * @param {number} input.redressDays
 * @param {number} input.gstPercent
 * @returns {{policyText:string, clauses:{title:string, body:string}[],
 *            effectiveLong:string, warning:string|null} | {error:string}}
 */
export function buildMembershipPolicy({
  clubName,
  city,
  contactEmail,
  effectiveDate,
  lockInDays = 0,
  noticeDays = 0,
  cancellationFeePercent = 0,
  cancellationFeeCap = 0,
  joiningFeeRefundable = false,
  freezeAllowed = true,
  maxFreezeDaysPerYear = 30,
  minFreezeBlockDays = 7,
  transferAllowed = true,
  transferFee = 0,
  ackHours,
  redressDays,
  gstPercent = FITNESS_GST_PERCENT,
}) {
  const club = clean(clubName);
  const place = clean(city);
  const email = clean(contactEmail);

  if (!club) return { error: "Enter the gym or club name." };
  if (!place) return { error: "Enter the city the club operates in." };
  if (!email) return { error: "Enter a contact email for cancellation requests." };
  if ([club, place, email].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const effectiveLong = formatIsoLong(effectiveDate);
  if (!effectiveLong) return { error: "Enter a valid effective date." };

  const numbers = {
    lockInDays: Number(lockInDays),
    noticeDays: Number(noticeDays),
    maxFreezeDaysPerYear: Number(maxFreezeDaysPerYear),
    minFreezeBlockDays: Number(minFreezeBlockDays),
    ackHours: Number(ackHours),
    redressDays: Number(redressDays),
  };
  if (!Object.values(numbers).every((value) => Number.isInteger(value) && value >= 0)) {
    return { error: "Lock-in, notice, freeze and response periods must be whole numbers of days or hours." };
  }
  if (numbers.ackHours < 1 || numbers.ackHours > ACK_HOURS_LIMIT) {
    return {
      error: `Acknowledgement time must be 1 to ${ACK_HOURS_LIMIT} hours - Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020 caps it at ${ACK_HOURS_LIMIT} hours.`,
    };
  }
  if (numbers.redressDays < 1 || numbers.redressDays > REDRESS_DAYS_LIMIT) {
    return { error: `Resolution time must be 1 to ${REDRESS_DAYS_LIMIT} days under Rule 4(5).` };
  }
  if (numbers.maxFreezeDaysPerYear > 365) {
    return { error: "Freeze allowance cannot exceed 365 days in a year." };
  }
  if (freezeAllowed && numbers.minFreezeBlockDays > numbers.maxFreezeDaysPerYear) {
    return { error: "The minimum freeze block is longer than the total freeze allowance." };
  }

  const chargePercent = Number(cancellationFeePercent);
  const chargeCap = Number(cancellationFeeCap);
  const fee = Number(transferFee);
  const gst = Number(gstPercent);
  if (![chargePercent, chargeCap, fee, gst].every((value) => Number.isFinite(value) && value >= 0)) {
    return { error: "Charges and the GST rate must be valid non-negative numbers." };
  }
  if (chargePercent > 100 || gst > 100) {
    return { error: "Percentages must be between 0 and 100." };
  }

  const warning =
    chargePercent >= 100
      ? "A cancellation charge that swallows the entire pro-rata refund leaves the member with nothing for the period they cannot use. That is the kind of one-sided term a consumer commission can examine under Section 2(46) of the Consumer Protection Act 2019."
      : numbers.lockInDays > 180
        ? `A lock-in of ${numbers.lockInDays} days blocks any refund for more than six months. Long lock-ins are frequently challenged as unfair contract terms - be sure you can justify it in writing at the point of sale.`
        : null;

  const clauses = [
    {
      title: "1. Who this applies to",
      body: `This policy governs every membership sold by ${club}, ${place}, and takes effect on ${effectiveLong}. It applies to memberships bought on or after that date, and is displayed at the desk and on the membership form before payment is taken.`,
    },
    {
      title: "2. Cooling-off and lock-in",
      body:
        numbers.lockInDays > 0
          ? `Memberships carry a lock-in of ${numbers.lockInDays} day${numbers.lockInDays === 1 ? "" : "s"} from the start date. During lock-in a membership may be frozen or transferred but is not refundable, except on the grounds in clause 5. The lock-in is disclosed on the membership form before payment.`
          : "There is no lock-in period. A membership can be cancelled at any time and the unused portion is refunded pro rata under clause 3.",
    },
    {
      title: "3. How a refund is calculated",
      body: `On cancellation we refund the plan fee for the unused part of the term, worked out as: plan fee multiplied by unused days, divided by the total days in the term. Days on which the membership was frozen are not counted as used. ${
        chargePercent > 0
          ? `A cancellation charge of ${chargePercent}% of that refundable amount${chargeCap > 0 ? `, capped at Rs ${chargeCap}` : ""} covers the administration of closing the account.`
          : "No cancellation charge is deducted."
      } ${
        joiningFeeRefundable
          ? "The joining or admission fee is refunded along with the plan fee."
          : "The joining or admission fee covers one-time enrolment, orientation and card issue costs and is not refundable, except where clause 5 applies."
      }`,
    },
    {
      title: "4. Notice and effective date",
      body:
        numbers.noticeDays > 0
          ? `Cancellation must be requested in writing to ${email}. It takes effect ${numbers.noticeDays} day${numbers.noticeDays === 1 ? "" : "s"} after we receive it, and the unused period is counted from that effective date, not from the date you stopped attending.`
          : `Cancellation must be requested in writing to ${email} and takes effect on the day we receive it. The unused period is counted from that date, not from the date you stopped attending.`,
    },
    {
      title: "5. Medical, relocation and club-side cancellations",
      body: `Where a registered medical practitioner certifies that you must stop exercising, or where you relocate beyond reach of any of our branches, the unused period is refunded without any cancellation charge. If ${club} closes the facility, moves it, or withdraws a service you paid for, we refund the whole unused period along with the joining fee, because failure to provide the facility sold is a deficiency in service under Section 2(11) of the Consumer Protection Act 2019.`,
    },
    {
      title: "6. Freezing a membership",
      body: freezeAllowed
        ? `You may freeze your membership for up to ${numbers.maxFreezeDaysPerYear} day${numbers.maxFreezeDaysPerYear === 1 ? "" : "s"} in any twelve-month period, in blocks of at least ${numbers.minFreezeBlockDays} day${numbers.minFreezeBlockDays === 1 ? "" : "s"}, by writing to ${email} before the freeze begins. Your end date moves forward by exactly the number of days frozen. Frozen days do not count as used days when a refund is calculated, and a freeze cannot be applied retrospectively.`
        : "Memberships cannot be frozen. Any break in attendance still counts against the term.",
    },
    {
      title: "7. Transferring a membership",
      body: transferAllowed
        ? `A membership may be transferred once to another person who meets our joining conditions${fee > 0 ? `, on payment of a transfer fee of Rs ${fee}` : ", free of charge"}. The remaining term passes to the new member unchanged; the joining fee is not charged again.`
        : "Memberships are personal to the member named on the form and cannot be transferred.",
    },
    {
      title: "8. Tax on the amount we retain",
      body: `Membership fees carry GST at ${gst}%. Where a refund is partial, GST is returned only on the refunded amount. Any cancellation charge we keep is taxed at the same ${gst}% rate as the membership itself, following CBIC Circular No. 178/10/2022-GST dated 3 August 2022, and that tax is deposited with the government.`,
    },
    {
      title: "9. Complaints",
      body: `Write to ${email}. We acknowledge within ${numbers.ackHours} hour${numbers.ackHours === 1 ? "" : "s"} and settle within ${numbers.redressDays} day${numbers.redressDays === 1 ? "" : "s"}. If you remain dissatisfied you may approach the District Consumer Disputes Redressal Commission within ${COMPLAINT_LIMITATION_YEARS} years of the cause of action under Section 69 of the Consumer Protection Act 2019. Nothing in this policy limits your statutory rights.`,
    },
  ];

  const policyText = [
    `${club.toUpperCase()} - MEMBERSHIP REFUND, FREEZE AND TRANSFER POLICY`,
    `Effective from ${effectiveLong}`,
    "",
    ...clauses.flatMap((clause) => [clause.title, clause.body, ""]),
    `Cancellation and freeze requests: ${email}`,
  ]
    .join("\n")
    .trim();

  return { policyText, clauses, effectiveLong, warning };
}
