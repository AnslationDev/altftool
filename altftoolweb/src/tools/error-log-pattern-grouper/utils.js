const LEVEL_RE = /\b(TRACE|DEBUG|INFO|NOTICE|WARN(?:ING)?|ERROR|FATAL|CRITICAL|SEVERE)\b/i;
const ENTRY_START_RE = /^(?:\s*(?:\[)?(?:\d{4}[-/]\d{2}[-/]\d{2}[T\s]|\d{2}:\d{2}:\d{2})|\s*\[?(?:TRACE|DEBUG|INFO|NOTICE|WARN(?:ING)?|ERROR|FATAL|CRITICAL|SEVERE)\]?\b|\s*\{)/i;
const TIMESTAMP_RE = /\b(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|\s*[+-]\d{2}:?\d{2})?)/;

export const SAMPLE_LOGS = `2025-03-08T10:14:12.103Z ERROR [checkout-service] Request failed for user 48291: Connection timeout after 30000ms
    at requestPayment (/app/src/checkout/payment.js:142:18)
2025-03-08T10:14:14.803Z ERROR [checkout-service] Request failed for user 77302: Connection timeout after 30000ms
    at requestPayment (/app/src/checkout/payment.js:142:18)
{"timestamp":"2025-03-08T10:15:01.120Z","level":"warn","service":"search-api","message":"Rate limit reached for client 10.24.8.15 on /api/search?page=3"}
{"timestamp":"2025-03-08T10:15:03.512Z","level":"warn","service":"search-api","message":"Rate limit reached for client 10.24.8.91 on /api/search?page=7"}
2025-03-08T10:16:44.010Z ERROR [orders-api] Database query failed: order 9f8c22a1-1c43-4a7d-a9e8-d424ab00c221 was not found
    at OrderRepository.find (/app/src/orders/repository.js:142:18)
    at async getOrder (/app/src/orders/service.js:57:9)`;

function parseJson(entry) {
  try { return JSON.parse(entry); } catch { return null; }
}

function jsonText(value) {
  if (!value || typeof value !== "object") return "";
  return String(value.message ?? value.msg ?? value.error?.message ?? value.error ?? value.event ?? JSON.stringify(value));
}

export function detectLevel(value) {
  const json = parseJson(value);
  const source = json?.level ?? json?.severity ?? json?.logLevel ?? value;
  const match = String(source).match(LEVEL_RE);
  if (!match) return "UNKNOWN";
  const level = match[1].toUpperCase();
  if (level === "WARNING") return "WARN";
  if (["FATAL", "CRITICAL", "SEVERE"].includes(level)) return "FATAL";
  return level;
}

export function splitEntries(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const entries = [];
  let current = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const isJsonLine = line.trim().startsWith("{") && parseJson(line.trim());
    if ((isJsonLine || ENTRY_START_RE.test(line)) && current.length) {
      entries.push(current.join("\n"));
      current = [line];
    } else current.push(line);
    if (isJsonLine) { entries.push(current.join("\n")); current = []; }
  }
  if (current.length) entries.push(current.join("\n"));
  return entries;
}

function messageOf(entry) {
  const json = parseJson(entry);
  if (json) return jsonText(json);
  return entry.split("\n")[0]
    .replace(/^\s*\[?\d{4}[-/]\d{2}[-/]\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|\s*[+-]\d{2}:?\d{2})?\]?\s*/, "")
    .replace(/^\s*\[?\d{2}:\d{2}:\d{2}(?:[.,]\d+)?\]?\s*/, "")
    .replace(/^\s*\[?(?:TRACE|DEBUG|INFO|NOTICE|WARN(?:ING)?|ERROR|FATAL|CRITICAL|SEVERE)\]?\s*[:|-]?\s*/i, "");
}

export function normalizeEntry(entry) {
  return messageOf(entry)
    .replace(/https?:\/\/[^\s"']+/gi, "<url>")
    .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, "<email>")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "<uuid>")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "<ip>")
    .replace(/\b0x[0-9a-f]+\b/gi, "<hex>")
    .replace(/\b[0-9a-f]{16,}\b/gi, "<id>")
    .replace(/([?&][\w.-]+)=([^\s&#"']+)/g, "$1=<value>")
    .replace(/(?:\/[\w.-]+){2,}(?::\d+(?::\d+)?)?/g, "<path>")
    .replace(/\b\d+(?:\.\d+)?(?:ms|s|kb|mb|gb|%)\b/gi, "<number>")
    .replace(/\b\d+\b/g, "<number>")
    .replace(/\s+/g, " ").trim() || "Unclassified log entry";
}

function timestampOf(entry) {
  const json = parseJson(entry);
  const raw = json?.timestamp ?? json?.time ?? json?.['@timestamp'] ?? entry.match(TIMESTAMP_RE)?.[1];
  const date = raw ? new Date(String(raw).replace(",", ".")) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

function contextOf(entry) {
  const json = parseJson(entry);
  const explicit = json?.service ?? json?.serviceName ?? json?.component ?? json?.module ?? json?.logger;
  if (explicit) return String(explicit);
  const bracket = messageOf(entry).match(/^\[([^\]]+)]/);
  const path = entry.match(/(?:\/src\/|\/app\/)([\w.-]+(?:\/[\w.-]+)?)/);
  return bracket?.[1] ?? path?.[1] ?? null;
}

function stackFrameOf(entry) {
  const frames = entry.split("\n").map((line) => line.trim()).filter((line) => /^(?:at |File ")/.test(line));
  return frames[0] ?? null;
}

function suggestionFor(pattern, level) {
  const value = pattern.toLowerCase();
  if (/timeout|timed out|connection reset/.test(value)) return "Check downstream availability, timeout budgets, and retry/backoff settings.";
  if (/rate limit|too many requests/.test(value)) return "Review traffic bursts, client throttling, and rate-limit capacity.";
  if (/not found|undefined|null|cannot read/.test(value)) return "Validate required data before use and trace the missing value to its producer.";
  if (/database|query|deadlock/.test(value)) return "Inspect database health, query timing, locks, and connection-pool saturation.";
  if (/permission|unauthori|forbidden/.test(value)) return "Verify credentials, token scope, and authorization policy changes.";
  return level === "FATAL" || level === "ERROR" ? "Start with the common stack frame and correlate nearby service events." : "Correlate the first occurrence with recent traffic or deployment changes.";
}

export function groupLogs(text) {
  const entries = splitEntries(text);
  const map = new Map();
  entries.forEach((entry, index) => {
    const pattern = normalizeEntry(entry);
    const key = pattern.toLowerCase();
    const item = { entry, index, timestamp: timestampOf(entry), context: contextOf(entry), stackFrame: stackFrameOf(entry) };
    const existing = map.get(key);
    if (existing) existing.items.push(item);
    else map.set(key, { id: key, pattern, level: detectLevel(entry), items: [item] });
  });
  return [...map.values()].map((group) => {
    const times = group.items.map((item) => item.timestamp).filter(Boolean).sort();
    const contexts = [...new Set(group.items.map((item) => item.context).filter(Boolean))];
    const frames = group.items.map((item) => item.stackFrame).filter(Boolean);
    const commonStackFrame = frames.sort((a, b) => frames.filter((x) => x === b).length - frames.filter((x) => x === a).length)[0] ?? null;
    const midpoint = Math.max(1, Math.ceil(entries.length / 2));
    const early = group.items.filter((item) => item.index < midpoint).length;
    const late = group.items.length - early;
    const trend = group.items.length < 2 ? "Single" : late > early ? "Increasing" : late < early ? "Decreasing" : "Stable";
    const epoch = times.map((time) => Date.parse(time));
    const burst = epoch.some((time, index) => index > 0 && time - epoch[index - 1] <= 60000);
    return { ...group, count: group.items.length, examples: group.items.map((item) => item.entry), firstIndex: group.items[0].index, lastIndex: group.items.at(-1).index, firstSeen: times[0] ?? null, lastSeen: times.at(-1) ?? null, trend, burst, contexts, commonStackFrame, suggestion: suggestionFor(group.pattern, group.level) };
  }).sort((a, b) => b.count - a.count || a.firstIndex - b.firstIndex);
}

export function serializableGroups(groups) {
  return groups.map(({ id, items, firstIndex, lastIndex, ...group }) => group);
}

export function groupsToCsv(groups) {
  const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const headers = ["pattern", "severity", "count", "first_seen", "last_seen", "trend", "burst", "services_modules", "common_stack_frame", "heuristic_suggestion", "example"];
  return [headers.map(cell).join(","), ...groups.map((g) => [g.pattern, g.level, g.count, g.firstSeen, g.lastSeen, g.trend, g.burst, g.contexts.join("; "), g.commonStackFrame, g.suggestion, g.examples[0]].map(cell).join(","))].join("\n");
}

export function groupsToMarkdown(groups) {
  return ["# Error log pattern report", "", `Generated: ${new Date().toISOString()}`, "", ...groups.flatMap((g, index) => [`## ${index + 1}. ${g.pattern}`, "", `- Severity: ${g.level}`, `- Occurrences: ${g.count}`, `- First / last seen: ${g.firstSeen ?? "Unknown"} / ${g.lastSeen ?? "Unknown"}`, `- Trend: ${g.trend}${g.burst ? " (burst detected)" : ""}`, `- Services/modules: ${g.contexts.join(", ") || "Unknown"}`, `- Common stack frame: ${g.commonStackFrame ?? "None detected"}`, `- Heuristic suggestion: ${g.suggestion}`, "", "```text", g.examples[0], "```", ""] )].join("\n");
}
