/**
 * Calibrated Camera Ruler — pure logic.
 *
 * A photograph has no scale of its own. Put an object of known size in the
 * frame, measure how many image pixels it spans, and every other length in the
 * same plane can be converted from pixels to millimetres:
 *
 *     mmPerPixel = referenceMillimetres / referencePixels
 *     lengthMm   = objectPixels * mmPerPixel
 *
 * Two things spoil that: the marks you place are a few pixels off, and the
 * object may not sit in the same plane as the reference. Both are modelled
 * here explicitly rather than hidden — the first as an interval, the second by
 * the pinhole relation size ∝ 1/distance.
 *
 * No DOM, no network, no clock, no randomness.
 */

/**
 * Reference objects with published dimensions.
 * `mm` is the dimension named in `dimension`; sources are named so the number
 * can be checked rather than trusted.
 */
export const REFERENCE_OBJECTS = [
  {
    id: "id1-long",
    label: "Bank / ID card — long edge",
    mm: 85.6,
    dimension: "long edge",
    source: "ISO/IEC 7810 ID-1 (credit, debit, PAN, driving licence)",
  },
  {
    id: "id1-short",
    label: "Bank / ID card — short edge",
    mm: 53.98,
    dimension: "short edge",
    source: "ISO/IEC 7810 ID-1",
  },
  {
    id: "a4-long",
    label: "A4 sheet — long edge",
    mm: 297,
    dimension: "long edge",
    source: "ISO 216 A4 (210 × 297 mm)",
  },
  {
    id: "a4-short",
    label: "A4 sheet — short edge",
    mm: 210,
    dimension: "short edge",
    source: "ISO 216 A4",
  },
  {
    id: "a5-long",
    label: "A5 sheet — long edge",
    mm: 210,
    dimension: "long edge",
    source: "ISO 216 A5 (148 × 210 mm)",
  },
  {
    id: "letter-long",
    label: "US Letter sheet — long edge",
    mm: 279.4,
    dimension: "long edge",
    source: "ANSI A / US Letter (8.5 × 11 in)",
  },
  {
    id: "letter-short",
    label: "US Letter sheet — short edge",
    mm: 215.9,
    dimension: "short edge",
    source: "ANSI A / US Letter",
  },
  {
    id: "cd",
    label: "CD or DVD disc — diameter",
    mm: 120,
    dimension: "diameter",
    source: "Red Book / ECMA-130 compact disc",
  },
  {
    id: "aa",
    label: "AA battery — length",
    mm: 50.5,
    dimension: "length",
    source: "IEC R6 / ANSI 15A",
  },
  {
    id: "aaa",
    label: "AAA battery — length",
    mm: 44.5,
    dimension: "length",
    source: "IEC R03 / ANSI 24A",
  },
  {
    id: "inr10",
    label: "Indian ₹10 coin — diameter",
    mm: 27,
    dimension: "diameter",
    source: "Reserve Bank of India ₹10 bimetallic coin",
  },
  {
    id: "eur1",
    label: "1 euro coin — diameter",
    mm: 23.25,
    dimension: "diameter",
    source: "European Central Bank coin specification",
  },
  {
    id: "usd-quarter",
    label: "US quarter — diameter",
    mm: 24.26,
    dimension: "diameter",
    source: "United States Mint coin specification",
  },
  {
    id: "business-card",
    label: "US business card — long edge",
    mm: 88.9,
    dimension: "long edge",
    source: "3.5 × 2 in North American business card",
  },
  {
    id: "ruler-12in",
    label: "12-inch ruler — full length",
    mm: 304.8,
    dimension: "length",
    source: "12 international inches at 25.4 mm each",
  },
  {
    id: "golf-ball",
    label: "Golf ball — diameter",
    mm: 42.67,
    dimension: "minimum diameter",
    source: "R&A / USGA Rules of Golf minimum size",
  },
  {
    id: "brick-modular",
    label: "Modular brick — length",
    mm: 190,
    dimension: "length",
    source: "IS 1077 modular brick (190 × 90 × 90 mm)",
  },
  {
    id: "custom",
    label: "Something else — I will type the size",
    mm: null,
    dimension: "custom",
    source: "Measured by you with a rule or caliper",
  },
];

export const MM_PER_INCH = 25.4;
export const UNITS = {
  mm: { label: "Millimetres (mm)", perMm: 1, digits: 1 },
  cm: { label: "Centimetres (cm)", perMm: 0.1, digits: 2 },
  m: { label: "Metres (m)", perMm: 0.001, digits: 3 },
  in: { label: "Inches (in)", perMm: 1 / MM_PER_INCH, digits: 2 },
  ft: { label: "Feet (ft)", perMm: 1 / (MM_PER_INCH * 12), digits: 3 },
};

/** Look up a reference object by id. */
export function findReference(id) {
  return REFERENCE_OBJECTS.find((item) => item.id === id) ?? null;
}

/** Euclidean distance in pixels between two {x, y} marks. */
export function pixelDistance(a, b) {
  if (!a || !b) return null;
  const dx = Number(a.x) - Number(b.x);
  const dy = Number(a.y) - Number(b.y);
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  return Math.hypot(dx, dy);
}

/**
 * Millimetres per image pixel, from a reference of known size.
 * Only valid for lengths lying in the same plane as the reference.
 */
export function computeScale({ referencePixels, referenceMm } = {}) {
  const px = Number(referencePixels);
  const mm = Number(referenceMm);
  if (!Number.isFinite(px) || px <= 0) {
    return { error: "The reference length in pixels must be a number above zero." };
  }
  if (!Number.isFinite(mm) || mm <= 0) {
    return { error: "The real size of the reference object must be a number above zero." };
  }
  return {
    mmPerPixel: mm / px,
    pixelsPerMm: px / mm,
    referencePixels: px,
    referenceMm: mm,
  };
}

/**
 * Depth correction under the pinhole model. An object twice as far from the
 * camera as the reference appears half as big, so its true size is the
 * naive reading multiplied by objectDistance / referenceDistance.
 * Distances may be in any single unit as long as both use the same one.
 */
export function depthRatio({ referenceDistance, objectDistance } = {}) {
  const ref = Number(referenceDistance);
  const obj = Number(objectDistance);
  if (!Number.isFinite(ref) || ref <= 0) {
    return { error: "Camera-to-reference distance must be a number above zero." };
  }
  if (!Number.isFinite(obj) || obj <= 0) {
    return { error: "Camera-to-object distance must be a number above zero." };
  }
  return { ratio: obj / ref, referenceDistance: ref, objectDistance: obj };
}

/**
 * Foreshortening correction. A flat surface tilted by `angleDeg` away from the
 * sensor plane images at cos(angle) of its true length along the tilt, so the
 * true length is the measured one divided by cos(angle).
 */
export function tiltCorrection(angleDeg) {
  const angle = Number(angleDeg);
  if (!Number.isFinite(angle)) return { error: "Tilt angle must be a number." };
  if (angle < 0 || angle > 80) {
    return { error: "Tilt correction only works between 0° and 80°; past that the error explodes." };
  }
  const factor = 1 / Math.cos((angle * Math.PI) / 180);
  return { angleDeg: angle, factor, shrinkPercent: (1 - Math.cos((angle * Math.PI) / 180)) * 100 };
}

/**
 * One measured length, with the interval that follows from mark placement error.
 *
 * Each end of a segment can be misplaced by up to `markErrorPx`, so a segment
 * of n pixels is really n ± 2·markErrorPx, and the same is true of the
 * reference. The widest and narrowest consistent answers are reported.
 */
export function measureLength({
  pixels,
  mmPerPixel,
  referencePixels,
  referenceMm,
  markErrorPx = 2,
  ratio = 1,
  tiltFactor = 1,
} = {}) {
  const px = Number(pixels);
  const scale = Number(mmPerPixel);
  if (!Number.isFinite(px) || px <= 0) {
    return { error: "Measured length in pixels must be a number above zero." };
  }
  if (!Number.isFinite(scale) || scale <= 0) {
    return { error: "The scale is not usable — check the reference measurement." };
  }
  const depth = Number(ratio);
  const tilt = Number(tiltFactor);
  if (!Number.isFinite(depth) || depth <= 0) return { error: "Depth ratio must be above zero." };
  if (!Number.isFinite(tilt) || tilt <= 0) return { error: "Tilt factor must be above zero." };

  const correction = depth * tilt;
  const mm = px * scale * correction;

  const err = Number(markErrorPx);
  const refPx = Number(referencePixels);
  const refMm = Number(referenceMm);
  let low = null;
  let high = null;
  if (Number.isFinite(err) && err >= 0 && Number.isFinite(refPx) && Number.isFinite(refMm)) {
    const slackObjLow = Math.max(px - 2 * err, 0);
    const slackObjHigh = px + 2 * err;
    const slackRefLow = refPx - 2 * err;
    const slackRefHigh = refPx + 2 * err;
    if (slackRefLow > 0) {
      low = (slackObjLow * refMm * correction) / slackRefHigh;
      high = (slackObjHigh * refMm * correction) / slackRefLow;
    }
  }

  return {
    pixels: px,
    mm,
    low,
    high,
    spreadPercent: low !== null && high !== null && mm > 0 ? ((high - low) / mm) * 100 : null,
    correction,
  };
}

/** Convert millimetres into one of the supported units. */
export function convert(mm, unit) {
  const value = Number(mm);
  const meta = UNITS[unit];
  if (!meta) return { error: `Unknown unit "${unit}".` };
  if (!Number.isFinite(value)) return { error: "Nothing to convert yet." };
  return { value: value * meta.perMm, unit, digits: meta.digits };
}

/** Format millimetres for display in the chosen unit. */
export function formatLength(mm, unit = "mm") {
  const out = convert(mm, unit);
  if (out.error) return "—";
  return `${out.value.toFixed(out.digits)} ${unit}`;
}

/** Every unit at once, for the conversion strip. */
export function allUnits(mm) {
  const value = Number(mm);
  if (!Number.isFinite(value)) return [];
  return Object.entries(UNITS).map(([key, meta]) => ({
    unit: key,
    label: meta.label,
    value: value * meta.perMm,
    text: `${(value * meta.perMm).toFixed(meta.digits)} ${key}`,
  }));
}

/**
 * Full measurement pass: scale from the reference, then convert each named
 * segment, and derive area when both a width and a height are present.
 */
export function measureScene({
  referencePixels,
  referenceMm,
  widthPixels,
  heightPixels,
  markErrorPx = 2,
  referenceDistance = null,
  objectDistance = null,
  tiltDegrees = 0,
} = {}) {
  const scale = computeScale({ referencePixels, referenceMm });
  if (scale.error) return { error: scale.error };

  const slip = Number(markErrorPx);
  if (!Number.isFinite(slip) || slip < 0) {
    return { error: "Mark placement error must be zero or a positive number of pixels." };
  }
  if (scale.referencePixels <= 2 * slip) {
    return {
      error: `The reference spans only ${scale.referencePixels} px, which is no bigger than the ±${slip} px slip you allowed at each end. Zoom in on the reference or lower the mark error before trusting any reading.`,
    };
  }

  let ratio = 1;
  let depth = null;
  if (referenceDistance !== null && referenceDistance !== "" && objectDistance !== null && objectDistance !== "") {
    depth = depthRatio({ referenceDistance, objectDistance });
    if (depth.error) return { error: depth.error };
    ratio = depth.ratio;
  }

  const tilt = tiltCorrection(tiltDegrees);
  if (tilt.error) return { error: tilt.error };

  const shared = {
    mmPerPixel: scale.mmPerPixel,
    referencePixels: scale.referencePixels,
    referenceMm: scale.referenceMm,
    markErrorPx,
    ratio,
    tiltFactor: tilt.factor,
  };

  const width = measureLength({ pixels: widthPixels, ...shared });
  const heightGiven = heightPixels !== null && heightPixels !== "" && Number(heightPixels) > 0;
  const height = heightGiven ? measureLength({ pixels: heightPixels, ...shared }) : null;

  if (width.error) return { error: width.error };
  if (height && height.error) return { error: height.error };

  const area =
    height && !height.error
      ? {
          mm2: width.mm * height.mm,
          cm2: (width.mm * height.mm) / 100,
          in2: (width.mm / MM_PER_INCH) * (height.mm / MM_PER_INCH),
        }
      : null;

  return {
    mmPerPixel: scale.mmPerPixel,
    pixelsPerMm: scale.pixelsPerMm,
    referencePixels: scale.referencePixels,
    referenceMm: scale.referenceMm,
    depth,
    ratio,
    tilt,
    width,
    height,
    area,
    markErrorPx: slip,
    diagonal: height && !height.error ? Math.hypot(width.mm, height.mm) : null,
    referenceRelativeErrorPercent: ((2 * slip) / scale.referencePixels) * 100,
  };
}

/**
 * Plain-language notes about how far this reading can be trusted. Each note is
 * derived from the numbers above, not from a stored opinion.
 */
export function accuracyNotes(result) {
  if (!result || result.error) return [];
  const notes = [];
  const refPx = result.referencePixels;
  const slip = Number.isFinite(result.markErrorPx) ? result.markErrorPx : 2;
  if (refPx < 100) {
    notes.push({
      level: "warn",
      text: `The reference spans only ${Math.round(refPx)} px. A ±${slip} px slip at each end is ${(
        ((2 * slip) / refPx) *
        100
      ).toFixed(1)}% of the reference on its own — move the camera closer or fill more of the frame with the reference.`,
    });
  } else if (refPx > 400) {
    notes.push({
      level: "ok",
      text: `The reference spans ${Math.round(refPx)} px, so mark-placement slip contributes well under a percent of the scale.`,
    });
  }

  if (result.width && result.width.pixels > result.referencePixels * 6) {
    notes.push({
      level: "warn",
      text: "The object is more than six times the reference in pixels, so any error in the reference is magnified six times in the answer. Use a larger reference where you can.",
    });
  }

  if (result.ratio !== 1) {
    notes.push({
      level: "info",
      text: `Depth correction is active: the object is ${result.ratio.toFixed(
        2,
      )}× as far from the camera as the reference, so the raw reading was scaled by that factor.`,
    });
  } else {
    notes.push({
      level: "info",
      text: "No depth correction is applied, so this assumes the object and the reference sit in the same plane, the same distance from the lens.",
    });
  }

  if (result.tilt && result.tilt.angleDeg > 0) {
    notes.push({
      level: "info",
      text: `A ${result.tilt.angleDeg}° tilt shortens the image by ${result.tilt.shrinkPercent.toFixed(
        1,
      )}%, and that has been divided back out.`,
    });
  }

  notes.push({
    level: "info",
    text: "Lens distortion is not modelled. Keep the object near the middle of the frame, where barrel distortion is smallest, and avoid ultra-wide lenses.",
  });

  return notes;
}

/**
 * Convert a click on a displayed image into image-pixel coordinates.
 * `displayed` and `natural` are {width, height} of the rendered element and the
 * source image; `offset` is the click position inside the rendered element.
 */
export function toImagePoint({ offsetX, offsetY, displayedWidth, displayedHeight, naturalWidth, naturalHeight }) {
  const dw = Number(displayedWidth);
  const dh = Number(displayedHeight);
  const nw = Number(naturalWidth);
  const nh = Number(naturalHeight);
  if (![dw, dh, nw, nh].every((v) => Number.isFinite(v) && v > 0)) {
    return { error: "The image has no measurable size yet." };
  }
  return {
    x: (Number(offsetX) / dw) * nw,
    y: (Number(offsetY) / dh) * nh,
  };
}
