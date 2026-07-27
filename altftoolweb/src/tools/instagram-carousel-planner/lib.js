/**
 * Instagram carousel planning maths.
 *
 * Two real models are combined:
 *  1. Read time  — words / reading speed, floored at a minimum glance time.
 *  2. Retention  — geometric swipe decay: if a constant fraction s of the people
 *     who saw slide k swipe to slide k+1, then the audience remaining at slide k
 *     is s^(k-1) and the completion rate of an n-slide carousel is s^(n-1).
 *     Expected slides viewed is the finite geometric series (1 - s^n) / (1 - s).
 */

/** Instagram allows up to 20 photos/videos in a single carousel post. */
export const IG_MAX_SLIDES = 20;

/** A carousel needs at least two slides; one image is a single-image post. */
export const IG_MIN_SLIDES = 2;

/** Instagram caption hard limit, in characters. */
export const IG_CAPTION_MAX = 2200;

/** Characters of a feed caption shown before the "... more" truncation. */
export const IG_CAPTION_PREVIEW = 125;

/** Instagram rejects a post carrying more than 30 hashtags. */
export const IG_MAX_HASHTAGS = 30;

/**
 * Mean silent reading rate for English non-fiction prose, in words per minute.
 * Source: Brysbaert (2019), "How many words do we read per minute?" — 238 wpm.
 */
export const SILENT_READING_WPM = 238;

/** Floor for any slide: the time to register an image-led slide with little text. */
export const MIN_GLANCE_SECONDS = 1.5;

/** Typical per-slide swipe-through rate used as the tool's starting assumption. */
export const DEFAULT_SWIPE_RATE = 0.85;

/** Portrait 4:5 is the tallest ratio Instagram shows uncropped in the feed. */
export const RECOMMENDED_RATIO = "4:5 (1080 x 1350 px)";

/**
 * Word budget of each slide role, relative to one standard "point" slide.
 * Heuristic pacing weights: a hook carries very few, very large words; a
 * call-to-action is one short instruction.
 */
export const ROLE_WORD_WEIGHT = {
  hook: 0.4,
  promise: 0.8,
  point: 1,
  recap: 0.9,
  cta: 0.5,
};

const ROLE_LABEL = {
  hook: "Hook",
  promise: "Promise",
  point: "Point",
  recap: "Recap",
  cta: "Call to action",
};

const ROLE_PURPOSE = {
  hook: "Earn the first swipe. One claim, biggest type on the slide, no logo, no intro.",
  promise: "Say what the reader will be able to do by the last slide, in one sentence.",
  point: "One idea only. Title line, two supporting lines, one visual anchor.",
  recap: "Compress every point into a scannable list so the carousel can be screenshotted.",
  cta: "Ask for exactly one action — save, share, comment a keyword or open the link.",
};

const ROLE_CUE = {
  hook: "Put a visible swipe affordance (arrow or peeking next slide) on the right edge.",
  promise: "Number the payoff: \"3 fixes\", \"in 6 slides\" — a countable promise raises swipes.",
  point: "Repeat the slide number so people know how much is left.",
  recap: "Keep this slide screenshot-safe: no text inside the outer 6% of the frame.",
  cta: "Restate the hook here — this is the slide most likely to be re-read before acting.",
};

/**
 * Assign a role to every slide position.
 * Layout: hook first, optional promise second, points in the middle,
 * optional recap and call-to-action at the end.
 */
export function planSlideRoles(slideCount, options = {}) {
  const { includeRecap = true, includeCta = true } = options;
  const n = Math.trunc(slideCount);
  if (!Number.isFinite(n) || n < IG_MIN_SLIDES || n > IG_MAX_SLIDES) return [];

  const head = ["hook"];
  // A promise slide only earns its place once the carousel is long enough to need one.
  if (n >= 4) head.push("promise");

  const tail = [];
  if (includeCta && n >= 3) tail.push("cta");
  // Only add a recap if at least two middle slides survive it.
  if (includeRecap && n - head.length - tail.length >= 2) tail.unshift("recap");

  const middle = n - head.length - tail.length;
  const roles = [...head];
  for (let i = 0; i < middle; i += 1) roles.push("point");
  roles.push(...tail);
  return roles;
}

/** Seconds needed to read a slide, floored at the minimum glance time. */
export function slideReadSeconds(words) {
  if (!(words > 0)) return MIN_GLANCE_SECONDS;
  return Math.max(MIN_GLANCE_SECONDS, (words / SILENT_READING_WPM) * 60);
}

/**
 * Expected number of slides an average viewer sees, given a constant
 * per-slide swipe-through rate. Geometric series (1 - s^n) / (1 - s).
 */
export function expectedSlidesViewed(slideCount, swipeRate) {
  const n = Math.trunc(slideCount);
  if (!(n > 0)) return 0;
  if (!(swipeRate > 0)) return 1;
  if (swipeRate >= 1) return n;
  return (1 - Math.pow(swipeRate, n)) / (1 - swipeRate);
}

/**
 * Full carousel plan.
 * @param {object} input
 * @param {number} input.slideCount   total slides, 2..20
 * @param {number} input.swipeRate    fraction of viewers who swipe to the next slide (0-1)
 * @param {number} input.wordsPerSlide words on a standard "point" slide
 * @param {boolean} [input.includeRecap]
 * @param {boolean} [input.includeCta]
 * @param {string}  [input.topic]
 */
export function planCarousel(input = {}) {
  const {
    slideCount,
    swipeRate,
    wordsPerSlide,
    includeRecap = true,
    includeCta = true,
    topic = "",
  } = input;

  const n = Number(slideCount);
  const s = Number(swipeRate);
  const w = Number(wordsPerSlide);

  if (!Number.isFinite(n) || !Number.isFinite(s) || !Number.isFinite(w)) {
    return { error: "Enter valid numbers for slides, swipe rate and words per slide." };
  }
  if (!Number.isInteger(n)) {
    return { error: "Slide count must be a whole number." };
  }
  if (n < IG_MIN_SLIDES) {
    return { error: `A carousel needs at least ${IG_MIN_SLIDES} slides.` };
  }
  if (n > IG_MAX_SLIDES) {
    return { error: `Instagram allows a maximum of ${IG_MAX_SLIDES} slides in one carousel.` };
  }
  if (s <= 0 || s > 1) {
    return { error: "Swipe-through rate must be greater than 0% and at most 100%." };
  }
  if (w < 0) {
    return { error: "Words per slide cannot be negative." };
  }
  if (w > 200) {
    return { error: "Keep a slide under 200 words — beyond that it stops being a carousel slide." };
  }

  const roles = planSlideRoles(n, { includeRecap, includeCta });
  if (roles.length !== n) {
    return { error: "Could not lay out that slide count. Try a different number of slides." };
  }

  let pointNumber = 0;
  let totalWords = 0;
  let rawReadSeconds = 0;
  let weightedDwellSeconds = 0;

  const slides = roles.map((role, index) => {
    const position = index + 1;
    const words = Math.round(w * ROLE_WORD_WEIGHT[role]);
    const seconds = slideReadSeconds(words);
    // Share of the original viewers still present at this slide.
    const reach = Math.pow(s, position - 1);

    totalWords += words;
    rawReadSeconds += seconds;
    weightedDwellSeconds += reach * seconds;

    if (role === "point") pointNumber += 1;

    return {
      position,
      role,
      label: role === "point" ? `${ROLE_LABEL.point} ${pointNumber}` : ROLE_LABEL[role],
      purpose: ROLE_PURPOSE[role],
      cue: ROLE_CUE[role],
      words,
      seconds,
      reachShare: reach,
    };
  });

  const completionRate = Math.pow(s, n - 1);
  const slidesViewed = expectedSlidesViewed(n, s);

  return {
    topic: String(topic).trim(),
    slideCount: n,
    swipeRate: s,
    slides,
    pointSlides: pointNumber,
    totalWords,
    rawReadSeconds,
    weightedDwellSeconds,
    completionRate,
    slidesViewed,
    viewedShare: slidesViewed / n,
    recommendedRatio: RECOMMENDED_RATIO,
    captionPreviewChars: IG_CAPTION_PREVIEW,
    captionMaxChars: IG_CAPTION_MAX,
    maxHashtags: IG_MAX_HASHTAGS,
  };
}
