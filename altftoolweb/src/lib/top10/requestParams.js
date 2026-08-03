const DEFAULT_MAX_TEXT_LENGTH = 120;
const MAX_PAGE = 5;

export function top10Type(searchParams, allowed, fallback, key = "type") {
  const value = searchParams.get(key) || fallback;
  return allowed.includes(value) ? value : fallback;
}

export function top10Text(searchParams, key, maxLength = DEFAULT_MAX_TEXT_LENGTH) {
  return (searchParams.get(key) || "").trim().slice(0, maxLength);
}

export function top10Choice(searchParams, key, allowed, fallback = "") {
  const value = top10Text(searchParams, key);
  return allowed.includes(value) ? value : fallback;
}

export function top10Page(searchParams) {
  const value = Number.parseInt(searchParams.get("page") || "1", 10);
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_PAGE, Math.max(1, value));
}
