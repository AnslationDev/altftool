/**
 * Hook Retention Timing Planner.
 *
 * Builds a beat sheet for a short video from the platform's own measurement
 * thresholds: the point a view is counted, the point a viewer can skip, and the
 * point a completion or ThruPlay is credited. Every beat is returned in
 * seconds, frames and timecode so it can be dropped straight onto a timeline.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Where each platform draws its measurement lines.
 * `viewAtSec`  — continuous playback before a view is credited.
 * `skipAtSec`  — when the viewer can first skip (null = they can scroll at any time).
 * `creditAtSec`— ThruPlay / billed-view / engaged-view threshold.
 */
export const PLATFORM_MARKS = {
  meta: {
    id: "meta",
    label: "Facebook / Instagram feed",
    viewAtSec: 3,
    skipAtSec: null,
    creditAtSec: 15,
    note: "Meta credits a video view at 3 seconds and a ThruPlay at 15 seconds or completion, whichever comes first.",
  },
  reels: {
    id: "reels",
    label: "Instagram Reels",
    viewAtSec: 3,
    skipAtSec: null,
    creditAtSec: 15,
    note: "Same 3-second view rule as feed, but the viewer can scroll away from frame one.",
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok in-feed",
    viewAtSec: 2,
    skipAtSec: null,
    creditAtSec: 6,
    note: "TikTok reports 2-second and 6-second video views as separate metrics, so both are worth designing to.",
  },
  shorts: {
    id: "shorts",
    label: "YouTube Shorts",
    viewAtSec: 0,
    skipAtSec: null,
    creditAtSec: 10,
    note: "A Shorts play counts immediately; engagement metrics only start to matter around the 10-second mark.",
  },
  ytinstream: {
    id: "ytinstream",
    label: "YouTube skippable in-stream",
    viewAtSec: 30,
    skipAtSec: 5,
    creditAtSec: 30,
    note: "The skip button appears at 5 seconds; a paid view is credited at 30 seconds or completion, whichever is sooner.",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn feed",
    viewAtSec: 2,
    skipAtSec: null,
    creditAtSec: 15,
    note: "LinkedIn credits a view after 2 seconds of continuous playback with at least 50% of the player on screen.",
  },
  x: {
    id: "x",
    label: "X (Twitter) feed",
    viewAtSec: 2,
    skipAtSec: null,
    creditAtSec: 6,
    note: "X counts a view at 2 seconds with 50% of the player in view, and reports 6-second views separately.",
  },
};

/** Frame rates a short-form cut is normally finished at. */
export const FRAME_RATES = [23.976, 24, 25, 29.97, 30, 50, 60];

/**
 * How often to place a pattern interrupt — a cut, camera move, caption change
 * or new subject. Kept as a user-set interval with a sane default rather than
 * a claimed universal number.
 */
export const DEFAULT_INTERRUPT_EVERY_SEC = 5;

/** Shortest sensible on-screen call to action. */
export const MIN_CTA_SEC = 2;

/** CTA gets this share of the runtime by default, floored at MIN_CTA_SEC. */
export const DEFAULT_CTA_SHARE = 0.15;

/**
 * Upper bound on how many pattern-interrupt beats a single plan can generate.
 * A valid duration/interval combination (e.g. a 600s video with a 0.5s interval)
 * can otherwise produce 1000+ rows, which is unreviewable as a beat sheet and
 * re-renders on every keystroke. Chosen well above any practical cut cadence
 * for short-form video rather than derived from a platform rule.
 */
export const MAX_INTERRUPTS = 200;

/** The opening image the viewer judges before any words land. */
export const COLD_OPEN_SEC = 0.5;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Non-drop-frame timecode "MM:SS:FF" for a position in seconds. */
export function toTimecode(seconds, fps) {
  if (!isNum(seconds) || !isNum(fps) || seconds < 0 || !(fps > 0)) return "—";
  const nominal = Math.round(fps);
  const totalFrames = Math.round(seconds * fps);
  const frames = totalFrames % nominal;
  const totalSeconds = Math.floor(totalFrames / nominal);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

/** Frame index at a position in seconds, rounded to the nearest whole frame. */
export function frameAt(seconds, fps) {
  if (!isNum(seconds) || !isNum(fps) || seconds < 0 || !(fps > 0)) return null;
  return Math.round(seconds * fps);
}

/** "2.5s" style label, trimmed of trailing zeros. */
export function formatSec(seconds) {
  if (!isNum(seconds) || seconds < 0) return "—";
  const rounded = Math.round(seconds * 100) / 100;
  return `${rounded}s`;
}

/** Percentage of a total, as a number. Returns null when the total is zero. */
export function ratePercent(part, total) {
  if (!isNum(part) || !isNum(total)) return null;
  if (!(total > 0) || part < 0) return null;
  return (part / total) * 100;
}

/**
 * Build the beat sheet.
 *
 * Beats are clamped to the runtime, so a 6-second bumper still produces a
 * sensible sheet rather than beats running past the end of the file.
 */
export function buildHookPlan({
  durationSec = 30,
  fps = 30,
  platform = "reels",
  interruptEverySec = DEFAULT_INTERRUPT_EVERY_SEC,
  ctaSec = null,
} = {}) {
  const marks = PLATFORM_MARKS[platform];
  if (!marks) return { error: "Pick a platform from the list." };
  if (!isNum(durationSec) || durationSec <= 0) return { error: "Enter the video length in seconds." };
  if (durationSec > 600) return { error: "This planner is built for short video — keep it under 10 minutes." };
  if (!isNum(fps) || !(fps > 0)) return { error: "Pick a frame rate above zero." };
  if (!isNum(interruptEverySec) || interruptEverySec <= 0) {
    return { error: "Pattern interrupt interval must be more than zero seconds." };
  }
  if (interruptEverySec > durationSec) {
    return { error: "Pattern interrupt interval is longer than the whole video." };
  }
  if (ctaSec !== null && (!isNum(ctaSec) || ctaSec < 0)) return { error: "CTA length cannot be negative." };

  const clamp = (value) => Math.max(0, Math.min(durationSec, value));

  const ctaLength = clamp(
    ctaSec === null ? Math.max(MIN_CTA_SEC, durationSec * DEFAULT_CTA_SHARE) : ctaSec,
  );
  if (ctaLength >= durationSec) {
    return { error: "The call to action is as long as the whole video. Shorten it." };
  }

  // The hook window closes when the platform credits a view, but never later
  // than the first fifth of the runtime and never later than 3 seconds.
  const hookEnd = clamp(Math.min(3, Math.max(marks.viewAtSec, 1), Math.max(1, durationSec * 0.2)));

  const interruptSpan = durationSec - ctaLength - hookEnd;
  if (interruptSpan > 0 && interruptSpan / interruptEverySec > MAX_INTERRUPTS) {
    return {
      error: `That pattern interrupt interval would generate more than ${MAX_INTERRUPTS} beats — use a longer interval or a shorter video.`,
    };
  }

  const beats = [];
  const push = (id, label, startSec, endSec, detail, critical = false) => {
    const start = clamp(startSec);
    const end = clamp(endSec);
    if (end <= start) return;
    beats.push({
      id,
      label,
      startSec: start,
      endSec: end,
      lengthSec: end - start,
      startFrame: frameAt(start, fps),
      endFrame: frameAt(end, fps),
      startTc: toTimecode(start, fps),
      endTc: toTimecode(end, fps),
      detail,
      critical,
    });
  };

  push(
    "cold-open",
    "Cold open frame",
    0,
    Math.min(COLD_OPEN_SEC, durationSec),
    "The first half second is judged on the image alone. Open on movement or a face, never on a logo card or a fade from black.",
    true,
  );
  push(
    "hook",
    "Spoken and on-screen hook",
    0,
    hookEnd,
    `State the payoff before ${formatSec(hookEnd)}. Caption it as well as saying it — most feed playback starts muted.`,
    true,
  );

  if (marks.viewAtSec > 0) {
    push(
      "view-mark",
      `Hold past the ${formatSec(marks.viewAtSec)} view mark`,
      Math.max(0, marks.viewAtSec - 1),
      Math.min(durationSec, marks.viewAtSec + 1),
      marks.note,
      true,
    );
  }

  if (marks.skipAtSec !== null && marks.skipAtSec < durationSec) {
    push(
      "skip",
      `Skip button appears at ${formatSec(marks.skipAtSec)}`,
      marks.skipAtSec,
      Math.min(durationSec, marks.skipAtSec + 2),
      "Land your strongest visual turn right here — this is the one moment the viewer is offered an exit.",
      true,
    );
  }

  const interrupts = [];
  for (let t = hookEnd + interruptEverySec; t < durationSec - ctaLength; t += interruptEverySec) {
    interrupts.push(Math.round(t * 100) / 100);
  }
  interrupts.forEach((at, index) => {
    push(
      `interrupt-${index}`,
      `Pattern interrupt ${index + 1}`,
      at,
      Math.min(durationSec - ctaLength, at + 0.5),
      "Change something: cut, new angle, new caption, new subject. This is where attention leaks otherwise.",
    );
  });

  push(
    "proof",
    "Proof or payoff",
    hookEnd,
    Math.max(hookEnd, durationSec - ctaLength),
    "Deliver what the hook promised. If the payoff arrives after the credit threshold, the metric never fires.",
  );

  if (marks.creditAtSec < durationSec) {
    push(
      "credit",
      `${formatSec(marks.creditAtSec)} completion threshold`,
      marks.creditAtSec,
      Math.min(durationSec, marks.creditAtSec + 1),
      "Past this point the platform credits the view, so anything after it is a bonus rather than a requirement.",
    );
  }

  push(
    "cta",
    "Call to action",
    durationSec - ctaLength,
    durationSec,
    "Say it and show it. A CTA that only appears as an end card is invisible to anyone who scrolls at the last second.",
    true,
  );

  beats.sort((a, b) => a.startSec - b.startSec || a.endSec - b.endSec);

  const hookFrames = frameAt(hookEnd, fps);
  const warnings = [];
  if (durationSec < marks.creditAtSec) {
    warnings.push(
      `The video is shorter than the ${formatSec(marks.creditAtSec)} completion threshold, so it can only be credited by playing to the end.`,
    );
  }
  if (hookEnd >= durationSec * 0.5) {
    warnings.push("The hook takes up half the runtime. Either shorten the hook or lengthen the video.");
  }
  if (marks.skipAtSec !== null && durationSec <= marks.skipAtSec) {
    warnings.push("The video ends before the skip button appears, so nobody can skip it.");
  }

  return {
    marks,
    durationSec,
    fps,
    hookEndSec: hookEnd,
    hookFrames,
    ctaSec: ctaLength,
    ctaStartSec: durationSec - ctaLength,
    interruptEverySec,
    interruptCount: interrupts.length,
    totalFrames: frameAt(durationSec, fps),
    beats,
    warnings,
  };
}

/**
 * Funnel maths on real reporting numbers.
 *  hook rate      = views credited at the view mark / impressions
 *  hold rate      = views credited at the completion threshold / views at the view mark
 *  view-through   = completions / impressions
 */
export function computeFunnel({ impressions, hookViews, heldViews } = {}) {
  if (!isNum(impressions) || !isNum(hookViews) || !isNum(heldViews)) {
    return { error: "Enter impressions, hook-mark views and held views as numbers." };
  }
  if (impressions <= 0) return { error: "Impressions must be greater than zero." };
  if (hookViews < 0 || heldViews < 0) return { error: "View counts cannot be negative." };
  if (hookViews > impressions) return { error: "Views at the hook mark cannot exceed impressions." };
  if (heldViews > hookViews) return { error: "Held views cannot exceed views at the hook mark." };

  const hookRate = ratePercent(hookViews, impressions);
  const holdRate = hookViews > 0 ? ratePercent(heldViews, hookViews) : 0;
  const viewThroughRate = ratePercent(heldViews, impressions);

  return {
    hookRate,
    holdRate,
    viewThroughRate,
    lostAtHook: impressions - hookViews,
    lostInBody: hookViews - heldViews,
  };
}
