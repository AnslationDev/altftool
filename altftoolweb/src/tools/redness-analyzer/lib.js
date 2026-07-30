/**
 * Facial redness measurement — pure logic.
 *
 * What this does: it measures colour. Pixels that fall inside the usual
 * skin-tone chroma range are converted from sRGB to CIELAB (D65) and the a*
 * axis — the green-to-red axis of the Lab colour space — is averaged for the
 * cheeks, nose, forehead and chin. The headline figure is Δa*: how much redder
 * an area is than the calmest skin found in the same photo. Comparing regions
 * inside one frame cancels most of the skin tone, exposure and white balance,
 * which a raw redness number cannot do.
 *
 * What this is not: a diagnosis, and not a measurement of blood flow. A camera
 * records colour under unknown lighting; a dermatoscope or a calibrated
 * erythema meter does not. Nothing here is a medical grade.
 *
 * Pure JS: no DOM, no network, no Date, no Math.random. Same pixels in, same
 * numbers out.
 */

/* -------------------------------------------------------------- *
 * Colour science
 * -------------------------------------------------------------- */

/** sRGB companding, IEC 61966-2-1. */
export function srgbToLinear(channel) {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

// sRGB (D65) to CIE XYZ matrix, IEC 61966-2-1.
const M = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];

// D65 reference white, 2 degree observer.
const WHITE = { X: 0.95047, Y: 1.0, Z: 1.08883 };

// CIE 15:2004 constants for the L* transfer function.
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

function labF(t) {
  return t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116;
}

/** sRGB 0-255 -> CIELAB (D65). */
export function rgbToLab(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const X = M[0][0] * lr + M[0][1] * lg + M[0][2] * lb;
  const Y = M[1][0] * lr + M[1][1] * lg + M[1][2] * lb;
  const Z = M[2][0] * lr + M[2][1] * lg + M[2][2] * lb;
  const fx = labF(X / WHITE.X);
  const fy = labF(Y / WHITE.Y);
  const fz = labF(Z / WHITE.Z);
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/* -------------------------------------------------------------- *
 * Skin gate
 *
 * The YCbCr chroma window below is the classic Chai & Ngan skin rule
 * (77 <= Cb <= 127, 133 <= Cr <= 173). It keys on chroma rather than
 * brightness, so it holds across skin tones; the luma window then throws away
 * blown highlights and near-black shadow where colour cannot be trusted.
 * -------------------------------------------------------------- */
export const SKIN_GATE = {
  cbMin: 77,
  cbMax: 127,
  crMin: 133,
  crMax: 173,
  lumaMin: 40, // below this the sensor noise dominates the chroma
  lumaMax: 245, // above this a channel is close to clipping
};

/** ITU-R BT.601 luma, the basis of the YCbCr skin rule. */
export function luma601(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function isSkinPixel(r, g, b) {
  const y = luma601(r, g, b);
  if (y < SKIN_GATE.lumaMin || y > SKIN_GATE.lumaMax) return false;
  const cb = 128 + 0.564 * (b - y);
  const cr = 128 + 0.713 * (r - y);
  return (
    cb >= SKIN_GATE.cbMin && cb <= SKIN_GATE.cbMax && cr >= SKIN_GATE.crMin && cr <= SKIN_GATE.crMax
  );
}

/* -------------------------------------------------------------- *
 * Severity bands
 *
 * Steps along the a* axis, anchored on the ~1 unit just-noticeable colour
 * difference in CIELAB: under about 1 unit two areas look the same to the eye.
 * These are photographic descriptions, not clinical grades.
 * -------------------------------------------------------------- */
export const SEVERITY_BANDS = [
  { id: "even", label: "Even", min: 0, max: 1, blurb: "Below the ~1 unit just-noticeable difference — the eye reads this as one colour." },
  { id: "slight", label: "Slight", min: 1, max: 2.5, blurb: "Visible side by side, easy to miss on its own." },
  { id: "noticeable", label: "Noticeable", min: 2.5, max: 5, blurb: "Clearly redder than the calmest skin in the frame." },
  { id: "marked", label: "Marked", min: 5, max: 8, blurb: "A strong local colour difference across the sampled area." },
  { id: "strong", label: "Strong", min: 8, max: Infinity, blurb: "Very large a* gap — check the lighting before reading anything into it." },
];

export function severityFor(delta) {
  const value = Number.isFinite(delta) ? Math.max(0, delta) : 0;
  return SEVERITY_BANDS.find((band) => value >= band.min && value < band.max) || SEVERITY_BANDS[0];
}

/**
 * Region windows as fractions of the detected face box.
 * Chosen to sit clear of the eyes (around 0.32-0.42 of face height) and the
 * mouth (around 0.68-0.80); anything that fails the skin gate inside a window,
 * such as lips, brows or a nostril shadow, is dropped anyway.
 */
export const REGION_LAYOUT = [
  { id: "forehead", label: "Forehead", x0: 0.28, x1: 0.72, y0: 0.08, y1: 0.26 },
  { id: "leftCheek", label: "Left cheek", x0: 0.08, x1: 0.32, y0: 0.44, y1: 0.66 },
  { id: "rightCheek", label: "Right cheek", x0: 0.68, x1: 0.92, y0: 0.44, y1: 0.66 },
  { id: "nose", label: "Nose", x0: 0.42, x1: 0.58, y0: 0.4, y1: 0.6 },
  { id: "chin", label: "Chin", x0: 0.4, x1: 0.6, y0: 0.85, y1: 0.98 },
];

const MAX_SAMPLES = 240000; // work grid size; bigger photos are stepped down
const CELL = 8; // face detection grid, in samples
const CELL_SKIN_DENSITY = 0.45; // a cell counts as skin when this share of its samples pass
const MIN_FACE_CELLS = 6; // smaller than this is not a face-sized area
const MIN_REGION_SAMPLES = 40; // below this a region is reported as "not enough skin"
const MIN_SKIN_SAMPLES = 400; // below this the whole photo is rejected
const MIN_DIMENSION = 64;
const HOT_STEP = 2.5; // "affected" = a* at least this far above the calm baseline (the "noticeable" step)
const CAST_WARN = 1.18; // grey-world channel imbalance that suggests a colour cast

function round2(value) {
  const rounded = Math.round(value * 100) / 100;
  return rounded === 0 ? 0 : rounded; // never hand back -0
}

function round1(value) {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? 0 : rounded;
}

/**
 * Measure facial redness on raw RGBA pixels.
 *
 * @param {{data: ArrayLike<number>, width: number, height: number}} frame
 * @returns {object} report, or { error }
 */
export function analyzeFacialRedness(frame) {
  if (!frame || typeof frame !== "object") {
    return { error: "No image data was passed in." };
  }
  const { data, width, height } = frame;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return { error: "The image has no usable width or height." };
  }
  if (!data || typeof data.length !== "number" || data.length < width * height * 4) {
    return { error: "The pixel buffer is shorter than the image dimensions say it should be." };
  }
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return {
      error: `The image is only ${width}x${height}. Use a photo at least ${MIN_DIMENSION}px on each side, or the face is too small to sample.`,
    };
  }

  const step = Math.max(1, Math.ceil(Math.sqrt((width * height) / MAX_SAMPLES)));
  const sw = Math.ceil(width / step);
  const sh = Math.ceil(height / step);
  const total = sw * sh;

  const skin = new Uint8Array(total);
  const aStar = new Float32Array(total);
  const lStar = new Float32Array(total);
  const bStar = new Float32Array(total);

  let skinCount = 0;
  let clipped = 0;
  let dark = 0;
  let backgroundCount = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  for (let sy = 0; sy < sh; sy += 1) {
    const y = Math.min(height - 1, sy * step);
    for (let sx = 0; sx < sw; sx += 1) {
      const x = Math.min(width - 1, sx * step);
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const alpha = data[idx + 3];
      const si = sy * sw + sx;

      const yy = luma601(r, g, b);
      if (yy > SKIN_GATE.lumaMax) clipped += 1;
      if (yy < SKIN_GATE.lumaMin) dark += 1;

      if (alpha < 250) continue; // transparent pixels carry no reliable colour at all
      if (!isSkinPixel(r, g, b)) {
        // Everything that is not skin is the grey-world reference for white balance.
        backgroundCount += 1;
        sumR += r;
        sumG += g;
        sumB += b;
        continue;
      }

      const lab = rgbToLab(r, g, b);
      skin[si] = 1;
      aStar[si] = lab.a;
      lStar[si] = lab.L;
      bStar[si] = lab.b;
      skinCount += 1;
    }
  }

  if (skinCount < MIN_SKIN_SAMPLES) {
    return {
      error:
        "No skin-toned area large enough to measure. Fill more of the frame with the face, drop any heavy filter, and use even light.",
    };
  }

  /* ---- face box: largest connected block of skin-dense cells ---- */
  const cw = Math.ceil(sw / CELL);
  const ch = Math.ceil(sh / CELL);
  const dense = new Uint8Array(cw * ch);
  for (let cy = 0; cy < ch; cy += 1) {
    for (let cx = 0; cx < cw; cx += 1) {
      let inCell = 0;
      let skinInCell = 0;
      for (let sy = cy * CELL; sy < Math.min((cy + 1) * CELL, sh); sy += 1) {
        for (let sx = cx * CELL; sx < Math.min((cx + 1) * CELL, sw); sx += 1) {
          inCell += 1;
          if (skin[sy * sw + sx]) skinInCell += 1;
        }
      }
      if (inCell > 0 && skinInCell / inCell >= CELL_SKIN_DENSITY) dense[cy * cw + cx] = 1;
    }
  }

  const seen = new Uint8Array(cw * ch);
  let best = null;
  for (let start = 0; start < dense.length; start += 1) {
    if (!dense[start] || seen[start]) continue;
    const stack = [start];
    seen[start] = 1;
    let count = 0;
    let minX = cw;
    let maxX = -1;
    let minY = ch;
    let maxY = -1;
    while (stack.length) {
      const cell = stack.pop();
      const cy = Math.floor(cell / cw);
      const cx = cell - cy * cw;
      count += 1;
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;
      const neighbours = [
        cx > 0 ? cell - 1 : -1,
        cx < cw - 1 ? cell + 1 : -1,
        cy > 0 ? cell - cw : -1,
        cy < ch - 1 ? cell + cw : -1,
      ];
      for (const next of neighbours) {
        if (next < 0 || seen[next] || !dense[next]) continue;
        seen[next] = 1;
        stack.push(next);
      }
    }
    if (!best || count > best.count) best = { count, minX, maxX, minY, maxY };
  }

  if (!best || best.count < MIN_FACE_CELLS) {
    return {
      error:
        "Could not find a face-sized block of skin tone. Move closer, keep the whole face in frame, and avoid strong coloured lighting.",
    };
  }

  // Face box in sample coordinates, then in image pixels.
  const faceSX = best.minX * CELL;
  const faceSY = best.minY * CELL;
  const faceSW = Math.min(sw, (best.maxX + 1) * CELL) - faceSX;
  const faceSH = Math.min(sh, (best.maxY + 1) * CELL) - faceSY;

  /* ---- per-region colour ---- */
  const regions = REGION_LAYOUT.map((layout) => {
    const x0 = faceSX + Math.floor(layout.x0 * faceSW);
    const x1 = faceSX + Math.ceil(layout.x1 * faceSW);
    const y0 = faceSY + Math.floor(layout.y0 * faceSH);
    const y1 = faceSY + Math.ceil(layout.y1 * faceSH);

    let n = 0;
    let sumA = 0;
    let sumL = 0;
    let sumB2 = 0;
    const values = [];
    for (let sy = Math.max(0, y0); sy < Math.min(sh, y1); sy += 1) {
      for (let sx = Math.max(0, x0); sx < Math.min(sw, x1); sx += 1) {
        const si = sy * sw + sx;
        if (!skin[si]) continue;
        n += 1;
        sumA += aStar[si];
        sumL += lStar[si];
        sumB2 += bStar[si];
        values.push(aStar[si]);
      }
    }

    const enough = n >= MIN_REGION_SAMPLES;
    return {
      id: layout.id,
      label: layout.label,
      box: {
        x: Math.round(x0 * step),
        y: Math.round(y0 * step),
        w: Math.round((x1 - x0) * step),
        h: Math.round((y1 - y0) * step),
      },
      samples: n,
      enough,
      aStar: enough ? sumA / n : null,
      lStar: enough ? sumL / n : null,
      bStar: enough ? sumB2 / n : null,
      values: enough ? values : [],
    };
  });

  const measured = regions.filter((region) => region.enough);
  if (measured.length < 2) {
    return {
      error:
        "Only one facial area had enough visible skin to measure, so there is nothing to compare it against. Face the camera straight on with hair off the forehead.",
    };
  }

  // Baseline = the calmest measured area in this same photo.
  const baselineRegion = measured.reduce((low, region) => (region.aStar < low.aStar ? region : low));
  const baseline = baselineRegion.aStar;

  const scored = regions.map((region) => {
    if (!region.enough) {
      return {
        id: region.id,
        label: region.label,
        box: region.box,
        samples: region.samples,
        enough: false,
        aStar: null,
        lStar: null,
        bStar: null,
        delta: null,
        severity: null,
        affectedShare: null,
      };
    }
    const delta = region.aStar - baseline;
    const hotCut = baseline + HOT_STEP;
    const hot = region.values.reduce((count, value) => (value >= hotCut ? count + 1 : count), 0);
    const band = severityFor(delta);
    return {
      id: region.id,
      label: region.label,
      box: region.box,
      samples: region.samples,
      enough: true,
      aStar: round2(region.aStar),
      lStar: round2(region.lStar),
      bStar: round2(region.bStar),
      delta: round2(delta),
      severity: { id: band.id, label: band.label, blurb: band.blurb },
      affectedShare: round1((hot / region.samples) * 100),
    };
  });

  const peak = scored
    .filter((region) => region.enough)
    .reduce((high, region) => (region.delta > high.delta ? region : high));

  /* ---- whole-face figures ---- */
  let faceN = 0;
  let faceA = 0;
  let faceL = 0;
  let faceB = 0;
  for (let sy = faceSY; sy < faceSY + faceSH; sy += 1) {
    for (let sx = faceSX; sx < faceSX + faceSW; sx += 1) {
      const si = sy * sw + sx;
      if (!skin[si]) continue;
      faceN += 1;
      faceA += aStar[si];
      faceL += lStar[si];
      faceB += bStar[si];
    }
  }

  /* ---- image quality, measured not guessed ---- */
  // Grey-world check on everything that is NOT skin, so warm skin does not read
  // as a colour cast. Needs a reasonable amount of background to mean anything.
  const castMeasurable = backgroundCount >= total * 0.05;
  let castIndex = null;
  if (castMeasurable) {
    const meanR = sumR / backgroundCount;
    const meanG = sumG / backgroundCount;
    const meanB = sumB / backgroundCount;
    const channelMax = Math.max(meanR, meanG, meanB);
    const channelMin = Math.min(meanR, meanG, meanB);
    castIndex = channelMin > 0 ? channelMax / channelMin : null;
  }

  const flags = [];
  if (castIndex !== null && castIndex >= CAST_WARN) {
    flags.push(
      `Everything outside the skin averages ${round2(castIndex)}:1 across the colour channels instead of roughly 1:1, which points to warm or coloured light. Redness read off a tinted photo is not comparable with another day's photo.`,
    );
  }
  if (!castMeasurable) {
    flags.push(
      "Almost the whole frame is skin, so there is no neutral background to check the white balance against.",
    );
  }
  if (clipped / total > 0.05) {
    flags.push(
      `${round1((clipped / total) * 100)}% of the frame is close to clipping. Blown highlights lose colour entirely and are excluded.`,
    );
  }
  if (dark / total > 0.35) {
    flags.push(
      `${round1((dark / total) * 100)}% of the frame is very dark, so the skin sample is coming from a small lit patch.`,
    );
  }
  if (skinCount / total < 0.08) {
    flags.push("Skin fills less than 8% of the frame. Move closer so the face carries the measurement.");
  }

  return {
    image: { width, height, sampleStep: step, samples: total },
    face: {
      x: Math.round(faceSX * step),
      y: Math.round(faceSY * step),
      w: Math.round(faceSW * step),
      h: Math.round(faceSH * step),
    },
    overall: {
      skinSamples: faceN,
      aStar: faceN ? round2(faceA / faceN) : null,
      lStar: faceN ? round2(faceL / faceN) : null,
      bStar: faceN ? round2(faceB / faceN) : null,
    },
    baseline: { regionId: baselineRegion.id, label: baselineRegion.label, aStar: round2(baseline) },
    peak: { regionId: peak.id, label: peak.label, delta: peak.delta, severity: peak.severity },
    regions: scored,
    quality: {
      skinSamples: skinCount,
      skinShare: round1((skinCount / total) * 100),
      clippedShare: round1((clipped / total) * 100),
      darkShare: round1((dark / total) * 100),
      castIndex: castIndex === null ? null : round2(castIndex),
      flags,
    },
    method: {
      colourSpace: "CIELAB (D65), converted from sRGB",
      metric: "a* — the green-to-red axis of CIELAB",
      comparison: `Δa* against the calmest measured area (${baselineRegion.label})`,
      affected: `share of a region's skin pixels at least ${HOT_STEP} a* units above that baseline`,
    },
  };
}

/** Copy-ready summary of a report. */
export function buildRednessSummary(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push(`Facial redness — CIELAB a* measurement`);
  lines.push(
    `Reddest area: ${result.peak.label}, Δa* ${result.peak.delta} (${result.peak.severity.label})`,
  );
  lines.push(`Baseline (calmest area): ${result.baseline.label}, a* ${result.baseline.aStar}`);
  lines.push(`Whole face: a* ${result.overall.aStar}, L* ${result.overall.lStar}`);
  lines.push("");
  lines.push("Region\ta*\tΔa*\tAffected\tSamples");
  for (const region of result.regions) {
    if (!region.enough) {
      lines.push(`${region.label}\t—\t—\t—\t${region.samples} (too few)`);
      continue;
    }
    lines.push(
      `${region.label}\t${region.aStar}\t${region.delta}\t${region.affectedShare}%\t${region.samples}`,
    );
  }
  lines.push("");
  lines.push(
    `Image quality: skin ${result.quality.skinShare}% of frame, clipped ${result.quality.clippedShare}%, dark ${result.quality.darkShare}%, colour cast ${result.quality.castIndex ?? "—"}:1`,
  );
  for (const flag of result.quality.flags) lines.push(`- ${flag}`);
  lines.push("");
  lines.push("Colour measurement only. Not a diagnosis and not a measure of blood flow.");
  return lines.join("\n");
}

/**
 * A synthetic demo frame so the page shows a real, computed result before any
 * photo is loaded. Everything is drawn from fixed arithmetic — no randomness —
 * and it is labelled as synthetic in the UI: it is a colour test card in the
 * shape of a face, not a person.
 */
export function buildSampleFrame({ width = 320, height = 400 } = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.34;
  const ry = height * 0.42;

  // Base skin, a warm mid tone.
  const BASE = { r: 214, g: 168, b: 148 };
  // Cheek and nose patches, redder by a fixed amount.
  const patches = [
    { x: cx - width * 0.19, y: cy + height * 0.02, r: width * 0.12, add: 26 },
    { x: cx + width * 0.19, y: cy + height * 0.02, r: width * 0.12, add: 22 },
    { x: cx, y: cy - height * 0.01, r: width * 0.07, add: 34 },
  ];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const inFace = nx * nx + ny * ny <= 1;
      if (!inFace) {
        // Neutral grey surround, deliberately outside the skin gate.
        data[i] = 118;
        data[i + 1] = 120;
        data[i + 2] = 122;
        data[i + 3] = 255;
        continue;
      }

      // Gentle vertical shading so the sample is not perfectly flat.
      const shade = 1 - 0.06 * ny;
      let r = BASE.r * shade;
      let g = BASE.g * shade;
      let b = BASE.b * shade;

      for (const patch of patches) {
        const dx = x - patch.x;
        const dy = y - patch.y;
        const d = Math.sqrt(dx * dx + dy * dy) / patch.r;
        if (d < 1) {
          const falloff = 1 - d * d;
          r += patch.add * falloff;
          g -= patch.add * 0.35 * falloff;
          b -= patch.add * 0.2 * falloff;
        }
      }

      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
      data[i + 3] = 255;
    }
  }

  return { data, width, height };
}
