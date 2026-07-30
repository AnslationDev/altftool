/**
 * Screen and display fingerprint analysis.
 *
 * Every site you open can read window.screen and window.devicePixelRatio
 * without a permission prompt. This module takes those raw readings as plain
 * arguments and works out what they give away:
 *
 *  - the exact and nearest-standard aspect ratio,
 *  - the physical pixel grid behind the CSS pixel grid,
 *  - how much screen space the OS chrome (taskbar, dock, menu bar) occupies,
 *    which is itself a stable per-machine value,
 *  - which readings sit inside a common bucket and which stand out,
 *  - a stable short id derived with FNV-1a, so you can see the same
 *    combination produce the same id on every reload.
 *
 * Pure: no DOM access, no clock, no randomness. The component reads the
 * browser and passes the numbers in.
 */

/* ------------------------------------------------------------------ */
/* Reference buckets                                                   */
/* ------------------------------------------------------------------ */

/**
 * Screen sizes that appear constantly in browser traffic. A reading inside
 * this set puts you in a crowd; a reading outside it does not.
 */
export const COMMON_SCREEN_SIZES = [
  [1920, 1080],
  [1536, 864],
  [1440, 900],
  [1366, 768],
  [1280, 720],
  [1280, 800],
  [1600, 900],
  [1680, 1050],
  [2560, 1440],
  [3840, 2160],
  [360, 640],
  [360, 800],
  [375, 667],
  [375, 812],
  [390, 844],
  [393, 852],
  [412, 915],
  [414, 896],
  [768, 1024],
  [820, 1180],
  [1024, 1366],
];

/** Device pixel ratios shipped by mainstream hardware at 100% browser zoom. */
export const COMMON_DEVICE_PIXEL_RATIOS = [1, 1.25, 1.5, 2, 2.625, 2.75, 3, 3.5];

/**
 * screen.colorDepth is 24 on almost every browser. Firefox and Safari in their
 * anti-fingerprinting modes report 24 unconditionally, and the CSSOM View
 * specification explicitly permits returning 24 instead of the true depth.
 */
export const COMMON_COLOR_DEPTHS = [24];
export const CSSOM_DEFAULT_COLOR_DEPTH = 24;

/**
 * Space the OS keeps for a taskbar, dock or menu bar, in CSS pixels. A macOS
 * menu bar is around 25, a Windows taskbar around 40-48, and a phone or a
 * kiosk reserves nothing. Anything outside this band means an unusual desktop
 * layout — a second bar, a docked panel, a custom shell.
 */
export const TYPICAL_CHROME_RANGE = { min: 20, max: 60 };

export function isTypicalChrome(chromeHeight) {
  if (chromeHeight === 0) return true;
  return chromeHeight >= TYPICAL_CHROME_RANGE.min && chromeHeight <= TYPICAL_CHROME_RANGE.max;
}

/** Aspect ratios worth naming, as width/height decimals. */
export const NAMED_ASPECTS = [
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:10", value: 16 / 10 },
  { label: "16:9", value: 16 / 9 },
  { label: "18:9", value: 2 },
  { label: "19.5:9", value: 19.5 / 9 },
  { label: "20:9", value: 20 / 9 },
  { label: "21:9", value: 21 / 9 },
  { label: "64:27", value: 64 / 27 },
  { label: "32:9", value: 32 / 9 },
];

/** How close a ratio has to be, in decimal terms, to earn a named label. */
export const ASPECT_TOLERANCE = 0.02;

/* ------------------------------------------------------------------ */
/* Small maths helpers                                                 */
/* ------------------------------------------------------------------ */

export function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

/** Exact reduced ratio plus the nearest standard ratio, if one is close. */
export function aspectRatio(width, height) {
  if (!(width > 0) || !(height > 0)) return { error: "Width and height must both be positive." };
  const decimal = width / height;
  // Named ratios are quoted long-side-first, so match on the orientation-free
  // long/short value; a portrait phone is still a 20:9 panel.
  const longShort = Math.max(width, height) / Math.min(width, height);
  const divisor = gcd(width, height) || 1;
  const exact = `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
  let nearest = null;
  let bestGap = Infinity;
  for (const candidate of NAMED_ASPECTS) {
    const gap = Math.abs(candidate.value - longShort);
    if (gap < bestGap) {
      bestGap = gap;
      nearest = candidate.label;
    }
  }
  return {
    decimal,
    exact,
    nearest: bestGap <= ASPECT_TOLERANCE ? nearest : null,
    gap: bestGap,
  };
}

/**
 * FNV-1a, 32-bit. Matches the reference test vectors, e.g. "a" hashes to
 * e40c292c and "foobar" to bf9cf968, so the id here is reproducible anywhere.
 */
export const FNV_OFFSET_BASIS_32 = 0x811c9dc5;
export const FNV_PRIME_32 = 0x01000193;

export function fnv1a32(input) {
  const text = String(input == null ? "" : input);
  let hash = FNV_OFFSET_BASIS_32;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV_PRIME_32);
  }
  return hash >>> 0;
}

export function toHexId(value) {
  return (value >>> 0).toString(16).padStart(8, "0");
}

/* ------------------------------------------------------------------ */
/* Bucket checks                                                       */
/* ------------------------------------------------------------------ */

export function isCommonSize(width, height) {
  return COMMON_SCREEN_SIZES.some(
    ([w, h]) => (w === width && h === height) || (w === height && h === width),
  );
}

export function isCommonRatio(ratio) {
  return COMMON_DEVICE_PIXEL_RATIOS.some((value) => Math.abs(value - ratio) < 0.001);
}

/* ------------------------------------------------------------------ */
/* The analysis                                                        */
/* ------------------------------------------------------------------ */

/** Signals that survive a reload and a window resize are the useful ones. */
export const STABILITY = {
  STABLE: { id: "stable", label: "Stable across sessions" },
  SESSION: { id: "session", label: "Changes when you resize" },
};

const positiveInt = (value) => Number.isFinite(value) && value > 0;

/**
 * signals = {
 *   screenWidth, screenHeight, availWidth, availHeight,
 *   innerWidth, innerHeight, devicePixelRatio, colorDepth, pixelDepth,
 *   orientation
 * }
 */
export function analyseScreen(signals) {
  const s = signals || {};
  const screenWidth = Number(s.screenWidth);
  const screenHeight = Number(s.screenHeight);
  const devicePixelRatio = Number(s.devicePixelRatio);

  if (!positiveInt(screenWidth) || !positiveInt(screenHeight)) {
    return { error: "Screen width and height must both be positive numbers." };
  }
  if (!positiveInt(devicePixelRatio) || devicePixelRatio > 10) {
    return { error: "Device pixel ratio must be greater than 0 and no more than 10." };
  }

  const availWidth = positiveInt(Number(s.availWidth)) ? Number(s.availWidth) : screenWidth;
  const availHeight = positiveInt(Number(s.availHeight)) ? Number(s.availHeight) : screenHeight;
  const innerWidth = positiveInt(Number(s.innerWidth)) ? Number(s.innerWidth) : availWidth;
  const innerHeight = positiveInt(Number(s.innerHeight)) ? Number(s.innerHeight) : availHeight;
  const colorDepth = positiveInt(Number(s.colorDepth)) ? Number(s.colorDepth) : CSSOM_DEFAULT_COLOR_DEPTH;
  const pixelDepth = positiveInt(Number(s.pixelDepth)) ? Number(s.pixelDepth) : colorDepth;

  const aspect = aspectRatio(screenWidth, screenHeight);
  const physicalWidth = Math.round(screenWidth * devicePixelRatio);
  const physicalHeight = Math.round(screenHeight * devicePixelRatio);
  const chromeWidth = Math.max(0, screenWidth - availWidth);
  const chromeHeight = Math.max(0, screenHeight - availHeight);
  const viewportShare = (innerWidth * innerHeight) / (screenWidth * screenHeight);

  const commonSize = isCommonSize(screenWidth, screenHeight);
  const commonRatio = isCommonRatio(devicePixelRatio);
  const commonDepth = COMMON_COLOR_DEPTHS.includes(colorDepth);

  const rows = [
    {
      id: "screen",
      label: "Screen size (CSS pixels)",
      value: `${screenWidth} x ${screenHeight}`,
      stability: STABILITY.STABLE,
      common: commonSize,
      note: commonSize
        ? "A very widely reported size, so on its own it barely narrows you down."
        : "Not one of the common sizes — an unusual monitor or a scaled display stands out.",
    },
    {
      id: "dpr",
      label: "Device pixel ratio",
      value: String(devicePixelRatio),
      stability: STABILITY.STABLE,
      common: commonRatio,
      note: commonRatio
        ? "A standard hardware ratio at 100% zoom."
        : "Non-standard: usually browser zoom or an OS display-scaling setting, and it changes as you zoom.",
    },
    {
      id: "physical",
      label: "Physical pixel grid",
      value: `${physicalWidth} x ${physicalHeight}`,
      stability: STABILITY.STABLE,
      common: commonSize && commonRatio,
      note: "CSS size multiplied by the pixel ratio — the panel resolution a site can infer.",
    },
    {
      id: "avail",
      label: "Available area",
      value: `${availWidth} x ${availHeight}`,
      stability: STABILITY.STABLE,
      common: isTypicalChrome(chromeHeight),
      note:
        chromeWidth === 0 && chromeHeight === 0
          ? "Matches the full screen: no reserved taskbar or dock area is being reported."
          : `The OS reserves ${chromeWidth} x ${chromeHeight} pixels for taskbar, dock or menu bar — a stable per-machine value.`,
    },
    {
      id: "aspect",
      label: "Aspect ratio",
      value: aspect.nearest ? `${aspect.exact} (${aspect.nearest})` : aspect.exact,
      stability: STABILITY.STABLE,
      common: Boolean(aspect.nearest),
      note: aspect.nearest
        ? "A standard panel shape."
        : "Not close to any standard shape, which makes it distinctive on its own.",
    },
    {
      id: "colorDepth",
      label: "Colour depth",
      value: `${colorDepth}-bit (pixel depth ${pixelDepth})`,
      stability: STABILITY.STABLE,
      common: commonDepth,
      note:
        colorDepth === CSSOM_DEFAULT_COLOR_DEPTH
          ? "24 is the near-universal answer, and privacy modes report it unconditionally, so it carries almost no information."
          : "Anything other than 24 is rare and therefore identifying.",
    },
    {
      id: "viewport",
      label: "Viewport size",
      value: `${innerWidth} x ${innerHeight}`,
      stability: STABILITY.SESSION,
      common: false,
      note: `Currently ${(viewportShare * 100).toFixed(1)}% of the screen area. It changes whenever you resize the window or open developer tools, so it is a weaker but very precise signal.`,
    },
    {
      id: "orientation",
      label: "Orientation",
      value: String(s.orientation || (screenWidth >= screenHeight ? "landscape" : "portrait")),
      stability: STABILITY.SESSION,
      common: true,
      note: "Derived from the screen shape; on phones it flips as the device turns.",
    },
  ];

  const stableRows = rows.filter((row) => row.stability === STABILITY.STABLE);
  const distinctive = stableRows.filter((row) => !row.common).length;

  const seed = [
    screenWidth,
    screenHeight,
    availWidth,
    availHeight,
    devicePixelRatio,
    colorDepth,
    pixelDepth,
  ].join("|");

  return {
    rows,
    aspect,
    physicalWidth,
    physicalHeight,
    chromeWidth,
    chromeHeight,
    viewportShare,
    distinctive,
    stableCount: stableRows.length,
    band: exposureBand(distinctive),
    seed,
    id: toHexId(fnv1a32(seed)),
    zoomLikely: !commonRatio,
  };
}

/**
 * Bands describe how many of the stable readings fall outside a common bucket.
 * This is a "how much do you stand out" reading, not a probability of being
 * identified — real identification combines these with dozens of other signals.
 */
export const EXPOSURE_BANDS = [
  {
    min: 3,
    label: "Stands out",
    tone: "danger",
    summary: "Several of your display readings are outside the common buckets.",
  },
  {
    min: 1,
    label: "Somewhat distinctive",
    tone: "warning",
    summary: "Most readings are ordinary, but at least one is unusual.",
  },
  {
    min: 0,
    label: "Blends in",
    tone: "success",
    summary: "Every stable display reading sits in a widely shared bucket.",
  },
];

export function exposureBand(distinctive) {
  return EXPOSURE_BANDS.find((band) => distinctive >= band.min) || EXPOSURE_BANDS[2];
}

/** Sample profiles so the analysis can be compared against typical hardware. */
export const SAMPLE_PROFILES = [
  {
    id: "windows-laptop",
    label: "Typical Windows laptop",
    signals: {
      screenWidth: 1536,
      screenHeight: 864,
      availWidth: 1536,
      availHeight: 816,
      innerWidth: 1536,
      innerHeight: 730,
      devicePixelRatio: 1.25,
      colorDepth: 24,
      pixelDepth: 24,
      orientation: "landscape",
    },
  },
  {
    id: "mac-retina",
    label: "Retina laptop",
    signals: {
      screenWidth: 1440,
      screenHeight: 900,
      availWidth: 1440,
      availHeight: 875,
      innerWidth: 1440,
      innerHeight: 789,
      devicePixelRatio: 2,
      colorDepth: 24,
      pixelDepth: 24,
      orientation: "landscape",
    },
  },
  {
    id: "android-phone",
    label: "Android phone",
    signals: {
      screenWidth: 412,
      screenHeight: 915,
      availWidth: 412,
      availHeight: 915,
      innerWidth: 412,
      innerHeight: 780,
      devicePixelRatio: 2.625,
      colorDepth: 24,
      pixelDepth: 24,
      orientation: "portrait",
    },
  },
];

/** Plain-text copy of the reading. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = ["SCREEN AND DISPLAY FINGERPRINT", `Combination id: ${result.id}`, ""];
  result.rows.forEach((row) => {
    lines.push(`${row.label}: ${row.value}`);
    lines.push(`  ${row.stability.label} — ${row.common ? "common" : "distinctive"}`);
  });
  lines.push(
    "",
    `Stable readings outside a common bucket: ${result.distinctive} of ${result.stableCount}`,
    `Verdict: ${result.band.label}`,
  );
  return lines.join("\n");
}
