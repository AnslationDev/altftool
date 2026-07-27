/**
 * Video CTA Placement Planner — pure timeline maths.
 * No React, no JSX, no DOM.
 */

/** YouTube end screens can only be shown in the last 5-20 seconds of a video. */
export const END_SCREEN_MIN_SECONDS = 5;
export const END_SCREEN_MAX_SECONDS = 20;

/** A video must be at least 25 seconds long before an end screen can be added. */
export const END_SCREEN_MIN_VIDEO_SECONDS = 25;

/** YouTube allows a maximum of 5 cards on one video. */
export const MAX_CARDS = 5;

/** YouTube's maximum upload length for a verified account is 12 hours. */
export const MAX_VIDEO_SECONDS = 12 * 60 * 60;

/** Default hook: the opening stretch that should stay free of any ask. */
export const DEFAULT_HOOK_SECONDS = 30;
export const HOOK_SHARE_OF_VIDEO = 0.1;

/** Two asks closer together than this start to feel relentless. */
export const CROWDING_WARNING_SECONDS = 45;

export const LIMITS = {
  durationSeconds: { min: 5, max: MAX_VIDEO_SECONDS },
  ctaCount: { min: 1, max: 8 },
  hookSeconds: { min: 0, max: 300 },
  endScreenSeconds: { min: END_SCREEN_MIN_SECONDS, max: END_SCREEN_MAX_SECONDS },
};

export const STYLES = [
  {
    id: "balanced",
    label: "Balanced",
    exponent: 1,
    blurb: "Spreads the asks evenly between the end of the hook and the end screen.",
  },
  {
    id: "early",
    label: "Front-loaded",
    exponent: 1.6,
    blurb: "Pulls asks earlier, for videos where most viewers drop off in the first third.",
  },
  {
    id: "late",
    label: "Back-loaded",
    exponent: 0.625,
    blurb: "Pushes asks later, for tutorials where the payoff lands near the end.",
  },
];

export const STYLE_IDS = STYLES.map((style) => style.id);

/** Seconds -> "M:SS" or "H:MM:SS", the format YouTube timestamps use. */
export function timecode(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const whole = Math.round(value);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/** Combine a minutes + seconds pair into a single length in seconds. */
export function durationFromParts(minutes, seconds) {
  const m = Number(minutes);
  const s = Number(seconds);
  if (!Number.isFinite(m) || !Number.isFinite(s) || m < 0 || s < 0) return NaN;
  return Math.round(m * 60 + s);
}

/** The default hook length for a video: 30 seconds, or 10% of a short video. */
export function defaultHookSeconds(durationSeconds) {
  const duration = Number(durationSeconds);
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(DEFAULT_HOOK_SECONDS, Math.round(duration * HOOK_SHARE_OF_VIDEO));
}

/**
 * Plan where the calls to action go.
 *
 * @param {object} options
 * @param {number} options.durationSeconds  Total video length in seconds.
 * @param {number} options.ctaCount         How many asks in total, including the end screen.
 * @param {number} options.hookSeconds      Opening stretch kept free of any ask.
 * @param {string} options.style            "balanced" | "early" | "late"
 * @param {number} options.endScreenSeconds Length of the end screen (5-20 s).
 * @param {boolean} options.useEndScreen    Reserve the last slot for an end screen.
 * @returns {{error:string}|{placements:Array,warnings:string[],ctaPerMinute:number,cardCount:number,bodySeconds:number,endScreenStart:number}}
 */
export function planCtas({
  durationSeconds = 600,
  ctaCount = 3,
  hookSeconds = DEFAULT_HOOK_SECONDS,
  style = "balanced",
  endScreenSeconds = END_SCREEN_MAX_SECONDS,
  useEndScreen = true,
} = {}) {
  const duration = Number(durationSeconds);
  const count = Math.round(Number(ctaCount));
  const hook = Number(hookSeconds);
  const endScreen = Number(endScreenSeconds);

  if (!Number.isFinite(duration)) return { error: "Enter the video length as a number." };
  if (duration < LIMITS.durationSeconds.min) {
    return { error: `The video must be at least ${LIMITS.durationSeconds.min} seconds long.` };
  }
  if (duration > LIMITS.durationSeconds.max) {
    return { error: "That is longer than YouTube's 12-hour maximum upload length." };
  }
  if (!Number.isFinite(count) || count < LIMITS.ctaCount.min || count > LIMITS.ctaCount.max) {
    return { error: `Plan between ${LIMITS.ctaCount.min} and ${LIMITS.ctaCount.max} calls to action.` };
  }
  if (!Number.isFinite(hook) || hook < LIMITS.hookSeconds.min || hook > LIMITS.hookSeconds.max) {
    return { error: `The hook must be between ${LIMITS.hookSeconds.min} and ${LIMITS.hookSeconds.max} seconds.` };
  }
  if (!Number.isFinite(endScreen) || endScreen < END_SCREEN_MIN_SECONDS || endScreen > END_SCREEN_MAX_SECONDS) {
    return { error: `An end screen must run for ${END_SCREEN_MIN_SECONDS}-${END_SCREEN_MAX_SECONDS} seconds.` };
  }
  if (!STYLE_IDS.includes(style)) {
    return { error: `Placement style must be one of: ${STYLE_IDS.join(", ")}.` };
  }
  if (hook >= duration) {
    return { error: "The hook is as long as the whole video — shorten it to leave room for a CTA." };
  }

  const warnings = [];
  const endScreenPossible = useEndScreen && duration >= END_SCREEN_MIN_VIDEO_SECONDS;
  if (useEndScreen && !endScreenPossible) {
    warnings.push(
      `End screens need a video of at least ${END_SCREEN_MIN_VIDEO_SECONDS} seconds — this one is too short, so use a spoken CTA instead.`,
    );
  }

  const endScreenStart = endScreenPossible ? duration - endScreen : duration;
  const bodyStart = Math.min(hook, endScreenStart);
  const bodySeconds = Math.max(0, endScreenStart - bodyStart);
  const midCount = endScreenPossible ? count - 1 : count;
  const exponent = STYLES.find((item) => item.id === style).exponent;

  const placements = [];
  for (let i = 1; i <= midCount; i += 1) {
    const fraction = Math.pow(i / (midCount + 1), exponent);
    const at = bodyStart + bodySeconds * fraction;
    placements.push({
      seconds: Math.round(at),
      timecode: timecode(at),
      kind: i === 1 && midCount > 1 ? "soft" : "direct",
      label:
        i === 1 && midCount > 1
          ? "Spoken mention, no interruption"
          : "Spoken ask plus an on-screen card",
      note:
        i === 1 && midCount > 1
          ? "Name the action once in passing, right after the first payoff lands."
          : "Point at the card, say the action out loud, and keep it under 10 seconds.",
    });
  }

  if (endScreenPossible) {
    placements.push({
      seconds: Math.round(endScreenStart),
      timecode: timecode(endScreenStart),
      kind: "endscreen",
      label: `End screen (${Math.round(endScreen)} s)`,
      note: "Keep talking over it — end screens only appear in the last 5-20 seconds of the video.",
    });
  }

  placements.sort((a, b) => a.seconds - b.seconds);

  let tightest = Infinity;
  for (let i = 1; i < placements.length; i += 1) {
    const gap = placements[i].seconds - placements[i - 1].seconds;
    if (gap < tightest) tightest = gap;
  }
  if (placements.length > 1 && tightest < CROWDING_WARNING_SECONDS) {
    warnings.push(
      `Two asks are only ${Math.round(tightest)} seconds apart. Under ${CROWDING_WARNING_SECONDS} seconds they start to feel relentless — drop one or lengthen the video.`,
    );
  }

  const cardCount = placements.filter((item) => item.kind === "direct").length;
  if (cardCount > MAX_CARDS) {
    warnings.push(`YouTube allows at most ${MAX_CARDS} cards per video and this plan needs ${cardCount}.`);
  }
  if (hook < 15 && duration > 120) {
    warnings.push("A hook under 15 seconds rarely gives viewers a reason to stay before the first ask.");
  }

  return {
    placements,
    warnings,
    bodySeconds,
    endScreenStart,
    endScreenUsed: endScreenPossible,
    hookSeconds: bodyStart,
    cardCount,
    ctaPerMinute: duration > 0 ? (placements.length / duration) * 60 : 0,
    tightestGapSeconds: Number.isFinite(tightest) ? tightest : null,
    durationSeconds: duration,
  };
}
