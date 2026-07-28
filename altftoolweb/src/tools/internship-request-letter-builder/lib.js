/**
 * Internship request letter builder — pure text composition.
 *
 * Structure follows the standard six-part business letter/email order taught in
 * business-communication style guides (subject, salutation, purpose, evidence,
 * availability, call to action, sign-off). Nothing here touches React or the DOM.
 */

/** Cold outreach emails are read on a phone; recruiters skim. 200 words is the
 *  widely used ceiling for an unsolicited application email before it gets skimmed. */
export const MAX_RECOMMENDED_WORDS = 200;

/** Below this the letter is too thin to carry evidence of fit. */
export const MIN_RECOMMENDED_WORDS = 90;

/** Typical academic internship windows, in weeks. */
export const MIN_DURATION_WEEKS = 1;
export const MAX_DURATION_WEEKS = 52;

export const TONES = [
  {
    id: "formal",
    label: "Formal",
    hint: "Government bodies, PSUs, law firms, academic labs.",
    salutation: (name) => (name ? `Respected ${name},` : "Respected Sir/Madam,"),
    signOff: "Yours sincerely,",
    opener: (rolePhrase, org) =>
      `I am writing to apply for ${rolePhrase} at ${org}.`,
    closer:
      "I would be grateful for the opportunity to discuss my application at your convenience.",
  },
  {
    id: "professional",
    label: "Warm professional",
    hint: "Most companies, startups, agencies and NGOs.",
    salutation: (name) => (name ? `Dear ${name},` : "Dear Hiring Team,"),
    signOff: "Best regards,",
    opener: (rolePhrase, org) =>
      `I would like to be considered for ${rolePhrase} at ${org}.`,
    closer:
      "Would you have 15 minutes in the coming week to talk about where I could help?",
  },
  {
    id: "concise",
    label: "Concise",
    hint: "Busy founders and engineering managers; keeps it under a screen.",
    salutation: (name) => (name ? `Hi ${name},` : "Hello,"),
    signOff: "Thanks,",
    opener: (rolePhrase, org) => `I am applying for ${rolePhrase} at ${org}.`,
    closer: "Happy to send a short work sample if that is useful.",
  },
];

export const MODES = [
  { id: "onsite", label: "On-site", phrase: "on-site" },
  { id: "hybrid", label: "Hybrid", phrase: "hybrid" },
  { id: "remote", label: "Remote", phrase: "fully remote" },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

/** Parse a YYYY-MM-DD string as a UTC date so results never shift with timezone. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const stamp = Date.UTC(y, m - 1, d);
  const date = new Date(stamp);
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatLongDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return LONG_DATE.format(date);
}

export function addWeeks(date, weeks) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + weeks * 7 * MS_PER_DAY);
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Split a comma / newline separated list into clean items. */
export function splitList(raw, limit = 6) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

/** "a, b and c" — Oxford-free serial join used in the letter body. */
export function joinList(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Build the internship request letter.
 * Returns { subject, body, wordCount, ... } or { error: string }.
 */
export function buildInternshipLetter(input = {}) {
  const fullName = clean(input.fullName);
  const course = clean(input.course);
  const yearOfStudy = clean(input.yearOfStudy);
  const institution = clean(input.institution);
  const company = clean(input.company);
  const recipient = clean(input.recipient);
  const role = clean(input.role) || "intern";
  const team = clean(input.team);
  const reason = clean(input.reason);
  const portfolio = clean(input.portfolio);
  const contact = clean(input.contact);
  const modeId = clean(input.mode) || "onsite";
  const toneId = clean(input.tone) || "professional";

  if (!fullName) return { error: "Add your full name — the letter is signed with it." };
  if (!company) return { error: "Add the company or organisation you are writing to." };

  const skills = splitList(input.skills, 6);
  if (skills.length === 0) {
    return { error: "List at least one skill or tool so the letter has evidence of fit." };
  }

  const durationWeeks = Number(input.durationWeeks);
  if (!Number.isFinite(durationWeeks)) {
    return { error: "Internship duration must be a number of weeks." };
  }
  if (durationWeeks < MIN_DURATION_WEEKS || durationWeeks > MAX_DURATION_WEEKS) {
    return {
      error: `Duration should be between ${MIN_DURATION_WEEKS} and ${MAX_DURATION_WEEKS} weeks.`,
    };
  }

  const startDate = parseIsoDate(input.startDate);
  if (!startDate) return { error: "Pick a valid availability start date." };
  const endDate = addWeeks(startDate, Math.round(durationWeeks));

  const tone = TONES.find((item) => item.id === toneId) || TONES[1];
  const mode = MODES.find((item) => item.id === modeId) || MODES[0];

  const studyLine = [
    course && `a ${course} student`,
    yearOfStudy && `in ${yearOfStudy}`,
    institution && `at ${institution}`,
  ]
    .filter(Boolean)
    .join(" ");

  const subject = `Internship application — ${role}${team ? ` (${team})` : ""} — ${fullName}`;

  // Avoid "Backend Engineering Intern internship" when the role title already says intern.
  const rolePhrase = /intern/i.test(role)
    ? `the ${role} role`
    : `a ${role} internship`;

  const paragraphs = [];

  paragraphs.push(
    [
      tone.opener(rolePhrase, company),
      studyLine ? `I am ${studyLine}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
  );

  paragraphs.push(
    [
      `I work with ${joinList(skills)}.`,
      reason ? `${reason}` : "",
      team ? `I am particularly interested in the ${team} team.` : "",
    ]
      .filter(Boolean)
      .join(" "),
  );

  paragraphs.push(
    `I am available from ${formatLongDate(startDate)} for ${Math.round(durationWeeks)} weeks, ` +
      `until ${formatLongDate(endDate)}, and can work ${mode.phrase}.`,
  );

  const closingBits = [tone.closer];
  if (portfolio) closingBits.push(`My work is at ${portfolio}.`);
  if (contact) closingBits.push(`You can reach me on ${contact}.`);
  paragraphs.push(closingBits.join(" "));

  const body = [
    tone.salutation(recipient),
    "",
    ...paragraphs.flatMap((p) => [p, ""]),
    tone.signOff,
    fullName,
  ].join("\n");

  const wordCount = countWords(paragraphs.join(" "));

  const checklist = [
    { label: "Addressed to a named person", ok: Boolean(recipient) },
    { label: "Names specific skills or tools", ok: skills.length >= 2 },
    { label: "States exact availability dates", ok: true },
    { label: "Gives a reason for this employer", ok: Boolean(reason) },
    { label: "Links a portfolio or work sample", ok: Boolean(portfolio) },
    { label: "Includes a direct contact", ok: Boolean(contact) },
    {
      label: `Body between ${MIN_RECOMMENDED_WORDS} and ${MAX_RECOMMENDED_WORDS} words`,
      ok: wordCount >= MIN_RECOMMENDED_WORDS && wordCount <= MAX_RECOMMENDED_WORDS,
    },
  ];

  const passed = checklist.filter((item) => item.ok).length;

  return {
    subject,
    body,
    wordCount,
    charCount: body.length,
    tooLong: wordCount > MAX_RECOMMENDED_WORDS,
    tooShort: wordCount < MIN_RECOMMENDED_WORDS,
    startLabel: formatLongDate(startDate),
    endLabel: formatLongDate(endDate),
    toneLabel: tone.label,
    modeLabel: mode.label,
    skills,
    checklist,
    score: passed,
    scoreMax: checklist.length,
  };
}
