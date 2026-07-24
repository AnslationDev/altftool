export function getScoreTone(score = 0) {
  if (score >= 90) return "text-[var(--success)] bg-[var(--success-soft)] border-[var(--success)]/30";
  if (score >= 75) return "text-[var(--warning)] bg-[var(--warning-soft)] border-[var(--warning)]/30";
  return "text-[var(--danger)] bg-[var(--danger-soft)] border-[var(--danger)]/30";
}

export function getScoreColor(score = 0) {
  if (score >= 90) return "var(--success)";
  if (score >= 75) return "var(--warning)";
  return "var(--danger)";
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
    ? "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]"
    : "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]";
}

export function getQualityTone(quality) {
  if (quality === "fail") return "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]";
  if (quality === "warn") return "border-[var(--warning)]/30 bg-[var(--warning-soft)] text-[var(--warning)]";
  if (quality === "slow") return "border-[var(--info)]/30 bg-[var(--info-soft)] text-[var(--info)]";
  return "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]";
}

export function getGateTone(status) {
  if (status === "block" || status === "blocked") return "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]";
  if (status === "warn" || status === "watch") return "border-[var(--warning)]/30 bg-[var(--warning-soft)] text-[var(--warning)]";
  return "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]";
}

export function getGateSurface(status) {
  if (status === "block" || status === "blocked") return "border-[var(--danger)]/20 bg-[var(--danger-soft)]";
  if (status === "warn" || status === "watch") return "border-[var(--warning)]/20 bg-[var(--warning-soft)]";
  return "border-[var(--success)]/20 bg-[var(--success-soft)]";
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
  if (delta > 0) return "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]";
  if (delta < 0) return "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]";
  return "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]";
}

export function formatDelta(delta = 0) {
  const value = Number(delta || 0);
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `-${formatNumber(Math.abs(value))}`;
  return "0";
}
