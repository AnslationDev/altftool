const SIGNALS = Object.freeze([
  {
    key: "api-key",
    label: "API or access key",
    pattern:
      /\b(?:sk-[a-z0-9_-]{16,}|gh[opusr]_[a-z0-9]{20,}|AKIA[A-Z0-9]{16}|xox[baprs]-[a-z0-9-]{12,})\b/gi,
  },
  {
    key: "labelled-secret",
    label: "Labelled password or token",
    pattern: /\b(?:password|passwd|secret|token|api[_ -]?key)\s*[:=]\s*\S{4,}/gi,
  },
  {
    key: "otp",
    label: "OTP or verification code",
    pattern: /\b(?:otp|one[- ]time|verification|security|passcode)\D{0,16}\d{4,8}\b/gi,
  },
  {
    key: "email",
    label: "Email address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    key: "phone",
    label: "Phone-like number",
    pattern: /(?<!\d)(?:\+?\d[\s().-]*){10,15}(?!\d)/g,
  },
  {
    key: "payment-card",
    label: "Payment-card-like number",
    pattern: /(?<!\d)(?:\d[ -]?){13,19}(?!\d)/g,
  },
]);

function matchCount(text, pattern) {
  pattern.lastIndex = 0;
  let count = 0;
  while (pattern.exec(text)) {
    count += 1;
    if (count >= 99) break;
  }
  pattern.lastIndex = 0;
  return count;
}

export function classifyClipboardText(value) {
  const text = String(value || "").slice(0, 100_000);
  const signals = SIGNALS.map((signal) => ({
    key: signal.key,
    label: signal.label,
    count: matchCount(text, signal.pattern),
  })).filter((signal) => signal.count > 0);

  return {
    characterCount: text.length,
    signalCount: signals.reduce((sum, signal) => sum + signal.count, 0),
    signals,
    truncated: String(value || "").length > text.length,
  };
}

export function normalizeExpirySeconds(value) {
  const seconds = Math.round(Number(value));
  if (!Number.isFinite(seconds)) return 60;
  return Math.min(3600, Math.max(10, seconds));
}

export function formatCountdown(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
