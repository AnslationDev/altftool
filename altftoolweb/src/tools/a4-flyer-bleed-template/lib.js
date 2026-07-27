/**
 * Flyer artboard maths — trim, bleed, safe area, pixel size and fold panels.
 * Pure module: no DOM, no React, no clock.
 */

/** ISO 216 A-series trim sizes in millimetres (portrait: width x height).
 *  DL is the common 1/3-of-A4 flyer, 99 x 210 mm, matching a DL envelope. */
export const PAPER_SIZES = {
  a3: { id: "a3", label: "A3 (297 × 420 mm)", width: 297, height: 420 },
  a4: { id: "a4", label: "A4 (210 × 297 mm)", width: 210, height: 297 },
  a5: { id: "a5", label: "A5 (148 × 210 mm)", width: 148, height: 210 },
  a6: { id: "a6", label: "A6 (105 × 148 mm)", width: 105, height: 148 },
  dl: { id: "dl", label: "DL (99 × 210 mm)", width: 99, height: 210 },
};

/** 1 inch = 25.4 mm, by definition of the international inch. */
export const MM_PER_INCH = 25.4;

/** 3 mm each side is the standard commercial bleed for ISO paper sizes in
 *  Europe and India; US presses commonly specify 0.125 in ≈ 3.175 mm. */
export const DEFAULT_BLEED_MM = 3;

/** Keep type and logos at least 5 mm inside the trim so guillotine drift does
 *  not clip them. Many printers state 3-5 mm; 5 mm is the safer default. */
export const DEFAULT_SAFE_MM = 5;

export const MAX_BLEED_MM = 10;
export const MAX_SAFE_MM = 30;
export const MIN_DPI = 72;
export const MAX_DPI = 1200;

/** 300 ppi at final size is the usual minimum for offset and good digital print. */
export const PRINT_DPI = 300;

/**
 * A roll (letter) fold needs the innermost panel narrower so it tucks inside
 * without buckling. 2 mm is the common allowance for 130-170 gsm stock.
 */
export const TUCK_MM = 2;

export const FOLD_TYPES = {
  none: { id: "none", label: "No fold (single sheet)", panels: 1 },
  half: { id: "half", label: "Half fold (2 panels)", panels: 2 },
  roll: { id: "roll", label: "Roll / letter tri-fold (3 panels)", panels: 3 },
  zfold: { id: "zfold", label: "Z / accordion fold (3 panels)", panels: 3 },
  gate: { id: "gate", label: "Gate fold (2 flaps + centre)", panels: 3 },
};

const round2 = (n) => Math.round(n * 100) / 100;

/** Millimetres to pixels at a given resolution. */
export function mmToPx(mm, dpi) {
  const value = Number(mm);
  const res = Number(dpi);
  if (!Number.isFinite(value) || !Number.isFinite(res) || res <= 0 || value < 0) return 0;
  return (value / MM_PER_INCH) * res;
}

/** Pixels back to millimetres at a given resolution. */
export function pxToMm(px, dpi) {
  const value = Number(px);
  const res = Number(dpi);
  if (!Number.isFinite(value) || !Number.isFinite(res) || res <= 0 || value < 0) return 0;
  return (value / res) * MM_PER_INCH;
}

/**
 * Panel widths along the folded axis, left to right.
 * Returns { panels: number[], folds: number[] } where folds are cumulative
 * distances from the start of the axis.
 */
export function computeFoldPanels(axisLength, foldId) {
  const length = Number(axisLength);
  if (!Number.isFinite(length) || length <= 0) return { panels: [], folds: [] };

  let panels;
  switch (foldId) {
    case "half":
      panels = [length / 2, length / 2];
      break;
    case "roll": {
      // Innermost panel loses the tuck allowance; the two outer panels share it.
      const base = length / 3;
      const inner = base - TUCK_MM;
      const outer = (length - inner) / 2;
      panels = [inner, outer, outer];
      break;
    }
    case "zfold":
      // Accordion panels alternate direction, so no tuck allowance is needed.
      panels = [length / 3, length / 3, length / 3];
      break;
    case "gate": {
      const flap = length / 4 - TUCK_MM / 2;
      panels = [flap, length - 2 * flap, flap];
      break;
    }
    default:
      return { panels: [length], folds: [] };
  }

  const folds = [];
  let cursor = 0;
  for (let i = 0; i < panels.length - 1; i += 1) {
    cursor += panels[i];
    folds.push(round2(cursor));
  }
  return { panels: panels.map(round2), folds };
}

/**
 * Full artboard specification for a flyer.
 */
export function computeFlyerTemplate({
  sizeId = "a4",
  orientation = "portrait",
  bleedMm = DEFAULT_BLEED_MM,
  safeMm = DEFAULT_SAFE_MM,
  dpi = PRINT_DPI,
  foldId = "none",
  foldAxis = "width",
} = {}) {
  const paper = PAPER_SIZES[sizeId];
  if (!paper) return { error: "Choose one of the listed paper sizes." };

  const bleed = Number(bleedMm);
  const safe = Number(safeMm);
  const res = Number(dpi);

  if (![bleed, safe, res].every(Number.isFinite)) {
    return { error: "Enter valid numbers for bleed, safe margin and resolution." };
  }
  if (bleed < 0 || bleed > MAX_BLEED_MM) {
    return { error: `Bleed should be between 0 and ${MAX_BLEED_MM} mm per edge.` };
  }
  if (safe < 0 || safe > MAX_SAFE_MM) {
    return { error: `Safe margin should be between 0 and ${MAX_SAFE_MM} mm per edge.` };
  }
  if (res < MIN_DPI || res > MAX_DPI) {
    return { error: `Resolution should be between ${MIN_DPI} and ${MAX_DPI} ppi.` };
  }

  const landscape = orientation === "landscape";
  const trimW = landscape ? paper.height : paper.width;
  const trimH = landscape ? paper.width : paper.height;

  if (safe * 2 >= Math.min(trimW, trimH)) {
    return { error: "The safe margin leaves no live area on this size. Reduce it." };
  }

  const bleedW = trimW + bleed * 2;
  const bleedH = trimH + bleed * 2;
  const safeW = trimW - safe * 2;
  const safeH = trimH - safe * 2;

  const axisLength = foldAxis === "height" ? trimH : trimW;
  const fold = FOLD_TYPES[foldId] ? foldId : "none";
  const { panels, folds } = computeFoldPanels(axisLength, fold);

  const pxW = Math.round(mmToPx(bleedW, res));
  const pxH = Math.round(mmToPx(bleedH, res));
  const trimPxW = Math.round(mmToPx(trimW, res));
  const trimPxH = Math.round(mmToPx(trimH, res));

  return {
    paperLabel: paper.label,
    orientation: landscape ? "landscape" : "portrait",
    trimW: round2(trimW),
    trimH: round2(trimH),
    bleed: round2(bleed),
    safe: round2(safe),
    bleedW: round2(bleedW),
    bleedH: round2(bleedH),
    safeW: round2(safeW),
    safeH: round2(safeH),
    dpi: res,
    pxW,
    pxH,
    trimPxW,
    trimPxH,
    megapixels: round2((pxW * pxH) / 1_000_000),
    foldId: fold,
    foldLabel: FOLD_TYPES[fold].label,
    foldAxis: foldAxis === "height" ? "height" : "width",
    panels,
    folds,
    tuckApplied: fold === "roll" || fold === "gate" ? TUCK_MM : 0,
    lowRes: res < PRINT_DPI,
  };
}

const svgLine = (x1, y1, x2, y2, stroke, dash) =>
  `<line x1="${round2(x1)}" y1="${round2(y1)}" x2="${round2(x2)}" y2="${round2(y2)}" stroke="${stroke}" stroke-width="0.25"${dash ? ` stroke-dasharray="${dash}"` : ""} />`;

/**
 * Build a print-ready guide artboard as an SVG string, sized in millimetres.
 * Guides use CSS colour keywords so the file opens correctly everywhere.
 */
export function buildTemplateSvg(spec) {
  if (!spec || spec.error) return "";
  const { bleed, trimW, trimH, bleedW, bleedH, safe, panels, foldAxis } = spec;
  const parts = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${bleedW}mm" height="${bleedH}mm" viewBox="0 0 ${bleedW} ${bleedH}">`,
  );
  parts.push(`<rect x="0" y="0" width="${bleedW}" height="${bleedH}" fill="white" />`);

  // Bleed edge (the full artboard) in magenta.
  parts.push(
    `<rect x="0" y="0" width="${bleedW}" height="${bleedH}" fill="none" stroke="magenta" stroke-width="0.25" />`,
  );
  // Trim line.
  parts.push(
    `<rect x="${bleed}" y="${bleed}" width="${trimW}" height="${trimH}" fill="none" stroke="black" stroke-width="0.25" stroke-dasharray="2 1.5" />`,
  );
  // Safe / live area.
  if (safe > 0) {
    parts.push(
      `<rect x="${round2(bleed + safe)}" y="${round2(bleed + safe)}" width="${round2(trimW - safe * 2)}" height="${round2(trimH - safe * 2)}" fill="none" stroke="cyan" stroke-width="0.25" stroke-dasharray="1 1" />`,
    );
  }

  // Crop marks drawn inside the bleed margin at each trim corner.
  if (bleed > 0) {
    const left = bleed;
    const right = bleed + trimW;
    const top = bleed;
    const bottom = bleed + trimH;
    parts.push(svgLine(0, top, left, top, "black"));
    parts.push(svgLine(left, 0, left, top, "black"));
    parts.push(svgLine(right, 0, right, top, "black"));
    parts.push(svgLine(right, top, bleedW, top, "black"));
    parts.push(svgLine(0, bottom, left, bottom, "black"));
    parts.push(svgLine(left, bottom, left, bleedH, "black"));
    parts.push(svgLine(right, bottom, bleedW, bottom, "black"));
    parts.push(svgLine(right, bottom, right, bleedH, "black"));
  }

  // Fold lines.
  if (panels.length > 1) {
    let cursor = 0;
    for (let i = 0; i < panels.length - 1; i += 1) {
      cursor += panels[i];
      if (foldAxis === "height") {
        const y = bleed + cursor;
        parts.push(svgLine(0, y, bleedW, y, "orange", "3 2"));
      } else {
        const x = bleed + cursor;
        parts.push(svgLine(x, 0, x, bleedH, "orange", "3 2"));
      }
    }
  }

  parts.push("</svg>");
  return parts.join("\n");
}

/** Human-readable summary for the copy button. */
export function formatSpecText(spec) {
  if (!spec || spec.error) return "";
  const lines = [
    `${spec.paperLabel} — ${spec.orientation}`,
    `Trim: ${spec.trimW} × ${spec.trimH} mm`,
    `Bleed box (artboard): ${spec.bleedW} × ${spec.bleedH} mm (${spec.bleed} mm bleed per edge)`,
    `Safe / live area: ${spec.safeW} × ${spec.safeH} mm (${spec.safe} mm margin)`,
    `Pixel canvas at ${spec.dpi} ppi: ${spec.pxW} × ${spec.pxH} px (${spec.megapixels} MP)`,
    `Trim area in pixels: ${spec.trimPxW} × ${spec.trimPxH} px`,
    `Fold: ${spec.foldLabel}`,
  ];
  if (spec.panels.length > 1) {
    lines.push(`Panels along the ${spec.foldAxis}: ${spec.panels.join(" | ")} mm`);
    lines.push(`Fold positions from the edge: ${spec.folds.join(" mm, ")} mm`);
    if (spec.tuckApplied) lines.push(`Tuck allowance applied: ${spec.tuckApplied} mm`);
  }
  return lines.join("\n");
}
