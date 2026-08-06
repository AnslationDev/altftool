export const MEDIA_ANALYSIS_LOG_LIMITS = Object.freeze({
  priorityHead: 200,
  priorityTail: 200,
  recent: 200,
  lineCharacters: 4_000,
});

const ANALYSIS_CUE =
  /(?:silence_(?:start|end|duration)|silencedetect|showinfo|astats|lavfi\.|rms|peak level|duration:|stream #|pts(?:_time)?|frame=|time=)/iu;

function boundedLine(value) {
  const line = String(value ?? "");
  if (line.length <= MEDIA_ANALYSIS_LOG_LIMITS.lineCharacters) return line;
  return `${line.slice(0, MEDIA_ANALYSIS_LOG_LIMITS.lineCharacters)} … [line truncated]`;
}

export function createMediaAnalysisLog() {
  return {
    sequence: 0,
    total: 0,
    priorityHead: [],
    priorityTail: [],
    priorityDropped: 0,
    recent: [],
  };
}

export function captureMediaAnalysisLine(capture, value) {
  if (!capture || typeof capture !== "object") return;
  const entry = { sequence: capture.sequence, line: boundedLine(value) };
  capture.sequence += 1;
  capture.total += 1;

  capture.recent.push(entry);
  if (capture.recent.length > MEDIA_ANALYSIS_LOG_LIMITS.recent) {
    capture.recent.shift();
  }

  if (!ANALYSIS_CUE.test(entry.line)) return;
  if (capture.priorityHead.length < MEDIA_ANALYSIS_LOG_LIMITS.priorityHead) {
    capture.priorityHead.push(entry);
    return;
  }
  capture.priorityTail.push(entry);
  if (capture.priorityTail.length > MEDIA_ANALYSIS_LOG_LIMITS.priorityTail) {
    capture.priorityTail.shift();
    capture.priorityDropped += 1;
  }
}

export function formatMediaAnalysisLog(capture) {
  if (!capture || typeof capture !== "object") return "No FFmpeg analysis log was captured.";
  const priority = [...capture.priorityHead, ...capture.priorityTail];
  const lines = [
    "ALTFTool bounded FFmpeg analysis log",
    `Captured ${capture.total} line(s); retained ${priority.length} analysis cue line(s) and the latest ${capture.recent.length} line(s).`,
    "",
    "Analysis cue lines:",
    ...capture.priorityHead.map((entry) => entry.line),
  ];

  if (capture.priorityDropped > 0) {
    lines.push(`… [${capture.priorityDropped} analysis cue line(s) omitted by the bounded capture] …`);
  }
  lines.push(...capture.priorityTail.map((entry) => entry.line));

  const retainedRecentSequences = new Set(priority.map((entry) => entry.sequence));
  const recentOnly = capture.recent.filter(
    (entry) => !retainedRecentSequences.has(entry.sequence),
  );
  lines.push("", "Recent non-duplicate FFmpeg lines:");
  if (capture.total > capture.recent.length) {
    lines.push(`… [older general log lines omitted; capture is bounded to ${MEDIA_ANALYSIS_LOG_LIMITS.recent}] …`);
  }
  lines.push(...recentOnly.map((entry) => entry.line));
  return lines.join("\n");
}
