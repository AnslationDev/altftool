/**
 * Podcast Outline Prompt Builder.
 *
 * Splits an episode runtime into timed blocks — cold open, intro, segments,
 * outro — computes how much time each planned question really gets, and
 * writes the outline prompt with those timings embedded.
 */

/**
 * Conversational speech runs about 150 words per minute — the standard
 * scripting figure for narration and spoken outlines.
 */
export const SPEAKING_WORDS_PER_MINUTE = 150;

/**
 * Cold open: a 30–60 second teaser clip from the episode before any intro
 * music is common practice; 45 seconds is the midpoint used here.
 */
export const COLD_OPEN_SECONDS = 45;

/** Show intro + guest/topic introduction. Longer intros bleed drop-off. */
export const INTRO_SECONDS = 60;

/** Outro: recap, one CTA and plugs. */
export const OUTRO_SECONDS = 90;

/**
 * A substantive interview answer runs about 2–3 minutes once follow-ups are
 * counted, so a plan giving each question under 2 minutes is over-stuffed.
 */
export const MIN_MINUTES_PER_QUESTION = 2;

/** A segment shorter than this cannot develop a topic on air. */
export const MIN_SEGMENT_SECONDS = 120;

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const LIMITS = {
  runtimeMinutes: { min: 5, max: 240 },
  segments: { min: 1, max: 10 },
  questionsPerSegment: { min: 0, max: 10 },
};

export const FORMATS = [
  {
    id: "interview",
    label: "Interview — host and guest",
    directive:
      "Questions must be askable in one breath, open-ended, and ordered so each builds on the expected answer to the last. Include one planned follow-up per question and mark the single question the episode would be clipped around.",
  },
  {
    id: "solo",
    label: "Solo — one host teaching",
    directive:
      "Each segment makes one point with one worked example. Write the segment's opening line verbatim — solo shows die in vague transitions.",
  },
  {
    id: "cohosted",
    label: "Co-hosted — two hosts discussing",
    directive:
      "Assign each beat to Host A or Host B, and plan one genuine disagreement per segment with the steelman of each side noted.",
  },
  {
    id: "narrative",
    label: "Narrative — scripted storytelling",
    directive:
      "Segments follow the arc: hook the mystery, raise stakes, complicate, resolve, reflect. Note where archive tape or interview clips slot in as [CLIP] markers.",
  },
];

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

export function getFormat(formatId) {
  return FORMATS.find((format) => format.id === formatId) || null;
}

/** Format whole seconds as m:ss (or h:mm:ss above an hour). */
export function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/**
 * Split the runtime into timed blocks and per-question minutes.
 * @returns {{error:string}|object}
 */
export function planEpisode({
  runtimeMinutes,
  segmentCount,
  questionsPerSegment,
  includeColdOpen,
} = {}) {
  const minutes = toInt(runtimeMinutes);
  const segments = toInt(segmentCount);
  const questions = toInt(questionsPerSegment ?? 0);

  if ([minutes, segments, questions].some((value) => Number.isNaN(value))) {
    return { error: "Enter whole numbers for the runtime, segments and questions." };
  }
  if (minutes < LIMITS.runtimeMinutes.min || minutes > LIMITS.runtimeMinutes.max) {
    return {
      error: `Runtime must be between ${LIMITS.runtimeMinutes.min} and ${LIMITS.runtimeMinutes.max} minutes.`,
    };
  }
  if (segments < LIMITS.segments.min || segments > LIMITS.segments.max) {
    return { error: `Use between ${LIMITS.segments.min} and ${LIMITS.segments.max} segments.` };
  }
  if (questions < LIMITS.questionsPerSegment.min || questions > LIMITS.questionsPerSegment.max) {
    return {
      error: `Questions per segment must be between ${LIMITS.questionsPerSegment.min} and ${LIMITS.questionsPerSegment.max}.`,
    };
  }

  const totalSeconds = minutes * 60;
  const coldOpenSeconds = includeColdOpen ? COLD_OPEN_SECONDS : 0;
  const bodySeconds = totalSeconds - coldOpenSeconds - INTRO_SECONDS - OUTRO_SECONDS;

  if (bodySeconds < segments * MIN_SEGMENT_SECONDS) {
    return {
      error: `${segments} segments need at least ${formatTime(segments * MIN_SEGMENT_SECONDS)} of body, but only ${formatTime(Math.max(0, bodySeconds))} remains after the open, intro and outro. Use fewer segments or a longer runtime.`,
    };
  }

  const segmentSecondsEach = bodySeconds / segments;
  let cursor = coldOpenSeconds + INTRO_SECONDS;
  const segmentPlan = Array.from({ length: segments }, (unused, index) => {
    const start = cursor;
    cursor += segmentSecondsEach;
    return {
      index: index + 1,
      startSeconds: Math.round(start),
      startLabel: formatTime(start),
      durationSeconds: Math.round(segmentSecondsEach),
      durationLabel: formatTime(segmentSecondsEach),
    };
  });

  const totalQuestions = questions * segments;
  const minutesPerQuestion = questions > 0 ? segmentSecondsEach / questions / 60 : 0;

  const warnings = [];
  if (questions > 0 && minutesPerQuestion < MIN_MINUTES_PER_QUESTION) {
    warnings.push(
      `Each question gets only ${minutesPerQuestion.toFixed(1)} minutes — a real answer plus follow-up needs about ${MIN_MINUTES_PER_QUESTION}-3. Cut questions or segments.`,
    );
  }

  return {
    minutes,
    totalSeconds,
    coldOpenSeconds,
    introSeconds: INTRO_SECONDS,
    outroSeconds: OUTRO_SECONDS,
    bodySeconds,
    segments,
    segmentSecondsEach,
    segmentPlan,
    questionsPerSegment: questions,
    totalQuestions,
    minutesPerQuestion,
    approxSpokenWords: Math.round(minutes * SPEAKING_WORDS_PER_MINUTE),
    outroStartLabel: formatTime(totalSeconds - OUTRO_SECONDS),
    warnings,
  };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    approxTokens: Math.max(1, Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the episode outline prompt, embedding the timing plan.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildEpisodePrompt({
  showName,
  topic,
  guest,
  audience,
  formatId,
  cta,
  notes,
  plan,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid runtime first." };
  const format = getFormat(formatId);
  if (!format) return { error: "Choose the episode format." };
  const subject = typeof topic === "string" && topic.trim() ? topic.trim() : "";
  if (!subject) return { error: "Enter what the episode is about." };
  const show = typeof showName === "string" && showName.trim() ? showName.trim() : "the show";
  const guestText = typeof guest === "string" ? guest.trim() : "";
  const listener =
    typeof audience === "string" && audience.trim() ? audience.trim() : "regular listeners";
  const ctaText = typeof cta === "string" && cta.trim() ? cta.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    `Write a complete episode outline for ${show}. Outline only — not a transcript. Follow the timing plan exactly.`,
    "",
    `EPISODE TOPIC: ${subject}`,
  ];
  if (guestText) lines.push(`GUEST: ${guestText}`);
  lines.push(
    `LISTENER: ${listener}`,
    `FORMAT: ${format.label.split("—")[0].trim()} — ${format.directive}`,
    "",
    `TIMING PLAN — ${plan.minutes} minutes total (about ${plan.approxSpokenWords} spoken words at ${SPEAKING_WORDS_PER_MINUTE} wpm):`,
  );
  if (plan.coldOpenSeconds > 0) {
    lines.push(
      `- 0:00 COLD OPEN (${plan.coldOpenSeconds}s): pick the single most arresting moment the episode will contain and describe the clip to pull.`,
    );
  }
  lines.push(
    `- ${formatTime(plan.coldOpenSeconds)} INTRO (${plan.introSeconds}s): one line on why this topic, one line establishing ${guestText ? "the guest's credibility" : "the host's stake in it"}. No meandering welcome.`,
  );
  for (const segment of plan.segmentPlan) {
    if (plan.questionsPerSegment > 0) {
      lines.push(
        `- ${segment.startLabel} SEGMENT ${segment.index} (${segment.durationLabel}): a named theme, ${plan.questionsPerSegment} questions (~${plan.minutesPerQuestion.toFixed(1)} minutes each including follow-up), and the one thing the listener should retain.`,
      );
    } else {
      lines.push(
        `- ${segment.startLabel} SEGMENT ${segment.index} (${segment.durationLabel}): a named theme, its key beats in order, and the one thing the listener should retain.`,
      );
    }
  }
  lines.push(
    `- ${plan.outroStartLabel} OUTRO (${plan.outroSeconds}s): recap in two sentences, then ${ctaText ? `this single CTA: ${ctaText}` : "one single CTA (review, subscribe OR the next episode — pick one)"}.`,
    "",
    "FOR EVERY SEGMENT ALSO GIVE:",
    "1. The transition line into it, written verbatim.",
    "2. What could derail it (tangent, over-long answer) and the recovery line.",
    "",
    "RULES:",
    "- Segment themes must not overlap; if two do, merge them and say so.",
    "- Every question must be one a listener would actually want answered, not a resume walk-through.",
    "- Do not invent facts about the guest or topic — write [research needed] where preparation must fill a gap.",
    "- Note one moment worth clipping for social, with its segment number.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, format, ...measureText(text) };
}
