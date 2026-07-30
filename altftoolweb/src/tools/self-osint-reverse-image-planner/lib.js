/**
 * Reverse-image self-audit planner.
 *
 * Given what your profile photos actually contain, this produces an ordered
 * plan: which reverse-image engines to run, which crops to submit, and how
 * long the pass will take. Pure data and arithmetic — no network, no uploads.
 */

/**
 * Reverse-image engines differ in what they are technically capable of.
 * Ratings are 0-3 on each axis and describe documented behaviour:
 *  - duplicate: finds actual copies of the same photograph, including resized,
 *    cropped and lightly edited derivatives.
 *  - face: finds a different photograph of the same person.
 *  - place: identifies the location, landmark or building in the frame.
 *  - text: reads text baked into the image (signage, badges, plates).
 */
export const ENGINES = [
  {
    id: "google-lens",
    name: "Google Lens / Google Images",
    url: "https://images.google.com/",
    duplicate: 3,
    face: 0,
    place: 3,
    text: 3,
    free: true,
    note: "Broadest crawl and the best landmark and object recognition. Google deliberately does not offer face matching, so it will not find other photos of you.",
  },
  {
    id: "bing-visual",
    name: "Bing Visual Search",
    url: "https://www.bing.com/visualsearch",
    duplicate: 3,
    face: 1,
    place: 2,
    text: 3,
    free: true,
    note: "Has a draggable crop box, so you can search one region of a photo without editing the file first. Strong OCR on signage and documents.",
  },
  {
    id: "yandex",
    name: "Yandex Images",
    url: "https://yandex.com/images/",
    duplicate: 3,
    face: 3,
    place: 2,
    text: 2,
    free: true,
    note: "The strongest free engine at returning different photographs of the same face. Run it last and expect the most uncomfortable results.",
  },
  {
    id: "tineye",
    name: "TinEye",
    url: "https://tineye.com/",
    duplicate: 3,
    face: 0,
    place: 0,
    text: 0,
    free: true,
    note: "Matches copies of the exact image only, including resized and cropped versions, and sorts by oldest first — which is how you find who published it before you did.",
  },
  {
    id: "reverse-mobile",
    name: "Your phone's built-in lens",
    url: "",
    duplicate: 2,
    face: 0,
    place: 2,
    text: 3,
    free: true,
    note: "Google Lens in the camera app and Apple Visual Look Up handle screenshots quickly, useful for a fast first pass without moving files to a desktop.",
  },
];

/** What you are trying to find; drives how engines are ranked. */
export const GOALS = {
  duplicate: { id: "duplicate", label: "Find copies of this exact photo", axis: "duplicate" },
  face: { id: "face", label: "Find other photos of my face", axis: "face" },
  place: { id: "place", label: "See if the location is identifiable", axis: "place" },
  text: { id: "text", label: "See what text is readable in the frame", axis: "text" },
};

/**
 * Risk weights for what a photo contains, chosen so a photo carrying every
 * factor scores exactly 100. Relative comparison aid, not a probability.
 */
export const RISK_FACTORS = [
  {
    id: "showsFace",
    label: "Shows my face clearly",
    weight: 18,
    advice: "Face-similarity engines can chain this photo to every other account using a different picture of you.",
  },
  {
    id: "reusedAcrossSites",
    label: "Same photo is used on more than one account",
    weight: 16,
    advice: "Photo reuse is the single strongest cross-platform link. A duplicate-match engine joins the accounts in one query.",
  },
  {
    id: "showsHome",
    label: "Shows my home, street or building exterior",
    weight: 20,
    advice: "Landmark recognition plus a visible door number or shopfront is usually enough to place an address.",
  },
  {
    id: "showsPlate",
    label: "Shows a vehicle number plate",
    weight: 14,
    advice: "Plates are short, high-contrast text — the easiest thing in a photo for OCR to lift.",
  },
  {
    id: "showsBadge",
    label: "Shows a work badge, uniform or office interior",
    weight: 12,
    advice: "Ties your face to an employer, which is the usual pivot for pretext calls and CEO-fraud attempts.",
  },
  {
    id: "hasGpsExif",
    label: "Original file still has GPS EXIF data",
    weight: 10,
    advice: "GPS coordinates sit in the EXIF GPS IFD (tag 0x8825). Most social platforms strip it on upload, but files sent by email, chat attachment or cloud link usually keep it.",
  },
  {
    id: "showsChildren",
    label: "Shows a child's face, school or uniform",
    weight: 10,
    advice: "Treat this as the highest-priority removal regardless of the total score.",
  },
];

/** Risk bands. Boundaries are inclusive lower bounds on the 0-100 scale. */
export const RISK_BANDS = [
  { min: 75, label: "Severe", advice: "Replace these photos rather than trying to manage them." },
  { min: 50, label: "High", advice: "Crop or re-shoot the worst offenders before the next audit." },
  { min: 25, label: "Moderate", advice: "Worth de-duplicating across accounts." },
  { min: 0, label: "Low", advice: "Re-run the audit whenever you change a profile picture." },
];

/** Realistic hands-on time to submit one crop to one engine and skim results. */
export const MINUTES_PER_ENGINE_CHECK = 3;

/** Ranking blend: the chosen goal dominates, other axes act as a tiebreak. */
export const GOAL_AXIS_WEIGHT = 4;
export const OTHER_AXIS_WEIGHT = 1;

/** Maximum photos one person can sensibly audit in a sitting. */
export const MAX_PHOTOS = 50;

function clampInt(value, min, max) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return NaN;
  return Math.min(max, Math.max(min, n));
}

export function bandForScore(score) {
  return RISK_BANDS.find((band) => score >= band.min) || RISK_BANDS[RISK_BANDS.length - 1];
}

/** Rank engines for a goal. Higher rankScore first; ties break on engine order. */
export function rankEngines(goalId) {
  const goal = GOALS[goalId] || GOALS.duplicate;
  const axes = ["duplicate", "face", "place", "text"];
  return ENGINES.map((engine, index) => {
    const primary = engine[goal.axis] * GOAL_AXIS_WEIGHT;
    const secondary = axes
      .filter((axis) => axis !== goal.axis)
      .reduce((sum, axis) => sum + engine[axis], 0) * OTHER_AXIS_WEIGHT;
    return { ...engine, order: index, rankScore: primary + secondary, primaryRating: engine[goal.axis] };
  })
    .sort((a, b) => b.rankScore - a.rankScore || a.order - b.order)
    .map((engine, index) => ({ ...engine, rank: index + 1 }));
}

/**
 * Which versions of the image to submit. Cropping changes what the engines can
 * latch onto, so each crop answers a different question.
 */
export function buildCropPlan(selected) {
  const crops = [
    {
      id: "full",
      label: "The full, unedited image",
      why: "Baseline. Duplicate engines fingerprint the whole frame, so this finds straight re-uploads and scrapes.",
    },
  ];
  if (selected.showsFace) {
    crops.push({
      id: "face",
      label: "Face only, cropped tight to the head and shoulders",
      why: "Removes background noise so a face-similarity engine ranks people instead of scenery. This is the crop that finds you on sites you never joined.",
    });
  }
  if (selected.showsHome || selected.showsPlate || selected.showsBadge) {
    crops.push({
      id: "background",
      label: "Background only, with every person cropped out",
      why: "Answers the question that matters most: can the location be identified without you in the frame?",
    });
  }
  if (selected.showsPlate || selected.showsBadge) {
    crops.push({
      id: "text",
      label: "Zoomed crop of any readable text — plate, badge, signage, screen",
      why: "Feeds OCR directly. If the engine can read it, so can anyone who saves the photo.",
    });
  }
  if (selected.reusedAcrossSites) {
    crops.push({
      id: "platform-copy",
      label: "The version downloaded back from each platform",
      why: "Platforms re-encode and resize on upload. Searching the derivative shows what is actually indexed, which can differ from your original file.",
    });
  }
  return crops;
}

/** Post-audit remediation steps, ordered by what removes the most exposure first. */
export function buildRemediationSteps(selected) {
  const steps = [];
  if (selected.reusedAcrossSites) {
    steps.push("Give every account its own photo. One unique image per account breaks the duplicate link entirely.");
  }
  if (selected.showsChildren) {
    steps.push("Remove photos showing a child's face, school crest or uniform first, on every account, before anything else on this list.");
  }
  if (selected.showsHome) {
    steps.push("Re-shoot against a plain wall or an interior with no window view. A cropped background still leaks if the crop is loose.");
  }
  if (selected.showsPlate) {
    steps.push("Blur the plate by painting over it, not by pixelating — heavy pixelation of short text can sometimes be reversed.");
  }
  if (selected.showsBadge) {
    steps.push("Remove or cover employer branding, lanyards and badge photos; they are the raw material for pretext phone calls.");
  }
  if (selected.hasGpsExif) {
    steps.push("Strip EXIF before sharing any file directly. On iOS use Share > Options > turn off Location; on Windows use File > Properties > Remove Properties.");
  }
  if (selected.showsFace) {
    steps.push("Where a face is not required, switch to an illustration or a non-photographic avatar; face-similarity engines have nothing to match.");
  }
  steps.push("File a removal request with each site that hosts a copy you did not authorise, and keep the URL list from this audit as your evidence.");
  return steps;
}

/**
 * Build the whole plan.
 *
 * @param {{photoCount:number|string, goal:string, factors:Record<string,boolean>}} input
 */
export function planReverseImageAudit(input = {}) {
  const photoCount = clampInt(input.photoCount, 0, MAX_PHOTOS);

  if (Number.isNaN(photoCount)) {
    return { error: "Enter how many photos you want to audit as a whole number." };
  }
  if (photoCount < 1) {
    return { error: "Audit at least one photo — enter a number between 1 and " + MAX_PHOTOS + "." };
  }
  if (Number(input.photoCount) > MAX_PHOTOS) {
    return {
      error: `Keep a single sitting to ${MAX_PHOTOS} photos or fewer, otherwise the pass takes longer than anyone finishes.`,
    };
  }

  const goalId = GOALS[input.goal] ? input.goal : "duplicate";
  const factors = input.factors || {};
  const selected = {};
  RISK_FACTORS.forEach((factor) => {
    selected[factor.id] = Boolean(factors[factor.id]);
  });

  const activeFactors = RISK_FACTORS.filter((factor) => selected[factor.id]);
  const riskScore = Math.min(100, activeFactors.reduce((sum, factor) => sum + factor.weight, 0));
  const band = bandForScore(riskScore);

  const engines = rankEngines(goalId);
  const crops = buildCropPlan(selected);

  // Only engines that can actually answer the goal are worth the clicks.
  const recommended = engines.filter((engine) => engine.primaryRating > 0);
  const usableEngines = recommended.length > 0 ? recommended : engines.slice(0, 1);

  const checks = photoCount * crops.length * usableEngines.length;
  const estimatedMinutes = checks * MINUTES_PER_ENGINE_CHECK;

  return {
    photoCount,
    goal: GOALS[goalId],
    riskScore,
    band,
    activeFactors,
    engines,
    usableEngines,
    crops,
    checks,
    estimatedMinutes,
    remediation: buildRemediationSteps(selected),
  };
}

/** Human-readable duration from whole minutes. Never returns a bare "0 min". */
export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** Plain-text export of the plan. */
export function formatPlan(result) {
  if (!result || result.error) return "";
  const lines = [
    "Reverse-image self-audit plan",
    `Photos: ${result.photoCount}`,
    `Goal: ${result.goal.label}`,
    `Exposure score: ${result.riskScore}/100 (${result.band.label})`,
    `Checks to run: ${result.checks} — about ${formatDuration(result.estimatedMinutes)}`,
    "",
    "Engines, in order:",
    ...result.usableEngines.map((engine, index) => `${index + 1}. ${engine.name}${engine.url ? ` — ${engine.url}` : ""}`),
    "",
    "Submit each of these versions:",
    ...result.crops.map((crop, index) => `${index + 1}. ${crop.label}`),
    "",
    "Then fix:",
    ...result.remediation.map((step, index) => `${index + 1}. ${step}`),
  ];
  return lines.join("\n");
}
