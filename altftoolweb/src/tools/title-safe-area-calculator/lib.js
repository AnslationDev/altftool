/**
 * Action safe and title (graphics) safe areas.
 *
 * A safe area is a centred rectangle expressed as a percentage of the full
 * raster. If the safe rectangle is P% of the frame, the margin on each of the
 * four edges is (100 - P) / 2 percent:
 *   safeWidth  = frameWidth  x P/100
 *   marginLeft = frameWidth  x (100 - P) / 200
 *
 * Published rules used as presets:
 *  - EBU R 95 / SMPTE ST 2046-1 for 16:9 HD: 93% action safe, 90% graphics safe
 *    (3.5% and 5% margins per edge).
 *  - SMPTE RP 218 legacy SD practice: 90% action safe, 80% title safe
 *    (5% and 10% margins per edge).
 *  - EBU R 95 also defines a 16:9 "protected" centre-cut area for 4:3
 *    downconversion, which is not the same thing as a title safe box.
 */

export const SAFE_STANDARDS = [
  {
    id: "ebu-r95",
    label: "EBU R 95 / SMPTE ST 2046-1 (HD, current)",
    actionPercent: 93,
    titlePercent: 90,
    note: "Modern broadcast HD and UHD graphics practice",
  },
  {
    id: "smpte-rp218",
    label: "SMPTE RP 218 (legacy SD)",
    actionPercent: 90,
    titlePercent: 80,
    note: "Older CRT-era margins, still used for archive conform",
  },
  {
    id: "conservative",
    label: "Conservative 90 / 85",
    actionPercent: 90,
    titlePercent: 85,
    note: "Extra room for platform overlays and captions",
  },
  {
    id: "custom",
    label: "Custom percentages",
    actionPercent: 93,
    titlePercent: 90,
    note: "Enter your own safe area percentages",
  },
];

export const RESOLUTION_PRESETS = [
  { id: "1920x1080", label: "1920 x 1080 (HD)", width: 1920, height: 1080 },
  { id: "3840x2160", label: "3840 x 2160 (UHD)", width: 3840, height: 2160 },
  { id: "1280x720", label: "1280 x 720 (720p)", width: 1280, height: 720 },
  { id: "720x576", label: "720 x 576 (PAL SD)", width: 720, height: 576 },
  { id: "1080x1920", label: "1080 x 1920 (vertical)", width: 1080, height: 1920 },
  { id: "1080x1080", label: "1080 x 1080 (square)", width: 1080, height: 1080 },
];

const MAX_DIMENSION = 16384;
/** Below this a "safe area" would be smaller than a quarter of the frame. */
export const MIN_SAFE_PERCENT = 50;

export function findStandard(id) {
  return SAFE_STANDARDS.find((item) => item.id === id) || null;
}

/** One centred safe rectangle from a percentage of the raster. */
export function safeBox(frameWidth, frameHeight, percent) {
  const fraction = percent / 100;
  const width = frameWidth * fraction;
  const height = frameHeight * fraction;
  const marginX = (frameWidth - width) / 2;
  const marginY = (frameHeight - height) / 2;
  return {
    percent,
    width,
    height,
    marginX,
    marginY,
    left: marginX,
    top: marginY,
    right: frameWidth - marginX,
    bottom: frameHeight - marginY,
    widthRounded: Math.round(width),
    heightRounded: Math.round(height),
    marginXRounded: Math.round(marginX),
    marginYRounded: Math.round(marginY),
  };
}

/**
 * @returns {{error:string}|{
 *  standardLabel:string, frameWidth:number, frameHeight:number,
 *  action:object, title:object, aspect:number
 * }}
 */
export function computeSafeAreas({
  frameWidth = 1920,
  frameHeight = 1080,
  standardId = "ebu-r95",
  actionPercent,
  titlePercent,
} = {}) {
  const standard = findStandard(standardId);
  if (!standard) return { error: "Pick a safe area standard." };

  const action = standardId === "custom" ? actionPercent : standard.actionPercent;
  const title = standardId === "custom" ? titlePercent : standard.titlePercent;

  if (![frameWidth, frameHeight, action, title].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for the frame size and percentages." };
  }
  if (!(frameWidth > 0) || !(frameHeight > 0)) {
    return { error: "Frame width and height must be greater than zero." };
  }
  if (frameWidth > MAX_DIMENSION || frameHeight > MAX_DIMENSION) {
    return { error: `Frame size cannot exceed ${MAX_DIMENSION} pixels per side.` };
  }
  if (action > 100 || title > 100) {
    return { error: "A safe area cannot be larger than 100% of the frame." };
  }
  if (action < MIN_SAFE_PERCENT || title < MIN_SAFE_PERCENT) {
    return { error: `Safe areas below ${MIN_SAFE_PERCENT}% of the frame are not usable.` };
  }
  if (title > action) {
    return { error: "The title safe area must sit inside the action safe area." };
  }

  return {
    standardLabel: standard.label,
    standardNote: standard.note,
    frameWidth,
    frameHeight,
    aspect: frameWidth / frameHeight,
    action: safeBox(frameWidth, frameHeight, action),
    title: safeBox(frameWidth, frameHeight, title),
  };
}
