/**
 * Podcast guest brief builder — pure planning maths and copy assembly.
 *
 * The rundown is a straight time budget:
 *   recorded minutes = intro + (segments x per-segment) + outro + technical buffer
 * Every block gets a cumulative start timecode, so the host can read the sheet
 * against the recorder's clock.
 */

/** A 10% technical buffer is common studio practice for room tone, level checks
 *  and restarts; it is a planning convention, not a broadcast standard. */
export const DEFAULT_BUFFER_PERCENT = 10;

/** Practical limits for a single-guest interview episode. */
export const MIN_EPISODE_MINUTES = 8;
export const MAX_EPISODE_MINUTES = 240;
export const MIN_SEGMENTS = 1;
export const MAX_SEGMENTS = 6;

/**
 * Minutes of tape a single question typically consumes, including the guest's
 * answer and one follow-up. Derived from the common interview rule of thumb
 * that a considered answer runs 2-3 minutes.
 */
export const DEPTH_PROFILES = {
  quick: { id: "quick", label: "Quick takes", minutesPerQuestion: 1.5 },
  standard: { id: "standard", label: "Standard interview", minutesPerQuestion: 2.5 },
  deep: { id: "deep", label: "Deep dive", minutesPerQuestion: 4 },
};

/** Editing typically removes a share of the recorded tape. Conservative
 *  planning ranges used to estimate the published runtime. */
export const EDIT_TRIM_PERCENT = {
  light: 8,
  normal: 15,
  heavy: 28,
};

/** Question bank per narrative beat. {guest} {role} {topic} {company} are
 *  substituted at build time. */
export const SEGMENT_ARC = [
  {
    id: "origin",
    name: "Origin story",
    purpose: "Give listeners a reason to trust the guest before the ideas start.",
    questions: [
      "{guest}, most people meet you as {role}. What were you doing right before that?",
      "What was the first moment you realised {topic} was going to be your thing?",
      "Was there a decision early on that everyone around you thought was a mistake?",
      "What does a normal working week actually look like for you now?",
    ],
  },
  {
    id: "core",
    name: "The core topic",
    purpose: "The reason this episode exists — get the strongest idea on tape early.",
    questions: [
      "If someone knows nothing about {topic}, how would you explain it in two minutes?",
      "What is the most common thing people get wrong about {topic}?",
      "Where does the standard advice on {topic} break down in practice?",
      "What changed about {topic} in the last two years that most people missed?",
    ],
  },
  {
    id: "lessons",
    name: "Hard-won lessons",
    purpose: "Specific, costly experience — the part listeners quote afterwards.",
    questions: [
      "Tell me about a time {topic} went badly for you. What did it cost?",
      "What did you believe five years ago that you have since abandoned?",
      "Which piece of popular advice do you think is actively harmful here?",
      "What is the hardest conversation this work has forced you to have?",
    ],
  },
  {
    id: "playbook",
    name: "Practical playbook",
    purpose: "Turn the story into something a listener can act on this week.",
    questions: [
      "If a listener wants to start with {topic} on Monday, what are the first three steps?",
      "What tools or processes do you actually use day to day?",
      "How do you know when something is working, and when do you cut it?",
      "What would you do differently if you were starting today with no budget?",
    ],
  },
  {
    id: "future",
    name: "What is next",
    purpose: "Forward-looking material that keeps the episode fresh for months.",
    questions: [
      "What are you working on at {company} right now that you can talk about?",
      "What do you expect {topic} to look like in three years?",
      "What is the question nobody is asking about {topic} yet?",
      "Who should listeners be paying attention to besides you?",
    ],
  },
  {
    id: "rapid",
    name: "Rapid fire and close",
    purpose: "Short answers to lift the energy before the outro.",
    questions: [
      "One book, one habit, one tool. Go.",
      "Best advice you were given about {topic}, in one sentence?",
      "What are you saying no to this year?",
      "Where should people find you after this episode?",
    ],
  },
];

/** Pre-record checks in the order they are usually run. */
export const TECH_CHECKLIST = [
  ["Recording", "Local backup recording running on both ends, not just the platform cloud."],
  ["Levels", "Guest peaking around -12 dBFS with headroom; no clipping on the loudest laugh."],
  ["Headphones", "Both sides on wired headphones so speaker bleed does not create echo."],
  ["Room", "Windows shut, fans and AC off, phone on silent and face down."],
  ["Connection", "Guest on wired ethernet or sitting next to the router; other devices off the network."],
  ["Storage", "At least 2 GB free per recorded hour, plus a second drive or cloud target."],
  ["Consent", "Recording consent captured on tape at the top, plus usage rights for clips."],
  ["Names", "Correct spelling and pronunciation of the guest name, company and any products."],
  ["Safety net", "Agreed hand signal or chat phrase for a restart, and a spare 10 minutes in the calendar."],
];

const clampInt = (value, min, max) => Math.min(max, Math.max(min, Math.round(value)));

const pad2 = (n) => String(n).padStart(2, "0");

/** Minutes (may be fractional) to an mm:ss timecode. */
export function formatTimecode(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "00:00";
  const totalSeconds = Math.round(minutes * 60);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
}

function fillTemplate(text, tokens) {
  return text
    .replace(/\{guest\}/g, tokens.guest)
    .replace(/\{role\}/g, tokens.role)
    .replace(/\{topic\}/g, tokens.topic)
    .replace(/\{company\}/g, tokens.company);
}

/**
 * Build the full guest brief.
 * All inputs are plain values; the function is pure.
 */
export function buildGuestBrief({
  guestName = "",
  guestRole = "",
  company = "",
  topic = "",
  episodeMinutes = 45,
  introMinutes = 3,
  outroMinutes = 3,
  segmentCount = 4,
  depth = "standard",
  bufferPercent = DEFAULT_BUFFER_PERCENT,
  editStyle = "normal",
} = {}) {
  const total = Number(episodeMinutes);
  const intro = Number(introMinutes);
  const outro = Number(outroMinutes);
  const buffer = Number(bufferPercent);

  if (![total, intro, outro, buffer].every((n) => Number.isFinite(n))) {
    return { error: "Enter valid numbers for the episode length, intro, outro and buffer." };
  }
  if (total < MIN_EPISODE_MINUTES || total > MAX_EPISODE_MINUTES) {
    return {
      error: `Recorded length should be between ${MIN_EPISODE_MINUTES} and ${MAX_EPISODE_MINUTES} minutes.`,
    };
  }
  if (intro < 0 || outro < 0) {
    return { error: "Intro and outro cannot be negative." };
  }
  if (buffer < 0 || buffer > 40) {
    return { error: "Technical buffer should be between 0% and 40% of the recording." };
  }

  const segments = clampInt(Number(segmentCount) || MIN_SEGMENTS, MIN_SEGMENTS, MAX_SEGMENTS);
  const profile = DEPTH_PROFILES[depth] || DEPTH_PROFILES.standard;
  const trimPercent = EDIT_TRIM_PERCENT[editStyle] ?? EDIT_TRIM_PERCENT.normal;

  const bufferMinutes = (total * buffer) / 100;
  const interviewMinutes = total - intro - outro - bufferMinutes;

  if (interviewMinutes <= 0) {
    return {
      error:
        "Intro, outro and buffer use up the whole recording. Shorten them or raise the recorded length.",
    };
  }

  const perSegment = interviewMinutes / segments;
  if (perSegment < 1) {
    return { error: "Each segment gets under a minute. Use fewer segments or a longer episode." };
  }

  const tokens = {
    guest: guestName.trim() || "our guest",
    role: guestRole.trim() || "an expert in the field",
    topic: topic.trim() || "the topic",
    company: company.trim() || "your team",
  };

  const questionsPerSegment = Math.max(1, Math.round(perSegment / profile.minutesPerQuestion));

  const blocks = [];
  let cursor = 0;

  if (intro > 0) {
    blocks.push({
      id: "intro",
      kind: "intro",
      name: "Cold open and intro",
      purpose: "Hook, guest credibility line, and what the listener will walk away with.",
      start: cursor,
      minutes: intro,
      questions: [
        `One-line hook: why should someone care about ${tokens.topic} today?`,
        `Introduce ${tokens.guest} as ${tokens.role}${company.trim() ? ` at ${tokens.company}` : ""}.`,
        "State the promise of the episode in a single sentence.",
      ],
    });
    cursor += intro;
  }

  for (let i = 0; i < segments; i += 1) {
    const arc = SEGMENT_ARC[i];
    const bank = arc.questions;
    const picked = [];
    for (let q = 0; q < questionsPerSegment; q += 1) {
      picked.push(fillTemplate(bank[q % bank.length], tokens));
    }
    blocks.push({
      id: arc.id,
      kind: "segment",
      name: `${i + 1}. ${arc.name}`,
      purpose: arc.purpose,
      start: cursor,
      minutes: perSegment,
      questions: picked,
    });
    cursor += perSegment;
  }

  if (outro > 0) {
    blocks.push({
      id: "outro",
      kind: "outro",
      name: "Outro and call to action",
      purpose: "Thanks, where to find the guest, and one clear next step for the listener.",
      start: cursor,
      minutes: outro,
      questions: [
        `Where can listeners find ${tokens.guest}?`,
        "Single call to action: subscribe, newsletter or the linked resource.",
        "Record 30 seconds of room tone after the goodbye.",
      ],
    });
    cursor += outro;
  }

  if (bufferMinutes > 0) {
    blocks.push({
      id: "buffer",
      kind: "buffer",
      name: "Technical buffer",
      purpose: "Level checks, restarts and overruns. Book it, do not borrow it from the interview.",
      start: cursor,
      minutes: bufferMinutes,
      questions: [],
    });
    cursor += bufferMinutes;
  }

  const totalQuestions = blocks
    .filter((block) => block.kind === "segment")
    .reduce((sum, block) => sum + block.questions.length, 0);

  const publishedMinutes = total * (1 - trimPercent / 100);

  return {
    blocks,
    segments,
    perSegment,
    interviewMinutes,
    bufferMinutes,
    questionsPerSegment,
    totalQuestions,
    minutesPerQuestion: profile.minutesPerQuestion,
    depthLabel: profile.label,
    trimPercent,
    publishedMinutes,
    recordedMinutes: total,
    checklist: TECH_CHECKLIST,
    guest: tokens.guest,
    topic: tokens.topic,
  };
}

/** Plain-text brief suitable for pasting into an email or a shared doc. */
export function formatBriefText(brief) {
  if (!brief || brief.error) return "";
  const lines = [
    `Guest brief — ${brief.guest}`,
    `Topic: ${brief.topic}`,
    `Recorded target: ${brief.recordedMinutes} min · Published estimate: ${Math.round(brief.publishedMinutes)} min`,
    `${brief.segments} segments · ${brief.totalQuestions} questions · ${brief.depthLabel}`,
    "",
    "RUNDOWN",
  ];
  brief.blocks.forEach((block) => {
    lines.push(
      `${formatTimecode(block.start)}  ${block.name} (${Math.round(block.minutes * 10) / 10} min)`,
    );
    if (block.purpose) lines.push(`        ${block.purpose}`);
    block.questions.forEach((question) => lines.push(`        - ${question}`));
    lines.push("");
  });
  lines.push("TECH CHECKLIST");
  brief.checklist.forEach(([title, detail]) => lines.push(`  [ ] ${title}: ${detail}`));
  return lines.join("\n");
}
