/**
 * Letterbox / pillarbox geometry.
 *
 * Fitting picture of aspect ratio S into a frame of aspect ratio F without
 * cropping or distorting ("contain" / fit):
 *   S > F  -> the picture is wider, so it touches the left and right edges and
 *             leaves horizontal bars above and below  => LETTERBOX
 *             displayed height = frameWidth / S
 *   S < F  -> the picture is taller, so it touches the top and bottom edges and
 *             leaves vertical bars left and right      => PILLARBOX
 *             displayed width  = frameHeight * S
 *   S = F  -> full frame, no bars.
 * Each bar is half of the leftover, because the picture is centred.
 */

/** Encoders want even pixel dimensions for 4:2:0 chroma subsampling. */
export const CHROMA_ALIGNMENT = 2;

export const ASPECT_PRESETS = [
  { id: "2.39", label: "2.39:1 (anamorphic scope)", width: 2.39, height: 1 },
  { id: "2.35", label: "2.35:1 (classic scope)", width: 2.35, height: 1 },
  { id: "2.20", label: "2.20:1 (70 mm)", width: 2.2, height: 1 },
  { id: "2.00", label: "2.00:1 (Univisium)", width: 2, height: 1 },
  { id: "1.85", label: "1.85:1 (US flat)", width: 1.85, height: 1 },
  { id: "16:9", label: "16:9 (1.78:1 HD / UHD)", width: 16, height: 9 },
  { id: "3:2", label: "3:2 (stills)", width: 3, height: 2 },
  { id: "4:3", label: "4:3 (SD / classic)", width: 4, height: 3 },
  { id: "1:1", label: "1:1 (square)", width: 1, height: 1 },
  { id: "4:5", label: "4:5 (feed portrait)", width: 4, height: 5 },
  { id: "9:16", label: "9:16 (vertical / Reels)", width: 9, height: 16 },
];

export const FRAME_PRESETS = [
  { id: "1920x1080", label: "1920 x 1080 (HD 16:9)", width: 1920, height: 1080 },
  { id: "3840x2160", label: "3840 x 2160 (UHD 16:9)", width: 3840, height: 2160 },
  { id: "4096x2160", label: "4096 x 2160 (DCI 4K)", width: 4096, height: 2160 },
  { id: "1080x1920", label: "1080 x 1920 (vertical 9:16)", width: 1080, height: 1920 },
  { id: "1080x1350", label: "1080 x 1350 (feed 4:5)", width: 1080, height: 1350 },
  { id: "1080x1080", label: "1080 x 1080 (square)", width: 1080, height: 1080 },
  { id: "1280x720", label: "1280 x 720 (720p)", width: 1280, height: 720 },
];

const MAX_DIMENSION = 16384;

/** Largest multiple of `step` that is <= value, never below 0. */
export function alignDown(value, step = CHROMA_ALIGNMENT) {
  if (!(step > 0)) return value;
  return Math.max(0, Math.floor(value / step) * step);
}

/**
 * @returns {{error:string}|{
 *  mode:"letterbox"|"pillarbox"|"none",
 *  frameWidth:number, frameHeight:number,
 *  frameAspect:number, sourceAspect:number,
 *  pictureWidth:number, pictureHeight:number,
 *  pictureWidthEven:number, pictureHeightEven:number,
 *  barSize:number, barTotal:number, barPercent:number,
 *  barPercentEach:number, areaUsedPercent:number,
 *  scaleFromSource:number|null
 * }}
 */
export function computeBars({
  frameWidth = 1920,
  frameHeight = 1080,
  sourceAspectWidth = 2.39,
  sourceAspectHeight = 1,
  sourceWidth = 0,
} = {}) {
  const values = [frameWidth, frameHeight, sourceAspectWidth, sourceAspectHeight];
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "Enter valid numbers for the frame size and the aspect ratio." };
  }
  if (!(frameWidth > 0) || !(frameHeight > 0)) {
    return { error: "Frame width and height must be greater than zero." };
  }
  if (frameWidth > MAX_DIMENSION || frameHeight > MAX_DIMENSION) {
    return { error: `Frame size cannot exceed ${MAX_DIMENSION} pixels per side.` };
  }
  if (!(sourceAspectWidth > 0) || !(sourceAspectHeight > 0)) {
    return { error: "Both sides of the source aspect ratio must be greater than zero." };
  }

  const frameAspect = frameWidth / frameHeight;
  const sourceAspect = sourceAspectWidth / sourceAspectHeight;

  let pictureWidth;
  let pictureHeight;
  let mode;
  let barSize;

  // Tolerance so 1.7777 and 16/9 are treated as the same ratio.
  const EQUAL_TOLERANCE = 1e-6;

  if (sourceAspect > frameAspect + EQUAL_TOLERANCE) {
    mode = "letterbox";
    pictureWidth = frameWidth;
    pictureHeight = frameWidth / sourceAspect;
    barSize = (frameHeight - pictureHeight) / 2;
  } else if (sourceAspect < frameAspect - EQUAL_TOLERANCE) {
    mode = "pillarbox";
    pictureHeight = frameHeight;
    pictureWidth = frameHeight * sourceAspect;
    barSize = (frameWidth - pictureWidth) / 2;
  } else {
    mode = "none";
    pictureWidth = frameWidth;
    pictureHeight = frameHeight;
    barSize = 0;
  }

  const barTotal = barSize * 2;
  const acrossSize = mode === "pillarbox" ? frameWidth : frameHeight;

  return {
    mode,
    frameWidth,
    frameHeight,
    frameAspect,
    sourceAspect,
    pictureWidth,
    pictureHeight,
    pictureWidthEven: alignDown(pictureWidth),
    pictureHeightEven: alignDown(pictureHeight),
    barSize,
    barTotal,
    barPercent: (barTotal / acrossSize) * 100,
    barPercentEach: (barSize / acrossSize) * 100,
    areaUsedPercent: ((pictureWidth * pictureHeight) / (frameWidth * frameHeight)) * 100,
    scaleFromSource: sourceWidth > 0 ? pictureWidth / sourceWidth : null,
  };
}

/** Reduce a width:height pair to its simplest integer form, e.g. 1920x1080 -> 16:9. */
export function simplifyRatio(width, height) {
  if (!(width > 0) || !(height > 0)) return null;
  const w = Math.round(width);
  const h = Math.round(height);
  if (Math.abs(w - width) > 1e-6 || Math.abs(h - height) > 1e-6) return null;
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(w, h) || 1;
  return { width: w / divisor, height: h / divisor };
}
