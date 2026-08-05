/**
 * Top 49 — image URL construction.
 *
 * All photography is served from images.unsplash.com, which is already
 * allow-listed in next.config.mjs `images.remotePatterns`. Every consumer goes
 * through <T49Image>, which renders a styled, category-tinted fallback if a
 * remote image ever fails to load — so a bad id degrades gracefully instead of
 * leaving a broken frame.
 */

const UNSPLASH = 'https://images.unsplash.com/photo-';

/**
 * Build an Unsplash CDN url.
 * @param {string} id  Unsplash photo id, e.g. "1489599849927-2ee91cede3ba"
 * @param {{w?: number, h?: number, q?: number, fit?: string}} [opts]
 */
export function photo(id, opts = {}) {
  if (!id) return null;
  const { w = 1200, h, q = 75, fit = 'crop' } = opts;
  const params = new URLSearchParams({
    auto: 'format',
    fit,
    w: String(w),
    q: String(q),
  });
  if (h) params.set('h', String(h));
  return `${UNSPLASH}${id}?${params.toString()}`;
}

/** Responsive `sizes` presets, matching the grid breakpoints in top49.css. */
export const sizes = {
  hero: '100vw',
  band: '(max-width: 833px) 100vw, 50vw',
  card3: '(max-width: 640px) 50vw, (max-width: 1068px) 33vw, 400px',
  card4: '(max-width: 640px) 50vw, (max-width: 833px) 50vw, (max-width: 1068px) 33vw, 320px',
  card6: '(max-width: 419px) 100vw, (max-width: 833px) 50vw, (max-width: 1068px) 25vw, 220px',
  rail: '(max-width: 640px) 78vw, 320px',
  thumb: '96px',
  poster: '(max-width: 640px) 40vw, 220px',
};

/**
 * Deterministic tint for the image fallback.
 *
 * The fallback stays inside the shared semantic palette. Its deterministic
 * tone still varies per entry so adjacent plates remain easy to distinguish.
 */
const FALLBACK_TONES = [
  {
    backgroundImage: 'linear-gradient(145deg, var(--surface-soft), var(--primary-soft))',
    color: 'var(--primary-text)',
  },
  {
    backgroundImage: 'linear-gradient(145deg, var(--secondary-soft), var(--surface-soft))',
    color: 'var(--secondary-foreground)',
  },
  {
    backgroundImage: 'linear-gradient(145deg, var(--info-soft), var(--surface-soft))',
    color: 'var(--info-text)',
  },
];

export function fallbackStyle(seed = '') {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return { ...FALLBACK_TONES[Math.abs(h) % FALLBACK_TONES.length] };
}

const VERIFIED_FALLBACKS = [
  '1566577739112-5180d4bf9390',
  '1587280501635-68a0e82cd5ff',
  '1541534741688-6078c6bfb5c5',
  '1574629810360-7efbbe195018',
  '1579952363873-27f3bade9f55',
  '1518091043644-c1d4457512c6',
  '1461896836934-ffe607ba8211',
  '1511512578047-dfb367046420',
  '1550745165-9bc0b252726f',
  '1526738549149-8e07eca6c147',
  '1505740420928-5e560c06d30e',
  '1523275335684-37898b6baf30',
  '1512496015851-a90fb38ba796',
  '1507525428034-b723cf961d3e',
];

export function fallbackPhoto(seed = '', opts = {}) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % VERIFIED_FALLBACKS.length;
  return photo(VERIFIED_FALLBACKS[idx], opts);
}
