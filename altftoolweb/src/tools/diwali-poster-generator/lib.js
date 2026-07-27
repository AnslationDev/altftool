/**
 * Diwali Poster Generator — pure offer maths + poster layout module.
 *
 * Two jobs, both pure:
 *   1. Work out the real offer numbers (sale price, saving, effective discount
 *      once a cap is applied) so a sale poster never advertises a wrong figure.
 *   2. Lay the poster out as a vector spec (colours, motif geometry, text
 *      blocks) that the caller renders as SVG.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/* ---------------------------------------------------------------------------
 * Colour: HSL storage, hex output, WCAG contrast
 * ------------------------------------------------------------------------ */

/** HSL -> #RRGGBB (CSS Color 3). Palettes are stored as HSL numbers, never literals. */
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
  return `#${rgb
    .map((channel) => clamp(Math.round((channel + m) * 255), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** sRGB channel values 0-255 for an HSL triple. */
function hslToRgb(h, s, l) {
  const hex = hslToHex(h, s, l);
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** WCAG 2.1 relative luminance (sRGB, 0-1). */
export function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const v = clamp(value, 0, 255) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 contrast ratio (1 to 21) between two RGB triples. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG 2.1 minimum contrast for normal body text (1.4.3 Contrast Minimum). */
export const AA_NORMAL_TEXT = 4.5;
/** WCAG 2.1 minimum contrast for large text: 18pt, or 14pt bold, and above. */
export const AA_LARGE_TEXT = 3;

/* ---------------------------------------------------------------------------
 * Palettes, sizes, poster types
 * ------------------------------------------------------------------------ */

/** Warm festive palettes, each colour [hue, saturation%, lightness%]. */
export const PALETTES = [
  {
    id: "deep-marigold",
    label: "Deep marigold on aubergine",
    bg: [286, 46, 12],
    panel: [286, 40, 18],
    ink: [42, 96, 88],
    muted: [286, 18, 78],
    accent: [36, 96, 56],
    accent2: [344, 76, 58],
  },
  {
    id: "crimson-gold",
    label: "Crimson and gold",
    bg: [352, 62, 18],
    panel: [352, 54, 24],
    ink: [44, 92, 86],
    muted: [352, 18, 80],
    accent: [44, 94, 58],
    accent2: [16, 88, 58],
  },
  {
    id: "saffron-cream",
    label: "Saffron on cream",
    bg: [38, 82, 94],
    panel: [0, 0, 100],
    ink: [16, 68, 24],
    muted: [16, 20, 42],
    accent: [26, 92, 48],
    accent2: [340, 72, 48],
  },
  {
    id: "midnight-copper",
    label: "Midnight and copper",
    bg: [218, 48, 12],
    panel: [218, 42, 18],
    ink: [34, 78, 84],
    muted: [218, 16, 78],
    accent: [26, 82, 56],
    accent2: [186, 62, 56],
  },
  {
    id: "royal-emerald",
    label: "Royal emerald and gold",
    bg: [160, 52, 12],
    panel: [160, 44, 18],
    ink: [45, 88, 86],
    muted: [160, 16, 78],
    accent: [45, 92, 58],
    accent2: [12, 78, 56],
  },
];

/** Poster canvases in SVG user units. A4 is 300 dpi print. */
export const SIZES = [
  { id: "square", label: "Square post 1080", width: 1080, height: 1080 },
  { id: "story", label: "Story 1080 x 1920", width: 1080, height: 1920 },
  { id: "a4", label: "A4 portrait (print, 300 dpi)", width: 2480, height: 3508 },
];

export const POSTER_TYPES = [
  { id: "sale", label: "Sale / offer poster" },
  { id: "greeting", label: "Greeting poster" },
];

/** Motif styles drawn behind the panel. */
export const MOTIFS = [
  { id: "diyas", label: "Diya row" },
  { id: "fireworks", label: "Fireworks" },
  { id: "rangoli", label: "Rangoli corner" },
  { id: "lanterns", label: "Hanging kandeel" },
];

/** Statutory-style ceiling: a discount above this reads as a pricing error. */
export const MAX_DISCOUNT_PERCENT = 95;

const GLYPH_EM_LATIN = 0.54;
const GLYPH_EM_INDIC = 0.66;
const NON_LATIN = /[^\u0000-\u024F]/;

function glyphEm(text) {
  return NON_LATIN.test(String(text)) ? GLYPH_EM_INDIC : GLYPH_EM_LATIN;
}

export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function wrapText(text, fontSize, maxWidth) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const perLine = Math.max(5, Math.floor(maxWidth / (fontSize * glyphEm(clean))));
  const lines = [];
  let current = "";
  for (const word of clean.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= perLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (word.length > perLine) {
        lines.push(word.slice(0, perLine));
        current = word.slice(perLine);
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Largest font size (down to a floor) that keeps one line inside maxWidth. */
export function fitFontSize(text, idealSize, maxWidth, minSize) {
  const length = String(text ?? "").length;
  if (length === 0) return idealSize;
  return Math.max(minSize, Math.min(idealSize, Math.floor(maxWidth / (length * glyphEm(text)))));
}

export function hashSeed(text) {
  let hash = 2166136261;
  const source = String(text ?? "");
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

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
 * Offer maths
 * ------------------------------------------------------------------------ */

/**
 * Work out the real numbers behind a "flat X% off" claim.
 *
 *   saving  = mrp x discount% / 100, capped at maxSaving when a cap is set
 *   price   = mrp - saving
 *   effective% = saving / mrp x 100  (below the headline rate whenever the cap bites)
 *
 * @param {object} input
 * @param {number} input.mrp list price before discount
 * @param {number} input.discountPercent headline discount rate
 * @param {number} [input.maxSaving] optional "up to" cap on the rupee saving
 * @returns {object} { price, saving, effectivePercent, capApplied } or { error }
 */
export function computeOffer({ mrp, discountPercent, maxSaving = 0 } = {}) {
  if (![mrp, discountPercent, maxSaving].every(isFiniteNumber)) {
    return { error: "Enter valid numbers for price, discount and cap." };
  }
  if (mrp <= 0) return { error: "The list price must be greater than zero." };
  if (mrp > 100000000) return { error: "The list price is outside a realistic range." };
  if (discountPercent < 0) return { error: "The discount cannot be negative." };
  if (discountPercent > MAX_DISCOUNT_PERCENT) {
    return { error: `A discount above ${MAX_DISCOUNT_PERCENT}% is almost always a pricing error.` };
  }
  if (maxSaving < 0) return { error: "The maximum saving cannot be negative." };

  const rawSaving = (mrp * discountPercent) / 100;
  const capApplied = maxSaving > 0 && maxSaving < rawSaving;
  const saving = capApplied ? maxSaving : rawSaving;
  const price = mrp - saving;
  const effectivePercent = mrp > 0 ? (saving / mrp) * 100 : 0;

  return {
    mrp,
    discountPercent,
    saving,
    price,
    effectivePercent,
    capApplied,
    maxSaving,
  };
}

/* ---------------------------------------------------------------------------
 * Motifs
 * ------------------------------------------------------------------------ */

function starPoints(cx, cy, outer, inner, points, rotationDeg) {
  const list = [];
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = ((180 / points) * i + rotationDeg) * (Math.PI / 180);
    list.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return list.join(" ");
}

/** Decorative geometry for the chosen motif; deterministic for a given seed. */
export function buildMotif(motifId, width, height, colors, seed) {
  const random = makeRandom(seed);
  const base = Math.min(width, height);
  const shapes = [];

  if (motifId === "diyas") {
    const lamps = 6;
    for (let i = 1; i <= lamps; i += 1) {
      const cx = (width / (lamps + 1)) * i;
      const cy = height - base * 0.055;
      const bowl = base * 0.042;
      shapes.push({ id: `glow${i}`, type: "circle", cx, cy: cy - bowl * 1.4, r: bowl * 1.6, fill: colors.accent, opacity: 0.16 });
      shapes.push({ id: `bowl${i}`, type: "ellipse", cx, cy, rx: bowl, ry: bowl * 0.42, fill: colors.accent2 });
      shapes.push({
        id: `flame${i}`,
        type: "polygon",
        points: `${cx},${cy - bowl * 2} ${cx - bowl * 0.3},${cy - bowl * 0.45} ${cx + bowl * 0.3},${cy - bowl * 0.45}`,
        fill: colors.accent,
      });
    }
  } else if (motifId === "fireworks") {
    for (let burst = 0; burst < 5; burst += 1) {
      const cx = width * (0.1 + random() * 0.8);
      const cy = height * (0.05 + random() * 0.22);
      const rays = 12;
      const length = base * (0.05 + random() * 0.05);
      for (let i = 0; i < rays; i += 1) {
        const angle = ((360 / rays) * i * Math.PI) / 180;
        shapes.push({
          id: `f${burst}-${i}`,
          type: "line",
          x1: cx + Math.cos(angle) * length * 0.25,
          y1: cy + Math.sin(angle) * length * 0.25,
          x2: cx + Math.cos(angle) * length,
          y2: cy + Math.sin(angle) * length,
          stroke: burst % 2 ? colors.accent : colors.accent2,
          strokeWidth: base * 0.004,
          opacity: 0.75,
        });
        shapes.push({
          id: `fd${burst}-${i}`,
          type: "circle",
          cx: cx + Math.cos(angle) * length,
          cy: cy + Math.sin(angle) * length,
          r: base * 0.004,
          fill: colors.accent,
          opacity: 0.9,
        });
      }
    }
  } else if (motifId === "rangoli") {
    const corners = [
      [0, 0],
      [width, 0],
      [0, height],
      [width, height],
    ];
    corners.forEach(([cx, cy], index) => {
      for (let ring = 4; ring >= 1; ring -= 1) {
        const radius = base * 0.035 * ring;
        const petals = 5 + ring * 3;
        for (let i = 0; i < petals; i += 1) {
          const angle = ((90 / (petals - 1)) * i + (index === 0 ? 0 : index === 1 ? 90 : index === 2 ? 270 : 180)) * (Math.PI / 180);
          shapes.push({
            id: `r${index}-${ring}-${i}`,
            type: "circle",
            cx: cx + Math.cos(angle) * radius,
            cy: cy + Math.sin(angle) * radius,
            r: base * 0.009,
            fill: ring % 2 ? colors.accent : colors.accent2,
            opacity: 0.8 - ring * 0.09,
          });
        }
      }
    });
  } else if (motifId === "lanterns") {
    const count = 7;
    for (let i = 0; i < count; i += 1) {
      const cx = (width / count) * (i + 0.5);
      const drop = base * (0.07 + random() * 0.09);
      const size = base * 0.035;
      shapes.push({
        id: `thread${i}`,
        type: "line",
        x1: cx,
        y1: 0,
        x2: cx,
        y2: drop,
        stroke: colors.accent2,
        strokeWidth: base * 0.002,
        opacity: 0.55,
      });
      shapes.push({
        id: `lantern${i}`,
        type: "polygon",
        points: starPoints(cx, drop + size, size, size * 0.5, 6, -90),
        fill: i % 2 ? colors.accent : colors.accent2,
        opacity: 0.85,
      });
      shapes.push({
        id: `tassel${i}`,
        type: "line",
        x1: cx,
        y1: drop + size * 1.6,
        x2: cx,
        y2: drop + size * 2.4,
        stroke: colors.accent,
        strokeWidth: base * 0.003,
        opacity: 0.7,
      });
    }
  }

  return shapes;
}

/* ---------------------------------------------------------------------------
 * Poster layout
 * ------------------------------------------------------------------------ */

/** Indian-format currency string; kept here so the layout and the copy agree. */
export function formatInr(value) {
  if (!isFiniteNumber(value)) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Build the poster spec.
 *
 * @param {object} input
 * @param {string} input.posterType "sale" or "greeting"
 * @param {string} input.brand shop or brand name
 * @param {string} input.headline main line; auto-filled for sale posters when blank
 * @param {string} input.subline supporting line
 * @param {number|string} input.mrp list price (sale posters)
 * @param {number|string} input.discountPercent headline discount (sale posters)
 * @param {number|string} input.maxSaving optional cap on the rupee saving
 * @param {string} input.validity offer validity text
 * @param {string} input.contact phone, address or handle
 * @param {string} input.paletteId one of PALETTES
 * @param {string} input.motifId one of MOTIFS
 * @param {string} input.sizeId one of SIZES
 * @returns {object} spec, or { error }
 */
export function buildPoster({
  posterType = "sale",
  brand = "",
  headline = "",
  subline = "",
  mrp = "",
  discountPercent = "",
  maxSaving = "",
  validity = "",
  contact = "",
  paletteId = PALETTES[0].id,
  motifId = MOTIFS[0].id,
  sizeId = SIZES[0].id,
} = {}) {
  const cleanBrand = String(brand).trim();
  if (!cleanBrand) return { error: "Add the shop or brand name that goes on the poster." };
  if (cleanBrand.length > 40) return { error: "Keep the brand name under 40 characters." };

  if (!POSTER_TYPES.some((item) => item.id === posterType)) {
    return { error: "Pick a poster type." };
  }
  const size = SIZES.find((item) => item.id === sizeId);
  if (!size) return { error: "Pick one of the available poster sizes." };
  const palette = PALETTES.find((item) => item.id === paletteId) ?? PALETTES[0];
  const motif = MOTIFS.find((item) => item.id === motifId) ?? MOTIFS[0];

  if (String(subline).trim().length > 120) return { error: "Keep the supporting line under 120 characters." };
  if (String(validity).trim().length > 80) return { error: "Keep the validity line under 80 characters." };
  if (String(contact).trim().length > 80) return { error: "Keep the contact line under 80 characters." };

  let offer = null;
  let headlineText = String(headline).trim();

  if (posterType === "sale") {
    const priceValue = Number(String(mrp).trim());
    const discountValue = Number(String(discountPercent).trim());
    const capValue = String(maxSaving).trim() === "" ? 0 : Number(String(maxSaving).trim());
    offer = computeOffer({ mrp: priceValue, discountPercent: discountValue, maxSaving: capValue });
    if (offer.error) return { error: offer.error };
    if (!headlineText) {
      headlineText = `FLAT ${Math.round(offer.discountPercent)}% OFF`;
    }
  } else if (!headlineText) {
    headlineText = "Happy Diwali";
  }

  if (headlineText.length > 60) return { error: "Keep the headline under 60 characters." };

  const colors = {
    bg: hslToHex(...palette.bg),
    panel: hslToHex(...palette.panel),
    ink: hslToHex(...palette.ink),
    muted: hslToHex(...palette.muted),
    accent: hslToHex(...palette.accent),
    accent2: hslToHex(...palette.accent2),
  };

  // WCAG check of the two text colours that sit on the panel.
  const panelRgb = hslToRgb(...palette.panel);
  const headlineContrast = contrastRatio(hslToRgb(...palette.ink), panelRgb);
  const supportContrast = contrastRatio(hslToRgb(...palette.muted), panelRgb);
  const accentContrast = contrastRatio(hslToRgb(...palette.accent), panelRgb);

  const { width, height } = size;
  const base = Math.min(width, height);
  const margin = Math.round(width * 0.055);
  const panel = {
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    radius: Math.round(width * 0.028),
  };
  const inner = panel.width - Math.round(width * 0.08);
  const centerX = Math.round(width / 2);

  const scale = {
    brand: Math.round(base * 0.028),
    headline: Math.round(base * 0.108),
    price: Math.round(base * 0.05),
    sub: Math.round(base * 0.028),
    small: Math.round(base * 0.022),
  };

  const blocks = [];
  let cursor = panel.y + Math.round(height * 0.075);

  blocks.push({
    kind: "text",
    id: "brand",
    text: cleanBrand,
    x: centerX,
    y: cursor,
    size: scale.brand,
    weight: 700,
    fill: colors.accent,
    letterSpacing: Math.round(scale.brand * 0.18),
    upper: true,
  });
  cursor += Math.round(scale.brand * 2.6);

  const headlineSize = fitFontSize(headlineText, scale.headline, inner, Math.round(scale.headline * 0.42));
  const headlineLines = wrapText(headlineText, headlineSize, inner);
  headlineLines.forEach((line, index) => {
    blocks.push({
      kind: "text",
      id: `headline-${index}`,
      text: line,
      x: centerX,
      y: cursor,
      size: headlineSize,
      weight: 800,
      fill: colors.ink,
      letterSpacing: 0,
    });
    cursor += Math.round(headlineSize * 1.14);
  });

  if (offer) {
    cursor += Math.round(scale.price * 0.5);
    blocks.push({
      kind: "text",
      id: "price",
      text: `${formatInr(Math.round(offer.price))} after discount`,
      x: centerX,
      y: cursor,
      size: scale.price,
      weight: 700,
      fill: colors.accent,
      letterSpacing: 0,
    });
    cursor += Math.round(scale.price * 1.5);
    blocks.push({
      kind: "text",
      id: "mrp",
      text: `MRP ${formatInr(Math.round(offer.mrp))} · you save ${formatInr(Math.round(offer.saving))}`,
      x: centerX,
      y: cursor,
      size: scale.sub,
      weight: 500,
      fill: colors.muted,
      letterSpacing: 0,
    });
    cursor += Math.round(scale.sub * 1.9);
  }

  const sublineLines = wrapText(subline, scale.sub, inner);
  sublineLines.forEach((line, index) => {
    blocks.push({
      kind: "text",
      id: `subline-${index}`,
      text: line,
      x: centerX,
      y: cursor,
      size: scale.sub,
      weight: 500,
      fill: colors.muted,
      letterSpacing: 0,
    });
    cursor += Math.round(scale.sub * 1.5);
  });

  cursor += Math.round(scale.small * 1.2);
  blocks.push({
    kind: "rule",
    id: "rule",
    x1: centerX - Math.round(inner * 0.15),
    x2: centerX + Math.round(inner * 0.15),
    y: cursor,
    stroke: colors.accent2,
    strokeWidth: Math.max(2, Math.round(base * 0.004)),
  });

  const footerLines = [];
  if (String(validity).trim()) footerLines.push(String(validity).trim());
  if (String(contact).trim()) footerLines.push(String(contact).trim());

  const footerTop = panel.y + panel.height - Math.round(height * 0.045) - footerLines.length * Math.round(scale.small * 1.5);
  footerLines.forEach((line, index) => {
    blocks.push({
      kind: "text",
      id: `footer-${index}`,
      text: line,
      x: centerX,
      y: footerTop + index * Math.round(scale.small * 1.5),
      size: scale.small,
      weight: 600,
      fill: index === 0 ? colors.accent2 : colors.muted,
      letterSpacing: 0,
    });
  });

  const shapes = buildMotif(motif.id, width, height, colors, hashSeed(`${cleanBrand}|${motif.id}|${size.id}`));

  const overflow = cursor > footerTop - Math.round(scale.small * 2);

  const contrastNotes = [];
  if (headlineContrast < AA_LARGE_TEXT) {
    contrastNotes.push(
      `Headline contrast is ${headlineContrast.toFixed(2)}:1 — below the ${AA_LARGE_TEXT}:1 WCAG minimum for large text.`,
    );
  }
  if (supportContrast < AA_NORMAL_TEXT) {
    contrastNotes.push(
      `Supporting text contrast is ${supportContrast.toFixed(2)}:1 — below the ${AA_NORMAL_TEXT}:1 WCAG minimum for body text.`,
    );
  }

  const plainText = [
    cleanBrand,
    headlineText,
    offer
      ? `${formatInr(Math.round(offer.price))} after discount (MRP ${formatInr(Math.round(offer.mrp))}, save ${formatInr(
          Math.round(offer.saving),
        )})`
      : "",
    offer && offer.capApplied
      ? `Cap applied: effective discount ${offer.effectivePercent.toFixed(1)}% instead of ${offer.discountPercent}%`
      : "",
    String(subline).trim(),
    String(validity).trim(),
    String(contact).trim(),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    width,
    height,
    panel,
    colors,
    blocks,
    motif: shapes,
    offer,
    plainText,
    headlineText,
    paletteLabel: palette.label,
    motifLabel: motif.label,
    sizeLabel: size.label,
    contrast: {
      headline: headlineContrast,
      support: supportContrast,
      accent: accentContrast,
      headlinePasses: headlineContrast >= AA_LARGE_TEXT,
      supportPasses: supportContrast >= AA_NORMAL_TEXT,
    },
    contrastNotes,
    overflow,
    warning: overflow
      ? "The text is running into the footer — shorten the supporting line or use the taller story size."
      : contrastNotes[0] || "",
  };
}
