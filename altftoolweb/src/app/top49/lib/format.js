/**
 * Top 49 — value formatting + deterministic helpers.
 *
 * Everything here must be pure and deterministic. These helpers run on both the
 * server and the client, so any randomness would produce a hydration mismatch.
 */

/** Stable 32-bit hash. Same string always yields the same number. */
export function hash(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic float in [0, 1) derived from a seed string. */
export function seeded(seed) {
  return (hash(seed) % 100000) / 100000;
}

/** Deterministic integer in [min, max]. */
export function seededInt(seed, min, max) {
  return min + Math.floor(seeded(seed) * (max - min + 1));
}

/**
 * URL-safe slug.
 *
 * `+` and `#` are spelled out rather than stripped. Dropping them collapses
 * genuinely different entries onto one slug — "C", "C++" and "C#" all became
 * `c`, and "Galaxy S25" and "Galaxy S25+" both became `samsung-galaxy-s25`,
 * which silently merged them into a single item record.
 */
export function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

/** 1234567 → "1.2M" */
export function compactNumber(value) {
  const n = Number(value) || 0;
  if (n >= 1_000_000_000) return `${trim(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim(n / 1_000)}K`;
  return String(n);
}

function trim(n) {
  return n >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
}

/** 1234567 → "1,234,567" */
export function groupedNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

/** 146 → "2h 26m" */
export function duration(minutes) {
  const m = Number(minutes) || 0;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (!h) return `${rest}m`;
  if (!rest) return `${h}h`;
  return `${h}h ${rest}m`;
}

/** ISO date → "1 Jul 2026" */
export function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** ISO date → "Updated 2 months ago" style relative label. */
export function relativeDate(iso, now = Date.now()) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.max(0, Math.round((now - then) / 86_400_000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return months === 1 ? 'last month' : `${months} months ago`;
  const years = Math.round(months / 12);
  return years === 1 ? 'last year' : `${years} years ago`;
}

/**
 * Format an attribute value according to its declared format.
 * @param {{value: any, format?: string, unit?: string}} attr
 */
export function formatValue(attr) {
  if (!attr || attr.value === null || attr.value === undefined || attr.value === '') {
    return '—';
  }
  const { value, format, unit } = attr;
  switch (format) {
    case 'year':
      return String(value);
    case 'duration':
      return duration(value);
    case 'rating':
      return `${Number(value).toFixed(1)}`;
    case 'score':
      return Number(value).toFixed(1);
    case 'number':
      return groupedNumber(value);
    case 'compact':
      return compactNumber(value);
    case 'currency':
      return `$${groupedNumber(value)}`;
    case 'price':
      return typeof value === 'number' ? `$${groupedNumber(value)}` : String(value);
    case 'percent':
      return `${value}%`;
    case 'measure':
      return unit ? `${value} ${unit}` : String(value);
    default:
      return unit ? `${value} ${unit}` : String(value);
  }
}

/** Rank movement descriptor used by the trend badge. */
export function rankDelta(rank, previousRank) {
  if (previousRank === null || previousRank === undefined) {
    return { kind: 'new', amount: 0, label: 'New entry' };
  }
  const diff = previousRank - rank;
  if (diff === 0) return { kind: 'flat', amount: 0, label: 'No change' };
  if (diff > 0) return { kind: 'up', amount: diff, label: `Up ${diff}` };
  return { kind: 'down', amount: -diff, label: `Down ${-diff}` };
}

/** "The Shining" → "TS" — used by the image fallback. */
export function initials(name = '') {
  const words = String(name)
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '49';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** Ordinal label: 1 → "1st". */
export function ordinal(n) {
  const v = Number(n);
  const s = ['th', 'st', 'nd', 'rd'];
  const k = v % 100;
  return v + (s[(k - 20) % 10] || s[k] || s[0]);
}

/** Zero-padded rank used in badges: 7 → "07". */
export function padRank(n) {
  return Number(n) < 10 ? `0${n}` : String(n);
}
