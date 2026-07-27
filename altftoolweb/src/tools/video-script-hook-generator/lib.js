/**
 * Opening-hook generator for video scripts.
 *
 * Hooks are built from named copywriting patterns (curiosity gap, contrarian,
 * negative/mistake, numbered promise and so on) rather than invented on the fly,
 * so the same inputs always produce the same set and each line can be explained.
 *
 * Timing uses a words-per-minute read rate. Conversational narration commonly
 * lands between 140 and 170 wpm; 150 is used as the default midpoint.
 */

/** Default narration pace in words per minute. */
export const DEFAULT_WPM = 150;

/** Sensible bounds for a spoken pace; outside this the estimate stops being useful. */
export const MIN_WPM = 90;
export const MAX_WPM = 220;

/**
 * Hook budget per format, in seconds. Short vertical video is judged in the first
 * few seconds of the swipe, so the hook has to land before the viewer decides.
 */
export const FORMATS = [
  { id: "short", label: "Short / Reel / vertical (under 60s)", budgetSeconds: 3 },
  { id: "standard", label: "Standard video (2-10 min)", budgetSeconds: 6 },
  { id: "long", label: "Long form (10 min+)", budgetSeconds: 10 },
];

export const TONES = ["friendly", "direct", "bold", "analytical"];

/** Openers that spend the hook window without saying anything. */
export const WEAK_OPENERS = [
  "hi guys",
  "hey guys",
  "hey everyone",
  "hello everyone",
  "what's up",
  "whats up",
  "welcome back",
  "welcome to my channel",
  "in this video",
  "in today's video",
  "in todays video",
  "today we're going to",
  "today we are going to",
  "before we start",
  "before we begin",
  "don't forget to subscribe",
  "make sure to subscribe",
  "thanks for watching",
  "so basically",
  "um so",
];

/** Vague words that make a hook forgettable when they carry the whole promise. */
export const VAGUE_WORDS = ["stuff", "things", "amazing", "awesome", "incredible", "crazy", "insane", "literally", "very", "really"];

/**
 * Hook patterns. `build` receives the normalised field object and returns one line.
 * `tones` and `formats` decide when a pattern is offered.
 */
export const HOOK_PATTERNS = [
  {
    id: "curiosity-gap",
    name: "Curiosity gap",
    rationale: "Names a piece of missing information without revealing it, so the answer is the reason to stay.",
    tones: ["friendly", "bold"],
    formats: ["short", "standard", "long"],
    build: (f) => `Nobody warns you about this part of ${f.topic}.`,
    buildShort: (f) => `Nobody warns you about ${f.topic}.`,
  },
  {
    id: "mistake",
    name: "Negative / mistake",
    rationale: "Loss lands harder than gain, so an error the viewer might be making pulls harder than a benefit.",
    tones: ["direct", "bold"],
    formats: ["short", "standard", "long"],
    build: (f) => `You are probably getting ${f.topic} wrong, and it is costing you ${f.outcome}.`,
    buildShort: (f) => `You are doing ${f.topic} wrong.`,
  },
  {
    id: "contrarian",
    name: "Contrarian",
    rationale: "Contradicts the accepted advice, which forces the viewer to check whether they agree.",
    tones: ["bold", "analytical"],
    formats: ["short", "standard", "long"],
    build: (f) => `Most advice about ${f.topic} is backwards. Here is what actually holds up.`,
    buildShort: (f) => `Most ${f.topic} advice is backwards.`,
  },
  {
    id: "numbered",
    name: "Numbered promise",
    rationale: "A count sets the length expectation up front, which lowers the cost of clicking in.",
    tones: ["friendly", "direct"],
    formats: ["standard", "long"],
    build: (f) => `${f.number} ${f.topic} rules I wish someone had given me on day one.`,
  },
  {
    id: "time-promise",
    name: "Time-bound promise",
    rationale: "Pairs the outcome with a deadline, which makes an abstract benefit feel measurable.",
    tones: ["direct", "analytical"],
    formats: ["short", "standard", "long"],
    build: (f) => `How to get ${f.outcome} from ${f.topic} in ${f.timeframe}.`,
    buildShort: (f) => `${f.topic}, fixed in ${f.timeframe}.`,
  },
  {
    id: "callout",
    name: "Audience call-out",
    rationale: "Names the viewer, so anyone who fits self-selects in the first second.",
    tones: ["direct", "bold"],
    formats: ["short", "standard"],
    build: (f) => `${f.audience}: stop doing ${f.topic} the hard way.`,
    buildShort: (f) => `${f.audience}, stop doing ${f.topic} this way.`,
  },
  {
    id: "question",
    name: "Open question",
    rationale: "An unanswered question is uncomfortable to leave, especially when it describes the viewer.",
    tones: ["friendly", "analytical"],
    formats: ["standard", "long"],
    build: (f) => `Why does ${f.topic} work for some people and go nowhere for everyone else?`,
  },
  {
    id: "stakes",
    name: "Stakes framing",
    rationale: "Puts the cost of getting it wrong next to the reward for getting it right.",
    tones: ["bold", "analytical"],
    formats: ["standard", "long"],
    build: (f) => `Get ${f.topic} wrong and you lose ${f.outcome}. Get it right and it takes ${f.timeframe}.`,
  },
  {
    id: "proof",
    name: "Tested / proof",
    rationale: "A test implies evidence rather than opinion, which raises trust before the content starts.",
    tones: ["analytical", "direct"],
    formats: ["standard", "long"],
    build: (f) => `I tried ${f.number} approaches to ${f.topic} over ${f.timeframe}. One of them held up.`,
  },
  {
    id: "cold-open",
    name: "Cold open",
    rationale: "Starts mid-action with no preamble, so the setup arrives after attention is already held.",
    tones: ["bold", "friendly"],
    formats: ["short", "standard"],
    build: (f) => `This is the moment ${f.topic} finally clicked.`,
    buildShort: (f) => `Watch ${f.topic} finally click.`,
  },
  {
    id: "before-after",
    name: "Before and after",
    rationale: "Two contrasting states make the change concrete before it is explained.",
    tones: ["friendly", "bold"],
    formats: ["short", "standard"],
    build: (f) => `${f.topic} before the fix, and ${f.topic} after. Same effort, different result.`,
    buildShort: (f) => `${f.topic} before. ${f.topic} after.`,
  },
  {
    id: "reframe",
    name: "Reframe",
    rationale: "Replaces the viewer's mental model in one sentence, which reframes everything that follows.",
    tones: ["analytical", "friendly"],
    formats: ["standard", "long"],
    build: (f) => `Treat ${f.topic} as a process, not a talent, and you can repeat ${f.outcome} on purpose.`,
  },
];

const collapse = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

/** Capitalise the first letter of each sentence so a topic in slot one reads correctly. */
export function sentenceCase(text) {
  if (typeof text !== "string") return "";
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (match, lead, letter) => lead + letter.toUpperCase());
}

/** Count words the way a narrator would read them. */
export function countWords(text) {
  const clean = collapse(text);
  if (!clean) return 0;
  return clean.split(" ").filter(Boolean).length;
}

/** Spoken duration in seconds for a word count at a given pace. */
export function secondsForWords(words, wpm) {
  const pace = Number(wpm);
  if (!Number.isFinite(pace) || pace <= 0) return null;
  if (!Number.isFinite(words) || words < 0) return null;
  return Math.round(((words / pace) * 60) * 10) / 10;
}

export function formatById(id) {
  return FORMATS.find((format) => format.id === id) || null;
}

/** Fill in defaults, trim, and reject unusable input. */
export function normaliseFields(input) {
  const raw = input && typeof input === "object" ? input : {};
  const topic = collapse(raw.topic);
  if (!topic) return { error: "Enter the video topic so the hooks have something to be about." };
  if (topic.length > 80) return { error: "Keep the topic under 80 characters — a hook cannot carry more." };

  const format = typeof raw.format === "string" ? raw.format : "short";
  if (!formatById(format)) return { error: "Choose one of the listed video formats." };

  const tone = typeof raw.tone === "string" ? raw.tone : "direct";
  if (!TONES.includes(tone) && tone !== "any") {
    return { error: `Tone must be one of: ${TONES.join(", ")}, or any.` };
  }

  const wpm = raw.wpm === undefined || raw.wpm === "" ? DEFAULT_WPM : Number(raw.wpm);
  if (!Number.isFinite(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Speaking pace must be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const number = raw.number === undefined || raw.number === "" ? 5 : Number(raw.number);
  if (!Number.isInteger(number) || number < 2 || number > 99) {
    return { error: "The list count must be a whole number between 2 and 99." };
  }

  return {
    topic: topic.replace(/[.!?]+$/, ""),
    audience: collapse(raw.audience) || "Beginners",
    outcome: collapse(raw.outcome) || "better results",
    timeframe: collapse(raw.timeframe) || "a week",
    number,
    format,
    tone,
    wpm,
  };
}

/**
 * Generate hooks for the given brief.
 * @returns {{hooks:Array, fields:Object, budgetSeconds:number, fitCount:number}|{error:string}}
 */
export function generateHooks(input) {
  const fields = normaliseFields(input);
  if (fields.error) return fields;

  const format = formatById(fields.format);
  const budget = format.budgetSeconds;

  const matching = HOOK_PATTERNS.filter(
    (pattern) =>
      pattern.formats.includes(fields.format) &&
      (fields.tone === "any" || pattern.tones.includes(fields.tone)),
  );
  const patterns = matching.length > 0 ? matching : HOOK_PATTERNS.filter((p) => p.formats.includes(fields.format));
  if (patterns.length === 0) {
    return { error: "No hook patterns match that format and tone combination." };
  }

  const hooks = patterns.map((pattern) => {
    // Short vertical video gets a terser variant so the line can land inside the
    // three-second budget; longer formats use the fuller sentence.
    const builder =
      fields.format === "short" && typeof pattern.buildShort === "function"
        ? pattern.buildShort
        : pattern.build;
    const text = sentenceCase(collapse(builder(fields)));
    const words = countWords(text);
    const seconds = secondsForWords(words, fields.wpm);
    return {
      id: pattern.id,
      name: pattern.name,
      rationale: pattern.rationale,
      text,
      words,
      seconds,
      characters: text.length,
      fits: seconds !== null && seconds <= budget,
    };
  });

  hooks.sort((a, b) => a.seconds - b.seconds || a.name.localeCompare(b.name));

  const fitCount = hooks.filter((hook) => hook.fits).length;
  const fastest = hooks[0];

  return {
    fields,
    formatLabel: format.label,
    budgetSeconds: budget,
    hooks,
    total: hooks.length,
    fitCount,
    fastest,
  };
}

/**
 * Review a hook the user wrote themselves against the same budget and the
 * weak-opener / vague-word lists.
 */
export function reviewHook(text, options) {
  const fields = { ...(options || {}) };
  const clean = collapse(text);
  if (!clean) return { error: "Paste a hook to review it." };

  const format = formatById(typeof fields.format === "string" ? fields.format : "short");
  if (!format) return { error: "Choose one of the listed video formats." };

  const wpm = fields.wpm === undefined || fields.wpm === "" ? DEFAULT_WPM : Number(fields.wpm);
  if (!Number.isFinite(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Speaking pace must be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const words = countWords(clean);
  const seconds = secondsForWords(words, wpm);
  const lower = clean.toLowerCase();

  const issues = [];
  const weak = WEAK_OPENERS.filter((opener) => lower.startsWith(opener) || lower.includes(` ${opener}`));
  if (weak.length > 0) issues.push(`Spends the opening on filler: "${weak[0]}".`);
  if (seconds !== null && seconds > format.budgetSeconds) {
    issues.push(`Runs about ${seconds}s at ${wpm} wpm, over the ${format.budgetSeconds}s budget for this format.`);
  }
  const vague = VAGUE_WORDS.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(clean));
  if (vague.length > 0) issues.push(`Leans on vague wording: ${vague.join(", ")}.`);
  if (!/[a-z]/i.test(clean)) issues.push("No readable words found.");
  if (words > 0 && words < 3) issues.push("Under three words — too thin to set up a promise.");
  if (/\?/.test(clean) === false && /^(what|why|how|who|when)\b/i.test(clean)) {
    issues.push("Opens like a question but has no question mark.");
  }

  const maxScore = 4;
  let score = maxScore;
  if (weak.length > 0) score -= 2;
  if (seconds !== null && seconds > format.budgetSeconds) score -= 1;
  if (vague.length > 0) score -= 1;
  if (score < 0) score = 0;

  return {
    text: clean,
    words,
    seconds,
    characters: clean.length,
    budgetSeconds: format.budgetSeconds,
    fits: seconds !== null && seconds <= format.budgetSeconds,
    issues,
    score,
    maxScore,
    verdict: issues.length === 0 ? "Clean" : score >= 3 ? "Usable, tighten it" : "Rewrite it",
  };
}
