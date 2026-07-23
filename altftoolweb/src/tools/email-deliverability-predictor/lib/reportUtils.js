// Report export (copy/download) + localStorage history, following the same
// safeGet/safeSet + Blob-download patterns used across this repo's tools.

const HISTORY_KEY = "edp_history";
const MAX_HISTORY = 12;

function safeGet(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — fail silently
  }
}

export function getHistory() {
  return safeGet(HISTORY_KEY, []);
}

export function pushHistory(entry) {
  const deduped = getHistory().filter((e) => e.subject !== entry.subject || e.body !== entry.body);
  const next = [
    { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ts: Date.now() },
    ...deduped,
  ].slice(0, MAX_HISTORY);
  safeSet(HISTORY_KEY, next);
  return next;
}

export function clearHistory() {
  safeSet(HISTORY_KEY, []);
  return [];
}

export function buildReportText(result) {
  const lines = [
    "EMAIL DELIVERABILITY REPORT",
    "=".repeat(42),
    `Subject: ${result.subject || "(none)"}`,
    `Overall Deliverability Score: ${result.overallScore}/100 (${result.riskLevel})`,
    `Estimated Inbox Probability: ~${result.inboxProbability}%`,
    `Spam Risk: ${result.spamRisk}/100`,
    "",
    "NOTE: This is a content-based prediction, not a measurement of real",
    "inbox placement. Sender reputation and SPF/DKIM/DMARC also matter.",
    "",
    "CATEGORY SCORES",
    "-".repeat(42),
    ...result.categoryScores.map((c) => `${c.label}: ${c.score}/100`),
    "",
    `ISSUES (${result.issues.length})`,
    "-".repeat(42),
    ...result.issues.flatMap((i, idx) => [
      `${idx + 1}. [${i.severity.toUpperCase()}] ${i.title}`,
      ...(i.detail ? [`   ${i.detail}`] : []),
      `   Why: ${i.why}`,
      `   Fix: ${i.fix}`,
      "",
    ]),
    "RECOMMENDATIONS",
    "-".repeat(42),
    ...result.recommendations.map((r, i) => `${i + 1}. ${r}`),
  ];
  return lines.join("\n");
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadReportTxt(result) {
  downloadBlob(buildReportText(result), "deliverability-report.txt", "text/plain;charset=utf-8");
}

export function downloadReportJson(result) {
  const { plainText, highlights, ...compact } = result;
  downloadBlob(JSON.stringify({ generatedAt: new Date().toISOString(), ...compact }, null, 2), "deliverability-report.json", "application/json;charset=utf-8");
}
