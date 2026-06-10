export function getScoreTone(score = 0) {
  if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 75) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

export function getScoreColor(score = 0) {
  if (score >= 90) return "#059669";
  if (score >= 75) return "#d97706";
  return "#e11d48";
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

export function formatDuration(value) {
  const duration = Number(value || 0);
  if (duration >= 1000) return `${(duration / 1000).toFixed(duration >= 10000 ? 0 : 1)}s`;
  return `${formatNumber(duration)}ms`;
}

export function formatDate(value) {
  if (!value) return "Not generated";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatStatus(value) {
  const label = String(value || "unknown").replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shortSha(value) {
  return value ? String(value).slice(0, 8) : "Not exposed";
}

export function getSignalTone(ok) {
  return ok
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";
}

export function getQualityTone(quality) {
  if (quality === "fail") return "border-rose-200 bg-rose-50 text-rose-700";
  if (quality === "warn") return "border-amber-200 bg-amber-50 text-amber-800";
  if (quality === "slow") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function getGateTone(status) {
  if (status === "block" || status === "blocked") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "warn" || status === "watch") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function getGateSurface(status) {
  if (status === "block" || status === "blocked") return "border-rose-100 bg-rose-50";
  if (status === "warn" || status === "watch") return "border-amber-100 bg-amber-50";
  return "border-emerald-100 bg-emerald-50";
}

export function formatGateStatus(status) {
  if (!status || status === "unknown") return "Unknown";
  if (status === "block" || status === "blocked") return "Blocked";
  if (status === "ready-with-warnings") return "Ready with warnings";
  if (status === "ready") return "Ready";
  if (status === "warn" || status === "watch") return "Watch";
  return "Pass";
}

export function formatQualityLabel(quality) {
  if (quality === "fail") return "Fail";
  if (quality === "warn") return "Warning";
  if (quality === "slow") return "Slow";
  return "Pass";
}

export function getTrendTone(delta = 0) {
  if (delta > 0) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (delta < 0) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-gray-200 bg-gray-50 text-gray-700";
}

export function formatDelta(delta = 0) {
  const value = Number(delta || 0);
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `-${formatNumber(Math.abs(value))}`;
  return "0";
}
