/**
 * Testimonial Request Message Builder — pure logic.
 *
 * Assembles a testimonial request from structured inputs, picks the question
 * set, resolves the reply-by date and measures the draft against the real
 * length limit of the channel it will be sent on.
 *
 * No React, no DOM, no Date.now() — the "today" date is always an argument.
 */

/* ------------------------------------------------------------------ *
 * Constants — every number here comes from a published limit or study *
 * ------------------------------------------------------------------ */

/** GSM 03.38 7-bit alphabet fits 160 characters in a single SMS segment. */
export const SMS_SINGLE_SEGMENT_CHARS = 160;

/**
 * Concatenated (multipart) SMS spends 6 bytes of each segment on the UDH
 * header, leaving 153 GSM-7 characters of payload per segment.
 */
export const SMS_CONCAT_SEGMENT_CHARS = 153;

/** WhatsApp caps one text message at 65,536 characters. */
export const WHATSAPP_MAX_CHARS = 65536;

/** LinkedIn caps a message / InMail body at 8,000 characters. */
export const LINKEDIN_MAX_CHARS = 8000;

/** LinkedIn InMail subject line limit is 200 characters. */
export const LINKEDIN_SUBJECT_MAX = 200;

/**
 * Practical email body ceiling used here. Gmail clips a message and shows
 * "[Message clipped]" once the raw HTML passes ~102 KB; plain-text requests
 * never get near that, so this is a readability ceiling, not a hard cap.
 */
export const EMAIL_SOFT_MAX_CHARS = 4000;

/** Most inboxes render roughly the first 60 characters of a subject line. */
export const EMAIL_SUBJECT_DISPLAY_CHARS = 60;

/**
 * Mean silent reading rate for English non-fiction prose: 238 words per
 * minute (Brysbaert, 2019, "How many words do we read per minute?").
 */
export const SILENT_READING_WPM = 238;

/**
 * Response-rate guidance: a request that asks for more than about four
 * separate answers reads like homework. Kept as a named threshold so the UI
 * can warn instead of silently producing an unanswerable email.
 */
export const MAX_COMFORTABLE_QUESTIONS = 4;

/** Reply windows shorter than this read as pressure rather than a nudge. */
export const MIN_POLITE_DEADLINE_DAYS = 3;

/** Upper bound on the reply-by window this tool will schedule. */
export const MAX_DEADLINE_DAYS = 90;

export const CHANNELS = {
  email: {
    id: "email",
    label: "Email",
    hasSubject: true,
    maxChars: EMAIL_SOFT_MAX_CHARS,
    hardLimit: false,
    numberedQuestions: true,
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    hasSubject: false,
    maxChars: WHATSAPP_MAX_CHARS,
    hardLimit: true,
    numberedQuestions: true,
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn message",
    hasSubject: true,
    maxChars: LINKEDIN_MAX_CHARS,
    hardLimit: true,
    numberedQuestions: true,
  },
  sms: {
    id: "sms",
    label: "SMS",
    hasSubject: false,
    maxChars: SMS_SINGLE_SEGMENT_CHARS * 4,
    hardLimit: false,
    numberedQuestions: false,
  },
};

export const TONES = {
  warm: { id: "warm", label: "Warm" },
  professional: { id: "professional", label: "Professional" },
  brief: { id: "brief", label: "Brief" },
};

/**
 * Question bank. Each focus supplies one question phrased so the answer is
 * already a usable testimonial sentence rather than a yes/no.
 */
export const FOCUS_AREAS = [
  {
    id: "problem",
    label: "The problem before",
    question: "What was the situation before we started, and what was it costing you?",
  },
  {
    id: "result",
    label: "The measurable result",
    question: "What changed afterwards — a number, a timeframe or a before-and-after is ideal.",
  },
  {
    id: "process",
    label: "What working together was like",
    question: "What stood out about how the work actually ran day to day?",
  },
  {
    id: "objection",
    label: "The hesitation they had",
    question: "What made you hesitate before saying yes, and what happened to that worry?",
  },
  {
    id: "recommend",
    label: "Who they'd recommend it to",
    question: "Who would you recommend this to, and what would you tell them?",
  },
];

const FOCUS_BY_ID = FOCUS_AREAS.reduce((acc, focus) => {
  acc[focus.id] = focus;
  return acc;
}, {});

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

/* ------------------------------------------------------------------ *
 * Small pure helpers                                                   *
 * ------------------------------------------------------------------ */

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const capitalizeFirst = (text) => {
  const value = String(text ?? "");
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
};

/** Word count on whitespace-separated tokens. Empty string counts as 0. */
export function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Silent reading time in whole seconds at SILENT_READING_WPM. */
export function readingSeconds(words) {
  const w = Number(words);
  if (!Number.isFinite(w) || w <= 0) return 0;
  return Math.ceil((w / SILENT_READING_WPM) * 60);
}

/**
 * SMS segment count under GSM 03.38: 160 characters in one segment, and
 * 153 per segment once the message becomes multipart.
 */
export function smsSegments(chars) {
  const n = Number(chars);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n <= SMS_SINGLE_SEGMENT_CHARS) return 1;
  return Math.ceil(n / SMS_CONCAT_SEGMENT_CHARS);
}

/**
 * Add whole days to an ISO yyyy-mm-dd date in UTC.
 * Returns null for a malformed or non-existent date (e.g. 2026-02-30).
 */
export function addDaysIso(iso, days) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const base = new Date(Date.UTC(year, month - 1, day));
  // Reject dates that rolled over, e.g. 31 February.
  if (
    base.getUTCFullYear() !== year ||
    base.getUTCMonth() !== month - 1 ||
    base.getUTCDate() !== day
  ) {
    return null;
  }

  const offset = Number(days);
  if (!Number.isFinite(offset)) return null;

  const shifted = new Date(base.getTime() + Math.trunc(offset) * 86400000);
  if (Number.isNaN(shifted.getTime())) return null;

  const yyyy = String(shifted.getUTCFullYear()).padStart(4, "0");
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** "2026-08-12" -> "12 August 2026". Returns "" for invalid input. */
export function formatIsoLong(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return "";
  const month = Number(match[2]);
  if (month < 1 || month > 12) return "";
  return `${Number(match[3])} ${MONTH_NAMES[month - 1]} ${match[1]}`;
}

/* ------------------------------------------------------------------ *
 * Copy fragments                                                       *
 * ------------------------------------------------------------------ */

function openingLine(tone, client, project, outcome) {
  const outcomeClause = outcome ? ` ${outcome}` : "";
  if (tone === "professional") {
    return outcome
      ? `Thank you again for the chance to work on ${project}. The part I still point to is${outcomeClause}.`
      : `Thank you again for the chance to work on ${project}.`;
  }
  if (tone === "brief") {
    return outcome
      ? `Hope ${project} is still going well —${outcomeClause}.`
      : `Hope ${project} is still going well.`;
  }
  return outcome
    ? `${project} was one of my favourite projects to work on, and${outcomeClause} is the bit I still bring up when people ask what it achieved.`
    : `${project} was one of my favourite projects to work on, and I've been meaning to say thank you properly.`;
}

function askLine(tone, questionCount) {
  const noun = questionCount === 1 ? "question" : "questions";
  if (tone === "professional") {
    return `Would you be willing to write a short testimonial I can publish on my website and LinkedIn? To keep it quick, here ${questionCount === 1 ? "is" : "are"} the only ${noun} I need answered — one or two sentences each is plenty.`;
  }
  if (tone === "brief") {
    return `Could I get a couple of lines from you for my website? Just these ${questionCount === 1 ? "" : `${questionCount} `}${noun}:`;
  }
  return `Would you be up for a short testimonial I can use on my website and LinkedIn? I've kept it to ${questionCount} ${noun} so it should take about two minutes — a sentence each is plenty.`;
}

function closingLines({ tone, sender, deadlineText, offerDraft, allowVideo }) {
  const lines = [];
  lines.push(
    tone === "brief"
      ? "Rough notes are fine — I'll tidy the wording and send it back for your sign-off before it goes anywhere."
      : "There's no need to polish anything. I'll tidy the wording, send the final version back for your approval, and nothing gets published until you're happy with it.",
  );
  if (offerDraft) {
    lines.push(
      "If it's easier, reply \"draft it\" and I'll write a version in your own words for you to edit, cut or reject.",
    );
  }
  if (allowVideo) {
    lines.push(
      "A 30-second phone video answering the same questions works just as well if you'd rather talk than type.",
    );
  }
  if (deadlineText) lines.push(deadlineText);
  lines.push(tone === "professional" ? "With thanks," : "Thanks so much,");
  lines.push(sender);
  return lines;
}

/* ------------------------------------------------------------------ *
 * Main builder                                                         *
 * ------------------------------------------------------------------ */

/**
 * Build the testimonial request.
 *
 * @param {object} input
 * @param {string} input.clientName    Person being asked.
 * @param {string} input.senderName    Person signing off.
 * @param {string} input.projectName   What the work was.
 * @param {string} input.outcome       Optional short result phrase.
 * @param {string} input.channel       Key of CHANNELS.
 * @param {string} input.tone          Key of TONES.
 * @param {string[]} input.focuses     Ids from FOCUS_AREAS, in order.
 * @param {number} input.deadlineDays  Days from today to ask for a reply. 0 = no deadline.
 * @param {string} input.todayIso      yyyy-mm-dd reference date (never read from the clock here).
 * @param {boolean} input.offerDraft   Offer to ghost-write a first draft.
 * @param {boolean} input.allowVideo   Offer a video alternative.
 * @returns {object} { subject, body, questions, chars, words, readSeconds, segments, ... } or { error }.
 */
export function buildTestimonialRequest(input = {}) {
  const {
    clientName,
    senderName,
    projectName,
    outcome,
    channel = "email",
    tone = "warm",
    focuses = [],
    deadlineDays = 7,
    todayIso,
    offerDraft = true,
    allowVideo = false,
  } = input;

  const channelSpec = CHANNELS[channel];
  if (!channelSpec) return { error: "Pick a channel: email, WhatsApp, LinkedIn or SMS." };
  if (!TONES[tone]) return { error: "Pick a tone: warm, professional or brief." };

  const client = clean(clientName);
  if (!client) return { error: "Enter the name of the client you're asking." };

  const sender = clean(senderName);
  if (!sender) return { error: "Enter your own name so the message can be signed off." };

  const project = clean(projectName) || "the project we worked on";
  const outcomeText = clean(outcome).replace(/[.]+$/, "");

  const ids = Array.isArray(focuses) ? focuses.filter((id) => FOCUS_BY_ID[id]) : [];
  const uniqueIds = ids.filter((id, index) => ids.indexOf(id) === index);
  if (uniqueIds.length === 0) {
    return { error: "Choose at least one question to ask — a request with no question rarely gets answered." };
  }

  const days = Number(deadlineDays);
  if (!Number.isFinite(days) || days < 0) {
    return { error: "Reply window must be 0 days (no deadline) or more." };
  }
  if (days > MAX_DEADLINE_DAYS) {
    return { error: `Keep the reply window to ${MAX_DEADLINE_DAYS} days or less — beyond that the request is forgotten.` };
  }

  let deadlineIso = "";
  if (days > 0) {
    deadlineIso = addDaysIso(todayIso, Math.round(days)) || "";
    if (!deadlineIso) {
      return { error: "Reference date must be a real calendar date in yyyy-mm-dd form." };
    }
  }

  const questions = uniqueIds.map((id) => FOCUS_BY_ID[id].question);
  const deadlineText = deadlineIso
    ? `If you can send it over by ${formatIsoLong(deadlineIso)} that would be perfect — but no pressure if the week runs away with you.`
    : "";

  /* ---- SMS gets its own compressed shape: one question, one ask ---- */
  if (channelSpec.id === "sms") {
    const firstQuestion = questions[0];
    const smsBody = [
      `Hi ${client}, ${sender} here.`,
      `Could I use a line from you about ${project} as a testimonial?`,
      firstQuestion,
      deadlineIso ? `Any time before ${formatIsoLong(deadlineIso)} is great.` : "",
      "I'll send the final wording for your OK first.",
    ]
      .filter(Boolean)
      .join(" ");

    const chars = smsBody.length;
    const words = countWords(smsBody);
    return {
      channel: channelSpec.id,
      channelLabel: channelSpec.label,
      subject: "",
      body: smsBody,
      questions: [firstQuestion],
      droppedQuestions: questions.length - 1,
      chars,
      words,
      readSeconds: readingSeconds(words),
      segments: smsSegments(chars),
      maxChars: channelSpec.maxChars,
      overLimit: false,
      subjectChars: 0,
      subjectTruncated: false,
      deadlineIso,
      deadlineLabel: deadlineIso ? formatIsoLong(deadlineIso) : "",
      tooManyQuestions: false,
      rushedDeadline: days > 0 && days < MIN_POLITE_DEADLINE_DAYS,
    };
  }

  /* ---- Email / WhatsApp / LinkedIn ---- */
  const greeting = tone === "professional" ? `Dear ${client},` : `Hi ${client},`;
  const questionBlock = questions.map((question, index) => `${index + 1}. ${question}`);

  const bodyLines = [
    greeting,
    "",
    capitalizeFirst(openingLine(tone, client, project, outcomeText)),
    "",
    askLine(tone, questions.length),
    "",
    ...questionBlock,
    "",
    ...closingLines({ tone, sender, deadlineText, offerDraft, allowVideo }).flatMap((line, index, arr) =>
      index === arr.length - 2 ? ["", line] : [line],
    ),
  ];

  const body = bodyLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const subject = channelSpec.hasSubject
    ? (tone === "brief"
        ? `Two minutes for a testimonial, ${client}?`
        : `Quick favour, ${client} — a few lines about ${project}?`)
    : "";

  const chars = body.length;
  const words = countWords(body);
  const subjectLimit = channelSpec.id === "linkedin" ? LINKEDIN_SUBJECT_MAX : EMAIL_SUBJECT_DISPLAY_CHARS;

  return {
    channel: channelSpec.id,
    channelLabel: channelSpec.label,
    subject,
    body,
    questions,
    droppedQuestions: 0,
    chars,
    words,
    readSeconds: readingSeconds(words),
    segments: 0,
    maxChars: channelSpec.maxChars,
    overLimit: channelSpec.hardLimit && chars > channelSpec.maxChars,
    subjectChars: subject.length,
    subjectTruncated: Boolean(subject) && subject.length > subjectLimit,
    subjectLimit,
    deadlineIso,
    deadlineLabel: deadlineIso ? formatIsoLong(deadlineIso) : "",
    tooManyQuestions: questions.length > MAX_COMFORTABLE_QUESTIONS,
    rushedDeadline: days > 0 && days < MIN_POLITE_DEADLINE_DAYS,
  };
}

/** Subject + body as one copyable block. */
export function toPlainText(result) {
  if (!result || result.error) return "";
  return result.subject ? `Subject: ${result.subject}\n\n${result.body}` : result.body;
}
