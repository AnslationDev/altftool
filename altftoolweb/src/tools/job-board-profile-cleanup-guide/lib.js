/**
 * Job Board Profile Cleanup Guide — scans a résumé for personal data that does not
 * belong on a public job portal, and produces a redacted version.
 *
 * Why these fields
 * ----------------
 * A résumé uploaded to a job portal is typically searchable by any paying recruiter
 * account and often stays live for years after the job hunt ends. The scanner looks for
 * the fields that are either directly abusable (phone number, government identifiers) or
 * that employers should not be collecting at all at application stage (date of birth,
 * marital status, religion, gender, parents' names).
 *
 * Identifier formats used
 * -----------------------
 * - Aadhaar: 12 digits whose final digit is a Verhoeff checksum. Implementing the real
 *   checksum means an ordinary 12-digit number in a résumé is not flagged as an Aadhaar,
 *   and a genuine one is. UIDAI's guidance is that Aadhaar should not be shared publicly.
 * - PAN: five letters, four digits, one letter.
 * - Indian passport: one letter followed by seven digits.
 * - Indian PIN code: six digits not starting with zero, used as the marker for a full
 *   home address block.
 *
 * Scoring: each detected category contributes its severity (1-5) once, regardless of how
 * many times it appears, so a résumé listing a phone number three times is not scored as
 * three separate problems. exposure = severity of detected categories / severity of all
 * categories x 100.
 */

/** Longest résumé the scanner will accept, in characters. */
export const MAX_TEXT_LENGTH = 50000;

/** Most portal copies the tool will count. */
export const MAX_PORTALS = 50;

/** Verhoeff multiplication table. */
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

/** Verhoeff permutation table. */
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Verhoeff checksum validation — the scheme used for the Aadhaar number's last digit.
 * @param {string} digits digits only
 */
export function verhoeffValid(digits) {
  if (typeof digits !== "string" || !/^\d+$/.test(digits)) return false;
  let c = 0;
  const reversed = digits.split("").reverse();
  for (let i = 0; i < reversed.length; i += 1) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][Number(reversed[i])]];
  }
  return c === 0;
}

const digitsOnly = (value) => value.replace(/\D/g, "");

const notAdjacentToDigit = (text, start, end) =>
  !/\d/.test(text.charAt(start - 1)) && !/\d/.test(text.charAt(end));

/**
 * Detector list. Each entry has a global pattern, an optional extra validation, a
 * severity (1-5) and the replacement used in the redacted output.
 */
export const DETECTORS = [
  {
    id: "aadhaar",
    label: "Aadhaar number",
    severity: 5,
    pattern: /\d{4}[ -]?\d{4}[ -]?\d{4}/g,
    validate: (match, text, start, end) =>
      notAdjacentToDigit(text, start, end) && verhoeffValid(digitsOnly(match)),
    replacement: "[aadhaar removed]",
    why: "A valid Aadhaar number on a public résumé is identity-theft material and UIDAI's guidance is not to share it.",
    fix: "Delete it entirely. No employer needs it before a formal offer, and then only through a secure channel.",
  },
  {
    id: "pan",
    label: "PAN",
    severity: 5,
    pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
    replacement: "[PAN removed]",
    why: "PAN is a permanent tax identifier that is trivially reusable for impersonation.",
    fix: "Remove it. It belongs in onboarding paperwork, not an application document.",
  },
  {
    id: "passport",
    label: "Passport number",
    severity: 5,
    pattern: /\b[A-PR-WYa-pr-wy][0-9]{7}\b/g,
    replacement: "[passport removed]",
    why: "A passport number plus a name and date of birth is enough for a convincing identity fraud attempt.",
    fix: "Replace with a line saying you hold a valid passport, if travel eligibility matters.",
  },
  {
    id: "dob",
    label: "Date of birth",
    severity: 4,
    pattern:
      /\b(?:DOB|D\.O\.B\.?|Date of Birth|Birth Date)\b[:\s-]*[0-3]?\d[/.-][0-1]?\d[/.-](?:19|20)\d{2}/gi,
    replacement: "[date of birth removed]",
    why: "Date of birth is both an age-discrimination risk and a standard identity-verification answer.",
    fix: "Remove it. Employers can ask for proof of age or work eligibility after an offer.",
  },
  {
    id: "phone",
    label: "Phone number",
    severity: 4,
    pattern: /(?:\+\d{1,3}[ -]?)?(?:\d{5}[ -]\d{5}|\d{3}[ -]\d{3}[ -]\d{4}|\d{10})/g,
    validate: (match, text, start, end) => {
      if (!notAdjacentToDigit(text, start, end)) return false;
      const digits = digitsOnly(match);
      // A country code makes it unambiguously a phone number.
      if (match.includes("+")) return digits.length >= 10;
      // Otherwise a 12-digit Verhoeff-valid number is an Aadhaar, reported separately.
      if (digits.length === 12 && verhoeffValid(digits)) return false;
      return digits.length >= 10;
    },
    replacement: "[phone removed]",
    why: "A public phone number invites recruitment spam, and it is the number an OTP or SIM-swap attempt targets.",
    fix: "Use the portal's own contact field, or a secondary number you can retire, instead of putting it in the file.",
  },
  {
    id: "email",
    label: "Email address",
    severity: 2,
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    replacement: "[email removed]",
    why: "An email in a downloadable file ends up on résumé-scraping lists and stays there.",
    fix: "Keep one address if you want to be reachable, but consider an alias you can switch off later.",
  },
  {
    id: "address",
    label: "Full postal address or PIN code",
    severity: 3,
    pattern: /\b[1-9]\d{5}\b/g,
    validate: (match, text, start, end) => notAdjacentToDigit(text, start, end),
    replacement: "[address removed]",
    why: "A home address tells a stranger where you live and adds nothing to a hiring decision.",
    fix: "Replace the full address with the city and country only.",
  },
  {
    id: "protected",
    label: "Personal characteristics employers should not collect",
    severity: 3,
    pattern:
      /\b(?:marital status|father'?s name|mother'?s name|spouse'?s name|religion|caste|nationality|gender|sex|blood group)\b/gi,
    replacement: "[personal detail removed]",
    why: "These fields invite discrimination and are irrelevant to whether you can do the job.",
    fix: "Delete the whole line. If a form demands it, ask why it is needed at application stage.",
  },
  {
    id: "salary",
    label: "Current or expected salary",
    severity: 2,
    pattern: /\b(?:current ctc|expected ctc|current salary|expected salary|last drawn)\b/gi,
    replacement: "[salary removed]",
    why: "Salary history anchors the offer you get and is banned from being asked in several jurisdictions.",
    fix: "Remove it from the file and discuss compensation directly when the conversation gets there.",
  },
  {
    id: "photo",
    label: "Photograph reference",
    severity: 2,
    pattern: /\b(?:photograph attached|passport size photo(?:graph)?|photo attached)\b/gi,
    replacement: "[photo reference removed]",
    why: "A photo on a résumé adds bias risk and gives a face to any scraped copy of the file.",
    fix: "Drop the photo unless the role genuinely requires one.",
  },
  {
    id: "referees",
    label: "Referee contact details",
    severity: 3,
    pattern: /\b(?:referee|references?)\b[^\n]{0,60}?(?:\+?\d[\d ()-]{8,})/gi,
    replacement: "[referee contact removed]",
    why: "Publishing someone else's phone number is a disclosure of their personal data, not yours to make.",
    fix: "Write 'references available on request' and share the details only when asked.",
  },
];

export const MAX_SEVERITY = DETECTORS.reduce((sum, detector) => sum + detector.severity, 0);

export const EXPOSURE_BANDS = [
  { min: 60, label: "High exposure", note: "Government identifiers or several sensitive fields are sitting in a file recruiters can download." },
  { min: 35, label: "Moderate exposure", note: "More personal data than the role needs. Trim it before you re-upload." },
  { min: 15, label: "Low exposure", note: "Mostly clean; remove what is left and you are done." },
  { min: 0, label: "Clean", note: "Nothing flagged. Keep the file this way when you refresh it." },
];

/** Practical portal steps that are not computed — the same for every portal. */
export const PORTAL_ACTIONS = [
  [
    "Set the profile to private or not-searchable first",
    "This stops new recruiter downloads immediately, while you work through the older copies.",
  ],
  [
    "Delete every earlier résumé version, not just the newest",
    "Portals keep old uploads as separate files, and the oldest one is usually the one with your full address on it.",
  ],
  [
    "Remove the phone number from the profile fields as well as the file",
    "Recruiter search matches on the structured fields, so clearing the document alone is not enough.",
  ],
  [
    "Close accounts on portals you no longer use",
    "A dormant profile keeps serving your data to search long after you stopped logging in.",
  ],
  [
    "Ask in writing for erasure where you cannot self-delete",
    "Send it to the portal's privacy contact, list the profile URL, and keep the reply reference.",
  ],
  [
    "Check the portal's résumé-sharing partners",
    "Many job boards syndicate profiles to partner sites, which hold their own copies you must chase separately.",
  ],
];

function bandFor(percent) {
  return EXPOSURE_BANDS.find((band) => percent >= band.min) ?? EXPOSURE_BANDS[EXPOSURE_BANDS.length - 1];
}

/** Mask the middle of a matched value so the report does not restate it in full. */
export function maskValue(value) {
  const text = String(value);
  if (text.length <= 4) return "*".repeat(text.length);
  const keep = Math.min(2, Math.floor(text.length / 4));
  return `${text.slice(0, keep)}${"*".repeat(text.length - keep * 2)}${text.slice(text.length - keep)}`;
}

function collectMatches(text) {
  const hits = [];
  for (const detector of DETECTORS) {
    const pattern = new RegExp(detector.pattern.source, detector.pattern.flags);
    let match = pattern.exec(text);
    while (match !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const valid = detector.validate ? detector.validate(match[0], text, start, end) : true;
      if (valid && match[0].length > 0) {
        hits.push({ detector, value: match[0], start, end });
      }
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
      match = pattern.exec(text);
    }
  }
  return hits;
}

/** Drop overlapping matches, keeping the more severe (then the longer) one. */
function resolveOverlaps(hits) {
  const sorted = [...hits].sort((a, b) => {
    if (b.detector.severity !== a.detector.severity) return b.detector.severity - a.detector.severity;
    if (b.value.length !== a.value.length) return b.value.length - a.value.length;
    return a.start - b.start;
  });
  const kept = [];
  for (const hit of sorted) {
    const clashes = kept.some((other) => hit.start < other.end && other.start < hit.end);
    if (!clashes) kept.push(hit);
  }
  return kept.sort((a, b) => a.start - b.start);
}

/**
 * Scan a résumé.
 * @param {{text:string, portalCount:number}} input
 */
export function scanResume({ text, portalCount } = {}) {
  const source = typeof text === "string" ? text : "";
  if (source.trim().length === 0) {
    return { error: "Paste the text of your résumé to scan it." };
  }
  if (source.length > MAX_TEXT_LENGTH) {
    return { error: `That is longer than ${MAX_TEXT_LENGTH} characters — paste one résumé at a time.` };
  }

  const portals = Number(portalCount);
  if (!Number.isFinite(portals)) return { error: "Enter the number of portals as a plain number." };
  if (!Number.isInteger(portals)) return { error: "The number of portals must be a whole number." };
  if (portals < 0) return { error: "The number of portals cannot be negative." };
  if (portals > MAX_PORTALS) return { error: `Enter ${MAX_PORTALS} portals or fewer.` };

  const kept = resolveOverlaps(collectMatches(source));

  const findings = DETECTORS.map((detector) => {
    const matches = kept.filter((hit) => hit.detector.id === detector.id);
    return {
      id: detector.id,
      label: detector.label,
      severity: detector.severity,
      why: detector.why,
      fix: detector.fix,
      count: matches.length,
      samples: matches.slice(0, 3).map((hit) => maskValue(hit.value)),
    };
  })
    .filter((finding) => finding.count > 0)
    .sort((a, b) => b.severity - a.severity || b.count - a.count);

  const severityFound = findings.reduce((sum, finding) => sum + finding.severity, 0);
  const percent = MAX_SEVERITY > 0 ? (severityFound / MAX_SEVERITY) * 100 : 0;

  let redacted = "";
  let cursor = 0;
  for (const hit of kept) {
    redacted += source.slice(cursor, hit.start) + hit.detector.replacement;
    cursor = hit.end;
  }
  redacted += source.slice(cursor);

  return {
    findings,
    findingCount: findings.length,
    matchCount: kept.length,
    severityFound,
    maxSeverity: MAX_SEVERITY,
    exposurePercent: percent,
    band: bandFor(percent),
    portalCount: portals,
    liveCopies: portals * (kept.length > 0 ? 1 : 0),
    exposureUnits: severityFound * portals,
    redacted,
    characters: source.length,
  };
}
