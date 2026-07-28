/**
 * Page-layout maths for building a PDF from images and plain text.
 *
 * All page geometry is calculated in millimetres, which is the unit jsPDF uses
 * when a document is created with { unit: "mm" }.
 *
 * Sources for the constants:
 *  - A4 = 210 x 297 mm (ISO 216).
 *  - US Letter = 8.5 x 11 in = 215.9 x 279.4 mm (ANSI/ASME Y14.1, "ANSI A").
 *  - US Legal = 8.5 x 14 in = 215.9 x 355.6 mm.
 *  - 1 inch = 25.4 mm exactly (international inch, 1959).
 *  - 1 PostScript point = 1/72 inch, the unit PDF font sizes are expressed in.
 */

/** 1 inch in millimetres (international inch). */
export const MM_PER_INCH = 25.4;

/** PostScript points per inch — the PDF text-unit definition. */
export const POINTS_PER_INCH = 72;

/** Page sizes in millimetres, portrait (width x height). */
export const PAGE_SIZES = {
  a4: { label: "A4 (210 x 297 mm)", width: 210, height: 297 },
  letter: { label: "US Letter (8.5 x 11 in)", width: 215.9, height: 279.4 },
  legal: { label: "US Legal (8.5 x 14 in)", width: 215.9, height: 355.6 },
  a5: { label: "A5 (148 x 210 mm)", width: 148, height: 210 },
};

/** Smallest usable content strip; below this a margin has eaten the page. */
export const MIN_CONTENT_MM = 10;

/**
 * Typographic line spacing used for the text pages. 1.15 is the default
 * "single" line spacing of most word processors (Word 2007+ default).
 */
export const LINE_HEIGHT_FACTOR = 1.15;

/**
 * Average glyph advance width of Helvetica for mixed lower-case English text,
 * expressed as a fraction of the font size. Helvetica's per-character widths in
 * the standard Adobe AFM metrics average close to 0.5 em for ordinary prose, so
 * 0.5 is used to pick a safe wrap width before jsPDF renders the line.
 */
export const AVG_CHAR_WIDTH_EM = 0.5;

/** Fit modes for placing an image on a page. */
export const FIT_MODES = {
  contain: "Fit inside margins (keep whole image)",
  width: "Fill the page width",
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toFiniteNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

/** Convert points to millimetres. */
export function pointsToMm(points) {
  return (points / POINTS_PER_INCH) * MM_PER_INCH;
}

/**
 * Outer page dimensions in mm for a size key and orientation.
 * @returns {{width:number, height:number, label:string}|{error:string}}
 */
export function pageDimensions(sizeKey, orientation = "portrait") {
  const size = PAGE_SIZES[sizeKey];
  if (!size) return { error: "Pick a page size from the list." };
  if (orientation !== "portrait" && orientation !== "landscape") {
    return { error: "Orientation must be portrait or landscape." };
  }
  const isLandscape = orientation === "landscape";
  return {
    label: size.label,
    width: isLandscape ? size.height : size.width,
    height: isLandscape ? size.width : size.height,
  };
}

/**
 * Printable area left after margins are removed.
 * @returns {{width:number, height:number, pageWidth:number, pageHeight:number}|{error:string}}
 */
export function contentArea({ sizeKey, orientation = "portrait", marginMm }) {
  const page = pageDimensions(sizeKey, orientation);
  if (page.error) return page;

  const margin = toFiniteNumber(marginMm);
  if (margin === null) return { error: "Enter a margin in millimetres." };
  if (margin < 0) return { error: "Margin cannot be negative." };

  const width = page.width - margin * 2;
  const height = page.height - margin * 2;
  if (width < MIN_CONTENT_MM || height < MIN_CONTENT_MM) {
    return {
      error: `Margin of ${margin} mm leaves less than ${MIN_CONTENT_MM} mm of printable space on this page size.`,
    };
  }
  return {
    width: round(width),
    height: round(height),
    pageWidth: round(page.width),
    pageHeight: round(page.height),
    margin,
  };
}

/**
 * Work out where a pixel image should sit on the page.
 *
 * "contain" scales the image so the whole picture fits inside the margins and
 * centres it; "width" scales it to the full content width, anchored to the top,
 * and reports whether it overflows the page height.
 *
 * @returns {{x:number,y:number,width:number,height:number,scale:number,overflows:boolean,...}|{error:string}}
 */
export function fitImage({
  imageWidthPx,
  imageHeightPx,
  sizeKey = "a4",
  orientation = "portrait",
  marginMm = 10,
  mode = "contain",
}) {
  const area = contentArea({ sizeKey, orientation, marginMm });
  if (area.error) return area;

  const w = toFiniteNumber(imageWidthPx);
  const h = toFiniteNumber(imageHeightPx);
  if (w === null || h === null) return { error: "Image dimensions are missing." };
  if (w <= 0 || h <= 0) return { error: "Image width and height must be greater than zero." };
  if (!FIT_MODES[mode]) return { error: "Pick a valid fit mode." };

  const aspect = w / h;
  let drawWidth;
  let drawHeight;

  if (mode === "width") {
    drawWidth = area.width;
    drawHeight = drawWidth / aspect;
  } else {
    const scale = Math.min(area.width / w, area.height / h);
    drawWidth = w * scale;
    drawHeight = h * scale;
  }

  const x = area.margin + Math.max(0, (area.width - drawWidth) / 2);
  const y =
    mode === "width"
      ? area.margin
      : area.margin + Math.max(0, (area.height - drawHeight) / 2);

  return {
    x: round(x),
    y: round(y),
    width: round(drawWidth),
    height: round(drawHeight),
    aspectRatio: round(aspect, 4),
    // mm drawn per source pixel
    scale: round(drawWidth / w, 5),
    overflows: drawHeight > area.height + 0.001,
    contentWidth: area.width,
    contentHeight: area.height,
    pageWidth: area.pageWidth,
    pageHeight: area.pageHeight,
  };
}

/**
 * Greedy word wrap. Words longer than the limit are hard-split so nothing is
 * silently dropped. Blank lines in the source are preserved.
 */
export function wrapText(text, maxChars) {
  const limit = Math.max(1, Math.floor(maxChars));
  const out = [];
  const sourceLines = String(text ?? "").replace(/\r\n?/g, "\n").split("\n");

  for (const source of sourceLines) {
    const words = source.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      let piece = word;
      while (piece.length > limit) {
        if (line) {
          out.push(line);
          line = "";
        }
        out.push(piece.slice(0, limit));
        piece = piece.slice(limit);
      }
      if (!line) {
        line = piece;
      } else if (line.length + 1 + piece.length <= limit) {
        line = `${line} ${piece}`;
      } else {
        out.push(line);
        line = piece;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

/**
 * Lay plain text out over pages.
 *
 * charsPerLine  = content width / (fontSize * AVG_CHAR_WIDTH_EM converted to mm)
 * lineHeight mm = fontSize * LINE_HEIGHT_FACTOR converted to mm
 * linesPerPage  = floor(content height / lineHeight)
 *
 * @returns {{pages:string[][], lineCount:number, pageCount:number, ...}|{error:string}}
 */
export function textLayout({
  text,
  sizeKey = "a4",
  orientation = "portrait",
  marginMm = 15,
  fontSizePt = 11,
}) {
  const area = contentArea({ sizeKey, orientation, marginMm });
  if (area.error) return area;

  const fontSize = toFiniteNumber(fontSizePt);
  if (fontSize === null || fontSize <= 0) {
    return { error: "Font size must be greater than zero." };
  }

  const lineHeightMm = pointsToMm(fontSize * LINE_HEIGHT_FACTOR);
  const charWidthMm = pointsToMm(fontSize * AVG_CHAR_WIDTH_EM);
  const charsPerLine = Math.floor(area.width / charWidthMm);
  const linesPerPage = Math.floor(area.height / lineHeightMm);

  if (charsPerLine < 1 || linesPerPage < 1) {
    return { error: "Font size is too large for this page size and margin." };
  }

  const body = String(text ?? "");
  if (body.trim() === "") return { error: "Add some text to put in the PDF." };

  const lines = wrapText(body, charsPerLine);
  const pages = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  return {
    pages,
    pageCount: pages.length,
    lineCount: lines.length,
    charsPerLine,
    linesPerPage,
    lineHeightMm: round(lineHeightMm, 3),
    marginMm: area.margin,
    contentWidth: area.width,
    contentHeight: area.height,
    pageWidth: area.pageWidth,
    pageHeight: area.pageHeight,
    characterCount: body.length,
    wordCount: body.split(/\s+/).filter(Boolean).length,
  };
}

/** File extensions this tool can turn into PDF pages, by kind. */
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const SUPPORTED_TEXT_EXTENSIONS = [".txt", ".md", ".csv", ".log"];

/**
 * Classify a picked file so the UI knows which conversion path to use.
 * @returns {"image"|"text"|"unsupported"}
 */
export function classifyFile({ name = "", type = "" }) {
  if (SUPPORTED_IMAGE_TYPES.includes(type)) return "image";
  if (type.startsWith("text/")) return "text";
  const lower = String(name).toLowerCase();
  if (SUPPORTED_TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "text";
  return "unsupported";
}
