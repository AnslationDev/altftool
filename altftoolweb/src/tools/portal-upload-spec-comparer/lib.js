/**
 * Portal upload spec comparer.
 *
 * Specs below are the photo/signature upload rules as published in the
 * portals' own application instructions (values as commonly published up to
 * 2025 — always re-check the current notification before applying):
 *  - UPSC One Time Registration / exam applications: photo and signature each
 *    JPG, 20 KB to 300 KB.
 *  - SSC (mySSC One Time Registration portal): photo JPEG/JPG 20-50 KB
 *    (3.5 cm x 4.5 cm), signature JPEG/JPG 10-20 KB.
 *  - IBPS (common recruitment): photo 20-50 KB at 200x230 px, signature
 *    10-20 KB at 140x60 px, both JPG/JPEG.
 *  - NTA NEET: photo JPG 10-200 KB, signature JPG 4-30 KB.
 *  - NTA JEE Main: photo JPG 10-200 KB, signature JPG 4-30 KB.
 *
 * The comparison itself is interval intersection: a single file satisfies all
 * selected portals iff its format is accepted by every portal and its size
 * lies in [max(minKB), min(maxKB)].
 */

export const DOC_TYPES = [
  { id: "photo", label: "Photograph" },
  { id: "signature", label: "Signature" },
];

export const PORTAL_SPECS = [
  { id: "upsc-photo", portal: "UPSC (OTR)", doc: "photo", formats: ["jpg", "jpeg"], minKB: 20, maxKB: 300, px: null, note: "Recent photo, name and date printed on it per latest notices" },
  { id: "upsc-sign", portal: "UPSC (OTR)", doc: "signature", formats: ["jpg", "jpeg"], minKB: 20, maxKB: 300, px: null, note: "" },
  { id: "ssc-photo", portal: "SSC (mySSC OTR)", doc: "photo", formats: ["jpg", "jpeg"], minKB: 20, maxKB: 50, px: null, note: "3.5 cm x 4.5 cm, recent (within 3 months)" },
  { id: "ssc-sign", portal: "SSC (mySSC OTR)", doc: "signature", formats: ["jpg", "jpeg"], minKB: 10, maxKB: 20, px: null, note: "" },
  { id: "ibps-photo", portal: "IBPS", doc: "photo", formats: ["jpg", "jpeg"], minKB: 20, maxKB: 50, px: { width: 200, height: 230 }, note: "200 x 230 px" },
  { id: "ibps-sign", portal: "IBPS", doc: "signature", formats: ["jpg", "jpeg"], minKB: 10, maxKB: 20, px: { width: 140, height: 60 }, note: "140 x 60 px" },
  { id: "neet-photo", portal: "NTA NEET", doc: "photo", formats: ["jpg", "jpeg"], minKB: 10, maxKB: 200, px: null, note: "Passport-size; postcard photo asked separately" },
  { id: "neet-sign", portal: "NTA NEET", doc: "signature", formats: ["jpg", "jpeg"], minKB: 4, maxKB: 30, px: null, note: "" },
  { id: "jee-photo", portal: "NTA JEE Main", doc: "photo", formats: ["jpg", "jpeg"], minKB: 10, maxKB: 200, px: null, note: "" },
  { id: "jee-sign", portal: "NTA JEE Main", doc: "signature", formats: ["jpg", "jpeg"], minKB: 4, maxKB: 30, px: null, note: "" },
];

export function specsForDoc(docType) {
  return PORTAL_SPECS.filter((spec) => spec.doc === docType);
}

/**
 * Intersect the selected specs.
 * @param {object} input
 * @param {string[]} input.specIds  Ids from PORTAL_SPECS (at least 2 to compare).
 * @returns {object} { specs, commonFormats, minKB, maxKB, compatible, pxRequirements, tightest } or { error }
 */
export function compareSpecs({ specIds }) {
  if (!Array.isArray(specIds) || specIds.length === 0) {
    return { error: "Select at least one portal to compare." };
  }
  const specs = specIds.map((id) => PORTAL_SPECS.find((spec) => spec.id === id)).filter(Boolean);
  if (specs.length !== specIds.length) {
    return { error: "An unknown portal was selected — reset and try again." };
  }
  const docs = new Set(specs.map((spec) => spec.doc));
  if (docs.size > 1) {
    return { error: "Compare photographs with photographs and signatures with signatures — they have different rules." };
  }

  // Format intersection.
  let commonFormats = [...specs[0].formats];
  for (const spec of specs) {
    commonFormats = commonFormats.filter((format) => spec.formats.includes(format));
  }

  // Size-interval intersection: [max of mins, min of maxes].
  const minKB = Math.max(...specs.map((spec) => spec.minKB));
  const maxKB = Math.min(...specs.map((spec) => spec.maxKB));

  // Fixed-pixel requirements; two different fixed sizes cannot be met by one file.
  const pxRequirements = specs
    .filter((spec) => spec.px)
    .map((spec) => ({ portal: spec.portal, ...spec.px }));
  const distinctPx = new Set(pxRequirements.map((px) => `${px.width}x${px.height}`));

  const sizeCompatible = minKB <= maxKB;
  const formatCompatible = commonFormats.length > 0;
  const pxCompatible = distinctPx.size <= 1;
  const compatible = sizeCompatible && formatCompatible && pxCompatible;

  const tightest = specs.reduce((tight, spec) =>
    spec.maxKB - spec.minKB < tight.maxKB - tight.minKB ? spec : tight,
  );

  return {
    specs,
    doc: specs[0].doc,
    commonFormats,
    minKB: sizeCompatible ? minKB : null,
    maxKB: sizeCompatible ? maxKB : null,
    sizeCompatible,
    formatCompatible,
    pxCompatible,
    pxRequirements,
    compatible,
    tightest: { portal: tightest.portal, minKB: tightest.minKB, maxKB: tightest.maxKB },
  };
}

/**
 * Check one file's size against every selected spec.
 * @param {object} input
 * @param {number} input.sizeKB
 * @param {string[]} input.specIds
 * @returns {object} { results, passCount, failCount } or { error }
 */
export function checkFileAgainstSpecs({ sizeKB, specIds }) {
  const size = Number(sizeKB);
  if (!Number.isFinite(size) || size <= 0) {
    return { error: "Enter your file's size in KB as a positive number." };
  }
  if (!Array.isArray(specIds) || specIds.length === 0) {
    return { error: "Select at least one portal to check against." };
  }
  const specs = specIds.map((id) => PORTAL_SPECS.find((spec) => spec.id === id)).filter(Boolean);
  if (specs.length !== specIds.length) {
    return { error: "An unknown portal was selected — reset and try again." };
  }
  const results = specs.map((spec) => {
    let pass = true;
    let reason = "Fits";
    if (size < spec.minKB) {
      pass = false;
      reason = `Too small — needs at least ${spec.minKB} KB`;
    } else if (size > spec.maxKB) {
      pass = false;
      reason = `Too large — must not exceed ${spec.maxKB} KB`;
    }
    return { portal: spec.portal, doc: spec.doc, pass, reason, minKB: spec.minKB, maxKB: spec.maxKB };
  });
  return {
    results,
    passCount: results.filter((entry) => entry.pass).length,
    failCount: results.filter((entry) => !entry.pass).length,
  };
}
