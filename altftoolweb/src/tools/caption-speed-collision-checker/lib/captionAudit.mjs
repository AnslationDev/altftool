export const MAX_CAPTION_CHARACTERS = 2_000_000;

export const DEFAULT_THRESHOLDS = Object.freeze({
  maxCps: 20,
  maxWpm: 180,
  minDurationMs: 1_000,
  maxDurationMs: 7_000,
  maxLines: 2,
  maxCharsPerLine: 42,
});

export const RULE_LABELS = Object.freeze({
  "invalid-timestamp": "Invalid timestamp",
  "nonpositive-duration": "Nonpositive duration",
  overlap: "Cue overlap",
  "duration-too-short": "Duration below minimum",
  "duration-too-long": "Duration above maximum",
  "cps-too-high": "CPS above maximum",
  "wpm-too-high": "WPM above maximum",
  "too-many-lines": "Too many lines",
  "line-too-long": "Line above character limit",
  "empty-text": "Empty caption text",
});

function round(value, digits = 1) {
  const power = 10 ** digits;
  return Math.round((value + Number.EPSILON) * power) / power;
}

function issue(rule, severity, message, evidence = {}) {
  return {
    rule,
    label: RULE_LABELS[rule],
    severity,
    message,
    evidence,
  };
}

function normalizeSource(source) {
  return String(source || "")
    .replace(/^\uFEFF/u, "")
    .replace(/\r\n?/gu, "\n");
}

function detectFormat(lines) {
  const firstContent = lines.find((line) => line.text.trim());
  if (/^WEBVTT(?:[ \t].*)?$/iu.test(firstContent?.text.trim() || "")) {
    return "vtt";
  }

  const timingLine =
    lines.find((line) => line.text.includes("-->"))?.text || "";
  const leftSide = timingLine.split("-->")[0]?.trim() || "";
  if (/,\d{3}$/u.test(leftSide)) return "srt";
  if (/\.\d{3}$/u.test(leftSide)) return "vtt";
  return "unknown";
}

function timestampPattern(format) {
  if (format === "srt") {
    return /^(\d+):([0-5]\d):([0-5]\d),(\d{3})$/u;
  }
  if (format === "vtt") {
    return /^(?:(\d+):)?([0-5]\d):([0-5]\d)\.(\d{3})$/u;
  }
  return /^(?:(\d+):)?([0-5]\d):([0-5]\d)([,.])(\d{3})$/u;
}

export function parseTimestamp(value, format = "unknown") {
  const clean = String(value || "").trim();
  const match = clean.match(timestampPattern(format));
  if (!match) return null;

  let hours;
  let minutes;
  let seconds;
  let milliseconds;

  if (format === "unknown") {
    hours = Number(match[1] || 0);
    minutes = Number(match[2]);
    seconds = Number(match[3]);
    milliseconds = Number(match[5]);
  } else {
    hours = Number(match[1] || 0);
    minutes = Number(match[2]);
    seconds = Number(match[3]);
    milliseconds = Number(match[4]);
  }

  if (![hours, minutes, seconds, milliseconds].every(Number.isFinite))
    return null;
  return ((hours * 60 + minutes) * 60 + seconds) * 1_000 + milliseconds;
}

function parseTimingLine(value, format) {
  const match = String(value || "").match(
    /^(.+?)\s*-->\s*(\S+)(?:[ \t]+.*)?$/u,
  );
  if (!match) {
    return {
      ok: false,
      message:
        "The timing line must contain a start timestamp, -->, and an end timestamp.",
    };
  }

  const startMs = parseTimestamp(match[1], format);
  const endMs = parseTimestamp(match[2], format);
  if (startMs === null || endMs === null) {
    const expected =
      format === "srt"
        ? "HH:MM:SS,mmm"
        : format === "vtt"
          ? "MM:SS.mmm or HH:MM:SS.mmm"
          : "a complete SRT or WebVTT timestamp";
    return {
      ok: false,
      message: `A timestamp is invalid. Expected ${expected}.`,
    };
  }

  return { ok: true, startMs, endMs };
}

function decodeEntity(match, entity) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  const key = entity.toLowerCase();
  if (named[key]) return named[key];

  const isHex = /^#x/iu.test(entity);
  const numeric = isHex
    ? Number.parseInt(entity.slice(2), 16)
    : /^#/u.test(entity)
      ? Number.parseInt(entity.slice(1), 10)
      : Number.NaN;
  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 0x10ffff)
    return "x";
  try {
    return String.fromCodePoint(numeric);
  } catch {
    return "x";
  }
}

function visibleLine(value) {
  return String(value || "")
    .replace(/<[^>]*>/gu, "")
    .replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/giu, decodeEntity)
    .trim();
}

function cueMetrics(textLines, durationMs) {
  const visibleLines = textLines.map(visibleLine);
  const joined = visibleLines.join(" ").trim();
  const characters = Array.from(joined.replace(/\s/gu, "")).length;
  const words = joined ? joined.split(/\s+/u).filter(Boolean).length : 0;
  const lineLengths = visibleLines.map((line) => Array.from(line).length);
  const durationSeconds = durationMs > 0 ? durationMs / 1_000 : null;

  return {
    durationMs,
    lineCount: visibleLines.filter(Boolean).length,
    longestLineCharacters: lineLengths.length ? Math.max(...lineLengths) : 0,
    characters,
    words,
    cps: durationSeconds ? round(characters / durationSeconds) : null,
    wpm: durationSeconds ? round((words / durationSeconds) * 60) : null,
  };
}

function makeBlocks(lines) {
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (!line.text.trim()) {
      if (current.length) blocks.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);
  return blocks;
}

function removeVttHeader(lines) {
  const headerIndex = lines.findIndex((line) =>
    /^WEBVTT(?:[ \t].*)?$/iu.test(line.text.trim()),
  );
  if (headerIndex < 0) return lines;

  const afterHeader = lines.slice(headerIndex + 1);
  const blankIndex = afterHeader.findIndex((line) => !line.text.trim());
  const timingIndex = afterHeader.findIndex((line) =>
    line.text.includes("-->"),
  );

  if (timingIndex >= 0 && (blankIndex < 0 || timingIndex < blankIndex)) {
    const possibleIdentifierIndex = timingIndex - 1;
    const startAt =
      possibleIdentifierIndex >= 0 &&
      afterHeader[possibleIdentifierIndex].text.trim() &&
      !/^[A-Za-z][\w-]*\s*:/u.test(
        afterHeader[possibleIdentifierIndex].text.trim(),
      )
        ? possibleIdentifierIndex
        : timingIndex;
    return afterHeader.slice(startAt);
  }

  return blankIndex >= 0 ? afterHeader.slice(blankIndex + 1) : [];
}

function isVttMetadataBlock(block) {
  return /^(?:NOTE(?:\s|$)|STYLE$|REGION$)/u.test(block[0]?.text.trim() || "");
}

export function parseCaptionText(source) {
  const normalized = normalizeSource(source);
  if (!normalized.trim()) {
    return {
      ok: false,
      error: "Paste or upload SRT or WebVTT caption text.",
      format: "unknown",
      cues: [],
      parseFindings: [],
    };
  }
  if (normalized.length > MAX_CAPTION_CHARACTERS) {
    return {
      ok: false,
      error: "Caption text exceeds the 2,000,000-character local safety limit.",
      format: "unknown",
      cues: [],
      parseFindings: [],
    };
  }

  const allLines = normalized.split("\n").map((text, index) => ({
    text,
    lineNumber: index + 1,
  }));
  const format = detectFormat(allLines);
  const contentLines = format === "vtt" ? removeVttHeader(allLines) : allLines;
  const blocks = makeBlocks(contentLines);
  const cues = [];
  const parseFindings = [];
  let metadataBlocks = 0;

  blocks.forEach((block, blockIndex) => {
    if (format === "vtt" && isVttMetadataBlock(block)) {
      metadataBlocks += 1;
      return;
    }

    const timingIndex = block.findIndex((line) => line.text.includes("-->"));
    const evidence = {
      block: blockIndex + 1,
      line:
        timingIndex >= 0 ? block[timingIndex].lineNumber : block[0].lineNumber,
    };

    if (timingIndex < 0) {
      parseFindings.push(
        issue(
          "invalid-timestamp",
          "error",
          "This caption block has no recognizable timing line.",
          evidence,
        ),
      );
      return;
    }

    const timing = parseTimingLine(block[timingIndex].text, format);
    if (!timing.ok) {
      parseFindings.push(
        issue("invalid-timestamp", "error", timing.message, evidence),
      );
      return;
    }

    const textLines = block.slice(timingIndex + 1).map((line) => line.text);
    cues.push({
      cueNumber: cues.length + 1,
      block: blockIndex + 1,
      line: block[timingIndex].lineNumber,
      hasIdentifier: timingIndex > 0,
      startMs: timing.startMs,
      endMs: timing.endMs,
      textLines,
    });
  });

  return {
    ok: true,
    format,
    blocks: blocks.length,
    metadataBlocks,
    cues,
    parseFindings,
  };
}

export function validateThresholds(input = DEFAULT_THRESHOLDS) {
  const thresholds = {
    maxCps: Number(input.maxCps),
    maxWpm: Number(input.maxWpm),
    minDurationMs: Number(input.minDurationMs),
    maxDurationMs: Number(input.maxDurationMs),
    maxLines: Number(input.maxLines),
    maxCharsPerLine: Number(input.maxCharsPerLine),
  };
  const errors = [];

  if (!Number.isFinite(thresholds.maxCps) || thresholds.maxCps <= 0) {
    errors.push("Maximum CPS must be greater than 0.");
  }
  if (!Number.isFinite(thresholds.maxWpm) || thresholds.maxWpm <= 0) {
    errors.push("Maximum WPM must be greater than 0.");
  }
  if (
    !Number.isFinite(thresholds.minDurationMs) ||
    thresholds.minDurationMs < 0
  ) {
    errors.push("Minimum duration must be 0 milliseconds or more.");
  }
  if (
    !Number.isFinite(thresholds.maxDurationMs) ||
    thresholds.maxDurationMs <= 0
  ) {
    errors.push("Maximum duration must be greater than 0 milliseconds.");
  }
  if (
    Number.isFinite(thresholds.minDurationMs) &&
    Number.isFinite(thresholds.maxDurationMs) &&
    thresholds.maxDurationMs < thresholds.minDurationMs
  ) {
    errors.push("Maximum duration must be at least the minimum duration.");
  }
  if (!Number.isInteger(thresholds.maxLines) || thresholds.maxLines < 1) {
    errors.push("Maximum lines must be a whole number of at least 1.");
  }
  if (
    !Number.isInteger(thresholds.maxCharsPerLine) ||
    thresholds.maxCharsPerLine < 1
  ) {
    errors.push(
      "Maximum characters per line must be a whole number of at least 1.",
    );
  }

  return { ok: errors.length === 0, thresholds, errors };
}

export function auditCaptions(source, thresholdInput = DEFAULT_THRESHOLDS) {
  const validation = validateThresholds(thresholdInput);
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.errors[0],
      errors: validation.errors,
      cues: [],
      parseFindings: [],
    };
  }

  const parsed = parseCaptionText(source);
  if (!parsed.ok) return parsed;

  const { thresholds } = validation;
  const cues = parsed.cues.map((cue) => {
    const durationMs = cue.endMs - cue.startMs;
    const metrics = cueMetrics(cue.textLines, durationMs);
    const findings = [];

    if (durationMs <= 0) {
      findings.push(
        issue(
          "nonpositive-duration",
          "error",
          "The end time must be later than the start time.",
          { durationMs },
        ),
      );
    } else {
      if (durationMs < thresholds.minDurationMs) {
        findings.push(
          issue(
            "duration-too-short",
            "warning",
            "Cue duration is below the configured minimum.",
            { actualMs: durationMs, limitMs: thresholds.minDurationMs },
          ),
        );
      }
      if (durationMs > thresholds.maxDurationMs) {
        findings.push(
          issue(
            "duration-too-long",
            "warning",
            "Cue duration is above the configured maximum.",
            { actualMs: durationMs, limitMs: thresholds.maxDurationMs },
          ),
        );
      }
      if (metrics.cps > thresholds.maxCps) {
        findings.push(
          issue(
            "cps-too-high",
            "warning",
            "Characters per second exceed the configured maximum.",
            { actual: metrics.cps, limit: thresholds.maxCps },
          ),
        );
      }
      if (metrics.wpm > thresholds.maxWpm) {
        findings.push(
          issue(
            "wpm-too-high",
            "warning",
            "Words per minute exceed the configured maximum.",
            { actual: metrics.wpm, limit: thresholds.maxWpm },
          ),
        );
      }
    }

    if (metrics.lineCount === 0) {
      findings.push(
        issue(
          "empty-text",
          "warning",
          "No visible caption text remains after markup is excluded.",
          { lineCount: 0 },
        ),
      );
    }
    if (metrics.lineCount > thresholds.maxLines) {
      findings.push(
        issue(
          "too-many-lines",
          "warning",
          "Visible line count exceeds the configured maximum.",
          { actual: metrics.lineCount, limit: thresholds.maxLines },
        ),
      );
    }
    if (metrics.longestLineCharacters > thresholds.maxCharsPerLine) {
      findings.push(
        issue(
          "line-too-long",
          "warning",
          "The longest visible line exceeds the configured character limit.",
          {
            actual: metrics.longestLineCharacters,
            limit: thresholds.maxCharsPerLine,
          },
        ),
      );
    }

    return { ...cue, metrics, findings };
  });

  let previousPositiveCue = null;
  for (const cue of cues) {
    if (
      previousPositiveCue &&
      cue.endMs > cue.startMs &&
      cue.startMs < previousPositiveCue.endMs
    ) {
      cue.findings.unshift(
        issue(
          "overlap",
          "error",
          "This cue starts before the previous positive-duration cue ends.",
          {
            previousCue: previousPositiveCue.cueNumber,
            overlapMs: previousPositiveCue.endMs - cue.startMs,
          },
        ),
      );
    }
    if (cue.endMs > cue.startMs) previousPositiveCue = cue;
  }

  const allFindings = [
    ...parsed.parseFindings,
    ...cues.flatMap((cue) => cue.findings),
  ];
  const findingCounts = Object.fromEntries(
    Object.keys(RULE_LABELS).map((rule) => [
      rule,
      allFindings.filter((finding) => finding.rule === rule).length,
    ]),
  );
  const errors = allFindings.filter(
    (finding) => finding.severity === "error",
  ).length;
  const warnings = allFindings.filter(
    (finding) => finding.severity === "warning",
  ).length;

  return {
    ok: true,
    format: parsed.format,
    blocks: parsed.blocks,
    metadataBlocks: parsed.metadataBlocks,
    thresholds,
    cues,
    parseFindings: parsed.parseFindings,
    findingCounts,
    summary: {
      cues: cues.length,
      cuesWithFindings: cues.filter((cue) => cue.findings.length).length,
      invalidBlocks: parsed.parseFindings.length,
      overlaps: findingCounts.overlap,
      errors,
      warnings,
    },
  };
}

export function formatTimestamp(milliseconds) {
  if (!Number.isFinite(milliseconds)) return "Invalid";
  const sign = milliseconds < 0 ? "-" : "";
  const absolute = Math.abs(Math.round(milliseconds));
  const hours = Math.floor(absolute / 3_600_000);
  const minutes = Math.floor((absolute % 3_600_000) / 60_000);
  const seconds = Math.floor((absolute % 60_000) / 1_000);
  const millis = absolute % 1_000;
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

export function buildCountsOnlyCaptionReport(
  result,
  generatedAt = new Date().toISOString(),
) {
  if (!result?.ok) return null;

  return {
    reportType: "caption-speed-collision-counts-only",
    generatedAt,
    inputFormat: result.format,
    thresholds: { ...result.thresholds },
    summary: { ...result.summary },
    findingCounts: { ...result.findingCounts },
    ignoredMetadataBlocks: result.metadataBlocks,
    privacy:
      "This report contains aggregate counts and threshold settings only. It excludes caption text, cue identifiers, timestamps, filenames, and file contents.",
    interpretation:
      "Findings are deterministic comparisons with the supplied editorial settings, not universal accessibility certification.",
  };
}
