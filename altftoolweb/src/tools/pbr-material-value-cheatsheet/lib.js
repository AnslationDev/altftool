/**
 * PBR Material Value Cheatsheet — colour science and reference data.
 *
 * Pure module: no React, no DOM, no clock. All colour maths follows the sRGB
 * transfer function defined in IEC 61966-2-1 and Rec. 709 luminance weights.
 */

/** sRGB EOTF break point and constants (IEC 61966-2-1). */
export const SRGB = {
  linearThreshold: 0.0031308,
  encodedThreshold: 0.04045,
  slope: 12.92,
  alpha: 0.055,
  gamma: 2.4,
};

/** Rec. 709 / sRGB luminance weights used for relative luminance. */
export const LUMA_WEIGHTS = { r: 0.2126, g: 0.7152, b: 0.0722 };

/**
 * Authoring range most PBR guides give for a dielectric base colour, in 8-bit
 * sRGB. The floor sits just under fresh asphalt / charcoal (linear ~0.03) and
 * the ceiling just above fresh snow (linear ~0.81 encodes to about 232).
 */
export const DIELECTRIC_SRGB_RANGE = { min: 50, max: 243 };

/** Decode one 0-1 sRGB channel to linear light. Non-numeric input reads as 0. */
export function srgbToLinear(channel) {
  const c = Number(channel);
  if (!Number.isFinite(c)) return 0;
  const clamped = Math.min(1, Math.max(0, c));
  return clamped <= SRGB.encodedThreshold
    ? clamped / SRGB.slope
    : Math.pow((clamped + SRGB.alpha) / (1 + SRGB.alpha), SRGB.gamma);
}

/** Encode one 0-1 linear channel back to sRGB. Non-numeric input reads as 0. */
export function linearToSrgb(channel) {
  const c = Number(channel);
  if (!Number.isFinite(c)) return 0;
  const clamped = Math.min(1, Math.max(0, c));
  return clamped <= SRGB.linearThreshold
    ? clamped * SRGB.slope
    : (1 + SRGB.alpha) * Math.pow(clamped, 1 / SRGB.gamma) - SRGB.alpha;
}

/** Linear 0-1 triplet to 8-bit sRGB triplet. */
export function linearToSrgb255(linear) {
  return linear.map((channel) => Math.round(linearToSrgb(channel) * 255));
}

/** 8-bit sRGB triplet to linear 0-1 triplet. */
export function srgb255ToLinear(srgb) {
  return srgb.map((channel) => srgbToLinear(Number(channel) / 255));
}

/** Relative luminance of a linear triplet (Rec. 709 weights). */
export function relativeLuminance(linear) {
  const [r, g, b] = linear;
  return LUMA_WEIGHTS.r * r + LUMA_WEIGHTS.g * g + LUMA_WEIGHTS.b * b;
}

/**
 * Normal-incidence reflectance from an index of refraction:
 * F0 = ((n - 1) / (n + 1))^2, the Fresnel equation at zero degrees with the
 * surrounding medium assumed to be air (n = 1).
 */
export function iorToF0(ior) {
  const n = Number(ior);
  if (!Number.isFinite(n) || n <= 0) return null;
  const ratio = (n - 1) / (n + 1);
  return ratio * ratio;
}

/** Inverse of iorToF0 for F0 in [0, 1). Returns null outside that domain. */
export function f0ToIor(f0) {
  const value = Number(f0);
  if (!Number.isFinite(value) || value < 0 || value >= 1) return null;
  const root = Math.sqrt(value);
  return (1 + root) / (1 - root);
}

/**
 * Disney / UE remap: the GGX alpha term is roughness squared.
 * Finite input is clamped into [0, 1]; non-numeric input returns null.
 */
export function roughnessToAlpha(roughness) {
  const r = Number(roughness);
  if (!Number.isFinite(r)) return null;
  const clamped = Math.min(1, Math.max(0, r));
  return clamped * clamped;
}

/**
 * Ceiling for the Blinn-Phong exponent. Beyond this the highlight is a single
 * sub-pixel dot, so the number stops carrying useful information.
 */
export const MAX_SPECULAR_POWER = 1e6;

/**
 * Approximate Blinn-Phong specular exponent for a given GGX roughness:
 * alpha = roughness^2, exponent = 2 / alpha^2 - 2.
 * Used when porting values to an older specular-gloss pipeline. Clamped at
 * MAX_SPECULAR_POWER so a roughness of zero never returns Infinity.
 */
export function roughnessToSpecularPower(roughness) {
  const alpha = roughnessToAlpha(roughness);
  if (alpha === null) return null;
  if (alpha <= 0) return MAX_SPECULAR_POWER;
  return Math.min(MAX_SPECULAR_POWER, Math.max(0, 2 / (alpha * alpha) - 2));
}

/** Specular-gloss pipelines use gloss = 1 - roughness (clamped to 0-1). */
export function roughnessToGloss(roughness) {
  const r = Number(roughness);
  if (!Number.isFinite(r)) return null;
  return 1 - Math.min(1, Math.max(0, r));
}

/** Convert an 8-bit sRGB triplet to HSL components for swatch rendering. */
export function srgb255ToHsl(srgb) {
  const [r, g, b] = srgb.map((channel) => Math.min(255, Math.max(0, Number(channel) || 0)) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (delta > 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}

/**
 * Metals: `linear` is the measured normal-incidence reflectance (F0) per
 * channel — for a metal this is also its base colour. Values follow the
 * reflectance tables used across mainstream PBR documentation.
 */
export const METALS = [
  { id: "iron", name: "Iron", linear: [0.56, 0.57, 0.58], roughness: [0.2, 0.6], note: "Cool neutral grey; the classic reference metal." },
  { id: "silver", name: "Silver", linear: [0.972, 0.96, 0.915], roughness: [0.02, 0.2], note: "Brightest common metal; tarnishes warm and dark." },
  { id: "aluminium", name: "Aluminium", linear: [0.913, 0.921, 0.925], roughness: [0.05, 0.45], note: "Slightly blue-neutral; brushed finishes push roughness up." },
  { id: "gold", name: "Gold", linear: [1.0, 0.766, 0.336], roughness: [0.02, 0.25], note: "Strong warm tint; blue channel is the giveaway." },
  { id: "copper", name: "Copper", linear: [0.955, 0.637, 0.538], roughness: [0.05, 0.4], note: "Oxidises to green patina, which is a dielectric layer." },
  { id: "chromium", name: "Chromium", linear: [0.55, 0.556, 0.554], roughness: [0.02, 0.15], note: "Darker than it looks; mirror finish does the work." },
  { id: "nickel", name: "Nickel", linear: [0.66, 0.609, 0.526], roughness: [0.05, 0.35], note: "Warm neutral, common as a plating layer." },
  { id: "titanium", name: "Titanium", linear: [0.542, 0.497, 0.449], roughness: [0.1, 0.5], note: "Darkest of the common metals; slightly warm." },
  { id: "cobalt", name: "Cobalt", linear: [0.662, 0.655, 0.634], roughness: [0.1, 0.4], note: "Near-neutral, marginally warm." },
  { id: "platinum", name: "Platinum", linear: [0.672, 0.637, 0.585], roughness: [0.02, 0.25], note: "Warmer and darker than silver." },
  { id: "brass", name: "Brass (alloy)", linear: [0.887, 0.789, 0.434], roughness: [0.05, 0.4], note: "Alloy, so composition and finish shift the value a lot." },
];

/**
 * Dielectrics: `albedo` is measured diffuse reflectance (linear, 0-1) from
 * standard albedo tables. `ior` drives F0 through the Fresnel equation.
 * Values are levels, not hues — add colour without moving the brightness far.
 */
export const DIELECTRICS = [
  { id: "fresh-snow", name: "Fresh snow", albedo: 0.81, ior: 1.31, roughness: [0.4, 0.9], note: "Near the practical ceiling for a base colour." },
  { id: "white-plaster", name: "White plaster / paint", albedo: 0.8, ior: 1.5, roughness: [0.6, 0.95], note: "Matte architectural white." },
  { id: "dry-sand", name: "Dry sand", albedo: 0.36, ior: 1.54, roughness: [0.7, 0.95], note: "Wet sand drops to roughly half this." },
  { id: "skin", name: "Skin (mid tone)", albedo: 0.35, ior: 1.4, roughness: [0.35, 0.6], note: "Varies 0.15-0.45 across skin tones; needs subsurface too." },
  { id: "concrete", name: "Concrete (dry)", albedo: 0.3, ior: 1.5, roughness: [0.6, 0.95], note: "Wet concrete darkens and sharpens reflections." },
  { id: "wood-oak", name: "Wood, unfinished oak", albedo: 0.25, ior: 1.53, roughness: [0.5, 0.85], note: "Varnish drops roughness to 0.1-0.3." },
  { id: "red-brick", name: "Red brick", albedo: 0.23, ior: 1.5, roughness: [0.7, 0.95], note: "Mortar reads brighter than the brick itself." },
  { id: "grass", name: "Grass", albedo: 0.21, ior: 1.45, roughness: [0.6, 0.9], note: "Dry grass is brighter, wet grass darker." },
  { id: "worn-asphalt", name: "Worn asphalt", albedo: 0.12, ior: 1.5, roughness: [0.6, 0.9], note: "Polished wheel tracks are far glossier." },
  { id: "green-leaf", name: "Green leaf", albedo: 0.09, ior: 1.45, roughness: [0.3, 0.6], note: "Waxy cuticle gives a distinct specular sheen." },
  { id: "rubber", name: "Black rubber", albedo: 0.05, ior: 1.52, roughness: [0.7, 0.95], note: "Dark but never black — keep it above the floor." },
  { id: "fresh-asphalt", name: "Fresh asphalt", albedo: 0.04, ior: 1.5, roughness: [0.5, 0.8], note: "About as dark as a real surface gets." },
  { id: "charcoal", name: "Charcoal", albedo: 0.04, ior: 1.5, roughness: [0.8, 1.0], note: "The darkest common reference; still not zero." },
  { id: "water", name: "Water", albedo: 0.02, ior: 1.333, roughness: [0.0, 0.1], note: "Almost all the look comes from specular and refraction." },
];

/** Common transparent / coating media, for F0 lookups. */
export const IOR_REFERENCE = [
  { id: "air", name: "Air", ior: 1.0 },
  { id: "ice", name: "Ice", ior: 1.31 },
  { id: "water", name: "Water", ior: 1.333 },
  { id: "skin", name: "Skin", ior: 1.4 },
  { id: "plastic", name: "Plastic (typical)", ior: 1.46 },
  { id: "glass", name: "Glass", ior: 1.5 },
  { id: "quartz", name: "Quartz", ior: 1.55 },
  { id: "sapphire", name: "Sapphire", ior: 1.77 },
  { id: "diamond", name: "Diamond", ior: 2.42 },
];

/** Every material as one shape, with the derived sRGB swatch attached. */
export function buildMaterialTable() {
  const metals = METALS.map((item) => ({
    ...item,
    type: "metal",
    linearTriplet: item.linear,
    srgb: linearToSrgb255(item.linear),
    luminance: relativeLuminance(item.linear),
    f0: relativeLuminance(item.linear),
  }));
  const dielectrics = DIELECTRICS.map((item) => {
    const linear = [item.albedo, item.albedo, item.albedo];
    return {
      ...item,
      type: "dielectric",
      linearTriplet: linear,
      srgb: linearToSrgb255(linear),
      luminance: item.albedo,
      f0: iorToF0(item.ior),
    };
  });
  return [...metals, ...dielectrics];
}

/** Case-insensitive name/note search across the table. */
export function searchMaterials(query, table = buildMaterialTable()) {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return table;
  return table.filter(
    (item) =>
      item.name.toLowerCase().includes(term) ||
      item.type.includes(term) ||
      String(item.note || "").toLowerCase().includes(term),
  );
}

/** Closest reference material to a linear triplet, by Euclidean distance. */
export function nearestMaterial(linear, table = buildMaterialTable()) {
  let best = null;
  let bestDistance = Infinity;
  for (const item of table) {
    const [dr, dg, db] = [0, 1, 2].map((i) => linear[i] - item.linearTriplet[i]);
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item;
    }
  }
  return best ? { material: best, distance: bestDistance } : null;
}

/**
 * Check a base colour against the standard authoring rules.
 *
 * @param {object} input
 * @param {number} input.r 0-255 sRGB red
 * @param {number} input.g 0-255 sRGB green
 * @param {number} input.b 0-255 sRGB blue
 * @param {number} input.metallic 0 or 1
 * @param {number} [input.roughness] 0-1
 */
export function validateBaseColor({ r, g, b, metallic, roughness = 0.5 } = {}) {
  const channels = [r, g, b].map(Number);
  if (!channels.every((channel) => Number.isFinite(channel))) {
    return { error: "Enter red, green and blue values between 0 and 255." };
  }
  if (channels.some((channel) => channel < 0 || channel > 255)) {
    return { error: "Each sRGB channel must be between 0 and 255." };
  }
  const metal = Number(metallic);
  if (!Number.isFinite(metal) || metal < 0 || metal > 1) {
    return { error: "Metallic must be between 0 and 1." };
  }
  const rough = Number(roughness);
  if (!Number.isFinite(rough) || rough < 0 || rough > 1) {
    return { error: "Roughness must be between 0 and 1." };
  }

  const linear = srgb255ToLinear(channels);
  const luminance = relativeLuminance(linear);
  const issues = [];

  if (metal > 0.1 && metal < 0.9) {
    issues.push(
      "Metallic sits between 0 and 1. Outside a blend mask, real surfaces are either metal or not.",
    );
  }
  if (metal >= 0.9) {
    if (luminance < 0.35) {
      issues.push(
        `Reflectance ${luminance.toFixed(3)} is darker than any common metal — the darkest reference here is titanium at about 0.50.`,
      );
    }
  } else if (metal <= 0.1) {
    const low = Math.min(...channels);
    const high = Math.max(...channels);
    if (low < DIELECTRIC_SRGB_RANGE.min) {
      issues.push(
        `Channel value ${Math.round(low)} is below the usual dielectric floor of ${DIELECTRIC_SRGB_RANGE.min} — even fresh asphalt encodes to about 56.`,
      );
    }
    if (high > DIELECTRIC_SRGB_RANGE.max) {
      issues.push(
        `Channel value ${Math.round(high)} is above the usual dielectric ceiling of ${DIELECTRIC_SRGB_RANGE.max} — fresh snow only reaches about 232.`,
      );
    }
  }
  if (rough < 0.02 && metal <= 0.1) {
    issues.push("Roughness under 0.02 on a dielectric will alias badly under most specular filters.");
  }

  const table = buildMaterialTable();
  const pool = metal >= 0.5 ? table.filter((item) => item.type === "metal") : table.filter((item) => item.type === "dielectric");
  const nearest = nearestMaterial(linear, pool);

  return {
    srgb: channels.map((channel) => Math.round(channel)),
    linear,
    luminance,
    hsl: srgb255ToHsl(channels),
    metallic: metal,
    roughness: rough,
    alpha: roughnessToAlpha(rough),
    gloss: roughnessToGloss(rough),
    specularPower: roughnessToSpecularPower(rough),
    issues,
    ok: issues.length === 0,
    nearest,
  };
}
