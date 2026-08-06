export const ALIGNMENT_LIMITS = {
  audioBytes: 30 * 1024 * 1024,
  durationSeconds: 10 * 60,
  channels: 2,
  sampleRate: 96_000,
  totalSamples: 24_000_000,
  transcriptCharacters: 1_000_000,
  cues: 5_000,
  findings: 500,
};

export const DEFAULT_ALIGNMENT_SETTINGS = {
  activityThresholdDb: -40,
  windowMilliseconds: 50,
  minimumUncoveredMilliseconds: 250,
  timingToleranceMilliseconds: 500,
  textSimilarityThreshold: 0.85,
};

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeAlignmentSettings(input = {}) {
  return {
    activityThresholdDb: clamp(
      finite(
        input.activityThresholdDb,
        DEFAULT_ALIGNMENT_SETTINGS.activityThresholdDb,
      ),
      -80,
      -6,
    ),
    windowMilliseconds: clamp(
      Math.round(
        finite(
          input.windowMilliseconds,
          DEFAULT_ALIGNMENT_SETTINGS.windowMilliseconds,
        ),
      ),
      20,
      200,
    ),
    minimumUncoveredMilliseconds: clamp(
      Math.round(
        finite(
          input.minimumUncoveredMilliseconds,
          DEFAULT_ALIGNMENT_SETTINGS.minimumUncoveredMilliseconds,
        ),
      ),
      100,
      5_000,
    ),
    timingToleranceMilliseconds: clamp(
      Math.round(
        finite(
          input.timingToleranceMilliseconds,
          DEFAULT_ALIGNMENT_SETTINGS.timingToleranceMilliseconds,
        ),
      ),
      0,
      5_000,
    ),
    textSimilarityThreshold: clamp(
      finite(
        input.textSimilarityThreshold,
        DEFAULT_ALIGNMENT_SETTINGS.textSimilarityThreshold,
      ),
      0.5,
      1,
    ),
  };
}

export function validateAlignmentAudioFile({ type, size } = {}) {
  const mimeType = String(type || "").toLowerCase();
  const bytes = finite(size, -1);
  if (!mimeType.startsWith("audio/")) {
    return {
      ok: false,
      error: "Choose an audio file supported by this browser.",
    };
  }
  if (bytes <= 0) return { ok: false, error: "The audio file is empty." };
  if (bytes > ALIGNMENT_LIMITS.audioBytes) {
    return {
      ok: false,
      error: "Choose an audio file no larger than 30 MB.",
    };
  }
  return { ok: true, mimeType, bytes };
}

export function validateAlignmentAudioBuffer({
  duration,
  numberOfChannels,
  sampleRate,
  length,
} = {}) {
  const safeDuration = finite(duration, -1);
  const channels = Math.floor(finite(numberOfChannels, -1));
  const rate = Math.floor(finite(sampleRate, -1));
  const frames = Math.floor(finite(length, -1));
  if (safeDuration <= 0 || channels <= 0 || rate <= 0 || frames <= 1) {
    return { ok: false, error: "Decoded audio metadata is incomplete." };
  }
  if (
    safeDuration > ALIGNMENT_LIMITS.durationSeconds ||
    channels > ALIGNMENT_LIMITS.channels ||
    rate > ALIGNMENT_LIMITS.sampleRate ||
    frames * channels > ALIGNMENT_LIMITS.totalSamples
  ) {
    return {
      ok: false,
      error:
        "Decoded audio exceeds the 10-minute, stereo, 96 kHz, or 24-million-sample safety limit.",
    };
  }
  return {
    ok: true,
    duration: safeDuration,
    channels,
    sampleRate: rate,
    length: frames,
  };
}

function normalizeSource(value) {
  return String(value || "")
    .replace(/^\uFEFF/u, "")
    .replace(/\r\n?/gu, "\n");
}

function decodeEntity(_match, entity) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  const key = String(entity).toLowerCase();
  if (named[key]) return named[key];
  const numeric = key.startsWith("#x")
    ? Number.parseInt(key.slice(2), 16)
    : key.startsWith("#")
      ? Number.parseInt(key.slice(1), 10)
      : Number.NaN;
  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 0x10ffff)
    return "";
  try {
    return String.fromCodePoint(numeric);
  } catch {
    return "";
  }
}

function visibleText(value) {
  return String(value || "")
    .replace(/<[^>]*>/gu, "")
    .replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/giu, decodeEntity)
    .replace(/\s+/gu, " ")
    .trim();
}

function parseTimestamp(value) {
  const match = String(value || "")
    .trim()
    .match(/^(?:(\d+):)?([0-5]\d):([0-5]\d)[,.](\d{3})$/u);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const milliseconds = Number(match[4]);
  if (![hours, minutes, seconds, milliseconds].every(Number.isFinite))
    return null;
  return ((hours * 60 + minutes) * 60 + seconds) * 1_000 + milliseconds;
}

function blocksFromText(source) {
  const lines = source.split("\n");
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (!line.trim()) {
      if (current.length) blocks.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);
  return blocks;
}

export function parseTimedTranscript(input) {
  const source = normalizeSource(input);
  if (!source.trim()) {
    return {
      ok: false,
      error: "Paste a timed SRT or WebVTT transcript.",
      cues: [],
      issues: [],
    };
  }
  if (source.length > ALIGNMENT_LIMITS.transcriptCharacters) {
    return {
      ok: false,
      error: "Transcript text exceeds the 1,000,000-character safety limit.",
      cues: [],
      issues: [],
    };
  }

  const blocks = blocksFromText(source);
  const cues = [];
  const issues = [];
  let previousStart = -1;

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
    const block = blocks[blockIndex];
    const first = String(block[0] || "").trim();
    if (
      /^WEBVTT(?:\s|$)/iu.test(first) ||
      /^(?:NOTE(?:\s|$)|STYLE$|REGION$)/u.test(first)
    ) {
      continue;
    }
    const timingIndex = block.findIndex((line) => line.includes("-->"));
    if (timingIndex < 0) {
      issues.push({
        code: "missing-timing",
        block: blockIndex + 1,
        message: "A block has no timing line.",
      });
      continue;
    }
    const match = block[timingIndex].match(/^(.+?)\s*-->\s*(\S+)(?:\s+.*)?$/u);
    const startMs = parseTimestamp(match?.[1]);
    const endMs = parseTimestamp(match?.[2]);
    if (startMs === null || endMs === null || endMs <= startMs) {
      issues.push({
        code: "invalid-timing",
        block: blockIndex + 1,
        message: "A block has an invalid or nonpositive time range.",
      });
      continue;
    }
    if (cues.length >= ALIGNMENT_LIMITS.cues) {
      return {
        ok: false,
        error: "Transcript exceeds the 5,000-cue safety limit.",
        cues: [],
        issues,
      };
    }
    const text = visibleText(block.slice(timingIndex + 1).join(" "));
    if (!text) {
      issues.push({
        code: "empty-cue",
        block: blockIndex + 1,
        message: "A timed cue has no visible text.",
      });
    }
    if (startMs < previousStart) {
      issues.push({
        code: "out-of-order",
        block: blockIndex + 1,
        message: "Cue start times are not in source order.",
      });
    }
    previousStart = startMs;
    cues.push({
      number: cues.length + 1,
      block: blockIndex + 1,
      startMs,
      endMs,
      text,
    });
  }

  if (!cues.length) {
    return {
      ok: false,
      error: "No valid timed cues were found.",
      cues: [],
      issues,
    };
  }

  const ordered = [...cues].sort(
    (a, b) => a.startMs - b.startMs || a.endMs - b.endMs || a.number - b.number,
  );
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].startMs < ordered[index - 1].endMs) {
      issues.push({
        code: "overlap",
        block: ordered[index].block,
        message: "Two transcript cues overlap.",
      });
    }
  }

  return {
    ok: true,
    cues,
    issues,
    characters: source.length,
  };
}

function normalizedTokens(value) {
  return (
    String(value || "")
      .toLocaleLowerCase("und")
      .match(/[\p{L}\p{N}]+/gu) || []
  );
}

export function tokenSimilarity(left, right) {
  const leftTokens = normalizedTokens(left);
  const rightTokens = normalizedTokens(right);
  if (!leftTokens.length && !rightTokens.length) return 1;
  if (!leftTokens.length || !rightTokens.length) return 0;
  const counts = new Map();
  for (const token of leftTokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  let overlap = 0;
  for (const token of rightTokens) {
    const available = counts.get(token) || 0;
    if (!available) continue;
    overlap += 1;
    counts.set(token, available - 1);
  }
  return Number(
    ((2 * overlap) / (leftTokens.length + rightTokens.length)).toFixed(4),
  );
}

function overlapMilliseconds(left, right) {
  return Math.max(
    0,
    Math.min(left.endMs, right.endMs) - Math.max(left.startMs, right.startMs),
  );
}

export function compareTimedTranscripts(
  candidateCues,
  referenceCues,
  settingsInput = {},
) {
  const settings = normalizeAlignmentSettings(settingsInput);
  const candidates = [...(candidateCues || [])];
  const references = [...(referenceCues || [])];
  const used = new Set();
  const findings = [];

  for (const reference of references) {
    let bestIndex = -1;
    let bestOverlap = -1;
    let bestStartDelta = Number.POSITIVE_INFINITY;
    candidates.forEach((candidate, index) => {
      if (used.has(index)) return;
      const overlap = overlapMilliseconds(reference, candidate);
      const startDelta = Math.abs(reference.startMs - candidate.startMs);
      if (
        overlap > bestOverlap ||
        (overlap === bestOverlap && startDelta < bestStartDelta)
      ) {
        bestIndex = index;
        bestOverlap = overlap;
        bestStartDelta = startDelta;
      }
    });
    if (
      bestIndex < 0 ||
      (bestOverlap <= 0 &&
        bestStartDelta > settings.timingToleranceMilliseconds)
    ) {
      findings.push({
        code: "reference-unmatched",
        referenceNumber: reference.number,
        candidateNumber: null,
        startMs: reference.startMs,
        endMs: reference.endMs,
        referenceText: reference.text,
        candidateText: "",
        similarity: null,
        message: "No candidate cue aligned with this reference cue.",
      });
      continue;
    }

    used.add(bestIndex);
    const candidate = candidates[bestIndex];
    const similarity = tokenSimilarity(reference.text, candidate.text);
    const startDelta = candidate.startMs - reference.startMs;
    const endDelta = candidate.endMs - reference.endMs;
    if (similarity < settings.textSimilarityThreshold) {
      findings.push({
        code: "text-difference",
        referenceNumber: reference.number,
        candidateNumber: candidate.number,
        startMs: candidate.startMs,
        endMs: candidate.endMs,
        referenceText: reference.text,
        candidateText: candidate.text,
        similarity,
        message:
          "Candidate and reference cue tokens differ beyond the selected screening threshold.",
      });
    }
    if (
      Math.abs(startDelta) > settings.timingToleranceMilliseconds ||
      Math.abs(endDelta) > settings.timingToleranceMilliseconds
    ) {
      findings.push({
        code: "timing-shift",
        referenceNumber: reference.number,
        candidateNumber: candidate.number,
        startMs: candidate.startMs,
        endMs: candidate.endMs,
        startDeltaMs: startDelta,
        endDeltaMs: endDelta,
        referenceText: reference.text,
        candidateText: candidate.text,
        similarity,
        message:
          "Aligned cue boundaries differ beyond the selected timing tolerance.",
      });
    }
  }

  candidates.forEach((candidate, index) => {
    if (used.has(index)) return;
    findings.push({
      code: "candidate-extra",
      referenceNumber: null,
      candidateNumber: candidate.number,
      startMs: candidate.startMs,
      endMs: candidate.endMs,
      referenceText: "",
      candidateText: candidate.text,
      similarity: null,
      message: "This candidate cue was not paired with a reference cue.",
    });
  });

  return {
    settings,
    findings: findings.slice(0, ALIGNMENT_LIMITS.findings),
    findingLimitReached: findings.length > ALIGNMENT_LIMITS.findings,
    counts: {
      unmatchedReference: findings.filter(
        ({ code }) => code === "reference-unmatched",
      ).length,
      extraCandidate: findings.filter(({ code }) => code === "candidate-extra")
        .length,
      textDifference: findings.filter(({ code }) => code === "text-difference")
        .length,
      timingShift: findings.filter(({ code }) => code === "timing-shift")
        .length,
    },
  };
}

function cueCoversWindow(cues, startMs, endMs, startIndex) {
  let index = startIndex;
  while (index < cues.length && cues[index].endMs <= startMs) index += 1;
  const covered =
    index < cues.length &&
    cues[index].startMs < endMs &&
    cues[index].endMs > startMs;
  return { covered, index };
}

function mergeWindows(windows, minimumMilliseconds) {
  const merged = [];
  for (const window of windows) {
    const previous = merged.at(-1);
    if (previous && window.startMs <= previous.endMs + 1) {
      previous.endMs = Math.max(previous.endMs, window.endMs);
      previous.peakDb = Math.max(previous.peakDb, window.db);
    } else {
      merged.push({
        startMs: window.startMs,
        endMs: window.endMs,
        peakDb: window.db,
      });
    }
  }
  return merged.filter(
    ({ startMs, endMs }) => endMs - startMs >= minimumMilliseconds,
  );
}

export function analyzeAudioTranscriptCoverage(
  channelInput,
  sampleRateInput,
  cuesInput,
  settingsInput = {},
) {
  const channels = Array.from(channelInput || []);
  const sampleRate = Math.floor(finite(sampleRateInput, 0));
  if (
    !channels.length ||
    channels.length > ALIGNMENT_LIMITS.channels ||
    !channels.every(
      (channel) =>
        channel instanceof Float32Array &&
        channel.length === channels[0].length,
    ) ||
    sampleRate <= 0 ||
    sampleRate > ALIGNMENT_LIMITS.sampleRate ||
    channels[0].length * channels.length > ALIGNMENT_LIMITS.totalSamples
  ) {
    throw new Error("Audio sample arrays are invalid or exceed safety limits.");
  }
  const settings = normalizeAlignmentSettings(settingsInput);
  const cues = [...(cuesInput || [])].sort(
    (a, b) => a.startMs - b.startMs || a.endMs - b.endMs,
  );
  const windowFrames = Math.max(
    1,
    Math.round((settings.windowMilliseconds / 1_000) * sampleRate),
  );
  const windows = [];
  let activeWindows = 0;
  let coveredActiveWindows = 0;
  let cueIndex = 0;

  for (let start = 0; start < channels[0].length; start += windowFrames) {
    const end = Math.min(channels[0].length, start + windowFrames);
    let squareTotal = 0;
    let count = 0;
    for (let index = start; index < end; index += 1) {
      for (const channel of channels) {
        const sample = channel[index];
        squareTotal += sample * sample;
        count += 1;
      }
    }
    const rms = Math.sqrt(squareTotal / Math.max(1, count));
    const db = Math.max(-160, 20 * Math.log10(Math.max(rms, 1e-8)));
    const startMs = (start / sampleRate) * 1_000;
    const endMs = (end / sampleRate) * 1_000;
    const coverage = cueCoversWindow(cues, startMs, endMs, cueIndex);
    cueIndex = coverage.index;
    const active = db >= settings.activityThresholdDb;
    if (active) {
      activeWindows += 1;
      if (coverage.covered) coveredActiveWindows += 1;
    }
    windows.push({
      startMs: Math.round(startMs),
      endMs: Math.round(endMs),
      db: Number(db.toFixed(2)),
      active,
      covered: coverage.covered,
    });
  }

  const mergedUncovered = mergeWindows(
    windows.filter(({ active, covered }) => active && !covered),
    settings.minimumUncoveredMilliseconds,
  );
  const uncoveredFullLength = mergedUncovered.length;
  const uncovered = mergedUncovered.slice(0, ALIGNMENT_LIMITS.findings);
  const quietCues = [];
  const durationMs = (channels[0].length / sampleRate) * 1_000;
  const outOfRangeCues = [];
  for (const cue of cues) {
    if (cue.startMs >= durationMs || cue.endMs > durationMs + 1) {
      outOfRangeCues.push({
        cueNumber: cue.number,
        startMs: cue.startMs,
        endMs: cue.endMs,
      });
      continue;
    }
    const overlapping = windows.filter(
      (window) => window.startMs < cue.endMs && window.endMs > cue.startMs,
    );
    if (
      overlapping.length &&
      overlapping.filter(({ active }) => active).length / overlapping.length <
        0.2
    ) {
      quietCues.push({
        cueNumber: cue.number,
        startMs: cue.startMs,
        endMs: cue.endMs,
      });
    }
  }

  return {
    settings,
    durationMs: Math.round(durationMs),
    windowCount: windows.length,
    activeWindowCount: activeWindows,
    coveredActiveWindowCount: coveredActiveWindows,
    activeCoveragePercent: activeWindows
      ? Number(((coveredActiveWindows / activeWindows) * 100).toFixed(1))
      : null,
    uncoveredActivity: uncovered,
    quietCues: quietCues.slice(0, ALIGNMENT_LIMITS.findings),
    outOfRangeCues: outOfRangeCues.slice(0, ALIGNMENT_LIMITS.findings),
    findingLimitReached:
      uncoveredFullLength > ALIGNMENT_LIMITS.findings ||
      quietCues.length > ALIGNMENT_LIMITS.findings ||
      outOfRangeCues.length > ALIGNMENT_LIMITS.findings,
  };
}

export function buildTranscriptAlignmentReport(
  result = {},
  createdAt = new Date().toISOString(),
) {
  const { media, candidateParse, referenceParse, coverage, comparison } =
    result || {};
  if (!media || !candidateParse || !coverage) return null;
  return {
    schema: "altftool.audio-transcript-alignment-screen.v1",
    createdAt,
    createdAtMeaning: "Time this local screening report was generated.",
    audio: {
      mimeType: media.mimeType,
      encodedBytes: media.bytes,
      durationMilliseconds: coverage.durationMs,
      channels: media.channels,
      decodedSampleRate: media.sampleRate,
    },
    transcript: {
      candidateCueCount: candidateParse.cues.length,
      candidateParseIssueCount: candidateParse.issues.length,
      referenceProvided: Boolean(referenceParse),
      referenceCueCount: referenceParse?.cues.length || 0,
      referenceParseIssueCount: referenceParse?.issues.length || 0,
    },
    audioCoverage: {
      settings: coverage.settings,
      windowCount: coverage.windowCount,
      activeWindowCount: coverage.activeWindowCount,
      coveredActiveWindowCount: coverage.coveredActiveWindowCount,
      activeCoveragePercent: coverage.activeCoveragePercent,
      uncoveredActivity: coverage.uncoveredActivity,
      quietCues: coverage.quietCues,
      outOfRangeCues: coverage.outOfRangeCues,
      findingLimitReached: coverage.findingLimitReached,
    },
    referenceComparison: comparison
      ? {
          settings: comparison.settings,
          counts: comparison.counts,
          findings: comparison.findings.map(
            ({
              code,
              referenceNumber,
              candidateNumber,
              startMs,
              endMs,
              startDeltaMs,
              endDeltaMs,
              similarity,
            }) => ({
              code,
              referenceNumber,
              candidateNumber,
              startMs,
              endMs,
              startDeltaMs: startDeltaMs ?? null,
              endDeltaMs: endDeltaMs ?? null,
              similarity,
            }),
          ),
          findingLimitReached: comparison.findingLimitReached,
        }
      : null,
    scope: {
      fileNameIncluded: false,
      audioSamplesIncluded: false,
      transcriptTextIncluded: false,
      speechRecognitionPerformed: false,
      semanticAccuracyEstablished: false,
      wcagConformanceEstablished: false,
    },
  };
}
