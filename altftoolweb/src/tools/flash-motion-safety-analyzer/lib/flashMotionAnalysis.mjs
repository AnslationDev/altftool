export const FLASH_MOTION_REPORT_SCHEMA =
  "altftool.flash-motion-sampled-screen.v1";

export const FLASH_MOTION_LIMITS = Object.freeze({
  maxEncodedBytes: 80 * 1024 * 1024,
  maxHeaderBytes: 4_096,
  maxDurationSeconds: 120,
  maxSourceEdge: 4_096,
  maxSourcePixels: 4_096 * 2_160,
  maxWorkingEdge: 160,
  maxWorkingPixels: 14_400,
  minSampleRate: 8,
  maxSampleRate: 15,
  maxDeclaredSourceFps: 240,
  maxSampledFrames: 1_802,
  maxRetainedEvents: 200,
  maxRetainedGaps: 100,
  maximumGapRatio: 1.6,
  endMarginSeconds: 0.001,
});

export const FLASH_THRESHOLDS = Object.freeze({
  generalLuminanceDifference: 0.1,
  generalDarkerLuminanceMaximum: 0.8,
  saturatedRedRatio: 0.8,
  redChromaticityDifference: 0.2,
  smallAreaBoundaryCssPixels: 21_824,
  motionLuminanceDifference: 0.1,
  largeMotionAreaFraction: 0.25,
});

export const SUPPORTED_VIDEO_MIME_TYPES = Object.freeze([
  "video/mp4",
  "video/webm",
]);

const LINEAR_CHANNELS = Float64Array.from({ length: 256 }, (_, value) => {
  const encoded = value / 255;
  return encoded <= 0.04045
    ? encoded / 12.92
    : ((encoded + 0.055) / 1.055) ** 2.4;
});

function finiteNumber(value, fallback = Number.NaN) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function round(value, digits = 5) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function hasAscii(bytes, text) {
  const expected = Array.from(text, (character) => character.charCodeAt(0));
  for (let index = 0; index <= bytes.length - expected.length; index += 1) {
    let matches = true;
    for (let offset = 0; offset < expected.length; offset += 1) {
      if (bytes[index + offset] !== expected[offset]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }
  return false;
}

function rgbaPixelCount(rgbaPixels) {
  if (
    !rgbaPixels ||
    typeof rgbaPixels.length !== "number" ||
    rgbaPixels.length === 0 ||
    rgbaPixels.length % 4 !== 0
  ) {
    throw new TypeError("A non-empty RGBA pixel array is required.");
  }
  const pixelCount = rgbaPixels.length / 4;
  if (pixelCount > FLASH_MOTION_LIMITS.maxWorkingPixels) {
    throw new RangeError(
      `A sampled frame may contain at most ${FLASH_MOTION_LIMITS.maxWorkingPixels.toLocaleString("en-US")} pixels.`,
    );
  }
  return pixelCount;
}

function makeFeatureBuffer(pixelCount) {
  return {
    luminance: new Float32Array(pixelCount),
    redSaturated: new Uint8Array(pixelCount),
    uPrime: new Float32Array(pixelCount),
    vPrime: new Float32Array(pixelCount),
  };
}

function makeTransitionBuffer(pixelCount) {
  return {
    generalDirection: new Int8Array(pixelCount),
    generalTimeMs: new Float64Array(pixelCount),
    redDeltaU: new Float32Array(pixelCount),
    redDeltaV: new Float32Array(pixelCount),
    redQualifies: new Uint8Array(pixelCount),
    redTimeMs: new Float64Array(pixelCount),
  };
}

function populateFeatures(rgbaPixels, target) {
  const pixelCount = rgbaPixelCount(rgbaPixels);
  if (target.luminance.length !== pixelCount) {
    throw new RangeError("Sampled frames must have matching dimensions.");
  }

  for (let pixel = 0, offset = 0; pixel < pixelCount; pixel += 1, offset += 4) {
    const alpha = (Number(rgbaPixels[offset + 3]) || 0) / 255;
    const red = LINEAR_CHANNELS[Number(rgbaPixels[offset]) || 0] * alpha;
    const green = LINEAR_CHANNELS[Number(rgbaPixels[offset + 1]) || 0] * alpha;
    const blue = LINEAR_CHANNELS[Number(rgbaPixels[offset + 2]) || 0] * alpha;
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    const colorTotal = red + green + blue;

    target.luminance[pixel] = luminance;
    target.redSaturated[pixel] =
      colorTotal > 0 && red / colorTotal >= FLASH_THRESHOLDS.saturatedRedRatio
        ? 1
        : 0;

    const x = 0.4124564 * red + 0.3575761 * green + 0.1804375 * blue;
    const y = 0.2126729 * red + 0.7151522 * green + 0.072175 * blue;
    const z = 0.0193339 * red + 0.119192 * green + 0.9503041 * blue;
    const denominator = x + 15 * y + 3 * z;
    target.uPrime[pixel] = denominator > 0 ? (4 * x) / denominator : 0;
    target.vPrime[pixel] = denominator > 0 ? (9 * y) / denominator : 0;
  }
}

function fillTransition(previous, current, output) {
  let changedPixels = 0;
  let luminanceDifferenceTotal = 0;

  for (let pixel = 0; pixel < previous.luminance.length; pixel += 1) {
    const luminanceDelta = current.luminance[pixel] - previous.luminance[pixel];
    const absoluteLuminanceDelta = Math.abs(luminanceDelta);
    const darkerLuminance = Math.min(
      current.luminance[pixel],
      previous.luminance[pixel],
    );
    output.generalDirection[pixel] =
      absoluteLuminanceDelta >= FLASH_THRESHOLDS.generalLuminanceDifference &&
      darkerLuminance < FLASH_THRESHOLDS.generalDarkerLuminanceMaximum
        ? Math.sign(luminanceDelta)
        : 0;

    const deltaU = current.uPrime[pixel] - previous.uPrime[pixel];
    const deltaV = current.vPrime[pixel] - previous.vPrime[pixel];
    const chromaticityDifference = Math.hypot(deltaU, deltaV);
    output.redDeltaU[pixel] = deltaU;
    output.redDeltaV[pixel] = deltaV;
    output.redQualifies[pixel] =
      (current.redSaturated[pixel] || previous.redSaturated[pixel]) &&
      chromaticityDifference > FLASH_THRESHOLDS.redChromaticityDifference
        ? 1
        : 0;

    luminanceDifferenceTotal += absoluteLuminanceDelta;
    if (absoluteLuminanceDelta >= FLASH_THRESHOLDS.motionLuminanceDifference) {
      changedPixels += 1;
    }
  }

  return {
    changedPixels,
    changedAreaFraction: changedPixels / previous.luminance.length,
    meanAbsoluteLuminanceDifference:
      luminanceDifferenceTotal / previous.luminance.length,
  };
}

function consumeOpposingTransitions(pending, current, timeMs) {
  let generalPixels = 0;
  let generalPendingInWindow = false;
  let redPixels = 0;
  let redPendingInWindow = false;
  for (let pixel = 0; pixel < pending.generalDirection.length; pixel += 1) {
    if (
      pending.generalDirection[pixel] &&
      timeMs - pending.generalTimeMs[pixel] > 1_000
    ) {
      pending.generalDirection[pixel] = 0;
      pending.generalTimeMs[pixel] = 0;
    }
    const currentGeneralDirection = current.generalDirection[pixel];
    if (currentGeneralDirection) {
      const pendingGeneralDirection = pending.generalDirection[pixel];
      if (
        pendingGeneralDirection &&
        pendingGeneralDirection !== currentGeneralDirection
      ) {
        generalPixels += 1;
        pending.generalDirection[pixel] = 0;
        pending.generalTimeMs[pixel] = 0;
      } else {
        pending.generalDirection[pixel] = currentGeneralDirection;
        pending.generalTimeMs[pixel] = timeMs;
      }
    }
    if (
      pending.generalDirection[pixel] &&
      timeMs - pending.generalTimeMs[pixel] <= 1_000
    ) {
      generalPendingInWindow = true;
    }

    if (
      pending.redQualifies[pixel] &&
      timeMs - pending.redTimeMs[pixel] > 1_000
    ) {
      pending.redQualifies[pixel] = 0;
      pending.redDeltaU[pixel] = 0;
      pending.redDeltaV[pixel] = 0;
      pending.redTimeMs[pixel] = 0;
    }
    if (current.redQualifies[pixel]) {
      if (
        pending.redQualifies[pixel] &&
        pending.redDeltaU[pixel] * current.redDeltaU[pixel] +
          pending.redDeltaV[pixel] * current.redDeltaV[pixel] <
          0
      ) {
        redPixels += 1;
        pending.redQualifies[pixel] = 0;
        pending.redDeltaU[pixel] = 0;
        pending.redDeltaV[pixel] = 0;
        pending.redTimeMs[pixel] = 0;
      } else {
        pending.redQualifies[pixel] = 1;
        pending.redDeltaU[pixel] = current.redDeltaU[pixel];
        pending.redDeltaV[pixel] = current.redDeltaV[pixel];
        pending.redTimeMs[pixel] = timeMs;
      }
    }
    if (
      pending.redQualifies[pixel] &&
      timeMs - pending.redTimeMs[pixel] <= 1_000
    ) {
      redPendingInWindow = true;
    }
  }
  return {
    generalPendingInWindow,
    generalPixels,
    redPendingInWindow,
    redPixels,
  };
}

export function detectVideoContainer(headerBytes) {
  const bytes =
    headerBytes instanceof Uint8Array
      ? headerBytes
      : new Uint8Array(headerBytes || []);
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    return "video/mp4";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3 &&
    hasAscii(bytes, "webm")
  ) {
    return "video/webm";
  }
  return "";
}

export function validateEncodedVideo(fileLike = {}, headerBytes) {
  const size = finiteNumber(fileLike.size, -1);
  const mimeType = String(fileLike.type || "")
    .trim()
    .toLowerCase();

  if (!SUPPORTED_VIDEO_MIME_TYPES.includes(mimeType)) {
    return {
      ok: false,
      error:
        "Choose an MP4 or WebM file with a matching browser-provided video MIME type.",
    };
  }
  if (!Number.isSafeInteger(size) || size <= 0) {
    return { ok: false, error: "The selected video is empty or invalid." };
  }
  if (size > FLASH_MOTION_LIMITS.maxEncodedBytes) {
    return {
      ok: false,
      error: "Choose a video no larger than 80 MB.",
    };
  }

  const detectedMimeType = detectVideoContainer(headerBytes);
  if (!detectedMimeType || detectedMimeType !== mimeType) {
    return {
      ok: false,
      error:
        "The encoded video signature does not match its MP4 or WebM MIME type.",
    };
  }
  return { ok: true, bytes: size, mimeType };
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
  if (durationSeconds > FLASH_MOTION_LIMITS.maxDurationSeconds) {
    return {
      ok: false,
      error: "Choose a video no longer than 2 minutes.",
    };
  }
  if (
    width > FLASH_MOTION_LIMITS.maxSourceEdge ||
    height > FLASH_MOTION_LIMITS.maxSourceEdge ||
    width * height > FLASH_MOTION_LIMITS.maxSourcePixels
  ) {
    return {
      ok: false,
      error:
        "Video dimensions exceed the 4,096-pixel edge or 8,847,360-pixel safety limit.",
    };
  }
  return { ok: true, durationSeconds, width, height };
}

export function calculateWorkingDimensions(widthInput, heightInput) {
  const width = Math.floor(finiteNumber(widthInput));
  const height = Math.floor(finiteNumber(heightInput));
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    width > FLASH_MOTION_LIMITS.maxSourceEdge ||
    height > FLASH_MOTION_LIMITS.maxSourceEdge ||
    width * height > FLASH_MOTION_LIMITS.maxSourcePixels
  ) {
    throw new RangeError(
      "Source video dimensions are invalid or exceed limits.",
    );
  }

  const scale = Math.min(
    1,
    FLASH_MOTION_LIMITS.maxWorkingEdge / Math.max(width, height),
    Math.sqrt(FLASH_MOTION_LIMITS.maxWorkingPixels / (width * height)),
  );
  let workingWidth = Math.max(1, Math.floor(width * scale));
  let workingHeight = Math.max(1, Math.floor(height * scale));
  while (
    workingWidth * workingHeight > FLASH_MOTION_LIMITS.maxWorkingPixels ||
    Math.max(workingWidth, workingHeight) > FLASH_MOTION_LIMITS.maxWorkingEdge
  ) {
    if (workingWidth >= workingHeight) workingWidth -= 1;
    else workingHeight -= 1;
  }

  return {
    width: workingWidth,
    height: workingHeight,
    pixels: workingWidth * workingHeight,
    scale: round(scale, 6),
  };
}

export function validateSamplingSettings({
  displayHeight,
  displayWidth,
  sampleRate,
  sourceFps,
} = {}) {
  const samplesPerSecond = finiteNumber(sampleRate);
  const declaredSourceFps =
    sourceFps === "" || sourceFps === null || sourceFps === undefined
      ? null
      : finiteNumber(sourceFps);
  const width =
    displayWidth === "" || displayWidth === null || displayWidth === undefined
      ? null
      : Math.floor(finiteNumber(displayWidth));
  const height =
    displayHeight === "" ||
    displayHeight === null ||
    displayHeight === undefined
      ? null
      : Math.floor(finiteNumber(displayHeight));
  const errors = [];

  if (
    !Number.isInteger(samplesPerSecond) ||
    samplesPerSecond < FLASH_MOTION_LIMITS.minSampleRate ||
    samplesPerSecond > FLASH_MOTION_LIMITS.maxSampleRate
  ) {
    errors.push(
      `Sample rate must be a whole number from ${FLASH_MOTION_LIMITS.minSampleRate} to ${FLASH_MOTION_LIMITS.maxSampleRate} frames per second.`,
    );
  }
  if (
    declaredSourceFps !== null &&
    (!Number.isFinite(declaredSourceFps) ||
      declaredSourceFps < 1 ||
      declaredSourceFps > FLASH_MOTION_LIMITS.maxDeclaredSourceFps)
  ) {
    errors.push(
      `Declared source frame rate must be between 1 and ${FLASH_MOTION_LIMITS.maxDeclaredSourceFps} fps.`,
    );
  }
  if ((width === null) !== (height === null)) {
    errors.push(
      "Enter both planned display dimensions, or leave both fields empty.",
    );
  } else if (
    width !== null &&
    (!Number.isSafeInteger(width) ||
      !Number.isSafeInteger(height) ||
      width < 1 ||
      height < 1 ||
      width > FLASH_MOTION_LIMITS.maxSourceEdge ||
      height > FLASH_MOTION_LIMITS.maxSourceEdge)
  ) {
    errors.push(
      "Planned display dimensions must be whole CSS-pixel values from 1 to 4,096.",
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    settings: {
      displayHeight: height,
      displayWidth: width,
      sampleRate: samplesPerSecond,
      sourceFps: declaredSourceFps,
    },
  };
}

export function buildSampleTimes(durationInput, sampleRateInput) {
  const duration = finiteNumber(durationInput);
  const sampleRate = finiteNumber(sampleRateInput);
  if (duration < 0.1 || duration > FLASH_MOTION_LIMITS.maxDurationSeconds) {
    throw new RangeError("Video duration is outside the supported range.");
  }
  if (
    !Number.isInteger(sampleRate) ||
    sampleRate < FLASH_MOTION_LIMITS.minSampleRate ||
    sampleRate > FLASH_MOTION_LIMITS.maxSampleRate
  ) {
    throw new RangeError("Sample rate is outside the supported range.");
  }

  const finalTime = Math.max(
    0,
    duration - Math.min(FLASH_MOTION_LIMITS.endMarginSeconds, duration / 2),
  );
  const interval = 1 / sampleRate;
  const times = [];
  for (let time = 0; time <= finalTime + 1e-8; time += interval) {
    if (times.length >= FLASH_MOTION_LIMITS.maxSampledFrames) {
      throw new RangeError(
        `Sampling would exceed ${FLASH_MOTION_LIMITS.maxSampledFrames.toLocaleString("en-US")} frames.`,
      );
    }
    times.push(round(Math.min(time, finalTime), 6));
  }
  if (finalTime - times.at(-1) > 0.001) {
    if (times.length >= FLASH_MOTION_LIMITS.maxSampledFrames) {
      throw new RangeError(
        `Sampling would exceed ${FLASH_MOTION_LIMITS.maxSampledFrames.toLocaleString("en-US")} frames.`,
      );
    }
    times.push(round(finalTime, 6));
  }
  return times;
}

export function relativeLuminance(red8, green8, blue8, alpha8 = 255) {
  const alpha = Math.min(255, Math.max(0, finiteNumber(alpha8, 255))) / 255;
  const red =
    LINEAR_CHANNELS[Math.min(255, Math.max(0, Math.round(red8)))] * alpha;
  const green =
    LINEAR_CHANNELS[Math.min(255, Math.max(0, Math.round(green8)))] * alpha;
  const blue =
    LINEAR_CHANNELS[Math.min(255, Math.max(0, Math.round(blue8)))] * alpha;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function inspectPixelTransition(fromRgba, toRgba) {
  if (
    !Array.isArray(fromRgba) ||
    !Array.isArray(toRgba) ||
    fromRgba.length < 3 ||
    toRgba.length < 3
  ) {
    throw new TypeError("Two RGB or RGBA color arrays are required.");
  }
  const pixels = new Uint8ClampedArray([
    fromRgba[0],
    fromRgba[1],
    fromRgba[2],
    fromRgba[3] ?? 255,
    toRgba[0],
    toRgba[1],
    toRgba[2],
    toRgba[3] ?? 255,
  ]);
  const first = makeFeatureBuffer(1);
  const second = makeFeatureBuffer(1);
  populateFeatures(pixels.subarray(0, 4), first);
  populateFeatures(pixels.subarray(4, 8), second);
  const transition = makeTransitionBuffer(1);
  const motion = fillTransition(first, second, transition);
  return {
    generalDirection: transition.generalDirection[0],
    redChromaticityDifference: round(
      Math.hypot(transition.redDeltaU[0], transition.redDeltaV[0]),
      6,
    ),
    redQualifies: Boolean(transition.redQualifies[0]),
    changedForMotion: motion.changedPixels === 1,
    luminanceDifference: round(
      Math.abs(second.luminance[0] - first.luminance[0]),
      6,
    ),
  };
}

export function maxEventsInRollingWindow(timesInput, windowMs = 1_000) {
  if (
    !Array.isArray(timesInput) ||
    !Number.isFinite(windowMs) ||
    windowMs <= 0
  ) {
    throw new TypeError(
      "A timestamp array and positive rolling-window length are required.",
    );
  }
  const times = timesInput.map((time) => finiteNumber(time));
  if (
    times.some(
      (time, index) => time < 0 || (index > 0 && time < times[index - 1]),
    )
  ) {
    throw new RangeError(
      "Event timestamps must be finite, non-negative, and ordered.",
    );
  }
  let start = 0;
  let maximum = 0;
  for (let end = 0; end < times.length; end += 1) {
    while (times[end] - times[start] > windowMs) start += 1;
    maximum = Math.max(maximum, end - start + 1);
  }
  return maximum;
}

function eventCountEndingAt(times, endTimeMs, windowMs = 1_000) {
  let count = 0;
  for (let index = times.length - 1; index >= 0; index -= 1) {
    if (endTimeMs - times[index] > windowMs) break;
    count += 1;
  }
  return count;
}

export function assessMappedArea(
  affectedAreaFractionInput,
  displayWidthInput,
  displayHeightInput,
) {
  const affectedAreaFraction = finiteNumber(affectedAreaFractionInput);
  const displayWidth = Math.floor(finiteNumber(displayWidthInput));
  const displayHeight = Math.floor(finiteNumber(displayHeightInput));
  if (
    affectedAreaFraction < 0 ||
    affectedAreaFraction > 1 ||
    !Number.isSafeInteger(displayWidth) ||
    !Number.isSafeInteger(displayHeight) ||
    displayWidth < 1 ||
    displayHeight < 1
  ) {
    throw new RangeError(
      "Mapped-area inputs must be a 0–1 fraction and positive CSS-pixel dimensions.",
    );
  }
  const estimatedCssPixels =
    affectedAreaFraction * displayWidth * displayHeight;
  return {
    estimatedCssPixels: round(estimatedCssPixels, 1),
    atOrAboveSmallAreaBoundary:
      estimatedCssPixels >= FLASH_THRESHOLDS.smallAreaBoundaryCssPixels,
  };
}

export function createFlashMotionAnalyzer({
  displayHeight = null,
  displayWidth = null,
  pixelCount: pixelCountInput,
  sampleRate,
} = {}) {
  const pixelCount = Math.floor(finiteNumber(pixelCountInput));
  if (
    !Number.isSafeInteger(pixelCount) ||
    pixelCount < 1 ||
    pixelCount > FLASH_MOTION_LIMITS.maxWorkingPixels
  ) {
    throw new RangeError("Working pixel count is outside the supported range.");
  }
  const settingsCheck = validateSamplingSettings({
    displayHeight,
    displayWidth,
    sampleRate,
    sourceFps: null,
  });
  if (!settingsCheck.ok) {
    throw new RangeError(settingsCheck.errors.join(" "));
  }

  const expectedIntervalMs = 1_000 / settingsCheck.settings.sampleRate;
  const features = [
    makeFeatureBuffer(pixelCount),
    makeFeatureBuffer(pixelCount),
  ];
  const transition = makeTransitionBuffer(pixelCount);
  const pendingTransition = makeTransitionBuffer(pixelCount);
  const generalTimes = [];
  const redTimes = [];
  const retainedGeneralEvents = [];
  const retainedRedEvents = [];
  const retainedMotionCues = [];
  const retainedGaps = [];
  let featureIndex = 0;
  let frameCount = 0;
  let transitionCount = 0;
  let validTransitionCount = 0;
  let previousTimeMs = null;
  let samplingGapCount = 0;
  let motionCueCount = 0;
  let mappedBoundaryCueCount = 0;
  let maximumGeneralAreaFraction = 0;
  let maximumGeneralFlashEquivalentInOneSecond = 0;
  let maximumRedAreaFraction = 0;
  let maximumRedFlashEquivalentInOneSecond = 0;
  let maximumMotionAreaFraction = 0;
  let maximumMeanLuminanceDifference = 0;

  const mappedArea = (areaFraction) =>
    settingsCheck.settings.displayWidth === null
      ? null
      : assessMappedArea(
          areaFraction,
          settingsCheck.settings.displayWidth,
          settingsCheck.settings.displayHeight,
        );

  return {
    ingest({ rgba, timeMs: timeMsInput } = {}) {
      const timeMs = finiteNumber(timeMsInput);
      if (
        !Number.isFinite(timeMs) ||
        timeMs < 0 ||
        (previousTimeMs !== null && timeMs <= previousTimeMs)
      ) {
        throw new RangeError(
          "Sample timestamps must be finite, non-negative, and increasing.",
        );
      }
      if (rgbaPixelCount(rgba) !== pixelCount) {
        throw new RangeError("Sampled frame dimensions do not match.");
      }
      if (frameCount >= FLASH_MOTION_LIMITS.maxSampledFrames) {
        throw new RangeError("The sampled-frame safety cap was reached.");
      }

      const currentFeatureIndex = featureIndex;
      populateFeatures(rgba, features[currentFeatureIndex]);
      frameCount += 1;

      if (previousTimeMs === null) {
        previousTimeMs = timeMs;
        featureIndex = 1 - featureIndex;
        return;
      }

      const previousFeatureIndex = 1 - currentFeatureIndex;
      const intervalMs = timeMs - previousTimeMs;
      const gap =
        intervalMs > expectedIntervalMs * FLASH_MOTION_LIMITS.maximumGapRatio;
      transitionCount += 1;

      if (gap) {
        samplingGapCount += 1;
        if (retainedGaps.length < FLASH_MOTION_LIMITS.maxRetainedGaps) {
          retainedGaps.push({
            fromTimeMs: round(previousTimeMs, 1),
            toTimeMs: round(timeMs, 1),
            intervalMs: round(intervalMs, 1),
          });
        }
        pendingTransition.generalDirection.fill(0);
        pendingTransition.generalTimeMs.fill(0);
        pendingTransition.redQualifies.fill(0);
        pendingTransition.redDeltaU.fill(0);
        pendingTransition.redDeltaV.fill(0);
        pendingTransition.redTimeMs.fill(0);
      } else {
        const motion = fillTransition(
          features[previousFeatureIndex],
          features[currentFeatureIndex],
          transition,
        );
        validTransitionCount += 1;
        maximumMotionAreaFraction = Math.max(
          maximumMotionAreaFraction,
          motion.changedAreaFraction,
        );
        maximumMeanLuminanceDifference = Math.max(
          maximumMeanLuminanceDifference,
          motion.meanAbsoluteLuminanceDifference,
        );
        if (
          motion.changedAreaFraction >= FLASH_THRESHOLDS.largeMotionAreaFraction
        ) {
          motionCueCount += 1;
          if (
            retainedMotionCues.length < FLASH_MOTION_LIMITS.maxRetainedEvents
          ) {
            retainedMotionCues.push({
              timeMs: round(timeMs, 1),
              affectedAreaFraction: round(motion.changedAreaFraction, 5),
              meanAbsoluteLuminanceDifference: round(
                motion.meanAbsoluteLuminanceDifference,
                5,
              ),
            });
          }
        }

        const pairs = consumeOpposingTransitions(
          pendingTransition,
          transition,
          timeMs,
        );
        const generalAreaFraction = pairs.generalPixels / pixelCount;
        const redAreaFraction = pairs.redPixels / pixelCount;
        maximumGeneralAreaFraction = Math.max(
          maximumGeneralAreaFraction,
          generalAreaFraction,
        );
        maximumRedAreaFraction = Math.max(
          maximumRedAreaFraction,
          redAreaFraction,
        );

        if (pairs.generalPixels > 0) {
          const mapped = mappedArea(generalAreaFraction);
          generalTimes.push(timeMs);
          if (mapped?.atOrAboveSmallAreaBoundary) {
            mappedBoundaryCueCount += 1;
          }
          if (
            retainedGeneralEvents.length < FLASH_MOTION_LIMITS.maxRetainedEvents
          ) {
            retainedGeneralEvents.push({
              timeMs: round(timeMs, 1),
              affectedAreaFraction: round(generalAreaFraction, 5),
              estimatedCssPixels: mapped?.estimatedCssPixels ?? null,
            });
          }
        }
        if (pairs.redPixels > 0) {
          const mapped = mappedArea(redAreaFraction);
          redTimes.push(timeMs);
          if (mapped?.atOrAboveSmallAreaBoundary) {
            mappedBoundaryCueCount += 1;
          }
          if (
            retainedRedEvents.length < FLASH_MOTION_LIMITS.maxRetainedEvents
          ) {
            retainedRedEvents.push({
              timeMs: round(timeMs, 1),
              affectedAreaFraction: round(redAreaFraction, 5),
              estimatedCssPixels: mapped?.estimatedCssPixels ?? null,
            });
          }
        }
        maximumGeneralFlashEquivalentInOneSecond = Math.max(
          maximumGeneralFlashEquivalentInOneSecond,
          eventCountEndingAt(generalTimes, timeMs) +
            (pairs.generalPendingInWindow ? 0.5 : 0),
        );
        maximumRedFlashEquivalentInOneSecond = Math.max(
          maximumRedFlashEquivalentInOneSecond,
          eventCountEndingAt(redTimes, timeMs) +
            (pairs.redPendingInWindow ? 0.5 : 0),
        );
      }

      previousTimeMs = timeMs;
      featureIndex = 1 - featureIndex;
    },

    finish() {
      if (frameCount < 2) {
        throw new RangeError("At least two sampled frames are required.");
      }
      const maximumGeneralTransitionEquivalentCountInOneSecond =
        maximumGeneralFlashEquivalentInOneSecond * 2;
      const maximumRedTransitionEquivalentCountInOneSecond =
        maximumRedFlashEquivalentInOneSecond * 2;
      return {
        frameCount,
        transitionCount,
        validTransitionCount,
        expectedIntervalMs: round(expectedIntervalMs, 3),
        samplingGapCount,
        samplingGaps: retainedGaps,
        generalFlashPairCount: generalTimes.length,
        redFlashPairCount: redTimes.length,
        maximumGeneralPairsInOneSecond: maxEventsInRollingWindow(generalTimes),
        maximumRedPairsInOneSecond: maxEventsInRollingWindow(redTimes),
        maximumGeneralTransitionEquivalentCountInOneSecond,
        maximumRedTransitionEquivalentCountInOneSecond,
        maximumGeneralFlashEquivalentInOneSecond: round(
          maximumGeneralFlashEquivalentInOneSecond,
          1,
        ),
        maximumRedFlashEquivalentInOneSecond: round(
          maximumRedFlashEquivalentInOneSecond,
          1,
        ),
        generalEvents: retainedGeneralEvents,
        redEvents: retainedRedEvents,
        maximumGeneralAreaFraction: round(maximumGeneralAreaFraction, 5),
        maximumRedAreaFraction: round(maximumRedAreaFraction, 5),
        mappedBoundaryCueCount,
        motionCueCount,
        motionCues: retainedMotionCues,
        maximumMotionAreaFraction: round(maximumMotionAreaFraction, 5),
        maximumMeanLuminanceDifference: round(
          maximumMeanLuminanceDifference,
          5,
        ),
        retainedEventLimit: FLASH_MOTION_LIMITS.maxRetainedEvents,
      };
    },
  };
}

export function analyzeSampledFrames(
  frames,
  { displayHeight = null, displayWidth = null, sampleRate } = {},
) {
  if (!Array.isArray(frames) || frames.length < 2) {
    throw new TypeError("At least two sampled frames are required.");
  }
  const pixelCount = rgbaPixelCount(frames[0]?.rgba);
  const analyzer = createFlashMotionAnalyzer({
    displayHeight,
    displayWidth,
    pixelCount,
    sampleRate,
  });
  frames.forEach((frame) => analyzer.ingest(frame));
  return analyzer.finish();
}

export function buildSamplingWarnings({ sampleRate, sourceFps } = {}) {
  const validation = validateSamplingSettings({
    sampleRate,
    sourceFps,
  });
  if (!validation.ok) return validation.errors;
  const warnings = [
    "Paused seeking is sparse, not time-continuous analysis; unsampled and sub-frame flashes can be missed.",
    "The screen compares consecutive samples rather than reconstructing continuous peaks and valleys, so gradual or multi-frame transitions can be missed.",
    "Browser decoding, color conversion, downscaling, HDR handling, transparency, and seek precision can change measurements.",
  ];
  if (validation.settings.sourceFps === null) {
    warnings.unshift(
      "Source frame rate is unknown, so the selected sample rate may be below the source frame rate.",
    );
  } else if (validation.settings.sampleRate < validation.settings.sourceFps) {
    warnings.unshift(
      `Sampling at ${validation.settings.sampleRate} fps is below the declared ${validation.settings.sourceFps} fps source; flashes between samples can be missed.`,
    );
  }
  return warnings;
}

export function buildCountsTimingReport({
  durationMs,
  result,
  sampleRate,
} = {}) {
  if (!result) return null;
  const cleanTimes = (events) =>
    Array.isArray(events)
      ? events
          .slice(0, FLASH_MOTION_LIMITS.maxRetainedEvents)
          .map(({ timeMs }) => ({ timeMs: round(finiteNumber(timeMs), 1) }))
      : [];

  return {
    schemaVersion: FLASH_MOTION_REPORT_SCHEMA,
    reportKind: "counts-and-timings-only",
    durationMs: round(finiteNumber(durationMs), 1),
    requestedSampleRateFps: finiteNumber(sampleRate),
    sampledFrameCount: finiteNumber(result.frameCount, 0),
    comparedTransitionCount: finiteNumber(result.validTransitionCount, 0),
    samplingGapCount: finiteNumber(result.samplingGapCount, 0),
    generalFlashPairCueCount: finiteNumber(result.generalFlashPairCount, 0),
    redFlashPairCueCount: finiteNumber(result.redFlashPairCount, 0),
    maximumGeneralPairCuesInRollingSecond: finiteNumber(
      result.maximumGeneralPairsInOneSecond,
      0,
    ),
    maximumRedPairCuesInRollingSecond: finiteNumber(
      result.maximumRedPairsInOneSecond,
      0,
    ),
    maximumGeneralTransitionEquivalentCountInRollingSecond: finiteNumber(
      result.maximumGeneralTransitionEquivalentCountInOneSecond,
      0,
    ),
    maximumRedTransitionEquivalentCountInRollingSecond: finiteNumber(
      result.maximumRedTransitionEquivalentCountInOneSecond,
      0,
    ),
    maximumGeneralTransitionEquivalentFlashesInRollingSecond: finiteNumber(
      result.maximumGeneralFlashEquivalentInOneSecond,
      0,
    ),
    maximumRedTransitionEquivalentFlashesInRollingSecond: finiteNumber(
      result.maximumRedFlashEquivalentInOneSecond,
      0,
    ),
    largeFrameChangeCueCount: finiteNumber(result.motionCueCount, 0),
    mappedAreaBoundaryCueCount: finiteNumber(result.mappedBoundaryCueCount, 0),
    generalCueTimings: cleanTimes(result.generalEvents),
    redCueTimings: cleanTimes(result.redEvents),
    largeFrameChangeCueTimings: cleanTimes(result.motionCues),
    limitations: [
      "Sampled screening only; this report is not a safety, medical, or WCAG determination.",
      "The report intentionally excludes filenames, pixel data, frames, images, and thumbnails.",
    ],
  };
}
