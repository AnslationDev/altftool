/**
 * Birthday Invitation Maker — pure layout engine.
 *
 * Produces a deterministic vector layout (positions, sizes, colours, wrapped
 * text) for a birthday invitation. No React, no DOM: the caller renders the
 * returned spec as SVG and can serialise it for download.
 */

/* ---------------------------------------------------------------------------
 * Colour helpers — every palette is stored as HSL numbers and converted to a
 * hex string at runtime, so the source carries no hard-coded colour literals.
 * ------------------------------------------------------------------------ */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** HSL -> #RRGGBB. h in degrees, s and l in percent. Standard CSS Color 3 conversion. */
export function hslToHex(h, s, l) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clamp(Number(s), 0, 100) / 100;
  const lig = clamp(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const hex = rgb
    .map((channel) => {
      const value = Math.round((channel + m) * 255);
      return clamp(value, 0, 255).toString(16).padStart(2, "0");
    })
    .join("");
  return `#${hex}`;
}

/* ---------------------------------------------------------------------------
 * Themes and sizes
 * ------------------------------------------------------------------------ */

/** Each colour is [hue, saturation%, lightness%]. */
export const THEMES = [
  {
    id: "confetti",
    label: "Confetti Pop",
    bg: [44, 96, 94],
    panel: [0, 0, 100],
    ink: [230, 30, 20],
    muted: [230, 14, 42],
    accent: [344, 82, 56],
    accent2: [196, 84, 45],
    confetti: [
      [344, 82, 56],
      [196, 84, 45],
      [44, 92, 55],
      [152, 55, 45],
    ],
  },
  {
    id: "pastel",
    label: "Pastel Balloons",
    bg: [206, 62, 94],
    panel: [0, 0, 100],
    ink: [222, 34, 24],
    muted: [222, 12, 45],
    accent: [268, 52, 62],
    accent2: [172, 48, 50],
    confetti: [
      [268, 52, 70],
      [340, 62, 78],
      [172, 48, 66],
      [40, 78, 74],
    ],
  },
  {
    id: "midnight",
    label: "Midnight Neon",
    bg: [244, 44, 12],
    panel: [244, 38, 18],
    ink: [0, 0, 100],
    muted: [244, 18, 76],
    accent: [172, 82, 52],
    accent2: [318, 88, 64],
    confetti: [
      [172, 82, 52],
      [318, 88, 64],
      [48, 94, 60],
      [204, 92, 62],
    ],
  },
  {
    id: "safari",
    label: "Jungle Safari",
    bg: [86, 34, 90],
    panel: [0, 0, 100],
    ink: [128, 38, 18],
    muted: [128, 14, 38],
    accent: [128, 46, 34],
    accent2: [32, 76, 50],
    confetti: [
      [128, 46, 40],
      [32, 76, 50],
      [64, 52, 46],
      [16, 62, 46],
    ],
  },
  {
    id: "arcade",
    label: "Retro Arcade",
    bg: [258, 48, 16],
    panel: [258, 40, 22],
    ink: [52, 92, 68],
    muted: [258, 20, 78],
    accent: [340, 88, 62],
    accent2: [186, 88, 56],
    confetti: [
      [340, 88, 62],
      [186, 88, 56],
      [52, 92, 62],
      [274, 76, 66],
    ],
  },
];

/** Output sizes in SVG user units (1 unit = 1 px at 1x). */
export const SIZES = [
  { id: "a5", label: "A5 portrait (print)", width: 1748, height: 2480 },
  { id: "square", label: "Square post 1080", width: 1080, height: 1080 },
  { id: "story", label: "Story 1080 x 1920", width: 1080, height: 1920 },
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Average glyph advance as a fraction of font size, used to wrap text without a DOM. */
const AVG_GLYPH_EM = 0.54;

export const MAX_NAME_LENGTH = 40;
export const MAX_MESSAGE_LENGTH = 220;

/* ---------------------------------------------------------------------------
 * Pure text utilities
 * ------------------------------------------------------------------------ */

/** English ordinal suffix: 1st, 2nd, 3rd, 4th, with the 11-13 exception. */
export function ordinal(n) {
  const value = Math.trunc(Number(n));
  if (!Number.isFinite(value) || value < 0) return "";
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${value}th`;
  const last = value % 10;
  if (last === 1) return `${value}st`;
  if (last === 2) return `${value}nd`;
  if (last === 3) return `${value}rd`;
  return `${value}th`;
}

/** Greedy word wrap to a pixel width, using the average-glyph estimate. */
export function wrapText(text, fontSize, maxWidth) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const perLine = Math.max(6, Math.floor(maxWidth / (fontSize * AVG_GLYPH_EM)));
  const lines = [];
  let current = "";
  for (const word of clean.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= perLine) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = "";
    // Hyphen-split words longer than a full line as many times as needed —
    // not just once — so a long remainder never overflows the panel.
    let rest = word;
    while (rest.length > perLine) {
      lines.push(`${rest.slice(0, perLine - 1)}-`);
      rest = rest.slice(perLine - 1);
    }
    current = rest;
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Parse and validate a YYYY-MM-DD date without timezone drift.
 * Returns null when the string is not a real calendar date.
 */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day, weekday: WEEKDAYS[check.getUTCDay()] };
}

/** "Saturday, 14 March 2026" — built from fixed name tables, so it is locale-stable. */
export function formatLongDate(value) {
  const parsed = parseIsoDate(value);
  if (!parsed) return "";
  return `${parsed.weekday}, ${parsed.day} ${MONTHS[parsed.month - 1]} ${parsed.year}`;
}

/** Deterministic 32-bit string hash, used to seed confetti placement. */
export function hashSeed(text) {
  let hash = 2166136261;
  const source = String(text ?? "");
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG — small, fast, deterministic for a given seed. */
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------------------
 * Layout
 * ------------------------------------------------------------------------ */

const CONFETTI_COUNT = 34;

/**
 * Build the invitation layout.
 *
 * @param {object} input
 * @param {string} input.name guest of honour
 * @param {string|number} input.age optional age, blank to hide
 * @param {string} input.date ISO YYYY-MM-DD
 * @param {string} input.time free text, e.g. "4:00 PM - 7:00 PM"
 * @param {string} input.venue venue name
 * @param {string} input.address optional address line
 * @param {string} input.rsvpName optional contact name
 * @param {string} input.rsvpContact optional phone/email
 * @param {string} input.rsvpBy optional ISO date to reply by
 * @param {string} input.message optional closing line
 * @param {string} input.themeId one of THEMES
 * @param {string} input.sizeId one of SIZES
 * @returns {object} layout spec, or { error }
 */
export function buildInvitation({
  name = "",
  age = "",
  date = "",
  time = "",
  venue = "",
  address = "",
  rsvpName = "",
  rsvpContact = "",
  rsvpBy = "",
  message = "",
  themeId = THEMES[0].id,
  sizeId = SIZES[1].id,
} = {}) {
  const cleanName = String(name).trim();
  if (!cleanName) return { error: "Add the birthday person's name." };
  if (cleanName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters so it fits the card.` };
  }

  const ageText = String(age).trim();
  let ageNumber = null;
  if (ageText !== "") {
    ageNumber = Number(ageText);
    if (!Number.isFinite(ageNumber) || !Number.isInteger(ageNumber)) {
      return { error: "Age must be a whole number, or leave it blank." };
    }
    if (ageNumber < 1 || ageNumber > 120) {
      return { error: "Age should be between 1 and 120, or blank." };
    }
  }

  const parsedDate = parseIsoDate(date);
  if (!parsedDate) return { error: "Pick a valid party date." };

  const cleanTime = String(time).trim();
  if (!cleanTime) return { error: "Add a start time so guests know when to arrive." };
  if (cleanTime.length > 32) return { error: "Shorten the time line to 32 characters or less." };

  const cleanVenue = String(venue).trim();
  if (!cleanVenue) return { error: "Add a venue so guests know where to go." };

  if (String(message).trim().length > MAX_MESSAGE_LENGTH) {
    return { error: `Keep the closing message under ${MAX_MESSAGE_LENGTH} characters.` };
  }

  if (String(rsvpBy).trim() !== "" && !parseIsoDate(rsvpBy)) {
    return { error: "The RSVP-by date is not a valid calendar date." };
  }
  if (String(rsvpBy).trim() !== "") {
    const reply = parseIsoDate(rsvpBy);
    const partyStamp = Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day);
    const replyStamp = Date.UTC(reply.year, reply.month - 1, reply.day);
    if (replyStamp > partyStamp) {
      return { error: "The RSVP-by date falls after the party date." };
    }
  }

  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  const size = SIZES.find((item) => item.id === sizeId) ?? SIZES[1];

  const colors = {
    bg: hslToHex(...theme.bg),
    panel: hslToHex(...theme.panel),
    ink: hslToHex(...theme.ink),
    muted: hslToHex(...theme.muted),
    accent: hslToHex(...theme.accent),
    accent2: hslToHex(...theme.accent2),
  };

  const { width, height } = size;
  const margin = Math.round(width * 0.07);
  const panel = {
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    radius: Math.round(width * 0.035),
  };
  const inner = panel.width - Math.round(width * 0.1);
  const centerX = Math.round(width / 2);

  // Type scale is a fraction of the shorter edge so every size stays balanced.
  const base = Math.min(width, height);
  const scale = {
    kicker: Math.round(base * 0.028),
    name: Math.round(base * 0.085),
    age: Math.round(base * 0.042),
    label: Math.round(base * 0.022),
    value: Math.round(base * 0.034),
    body: Math.round(base * 0.026),
    footer: Math.round(base * 0.022),
  };

  const nameLines = wrapText(cleanName, scale.name, inner);
  const messageLines = wrapText(message, scale.body, inner);
  const venueLines = wrapText(cleanVenue, scale.value, inner);
  const addressLines = wrapText(address, scale.body, inner);

  const rsvpParts = [];
  if (String(rsvpName).trim()) rsvpParts.push(String(rsvpName).trim());
  if (String(rsvpContact).trim()) rsvpParts.push(String(rsvpContact).trim());
  const rsvpLine = rsvpParts.length
    ? `RSVP to ${rsvpParts.join(" · ")}${String(rsvpBy).trim() ? ` by ${formatLongDate(rsvpBy)}` : ""}`
    : String(rsvpBy).trim()
      ? `Please RSVP by ${formatLongDate(rsvpBy)}`
      : "";

  // footerY / contentCeiling are computed up front, before the flowing
  // address/message text is laid out, so that section can stop adding lines
  // before they would run under the RSVP footer or past the bottom edge of
  // the card, instead of emitting every line unconditionally and letting a
  // long address/message overlap the footer or render off-canvas.
  const footerY = panel.y + panel.height - Math.round(height * 0.055);
  const footerGap = Math.round(scale.footer * 2);
  const contentCeiling = footerY - footerGap;
  let truncated = false;

  const blocks = [];
  let cursor = panel.y + Math.round(height * 0.06);

  blocks.push({
    kind: "text",
    id: "kicker",
    text: ageNumber === null ? "You're invited to celebrate" : `Join us for the ${ordinal(ageNumber)} birthday of`,
    x: centerX,
    y: cursor,
    size: scale.kicker,
    weight: 600,
    fill: colors.accent2,
    letterSpacing: Math.round(scale.kicker * 0.12),
    upper: true,
  });
  cursor += Math.round(scale.kicker * 2.2);

  nameLines.forEach((line, index) => {
    blocks.push({
      kind: "text",
      id: `name-${index}`,
      text: line,
      x: centerX,
      y: cursor,
      size: scale.name,
      weight: 800,
      fill: colors.ink,
      letterSpacing: 0,
    });
    cursor += Math.round(scale.name * 1.05);
  });

  if (ageNumber !== null) {
    cursor += Math.round(scale.age * 0.35);
    const badgeText = `Turning ${ageNumber}`;
    const badgePadX = Math.round(scale.age * 0.9);
    const badgePadY = Math.round(scale.age * 0.45);
    // Width is estimated from the average glyph advance — no DOM measurement available.
    const badgeWidth = Math.round(badgeText.length * scale.age * AVG_GLYPH_EM) + badgePadX * 2;
    const badgeHeight = scale.age + badgePadY * 2;
    blocks.push({
      kind: "badge",
      id: "age-badge",
      text: badgeText,
      x: centerX,
      y: cursor,
      rectX: Math.round(centerX - badgeWidth / 2),
      rectY: cursor - badgePadY,
      rectWidth: badgeWidth,
      rectHeight: badgeHeight,
      radius: Math.round(badgeHeight / 2),
      size: scale.age,
      fill: colors.accent,
      textFill: colors.panel,
      paddingX: badgePadX,
      paddingY: badgePadY,
    });
    cursor += Math.round(scale.age * 1.8);
  }

  cursor += Math.round(scale.label * 1.2);
  blocks.push({
    kind: "rule",
    id: "rule-1",
    x1: centerX - Math.round(inner * 0.18),
    x2: centerX + Math.round(inner * 0.18),
    y: cursor,
    stroke: colors.accent2,
    strokeWidth: Math.max(2, Math.round(base * 0.004)),
  });
  cursor += Math.round(scale.label * 1.8);

  const details = [
    ["When", formatLongDate(date)],
    ["Time", cleanTime],
  ];
  details.forEach(([label, value], index) => {
    blocks.push({
      kind: "text",
      id: `detail-label-${index}`,
      text: label,
      x: centerX,
      y: cursor,
      size: scale.label,
      weight: 700,
      fill: colors.muted,
      letterSpacing: Math.round(scale.label * 0.16),
      upper: true,
    });
    cursor += Math.round(scale.label * 1.5);
    blocks.push({
      kind: "text",
      id: `detail-value-${index}`,
      text: value,
      x: centerX,
      y: cursor,
      size: scale.value,
      weight: 600,
      fill: colors.ink,
      letterSpacing: 0,
    });
    cursor += Math.round(scale.value * 1.5);
  });

  blocks.push({
    kind: "text",
    id: "venue-label",
    text: "Where",
    x: centerX,
    y: cursor,
    size: scale.label,
    weight: 700,
    fill: colors.muted,
    letterSpacing: Math.round(scale.label * 0.16),
    upper: true,
  });
  cursor += Math.round(scale.label * 1.5);
  venueLines.forEach((line, index) => {
    blocks.push({
      kind: "text",
      id: `venue-${index}`,
      text: line,
      x: centerX,
      y: cursor,
      size: scale.value,
      weight: 600,
      fill: colors.ink,
      letterSpacing: 0,
    });
    cursor += Math.round(scale.value * 1.25);
  });
  for (let index = 0; index < addressLines.length; index += 1) {
    if (cursor + scale.body > contentCeiling) {
      truncated = true;
      break;
    }
    blocks.push({
      kind: "text",
      id: `address-${index}`,
      text: addressLines[index],
      x: centerX,
      y: cursor,
      size: scale.body,
      weight: 400,
      fill: colors.muted,
      letterSpacing: 0,
    });
    cursor += Math.round(scale.body * 1.35);
  }

  if (messageLines.length > 0) {
    const messageGap = Math.round(scale.body * 1.1);
    if (cursor + messageGap + scale.body > contentCeiling) {
      truncated = true;
    } else {
      cursor += messageGap;
      for (let index = 0; index < messageLines.length; index += 1) {
        if (cursor + scale.body > contentCeiling) {
          truncated = true;
          break;
        }
        blocks.push({
          kind: "text",
          id: `message-${index}`,
          text: messageLines[index],
          x: centerX,
          y: cursor,
          size: scale.body,
          weight: 400,
          fill: colors.muted,
          letterSpacing: 0,
          italic: true,
        });
        cursor += Math.round(scale.body * 1.35);
      }
    }
  }

  if (rsvpLine) {
    blocks.push({
      kind: "text",
      id: "rsvp",
      text: rsvpLine,
      x: centerX,
      y: footerY,
      size: scale.footer,
      weight: 600,
      fill: colors.accent2,
      letterSpacing: 0,
    });
  }

  // Confetti is seeded from the card content, so the same input always renders
  // the same decoration — no Math.random, no Date.now.
  const random = makeRandom(hashSeed(`${cleanName}|${date}|${theme.id}|${size.id}`));
  const confetti = [];
  for (let i = 0; i < CONFETTI_COUNT; i += 1) {
    const palette = theme.confetti[i % theme.confetti.length];
    const edgeBand = random();
    // Keep decoration in the outer band so it never sits under the text column.
    const x =
      edgeBand < 0.5
        ? random() * margin * 1.6
        : width - random() * margin * 1.6;
    confetti.push({
      id: `c${i}`,
      x: Math.round(clamp(x, 6, width - 6)),
      y: Math.round(random() * (height - 20) + 10),
      size: Math.round(base * 0.006 + random() * base * 0.012),
      rotate: Math.round(random() * 360),
      fill: hslToHex(...palette),
      round: random() > 0.5,
    });
  }

  // Address/message lines above already stop themselves before crossing
  // contentCeiling, so `truncated` is the sole source of truth for overflow:
  // when nothing was cut, the RSVP footer can never overlap or run off-canvas.
  const overflow = truncated;

  const plainText = [
    ageNumber === null ? "You're invited!" : `${cleanName} is turning ${ageNumber}!`,
    `Guest of honour: ${cleanName}`,
    `Date: ${formatLongDate(date)}`,
    `Time: ${cleanTime}`,
    `Venue: ${cleanVenue}${String(address).trim() ? `, ${String(address).trim()}` : ""}`,
    String(message).trim() ? `Note: ${String(message).trim()}` : "",
    rsvpLine,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    width,
    height,
    margin,
    panel,
    colors,
    blocks,
    confetti,
    plainText,
    themeLabel: theme.label,
    sizeLabel: size.label,
    dateLong: formatLongDate(date),
    overflow,
    warning: overflow
      ? "The address and/or closing message didn't fully fit above the RSVP line and was cut off — shorten it, or switch to the taller story size."
      : "",
  };
}
