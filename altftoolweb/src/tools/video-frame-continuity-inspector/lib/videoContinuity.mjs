export const CONTINUITY_REPORT_SCHEMA =
  "altftool.video-frame-continuity-screen.v1";

export const VIDEO_LIMITS = Object.freeze({
  maxFileBytes: 80 * 1024 * 1024,
  maxDurationSeconds: 10 * 60,
  maxSourceEdge: 4_096,
  maxSourcePixels: 4_096 * 2_160,
  maxWorkingEdge: 320,
  maxWorkingPixels: 57_600,
  maxSampledFrames: 60,
  maxThumbnailFrames: 24,
  minIntervalSeconds: 0.25,
  maxIntervalSeconds: 30,
  endMarginSeconds: 0.05,
});

export const SUPPORTED_VIDEO_MIME_TYPES = Object.freeze([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-m4v",
]);

export const CONTINUITY_THRESHOLDS = Object.freeze({
  nearDuplicatePixelDifference: 0.008,
  nearDuplicateHistogramDistance: 0.012,
  highChangePixelDifference: 0.18,
  highChangeHistogramDistance: 0.28,
});

export const CONTINUITY_LIMITATIONS = Object.freeze([
  "This is a sparse visual-change screen, not edit, deepfake, tamper, provenance, or authenticity detection.",
  "Cuts, flashes, fades, camera motion, lighting changes, graphics, animation, and codec or browser decoding differences can all create high-change cues.",
  "Static scenes, held frames, low-motion footage, repeated graphics, or coarse compression can create near-duplicate cues without an editing freeze.",
  "Only the requested sample times are inspected. Changes between those times can be missed, and an absence of cues does not prove continuity.",
  "Results can differ across browsers because video decoding, color conversion, seeking precision, and available codecs differ.",
]);

const HISTOGRAM_BIN_COUNT = 16;

function finiteNumber(value, fallback = Number.NaN) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function rounded(value, digits = 5) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function assertFramePixels(value, label) {
  if (!value || typeof value.length !== "number" || value.length % 4 !== 0) {
    throw new TypeError(`${label} must be a non-empty RGBA pixel array.`);
  }
  const pixelCount = value.length / 4;
  if (!pixelCount || pixelCount > VIDEO_LIMITS.maxWorkingPixels) {
    throw new RangeError(
      `${label} must contain between 1 and ${VIDEO_LIMITS.maxWorkingPixels.toLocaleString("en-US")} pixels.`,
    );
  }
  return pixelCount;
}

export function validateVideoFile({ size, type } = {}) {
  const bytes = finiteNumber(size, -1);
  const mimeType = String(type || "")
    .trim()
    .toLowerCase();

  if (!SUPPORTED_VIDEO_MIME_TYPES.includes(mimeType)) {
    return {
      ok: false,
      error:
        "Choose an MP4, WebM, Ogg video, QuickTime MOV, or M4V file with a recognized video MIME type.",
    };
  }
  if (!Number.isSafeInteger(bytes) || bytes <= 0) {
    return { ok: false, error: "The selected video is empty or invalid." };
  }
  if (bytes > VIDEO_LIMITS.maxFileBytes) {
    return {
      ok: false,
      error: "Choose a video no larger than 80 MB.",
    };
  }
  return { ok: true, bytes, mimeType };
}

export function validateVideoMetadata({
  duration,
  videoHeight,
  videoWidth,
} = {}) {
  const durationSeconds = finiteNumber(duration);
  const width = Math.floor(finiteNumber(videoWidth));
  const height = Math.floor(finiteNumber(videoHeight));

  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0.1 ||
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return {
      ok: false,
      error:
        "The browser did not provide usable video duration and dimensions.",
    };
  }
  if (durationSeconds > VIDEO_LIMITS.maxDurationSeconds) {
    return {
      ok: false,
      error: "Choose a video no longer than 10 minutes.",
    };
  }
  if (
    width > VIDEO_LIMITS.maxSourceEdge ||
    height > VIDEO_LIMITS.maxSourceEdge ||
    width * height > VIDEO_LIMITS.maxSourcePixels
  ) {
    return {
      ok: false,
      error:
        "Video dimensions exceed the 4,096-pixel edge or 8,847,360-pixel safety limit.",
    };
  }
  return {
    ok: true,
    durationSeconds,
    width,
    height,
  };
}

export function calculateWorkingDimensions(widthInput, heightInput) {
  const width = Math.floor(finiteNumber(widthInput));
  const height = Math.floor(finiteNumber(heightInput));
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    width > VIDEO_LIMITS.maxSourceEdge ||
    height > VIDEO_LIMITS.maxSourceEdge ||
    width * height > VIDEO_LIMITS.maxSourcePixels
  ) {
    throw new RangeError(
      "Source video dimensions are invalid or exceed limits.",
    );
  }

  const scale = Math.min(
    1,
    VIDEO_LIMITS.maxWorkingEdge / Math.max(width, height),
    Math.sqrt(VIDEO_LIMITS.maxWorkingPixels / (width * height)),
  );
  let workingWidth = Math.max(1, Math.floor(width * scale));
  let workingHeight = Math.max(1, Math.floor(height * scale));

  while (
    workingWidth * workingHeight > VIDEO_LIMITS.maxWorkingPixels ||
    Math.max(workingWidth, workingHeight) > VIDEO_LIMITS.maxWorkingEdge
  ) {
    if (workingWidth >= workingHeight) workingWidth -= 1;
    else workingHeight -= 1;
  }

  return {
    width: workingWidth,
    height: workingHeight,
    pixels: workingWidth * workingHeight,
    scale: rounded(scale, 6),
  };
}

export function minimumFullCoverageInterval(durationInput) {
  const duration = finiteNumber(durationInput);
  if (duration < 0.1 || duration > VIDEO_LIMITS.maxDurationSeconds) {
    throw new RangeError("Video duration is outside the supported range.");
  }
  const raw = duration / (VIDEO_LIMITS.maxSampledFrames - 1);
  const quarterSecondSteps = Math.ceil(
    Math.max(VIDEO_LIMITS.minIntervalSeconds, raw) * 4,
  );
  return Math.min(VIDEO_LIMITS.maxIntervalSeconds, quarterSecondSteps / 4);
}

export function buildSampleTimes(durationInput, intervalInput) {
  const duration = finiteNumber(durationInput);
  const interval = finiteNumber(intervalInput);
  if (duration < 0.1 || duration > VIDEO_LIMITS.maxDurationSeconds) {
    throw new RangeError("Video duration is outside the supported range.");
  }
  if (
    interval < VIDEO_LIMITS.minIntervalSeconds ||
    interval > VIDEO_LIMITS.maxIntervalSeconds
  ) {
    throw new RangeError(
      "Sample interval must be between 0.25 and 30 seconds.",
    );
  }

  const finalTime = Math.max(
    0,
    duration - Math.min(VIDEO_LIMITS.endMarginSeconds, duration / 2),
  );
  const times = [0];
  for (let time = interval; time < finalTime - 0.001; time += interval) {
    if (times.length >= VIDEO_LIMITS.maxSampledFrames - 1) {
      throw new RangeError(
        `This interval would exceed ${VIDEO_LIMITS.maxSampledFrames} sampled frames. Increase the interval.`,
      );
    }
    times.push(rounded(time, 4));
  }
  if (finalTime - times.at(-1) > 0.001) {
    if (times.length >= VIDEO_LIMITS.maxSampledFrames) {
      throw new RangeError(
        `This interval would exceed ${VIDEO_LIMITS.maxSampledFrames} sampled frames. Increase the interval.`,
      );
    }
    times.push(rounded(finalTime, 4));
  }
  return times;
}

export function assessThumbnailSafety(sampleCountInput, workingPixelsInput) {
  const sampleCount = Math.floor(finiteNumber(sampleCountInput, -1));
  const workingPixels = Math.floor(finiteNumber(workingPixelsInput, -1));
  if (
    sampleCount <= 0 ||
    sampleCount > VIDEO_LIMITS.maxSampledFrames ||
    workingPixels <= 0 ||
    workingPixels > VIDEO_LIMITS.maxWorkingPixels
  ) {
    return {
      safe: false,
      reason: "The sampling plan is outside safety limits.",
    };
  }
  if (sampleCount > VIDEO_LIMITS.maxThumbnailFrames) {
    return {
      safe: false,
      reason: `Thumbnail preview is limited to ${VIDEO_LIMITS.maxThumbnailFrames} sampled frames.`,
    };
  }
  return { safe: true, reason: "" };
}

export function summarizeFramePixels(rgbaPixels) {
  const pixelCount = assertFramePixels(rgbaPixels, "Frame pixels");
  const histogram = new Array(HISTOGRAM_BIN_COUNT).fill(0);
  let redTotal = 0;
  let greenTotal = 0;
  let blueTotal = 0;
  let luminanceTotal = 0;

  for (let offset = 0; offset < rgbaPixels.length; offset += 4) {
    const red = Number(rgbaPixels[offset]) || 0;
    const green = Number(rgbaPixels[offset + 1]) || 0;
    const blue = Number(rgbaPixels[offset + 2]) || 0;
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    const bin = Math.min(
      HISTOGRAM_BIN_COUNT - 1,
      Math.floor((luminance / 256) * HISTOGRAM_BIN_COUNT),
    );
    histogram[bin] += 1;
    redTotal += red;
    greenTotal += green;
    blueTotal += blue;
    luminanceTotal += luminance;
  }

  return {
    pixelCount,
    meanRed: rounded(redTotal / pixelCount, 3),
    meanGreen: rounded(greenTotal / pixelCount, 3),
    meanBlue: rounded(blueTotal / pixelCount, 3),
    meanLuminance: rounded(luminanceTotal / pixelCount, 3),
    luminanceHistogram: histogram.map((count) =>
      rounded(count / pixelCount, 6),
    ),
  };
}

export function calculateHistogramDistance(firstHistogram, secondHistogram) {
  if (
    !Array.isArray(firstHistogram) ||
    !Array.isArray(secondHistogram) ||
    firstHistogram.length !== HISTOGRAM_BIN_COUNT ||
    secondHistogram.length !== HISTOGRAM_BIN_COUNT
  ) {
    throw new TypeError("Both luminance histograms must contain 16 bins.");
  }
  let difference = 0;
  for (let index = 0; index < HISTOGRAM_BIN_COUNT; index += 1) {
    const first = finiteNumber(firstHistogram[index]);
    const second = finiteNumber(secondHistogram[index]);
    if (first < 0 || second < 0) {
      throw new RangeError("Histogram values must be finite and non-negative.");
    }
    difference += Math.abs(first - second);
  }
  return rounded(Math.min(1, difference / 2), 6);
}

export function calculatePixelDifference(firstPixels, secondPixels) {
  const firstCount = assertFramePixels(firstPixels, "First frame pixels");
  const secondCount = assertFramePixels(secondPixels, "Second frame pixels");
  if (firstCount !== secondCount) {
    throw new RangeError("Compared frames must have matching dimensions.");
  }
  let difference = 0;
  for (let offset = 0; offset < firstPixels.length; offset += 4) {
    difference += Math.abs(firstPixels[offset] - secondPixels[offset]);
    difference += Math.abs(firstPixels[offset + 1] - secondPixels[offset + 1]);
    difference += Math.abs(firstPixels[offset + 2] - secondPixels[offset + 2]);
  }
  return rounded(difference / (firstCount * 3 * 255), 6);
}

export function classifyContinuityChange(
  { histogramDistance, pixelDifference } = {},
  thresholds = CONTINUITY_THRESHOLDS,
) {
  const pixel = finiteNumber(pixelDifference, -1);
  const histogram = finiteNumber(histogramDistance, -1);
  if (pixel < 0 || pixel > 1 || histogram < 0 || histogram > 1) {
    throw new RangeError("Continuity metrics must be values from 0 to 1.");
  }

  if (
    pixel <= thresholds.nearDuplicatePixelDifference &&
    histogram <= thresholds.nearDuplicateHistogramDistance
  ) {
    return "near-duplicate";
  }
  if (
    pixel >= thresholds.highChangePixelDifference ||
    histogram >= thresholds.highChangeHistogramDistance
  ) {
    return "high-change";
  }
  return "ordinary-change";
}

export function compareFramePixels(
  firstPixels,
  secondPixels,
  { fromTime, toTime } = {},
) {
  const startSeconds = finiteNumber(fromTime, -1);
  const endSeconds = finiteNumber(toTime, -1);
  if (startSeconds < 0 || endSeconds <= startSeconds) {
    throw new RangeError(
      "Frame comparison times must be ordered and positive.",
    );
  }
  const firstSummary = summarizeFramePixels(firstPixels);
  const secondSummary = summarizeFramePixels(secondPixels);
  const pixelDifference = calculatePixelDifference(firstPixels, secondPixels);
  const histogramDistance = calculateHistogramDistance(
    firstSummary.luminanceHistogram,
    secondSummary.luminanceHistogram,
  );
  const meanLuminanceDelta = rounded(
    Math.abs(firstSummary.meanLuminance - secondSummary.meanLuminance) / 255,
    6,
  );

  return {
    fromTime: rounded(startSeconds, 4),
    toTime: rounded(endSeconds, 4),
    pixelDifference,
    histogramDistance,
    meanLuminanceDelta,
    cue: classifyContinuityChange({
      histogramDistance,
      pixelDifference,
    }),
  };
}

export function mergeContinuityCues(comparisonsInput) {
  const comparisons = Array.from(comparisonsInput || []);
  const ranges = [];

  for (const comparison of comparisons) {
    if (
      !comparison ||
      !["near-duplicate", "high-change", "ordinary-change"].includes(
        comparison.cue,
      ) ||
      !Number.isFinite(comparison.fromTime) ||
      !Number.isFinite(comparison.toTime) ||
      comparison.fromTime < 0 ||
      comparison.toTime <= comparison.fromTime
    ) {
      throw new TypeError("Continuity comparisons are malformed.");
    }
    if (comparison.cue === "ordinary-change") continue;

    const previous = ranges.at(-1);
    const isAdjacent =
      previous &&
      previous.cue === comparison.cue &&
      Math.abs(previous.endSeconds - comparison.fromTime) <= 0.002;

    if (isAdjacent) {
      previous.endSeconds = rounded(comparison.toTime, 4);
      previous.pairCount += 1;
      previous.peakPixelDifference = Math.max(
        previous.peakPixelDifference,
        comparison.pixelDifference,
      );
      previous.peakHistogramDistance = Math.max(
        previous.peakHistogramDistance,
        comparison.histogramDistance,
      );
    } else {
      ranges.push({
        cue: comparison.cue,
        startSeconds: rounded(comparison.fromTime, 4),
        endSeconds: rounded(comparison.toTime, 4),
        pairCount: 1,
        peakPixelDifference: comparison.pixelDifference,
        peakHistogramDistance: comparison.histogramDistance,
      });
    }
  }

  return ranges.map((range) => ({
    ...range,
    peakPixelDifference: rounded(range.peakPixelDifference, 6),
    peakHistogramDistance: rounded(range.peakHistogramDistance, 6),
  }));
}

export function buildPrivacySafeContinuityReport({
  comparisons,
  durationSeconds,
  intervalSeconds,
  ranges,
  sampleTimes,
} = {}) {
  const safeComparisons = Array.from(comparisons || []);
  const safeRanges = Array.from(ranges || []);
  const safeTimes = Array.from(sampleTimes || []);
  const nearDuplicatePairs = safeComparisons.filter(
    ({ cue }) => cue === "near-duplicate",
  ).length;
  const highChangePairs = safeComparisons.filter(
    ({ cue }) => cue === "high-change",
  ).length;
  const ordinaryChangePairs = safeComparisons.filter(
    ({ cue }) => cue === "ordinary-change",
  ).length;

  return {
    schema: CONTINUITY_REPORT_SCHEMA,
    screeningOnly: true,
    durationSeconds: rounded(finiteNumber(durationSeconds, 0), 4),
    requestedIntervalSeconds: rounded(finiteNumber(intervalSeconds, 0), 4),
    sampledCoverageEndSeconds: rounded(finiteNumber(safeTimes.at(-1), 0), 4),
    counts: {
      sampledFrames: safeTimes.length,
      comparedPairs: safeComparisons.length,
      nearDuplicatePairs,
      highChangePairs,
      ordinaryChangePairs,
      cueRanges: safeRanges.length,
    },
    cueRanges: safeRanges.map(
      ({ cue, endSeconds, pairCount, startSeconds }) => ({
        cue,
        startSeconds: rounded(finiteNumber(startSeconds, 0), 4),
        endSeconds: rounded(finiteNumber(endSeconds, 0), 4),
        pairCount: Math.max(0, Math.floor(finiteNumber(pairCount, 0))),
      }),
    ),
    limitations: [...CONTINUITY_LIMITATIONS],
  };
}
