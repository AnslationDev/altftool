export function normalizePublishedAt(value) {
  if (!value) return null;
  const timestamp = Date.parse(String(value));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export function getNewsHoursAgo(value, now = Date.now()) {
  const publishedAt = normalizePublishedAt(value);
  if (!publishedAt) return null;
  return Math.max(0, Math.round((now - Date.parse(publishedAt)) / 36e5));
}

function finiteHours(article) {
  const hours = Number(article?.published_hours_ago);
  return article?.published_hours_ago !== null &&
    article?.published_hours_ago !== undefined &&
    Number.isFinite(hours) &&
    hours >= 0
    ? hours
    : Number.POSITIVE_INFINITY;
}

export function compareNewsNewestFirst(a, b) {
  const aPublishedAt = normalizePublishedAt(a?.published_at);
  const bPublishedAt = normalizePublishedAt(b?.published_at);

  if (aPublishedAt && bPublishedAt) {
    return Date.parse(bPublishedAt) - Date.parse(aPublishedAt);
  }
  if (aPublishedAt) return -1;
  if (bPublishedAt) return 1;
  return finiteHours(a) - finiteHours(b);
}
