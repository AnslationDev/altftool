/**
 * Event photography / filming notice builder.
 *
 * Two jobs, both pure:
 *   1. Write the notice copy for every surface an attendee actually meets -
 *      the ticket, the registration form, the entrance sign, the PA script
 *      and the event web page. Transparency law (UK/EU GDPR Art. 13, and the
 *      notice duty in India's DPDP Act, 2023 s.5) requires the information to
 *      reach the person AT the point their image is captured, which is why a
 *      buried privacy-policy line is not enough on its own.
 *   2. Size the entrance sign so the notice is physically legible from where
 *      people read it. Copy nobody can read is not notice.
 *
 * No React, no DOM, no clocks: dates come in as ISO strings.
 */

// --- Sign legibility model -------------------------------------------------

// Signage rule of thumb used across wayfinding practice: about 1 inch
// (25.4 mm) of capital-letter height for every 10 feet (3.048 m) of viewing
// distance is the limit of comfortable reading. 25.4 / 3.048 = 8.33 mm per metre.
export const CAP_HEIGHT_MM_PER_METRE = 25.4 / 3.048;

// Doubling the cap height is the common allowance for text that has to be read
// at a glance, in motion, or in poor light - i.e. a doorway in a crowd.
export const GLANCE_FACTOR = 2;

// In common sans-serif faces the cap height is roughly 72% of the em size,
// so em size = cap height / 0.72.
export const CAP_HEIGHT_TO_EM = 1 / 0.72;

// Average advance width of a lower-case sans-serif glyph is about half an em.
export const AVG_CHAR_ADVANCE_EM = 0.5;

// 1 typographic point = 25.4 / 72 mm.
export const MM_PER_POINT = 25.4 / 72;

// Mean silent reading rate for English non-fiction prose, from Brysbaert's
// 2019 meta-analysis of 190 studies (about 238 words per minute).
export const SILENT_READING_WPM = 238;

// How long a person walking through a doorway actually looks at a sign.
export const DEFAULT_DWELL_SECONDS = 3;

export const MIN_VIEWING_DISTANCE_M = 0.5;
export const MAX_VIEWING_DISTANCE_M = 50;
export const MIN_SIGN_WIDTH_MM = 100;
export const MAX_SIGN_WIDTH_MM = 5000;
export const MAX_DWELL_SECONDS = 120;

// --- Content options -------------------------------------------------------

export const CAPTURE_TYPES = [
  { id: "photos", label: "Still photography" },
  { id: "video", label: "Video recording" },
  { id: "liveStream", label: "Live streaming or broadcast" },
  { id: "audio", label: "Audio recording of the room" },
  { id: "drone", label: "Drone or overhead camera" },
];

export const USE_PURPOSES = [
  { id: "socialMedia", label: "the organiser's social media accounts" },
  { id: "website", label: "the event and organiser websites" },
  { id: "marketing", label: "marketing for future editions of this event" },
  { id: "paidAds", label: "paid advertising" },
  { id: "press", label: "press releases and media coverage" },
  { id: "sponsors", label: "reports and recap decks shared with sponsors" },
  { id: "internal", label: "internal records and archives" },
];

export const LAWFUL_BASES = [
  {
    id: "legitimateInterests",
    label: "Legitimate interests (crowd and general event coverage)",
    // UK/EU GDPR Art. 6(1)(f). Workable for incidental crowd shots at a public
    // event, and requires a balancing test plus a genuine objection route.
    note: "Suits wide crowd, stage and venue shots. You must still run a balancing test, tell people clearly, and honour objections.",
  },
  {
    id: "consent",
    label: "Consent (posed portraits, close-ups, named use)",
    // UK/EU GDPR Art. 6(1)(a) and DPDP Act, 2023 s.6: consent must be free,
    // specific, informed and as easy to withdraw as to give.
    note: "Needed for posed portraits, close-ups of identifiable individuals and anything used in paid advertising. Collect it per person and log it.",
  },
];

export const OPT_OUT_METHODS = [
  { id: "lanyard", label: "Coloured 'no photos' lanyard or wristband from the registration desk" },
  { id: "steward", label: "Tell any steward or the photographer on the day" },
  { id: "zone", label: "Use the marked camera-free seating zone" },
  { id: "email", label: "Email the organiser before or after the event" },
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

/**
 * Sign legibility figures for a given viewing distance and board width.
 * Returns null for out-of-range input so the caller can report an error.
 */
export function signLegibility({ viewingDistanceM, signWidthMm, dwellSeconds }) {
  if (!Number.isFinite(viewingDistanceM) || !Number.isFinite(signWidthMm)) return null;
  if (viewingDistanceM < MIN_VIEWING_DISTANCE_M || viewingDistanceM > MAX_VIEWING_DISTANCE_M) return null;
  if (signWidthMm < MIN_SIGN_WIDTH_MM || signWidthMm > MAX_SIGN_WIDTH_MM) return null;
  const dwell = Number.isFinite(dwellSeconds) ? dwellSeconds : DEFAULT_DWELL_SECONDS;
  if (dwell <= 0 || dwell > MAX_DWELL_SECONDS) return null;

  const capHeightMm = viewingDistanceM * CAP_HEIGHT_MM_PER_METRE;
  const glanceCapHeightMm = capHeightMm * GLANCE_FACTOR;
  const emMm = glanceCapHeightMm * CAP_HEIGHT_TO_EM;
  const charAdvanceMm = emMm * AVG_CHAR_ADVANCE_EM;
  const charsPerLine = Math.max(1, Math.floor(signWidthMm / charAdvanceMm));
  const readableWords = Math.floor((SILENT_READING_WPM * dwell) / 60);

  return {
    capHeightMm,
    glanceCapHeightMm,
    headlinePointSize: emMm / MM_PER_POINT,
    charsPerLine,
    readableWords,
    dwellSeconds: dwell,
  };
}

const clean = (value) => String(value ?? "").trim();
const countWords = (text) => String(text).split(/\s+/).filter(Boolean).length;

function labelsFor(list, ids) {
  const wanted = new Set(Array.isArray(ids) ? ids : []);
  return list.filter((item) => wanted.has(item.id)).map((item) => item.label);
}

/** "a, b and c" */
function joinList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function lookup(list, id, fallback) {
  return list.find((item) => item.id === id) || fallback;
}

/**
 * Build every notice surface plus the sign-sizing figures.
 * @returns {{error: string}} on bad input, otherwise the copy blocks.
 */
export function buildEventPhotographyNotice(input = {}) {
  const eventName = clean(input.eventName);
  const organiserName = clean(input.organiserName);
  const venueName = clean(input.venueName);
  const contactEmail = clean(input.contactEmail);
  const eventDate = clean(input.eventDate);
  const captureTypes = Array.isArray(input.captureTypes) ? input.captureTypes : [];
  const purposes = Array.isArray(input.purposes) ? input.purposes : [];
  const lawfulBasisId = clean(input.lawfulBasisId) || "legitimateInterests";
  const optOutId = clean(input.optOutId) || "steward";
  const childrenPresent = Boolean(input.childrenPresent);
  const retentionYears = Number(input.retentionYears);
  const viewingDistanceM = Number(input.viewingDistanceM);
  const signWidthMm = Number(input.signWidthMm);
  const dwellSeconds = Number(
    input.dwellSeconds === undefined || input.dwellSeconds === "" ? DEFAULT_DWELL_SECONDS : input.dwellSeconds,
  );

  if (!eventName) return { error: "Enter the event name." };
  if (!organiserName) return { error: "Enter the organiser or company name." };
  if (!contactEmail) return { error: "Enter a contact address - a notice with no route to object is not a valid notice." };
  if (eventDate && !isValidIsoDate(eventDate)) return { error: "The event date is not a real calendar date." };
  if (captureTypes.length === 0) return { error: "Select at least one kind of recording taking place." };
  if (purposes.length === 0) return { error: "Select at least one purpose the images will be used for." };
  if (!Number.isFinite(retentionYears) || retentionYears <= 0 || retentionYears > 50) {
    return { error: "Enter how many years the footage will be kept, between 1 and 50." };
  }

  const sign = signLegibility({ viewingDistanceM, signWidthMm, dwellSeconds });
  if (!sign) {
    return {
      error: `Check the sign figures: viewing distance ${MIN_VIEWING_DISTANCE_M}-${MAX_VIEWING_DISTANCE_M} m, board width ${MIN_SIGN_WIDTH_MM}-${MAX_SIGN_WIDTH_MM} mm, dwell 1-${MAX_DWELL_SECONDS} seconds.`,
    };
  }

  const captureLabels = labelsFor(CAPTURE_TYPES, captureTypes);
  const purposeLabels = labelsFor(USE_PURPOSES, purposes);
  const basis = lookup(LAWFUL_BASES, lawfulBasisId, LAWFUL_BASES[0]);
  const optOut = lookup(OPT_OUT_METHODS, optOutId, OPT_OUT_METHODS[1]);
  const wholeRetention = Math.round(retentionYears);

  const captureSentence = joinList(captureLabels.map((label) => label.toLowerCase()));
  const purposeSentence = joinList(purposeLabels);
  const dateSuffix = eventDate ? ` on ${formatLongDate(eventDate)}` : "";
  const venueSuffix = venueName ? ` at ${venueName}` : "";

  const headline = captureTypes.includes("liveStream")
    ? "THIS EVENT IS BEING FILMED AND LIVE STREAMED"
    : "PHOTOGRAPHY AND FILMING IN PROGRESS";

  const signageBody = [
    `${organiserName} is capturing ${captureSentence} at ${eventName}${venueSuffix}${dateSuffix}.`,
    `Images may be used for ${purposeSentence}.`,
    `Prefer not to appear? ${optOut.label}.`,
    `Questions or removal requests: ${contactEmail}`,
  ].join("\n");

  const ticketClause = [
    `Photography and filming: by entering ${eventName} you acknowledge that ${organiserName} and its appointed photographers will be capturing ${captureSentence} throughout the venue.`,
    `Footage in which you may be identifiable can be used for ${purposeSentence}.`,
    basis.id === "consent"
      ? "Close-up portraits and any use in advertising will only go ahead with your separate, recorded consent given on the day."
      : "General crowd, stage and venue coverage is carried out on the basis of the organiser's legitimate interests in documenting and promoting the event; you may object at any time.",
    `If you would rather not be photographed: ${optOut.label.toLowerCase()}.`,
    `Footage is kept for ${wholeRetention} year${wholeRetention === 1 ? "" : "s"} and then deleted. Contact ${contactEmail} to object or to ask for an image to be taken down.`,
  ].join(" ");

  const registrationCheckbox = [
    `[ ] I understand that ${eventName} is being ${captureTypes.includes("video") || captureTypes.includes("liveStream") ? "photographed and filmed" : "photographed"} and that images of attendees may be used for ${purposeSentence}. (Information only - ticking is not required to attend.)`,
    "",
    `[ ] Optional: please do NOT use images in which I am identifiable. I will ${optOut.label.toLowerCase()}.`,
  ].join("\n");

  const paAnnouncement = [
    `Good ${captureTypes.includes("liveStream") ? "evening" : "day"}, everyone. A quick note before we begin:`,
    `${eventName} is being ${captureSentence.replace(/^still /, "")} by ${organiserName}${captureTypes.includes("liveStream") ? ", and today's session is being streamed live" : ""}.`,
    `Pictures may appear on ${purposeSentence}.`,
    `If you would rather not be in shot, ${optOut.label.toLowerCase()} - our team will make sure you are kept out of frame.`,
    "Thank you.",
  ].join(" ");

  const websiteNotice = [
    `Filming and photography at ${eventName}`,
    "",
    `${organiserName} arranges ${captureSentence} at this event${venueSuffix}${dateSuffix}. Images and recordings in which attendees may be identifiable are used for ${purposeSentence}.`,
    "",
    `Lawful basis: ${basis.label}. ${basis.note}`,
    "",
    `Retention: recordings and photographs are kept for ${wholeRetention} year${wholeRetention === 1 ? "" : "s"} from the event date, then deleted or irreversibly anonymised.`,
    "",
    `Your choices: ${optOut.label}. You can also write to ${contactEmail} to object, to ask for a copy of images of you, or to ask for an image to be removed from our channels. Requests to remove images already downloaded or reshared by third parties cannot always be met.`,
    childrenPresent
      ? "\nChildren: no child will be photographed close-up or named without a parent or guardian's separate written consent, and staff will check the no-photo list before publishing."
      : "",
  ].filter(Boolean).join("\n");

  const blocks = [
    { id: "signHeadline", label: "Entrance sign - headline", text: headline },
    { id: "signBody", label: "Entrance sign - body", text: signageBody },
    { id: "ticket", label: "Ticket and booking terms", text: ticketClause },
    { id: "registration", label: "Registration form wording", text: registrationCheckbox },
    { id: "pa", label: "PA / stage announcement", text: paAnnouncement },
    { id: "web", label: "Event web page notice", text: websiteNotice },
  ];

  const headlineWords = countWords(headline);
  const signWords = headlineWords + countWords(signageBody);
  const headlineFitsDwell = headlineWords <= sign.readableWords;
  const headlineFitsWidth = headline.length <= sign.charsPerLine;

  const warnings = [];
  if (!headlineFitsDwell) {
    warnings.push(`The headline is ${headlineWords} words but a passer-by only reads about ${sign.readableWords} in ${sign.dwellSeconds} seconds. Shorten it or accept that only the first line lands.`);
  }
  if (!headlineFitsWidth) {
    warnings.push(`At ${sign.glanceCapHeightMm.toFixed(0)} mm capitals the headline needs about ${headline.length} characters but the board fits roughly ${sign.charsPerLine} per line - it will wrap onto ${Math.ceil(headline.length / sign.charsPerLine)} lines.`);
  }
  if (purposes.includes("paidAds") && basis.id !== "consent") {
    warnings.push("Using attendee images in paid advertising is normally beyond what legitimate interests will carry. Collect individual consent for those shots.");
  }
  if (childrenPresent) {
    warnings.push("Children are expected. Handle close-ups and naming through separate parental consent, keep a no-photo list at the desk, and brief the photographer before doors open.");
  }
  if (captureTypes.includes("drone")) {
    warnings.push("Drone footage adds aviation rules on top of privacy rules - check the operator's permissions and the venue's airspace restrictions.");
  }
  if (captureTypes.includes("audio")) {
    warnings.push("Room audio can capture private conversations. Say on the sign where microphones are, and keep them out of break-out and quiet areas.");
  }
  if (wholeRetention > 10) {
    warnings.push(`Keeping identifiable footage for ${wholeRetention} years is hard to justify. Set a shorter period, or anonymise faces once the campaign ends.`);
  }

  const fullText = blocks.map((block) => `${block.label.toUpperCase()}\n${block.text}`).join("\n\n---\n\n");

  return {
    blocks,
    fullText,
    headline,
    sign,
    signWords,
    headlineWords,
    headlineFitsDwell,
    headlineFitsWidth,
    basisLabel: basis.label,
    basisNote: basis.note,
    optOutLabel: optOut.label,
    captureLabels,
    purposeLabels,
    retentionYears: wholeRetention,
    warnings,
  };
}
