/**
 * Insurance nomination change request builder (India-focused).
 *
 * Pure module - no React, no DOM, no clocks. Every date is passed in.
 *
 * Statutory anchors, all from the Insurance Act, 1938 as substituted by the
 * Insurance Laws (Amendment) Act, 2015:
 *   s.39(1)  a policyholder on their own life may nominate the person(s) to
 *            whom the money secured by the policy is paid on death.
 *   s.39(2)  where the nominee is a minor, the policyholder MUST appoint a
 *            person (the "appointee") to receive the money during minority.
 *   s.39(6)  a nomination may be changed or cancelled at any time before the
 *            policy matures, and the change is only effective against the
 *            insurer once it has been given notice and the insurer has
 *            registered it. Registration is what this letter asks for.
 *   s.39(7)  where the nominee is the policyholder's parent, spouse, child, or
 *            spouse and children, the nominee is a "beneficial nominee" and is
 *            entitled to the proceeds, not merely a receiver of them.
 *   s.38(?)  an assignment or transfer of the policy cancels the nomination,
 *            except an assignment to the insurer as security for a loan.
 *
 * Majority is 18 under the Indian Majority Act, 1875, s.3.
 *
 * This is informational only. Nomination is not a substitute for a will, and
 * succession law can still decide who ultimately keeps the money.
 */

export const AGE_OF_MAJORITY = 18;

// Shares must total exactly this. Insurers reject anything else outright.
export const TOTAL_SHARE_PERCENT = 100;

// Floating-point tolerance when checking the share total.
export const SHARE_TOLERANCE = 0.01;

export const MAX_NOMINEES = 10;

export const RELATIONSHIPS = [
  { id: "spouse", label: "Spouse", beneficial: true },
  { id: "son", label: "Son", beneficial: true },
  { id: "daughter", label: "Daughter", beneficial: true },
  { id: "father", label: "Father", beneficial: true },
  { id: "mother", label: "Mother", beneficial: true },
  { id: "brother", label: "Brother", beneficial: false },
  { id: "sister", label: "Sister", beneficial: false },
  { id: "grandchild", label: "Grandchild", beneficial: false },
  { id: "other", label: "Other", beneficial: false },
];

export const POLICY_TYPES = [
  { id: "termLife", label: "Term life insurance" },
  { id: "endowment", label: "Endowment or money-back policy" },
  { id: "ulip", label: "Unit linked insurance plan (ULIP)" },
  { id: "wholeLife", label: "Whole life policy" },
  { id: "healthIndemnity", label: "Health indemnity policy" },
  { id: "personalAccident", label: "Personal accident policy" },
];

export const CHANGE_REASONS = [
  { id: "marriage", label: "Marriage" },
  { id: "childBirth", label: "Birth or adoption of a child" },
  { id: "death", label: "Death of the existing nominee" },
  { id: "divorce", label: "Divorce or separation" },
  { id: "majority", label: "Existing nominee has turned 18" },
  { id: "correction", label: "Correction of a wrongly recorded nominee" },
  { id: "other", label: "Other" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
}

export function formatLongDate(iso) {
  if (!isValidIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

/** Whole completed years between two ISO dates. Null if either is invalid. */
export function completedYears(fromIso, toIso) {
  if (!isValidIsoDate(fromIso) || !isValidIsoDate(toIso)) return null;
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  let years = ty - fy;
  if (tm < fm || (tm === fm && td < fd)) years -= 1;
  return years;
}

/** The date a person born on dobIso completes AGE_OF_MAJORITY years. */
export function majorityDate(dobIso) {
  if (!isValidIsoDate(dobIso)) return null;
  const [y, m, d] = dobIso.split("-").map(Number);
  const targetYear = y + AGE_OF_MAJORITY;
  const daysInMonth = new Date(Date.UTC(targetYear, m, 0)).getUTCDate();
  const pad = (n) => String(n).padStart(2, "0");
  return `${targetYear}-${pad(m)}-${pad(Math.min(d, daysInMonth))}`;
}

/**
 * Split a sum assured across nominees by share, rounded to whole units, with
 * the rounding difference absorbed by the largest share so the parts add up.
 * @returns {number[]} payouts in the same order as the shares
 */
export function splitSumAssured(sumAssured, shares) {
  if (!Number.isFinite(sumAssured) || sumAssured < 0) return [];
  if (!Array.isArray(shares) || shares.length === 0) return [];
  const rounded = shares.map((share) => Math.round((sumAssured * share) / TOTAL_SHARE_PERCENT));
  const drift = Math.round(sumAssured) - rounded.reduce((sum, value) => sum + value, 0);
  if (drift !== 0) {
    let largest = 0;
    for (let i = 1; i < shares.length; i += 1) {
      if (shares[i] > shares[largest]) largest = i;
    }
    rounded[largest] += drift;
  }
  return rounded;
}

const clean = (value) => String(value ?? "").trim();

function lookup(list, id, fallback) {
  return list.find((item) => item.id === id) || fallback;
}

/**
 * Build the nomination change request.
 * @returns {{error: string}} on bad input, otherwise the letter and figures.
 */
export function buildNomineeChangeRequest(input = {}) {
  const policyholderName = clean(input.policyholderName);
  const policyNumber = clean(input.policyNumber);
  const insurerName = clean(input.insurerName);
  const branchAddress = clean(input.branchAddress);
  const policyholderAddress = clean(input.policyholderAddress);
  const contactPhone = clean(input.contactPhone);
  const contactEmail = clean(input.contactEmail);
  const existingNominee = clean(input.existingNominee);
  const appointeeName = clean(input.appointeeName);
  const appointeeRelationship = clean(input.appointeeRelationship);
  const otherReason = clean(input.otherReason);
  const letterDate = clean(input.letterDate);
  const policyTypeId = clean(input.policyTypeId) || "termLife";
  const reasonId = clean(input.reasonId) || "marriage";
  const isMwpPolicy = Boolean(input.isMwpPolicy);
  const isAssigned = Boolean(input.isAssigned);
  const rawNominees = Array.isArray(input.nominees) ? input.nominees : [];

  const sumAssured = Number(input.sumAssured);

  if (!policyholderName) return { error: "Enter the policyholder's name exactly as it appears on the policy." };
  if (!policyNumber) return { error: "Enter the policy number." };
  if (!insurerName) return { error: "Enter the insurer's name." };
  if (!isValidIsoDate(letterDate)) return { error: "Enter a valid letter date in YYYY-MM-DD form." };
  if (!Number.isFinite(sumAssured) || sumAssured <= 0) {
    return { error: "Enter the sum assured so the share percentages can be turned into amounts." };
  }
  if (isMwpPolicy) {
    return {
      error: "This is recorded as a Married Women's Property Act, 1874 policy. The proceeds are held on trust for the named beneficiaries and section 39 nomination does not apply - the trustees, not a nomination form, control any change. Speak to the insurer and a lawyer.",
    };
  }

  const nominees = rawNominees
    .map((nominee) => ({
      name: clean(nominee?.name),
      relationshipId: clean(nominee?.relationshipId) || "other",
      dob: clean(nominee?.dob),
      sharePercent: Number(nominee?.sharePercent),
      address: clean(nominee?.address),
    }))
    .filter((nominee) => nominee.name || Number.isFinite(nominee.sharePercent));

  if (nominees.length === 0) return { error: "Add at least one nominee." };
  if (nominees.length > MAX_NOMINEES) return { error: `List no more than ${MAX_NOMINEES} nominees on a single request.` };
  if (nominees.some((nominee) => !nominee.name)) return { error: "Every nominee needs a full name." };
  if (nominees.some((nominee) => !isValidIsoDate(nominee.dob))) {
    return { error: "Every nominee needs a valid date of birth in YYYY-MM-DD form - it decides whether an appointee is required." };
  }
  if (nominees.some((nominee) => completedYears(nominee.dob, letterDate) < 0)) {
    return { error: "A nominee's date of birth is after the letter date." };
  }
  if (nominees.some((nominee) => !Number.isFinite(nominee.sharePercent) || nominee.sharePercent <= 0 || nominee.sharePercent > TOTAL_SHARE_PERCENT)) {
    return { error: `Each share must be more than 0% and at most ${TOTAL_SHARE_PERCENT}%.` };
  }

  const shares = nominees.map((nominee) => nominee.sharePercent);
  const shareTotal = shares.reduce((sum, value) => sum + value, 0);
  if (Math.abs(shareTotal - TOTAL_SHARE_PERCENT) > SHARE_TOLERANCE) {
    const gap = TOTAL_SHARE_PERCENT - shareTotal;
    return {
      error: `The shares add up to ${shareTotal.toFixed(2)}%, not 100%. ${gap > 0 ? `Add ${gap.toFixed(2)}%` : `Remove ${Math.abs(gap).toFixed(2)}%`} before sending - insurers reject a nomination that does not total 100%.`,
    };
  }

  const payouts = splitSumAssured(sumAssured, shares);

  const enriched = nominees.map((nominee, index) => {
    const relationship = lookup(RELATIONSHIPS, nominee.relationshipId, RELATIONSHIPS[8]);
    const age = completedYears(nominee.dob, letterDate);
    const minor = age < AGE_OF_MAJORITY;
    const majority = majorityDate(nominee.dob);
    return {
      ...nominee,
      relationshipLabel: relationship.label,
      beneficial: relationship.beneficial,
      age,
      minor,
      majorityDate: majority,
      majorityLabel: majority ? formatLongDate(majority) : "",
      yearsToMajority: minor ? AGE_OF_MAJORITY - age : 0,
      payout: payouts[index],
    };
  });

  const minors = enriched.filter((nominee) => nominee.minor);
  if (minors.length > 0 && !appointeeName) {
    return {
      error: `${minors.length === 1 ? "One nominee is" : `${minors.length} nominees are`} under ${AGE_OF_MAJORITY}. Section 39(2) of the Insurance Act, 1938 requires an appointee to be named to receive the money during minority.`,
    };
  }

  const policyType = lookup(POLICY_TYPES, policyTypeId, POLICY_TYPES[0]);
  const reason = lookup(CHANGE_REASONS, reasonId, CHANGE_REASONS[0]);
  const reasonText = reason.id === "other" ? otherReason || "a change in personal circumstances" : reason.label.toLowerCase();
  const beneficialCount = enriched.filter((nominee) => nominee.beneficial).length;

  const money = (value) => `INR ${Math.round(value).toLocaleString("en-IN")}`;

  const warnings = [];
  if (isAssigned) {
    warnings.push("The policy is recorded as assigned or transferred. An assignment cancels an existing nomination under the Insurance Act, except an assignment to the insurer as security for a loan - confirm with the insurer whether a fresh nomination can be registered at all right now.");
  }
  if (minors.length > 0) {
    warnings.push(`${minors.length} minor nominee${minors.length === 1 ? "" : "s"}. The appointee holds the money until the nominee turns ${AGE_OF_MAJORITY}; review the nomination on ${minors.map((nominee) => nominee.majorityLabel).join(", ")} and remove the appointee then.`);
  }
  if (beneficialCount === 0) {
    warnings.push("None of the nominees is a parent, spouse or child, so none is a beneficial nominee under s.39(7). They would receive the money as a trustee for the legal heirs rather than keep it - a will is what decides who ultimately gets it.");
  } else if (beneficialCount < enriched.length) {
    warnings.push("Some nominees are beneficial nominees under s.39(7) and some are not. The non-beneficial ones hold their share for the legal heirs, which is rarely what people intend - a will removes the ambiguity.");
  }
  if (enriched.length > 3) {
    warnings.push(`${enriched.length} nominees means ${enriched.length} sets of KYC documents and ${enriched.length} claims to settle. Insurers process fewer, larger shares faster.`);
  }
  if (shares.some((share) => share < 5)) {
    warnings.push("A share below 5% produces a payout small enough that the claim paperwork may cost the nominee more than they receive.");
  }

  const nomineeLines = enriched.map((nominee, index) => [
    `${index + 1}. ${nominee.name}`,
    `   Relationship to policyholder: ${nominee.relationshipLabel}`,
    `   Date of birth: ${formatLongDate(nominee.dob)} (age ${nominee.age}${nominee.minor ? " - MINOR" : ""})`,
    `   Share: ${nominee.sharePercent}% = ${money(nominee.payout)}`,
    nominee.address ? `   Address: ${nominee.address}` : null,
  ].filter(Boolean).join("\n")).join("\n\n");

  const letterText = [
    formatLongDate(letterDate),
    "",
    "To,",
    "The Branch Manager / Policy Servicing Department",
    insurerName,
    branchAddress || "________________________________",
    "",
    `Subject: Request to change the nomination on policy no. ${policyNumber}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I, ${policyholderName}, am the holder of ${policyType.label.toLowerCase()} policy number ${policyNumber} issued by ${insurerName}, with a sum assured of ${money(sumAssured)}. I hold this policy on my own life.`,
    "",
    existingNominee
      ? `The nomination currently registered on the policy is in favour of ${existingNominee}. Following ${reasonText}, I wish to cancel that nomination and register a fresh one.`
      : `Following ${reasonText}, I wish to change the nomination registered on this policy.`,
    "",
    "I request you to register the following person(s) as nominee(s) under section 39 of the Insurance Act, 1938:",
    "",
    nomineeLines,
    "",
    appointeeName
      ? `As ${minors.length === 1 ? "one of the nominees is a minor" : "some of the nominees are minors"}, I appoint ${appointeeName}${appointeeRelationship ? `, my ${appointeeRelationship}` : ""}, as the appointee under section 39(2) of the Insurance Act, 1938, to receive the money secured by the policy during the minority of the nominee(s). The appointee's signed consent is enclosed.`
      : "All nominees named above are of full age, so no appointee is required.",
    "",
    "The share percentages above total 100%. Please record them exactly as stated and issue me a written endorsement, or an updated policy schedule, confirming the change so that I have proof the nomination has been registered.",
    "",
    "Enclosures:",
    "1. Nomination change form, signed",
    "2. Copy of the policy document / first page of the policy schedule",
    "3. Photo identity and address proof of the policyholder",
    "4. Photo identity and date-of-birth proof of each nominee",
    appointeeName ? "5. Photo identity and address proof of the appointee, with signed consent" : null,
    "6. Cancelled cheque or bank statement, if requested",
    "",
    "I confirm that the policy is in force, that the details above are true, and that I am making this nomination of my own free will.",
    "",
    "Yours faithfully,",
    "",
    "",
    "________________________",
    policyholderName,
    policyholderAddress || "Address: ________________________________",
    contactPhone ? `Phone: ${contactPhone}` : "Phone: ______________",
    contactEmail ? `Email: ${contactEmail}` : "Email: ______________",
    `Policy no.: ${policyNumber}`,
  ].filter((line) => line !== null).join("\n");

  return {
    letterText,
    nominees: enriched,
    shareTotal,
    sumAssured,
    minorCount: minors.length,
    beneficialCount,
    nomineeCount: enriched.length,
    policyTypeLabel: policyType.label,
    reasonLabel: reason.label,
    appointeeName,
    isAssigned,
    warnings,
  };
}
