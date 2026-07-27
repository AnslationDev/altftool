/**
 * Reels hook scripting maths and deterministic hook templates.
 *
 * The core arithmetic is a speaking-rate budget: words = wpm / 60 * seconds.
 * Everything else is a timed beat sheet derived from the total runtime.
 */

/**
 * Conversational narration pace for short-form social video, words per minute.
 * Audiobook and broadcast narration sits near 150 wpm; creators reading to
 * camera for Reels typically land at 150-180 wpm.
 */
export const DEFAULT_SPEAKING_WPM = 160;

export const MIN_SPEAKING_WPM = 80;
export const MAX_SPEAKING_WPM = 260;

/** The hook window creators optimise for: the first three seconds. */
export const DEFAULT_HOOK_SECONDS = 3;
export const MIN_HOOK_SECONDS = 1;
export const MAX_HOOK_SECONDS = 10;

/** A Reel needs enough runtime for a hook, some context, a body and a close. */
export const MIN_TOTAL_SECONDS = 8;
/** Instagram Reels accept clips up to 3 minutes (180 seconds). */
export const MAX_TOTAL_SECONDS = 180;

/** Share of total runtime given to the context/promise beat after the hook. */
export const CONTEXT_SHARE = 0.15;
export const MIN_CONTEXT_SECONDS = 2;

/** Share of total runtime given to the closing call to action. */
export const CTA_SHARE = 0.12;
export const MIN_CTA_SECONDS = 2;

/** Reels are shot and delivered as 1080 x 1920, a 9:16 frame. */
export const REEL_FRAME = "1080 x 1920 px (9:16)";

/**
 * Approximate share of the 9:16 frame covered by the Reels interface.
 * Caption, audio strip and action buttons sit over the bottom and right,
 * the profile/menu row over the top. Keep burned-in text outside these bands.
 */
export const SAFE_ZONE = {
  topPercent: 14,
  bottomPercent: 35,
  rightPercent: 15,
};

/** Words counted the way a teleprompter counts them. */
export function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/** Seconds needed to speak a given number of words at a given pace. */
export function speakingSeconds(words, wpm) {
  const w = Number(words);
  const rate = Number(wpm);
  if (!(w > 0) || !(rate > 0)) return 0;
  return (w / rate) * 60;
}

/** Words that fit inside a window at a given pace, rounded down. */
export function wordBudget(seconds, wpm) {
  const s = Number(seconds);
  const rate = Number(wpm);
  if (!(s > 0) || !(rate > 0)) return 0;
  return Math.floor((rate / 60) * s);
}

const FALLBACK = {
  audience: "creators",
  topic: "this",
  outcome: "the result you want",
  mistake: "the usual advice",
};

const clean = (value, fallback) => {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text || fallback;
};

/** Capitalise the first letter so a line starting with a user field still reads as a sentence. */
const sentenceCase = (text) => {
  const value = String(text ?? "");
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const HOOK_STYLES = [
  {
    id: "question",
    label: "Open question",
    note: "Names a gap the viewer recognises, so staying feels like getting an answer.",
    build: (f) => [
      `Why do most ${f.audience} get ${f.topic} wrong?`,
      `${f.audience}: what if ${f.topic} took one sitting?`,
      `Is ${f.mistake} the reason you still don't have ${f.outcome}?`,
      `How do you go from ${f.mistake} to ${f.outcome}?`,
    ],
  },
  {
    id: "claim",
    label: "Bold claim",
    note: "States the payoff immediately; the rest of the Reel is the proof.",
    build: (f) => [
      `${f.topic} is the fastest route to ${f.outcome}.`,
      `You do not need ${f.mistake} to get ${f.outcome}.`,
      `Most ${f.audience} only need one change to reach ${f.outcome}.`,
      `${f.outcome}, start to finish, in one Reel.`,
    ],
  },
  {
    id: "mistake",
    label: "Mistake callout",
    note: "Loss framing: people act harder to avoid a loss than to chase a gain.",
    build: (f) => [
      `Stop ${f.mistake}. It is costing ${f.audience} ${f.outcome}.`,
      `Three ${f.topic} mistakes almost every one of you makes.`,
      `If you are still stuck on ${f.mistake}, ${f.outcome} will never land.`,
      `${f.mistake} is the number one reason ${f.topic} fails.`,
    ],
  },
  {
    id: "result",
    label: "Proof / result",
    note: "Leads with the outcome already achieved, then reverse-engineers it.",
    build: (f) => [
      `This is how I reached ${f.outcome} using ${f.topic}.`,
      `${f.outcome}. Here is the exact ${f.topic} behind it.`,
      `Same ${f.topic}, different result. Here is what changed.`,
      `From ${f.mistake} to ${f.outcome}, step by step.`,
    ],
  },
  {
    id: "contrarian",
    label: "Contrarian",
    note: "Contradicts the default advice, which forces a second of attention.",
    build: (f) => [
      `${f.topic} advice is backwards. Here is what works.`,
      `Everyone tells ${f.audience} to try ${f.mistake}. Do this instead.`,
      `You do not have a ${f.topic} problem. You have a ${f.mistake} problem.`,
      `Unpopular: ${f.outcome} has little to do with ${f.topic}.`,
    ],
  },
  {
    id: "list",
    label: "Numbered list",
    note: "A countable promise tells the viewer exactly how long they must stay.",
    build: (f) => [
      `Three ${f.topic} fixes for ${f.audience}, right now.`,
      `Save this: the ${f.topic} checklist that gets ${f.outcome}.`,
      `Five ${f.topic} rules. Number three is why you are stuck.`,
      `${f.topic} in four steps, ending at ${f.outcome}.`,
    ],
  },
];

export function getHookStyle(styleId) {
  return HOOK_STYLES.find((style) => style.id === styleId) || HOOK_STYLES[0];
}

/**
 * Timed beat sheet for the whole Reel.
 * Hook, then a context beat, then the body, then the call to action.
 */
export function buildBeatSheet(totalSeconds, hookSeconds) {
  const total = Number(totalSeconds);
  const hook = Number(hookSeconds);
  if (!(total > 0) || !(hook > 0) || hook >= total) return [];

  const remaining = total - hook;
  let context = Math.max(MIN_CONTEXT_SECONDS, total * CONTEXT_SHARE);
  let cta = Math.max(MIN_CTA_SECONDS, total * CTA_SHARE);

  // If context + cta would swallow the body, scale both down proportionally
  // and keep at least 40% of the post-hook time for the actual content.
  const maxSupport = remaining * 0.6;
  if (context + cta > maxSupport) {
    const scale = maxSupport / (context + cta);
    context *= scale;
    cta *= scale;
  }

  const body = remaining - context - cta;
  const beats = [
    {
      id: "hook",
      label: "Hook",
      start: 0,
      end: hook,
      direction: "Speak the hook line before anything else. No intro, no logo, no 'hey guys'.",
      onScreen: "Burn the hook in as text too — most first views start muted.",
    },
    {
      id: "context",
      label: "Context / promise",
      start: hook,
      end: hook + context,
      direction: "Say who this is for and what they will have by the end.",
      onScreen: "One short line, different colour from the hook so the change is visible.",
    },
    {
      id: "body",
      label: "Body",
      start: hook + context,
      end: hook + context + body,
      direction: "Deliver the promise in order. Cut on every new idea to reset attention.",
      onScreen: "Step labels only (1, 2, 3) — do not subtitle the whole script twice.",
    },
    {
      id: "cta",
      label: "Call to action",
      start: hook + context + body,
      end: total,
      direction: "One ask. Save, share, follow or comment a keyword — never all four.",
      onScreen: "Keep the ask above the caption band so the interface does not cover it.",
    },
  ];

  return beats.map((beat) => ({ ...beat, duration: beat.end - beat.start }));
}

/**
 * Build hooks plus the beat sheet.
 * @param {object} input
 * @param {string} input.audience
 * @param {string} input.topic
 * @param {string} input.outcome
 * @param {string} input.mistake
 * @param {string} input.styleId
 * @param {number} input.hookSeconds
 * @param {number} input.totalSeconds
 * @param {number} input.wpm
 */
export function buildHookScript(input = {}) {
  const {
    audience,
    topic,
    outcome,
    mistake,
    styleId = HOOK_STYLES[0].id,
    hookSeconds = DEFAULT_HOOK_SECONDS,
    totalSeconds = 30,
    wpm = DEFAULT_SPEAKING_WPM,
  } = input;

  const hook = Number(hookSeconds);
  const total = Number(totalSeconds);
  const rate = Number(wpm);

  if (!Number.isFinite(hook) || !Number.isFinite(total) || !Number.isFinite(rate)) {
    return { error: "Enter valid numbers for hook length, total length and speaking pace." };
  }
  if (hook < MIN_HOOK_SECONDS || hook > MAX_HOOK_SECONDS) {
    return { error: `Hook window must be between ${MIN_HOOK_SECONDS} and ${MAX_HOOK_SECONDS} seconds.` };
  }
  if (total < MIN_TOTAL_SECONDS || total > MAX_TOTAL_SECONDS) {
    return {
      error: `Reel length must be between ${MIN_TOTAL_SECONDS} and ${MAX_TOTAL_SECONDS} seconds.`,
    };
  }
  if (hook >= total) {
    return { error: "The hook window must be shorter than the whole Reel." };
  }
  if (rate < MIN_SPEAKING_WPM || rate > MAX_SPEAKING_WPM) {
    return {
      error: `Speaking pace must be between ${MIN_SPEAKING_WPM} and ${MAX_SPEAKING_WPM} words per minute.`,
    };
  }

  const fields = {
    audience: clean(audience, FALLBACK.audience),
    topic: clean(topic, FALLBACK.topic),
    outcome: clean(outcome, FALLBACK.outcome),
    mistake: clean(mistake, FALLBACK.mistake),
  };

  const style = getHookStyle(styleId);
  const budget = wordBudget(hook, rate);

  const hooks = style.build(fields).map((raw, index) => {
    const line = sentenceCase(raw);
    const words = countWords(line);
    const seconds = speakingSeconds(words, rate);
    return {
      id: `${style.id}-${index + 1}`,
      line,
      words,
      seconds,
      overBy: Math.max(0, words - budget),
      fits: seconds <= hook,
    };
  });

  const fitting = hooks.filter((item) => item.fits).length;

  return {
    style: { id: style.id, label: style.label, note: style.note },
    fields,
    hookSeconds: hook,
    totalSeconds: total,
    wpm: rate,
    wordBudget: budget,
    hooks,
    fittingHooks: fitting,
    shortestHook: hooks.reduce(
      (best, item) => (best === null || item.words < best.words ? item : best),
      null,
    ),
    beats: buildBeatSheet(total, hook),
    frame: REEL_FRAME,
    safeZone: SAFE_ZONE,
  };
}
