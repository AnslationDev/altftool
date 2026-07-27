/**
 * Content Creator Prompt Pack — script budgeting + prompt composition.
 *
 * Pure module: no React, no DOM, no clocks.
 */

/**
 * Published platform limits, checked against each platform's own help centre.
 * `maxSeconds` is the limit for the short-form format named in `note`.
 */
export const PLATFORMS = [
  {
    id: "youtube-shorts",
    label: "YouTube Shorts",
    titleLimit: 100,
    captionLimit: 5000,
    hashtagLimit: 15,
    maxSeconds: 180,
    note: "YouTube titles cap at 100 characters and descriptions at 5,000. Shorts run up to 3 minutes.",
  },
  {
    id: "youtube-long",
    label: "YouTube (long form)",
    titleLimit: 100,
    captionLimit: 5000,
    hashtagLimit: 15,
    maxSeconds: 3600,
    note: "Only the first ~157 characters of the description show above the fold; put the hook and links there.",
  },
  {
    id: "instagram-reels",
    label: "Instagram Reels",
    titleLimit: 125,
    captionLimit: 2200,
    hashtagLimit: 30,
    maxSeconds: 180,
    note: "Instagram captions cap at 2,200 characters and 30 hashtags per post; the feed truncates after roughly 125 characters.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    titleLimit: 150,
    captionLimit: 2200,
    hashtagLimit: 30,
    maxSeconds: 600,
    note: "TikTok captions cap at 2,200 characters. Keep the on-screen hook in the first 2 seconds.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    titleLimit: 210,
    captionLimit: 3000,
    hashtagLimit: 5,
    maxSeconds: 600,
    note: "LinkedIn posts cap at 3,000 characters and collapse behind 'see more' after about 210 characters.",
  },
  {
    id: "x",
    label: "X (Twitter)",
    titleLimit: 280,
    captionLimit: 280,
    hashtagLimit: 3,
    maxSeconds: 140,
    note: "A standard post is capped at 280 characters, so the hook and the payoff must both fit.",
  },
];

/**
 * Speaking pace bands. Conversational English narration is commonly measured at
 * roughly 130-160 words per minute; short-form social delivery runs faster.
 */
export const PACES = [
  { id: "slow", label: "Slow / explainer", wpm: 120 },
  { id: "conversational", label: "Conversational", wpm: 145 },
  { id: "energetic", label: "Energetic short-form", wpm: 175 },
  { id: "rapid", label: "Rapid-fire", wpm: 200 },
];

export const FORMATS = [
  {
    id: "hook",
    label: "Hook variants",
    blurb: "Ten different opening lines for the same idea.",
    instruction:
      "Write 10 distinct opening hooks for this video. Use a different mechanism for each: a contradiction, a specific number, a question the viewer cannot answer, a mistake most people make, a before/after, a stake, a confession, a myth, a shortcut and a countdown. Each hook must be sayable in under 3 seconds.",
    output:
      "A numbered list of 10 hooks. After each hook, in brackets, name the mechanism used and the on-screen text that should appear with it.",
  },
  {
    id: "script",
    label: "Full script",
    blurb: "Hook, body and call to action at the right length.",
    instruction:
      "Write the full spoken script. Structure it as hook, context, the single main point with one concrete example, and a close. Every sentence must be sayable in one breath. No throat-clearing intro, no 'welcome back to my channel'.",
    output:
      "The script as spoken lines only, with [B-ROLL: ...] cues on their own lines. Put the estimated timestamp at the start of each section.",
  },
  {
    id: "title",
    label: "Titles and thumbnail text",
    blurb: "Title options plus the words on the thumbnail.",
    instruction:
      "Write 8 title options for this video. Vary the angle: outcome, curiosity gap, specific number, contrarian take, beginner framing, mistake framing, time-boxed and comparison. For each, add three-to-five words of thumbnail text that does not repeat the title.",
    output:
      "A numbered list. For each entry give the title, its character count, and the thumbnail text on the next line.",
  },
  {
    id: "repurpose",
    label: "Repurposing plan",
    blurb: "Turn one piece into a week of assets.",
    instruction:
      "Break this video into a repurposing plan. Identify the three strongest standalone moments, then map each to the formats that suit it. Say what has to change for each destination, not just where to post it.",
    output:
      "A table with columns: source moment, destination format, what to change, and the caption or opening line. Keep the table under 12 rows.",
  },
  {
    id: "description",
    label: "Description and chapters",
    blurb: "The text under the video, written to be searched.",
    instruction:
      "Write the video description. Open with two sentences that would make someone scrolling search results click, then a short summary, then chapters, then the links section. Use the terms a viewer would actually search for, not internal jargon.",
    output:
      "Plain text, ready to paste. Chapters as 0:00 style timestamps on their own lines. Mark link placeholders as [LINK: label].",
  },
];

/** Practical bounds for a single piece of spoken content. */
export const MIN_SECONDS = 5;
export const MAX_SECONDS = 3600;
export const MIN_WPM = 60;
export const MAX_WPM = 300;

/** Seconds in a minute — used by both budget directions. */
const SECONDS_PER_MINUTE = 60;

/**
 * Words you need to fill `seconds` of speech at `wordsPerMinute`.
 * words = seconds / 60 * wpm
 */
export function wordsForDuration(seconds, wordsPerMinute) {
  const s = Number(seconds);
  const w = Number(wordsPerMinute);
  if (!Number.isFinite(s) || !Number.isFinite(w)) return { error: "Runtime and pace must be numbers." };
  if (s < MIN_SECONDS || s > MAX_SECONDS) {
    return { error: `Runtime must be between ${MIN_SECONDS} and ${MAX_SECONDS} seconds.` };
  }
  if (w < MIN_WPM || w > MAX_WPM) {
    return { error: `Speaking pace must be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }
  return { words: Math.round((s / SECONDS_PER_MINUTE) * w) };
}

/**
 * Runtime in seconds that `words` will occupy at `wordsPerMinute`.
 * seconds = words / wpm * 60
 */
export function durationForWords(words, wordsPerMinute) {
  const n = Number(words);
  const w = Number(wordsPerMinute);
  if (!Number.isFinite(n) || !Number.isFinite(w) || w <= 0 || n < 0) {
    return { error: "Word count and pace must be positive numbers." };
  }
  return { seconds: (n / w) * SECONDS_PER_MINUTE };
}

/** Format a duration as m:ss. Negative or non-finite input becomes 0:00. */
export function formatDuration(totalSeconds) {
  const s = Number(totalSeconds);
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const rounded = Math.round(s);
  const minutes = Math.floor(rounded / SECONDS_PER_MINUTE);
  const seconds = rounded % SECONDS_PER_MINUTE;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getPlatform(platformId) {
  return PLATFORMS.find((item) => item.id === platformId) || null;
}
export function getFormat(formatId) {
  return FORMATS.find((item) => item.id === formatId) || null;
}
export function getPace(paceId) {
  return PACES.find((item) => item.id === paceId) || null;
}

/**
 * Compose the creator prompt.
 * @returns {object} { prompt, wordBudget, ... } or { error }
 */
export function buildCreatorPrompt({
  formatId,
  platformId,
  topic = "",
  audience = "",
  angle = "",
  seconds = 45,
  paceId = "energetic",
  cta = "",
} = {}) {
  const format = getFormat(formatId);
  if (!format) return { error: "Pick what you want written." };

  const platform = getPlatform(platformId);
  if (!platform) return { error: "Pick the platform this is going out on." };

  const pace = getPace(paceId);
  if (!pace) return { error: "Pick a speaking pace." };

  const topicText = String(topic || "").trim();
  if (!topicText) return { error: "Describe the video topic in one line." };

  const budget = wordsForDuration(seconds, pace.wpm);
  if (budget.error) return { error: budget.error };

  const runtime = Number(seconds);
  const overPlatformMax = runtime > platform.maxSeconds;
  const audienceText = String(audience || "").trim();
  const angleText = String(angle || "").trim();
  const ctaText = String(cta || "").trim();

  const sections = [
    {
      title: "Role",
      body: `You write short-form video for ${platform.label}. You have made thousands of these, you know the first two seconds decide the view, and you never pad a script to hit a length.`,
    },
    {
      title: "Brief",
      body: [
        `Topic: ${topicText}`,
        audienceText ? `Audience: ${audienceText}` : "Audience: a viewer who has never heard of me.",
        angleText ? `Angle I want: ${angleText}` : null,
        `Target runtime: ${formatDuration(runtime)} (${Math.round(runtime)} seconds).`,
        ctaText ? `Call to action: ${ctaText}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    { title: "Task", body: format.instruction },
    {
      title: "Constraints",
      body: [
        `Write about ${budget.words} words of spoken script — that is ${formatDuration(runtime)} at ${pace.wpm} words per minute (${pace.label.toLowerCase()}). Going more than 10% over will overrun the cut.`,
        `Title or on-screen headline: maximum ${platform.titleLimit} characters. Caption or description: maximum ${platform.captionLimit} characters. Use at most ${platform.hashtagLimit} hashtags.`,
        platform.note,
        overPlatformMax
          ? `Warning to respect: ${formatDuration(runtime)} is longer than the ${formatDuration(platform.maxSeconds)} maximum for this format, so plan it as a multi-part series instead.`
          : null,
        "No statistics, studies or quotes unless I supplied them. If a claim needs a source, mark it [CHECK].",
        "Write the way people speak. Contractions yes, corporate verbs no.",
      ]
        .filter(Boolean)
        .join("\n"),
    },
    { title: "Output format", body: format.output },
  ];

  const prompt = sections.map((section) => `${section.title}:\n${section.body}`).join("\n\n");

  return {
    prompt,
    sections,
    wordBudget: budget.words,
    runtimeSeconds: Math.round(runtime),
    runtimeLabel: formatDuration(runtime),
    wpm: pace.wpm,
    platformLabel: platform.label,
    formatLabel: format.label,
    titleLimit: platform.titleLimit,
    captionLimit: platform.captionLimit,
    hashtagLimit: platform.hashtagLimit,
    platformMaxLabel: formatDuration(platform.maxSeconds),
    overPlatformMax,
    promptChars: prompt.length,
  };
}
