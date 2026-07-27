/**
 * ICC Profile Explainer — gamut geometry and mis-tagging maths.
 *
 * Pure module. Primaries are the published CIE 1931 xy chromaticities for each
 * working space; gamut size is the area of the triangle they span.
 */

/**
 * Working spaces with their red, green and blue chromaticities and white point.
 * `bits` is the depth at which the space is normally safe to edit in.
 */
export const PROFILES = [
  {
    id: "srgb",
    name: "sRGB",
    primaries: { r: [0.64, 0.33], g: [0.3, 0.6], b: [0.15, 0.06] },
    whitePoint: { name: "D65", xy: [0.3127, 0.329] },
    transfer: "sRGB piecewise curve (about gamma 2.2)",
    safeBits: 8,
    use: "The default for the web, screenshots, UI and anything with no profile at all.",
  },
  {
    id: "rec709",
    name: "Rec. 709",
    primaries: { r: [0.64, 0.33], g: [0.3, 0.6], b: [0.15, 0.06] },
    whitePoint: { name: "D65", xy: [0.3127, 0.329] },
    transfer: "BT.1886 gamma 2.4 on the display side",
    safeBits: 8,
    use: "HD video delivery. Same primaries as sRGB, different tone curve.",
  },
  {
    id: "adobergb",
    name: "Adobe RGB (1998)",
    primaries: { r: [0.64, 0.33], g: [0.21, 0.71], b: [0.15, 0.06] },
    whitePoint: { name: "D65", xy: [0.3127, 0.329] },
    transfer: "Gamma 563/256 (about 2.2)",
    safeBits: 16,
    use: "Photography headed for CMYK print, where the extra cyan-green matters.",
  },
  {
    id: "displayp3",
    name: "Display P3",
    primaries: { r: [0.68, 0.32], g: [0.265, 0.69], b: [0.15, 0.06] },
    whitePoint: { name: "D65", xy: [0.3127, 0.329] },
    transfer: "sRGB piecewise curve",
    safeBits: 16,
    use: "Modern phone and laptop screens. Wider reds and greens than sRGB.",
  },
  {
    id: "rec2020",
    name: "Rec. 2020",
    primaries: { r: [0.708, 0.292], g: [0.17, 0.797], b: [0.131, 0.046] },
    whitePoint: { name: "D65", xy: [0.3127, 0.329] },
    transfer: "BT.2020 / PQ or HLG for HDR",
    safeBits: 10,
    use: "UHD and HDR delivery. No consumer display covers it fully today.",
  },
  {
    id: "prophoto",
    name: "ProPhoto RGB",
    primaries: { r: [0.734699, 0.265301], g: [0.159597, 0.840403], b: [0.036598, 0.000105] },
    whitePoint: { name: "D50", xy: [0.3457, 0.3585] },
    transfer: "Gamma 1.8",
    safeBits: 16,
    use: "Raw editing headroom. Large enough that 8-bit editing visibly bands.",
  },
];

/** Depth below which editing a wide-gamut file starts to band. */
export const MIN_WIDE_GAMUT_BITS = 16;

/** Area ratio above sRGB at which 8-bit editing becomes risky. */
export const BANDING_RISK_RATIO = 1.3;

/** ICC rendering intents, and when each one is the right call. */
export const RENDERING_INTENTS = [
  {
    id: "perceptual",
    name: "Perceptual",
    summary: "Compresses the whole gamut so relationships between colours survive.",
    when: "Photographs with saturated content going to a smaller space, such as print.",
    cost: "Shifts colours that were already in gamut, including neutrals in some profiles.",
  },
  {
    id: "relative",
    name: "Relative colorimetric",
    summary: "Keeps in-gamut colours exactly and clips what falls outside, after mapping white to white.",
    when: "Most photo and screen conversions; the usual default with black point compensation on.",
    cost: "Out-of-gamut detail flattens into a single clipped colour.",
  },
  {
    id: "saturation",
    name: "Saturation",
    summary: "Prioritises vivid output over accuracy.",
    when: "Charts, diagrams and business graphics.",
    cost: "Unusable for photographic or skin-tone work.",
  },
  {
    id: "absolute",
    name: "Absolute colorimetric",
    summary: "Keeps in-gamut colours and does not adapt the white point.",
    when: "Proofing one paper's white on another, where the paper tint must be simulated.",
    cost: "Casts the whole image if the two white points differ.",
  },
];

/** What the two commands that people confuse actually do. */
export const ASSIGN_VS_CONVERT = [
  {
    id: "assign",
    action: "Assign profile",
    numbersChange: false,
    appearanceChanges: true,
    detail:
      "Leaves every pixel value untouched and changes the label that says what those numbers mean. Use it when a file arrived untagged and you know what it really is.",
  },
  {
    id: "convert",
    action: "Convert to profile",
    numbersChange: true,
    appearanceChanges: false,
    detail:
      "Recalculates every pixel so the colour looks the same in the new space. Use it when moving a correctly tagged file into another working space or an output profile.",
  },
];

/** Area of the chromaticity triangle spanned by a profile's primaries. */
export function gamutAreaXy(profile) {
  if (!profile || !profile.primaries) return 0;
  const { r, g, b } = profile.primaries;
  const area = Math.abs(r[0] * (g[1] - b[1]) + g[0] * (b[1] - r[1]) + b[0] * (r[1] - g[1])) / 2;
  return Number.isFinite(area) ? area : 0;
}

/** Look a profile up by id. */
export function findProfile(id) {
  return PROFILES.find((profile) => profile.id === id) || null;
}

/** Ratio of one profile's chromaticity area to another's. */
export function areaRatio(profileA, profileB) {
  const a = gamutAreaXy(profileA);
  const b = gamutAreaXy(profileB);
  if (!(b > 0)) return 0;
  return a / b;
}

/** Straight-line distance between two xy chromaticities. */
export function chromaticityDistance(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * What happens to each primary when a file authored in one space is read as
 * if it were another. The code values do not move, so the displayed
 * chromaticity jumps from the actual primary to the assumed one.
 */
export function primaryShifts(actual, assumed) {
  return ["r", "g", "b"].map((channel) => {
    const from = actual.primaries[channel];
    const to = assumed.primaries[channel];
    const distance = chromaticityDistance(from, to);
    // Distance from the white point is a proxy for saturation in xy.
    const fromPurity = chromaticityDistance(from, assumed.whitePoint.xy);
    const toPurity = chromaticityDistance(to, assumed.whitePoint.xy);
    let direction = "unchanged";
    if (distance > 1e-9) direction = toPurity > fromPurity ? "more saturated" : "less saturated";
    return {
      channel,
      label: { r: "Red", g: "Green", b: "Blue" }[channel],
      from,
      to,
      distance,
      direction,
    };
  });
}

/**
 * Explain a profile mismatch.
 *
 * @param {object} input
 * @param {string} input.actualId  the space the file was really authored in.
 * @param {string} input.assumedId the space the viewer or app assumed.
 */
export function explainMismatch({ actualId, assumedId } = {}) {
  const actual = findProfile(actualId);
  const assumed = findProfile(assumedId);
  if (!actual || !assumed) return { error: "Pick both an actual and an assumed profile." };

  const actualArea = gamutAreaXy(actual);
  const assumedArea = gamutAreaXy(assumed);
  const ratio = assumedArea > 0 ? actualArea / assumedArea : 0;
  const shifts = primaryShifts(actual, assumed);
  const worst = shifts.reduce((best, item) => (item.distance > best.distance ? item : best), shifts[0]);
  const sameGamut = ratio > 0.999 && ratio < 1.001;
  const whitePointDiffers = actual.whitePoint.name !== assumed.whitePoint.name;

  let verdict;
  if (sameGamut && !whitePointDiffers) {
    verdict = "Same primaries and white point — only the tone curve can differ.";
  } else if (ratio > 1) {
    verdict = "Colours will look flatter and less saturated than intended.";
  } else {
    verdict = "Colours will look over-saturated, with skin tones going ruddy.";
  }

  return {
    actual,
    assumed,
    actualArea,
    assumedArea,
    ratio,
    sameGamut,
    whitePointDiffers,
    shifts,
    worstShift: worst,
    verdict,
    fix:
      sameGamut && !whitePointDiffers
        ? "No conversion needed; check the tone curve and the tag instead."
        : `Assign ${actual.name} to restore the intended appearance, then convert to ${assumed.name} only if the destination requires it.`,
  };
}

/**
 * Working-space report: gamut size against sRGB and whether the bit depth you
 * plan to edit at is enough.
 */
export function profileReport({ profileId, bitDepth } = {}) {
  const profile = findProfile(profileId);
  if (!profile) return { error: "Pick a working space." };

  const bits = Number(bitDepth);
  if (!Number.isFinite(bits) || bits < 8 || bits > 32) {
    return { error: "Bit depth must be between 8 and 32." };
  }

  const srgb = findProfile("srgb");
  const area = gamutAreaXy(profile);
  const ratio = areaRatio(profile, srgb);
  const bandingRisk = ratio >= BANDING_RISK_RATIO && bits < MIN_WIDE_GAMUT_BITS;

  return {
    profile,
    area,
    srgbArea: gamutAreaXy(srgb),
    ratioVsSrgb: ratio,
    percentLargerThanSrgb: (ratio - 1) * 100,
    bitDepth: bits,
    bandingRisk,
    advice: bandingRisk
      ? `${profile.name} spans about ${(ratio * 100 - 100).toFixed(0)}% more chromaticity area than sRGB, so ${bits}-bit editing spreads the same number of codes over a wider space and will band in gradients. Work at ${MIN_WIDE_GAMUT_BITS}-bit.`
      : `${bits}-bit is enough headroom for editing in ${profile.name}.`,
    comparison: PROFILES.map((item) => ({
      id: item.id,
      name: item.name,
      area: gamutAreaXy(item),
      ratioVsSrgb: areaRatio(item, srgb),
      whitePoint: item.whitePoint.name,
      safeBits: item.safeBits,
      transfer: item.transfer,
      use: item.use,
    })),
  };
}
