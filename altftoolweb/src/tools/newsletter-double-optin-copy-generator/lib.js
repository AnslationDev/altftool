/**
 * Double opt-in newsletter copy builder.
 *
 * Pure module - no React, no DOM, no clocks.
 *
 * Double opt-in means the address is only added to the list after the owner
 * clicks a link in a confirmation email. That click is what turns "somebody
 * typed this address into a form" into evidence that the owner of the address
 * asked for the mail. UK/EU GDPR Art. 7(1) puts the burden of PROVING consent
 * on the sender, so the confirmation click, its timestamp and the exact wording
 * shown at signup are the record that discharges it.
 *
 * The module writes the four pieces of copy that carry that flow, checks the
 * subject and preheader against the lengths mail clients actually show, and
 * projects how many signups a confirmed-subscriber target needs.
 */

// Roughly what a phone shows before truncating. Varies by client, orientation
// and font size - treat as a planning figure, not a hard rule.
export const MOBILE_SUBJECT_CHARS = 35;
export const DESKTOP_SUBJECT_CHARS = 60;
export const PREHEADER_CHARS = 90;

// How long a confirmation link should stay live. Long enough for someone who
// signed up on Friday evening, short enough that a stale link is not a way in.
export const DEFAULT_CONFIRM_EXPIRY_HOURS = 72;
export const MAX_CONFIRM_EXPIRY_HOURS = 720;

// CAN-SPAM (15 U.S.C. 7704) requires a valid physical postal address in any
// commercial email, and requires opt-out requests to be honoured within
// 10 business days. Canada's CASL uses the same 10-business-day figure.
export const OPT_OUT_DEADLINE_BUSINESS_DAYS = 10;

export const SEND_FREQUENCIES = [
  { id: "daily", label: "Daily", perYear: 365 },
  { id: "weekly", label: "Weekly", perYear: 52 },
  { id: "fortnightly", label: "Every two weeks", perYear: 26 },
  { id: "monthly", label: "Monthly", perYear: 12 },
  { id: "quarterly", label: "Quarterly", perYear: 4 },
];

export const SIGNUP_SOURCES = [
  { id: "footer", label: "Site footer or sidebar form" },
  { id: "leadMagnet", label: "Download or lead magnet form" },
  { id: "checkout", label: "Checkout tick box" },
  { id: "event", label: "Event or webinar registration" },
  { id: "inPerson", label: "In person, typed in by staff" },
];

// The fields that make a consent record hold up when someone complains.
export const CONSENT_LOG_FIELDS = [
  "Email address",
  "Signup timestamp (UTC) and source URL",
  "The exact consent wording displayed at signup",
  "Signup IP address and user agent",
  "Confirmation email message ID and send timestamp",
  "Confirmation click timestamp (UTC) and IP address",
  "Double opt-in status: pending / confirmed / expired",
  "Any later withdrawal timestamp and channel",
];

export const MAX_SIGNUPS = 10000000;

const clean = (value) => String(value ?? "").trim();

/** Close a fragment with a full stop unless it already ends in punctuation. */
const endSentence = (value) => (/[.!?]$/.test(value) ? value : `${value}.`);

function lookup(list, id, fallback) {
  return list.find((item) => item.id === id) || fallback;
}

/**
 * Measure a subject or preheader against the lengths clients typically show.
 * @returns {{length, mobileVisible, truncatedOnMobile, truncatedOnDesktop}}
 */
export function measureSubject(text, mobileChars = MOBILE_SUBJECT_CHARS, desktopChars = DESKTOP_SUBJECT_CHARS) {
  const value = String(text ?? "");
  return {
    length: value.length,
    mobileVisible: value.slice(0, mobileChars),
    truncatedOnMobile: value.length > mobileChars,
    truncatedOnDesktop: value.length > desktopChars,
  };
}

/**
 * Project a double opt-in funnel.
 * @returns {null|{confirmed, unconfirmed, signupsNeeded, extraSignupsNeeded}}
 */
export function projectConfirmations({ signups, confirmRatePercent, targetConfirmed }) {
  if (!Number.isFinite(signups) || signups < 0 || signups > MAX_SIGNUPS) return null;
  if (!Number.isFinite(confirmRatePercent) || confirmRatePercent <= 0 || confirmRatePercent > 100) return null;
  if (!Number.isFinite(targetConfirmed) || targetConfirmed < 0 || targetConfirmed > MAX_SIGNUPS) return null;

  const rate = confirmRatePercent / 100;
  const wholeSignups = Math.round(signups);
  const confirmed = Math.round(wholeSignups * rate);
  const signupsNeeded = Math.ceil(Math.round(targetConfirmed) / rate);

  return {
    confirmed,
    unconfirmed: wholeSignups - confirmed,
    signupsNeeded,
    extraSignupsNeeded: Math.max(0, signupsNeeded - wholeSignups),
  };
}

/**
 * Build every piece of double opt-in copy.
 * @returns {{error: string}} on bad input, otherwise the blocks and figures.
 */
export function buildDoubleOptInCopy(input = {}) {
  const brandName = clean(input.brandName);
  const listName = clean(input.listName);
  const senderName = clean(input.senderName);
  const senderEmail = clean(input.senderEmail);
  const contentDescription = clean(input.contentDescription);
  const leadMagnetName = clean(input.leadMagnetName);
  const postalAddress = clean(input.postalAddress);
  const supportEmail = clean(input.supportEmail);
  const preferencesUrl = clean(input.preferencesUrl);
  const frequencyId = clean(input.frequencyId) || "weekly";
  const sourceId = clean(input.sourceId) || "footer";
  const subjectOverride = clean(input.subjectOverride);
  const sharesWithPartners = Boolean(input.sharesWithPartners);

  const expiryHours = Number(
    input.expiryHours === undefined || input.expiryHours === ""
      ? DEFAULT_CONFIRM_EXPIRY_HOURS
      : input.expiryHours,
  );
  const signups = Number(input.signups ?? 0);
  const confirmRatePercent = Number(input.confirmRatePercent);
  const targetConfirmed = Number(input.targetConfirmed ?? 0);

  if (!brandName) return { error: "Enter the brand or company name that sends the newsletter." };
  if (!listName) return { error: "Enter what the list is called - the subscriber has to recognise it." };
  if (!contentDescription) {
    return { error: "Describe what subscribers will actually receive. Consent has to be informed, and 'updates' does not inform anyone." };
  }
  if (!postalAddress) {
    return { error: "Enter a physical postal address. Commercial email to US recipients must carry one under CAN-SPAM." };
  }
  if (!supportEmail) return { error: "Enter a reply-to or support address subscribers can write to." };
  if (!Number.isFinite(expiryHours) || expiryHours < 1 || expiryHours > MAX_CONFIRM_EXPIRY_HOURS) {
    return { error: `Confirmation link expiry must be between 1 and ${MAX_CONFIRM_EXPIRY_HOURS} hours.` };
  }

  const funnel = projectConfirmations({ signups, confirmRatePercent, targetConfirmed });
  if (!funnel) {
    return { error: "Check the funnel figures: signups 0 or more, confirmation rate above 0% and up to 100%, target 0 or more." };
  }

  const frequency = lookup(SEND_FREQUENCIES, frequencyId, SEND_FREQUENCIES[1]);
  const source = lookup(SIGNUP_SOURCES, sourceId, SIGNUP_SOURCES[0]);
  const wholeExpiry = Math.round(expiryHours);
  const expiryLabel =
    wholeExpiry % 24 === 0
      ? `${wholeExpiry / 24} day${wholeExpiry / 24 === 1 ? "" : "s"}`
      : `${wholeExpiry} hour${wholeExpiry === 1 ? "" : "s"}`;

  const subject = subjectOverride || `Confirm your ${listName} subscription`;
  const preheader = `One click and you are in - the link expires in ${expiryLabel}.`;
  const subjectMetrics = measureSubject(subject);
  const preheaderMetrics = measureSubject(preheader, PREHEADER_CHARS, PREHEADER_CHARS);

  const consentLine = [
    `Yes, email me ${listName} from ${brandName}: ${endSentence(contentDescription)}`,
    `About ${frequency.label.toLowerCase()} (${frequency.perYear} emails a year). Unsubscribe in one click from any email.`,
    sharesWithPartners
      ? "Your address is shared with our named partners listed on the privacy page - a separate tick box, never bundled with this one."
      : "We never sell or share your address.",
  ].join(" ");

  const signupConfirmationScreen = [
    "Almost there - check your inbox",
    "",
    `We have sent a confirmation email to the address you entered. Click the button in it and you are subscribed to ${listName}.`,
    `The link works for ${expiryLabel}. Nothing is sent to you until you click it.`,
    `No email after a couple of minutes? Look in spam and promotions, then write to ${supportEmail}.`,
  ].join("\n");

  const confirmationEmail = [
    `Subject: ${subject}`,
    `Preheader: ${preheader}`,
    `From: ${senderName || brandName} <${senderEmail || supportEmail}>`,
    "",
    "Hi,",
    "",
    `Someone - we hope you - asked to receive ${listName} from ${brandName} using our ${source.label.toLowerCase()}.`,
    "",
    "Click to confirm and start receiving it:",
    "",
    "[ CONFIRM MY SUBSCRIPTION ]  -> {{confirmation_url}}",
    "",
    `What you get: ${endSentence(contentDescription)}`,
    `How often: ${frequency.label.toLowerCase()}, roughly ${frequency.perYear} emails a year.`,
    leadMagnetName ? `Also included: ${leadMagnetName}, sent as soon as you confirm.` : null,
    "",
    `This link expires in ${expiryLabel}. If you do nothing, the address is deleted from our pending list and you will not hear from us again.`,
    "",
    "If you did not sign up, ignore this email - no list, no follow-up, nothing further.",
    "",
    `Questions: ${supportEmail}`,
    `${brandName}, ${postalAddress}`,
  ].filter((line) => line !== null).join("\n");

  const welcomeEmail = [
    `Subject: You are in - welcome to ${listName}`,
    "",
    "Thanks for confirming.",
    "",
    `You will get ${listName} ${frequency.label.toLowerCase()} - about ${frequency.perYear} emails a year - covering ${endSentence(contentDescription)}`,
    leadMagnetName ? `\nHere is ${leadMagnetName} as promised: {{asset_url}}` : null,
    "",
    "Two things worth knowing:",
    `- Every email has a one-click unsubscribe. We act on it within ${OPT_OUT_DEADLINE_BUSINESS_DAYS} business days at the latest, usually immediately.`,
    preferencesUrl
      ? `- You can change what you get, or how often, at ${preferencesUrl} instead of leaving entirely.`
      : "- Reply to any email to change what you get, or how often, instead of leaving entirely.",
    "",
    `${senderName || brandName}`,
    `${brandName}, ${postalAddress}`,
  ].filter((line) => line !== null).join("\n");

  const consentRecord = [
    "CONSENT RECORD - store one row per subscriber and keep it for as long as you email them, plus your limitation period.",
    "",
    ...CONSENT_LOG_FIELDS.map((field) => `- ${field}`),
    "",
    `Exact wording shown at signup on this form: "${consentLine}"`,
    `Signup source: ${source.label}. Confirmation window: ${expiryLabel}.`,
  ].join("\n");

  const blocks = [
    { id: "consentLine", label: "Signup form consent wording", text: consentLine },
    { id: "screen", label: "Post-signup screen", text: signupConfirmationScreen },
    { id: "confirm", label: "Confirmation email (the double opt-in)", text: confirmationEmail },
    { id: "welcome", label: "Welcome email (after confirmation)", text: welcomeEmail },
    { id: "record", label: "Consent record to store", text: consentRecord },
  ];

  const fullText = blocks.map((block) => `${block.label.toUpperCase()}\n${block.text}`).join("\n\n---\n\n");

  const warnings = [];
  if (subjectMetrics.truncatedOnMobile) {
    warnings.push(`The subject is ${subjectMetrics.length} characters; a phone typically shows about ${MOBILE_SUBJECT_CHARS}, so it reads as "${subjectMetrics.mobileVisible}...". Front-load the word "Confirm".`);
  }
  if (preheaderMetrics.truncatedOnMobile) {
    warnings.push(`The preheader is ${preheaderMetrics.length} characters and will be clipped near ${PREHEADER_CHARS}.`);
  }
  if (wholeExpiry < 24) {
    warnings.push(`A ${wholeExpiry}-hour window catches nobody who signs up in the evening and reads mail the next day. 48-72 hours is the usual compromise.`);
  }
  if (sourceId === "checkout") {
    warnings.push("A checkout tick box must be unticked by default and separate from the purchase terms; consent bundled into 'I accept the terms' is not freely given.");
  }
  if (sourceId === "inPerson") {
    warnings.push("Addresses typed in by staff are the most commonly mistyped and the hardest to prove. Double opt-in is doing most of the work here - keep the paper slip too.");
  }
  if (sharesWithPartners) {
    warnings.push("Sharing with partners needs its own tick box, its own wording and a named list of the partners. It cannot ride on the newsletter consent.");
  }
  if (leadMagnetName) {
    warnings.push("Do not make the download conditional on staying subscribed - consent tied to something the person cannot get otherwise is not freely given under GDPR Art. 7(4).");
  }

  return {
    blocks,
    fullText,
    subject,
    preheader,
    subjectMetrics,
    preheaderMetrics,
    frequencyLabel: frequency.label,
    emailsPerYear: frequency.perYear,
    sourceLabel: source.label,
    expiryHours: wholeExpiry,
    expiryLabel,
    funnel,
    signups: Math.round(signups),
    confirmRatePercent,
    targetConfirmed: Math.round(targetConfirmed),
    warnings,
  };
}
