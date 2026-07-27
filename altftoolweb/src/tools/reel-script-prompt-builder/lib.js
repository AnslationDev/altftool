/**
 * Reel Script Prompt Builder — computes a time-coded beat sheet for a short-form
 * video and assembles an AI script-writing prompt around it.
 *
 * Timing model:
 *  - The hook must land inside the first 3 seconds. Both Meta's Reels creator
 *    guidance and TikTok's creative centre report that viewers decide whether to
 *    keep watching within the first ~3 seconds.
 *  - The payoff (the promised value) occupies the final ~20% of the runtime so the
 *    video rewards a full watch — completion rate is a ranking signal on every
 *    short-form platform.
 *  - The CTA is compressed into the last 2-5 seconds so it never displaces the payoff.
 */

/** Viewers decide to stay or swipe inside the first 3 seconds (platform creator guidance). */
export const HOOK_MAX_SECONDS = 3;

/** Payoff occupies the final 20% of runtime so completion is rewarded. */
export const PAYOFF_FRACTION = 0.2;

/** Setup takes 25% of the time between hook and payoff; the rest is the value body. */
export const SETUP_FRACTION_OF_MIDDLE = 0.25;

/** CTA length: 10% of runtime, clamped to 2-5 seconds. */
export const CTA_FRACTION = 0.1;
export const CTA_MIN_SECONDS = 2;
export const CTA_MAX_SECONDS = 5;

/** Anything shorter cannot fit hook + payoff + CTA. */
export const MIN_DURATION_SECONDS = 10;

/**
 * Maximum recorded/published length per platform (platform help-centre figures,
 * mid-2025): Instagram Reels and YouTube Shorts allow up to 3 minutes
 * (Shorts moved from 60s to 3 min in October 2024; Reels in January 2025),
 * TikTok allows uploads up to 10 minutes, Facebook Reels up to 90 seconds.
 */
export const PLATFORMS = [
  { id: "instagram-reels", label: "Instagram Reels", maxSeconds: 180 },
  { id: "youtube-shorts", label: "YouTube Shorts", maxSeconds: 180 },
  { id: "tiktok", label: "TikTok", maxSeconds: 600 },
  { id: "facebook-reels", label: "Facebook Reels", maxSeconds: 90 },
];

export const HOOK_STYLES = [
  { id: "question", label: "Provocative question", direction: "open with a question the target viewer cannot ignore" },
  { id: "bold-claim", label: "Bold claim", direction: "open with a specific, surprising claim stated as fact" },
  { id: "mistake", label: "Common mistake", direction: "open by naming a mistake the viewer is probably making right now" },
  { id: "result-first", label: "Result first", direction: "open by showing the end result, then rewind to how it was done" },
  { id: "pattern-interrupt", label: "Pattern interrupt", direction: "open mid-action with an unexpected visual or statement" },
];

export const TONES = [
  { id: "energetic", label: "Energetic" },
  { id: "calm-expert", label: "Calm expert" },
  { id: "funny", label: "Funny / irreverent" },
  { id: "storytelling", label: "Storytelling" },
  { id: "no-nonsense", label: "No-nonsense" },
];

/**
 * Computes the beat boundaries for a runtime. Pure arithmetic; returns
 * contiguous beats covering 0..durationSec.
 */
export function computeBeats(durationSec) {
  const d = Number(durationSec);
  if (!Number.isFinite(d) || d < MIN_DURATION_SECONDS) {
    return { error: `Duration must be at least ${MIN_DURATION_SECONDS} seconds to fit a hook, payoff and CTA.` };
  }

  const hookEnd = Math.min(HOOK_MAX_SECONDS, Math.round(d * 0.2));
  const ctaLength = Math.min(
    CTA_MAX_SECONDS,
    Math.max(CTA_MIN_SECONDS, Math.round(d * CTA_FRACTION)),
  );
  const ctaStart = d - ctaLength;
  const payoffStart = Math.round(ctaStart - d * PAYOFF_FRACTION);
  const middle = payoffStart - hookEnd;
  const setupEnd = hookEnd + Math.round(middle * SETUP_FRACTION_OF_MIDDLE);

  return {
    beats: [
      { name: "Hook", start: 0, end: hookEnd, note: "stop the scroll; state or show the promise" },
      { name: "Setup", start: hookEnd, end: setupEnd, note: "context in one or two lines — why this matters" },
      { name: "Value body", start: setupEnd, end: payoffStart, note: "the steps, story or demonstration" },
      { name: "Payoff", start: payoffStart, end: ctaStart, note: "deliver exactly what the hook promised" },
      { name: "CTA", start: ctaStart, end: d, note: "one action only" },
    ],
    durationSec: d,
  };
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

const formatTime = (s) => `${s}s`;

/**
 * Assembles the full script-writing prompt.
 * Returns { prompt, beats, durationSec, platformLabel } or { error }.
 */
export function buildReelScriptPrompt({
  platformId,
  topic,
  audience = "",
  toneId,
  hookStyleId,
  cta = "",
  durationSec,
}) {
  const platform = PLATFORMS.find((p) => p.id === platformId);
  if (!platform) return { error: "Pick a platform so the script respects its length limit." };

  const topicClean = clean(topic);
  if (!topicClean) return { error: "Enter a topic — the script needs a subject." };

  const d = Number(durationSec);
  if (!Number.isFinite(d) || d < MIN_DURATION_SECONDS || d > platform.maxSeconds) {
    return {
      error: `${platform.label} scripts must be between ${MIN_DURATION_SECONDS} and ${platform.maxSeconds} seconds.`,
    };
  }

  const beatsResult = computeBeats(d);
  if (beatsResult.error) return beatsResult;

  const tone = TONES.find((t) => t.id === toneId) ?? TONES[0];
  const hookStyle = HOOK_STYLES.find((h) => h.id === hookStyleId) ?? HOOK_STYLES[0];
  const audienceClean = clean(audience);
  const ctaClean = clean(cta);

  const lines = [];
  lines.push(
    `Write a ${d}-second ${platform.label} script about: ${topicClean}.`,
  );
  if (audienceClean) lines.push(`Target viewer: ${audienceClean}.`);
  lines.push(`Tone: ${tone.label.toLowerCase()}.`);
  lines.push("");
  lines.push("Follow this exact beat sheet (timings in seconds):");
  beatsResult.beats.forEach((b) => {
    lines.push(`- ${formatTime(b.start)}-${formatTime(b.end)} ${b.name}: ${b.note}.`);
  });
  lines.push("");
  lines.push(`Hook style: ${hookStyle.direction} — the hook line must land within the first ${HOOK_MAX_SECONDS} seconds.`);
  lines.push(
    `The payoff beat must deliver exactly what the hook promised; do not tease a part 2 unless asked.`,
  );
  lines.push(
    ctaClean
      ? `End with this single call to action: "${ctaClean}".`
      : "End with one single call to action (choose the most natural one).",
  );
  lines.push("");
  lines.push(
    "Format the output as a two-column script: left column spoken lines, right column on-screen visuals/text overlays, one row per beat. Spoken lines must fit the time budget at roughly 2.5 words per second.",
  );

  return {
    prompt: lines.join("\n"),
    beats: beatsResult.beats,
    durationSec: d,
    platformLabel: platform.label,
    maxSeconds: platform.maxSeconds,
    /** ~2.5 spoken words/second is standard pacing for short-form voiceover. */
    approxWordBudget: Math.round(d * 2.5),
  };
}

/** Spoken-word pacing constant used for the word budget (≈150 wpm = 2.5 words/sec). */
export const WORDS_PER_SECOND = 2.5;
