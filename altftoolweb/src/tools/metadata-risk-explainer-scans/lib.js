/**
 * Scanned Document Metadata Explainer — logic module.
 *
 * Pure data + arithmetic. No React, no DOM, no clock reads.
 *
 * A scanned PDF carries far more than the picture of the page. This catalogue
 * classifies each hidden signal by the PDF structure that holds it, so the tool
 * can say exactly which clean-up step removes it and which one does not.
 */

/** Severity ladder: 1 / 3 / 6 so one "high" outranks two "medium". */
export const SEVERITY_WEIGHT = Object.freeze({ low: 1, medium: 3, high: 6 });

export const SEVERITY_LABEL = Object.freeze({ low: "Low", medium: "Medium", high: "High" });

/**
 * Where a signal lives inside the file.
 *  - "docinfo"   → the PDF /Info dictionary and the XMP packet.
 *  - "textlayer" → the invisible OCR text drawn under the page image
 *                  (text render mode 3) plus anything else in the content stream.
 *  - "revisions" → objects kept by incremental saves, embedded attachments and
 *                  signature dictionaries — data no longer displayed but still present.
 *  - "pixels"    → visible in the scanned image itself.
 */
export const CARRIERS = Object.freeze(["docinfo", "textlayer", "revisions", "pixels"]);

/**
 * Clean-up methods and what each one actually removes.
 * Pixels are never removed by any of these — only cropping or covering does that.
 */
export const METHODS = Object.freeze([
  {
    id: "as-is",
    label: "Send the scanner's PDF as-is",
    removesDocInfo: false,
    removesTextLayer: false,
    removesRevisions: false,
    note: "Everything the multifunction printer wrote stays in the file, including its model and the account that ran the job.",
  },
  {
    id: "strip",
    label: "Strip metadata (ExifTool -all= / 'remove document properties')",
    removesDocInfo: true,
    removesTextLayer: false,
    removesRevisions: false,
    note: "Clears /Info and XMP. The OCR text layer and any earlier saved revisions are untouched.",
  },
  {
    id: "print-to-pdf",
    label: "Re-print to a new PDF (Print > Save as PDF)",
    removesDocInfo: true,
    removesTextLayer: false,
    removesRevisions: true,
    note: "Rebuilds the file, so old properties and incremental-save history go, but selectable text is redrawn into the new file.",
  },
  {
    id: "flatten",
    label: "Flatten every page to an image",
    removesDocInfo: true,
    removesTextLayer: true,
    removesRevisions: true,
    note: "Rasterising discards the text layer and all hidden objects. The document stops being searchable and accessible to screen readers.",
  },
  {
    id: "print-rescan",
    label: "Print on paper and scan the paper again",
    removesDocInfo: true,
    removesTextLayer: true,
    removesRevisions: true,
    note: "Removes every digital trace, but writes fresh scanner properties and can add your colour printer's tracking dots.",
  },
]);

export const CATALOGUE = Object.freeze([
  {
    id: "producer-creator",
    group: "Document properties",
    carrier: "docinfo",
    severity: "medium",
    label: "Producer and Creator fields",
    reveals:
      "Scan-to-PDF firmware writes its own name here — strings like 'Canon iR-ADV C5535' or 'HP Digital Sending Device' identify the exact machine model in your office.",
    fix: "Clear document properties, or re-print the file to a fresh PDF.",
  },
  {
    id: "pdf-dates",
    group: "Document properties",
    carrier: "docinfo",
    severity: "medium",
    label: "CreationDate and ModDate",
    reveals:
      "PDF dates are stored to the second with a UTC offset (D:20260728140322+05'30'), which pins both the moment of scanning and your time zone.",
    fix: "Strip metadata before sending; a re-printed copy gets a new, uninformative date.",
  },
  {
    id: "xmp-ids",
    group: "Document properties",
    carrier: "docinfo",
    severity: "medium",
    label: "XMP DocumentID and InstanceID",
    reveals:
      "These identifiers persist across edits and derivations, so two files you sent to different recipients can be proved to come from the same original.",
    fix: "Remove the XMP packet along with the /Info dictionary.",
  },
  {
    id: "author-account",
    group: "Document properties",
    carrier: "docinfo",
    severity: "high",
    label: "Author field from the scan-to-email account",
    reveals:
      "Networked scanners often stamp the signed-in directory user, so the file names the employee, and sometimes the department, who walked up to the machine.",
    fix: "Clear the Author field explicitly — many strippers leave it if you only edit the title.",
  },
  {
    id: "job-settings",
    group: "Document properties",
    carrier: "docinfo",
    severity: "low",
    label: "Scan job settings",
    reveals:
      "Resolution, colour mode, duplex flag and paper size describe the device's configuration and help fingerprint the office it came from.",
    fix: "Low value on its own; removed with the rest of the properties.",
  },
  {
    id: "ocr-layer",
    group: "OCR and text",
    carrier: "textlayer",
    severity: "high",
    label: "Invisible OCR text under the page image",
    reveals:
      "Searchable scans draw recognised text in invisible render mode behind the picture, so every word — including anything you assumed was 'just an image' — can be selected, copied and indexed.",
    fix: "Flatten the pages to images if the text must not be extractable; accept the loss of search and screen-reader access.",
  },
  {
    id: "failed-redaction",
    group: "OCR and text",
    carrier: "textlayer",
    severity: "high",
    label: "Black boxes drawn over live text",
    reveals:
      "A filled rectangle or a highlight annotation only hides text visually. Copying the page, or removing the annotation, brings the original words straight back — the classic cause of leaked names in filed documents.",
    fix: "Use a real redaction function that deletes the underlying content, then verify by selecting the area and pasting it elsewhere.",
  },
  {
    id: "handwriting-ocr",
    group: "OCR and text",
    carrier: "textlayer",
    severity: "medium",
    label: "Recognised handwriting and signatures",
    reveals:
      "Modern OCR transcribes handwritten notes, initials and margin comments into the text layer, making informal annotations machine-searchable.",
    fix: "Review the extracted text, not just the picture, before you send the file.",
  },
  {
    id: "jbig2-substitution",
    group: "OCR and text",
    carrier: "textlayer",
    severity: "medium",
    label: "Aggressive compression that swaps characters",
    reveals:
      "JBIG2 pattern-matching reuses one glyph for visually similar ones. Xerox WorkCentre scanners were shown in 2013 to silently change digits in scanned floor plans and invoices, so figures in a compressed scan can be wrong.",
    fix: "Scan in a mode without pattern-matching compression when numbers matter, and check totals against the paper.",
  },
  {
    id: "incremental-history",
    group: "Hidden objects",
    carrier: "revisions",
    severity: "high",
    label: "Incremental save history",
    reveals:
      "PDF saves can append changes instead of rewriting the file, so earlier versions — including text you deleted and comments you removed — are still inside the bytes.",
    fix: "Save with 'full save' / linearise, or re-print the document to a new PDF.",
  },
  {
    id: "attachments-annotations",
    group: "Hidden objects",
    carrier: "revisions",
    severity: "medium",
    label: "Embedded attachments, comments and form data",
    reveals:
      "A PDF can carry whole files, sticky notes and filled form values that never appear when you page through it on screen.",
    fix: "Run the reader's 'examine document' / 'remove hidden information' check before sharing.",
  },
  {
    id: "signature-cert",
    group: "Hidden objects",
    carrier: "revisions",
    severity: "medium",
    label: "Digital signature certificate",
    reveals:
      "A signature dictionary carries the signer's legal name, email address, issuing authority and the signing timestamp, all readable without any special tooling.",
    fix: "Only sign the copy that genuinely needs a signature; send unsigned copies elsewhere.",
  },
  {
    id: "tracking-dots",
    group: "Visible on the page",
    carrier: "pixels",
    severity: "medium",
    label: "Printer tracking dots",
    reveals:
      "Most colour laser printers add a faint yellow dot grid — a Machine Identification Code encoding the printer serial number and the date and time of printing — which a high-resolution scan of that page reproduces.",
    fix: "Do not print sensitive documents on a colour laser you can be traced to, and prefer sharing the born-digital file.",
  },
  {
    id: "page-furniture",
    group: "Visible on the page",
    carrier: "pixels",
    severity: "medium",
    label: "Headers, footers, stamps and fax banners",
    reveals:
      "Received-fax lines, 'Confidential — prepared for <client>' footers, Bates numbers and desk stamps name the organisation, the matter and the copy number.",
    fix: "Crop or cover them, then flatten so the covering shape cannot be removed.",
  },
  {
    id: "bleed-through",
    group: "Visible on the page",
    carrier: "pixels",
    severity: "low",
    label: "Bleed-through from the reverse side",
    reveals:
      "Thin paper scanned at high contrast shows mirrored text from the back of the sheet, which is often legible once the image is inverted.",
    fix: "Place a dark sheet behind the page or lower the scanner contrast.",
  },
  {
    id: "platen-surroundings",
    group: "Visible on the page",
    carrier: "pixels",
    severity: "low",
    label: "Whatever else was on the glass",
    reveals:
      "Scanner edges capture the corner of the next document, a sticky note or a hand — small details that leak the context in which the scan was made.",
    fix: "Crop tightly to the page before exporting.",
  },
]);

export const RISK_BANDS = Object.freeze([
  { id: "none", label: "No hidden data left", min: 0, max: 0, advice: "Nothing you ticked survives this clean-up step. Check the page image itself for anything readable." },
  { id: "low", label: "Low exposure", min: 1, max: 24, advice: "Only minor fingerprinting data remains. Crop the page edges and send." },
  { id: "moderate", label: "Moderate exposure", min: 25, max: 49, advice: "The file still identifies the device or the job. Strip document properties before sending." },
  { id: "high", label: "High exposure", min: 50, max: 74, advice: "Recoverable text or hidden objects remain. Flatten or re-print before this leaves your network." },
  { id: "severe", label: "Severe exposure", min: 75, max: 100, advice: "Redacted or deleted content is still extractable. Rebuild the document from a clean source." },
]);

/** Sum of weights across the whole catalogue — the 100% reference point. */
export const MAX_WEIGHT = CATALOGUE.reduce(
  (total, item) => total + SEVERITY_WEIGHT[item.severity],
  0,
);

export function getMethod(methodId) {
  return METHODS.find((method) => method.id === methodId) || null;
}

/** Does this signal still exist in the file after the chosen clean-up step? */
export function survivesMethod(item, method) {
  if (!item || !method) return false;
  if (item.carrier === "pixels") return true;
  if (item.carrier === "docinfo") return !method.removesDocInfo;
  if (item.carrier === "textlayer") return !method.removesTextLayer;
  if (item.carrier === "revisions") return !method.removesRevisions;
  return true;
}

function bandFor(score) {
  return (
    RISK_BANDS.find((band) => score >= band.min && score <= band.max) ||
    RISK_BANDS[RISK_BANDS.length - 1]
  );
}

/**
 * Score what is left in a scanned PDF after a chosen clean-up step.
 *
 * score = 100 x (severity weight surviving) / (severity weight of the whole catalogue)
 *
 * @param {{ selectedIds?: string[], methodId?: string }} input
 * @returns {{ score:number, band:object, ... }|{ error:string }}
 */
export function assessScanRisk({ selectedIds = [], methodId = "as-is" } = {}) {
  if (!Array.isArray(selectedIds)) {
    return { error: "Selected signals must be a list of catalogue ids." };
  }
  const method = getMethod(methodId);
  if (!method) {
    return { error: "Choose one of the listed clean-up methods." };
  }

  const unique = Array.from(new Set(selectedIds.filter((id) => typeof id === "string")));
  const known = unique.map((id) => CATALOGUE.find((item) => item.id === id)).filter(Boolean);
  const unknownCount = unique.length - known.length;

  const surviving = [];
  const removed = [];
  known.forEach((item) => {
    if (survivesMethod(item, method)) surviving.push(item);
    else removed.push(item);
  });

  const survivingWeight = surviving.reduce(
    (total, item) => total + SEVERITY_WEIGHT[item.severity],
    0,
  );
  const selectedWeight = known.reduce(
    (total, item) => total + SEVERITY_WEIGHT[item.severity],
    0,
  );
  const score = MAX_WEIGHT > 0 ? Math.round((survivingWeight / MAX_WEIGHT) * 100) : 0;
  const removedShare =
    selectedWeight > 0
      ? Math.round(((selectedWeight - survivingWeight) / selectedWeight) * 100)
      : 0;

  const bySeverity = { high: 0, medium: 0, low: 0 };
  surviving.forEach((item) => {
    bySeverity[item.severity] += 1;
  });

  const actions = surviving
    .slice()
    .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
    .map((item) => ({ label: item.label, severity: item.severity, fix: item.fix }));

  return {
    score,
    band: bandFor(score),
    method,
    selectedCount: known.length,
    unknownCount,
    surviving,
    removed,
    survivingWeight,
    selectedWeight,
    maxWeight: MAX_WEIGHT,
    removedShare,
    bySeverity,
    actions,
    losesSearchability: method.removesTextLayer,
  };
}

/** Catalogue grouped for display, in declaration order. */
export function groupedCatalogue() {
  const groups = [];
  CATALOGUE.forEach((item) => {
    let group = groups.find((entry) => entry.name === item.group);
    if (!group) {
      group = { name: item.group, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  });
  return groups;
}
