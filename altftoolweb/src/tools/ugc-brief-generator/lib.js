/**
 * UGC brief generation.
 *
 * The shot list is a proportional split of the ad runtime across the scenes of
 * a chosen structure. Seconds are allocated with the largest-remainder method
 * so the scene durations always add up to exactly the runtime you asked for.
 * Each scene then gets a spoken word budget from a speaking-rate formula.
 */

/**
 * Conversational to-camera pace for UGC-style ads, in words per minute.
 * Slower than a scripted read because the delivery is meant to sound unrehearsed.
 */
export const UGC_SPEAKING_WPM = 150;

export const MIN_DURATION_SECONDS = 5;
export const MAX_DURATION_SECONDS = 180;

export const MIN_VARIANTS = 1;
export const MAX_VARIANTS = 6;

/** Planning estimate: hands-on minutes to set up and shoot one scene. */
export const SHOOT_MINUTES_PER_SCENE = 8;

/** Planning estimate: extra editing minutes for each additional modular cut. */
export const EDIT_MINUTES_PER_VARIANT = 15;

/** Base editing minutes for the first finished cut. */
export const EDIT_MINUTES_BASE = 45;

export const PLATFORMS = [
  {
    id: "meta-reels",
    label: "Meta Reels / Stories ads",
    ratio: "9:16",
    resolution: "1080 x 1920",
    fps: "30 fps",
    codec: "H.264 video, AAC audio, .mp4 or .mov",
    maxFile: "4 GB",
    maxSeconds: 90,
    safeZone: "Keep text clear of the top 14% and bottom 20% of the frame.",
  },
  {
    id: "meta-feed",
    label: "Meta feed ads",
    ratio: "4:5",
    resolution: "1080 x 1350",
    fps: "30 fps",
    codec: "H.264 video, AAC audio, .mp4 or .mov",
    maxFile: "4 GB",
    maxSeconds: 600,
    safeZone: "Feed crops to 4:5; keep the subject inside a centred 1:1 area for safety.",
  },
  {
    id: "tiktok",
    label: "TikTok in-feed ads",
    ratio: "9:16",
    resolution: "1080 x 1920",
    fps: "30 fps",
    codec: "H.264 video, .mp4, .mov, .mpeg or .avi",
    maxFile: "500 MB",
    maxSeconds: 60,
    safeZone: "Caption and button overlays sit low-right; keep text in the upper-middle third.",
  },
  {
    id: "youtube-shorts",
    label: "YouTube Shorts",
    ratio: "9:16",
    resolution: "1080 x 1920",
    fps: "30 fps",
    codec: "H.264 video, AAC audio, .mp4",
    maxFile: "Governed by the upload limit on your channel",
    maxSeconds: 180,
    safeZone: "Title and subscribe row cover the bottom band; keep the payoff above it.",
  },
];

export function getPlatform(platformId) {
  return PLATFORMS.find((platform) => platform.id === platformId) || PLATFORMS[0];
}

/**
 * Ad structures. Scene shares are fractions of the total runtime and sum to 1.
 * These are conventional direct-response structures, not measured data.
 */
export const STRUCTURES = [
  {
    id: "problem-solution",
    label: "Problem → solution",
    note: "The default for a product that fixes a specific, nameable annoyance.",
    scenes: [
      {
        id: "hook",
        label: "Hook",
        share: 0.15,
        direction: "Say the problem out loud in the first line, face to camera, no intro.",
        onScreen: "Burn the problem in as text — most first views start muted.",
      },
      {
        id: "agitate",
        label: "Why it matters",
        share: 0.15,
        direction: "One line on what the problem costs you. Keep it specific, not dramatic.",
        onScreen: "No text, or a single short line so the face carries it.",
      },
      {
        id: "reveal",
        label: "Product reveal",
        share: 0.2,
        direction: "Show the product in hand. Say its name once, clearly.",
        onScreen: "Product name only.",
      },
      {
        id: "demo",
        label: "Demonstration",
        share: 0.3,
        direction: "Actually use it. Unbroken shot where possible — cuts here read as hiding something.",
        onScreen: "Step labels if the process has stages.",
      },
      {
        id: "result",
        label: "Result",
        share: 0.1,
        direction: "Show the outcome, not a claim about the outcome.",
        onScreen: "The single strongest number or fact, if you have one.",
      },
      {
        id: "cta",
        label: "Call to action",
        share: 0.1,
        direction: "One instruction, said plainly. Do not stack asks.",
        onScreen: "The action, matching the ad's button text.",
      },
    ],
  },
  {
    id: "unboxing",
    label: "Unboxing / first impression",
    note: "Works when the packaging, build quality or contents are the selling point.",
    scenes: [
      {
        id: "hook",
        label: "Hook",
        share: 0.15,
        direction: "Hold the sealed box up and say why you ordered it.",
        onScreen: "What is in the box, in under six words.",
      },
      {
        id: "unbox",
        label: "Unboxing",
        share: 0.3,
        direction: "Open it on camera in one take. Keep hands and product in frame throughout.",
        onScreen: "None — let the reveal carry it.",
      },
      {
        id: "impression",
        label: "First impression",
        share: 0.2,
        direction: "React honestly, including one small criticism. It makes the rest credible.",
        onScreen: "The reaction line as a caption.",
      },
      {
        id: "detail",
        label: "Detail shots",
        share: 0.2,
        direction: "Close-ups of the two features the brand actually wants shown.",
        onScreen: "Feature labels.",
      },
      {
        id: "verdict",
        label: "Verdict",
        share: 0.1,
        direction: "Who this is and is not for. One sentence each.",
        onScreen: "\"Worth it if...\"",
      },
      {
        id: "cta",
        label: "Call to action",
        share: 0.05,
        direction: "Point to where they get it. Nothing else.",
        onScreen: "The action.",
      },
    ],
  },
  {
    id: "testimonial",
    label: "Testimonial",
    note: "For products where the proof is a change in the person, not the object.",
    scenes: [
      {
        id: "hook",
        label: "Hook",
        share: 0.15,
        direction: "Open with the outcome you got, stated as fact.",
        onScreen: "The outcome, as text.",
      },
      {
        id: "who",
        label: "Who you are",
        share: 0.15,
        direction: "Ten seconds of context so the viewer knows whether you are like them.",
        onScreen: "Name and one identifying detail.",
      },
      {
        id: "before",
        label: "Before",
        share: 0.2,
        direction: "What you tried first and why it did not work.",
        onScreen: "None.",
      },
      {
        id: "change",
        label: "What changed",
        share: 0.3,
        direction: "Show the product in use, in your real environment.",
        onScreen: "Product name once.",
      },
      {
        id: "proof",
        label: "Proof",
        share: 0.1,
        direction: "Show the evidence on camera. Never claim a result you cannot show.",
        onScreen: "The number, if there is one.",
      },
      {
        id: "cta",
        label: "Call to action",
        share: 0.1,
        direction: "One instruction, in your own words.",
        onScreen: "The action.",
      },
    ],
  },
  {
    id: "before-after",
    label: "Before / after",
    note: "Only usable where the change is genuinely visible on camera.",
    scenes: [
      {
        id: "hook",
        label: "Hook",
        share: 0.15,
        direction: "Show the after first, for two seconds, then cut back.",
        onScreen: "\"Before → after\" or the timeframe.",
      },
      {
        id: "before",
        label: "Before",
        share: 0.2,
        direction: "Same framing, same light as the after shot. Do not stage the before worse.",
        onScreen: "Date or day count.",
      },
      {
        id: "process",
        label: "Process",
        share: 0.3,
        direction: "What you actually did, in order, with the product visible.",
        onScreen: "Step numbers.",
      },
      {
        id: "after",
        label: "After",
        share: 0.2,
        direction: "Hold the shot longer than feels comfortable. Let people look.",
        onScreen: "Day count.",
      },
      {
        id: "cta",
        label: "Call to action",
        share: 0.15,
        direction: "One instruction plus the honest timeframe it took.",
        onScreen: "The action.",
      },
    ],
  },
  {
    id: "listicle",
    label: "Three reasons / listicle",
    note: "Good for a product with several distinct benefits and no single hero feature.",
    scenes: [
      {
        id: "hook",
        label: "Hook",
        share: 0.15,
        direction: "State the count and the payoff: \"three reasons I stopped buying X\".",
        onScreen: "The count, big.",
      },
      {
        id: "one",
        label: "Reason 1",
        share: 0.2,
        direction: "Show it, then say it. Cut hard into the next reason.",
        onScreen: "\"1\"",
      },
      {
        id: "two",
        label: "Reason 2",
        share: 0.2,
        direction: "Different angle and different background from reason 1.",
        onScreen: "\"2\"",
      },
      {
        id: "three",
        label: "Reason 3",
        share: 0.2,
        direction: "Save the strongest for last.",
        onScreen: "\"3\"",
      },
      {
        id: "recap",
        label: "Recap",
        share: 0.15,
        direction: "All three in one breath, over a shot of the product.",
        onScreen: "The three labels together.",
      },
      {
        id: "cta",
        label: "Call to action",
        share: 0.1,
        direction: "One instruction.",
        onScreen: "The action.",
      },
    ],
  },
];

export function getStructure(structureId) {
  return STRUCTURES.find((structure) => structure.id === structureId) || STRUCTURES[0];
}

export const BASE_DOS = [
  "Shoot vertically, in landscape-free 9:16, with the phone locked off or on a small tripod.",
  "Film in daylight facing a window, or with one soft light in front of you — never overhead only.",
  "Record audio close: phone mic within arm's length, or a clip-on mic. Bad audio kills more UGC than bad video.",
  "Keep the product label legible and the right way up in every shot it appears.",
  "Deliver raw, unedited clips as well as the finished cut, so the brand can re-edit.",
  "Disclose the partnership clearly, in line with the ASCI influencer guidelines and the platform's paid-partnership label.",
];

export const BASE_DONTS = [
  "Do not use licensed or trending music — ad usage needs cleared audio, and a takedown kills the campaign.",
  "Do not show competitor products, brand logos on your clothing, or identifiable strangers.",
  "Do not make health, income or performance claims that the brand has not given you in writing.",
  "Do not add platform-native captions or effects to the delivered file; they cannot be removed later.",
  "Do not shoot against a wall with the light behind you — it silhouettes the product.",
  "Do not re-record only part of a take; if a line is wrong, run the whole scene again.",
];

const STRUCTURE_DOS = {
  "problem-solution": ["Name one problem, not three — a single clear pain converts better."],
  unboxing: ["Keep the seal intact until the camera is rolling; the first cut has to be genuine."],
  testimonial: ["Speak from your own experience only, in your own words, uncut."],
  "before-after": [
    "Shoot the before and after from the same spot, same distance, same time of day, same clothes.",
  ],
  listicle: ["Change background or framing between reasons so each one reads as a new beat."],
};

const STRUCTURE_DONTS = {
  "problem-solution": ["Do not exaggerate the problem beyond what you would actually say to a friend."],
  unboxing: ["Do not skip the criticism — a flawless unboxing reads as an ad and gets scrolled."],
  testimonial: ["Do not read a brand-written script word for word; it is audible."],
  "before-after": ["Do not alter lighting, filters or angle between the two shots."],
  listicle: ["Do not let a reason run long; a listicle dies when point two overstays."],
};

/** Words that fit in a scene at the UGC speaking pace. */
export function wordBudget(seconds, wpm = UGC_SPEAKING_WPM) {
  const s = Number(seconds);
  const rate = Number(wpm);
  if (!(s > 0) || !(rate > 0)) return 0;
  return Math.floor((rate / 60) * s);
}

/**
 * Largest-remainder allocation of whole seconds across the scene shares, so the
 * durations sum to exactly `total`.
 */
export function allocateSeconds(shares, total) {
  const n = Math.max(0, Math.trunc(Number(total) || 0));
  const list = Array.isArray(shares) ? shares.map((value) => Number(value) || 0) : [];
  if (list.length === 0 || n === 0) return list.map(() => 0);

  const sum = list.reduce((acc, value) => acc + value, 0);
  if (!(sum > 0)) return list.map(() => 0);

  const exact = list.map((value) => (value / sum) * n);
  const counts = exact.map((value) => Math.floor(value));
  let assigned = counts.reduce((acc, value) => acc + value, 0);

  const order = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  let cursor = 0;
  while (assigned < n) {
    counts[order[cursor % order.length].index] += 1;
    assigned += 1;
    cursor += 1;
  }

  return counts;
}

/**
 * Build the UGC brief.
 * @param {object} input
 * @param {string} input.productName
 * @param {string} input.audience
 * @param {string} input.keyMessage
 * @param {string} input.ctaText
 * @param {string} input.structureId
 * @param {string} input.platformId
 * @param {number} input.durationSeconds
 * @param {number} input.hookVariants
 * @param {number} input.ctaVariants
 */
export function buildUgcBrief(input = {}) {
  const {
    productName = "",
    audience = "",
    keyMessage = "",
    ctaText = "",
    structureId = STRUCTURES[0].id,
    platformId = PLATFORMS[0].id,
    durationSeconds,
    hookVariants = 1,
    ctaVariants = 1,
  } = input;

  const duration = Number(durationSeconds);
  const hooks = Number(hookVariants);
  const ctas = Number(ctaVariants);

  if ([duration, hooks, ctas].some((value) => !Number.isFinite(value))) {
    return { error: "Enter valid numbers for the runtime and the variant counts." };
  }
  if (!Number.isInteger(duration) || duration < MIN_DURATION_SECONDS || duration > MAX_DURATION_SECONDS) {
    return {
      error: `Runtime must be a whole number of seconds between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS}.`,
    };
  }
  if (!Number.isInteger(hooks) || hooks < MIN_VARIANTS || hooks > MAX_VARIANTS) {
    return { error: `Hook variants must be a whole number between ${MIN_VARIANTS} and ${MAX_VARIANTS}.` };
  }
  if (!Number.isInteger(ctas) || ctas < MIN_VARIANTS || ctas > MAX_VARIANTS) {
    return { error: `CTA variants must be a whole number between ${MIN_VARIANTS} and ${MAX_VARIANTS}.` };
  }

  const product = String(productName).trim();
  if (!product) {
    return { error: "Add the product name — the brief is not usable without it." };
  }

  const structure = getStructure(structureId);
  const platform = getPlatform(platformId);

  const seconds = allocateSeconds(
    structure.scenes.map((scene) => scene.share),
    duration,
  );

  let cursor = 0;
  const shotList = structure.scenes.map((scene, index) => {
    const length = seconds[index];
    const start = cursor;
    cursor += length;
    return {
      id: scene.id,
      label: scene.label,
      direction: scene.direction,
      onScreen: scene.onScreen,
      start,
      end: cursor,
      seconds: length,
      words: wordBudget(length),
    };
  });

  const totalWords = shotList.reduce((sum, scene) => sum + scene.words, 0);
  const totalCuts = hooks * ctas;
  const shootMinutes = shotList.length * SHOOT_MINUTES_PER_SCENE + (hooks - 1) * SHOOT_MINUTES_PER_SCENE;
  const editMinutes = EDIT_MINUTES_BASE + (totalCuts - 1) * EDIT_MINUTES_PER_VARIANT;

  const dos = [...BASE_DOS, ...(STRUCTURE_DOS[structure.id] || [])];
  const donts = [...BASE_DONTS, ...(STRUCTURE_DONTS[structure.id] || [])];

  const warnings = [];
  if (duration > platform.maxSeconds) {
    warnings.push(
      `${duration}s exceeds the ${platform.maxSeconds}s ceiling for ${platform.label}. Cut the runtime or change the placement.`,
    );
  }
  const shortScenes = shotList.filter((scene) => scene.seconds < 2);
  if (shortScenes.length > 0) {
    warnings.push(
      `${shortScenes.length} scene(s) come out under two seconds. Either lengthen the ad or pick a structure with fewer beats.`,
    );
  }
  if (totalCuts > 6) {
    warnings.push(
      `${totalCuts} modular cuts from one shoot is ambitious — agree the delivery deadline before you commit.`,
    );
  }
  if (!String(ctaText).trim()) {
    warnings.push("No call to action written. Every cut needs one specific ask, in the creator's own words.");
  }

  return {
    product,
    audience: String(audience).trim(),
    keyMessage: String(keyMessage).trim(),
    ctaText: String(ctaText).trim(),
    structure: { id: structure.id, label: structure.label, note: structure.note },
    platform,
    durationSeconds: duration,
    shotList,
    totalWords,
    speakingWpm: UGC_SPEAKING_WPM,
    hookVariants: hooks,
    ctaVariants: ctas,
    totalCuts,
    shootMinutes,
    editMinutes,
    totalMinutes: shootMinutes + editMinutes,
    dos,
    donts,
    warnings,
  };
}
