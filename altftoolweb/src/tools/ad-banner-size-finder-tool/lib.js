/**
 * Ad Banner Size Finder — catalogue of standard ad creative dimensions plus the
 * geometry helpers (aspect ratio, orientation, scaling, nearest-standard match).
 *
 * Sizes come from the published specs of each network:
 *   - IAB New Ad Portfolio / IAB Standard Ad Unit Portfolio (the 300x250,
 *     728x90, 160x600 … family every display network inherited).
 *   - Google Ads image-ad specifications (uploaded display ads, 150 KB cap).
 *   - Google responsive display ads (landscape 1.91:1, square 1:1, logo 1:1/4:1).
 *   - Meta Ads (Facebook / Instagram) recommended feed, story and reel sizes.
 *   - LinkedIn, X, Pinterest, TikTok and YouTube ad specs.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Google Ads caps every uploaded display image ad at 150 KB. */
export const GOOGLE_UPLOADED_IMAGE_MAX_KB = 150;

/** Google responsive display assets are capped at 5120 KB (5 MB). */
export const GOOGLE_RESPONSIVE_MAX_KB = 5120;

/** Meta, LinkedIn and X all publish a 5 MB (5120 KB) image ceiling. */
export const SOCIAL_IMAGE_MAX_KB = 5120;

/** Pixel-density multiplier used for the "export at 2x" recommendation. */
export const RETINA_SCALE = 2;

/**
 * The catalogue. Every entry is a real, published placement size.
 * `maxFileKb` is the network's stated ceiling for a static image in that slot.
 */
export const AD_SIZES = [
  // ---- IAB / Google Display Network — desktop ----
  { id: "medium-rectangle", name: "Medium Rectangle", width: 300, height: 250, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "The highest-inventory display unit; works inside and below article text." },
  { id: "large-rectangle", name: "Large Rectangle", width: 336, height: 280, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Same slot as 300x250 on wider content columns." },
  { id: "leaderboard", name: "Leaderboard", width: 728, height: 90, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Classic header banner above desktop content." },
  { id: "large-leaderboard", name: "Large Leaderboard", width: 970, height: 90, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Wide header for 970px content grids." },
  { id: "billboard", name: "Billboard", width: 970, height: 250, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Premium above-the-fold desktop unit." },
  { id: "half-page", name: "Half Page", width: 300, height: 600, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Tall sidebar unit, strong viewability." },
  { id: "wide-skyscraper", name: "Wide Skyscraper", width: 160, height: 600, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Narrow sidebar rail." },
  { id: "skyscraper", name: "Skyscraper", width: 120, height: 600, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Legacy narrow rail, low remaining inventory." },
  { id: "vertical-banner", name: "Vertical Banner", width: 120, height: 240, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Small vertical filler unit." },
  { id: "square", name: "Square", width: 250, height: 250, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Fits sidebars too narrow for 300px." },
  { id: "small-square", name: "Small Square", width: 200, height: 200, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Compact square for dense grids." },
  { id: "banner", name: "Banner", width: 468, height: 60, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "The original web banner; still accepted." },
  { id: "half-banner", name: "Half Banner", width: 234, height: 60, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Half-width strip banner." },
  { id: "vertical-rectangle", name: "Vertical Rectangle", width: 240, height: 400, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Mid-height sidebar unit." },
  { id: "portrait", name: "Portrait", width: 300, height: 1050, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Full-rail portrait unit." },
  { id: "large-rectangle-580", name: "Large Rectangle (580x400)", width: 580, height: 400, platform: "Google Display", family: "IAB standard", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Netboard-style in-content unit." },

  // ---- Mobile display ----
  { id: "mobile-banner", name: "Mobile Banner", width: 320, height: 50, platform: "Google Display", family: "Mobile", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Anchored mobile banner, the default phone unit." },
  { id: "large-mobile-banner", name: "Large Mobile Banner", width: 320, height: 100, platform: "Google Display", family: "Mobile", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Double-height mobile banner." },
  { id: "small-mobile-banner", name: "Small Mobile Banner", width: 300, height: 50, platform: "Google Display", family: "Mobile", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Legacy narrow phone banner." },
  { id: "mobile-interstitial-portrait", name: "Mobile Interstitial (portrait)", width: 320, height: 480, platform: "Google Display", family: "Mobile", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Full-screen phone interstitial." },
  { id: "mobile-interstitial-landscape", name: "Mobile Interstitial (landscape)", width: 480, height: 320, platform: "Google Display", family: "Mobile", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Landscape phone interstitial." },
  { id: "tablet-interstitial-portrait", name: "Tablet Interstitial (portrait)", width: 768, height: 1024, platform: "Google Display", family: "Mobile", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Full-screen tablet interstitial." },
  { id: "tablet-interstitial-landscape", name: "Tablet Interstitial (landscape)", width: 1024, height: 768, platform: "Google Display", family: "Mobile", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Landscape tablet interstitial." },

  // ---- Google responsive display ----
  { id: "gads-responsive-landscape", name: "Responsive Display — landscape", width: 1200, height: 628, platform: "Google Responsive", family: "Responsive asset", maxFileKb: GOOGLE_RESPONSIVE_MAX_KB, note: "1.91:1 marketing image; minimum accepted is 600x314." },
  { id: "gads-responsive-square", name: "Responsive Display — square", width: 1200, height: 1200, platform: "Google Responsive", family: "Responsive asset", maxFileKb: GOOGLE_RESPONSIVE_MAX_KB, note: "1:1 marketing image; minimum accepted is 300x300." },
  { id: "gads-responsive-portrait", name: "Responsive Display — portrait", width: 960, height: 1200, platform: "Google Responsive", family: "Responsive asset", maxFileKb: GOOGLE_RESPONSIVE_MAX_KB, note: "4:5 marketing image." },
  { id: "gads-logo-square", name: "Responsive Display — square logo", width: 1200, height: 1200, platform: "Google Responsive", family: "Responsive asset", maxFileKb: GOOGLE_RESPONSIVE_MAX_KB, note: "1:1 logo; minimum accepted is 128x128." },
  { id: "gads-logo-wide", name: "Responsive Display — wide logo", width: 1200, height: 300, platform: "Google Responsive", family: "Responsive asset", maxFileKb: GOOGLE_RESPONSIVE_MAX_KB, note: "4:1 logo; minimum accepted is 512x128." },

  // ---- Meta ----
  { id: "meta-feed-square", name: "Facebook / Instagram feed — square", width: 1080, height: 1080, platform: "Meta", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "1:1 feed image, the safest single upload for both apps." },
  { id: "meta-feed-portrait", name: "Facebook / Instagram feed — portrait", width: 1080, height: 1350, platform: "Meta", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "4:5 portrait, the tallest crop the feed will show." },
  { id: "meta-story", name: "Stories & Reels", width: 1080, height: 1920, platform: "Meta", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "9:16 full screen; keep text inside the middle 1080x1420." },
  { id: "meta-link", name: "Facebook link / right column", width: 1200, height: 628, platform: "Meta", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "1.91:1 link-share and right-hand-column image." },
  { id: "meta-carousel", name: "Carousel card", width: 1080, height: 1080, platform: "Meta", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "1:1 per card; every card must use the same ratio." },

  // ---- LinkedIn ----
  { id: "linkedin-single-image", name: "LinkedIn single image ad", width: 1200, height: 627, platform: "LinkedIn", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "1.91:1 sponsored content image." },
  { id: "linkedin-square", name: "LinkedIn square ad", width: 1200, height: 1200, platform: "LinkedIn", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "1:1 sponsored content, taller in the mobile feed." },
  { id: "linkedin-spotlight", name: "LinkedIn spotlight logo", width: 100, height: 100, platform: "LinkedIn", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "Logo for spotlight and follower ads." },

  // ---- X (Twitter) ----
  { id: "x-landscape", name: "X image ad — landscape", width: 1600, height: 900, platform: "X", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "16:9 single image ad." },
  { id: "x-square", name: "X image ad — square", width: 1200, height: 1200, platform: "X", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "1:1 single image ad." },

  // ---- Pinterest & TikTok ----
  { id: "pinterest-standard", name: "Pinterest standard Pin", width: 1000, height: 1500, platform: "Pinterest", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "2:3 is the only ratio Pinterest shows uncropped." },
  { id: "tiktok-in-feed", name: "TikTok in-feed ad", width: 1080, height: 1920, platform: "TikTok", family: "Social", maxFileKb: SOCIAL_IMAGE_MAX_KB, note: "9:16 full screen video or image." },

  // ---- YouTube ----
  { id: "youtube-overlay", name: "YouTube in-video overlay", width: 480, height: 70, platform: "YouTube", family: "Video", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Overlay strip across the bottom of the player." },
  { id: "youtube-companion", name: "YouTube companion banner", width: 300, height: 250, platform: "YouTube", family: "Video", maxFileKb: GOOGLE_UPLOADED_IMAGE_MAX_KB, note: "Sits beside the player on desktop." },
  { id: "youtube-thumbnail", name: "YouTube video thumbnail", width: 1280, height: 720, platform: "YouTube", family: "Video", maxFileKb: 2048, note: "16:9 thumbnail; YouTube caps thumbnails at 2 MB." },
];

/** Distinct platforms in catalogue order. */
export const PLATFORMS = AD_SIZES.reduce((list, size) => {
  if (!list.includes(size.platform)) list.push(size.platform);
  return list;
}, []);

/** Orientation buckets offered by the filter. */
export const ORIENTATIONS = ["all", "landscape", "portrait", "square"];

const isPositiveInt = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/** Euclid's algorithm, used to reduce width:height to lowest terms. */
export function greatestCommonDivisor(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y > 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/**
 * Reduce width:height to lowest terms and give the decimal ratio.
 * @returns {{ w:number, h:number, label:string, decimal:number } | { error:string }}
 */
export function getAspectRatio(width, height) {
  if (!isPositiveInt(width) || !isPositiveInt(height)) {
    return { error: "Enter a width and height greater than zero." };
  }
  const divisor = greatestCommonDivisor(width, height) || 1;
  const w = Math.round(width) / divisor;
  const h = Math.round(height) / divisor;
  return { w, h, label: `${w}:${h}`, decimal: width / height };
}

/** landscape | portrait | square, from the raw pixel dimensions. */
export function orientationOf(width, height) {
  if (!isPositiveInt(width) || !isPositiveInt(height)) return "unknown";
  if (width === height) return "square";
  return width > height ? "landscape" : "portrait";
}

/**
 * Full metric sheet for one catalogue entry (or any custom size).
 * @returns {object | { error:string }}
 */
export function describeAdSize(size) {
  if (!size || !isPositiveInt(size.width) || !isPositiveInt(size.height)) {
    return { error: "That size has no usable width and height." };
  }
  const ratio = getAspectRatio(size.width, size.height);
  const pixels = size.width * size.height;
  return {
    ...size,
    pixels,
    megapixels: pixels / 1e6,
    aspectLabel: ratio.error ? "—" : ratio.label,
    aspectDecimal: ratio.error ? null : ratio.decimal,
    orientation: orientationOf(size.width, size.height),
    retinaWidth: size.width * RETINA_SCALE,
    retinaHeight: size.height * RETINA_SCALE,
    /** Bytes per pixel you may spend to stay inside the network's cap. */
    bytesPerPixelBudget: size.maxFileKb ? (size.maxFileKb * 1024) / pixels : null,
  };
}

/**
 * Search + filter the catalogue.
 * @param {{query?:string, platform?:string, orientation?:string}} options
 * @returns {object[]} described sizes (never null; an empty array when nothing matches)
 */
export function filterAdSizes({ query = "", platform = "all", orientation = "all" } = {}) {
  const needle = String(query).trim().toLowerCase();
  return AD_SIZES.filter((size) => {
    if (platform !== "all" && size.platform !== platform) return false;
    if (orientation !== "all" && orientationOf(size.width, size.height) !== orientation) return false;
    if (!needle) return true;
    const haystack = `${size.name} ${size.platform} ${size.family} ${size.width}x${size.height} ${size.width} ${size.height}`.toLowerCase();
    return haystack.includes(needle);
  }).map((size) => describeAdSize(size));
}

/** Look one entry up by id. */
export function getAdSizeById(id) {
  const found = AD_SIZES.find((size) => size.id === id);
  if (!found) return { error: "No standard size has that id." };
  return describeAdSize(found);
}

/**
 * Rank the catalogue against a custom size. Distance is dominated by aspect
 * ratio (a 300x250 asset drops cleanly into any 6:5 slot) and broken by area.
 *
 * score = |ln(ratio_custom / ratio_candidate)| + 0.25 * |ln(area_custom / area_candidate)|
 *
 * Logs are used so "twice as wide" and "half as wide" are penalised equally.
 *
 * @returns {object[] | { error:string }}
 */
export const AREA_WEIGHT = 0.25;

export function findClosestSizes(width, height, limit = 5) {
  if (!isPositiveInt(width) || !isPositiveInt(height)) {
    return { error: "Enter a custom width and height greater than zero." };
  }
  const count = isPositiveInt(limit) ? Math.min(Math.round(limit), AD_SIZES.length) : 5;
  const ratio = width / height;
  const area = width * height;

  return AD_SIZES.map((size) => {
    const candidateRatio = size.width / size.height;
    const ratioPenalty = Math.abs(Math.log(ratio / candidateRatio));
    const areaPenalty = Math.abs(Math.log(area / (size.width * size.height)));
    return {
      ...describeAdSize(size),
      matchScore: ratioPenalty + AREA_WEIGHT * areaPenalty,
      ratioDeltaPercent: (candidateRatio / ratio - 1) * 100,
      exact: size.width === Math.round(width) && size.height === Math.round(height),
    };
  })
    .sort((a, b) => a.matchScore - b.matchScore)
    .slice(0, count);
}

/**
 * Fit a source creative inside a target slot without distortion (contain fit).
 * @returns {{ width:number, height:number, scale:number, letterboxX:number, letterboxY:number } | { error:string }}
 */
export function scaleToFit(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  if (!isPositiveInt(sourceWidth) || !isPositiveInt(sourceHeight)) {
    return { error: "Enter a source width and height greater than zero." };
  }
  if (!isPositiveInt(targetWidth) || !isPositiveInt(targetHeight)) {
    return { error: "Enter a target width and height greater than zero." };
  }
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  return {
    width,
    height,
    scale,
    letterboxX: Math.max(0, targetWidth - width),
    letterboxY: Math.max(0, targetHeight - height),
  };
}
