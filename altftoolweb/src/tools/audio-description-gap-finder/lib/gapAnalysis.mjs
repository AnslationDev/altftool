export const LIMITS = Object.freeze({
  maxMediaBytes: 30 * 1024 * 1024,
  maxDurationSeconds: 10 * 60,
  maxChannels: 2,
  minSampleRate: 8_000,
  maxSampleRate: 96_000,
  maxSampleValues: 24_000_000,
  maxCaptionBytes: 1024 * 1024,
  maxCaptionCharacters: 500_000,
  maxCueTimings: 5_000,
  maxWindows: 30_000,
  maxSamplesPerChannelWindow: 4_096,
  maxReturnedCandidates: 200,
});

export const DEFAULT_SETTINGS = Object.freeze({
  windowMs: 250,
  quietThresholdDbfs: -42,
  minimumGapMs: 1_200,
  bridgeMs: 0,
  dialoguePaddingMs: 150,
  boundaryGuardMs: 250,
});

const MEDIA_EXTENSIONS = new Set([
  "aac",
  "flac",
  "m4a",
  "mp3",
  "mp4",
  "oga",
  "ogg",
  "opus",
  "wav",
  "webm",
]);

function round(value, digits = 1) {
  const power = 10 ** digits;
  return Math.round((value + Number.EPSILON) * power) / power;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function extensionOf(name) {
  const match = String(name || "")
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/u);
  return match?.[1] || "";
}

export function validateMediaFile(file) {
  if (!file) {
    return { ok: false, error: "Choose a local audio or video file." };
  }

  const size = Number(file.size);
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, error: "The selected media file is empty." };
  }
  if (size > LIMITS.maxMediaBytes) {
    return {
      ok: false,
      error: "Choose an audio or video file no larger than 30 MB.",
    };
  }

  const type = String(file.type || "").toLowerCase();
  const extension = extensionOf(file.name);
  if (
    !type.startsWith("audio/") &&
    !type.startsWith("video/") &&
    !MEDIA_EXTENSIONS.has(extension)
  ) {
    return {
      ok: false,
      error: "Choose a recognizable audio or video file.",
    };
  }

  return { ok: true, size };
}

export function validateDecodedAudio(metadata) {
  const duration = Number(metadata?.duration);
  const sampleRate = Number(metadata?.sampleRate);
  const numberOfChannels = Number(metadata?.numberOfChannels);
  const length = Number(metadata?.length);
  const errors = [];

  if (!Number.isFinite(duration) || duration <= 0) {
    errors.push("Decoded duration must be greater than zero.");
  } else if (duration > LIMITS.maxDurationSeconds) {
    errors.push("Decoded media exceeds the 10-minute duration limit.");
  }

  if (
    !Number.isInteger(numberOfChannels) ||
    numberOfChannels < 1 ||
    numberOfChannels > LIMITS.maxChannels
  ) {
    errors.push("Decoded media must contain 1 or 2 audio channels.");
  }

  if (
    !Number.isFinite(sampleRate) ||
    sampleRate < LIMITS.minSampleRate ||
    sampleRate > LIMITS.maxSampleRate
  ) {
    errors.push("Decoded sample rate must be between 8 kHz and 96 kHz.");
  }

  if (!Number.isInteger(length) || length < 1) {
    errors.push("Decoded media has no usable audio samples.");
  }

  const sampleValues =
    Number.isInteger(length) && Number.isInteger(numberOfChannels)
      ? length * numberOfChannels
      : Number.NaN;
  if (
    !Number.isSafeInteger(sampleValues) ||
    sampleValues > LIMITS.maxSampleValues
  ) {
    errors.push("Decoded media exceeds the 24,000,000 sample-value limit.");
  }

  if (
    Number.isFinite(duration) &&
    Number.isFinite(sampleRate) &&
    Number.isInteger(length) &&
    duration > 0 &&
    sampleRate > 0 &&
    Math.abs(length / sampleRate - duration) > 1
  ) {
    errors.push("Decoded sample length and duration are inconsistent.");
  }

  return {
    ok: errors.length === 0,
    errors,
    duration,
    durationMs: Math.round(duration * 1_000),
    sampleRate,
    numberOfChannels,
    length,
    sampleValues,
  };
}

export function validateSettings(input = DEFAULT_SETTINGS) {
  const settings = {
    windowMs: Number(input.windowMs),
    quietThresholdDbfs: Number(input.quietThresholdDbfs),
    minimumGapMs: Number(input.minimumGapMs),
    bridgeMs: Number(input.bridgeMs),
    dialoguePaddingMs: Number(input.dialoguePaddingMs),
    boundaryGuardMs: Number(input.boundaryGuardMs),
  };
  const errors = [];

  if (
    !Number.isFinite(settings.windowMs) ||
    settings.windowMs < 50 ||
    settings.windowMs > 2_000
  ) {
    errors.push("RMS window must be between 50 and 2,000 milliseconds.");
  }
  if (
    !Number.isFinite(settings.quietThresholdDbfs) ||
    settings.quietThresholdDbfs < -90 ||
    settings.quietThresholdDbfs > -6
  ) {
    errors.push("Quiet threshold must be between -90 and -6 dBFS.");
  }
  if (
    !Number.isFinite(settings.minimumGapMs) ||
    settings.minimumGapMs < 250 ||
    settings.minimumGapMs > 60_000
  ) {
    errors.push("Minimum gap must be between 250 and 60,000 milliseconds.");
  }
  if (
    !Number.isFinite(settings.bridgeMs) ||
    settings.bridgeMs < 0 ||
    settings.bridgeMs > 2_000
  ) {
    errors.push("Bridge allowance must be between 0 and 2,000 milliseconds.");
  }
  if (
    !Number.isFinite(settings.dialoguePaddingMs) ||
    settings.dialoguePaddingMs < 0 ||
    settings.dialoguePaddingMs > 5_000
  ) {
    errors.push("Dialogue padding must be between 0 and 5,000 milliseconds.");
  }
  if (
    !Number.isFinite(settings.boundaryGuardMs) ||
    settings.boundaryGuardMs < 0 ||
    settings.boundaryGuardMs > 5_000
  ) {
    errors.push("Media-edge guard must be between 0 and 5,000 milliseconds.");
  }

  const projectedWindows =
    LIMITS.maxDurationSeconds * (1_000 / settings.windowMs);
  if (
    Number.isFinite(projectedWindows) &&
    projectedWindows > LIMITS.maxWindows
  ) {
    errors.push("RMS window is too small for the maximum supported duration.");
  }

  return { ok: errors.length === 0, errors, settings };
}

export function rmsToDbfs(rms) {
  if (!Number.isFinite(rms) || rms <= 0) return -120;
  return round(clamp(20 * Math.log10(rms), -120, 0), 1);
}

export function computeRmsWindows(
  channels,
  sampleRate,
  windowMs,
  maximumSamplesPerChannelWindow = LIMITS.maxSamplesPerChannelWindow,
) {
  if (!Array.isArray(channels) || channels.length < 1) {
    throw new Error("At least one PCM channel is required.");
  }
  if (
    !Number.isFinite(sampleRate) ||
    sampleRate < LIMITS.minSampleRate ||
    sampleRate > LIMITS.maxSampleRate
  ) {
    throw new Error("Sample rate is outside the supported range.");
  }
  if (!Number.isFinite(windowMs) || windowMs < 50 || windowMs > 2_000) {
    throw new Error("RMS window is outside the supported range.");
  }

  const length = channels[0]?.length;
  if (!Number.isInteger(length) || length < 1) {
    throw new Error("PCM channels must contain samples.");
  }
  if (
    channels.length > LIMITS.maxChannels ||
    channels.some(
      (channel) =>
        !channel ||
        !Number.isInteger(channel.length) ||
        channel.length !== length,
    )
  ) {
    throw new Error("PCM channels must have matching supported lengths.");
  }
  if (
    !Number.isInteger(maximumSamplesPerChannelWindow) ||
    maximumSamplesPerChannelWindow < 1
  ) {
    throw new Error("RMS sampling bound must be a positive whole number.");
  }

  const samplesPerWindow = Math.max(
    1,
    Math.round((sampleRate * windowMs) / 1_000),
  );
  const windowCount = Math.ceil(length / samplesPerWindow);
  if (windowCount > LIMITS.maxWindows) {
    throw new Error("PCM data would create too many RMS windows.");
  }

  const windows = [];
  for (
    let startSample = 0;
    startSample < length;
    startSample += samplesPerWindow
  ) {
    const endSample = Math.min(length, startSample + samplesPerWindow);
    const samplesInWindow = endSample - startSample;
    const stride = Math.max(
      1,
      Math.ceil(samplesInWindow / maximumSamplesPerChannelWindow),
    );
    let squareSum = 0;
    let sampledValues = 0;

    for (const channel of channels) {
      for (let index = startSample; index < endSample; index += stride) {
        const sample = Number(channel[index]);
        const safeSample = Number.isFinite(sample) ? clamp(sample, -1, 1) : 0;
        squareSum += safeSample * safeSample;
        sampledValues += 1;
      }
    }

    const meanSquare = sampledValues ? squareSum / sampledValues : 0;
    const rms = Math.sqrt(meanSquare);
    windows.push({
      startMs: Math.round((startSample / sampleRate) * 1_000),
      endMs: Math.round((endSample / sampleRate) * 1_000),
      meanSquare,
      rms,
      dbfs: rmsToDbfs(rms),
      sampledValues,
      stride,
    });
  }

  return windows;
}

function addQuietWindow(interval, window) {
  const durationMs = Math.max(0, window.endMs - window.startMs);
  interval.endMs = window.endMs;
  interval.quietDurationMs += durationMs;
  interval.weightedMeanSquare += window.meanSquare * durationMs;
  interval.quietWindowCount += 1;
  interval.maximumDbfs = Math.max(interval.maximumDbfs, window.dbfs);
}

function finalizeQuietInterval(interval) {
  const meanSquare = interval.quietDurationMs
    ? interval.weightedMeanSquare / interval.quietDurationMs
    : 0;
  return {
    startMs: interval.startMs,
    endMs: interval.endMs,
    durationMs: interval.endMs - interval.startMs,
    quietDurationMs: interval.quietDurationMs,
    bridgedMs: interval.endMs - interval.startMs - interval.quietDurationMs,
    quietWindowCount: interval.quietWindowCount,
    meanDbfs: rmsToDbfs(Math.sqrt(meanSquare)),
    maximumDbfs: interval.maximumDbfs,
  };
}

export function findQuietIntervals(windows, quietThresholdDbfs, bridgeMs = 0) {
  if (!Array.isArray(windows)) return [];
  if (!Number.isFinite(quietThresholdDbfs)) {
    throw new Error("Quiet threshold must be finite.");
  }
  if (!Number.isFinite(bridgeMs) || bridgeMs < 0) {
    throw new Error("Bridge allowance must be zero or greater.");
  }

  const quietWindows = windows.filter(
    (window) =>
      window &&
      Number.isFinite(window.startMs) &&
      Number.isFinite(window.endMs) &&
      window.endMs > window.startMs &&
      Number.isFinite(window.dbfs) &&
      window.dbfs <= quietThresholdDbfs,
  );
  const intervals = [];
  let current = null;

  for (const window of quietWindows) {
    if (!current || window.startMs - current.endMs > bridgeMs) {
      if (current) intervals.push(finalizeQuietInterval(current));
      current = {
        startMs: window.startMs,
        endMs: window.endMs,
        quietDurationMs: 0,
        weightedMeanSquare: 0,
        quietWindowCount: 0,
        maximumDbfs: -120,
      };
    }
    addQuietWindow(current, window);
  }
  if (current) intervals.push(finalizeQuietInterval(current));
  return intervals;
}

export function mergeIntervals(intervals, toleranceMs = 0) {
  if (!Array.isArray(intervals) || !intervals.length) return [];
  if (!Number.isFinite(toleranceMs) || toleranceMs < 0) {
    throw new Error("Interval tolerance must be zero or greater.");
  }

  const valid = intervals
    .map((interval) => ({
      startMs: Number(interval?.startMs),
      endMs: Number(interval?.endMs),
    }))
    .filter(
      (interval) =>
        Number.isFinite(interval.startMs) &&
        Number.isFinite(interval.endMs) &&
        interval.startMs >= 0 &&
        interval.endMs > interval.startMs,
    )
    .sort(
      (left, right) => left.startMs - right.startMs || left.endMs - right.endMs,
    );
  const merged = [];

  for (const interval of valid) {
    const previous = merged.at(-1);
    if (previous && interval.startMs <= previous.endMs + toleranceMs) {
      previous.endMs = Math.max(previous.endMs, interval.endMs);
      previous.sourceIntervals += 1;
    } else {
      merged.push({ ...interval, sourceIntervals: 1 });
    }
  }
  return merged;
}

export function parseTimeToken(value) {
  const clean = String(value || "").trim();
  if (/^\d+(?:\.\d{1,3})?$/u.test(clean)) {
    return Math.round(Number(clean) * 1_000);
  }

  const match = clean.match(
    /^(?:(\d+):)?([0-5]?\d):([0-5]\d)(?:[,.](\d{1,3}))?$/u,
  );
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const fraction = String(match[4] || "").padEnd(3, "0");
  const milliseconds = Number(fraction || 0);
  const result = ((hours * 60 + minutes) * 60 + seconds) * 1_000 + milliseconds;
  return Number.isSafeInteger(result) ? result : null;
}

function timingFromLine(line) {
  const arrowMatch = line.match(/^(.+?)\s*-->\s*(\S+)(?:\s+.*)?$/u);
  if (arrowMatch) {
    return {
      kind: "arrow",
      startMs: parseTimeToken(arrowMatch[1]),
      endMs: parseTimeToken(arrowMatch[2]),
    };
  }
  if (line.includes("-->")) {
    return { kind: "malformed", startMs: null, endMs: null };
  }

  const manualMatch = line.match(
    /^\s*(\d+(?:\.\d{1,3})?)\s*[,;\t]\s*(\d+(?:\.\d{1,3})?)\s*$/u,
  );
  if (manualMatch) {
    return {
      kind: "manual",
      startMs: parseTimeToken(manualMatch[1]),
      endMs: parseTimeToken(manualMatch[2]),
    };
  }
  return null;
}

export function parseDialogueCues(
  source,
  durationMs = Number.POSITIVE_INFINITY,
) {
  const normalized = String(source || "")
    .replace(/^\uFEFF/u, "")
    .replace(/\r\n?/gu, "\n");
  if (normalized.length > LIMITS.maxCaptionCharacters) {
    return {
      ok: false,
      error: "Caption input exceeds the 500,000-character safety limit.",
    };
  }
  if (!Number.isFinite(durationMs) && durationMs !== Number.POSITIVE_INFINITY) {
    return { ok: false, error: "Media duration is invalid." };
  }

  const cues = [];
  let malformedTimings = 0;
  let ignoredLines = 0;
  let outOfRangeTimings = 0;
  let timingLines = 0;
  let arrowTimings = 0;
  let manualTimings = 0;

  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trim();
    if (!line || /^WEBVTT(?:\s|$)/iu.test(line)) continue;
    const timing = timingFromLine(line);
    if (!timing) {
      ignoredLines += 1;
      continue;
    }

    timingLines += 1;
    if (timingLines > LIMITS.maxCueTimings) {
      return {
        ok: false,
        error: "Caption input exceeds the 5,000 cue-timing limit.",
      };
    }
    if (timing.kind === "arrow") arrowTimings += 1;
    if (timing.kind === "manual") manualTimings += 1;

    if (
      !Number.isFinite(timing.startMs) ||
      !Number.isFinite(timing.endMs) ||
      timing.startMs < 0 ||
      timing.endMs <= timing.startMs
    ) {
      malformedTimings += 1;
      continue;
    }

    const clippedStart = Math.max(0, timing.startMs);
    const clippedEnd = Math.min(durationMs, timing.endMs);
    if (clippedEnd <= clippedStart) {
      outOfRangeTimings += 1;
      continue;
    }
    cues.push({ startMs: clippedStart, endMs: clippedEnd });
  }

  const sorted = cues
    .slice()
    .sort(
      (left, right) => left.startMs - right.startMs || left.endMs - right.endMs,
    );
  let overlapPairs = 0;
  let runningEnd = -1;
  for (const cue of sorted) {
    if (cue.startMs < runningEnd) overlapPairs += 1;
    runningEnd = Math.max(runningEnd, cue.endMs);
  }

  const merged = mergeIntervals(sorted);
  const format =
    arrowTimings && manualTimings
      ? "mixed"
      : manualTimings
        ? "manual-seconds"
        : arrowTimings
          ? "srt-or-vtt"
          : "none";

  return {
    ok: true,
    format,
    cues: sorted,
    merged,
    timingLines,
    validTimings: sorted.length,
    malformedTimings,
    ignoredLines,
    outOfRangeTimings,
    overlapPairs,
  };
}

export function padDialogueIntervals(intervals, paddingMs, durationMs) {
  if (!Number.isFinite(paddingMs) || paddingMs < 0) {
    throw new Error("Dialogue padding must be zero or greater.");
  }
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error("Media duration must be greater than zero.");
  }
  return mergeIntervals(
    (intervals || []).map((interval) => ({
      startMs: clamp(interval.startMs - paddingMs, 0, durationMs),
      endMs: clamp(interval.endMs + paddingMs, 0, durationMs),
    })),
  );
}

function overlaps(left, right) {
  return left.startMs < right.endMs && right.startMs < left.endMs;
}

function isNearDialogue(segment, dialogueIntervals, toleranceMs) {
  return dialogueIntervals.some(
    (dialogue) =>
      Math.abs(segment.startMs - dialogue.endMs) <= toleranceMs ||
      Math.abs(dialogue.startMs - segment.endMs) <= toleranceMs,
  );
}

export function subtractDialogueIntervals(
  quietIntervals,
  dialogueIntervals,
  minimumGapMs,
  durationMs,
  boundaryGuardMs = 0,
) {
  const candidates = [];
  for (const [quietIndex, quiet] of (quietIntervals || []).entries()) {
    let segments = [
      {
        startMs: quiet.startMs,
        endMs: quiet.endMs,
        dialogueTrimmed: false,
      },
    ];

    for (const dialogue of dialogueIntervals || []) {
      const next = [];
      for (const segment of segments) {
        if (!overlaps(segment, dialogue)) {
          next.push(segment);
          continue;
        }
        if (dialogue.startMs > segment.startMs) {
          next.push({
            startMs: segment.startMs,
            endMs: Math.min(dialogue.startMs, segment.endMs),
            dialogueTrimmed: true,
          });
        }
        if (dialogue.endMs < segment.endMs) {
          next.push({
            startMs: Math.max(dialogue.endMs, segment.startMs),
            endMs: segment.endMs,
            dialogueTrimmed: true,
          });
        }
      }
      segments = next;
      if (!segments.length) break;
    }

    for (const segment of segments) {
      const duration = segment.endMs - segment.startMs;
      if (duration < minimumGapMs) continue;
      candidates.push({
        ...segment,
        durationMs: duration,
        sourceQuietInterval: quietIndex + 1,
        meanDbfs: quiet.meanDbfs,
        maximumDbfs: quiet.maximumDbfs,
        bridgedMs: quiet.bridgedMs || 0,
        nearMediaBoundary:
          segment.startMs < boundaryGuardMs ||
          durationMs - segment.endMs < boundaryGuardMs,
        nearDialogue: isNearDialogue(
          segment,
          dialogueIntervals || [],
          Math.max(250, boundaryGuardMs),
        ),
      });
    }
  }
  return candidates;
}

export function rankCandidateGaps(candidates) {
  return (candidates || [])
    .map((candidate) => {
      const durationScore = Math.min(candidate.durationMs / 1_000, 30) * 4;
      const quietScore = clamp((-candidate.meanDbfs - 20) * 1.5, 0, 90);
      const penalty =
        (candidate.nearMediaBoundary ? 12 : 0) +
        (candidate.dialogueTrimmed ? 8 : 0) +
        (candidate.nearDialogue ? 5 : 0) +
        (candidate.bridgedMs > 0 ? 5 : 0);
      return {
        ...candidate,
        planningScore: Math.max(
          0,
          Math.round(durationScore + quietScore - penalty),
        ),
      };
    })
    .sort(
      (left, right) =>
        right.planningScore - left.planningScore ||
        right.durationMs - left.durationMs ||
        left.startMs - right.startMs,
    )
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}

export function analyzePcmChannels({
  channels,
  sampleRate,
  settings = DEFAULT_SETTINGS,
  dialogueSource = "",
}) {
  const validatedSettings = validateSettings(settings);
  if (!validatedSettings.ok) {
    return {
      ok: false,
      error: validatedSettings.errors.join(" "),
      errors: validatedSettings.errors,
    };
  }

  const length = channels?.[0]?.length;
  const metadata = validateDecodedAudio({
    duration: length / sampleRate,
    sampleRate,
    numberOfChannels: channels?.length,
    length,
  });
  if (!metadata.ok) {
    return {
      ok: false,
      error: metadata.errors.join(" "),
      errors: metadata.errors,
    };
  }

  const parsedDialogue = parseDialogueCues(dialogueSource, metadata.durationMs);
  if (!parsedDialogue.ok) return parsedDialogue;

  const windows = computeRmsWindows(
    channels,
    sampleRate,
    validatedSettings.settings.windowMs,
  );
  const quietIntervals = findQuietIntervals(
    windows,
    validatedSettings.settings.quietThresholdDbfs,
    validatedSettings.settings.bridgeMs,
  );
  const paddedDialogue = padDialogueIntervals(
    parsedDialogue.merged,
    validatedSettings.settings.dialoguePaddingMs,
    metadata.durationMs,
  );
  const unranked = subtractDialogueIntervals(
    quietIntervals,
    paddedDialogue,
    validatedSettings.settings.minimumGapMs,
    metadata.durationMs,
    validatedSettings.settings.boundaryGuardMs,
  );
  const allCandidates = rankCandidateGaps(unranked);
  const candidates = allCandidates.slice(0, LIMITS.maxReturnedCandidates);

  return {
    ok: true,
    metadata,
    settings: validatedSettings.settings,
    dialogue: {
      format: parsedDialogue.format,
      timingLines: parsedDialogue.timingLines,
      validTimings: parsedDialogue.validTimings,
      malformedTimings: parsedDialogue.malformedTimings,
      ignoredLines: parsedDialogue.ignoredLines,
      outOfRangeTimings: parsedDialogue.outOfRangeTimings,
      overlapPairs: parsedDialogue.overlapPairs,
      mergedIntervals: paddedDialogue.length,
    },
    summary: {
      rmsWindows: windows.length,
      quietIntervals: quietIntervals.length,
      candidateGaps: allCandidates.length,
      returnedCandidates: candidates.length,
      candidatesNearBoundary: allCandidates.filter(
        (candidate) => candidate.nearMediaBoundary,
      ).length,
      candidatesNearDialogue: allCandidates.filter(
        (candidate) => candidate.nearDialogue,
      ).length,
      truncated: allCandidates.length > candidates.length,
    },
    candidates,
  };
}

export function buildCountsTimingReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;
  return {
    reportType: "audio-description-gap-counts-timing-only",
    generatedAt,
    mediaTiming: {
      durationMs: result.metadata.durationMs,
    },
    settings: {
      windowMs: result.settings.windowMs,
      quietThresholdDbfs: result.settings.quietThresholdDbfs,
      minimumGapMs: result.settings.minimumGapMs,
      bridgeMs: result.settings.bridgeMs,
      dialoguePaddingMs: result.settings.dialoguePaddingMs,
      boundaryGuardMs: result.settings.boundaryGuardMs,
    },
    dialogueCounts: {
      timingLines: result.dialogue.timingLines,
      validTimings: result.dialogue.validTimings,
      malformedTimings: result.dialogue.malformedTimings,
      outOfRangeTimings: result.dialogue.outOfRangeTimings,
      overlappingPairs: result.dialogue.overlapPairs,
      mergedIntervals: result.dialogue.mergedIntervals,
    },
    summary: { ...result.summary },
    candidateTimings: result.candidates.map((candidate) => ({
      rank: candidate.rank,
      startMs: candidate.startMs,
      endMs: candidate.endMs,
      durationMs: candidate.durationMs,
      nearMediaBoundary: candidate.nearMediaBoundary,
      nearDialogue: candidate.nearDialogue,
      dialogueTrimmed: candidate.dialogueTrimmed,
    })),
    scope:
      "Timing candidates for human review only; not semantic suitability, generated description, or an accessibility conformance result.",
  };
}

export function formatTime(milliseconds) {
  const safe = Math.max(0, Math.round(Number(milliseconds) || 0));
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  const millis = safe % 1_000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}
