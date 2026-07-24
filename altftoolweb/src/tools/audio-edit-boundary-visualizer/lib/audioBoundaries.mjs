export const AUDIO_LIMITS = {
  fileBytes: 30 * 1024 * 1024,
  durationSeconds: 10 * 60,
  channels: 2,
  sampleRate: 96_000,
  totalSamples: 24_000_000,
  waveformBuckets: 1_000,
  candidates: 500,
};

export const DEFAULT_BOUNDARY_SETTINGS = {
  scoreThreshold: 6,
  absoluteJump: 0.08,
  dcShift: 0.025,
  mergeMilliseconds: 50,
};

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function validateAudioFile({ type, size } = {}) {
  const mimeType = String(type || "").toLowerCase();
  const bytes = finite(size, -1);
  if (!mimeType.startsWith("audio/")) {
    return {
      ok: false,
      error: "Choose an audio file supported by this browser.",
    };
  }
  if (bytes <= 0) return { ok: false, error: "The audio file is empty." };
  if (bytes > AUDIO_LIMITS.fileBytes) {
    return {
      ok: false,
      error: "Choose an audio file no larger than 30 MB.",
    };
  }
  return { ok: true, bytes, mimeType };
}

export function validateDecodedAudio({
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
    return { ok: false, error: "The decoded audio metadata is incomplete." };
  }
  if (
    safeDuration > AUDIO_LIMITS.durationSeconds ||
    channels > AUDIO_LIMITS.channels ||
    rate > AUDIO_LIMITS.sampleRate ||
    frames * channels > AUDIO_LIMITS.totalSamples
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

export function normalizeBoundarySettings(input = {}) {
  return {
    scoreThreshold: clamp(
      finite(input.scoreThreshold, DEFAULT_BOUNDARY_SETTINGS.scoreThreshold),
      3,
      20,
    ),
    absoluteJump: clamp(
      finite(input.absoluteJump, DEFAULT_BOUNDARY_SETTINGS.absoluteJump),
      0.01,
      1,
    ),
    dcShift: clamp(
      finite(input.dcShift, DEFAULT_BOUNDARY_SETTINGS.dcShift),
      0.005,
      0.5,
    ),
    mergeMilliseconds: clamp(
      Math.round(
        finite(
          input.mergeMilliseconds,
          DEFAULT_BOUNDARY_SETTINGS.mergeMilliseconds,
        ),
      ),
      10,
      500,
    ),
  };
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function channelValue(channels, index) {
  let value = 0;
  for (const channel of channels) value += channel[index] || 0;
  return value / channels.length;
}

function localMean(channels, start, end) {
  if (end <= start) return 0;
  let total = 0;
  let count = 0;
  for (let index = start; index < end; index += 1) {
    total += channelValue(channels, index);
    count += 1;
  }
  return count ? total / count : 0;
}

function waveformEnvelope(channels, bucketCount) {
  const length = channels[0].length;
  const count = Math.min(bucketCount, length);
  const buckets = [];
  for (let bucket = 0; bucket < count; bucket += 1) {
    const start = Math.floor((bucket * length) / count);
    const end = Math.max(
      start + 1,
      Math.floor(((bucket + 1) * length) / count),
    );
    let minimum = 1;
    let maximum = -1;
    for (let index = start; index < end; index += 1) {
      const value = channelValue(channels, index);
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }
    buckets.push({
      minimum: Number(minimum.toFixed(5)),
      maximum: Number(maximum.toFixed(5)),
    });
  }
  return buckets;
}

function mergeCandidates(candidates, mergeSamples) {
  const merged = [];
  for (const candidate of candidates) {
    const previous = merged.at(-1);
    if (
      previous &&
      candidate.sampleIndex - previous.sampleIndex <= mergeSamples
    ) {
      if (candidate.rankValue > previous.rankValue) {
        merged[merged.length - 1] = candidate;
      }
    } else {
      merged.push(candidate);
    }
  }
  return merged;
}

export function analyzeAudioBoundaries(
  channelInput,
  sampleRateInput,
  settingsInput = {},
) {
  const channels = Array.from(channelInput || []);
  const sampleRate = Math.floor(finite(sampleRateInput, 0));
  if (
    !channels.length ||
    channels.length > AUDIO_LIMITS.channels ||
    !channels.every(
      (channel) =>
        channel instanceof Float32Array &&
        channel.length === channels[0].length,
    ) ||
    sampleRate <= 0 ||
    sampleRate > AUDIO_LIMITS.sampleRate ||
    channels[0].length * channels.length > AUDIO_LIMITS.totalSamples
  ) {
    throw new Error("Audio sample arrays are invalid or exceed safety limits.");
  }
  const settings = normalizeBoundarySettings(settingsInput);
  const length = channels[0].length;
  const binSize = Math.max(1, Math.round(sampleRate * 0.01));
  const binMaxima = [];

  for (let start = 1; start < length; start += binSize) {
    const end = Math.min(length, start + binSize);
    let maximumJump = 0;
    let maximumIndex = start;
    for (let index = start; index < end; index += 1) {
      let jump = 0;
      for (const channel of channels) {
        jump = Math.max(jump, Math.abs(channel[index] - channel[index - 1]));
      }
      if (jump > maximumJump) {
        maximumJump = jump;
        maximumIndex = index;
      }
    }
    binMaxima.push({ jump: maximumJump, sampleIndex: maximumIndex });
  }

  const baseline = median(binMaxima.map(({ jump }) => jump));
  const mad = median(binMaxima.map(({ jump }) => Math.abs(jump - baseline)));
  const scale = Math.max(0.0025, mad * 1.4826);
  const localWindow = Math.max(2, Math.round(sampleRate * 0.01));
  const candidates = [];

  for (const item of binMaxima) {
    const score = Math.max(0, (item.jump - baseline) / scale);
    const beforeMean = localMean(
      channels,
      Math.max(0, item.sampleIndex - localWindow),
      item.sampleIndex,
    );
    const afterMean = localMean(
      channels,
      item.sampleIndex,
      Math.min(length, item.sampleIndex + localWindow),
    );
    const dcShift = Math.abs(afterMean - beforeMean);
    const jumpCue =
      item.jump >= settings.absoluteJump && score >= settings.scoreThreshold;
    const dcCue = dcShift >= settings.dcShift;
    if (!jumpCue && !dcCue) continue;
    const cue =
      jumpCue && dcCue
        ? "sample-jump-and-dc-shift"
        : jumpCue
          ? "sample-jump"
          : "dc-shift";
    candidates.push({
      sampleIndex: item.sampleIndex,
      timeSeconds: Number((item.sampleIndex / sampleRate).toFixed(5)),
      jump: Number(item.jump.toFixed(5)),
      score: Number(score.toFixed(2)),
      dcShift: Number(dcShift.toFixed(5)),
      cue,
      rankValue: Math.max(score, dcShift / settings.dcShift),
    });
  }

  const merged = mergeCandidates(
    candidates,
    Math.round((settings.mergeMilliseconds / 1000) * sampleRate),
  )
    .sort((a, b) => b.rankValue - a.rankValue || a.sampleIndex - b.sampleIndex)
    .slice(0, AUDIO_LIMITS.candidates)
    .map(({ rankValue: _rankValue, ...candidate }) => candidate)
    .sort((a, b) => a.sampleIndex - b.sampleIndex);

  return {
    settings,
    sampleRate,
    channels: channels.length,
    length,
    durationSeconds: Number((length / sampleRate).toFixed(5)),
    baselineJump: Number(baseline.toFixed(6)),
    medianAbsoluteDeviation: Number(mad.toFixed(6)),
    waveform: waveformEnvelope(channels, AUDIO_LIMITS.waveformBuckets),
    candidates: merged,
    candidateLimitReached: merged.length === AUDIO_LIMITS.candidates,
  };
}

export function buildAudioBoundaryReport(
  analysis,
  media,
  createdAt = new Date().toISOString(),
) {
  if (!analysis || !media) return null;
  const cueCounts = {
    sampleJump: analysis.candidates.filter(({ cue }) =>
      cue.includes("sample-jump"),
    ).length,
    dcShift: analysis.candidates.filter(({ cue }) => cue.includes("dc-shift"))
      .length,
  };
  return {
    schema: "altftool.audio-edit-boundary-screen.v1",
    createdAt,
    createdAtMeaning: "Time this local screening report was generated.",
    audio: {
      mimeType: media.mimeType,
      encodedBytes: media.bytes,
      durationSeconds: analysis.durationSeconds,
      channels: analysis.channels,
      decodedSampleRate: analysis.sampleRate,
      decodedFrames: analysis.length,
    },
    settings: analysis.settings,
    summary: {
      candidateCount: analysis.candidates.length,
      cueCounts,
      candidateLimitReached: analysis.candidateLimitReached,
    },
    candidates: analysis.candidates.map(
      ({ timeSeconds, jump, score, dcShift, cue }) => ({
        timeSeconds,
        jump,
        score,
        dcShift,
        cue,
      }),
    ),
    scope: {
      fileNameIncluded: false,
      audioSamplesIncluded: false,
      waveformIncluded: false,
      authenticityEstablished: false,
      editProven: false,
    },
  };
}
