/**
 * Video testimonial consent / release form builder.
 *
 * Pure module: no React, no DOM, no clocks. All dates are passed in as
 * ISO `YYYY-MM-DD` strings so the same input always produces the same document.
 *
 * The document structure follows the four things a usable media release has to
 * name explicitly for the permission to be meaningful:
 *   1. WHAT is being licensed (the recording, the person's name, voice, likeness)
 *   2. WHERE it may appear (named channels, not "any media")
 *   3. HOW LONG the permission lasts (a term with an end date, or perpetual)
 *   4. HOW the person takes it back (a withdrawal route with a notice period)
 * Consent that is unspecified on any of those four is the usual reason a
 * testimonial has to be pulled later.
 */

// A person signs for themselves only once they are of full age.
// India: Indian Majority Act, 1875, s.3 - majority is attained on completing 18 years.
// The same threshold applies in the UK, most of the EU and most US states.
export const AGE_OF_MAJORITY = 18;

// Default notice the signer gives when withdrawing, so live ad flights,
// printed collateral and cached CDN copies can actually be pulled.
export const DEFAULT_WITHDRAWAL_NOTICE_DAYS = 30;

// Longest fixed term this generator will write. Beyond this a fixed term is
// fiction - say "perpetual" instead so the signer knows what they agreed to.
export const MAX_TERM_YEARS = 25;

// Upper bound on a sane withdrawal notice period (roughly six months).
export const MAX_WITHDRAWAL_NOTICE_DAYS = 180;

export const MEDIA_CHANNELS = [
  { id: "website", label: "Company website, blog and landing pages" },
  { id: "social", label: "Organic social media (Instagram, LinkedIn, YouTube, X, Facebook)" },
  { id: "paidAds", label: "Paid advertising (search, social, display, OTT and video ads)" },
  { id: "email", label: "Email newsletters and lifecycle campaigns" },
  { id: "sales", label: "Sales decks, proposals and written case studies" },
  { id: "events", label: "Conferences, trade-show booths and in-store screens" },
  { id: "press", label: "Press releases, media kits and journalist briefings" },
  { id: "appStore", label: "App store and marketplace listings" },
];

export const TERRITORIES = [
  { id: "worldwide", label: "Worldwide" },
  { id: "india", label: "India only" },
  { id: "eeaUk", label: "European Economic Area and the United Kingdom" },
  { id: "usCa", label: "United States and Canada" },
];

export const COMPENSATION_TYPES = [
  { id: "none", label: "No payment - given voluntarily" },
  { id: "gift", label: "Gift, discount or product credit" },
  { id: "fee", label: "One-time fee" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** True only for a real calendar date written as YYYY-MM-DD. */
export function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const stamp = Date.UTC(y, m - 1, d);
  const check = new Date(stamp);
  return (
    check.getUTCFullYear() === y &&
    check.getUTCMonth() === m - 1 &&
    check.getUTCDate() === d
  );
}

/**
 * Add whole years to an ISO date. 29 February clamps to 28 February in a
 * non-leap year, which is how anniversary dates are read in practice.
 */
export function addYearsIso(iso, years) {
  if (!isValidIsoDate(iso) || !Number.isFinite(years)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const targetYear = y + Math.trunc(years);
  const daysInMonth = new Date(Date.UTC(targetYear, m, 0)).getUTCDate();
  const day = Math.min(d, daysInMonth);
  const pad = (n) => String(n).padStart(2, "0");
  return `${targetYear}-${pad(m)}-${pad(day)}`;
}

/** Whole days between two ISO dates (b - a). Negative when b is earlier. */
export function daysBetweenIso(a, b) {
  if (!isValidIsoDate(a) || !isValidIsoDate(b)) return null;
  const toStamp = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toStamp(b) - toStamp(a)) / 86400000);
}

/** "2026-07-28" -> "28 July 2026". Locale-independent so output is stable. */
export function formatLongDate(iso) {
  if (!isValidIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

const clean = (value) => String(value ?? "").trim();

function labelsFor(list, ids) {
  const wanted = new Set(Array.isArray(ids) ? ids : []);
  return list.filter((item) => wanted.has(item.id)).map((item) => item.label);
}

function lookupLabel(list, id, fallback) {
  const hit = list.find((item) => item.id === id);
  return hit ? hit.label : fallback;
}

/**
 * Build the consent form.
 *
 * @returns {{error: string}} for unusable input, otherwise the document,
 *          its sections, the computed expiry date, warnings and a
 *          completeness score.
 */
export function buildVideoTestimonialConsent(input = {}) {
  const participantName = clean(input.participantName);
  const participantEmail = clean(input.participantEmail);
  const guardianName = clean(input.guardianName);
  const companyName = clean(input.companyName);
  const companyAddress = clean(input.companyAddress);
  const jobTitle = clean(input.jobTitle);
  const recordingDescription = clean(input.recordingDescription);
  const compensationDetail = clean(input.compensationDetail);
  const privacyContact = clean(input.privacyContact);
  const recordingDate = clean(input.recordingDate);
  const effectiveDate = clean(input.effectiveDate);
  const channels = Array.isArray(input.channels) ? input.channels : [];
  const territoryId = clean(input.territoryId) || "worldwide";
  const compensationType = clean(input.compensationType) || "none";
  const isMinor = Boolean(input.isMinor);
  const allowEditing = Boolean(input.allowEditing);
  const allowNameUse = Boolean(input.allowNameUse);
  const allowEmployerUse = Boolean(input.allowEmployerUse);
  const allowSublicensing = Boolean(input.allowSublicensing);
  const perpetual = Boolean(input.perpetual);

  const termYears = Number(input.termYears);
  const noticeDays = Number(
    input.withdrawalNoticeDays === undefined || input.withdrawalNoticeDays === ""
      ? DEFAULT_WITHDRAWAL_NOTICE_DAYS
      : input.withdrawalNoticeDays,
  );

  if (!participantName) return { error: "Enter the name of the person appearing in the video." };
  if (!companyName) return { error: "Enter the name of the company that will use the testimonial." };
  if (!isValidIsoDate(effectiveDate)) {
    return { error: "Enter a valid signature date in YYYY-MM-DD form." };
  }
  if (recordingDate && !isValidIsoDate(recordingDate)) {
    return { error: "The recording date is not a real calendar date." };
  }
  if (channels.length === 0) {
    return { error: "Select at least one place the testimonial may appear - blanket consent to 'any media' is not specific enough to rely on." };
  }
  if (isMinor && !guardianName) {
    return { error: `The participant is under ${AGE_OF_MAJORITY}, so a parent or legal guardian must be named to sign.` };
  }
  if (!perpetual) {
    if (!Number.isFinite(termYears) || termYears <= 0) {
      return { error: "Enter a licence term of at least one year, or tick perpetual." };
    }
    if (termYears > MAX_TERM_YEARS) {
      return { error: `A fixed term longer than ${MAX_TERM_YEARS} years is better written as a perpetual licence.` };
    }
  }
  if (!Number.isFinite(noticeDays) || noticeDays < 0 || noticeDays > MAX_WITHDRAWAL_NOTICE_DAYS) {
    return { error: `Withdrawal notice must be between 0 and ${MAX_WITHDRAWAL_NOTICE_DAYS} days.` };
  }

  const wholeTerm = perpetual ? null : Math.round(termYears);
  const expiryDate = wholeTerm ? addYearsIso(effectiveDate, wholeTerm) : null;
  const termDays = expiryDate ? daysBetweenIso(effectiveDate, expiryDate) : null;
  const channelLabels = labelsFor(MEDIA_CHANNELS, channels);
  const territoryLabel = lookupLabel(TERRITORIES, territoryId, "Worldwide");
  const compensationLabel = lookupLabel(COMPENSATION_TYPES, compensationType, COMPENSATION_TYPES[0].label);
  const signerLine = isMinor
    ? `${guardianName} (parent / legal guardian of ${participantName})`
    : participantName;
  const noticeDaysWhole = Math.round(noticeDays);

  const warnings = [];
  if (perpetual && compensationType === "none") {
    warnings.push("A perpetual licence with no consideration is the combination most often disputed later. Consider a fixed renewable term.");
  }
  if (isMinor) {
    warnings.push(`The participant is under ${AGE_OF_MAJORITY}. Keep the guardian's signed copy and re-confirm the permission when they reach ${AGE_OF_MAJORITY}.`);
  }
  if (territoryId === "eeaUk" || territoryId === "worldwide") {
    warnings.push("Use in the EEA or UK means UK/EU GDPR applies: consent must be freely given, recorded, and as easy to withdraw as to give.");
  }
  if (channels.includes("paidAds") && compensationType === "none") {
    warnings.push("Paid advertising is a commercial use. Say so plainly to the signer before they sign.");
  }
  if (recordingDate && daysBetweenIso(recordingDate, effectiveDate) < 0) {
    warnings.push("The signature date is before the recording date - check both fields.");
  }
  if (noticeDaysWhole === 0) {
    warnings.push("Zero days notice means you must pull the video immediately on request, including from live ad flights.");
  }

  const optionalFields = [
    participantEmail,
    jobTitle,
    recordingDescription,
    companyAddress,
    privacyContact,
    recordingDate,
    compensationType !== "none" ? compensationDetail : "n/a",
  ];
  const filled = optionalFields.filter((value) => value.length > 0).length;
  const completenessPercent = Math.round((filled / optionalFields.length) * 100);

  const termSentence = perpetual
    ? "This permission is granted for an unlimited period and does not expire on its own."
    : `This permission runs for ${wholeTerm} year${wholeTerm === 1 ? "" : "s"} from ${formatLongDate(effectiveDate)} and ends on ${formatLongDate(expiryDate)} unless renewed in writing.`;

  const compensationSentence =
    compensationType === "none"
      ? "The participant gives this permission voluntarily and expects no payment, royalty or further consideration for it."
      : `In exchange for this permission the company will provide: ${compensationDetail || compensationLabel}. The participant confirms this is the full and only consideration.`;

  const sections = [
    {
      heading: "1. Parties",
      body: [
        `Participant: ${participantName}${jobTitle ? `, ${jobTitle}` : ""}`,
        participantEmail ? `Participant contact: ${participantEmail}` : null,
        isMinor ? `Signing guardian: ${guardianName}` : null,
        `Company: ${companyName}${companyAddress ? `, ${companyAddress}` : ""}`,
        `Date of this consent: ${formatLongDate(effectiveDate)}`,
      ].filter(Boolean).join("\n"),
    },
    {
      heading: "2. The recording",
      body: [
        recordingDescription
          ? `This consent covers the video testimonial described as: ${recordingDescription}.`
          : "This consent covers the video testimonial recorded by or for the company in which the participant appears.",
        recordingDate ? `Recorded on ${formatLongDate(recordingDate)}.` : null,
        "It also covers stills, clips, captions, subtitles and short cut-downs taken from that recording.",
      ].filter(Boolean).join(" "),
    },
    {
      heading: "3. What the participant permits",
      body: [
        `${signerLine} permits ${companyName} to publish and reuse the recording in the following places only:`,
        channelLabels.map((label) => `  - ${label}`).join("\n"),
        `Territory: ${territoryLabel}.`,
        termSentence,
        allowSublicensing
          ? "The company may pass these rights to its agencies, resellers and media partners for the same purposes."
          : "The company may not sell, sub-license or pass these rights to any third party without fresh written permission.",
      ].join("\n"),
    },
    {
      heading: "4. Name, voice and likeness",
      body: [
        allowNameUse
          ? `The company may show the participant's name (${participantName}) alongside the testimonial.`
          : "The company must not publish the participant's full name; a first name or initials only may be used.",
        allowEmployerUse && jobTitle
          ? `The company may show the participant's role and employer as: ${jobTitle}.`
          : "The company must not identify the participant's employer or job title.",
        "The company may use the participant's voice and likeness as captured in the recording, and must not use them to imply an endorsement of anything not shown in the recording.",
      ].join(" "),
    },
    {
      heading: "5. Editing",
      body: allowEditing
        ? "The company may edit, trim, subtitle, colour-grade and add music to the recording, provided the edit does not change the meaning of what the participant said."
        : "The company may only trim the recording for length and add captions. Any other edit needs the participant's written approval before publication.",
    },
    {
      heading: "6. Consideration",
      body: compensationSentence,
    },
    {
      heading: "7. Participant confirmations",
      body: [
        "The participant confirms that: the statements made in the recording are their own honest opinion and describe their real experience;",
        "they are free to give this permission and are not breaching any employment, confidentiality or exclusivity obligation by doing so;",
        "they will not claim any ownership of the finished marketing material;",
        "and they have been given a copy of this signed form.",
      ].join(" "),
    },
    {
      heading: "8. Withdrawing consent",
      body: [
        `The participant may withdraw this permission at any time by writing to ${privacyContact || companyName}.`,
        noticeDaysWhole === 0
          ? "The company will stop all further publication immediately on receiving that notice."
          : `The company will stop all further publication within ${noticeDaysWhole} days of receiving that notice.`,
        "Withdrawal is not retroactive: printed material already distributed, and copies already downloaded or reshared by third parties, cannot always be recalled. The company will not create new placements after the withdrawal date.",
      ].join(" "),
    },
    {
      heading: "9. Personal data",
      body: [
        `${companyName} will hold this signed form, the recording and the participant's contact details as the record of consent, and will keep them only for as long as the recording is in use plus the period required to defend a claim.`,
        privacyContact ? `Data questions and withdrawal requests: ${privacyContact}.` : null,
        "The participant may ask for a copy of the form, ask for their details to be corrected, or ask for the recording to be deleted, subject to the point above about material already distributed.",
      ].filter(Boolean).join(" "),
    },
    {
      heading: "10. Signatures",
      body: [
        `Signed by: ${signerLine}`,
        "Signature: ______________________    Date: ______________",
        "",
        `For ${companyName}`,
        "Name and role: ______________________",
        "Signature: ______________________    Date: ______________",
      ].join("\n"),
    },
  ];

  const title = "VIDEO TESTIMONIAL CONSENT AND RELEASE";
  const documentText = [
    title,
    "",
    ...sections.flatMap((section) => [section.heading, section.body, ""]),
    "This form is an informational template, not legal advice. Have a qualified lawyer review it before you rely on it in your jurisdiction.",
  ].join("\n");

  const wordCount = documentText.split(/\s+/).filter(Boolean).length;

  return {
    title,
    sections,
    documentText,
    wordCount,
    channelCount: channelLabels.length,
    channelLabels,
    territoryLabel,
    compensationLabel,
    signerLine,
    perpetual,
    termYears: wholeTerm,
    termDays,
    expiryDate,
    expiryLabel: expiryDate ? formatLongDate(expiryDate) : "No expiry (perpetual)",
    noticeDays: noticeDaysWhole,
    completenessPercent,
    completenessFilled: filled,
    completenessTotal: optionalFields.length,
    warnings,
  };
}
