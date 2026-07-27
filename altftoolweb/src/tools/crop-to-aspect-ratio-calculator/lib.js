/**
 * Largest centred (or anchored) crop that turns a source frame into a target
 * aspect ratio without scaling.
 *
 *   sourceAspect > targetAspect -> the source is too wide, so keep the full
 *       height and cut the sides:   cropWidth  = sourceHeight * targetAspect
 *   sourceAspect < targetAspect -> the source is too tall, so keep the full
 *       width and cut top/bottom:   cropHeight = sourceWidth / targetAspect
 *
 * Crop rectangles for 4:2:0 video must have even width, height and offsets or
 * the chroma planes cannot be split cleanly, so aligned values are returned too.
 */

/** 4:2:0 chroma subsampling needs even dimensions and even offsets. */
export const CHROMA_ALIGNMENT = 2;

export const TARGET_RATIOS = [
  { id: "16:9", label: "16:9 (1.78:1)", width: 16, height: 9 },
  { id: "9:16", label: "9:16 vertical", width: 9, height: 16 },
  { id: "1:1", label: "1:1 square", width: 1, height: 1 },
  { id: "4:5", label: "4:5 feed portrait", width: 4, height: 5 },
  { id: "5:4", label: "5:4", width: 5, height: 4 },
  { id: "4:3", label: "4:3", width: 4, height: 3 },
  { id: "3:2", label: "3:2", width: 3, height: 2 },
  { id: "2:3", label: "2:3 portrait", width: 2, height: 3 },
  { id: "1.85", label: "1.85:1 flat", width: 1.85, height: 1 },
  { id: "2.39", label: "2.39:1 scope", width: 2.39, height: 1 },
];

export const SOURCE_PRESETS = [
  { id: "1920x1080", label: "1920 x 1080", width: 1920, height: 1080 },
  { id: "3840x2160", label: "3840 x 2160", width: 3840, height: 2160 },
  { id: "4096x2160", label: "4096 x 2160", width: 4096, height: 2160 },
  { id: "6000x4000", label: "6000 x 4000 (stills)", width: 6000, height: 4000 },
  { id: "1080x1920", label: "1080 x 1920", width: 1080, height: 1920 },
];

/** Where the kept rectangle sits inside the source. */
export const ANCHORS = [
  { id: "center", label: "Centre" },
  { id: "start", label: "Top / left" },
  { id: "end", label: "Bottom / right" },
];

const MAX_DIMENSION = 65536;

export function alignDown(value, step = CHROMA_ALIGNMENT) {
  if (!(step > 0)) return Math.max(0, Math.floor(value));
  return Math.max(0, Math.floor(value / step) * step);
}

/**
 * @returns {{error:string}|{
 *  cropWidth:number, cropHeight:number, offsetX:number, offsetY:number,
 *  cropWidthAligned:number, cropHeightAligned:number,
 *  offsetXAligned:number, offsetYAligned:number,
 *  removedWidth:number, removedHeight:number,
 *  pixelsKeptPercent:number, axis:"width"|"height"|"none",
 *  sourceAspect:number, targetAspect:number, ffmpeg:string
 * }}
 */
export function computeCrop({
  sourceWidth = 1920,
  sourceHeight = 1080,
  targetWidth = 1,
  targetHeight = 1,
  anchor = "center",
  align = true,
} = {}) {
  const values = [sourceWidth, sourceHeight, targetWidth, targetHeight];
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "Enter valid numbers for the source size and target ratio." };
  }
  if (!(sourceWidth > 0) || !(sourceHeight > 0)) {
    return { error: "Source width and height must be greater than zero." };
  }
  if (sourceWidth > MAX_DIMENSION || sourceHeight > MAX_DIMENSION) {
    return { error: `Source size cannot exceed ${MAX_DIMENSION} pixels per side.` };
  }
  if (!(targetWidth > 0) || !(targetHeight > 0)) {
    return { error: "Both sides of the target aspect ratio must be greater than zero." };
  }

  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;
  const EQUAL_TOLERANCE = 1e-9;

  let cropWidth;
  let cropHeight;
  let axis;

  if (sourceAspect > targetAspect + EQUAL_TOLERANCE) {
    axis = "width";
    cropHeight = sourceHeight;
    cropWidth = sourceHeight * targetAspect;
  } else if (sourceAspect < targetAspect - EQUAL_TOLERANCE) {
    axis = "height";
    cropWidth = sourceWidth;
    cropHeight = sourceWidth / targetAspect;
  } else {
    axis = "none";
    cropWidth = sourceWidth;
    cropHeight = sourceHeight;
  }

  const spareX = sourceWidth - cropWidth;
  const spareY = sourceHeight - cropHeight;
  const offsetFor = (spare) => {
    if (anchor === "start") return 0;
    if (anchor === "end") return spare;
    return spare / 2;
  };
  const offsetX = offsetFor(spareX);
  const offsetY = offsetFor(spareY);

  const step = align ? CHROMA_ALIGNMENT : 1;
  const cropWidthAligned = Math.min(alignDown(cropWidth, step), alignDown(sourceWidth, step));
  const cropHeightAligned = Math.min(alignDown(cropHeight, step), alignDown(sourceHeight, step));
  const offsetXAligned = Math.min(
    alignDown(offsetX, step),
    Math.max(0, Math.floor(sourceWidth) - cropWidthAligned),
  );
  const offsetYAligned = Math.min(
    alignDown(offsetY, step),
    Math.max(0, Math.floor(sourceHeight) - cropHeightAligned),
  );

  return {
    axis,
    sourceAspect,
    targetAspect,
    cropWidth,
    cropHeight,
    offsetX,
    offsetY,
    cropWidthAligned,
    cropHeightAligned,
    offsetXAligned,
    offsetYAligned,
    removedWidth: spareX,
    removedHeight: spareY,
    pixelsKeptPercent: ((cropWidth * cropHeight) / (sourceWidth * sourceHeight)) * 100,
    ffmpeg: `crop=${cropWidthAligned}:${cropHeightAligned}:${offsetXAligned}:${offsetYAligned}`,
  };
}
