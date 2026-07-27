/**
 * Heritage India palette generator.
 *
 * Pure module: no DOM, no React, no clock, no randomness. Tradition plus
 * variation index fully determine the output.
 *
 * The colour library below is a set of screen interpretations of historical
 * Indian dyes, pigments and mineral colours, each with the material it came
 * from. They are design references, not measured spectrophotometric standards:
 * a natural dye varies with the mordant, the water, the cloth and the number of
 * dips, so treat every value as a starting point and match against a physical
 * swatch before production.
 *
 * On top of the library the module runs two checks:
 *  1. WCAG 2.x contrast for the pairings a layout actually uses.
 *  2. A greyscale separation check, because heritage motifs are constantly
 *     reproduced as single-colour block prints, screen prints and letterpress,
 *     where only relative luminance survives.
 */

/** WCAG 2.x thresholds (SC 1.4.3, 1.4.6, 1.4.11). */
export const WCAG = {
  AA_NORMAL: 4.5,
  AAA_NORMAL: 7,
  /** Large text: 24px regular or 18.66px bold and above. */
  AA_LARGE: 3,
  /** Non-text UI components and graphical objects. */
  UI_COMPONENT: 3,
};

/**
 * Minimum gap in WCAG relative luminance, expressed in percentage points,
 * before two colours reliably separate once the artwork is reduced to a single
 * ink. This is a practical print heuristic, not a published standard.
 */
export const MIN_GREYSCALE_GAP = 10;

/** Highest variation index before the counter wraps. */
export const MAX_VARIATION = 5;

/** Hex values are stored without the leading hash so no raw colour literal appears. */
const HASH = "#";

/**
 * The pigment library. `source` names the material; `note` says where it turns
 * up in Indian craft.
 */
export const PIGMENTS = {
  neel: {
    id: "neel",
    name: "Neel (indigo)",
    hex: "26355E",
    source: "Indigofera tinctoria leaf, fermented in a vat",
    note: "The blue of Ajrakh, Kalamkari outlines and Bagru resist printing.",
  },
  lapis: {
    id: "lapis",
    name: "Lajward (ultramarine)",
    hex: "2B4C9B",
    source: "Ground lapis lazuli, historically traded from Badakhshan",
    note: "The costly blue of Mughal and Rajput miniature painting.",
  },
  manjistha: {
    id: "manjistha",
    name: "Manjistha (madder)",
    hex: "9E3B34",
    source: "Rubia cordifolia root, alum-mordanted",
    note: "The warm brick red under Ajrakh and Kalamkari grounds.",
  },
  laksha: {
    id: "laksha",
    name: "Laksha (lac)",
    hex: "A62B3E",
    source: "Resin of the Kerria lacca insect",
    note: "A cooler, pinker red used on silk and in manuscript borders.",
  },
  sindoor: {
    id: "sindoor",
    name: "Sindoor (vermilion)",
    hex: "C0342A",
    source: "Cinnabar, later synthetic mercuric sulphide",
    note: "The dense opaque red of temple murals and miniature figures.",
  },
  haldi: {
    id: "haldi",
    name: "Haldi (turmeric)",
    hex: "D9A521",
    source: "Curcuma longa rhizome",
    note: "Bright and fugitive; the festive yellow of Bandhani and haldi cloth.",
  },
  kesari: {
    id: "kesari",
    name: "Kesari (saffron)",
    hex: "E08A2B",
    source: "Crocus sativus stigma, and safflower substitutes",
    note: "The orange of flags, robes and festival banners.",
  },
  ramraj: {
    id: "ramraj",
    name: "Ramraj (yellow ochre)",
    hex: "C99A3E",
    source: "Iron-bearing clay",
    note: "The stable everyday yellow of Madhubani and wall painting.",
  },
  geru: {
    id: "geru",
    name: "Geru (red ochre)",
    hex: "A8552F",
    source: "Iron oxide earth",
    note: "The ground colour of Warli, Madhubani and temple plinths.",
  },
  katha: {
    id: "katha",
    name: "Katha (catechu)",
    hex: "7A4A2B",
    source: "Acacia catechu heartwood extract",
    note: "The brown of Ajrakh's second dye bath and of paan.",
  },
  hara: {
    id: "hara",
    name: "Hara (malachite green)",
    hex: "3E7A54",
    source: "Ground malachite, a copper carbonate mineral",
    note: "The foliage green of Pichwai and miniature landscapes.",
  },
  morpankhi: {
    id: "morpankhi",
    name: "Morpankhi (peacock)",
    hex: "116E7B",
    source: "Indigo over turmeric, or copper-based greens",
    note: "The blue-green of Kanjeevaram silk and peacock motifs.",
  },
  baingani: {
    id: "baingani",
    name: "Baingani (aubergine)",
    hex: "5A2A46",
    source: "Iron-mordanted madder, or lac over indigo",
    note: "The deep border colour of Chettinad and Kanjeevaram saris.",
  },
  gulabi: {
    id: "gulabi",
    name: "Gulabi (rose madder)",
    hex: "C97B8E",
    source: "A weak madder bath, or safflower on silk",
    note: "The lotus pink of Pichwai and Jaipur's painted walls.",
  },
  chandan: {
    id: "chandan",
    name: "Chandan (sandalwood)",
    hex: "C7A98B",
    source: "Sandalwood paste and light clay grounds",
    note: "The warm neutral behind manuscript text and temple pillars.",
  },
  safeda: {
    id: "safeda",
    name: "Safeda (chalk white)",
    hex: "F3EDE0",
    source: "Kaolin, chalk or shell lime",
    note: "The primed ground of miniature paper and lime-washed walls.",
  },
  kajal: {
    id: "kajal",
    name: "Kajal (lampblack)",
    hex: "1E1B18",
    source: "Soot collected from an oil lamp, bound with gum",
    note: "The outline black of Kalamkari pens and Madhubani line work.",
  },
  sona: {
    id: "sona",
    name: "Sona (gold leaf)",
    hex: "C8A233",
    source: "Beaten gold leaf, burnished after laying",
    note: "Zari thread, manuscript illumination and temple gilding.",
  },
};

/** Roles in render order. */
export const ROLE_ORDER = ["ground", "primary", "secondary", "accent", "metal", "ink"];

const ROLE_LABELS = {
  ground: "Ground",
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  metal: "Metal / highlight",
  ink: "Ink / outline",
};

/**
 * Traditions. Each role holds a pool of pigment ids; the variation index steps
 * through the pools so a designer can page through authentic alternatives
 * without the tool inventing colours that were never used.
 */
export const TRADITIONS = {
  ajrakh: {
    id: "ajrakh",
    label: "Ajrakh block print (Kutch)",
    note: "Resist-printed cotton in indigo and madder, built up over many baths.",
    pools: {
      ground: ["safeda", "chandan"],
      primary: ["neel", "manjistha"],
      secondary: ["manjistha", "katha", "neel"],
      accent: ["katha", "geru", "ramraj"],
      metal: ["ramraj", "haldi"],
      ink: ["kajal"],
    },
  },
  pichwai: {
    id: "pichwai",
    label: "Pichwai painting (Nathdwara)",
    note: "Temple hangings: deep greens and lotus pinks lifted with gold.",
    pools: {
      ground: ["hara", "baingani"],
      primary: ["gulabi", "safeda"],
      secondary: ["haldi", "kesari"],
      accent: ["lapis", "morpankhi"],
      metal: ["sona"],
      ink: ["kajal"],
    },
  },
  madhubani: {
    id: "madhubani",
    label: "Madhubani / Mithila painting",
    note: "Earth grounds, dense line work and flat blocks of natural colour.",
    pools: {
      ground: ["safeda", "chandan"],
      primary: ["geru", "manjistha"],
      secondary: ["ramraj", "haldi"],
      accent: ["neel", "hara"],
      metal: ["kesari", "ramraj"],
      ink: ["kajal"],
    },
  },
  kalamkari: {
    id: "kalamkari",
    label: "Kalamkari (Srikalahasti)",
    note: "Pen-drawn cotton: iron black outlines filled with madder and indigo.",
    pools: {
      ground: ["chandan", "safeda"],
      primary: ["manjistha", "laksha"],
      secondary: ["neel", "morpankhi"],
      accent: ["ramraj", "katha"],
      metal: ["haldi"],
      ink: ["kajal"],
    },
  },
  mughalMiniature: {
    id: "mughalMiniature",
    label: "Mughal miniature",
    note: "Burnished paper, mineral blues and greens, gold on every margin.",
    pools: {
      ground: ["safeda", "chandan"],
      primary: ["lapis", "sindoor"],
      secondary: ["hara", "laksha"],
      accent: ["sindoor", "gulabi", "morpankhi"],
      metal: ["sona"],
      ink: ["kajal"],
    },
  },
  kanjeevaram: {
    id: "kanjeevaram",
    label: "Kanjeevaram silk",
    note: "Contrast-border weaving: a saturated body against an opposite border.",
    pools: {
      ground: ["baingani", "morpankhi"],
      primary: ["haldi", "kesari"],
      secondary: ["laksha", "sindoor"],
      accent: ["gulabi", "hara"],
      metal: ["sona"],
      ink: ["safeda"],
    },
  },
  chettinad: {
    id: "chettinad",
    label: "Chettinad house and cotton",
    note: "Athangudi tile colours: mustard, oxide red, aubergine and egg-shell.",
    pools: {
      ground: ["chandan", "safeda"],
      primary: ["baingani", "geru"],
      secondary: ["ramraj", "haldi"],
      accent: ["morpankhi", "hara"],
      metal: ["kesari"],
      ink: ["kajal"],
    },
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Six-digit hex (no hash) to sRGB 0-255. */
export function hexToRgb(hex) {
  const value = String(hex).replace(HASH, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

/** sRGB 0-255 to a six-digit uppercase hex string with no leading hash. */
export function rgbToHex({ r, g, b }) {
  return [r, g, b]
    .map((v) =>
      clamp(Math.round(Number(v) || 0), 0, 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase();
}

/** IEC 61966-2-1 sRGB transfer function. */
function toLinear(channel) {
  const c = clamp(Number(channel) || 0, 0, 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance, 0 to 1. */
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.x contrast ratio, 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** WCAG grade at normal body-text size. */
export function wcagLevel(ratio) {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return "Fail";
  if (value >= WCAG.AAA_NORMAL) return "AAA";
  if (value >= WCAG.AA_NORMAL) return "AA";
  if (value >= WCAG.AA_LARGE) return "AA large text only";
  return "Fail";
}

/**
 * The single-ink grey a colour becomes when the artwork is reduced for block
 * or screen printing. Uses WCAG relative luminance re-encoded to sRGB, which
 * matches how a luminance-based greyscale conversion behaves.
 */
export function toGreyscale(rgb) {
  const y = relativeLuminance(rgb);
  const encoded = y <= 0.0031308 ? y * 12.92 : 1.055 * y ** (1 / 2.4) - 0.055;
  const channel = Math.round(clamp(encoded, 0, 1) * 255);
  return { r: channel, g: channel, b: channel };
}

/** sRGB 0-255 to HSL, needed to walk a pigment's lightness for screen use. */
export function rgbToHsl({ r, g, b }) {
  const rr = clamp(r, 0, 255) / 255;
  const gg = clamp(g, 0, 255) / 255;
  const bb = clamp(b, 0, 255) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === rr) h = 60 * (((gg - bb) / d) % 6);
  else if (max === gg) h = 60 * ((bb - rr) / d + 2);
  else h = 60 * ((rr - gg) / d + 4);
  return { h: (h + 360) % 360, s: s * 100, l: l * 100 };
}

/** HSL to sRGB 0-255, CSS Color Level 4 algorithm. */
export function hslToRgb(h, s, l) {
  const hh = ((Number(h) || 0) % 360 + 360) % 360;
  const ss = clamp(Number(s) || 0, 0, 100) / 100;
  const ll = clamp(Number(l) || 0, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const hp = hh / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb;
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = ll - c / 2;
  const [r, g, b] = rgb.map((v) => Math.round((v + m) * 255));
  return { r, g, b };
}

/** Lightness is walked in 1% steps; 100 steps covers the whole axis. */
const MAX_REPAIR_STEPS = 100;

/**
 * A pigment as it has to be adjusted for screen body text: hue and saturation
 * held, lightness walked away from the ground until the pair reaches `target`.
 * Returns the pigment unchanged when it already passes.
 */
export function adaptForText(rgb, groundRgb, target) {
  const { h, s, l } = rgbToHsl(rgb);
  // Walk away from the ground: darker on a light ground, lighter on a dark one.
  const dir = relativeLuminance(groundRgb) > 0.4 ? -1 : 1;
  let bestL = l;
  let bestRatio = contrastRatio(rgb, groundRgb);

  for (let i = 1; i <= MAX_REPAIR_STEPS && bestRatio < target; i += 1) {
    const nextL = clamp(l + dir * i, 0, 100);
    const ratio = contrastRatio(hslToRgb(h, s, nextL), groundRgb);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestL = nextL;
    }
    if (nextL === 0 || nextL === 100) break;
  }

  const adapted = hslToRgb(h, s, bestL);
  return {
    hex: rgbToHex(adapted),
    rgb: adapted,
    ratio: round2(bestRatio),
    achieved: bestRatio >= target,
    moved: Math.round(Math.abs(bestL - l)),
  };
}

/**
 * Build a heritage palette.
 */
export function generateHeritagePalette({ traditionId = "ajrakh", variation = 0 } = {}) {
  const tradition = TRADITIONS[traditionId];
  if (!tradition) return { error: "Choose one of the listed traditions." };

  const step = Number(variation);
  if (!Number.isFinite(step) || step < 0) {
    return { error: "Variation must be zero or a positive whole number." };
  }

  const v = Math.round(step) % (MAX_VARIATION + 1);

  const swatches = ROLE_ORDER.map((role, roleIndex) => {
    const pool = tradition.pools[role];
    // Each role advances through its pool at a different offset, so stepping
    // the variation changes the combination rather than shifting everything.
    const pigment = PIGMENTS[pool[(v + roleIndex) % pool.length]];
    const rgb = hexToRgb(pigment.hex);
    const grey = toGreyscale(rgb);
    return {
      role,
      roleLabel: ROLE_LABELS[role],
      pigmentId: pigment.id,
      name: pigment.name,
      source: pigment.source,
      note: pigment.note,
      hex: pigment.hex,
      rgb,
      greyHex: rgbToHex(grey),
      luminance: round1(relativeLuminance(rgb) * 100),
    };
  });

  const byRole = Object.fromEntries(swatches.map((swatch) => [swatch.role, swatch]));

  // Where a caption has to sit on a coloured block, a designer picks whichever
  // of the two ground tones reads better, so the audit measures that choice.
  const bestLabelOn = (bgRgb) => {
    const onGround = round2(contrastRatio(byRole.ground.rgb, bgRgb));
    const onInk = round2(contrastRatio(byRole.ink.rgb, bgRgb));
    return onInk >= onGround
      ? { name: byRole.ink.name, hex: byRole.ink.hex, rgb: byRole.ink.rgb, ratio: onInk }
      : { name: byRole.ground.name, hex: byRole.ground.hex, rgb: byRole.ground.rgb, ratio: onGround };
  };

  swatches.forEach((swatch) => {
    swatch.bestLabel = bestLabelOn(swatch.rgb);
  });

  // Text rows are held to the body-text threshold; motif rows are decorative
  // adjacency, where WCAG's 3:1 non-text figure is advisory rather than binding.
  const pairDefs = [
    ["ink", "ground", "Outline ink on ground", WCAG.AA_NORMAL, "text"],
    ["label", "primary", "Caption on the primary block", WCAG.AA_NORMAL, "text"],
    ["label", "secondary", "Caption on the secondary block", WCAG.AA_NORMAL, "text"],
    ["primary", "ground", "Primary motif on ground", WCAG.AA_LARGE, "motif"],
    ["secondary", "ground", "Secondary motif on ground", WCAG.AA_LARGE, "motif"],
    ["metal", "primary", "Metal highlight on primary", WCAG.UI_COMPONENT, "motif"],
  ];

  const pairs = pairDefs.map(([fg, bg, label, threshold, kind]) => {
    const foreground = fg === "label" ? byRole[bg].bestLabel : byRole[fg];
    const ratio = round2(contrastRatio(foreground.rgb, byRole[bg].rgb));
    return {
      id: `${fg}-on-${bg}`,
      label: fg === "label" ? `${label} (${foreground.name})` : label,
      kind,
      foreground: foreground.hex,
      background: byRole[bg].hex,
      ratio,
      threshold,
      level: wcagLevel(ratio),
      passes: ratio >= threshold,
    };
  });

  // A screen-ready version of each figure colour, adjusted only in lightness so
  // the hue of the original dye survives.
  const webAdaptations = ["primary", "secondary", "accent", "metal"].map((role) => {
    const swatch = byRole[role];
    const adapted = adaptForText(swatch.rgb, byRole.ground.rgb, WCAG.AA_NORMAL);
    return {
      role,
      roleLabel: swatch.roleLabel,
      name: swatch.name,
      originalHex: swatch.hex,
      originalRatio: round2(contrastRatio(swatch.rgb, byRole.ground.rgb)),
      hex: adapted.hex,
      ratio: adapted.ratio,
      achieved: adapted.achieved,
      moved: adapted.moved,
    };
  });

  // Greyscale separation between the colours that carry the motif.
  const figureRoles = ["primary", "secondary", "accent", "metal"];
  const greyPairs = [];
  for (let i = 0; i < figureRoles.length; i += 1) {
    for (let j = i + 1; j < figureRoles.length; j += 1) {
      const a = byRole[figureRoles[i]];
      const b = byRole[figureRoles[j]];
      const gap = round1(Math.abs(a.luminance - b.luminance));
      greyPairs.push({
        id: `${a.role}-${b.role}`,
        label: `${a.roleLabel} vs ${b.roleLabel}`,
        gap,
        separable: gap >= MIN_GREYSCALE_GAP,
      });
    }
  }

  const orderedByLuminance = [...swatches].sort((a, b) => a.luminance - b.luminance);

  return {
    traditionId: tradition.id,
    traditionLabel: tradition.label,
    note: tradition.note,
    variation: v,
    swatches,
    byRole,
    pairs,
    passingPairs: pairs.filter((pair) => pair.passes).length,
    totalPairs: pairs.length,
    textPairs: pairs.filter((pair) => pair.kind === "text"),
    passingTextPairs: pairs.filter((pair) => pair.kind === "text" && pair.passes).length,
    totalTextPairs: pairs.filter((pair) => pair.kind === "text").length,
    webAdaptations,
    webAdaptationsAchieved: webAdaptations.filter((item) => item.achieved).length,
    greyPairs,
    separableGreyPairs: greyPairs.filter((pair) => pair.separable).length,
    totalGreyPairs: greyPairs.length,
    minGreyscaleGap: MIN_GREYSCALE_GAP,
    luminanceOrder: orderedByLuminance.map((swatch) => ({
      role: swatch.role,
      name: swatch.name,
      luminance: swatch.luminance,
      greyHex: swatch.greyHex,
    })),
  };
}

/** CSS custom properties for the palette. */
export function formatPaletteCss(palette) {
  if (!palette || palette.error) return "";
  return [
    `/* ${palette.traditionLabel} — variation ${palette.variation} */`,
    ":root {",
    ...palette.swatches.map(
      (swatch) => `  --heritage-${swatch.role}: ${HASH}${swatch.hex}; /* ${swatch.name} */`,
    ),
    "}",
  ].join("\n");
}

/** Plain-text summary with provenance and both checks. */
export function formatPaletteText(palette) {
  if (!palette || palette.error) return "";
  return [
    `${palette.traditionLabel} — variation ${palette.variation}`,
    palette.note,
    "",
    ...palette.swatches.map(
      (s) => `${s.roleLabel.padEnd(18)} ${HASH}${s.hex}  ${s.name} — ${s.source}`,
    ),
    "",
    "Contrast audit (WCAG 2.x)",
    ...palette.pairs.map(
      (p) =>
        `${p.label.padEnd(38)} ${p.ratio}:1  needs ${p.threshold}:1  ${p.passes ? "pass" : "fail"}  [${p.kind}]`,
    ),
    "",
    "Screen-adapted tones (lightness moved, hue kept)",
    ...palette.webAdaptations.map(
      (a) =>
        `${a.roleLabel.padEnd(18)} ${HASH}${a.originalHex} (${a.originalRatio}:1) -> ${HASH}${a.hex} (${a.ratio}:1)${a.moved ? `, moved ${a.moved}%` : ", unchanged"}`,
    ),
    "",
    `Greyscale separation (target ${palette.minGreyscaleGap} luminance points)`,
    ...palette.greyPairs.map(
      (p) => `${p.label.padEnd(30)} ${p.gap} points  ${p.separable ? "separable" : "merges"}`,
    ),
    "",
    "Colours here are screen interpretations of traditional dyes and pigments,",
    "not measured standards. Match against a physical swatch before production.",
  ].join("\n");
}
