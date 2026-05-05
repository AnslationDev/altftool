export function toMillis(value) {
  if (value == null) return null;

  if (typeof value === "number") {
    return value > 1e12 ? value : value * 1000;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }

  if (typeof value?._seconds === "number") {
    return value._seconds * 1000;
  }

  return null;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function formatDateTime(value) {
  const millis = toMillis(value);
  if (!millis) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(millis);
}

export function formatRelativeTime(value) {
  const millis = toMillis(value);
  if (!millis) return "No recent activity";

  const diffMs = millis - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round(diffMs / 60000);

  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");

  const hours = Math.round(diffMs / 3600000);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");

  const days = Math.round(diffMs / 86400000);
  if (Math.abs(days) < 30) return rtf.format(days, "day");

  const months = Math.round(diffMs / (86400000 * 30));
  return rtf.format(months, "month");
}

export function daysSince(value) {
  const millis = toMillis(value);
  if (!millis) return null;
  return Math.floor((Date.now() - millis) / 86400000);
}

export function getFreshnessStatus(value, staleDays = 5) {
  const ageInDays = daysSince(value);

  if (ageInDays == null) {
    return { tone: "idle", label: "No data" };
  }

  if (ageInDays >= staleDays) {
    return { tone: "danger", label: "Stale" };
  }

  if (ageInDays >= Math.max(2, staleDays - 2)) {
    return { tone: "warning", label: "Watch" };
  }

  return { tone: "success", label: "Healthy" };
}

export function getCoverageMeta(coverage) {
  if (coverage === "exact") {
    return {
      label: "Exact coverage",
      chipClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (coverage === "partial") {
    return {
      label: "Partial coverage",
      chipClass: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Unavailable",
    chipClass: "bg-rose-50 text-rose-700 border-rose-200",
  };
}

export function sortByTimestampDesc(items, key = "timestampMs") {
  return [...items].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
}

export function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function pickDisplayTitle(data, titleFields = []) {
  for (const key of titleFields) {
    const value = data?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  if (typeof data?.id === "string" && data.id) {
    return data.id;
  }

  return "Untitled item";
}

export function buildSourceId(parts) {
  return parts.filter(Boolean).join(":");
}

export function clampList(items, size) {
  return items.slice(0, size);
}
