/**
 * Design File Metadata Explainer — logic module.
 *
 * Pure data + arithmetic. No React, no DOM, no clock reads.
 *
 * Design work leaks through the export, not the presentation. Layer names
 * become SVG ids, hidden layers become PDF optional content groups, and the
 * XMP packet on a raster export can list every document an asset was pasted
 * from. This catalogue ties each signal to the hand-off method that removes it.
 */

/** Severity ladder: 1 / 3 / 6 so one "high" outranks two "medium". */
export const SEVERITY_WEIGHT = Object.freeze({ low: 1, medium: 3, high: 6 });

export const SEVERITY_LABEL = Object.freeze({ low: "Low", medium: "Medium", high: "High" });

/**
 * Where the signal lives:
 *  - "layerNames"  → names of layers, groups, artboards, pages and components.
 *  - "hidden"      → objects present but not visible: hidden layers, off-canvas
 *                    artwork, image data outside a mask, embedded font data.
 *  - "appMetadata" → EXIF and the XMP packet written by the design application.
 *  - "assetPaths"  → links to source files, spot colour names and production marks.
 *  - "platform"    → the record a collaborative design platform keeps around the file.
 *  - "visual"      → drawn into the artwork; only editing the artwork removes it.
 */
export const CARRIERS = Object.freeze([
  "layerNames",
  "hidden",
  "appMetadata",
  "assetPaths",
  "platform",
  "visual",
]);

/**
 * Hand-off methods and the carriers each one clears.
 * `platformRecord` is true where the recipient gets access to the live file
 * rather than a flat export.
 */
export const HANDOFFS = Object.freeze([
  {
    id: "source",
    label: "Send the working file (.psd / .ai / .indd / .sketch)",
    removes: [],
    platformRecord: false,
    note: "The recipient opens your document exactly as you left it, including every hidden layer and link.",
  },
  {
    id: "share-link",
    label: "Share a live link to the design file",
    removes: [],
    platformRecord: true,
    note: "Link access usually covers the whole file — every page, the version history and the comment thread, not just the frame you meant to show.",
  },
  {
    id: "svg",
    label: "Export SVG with default settings",
    removes: ["assetPaths"],
    platformRecord: false,
    note: "SVG is text: layer names become element ids, hidden objects are written out with display:none, and placed images are embedded as base64.",
  },
  {
    id: "raster",
    label: "Export PNG or JPG",
    removes: ["layerNames", "hidden", "assetPaths"],
    platformRecord: false,
    note: "Rasterising discards structure, but the XMP packet the exporter writes rides along with the pixels.",
  },
  {
    id: "pdf",
    label: "Export a print or presentation PDF",
    removes: ["hidden"],
    platformRecord: false,
    note: "Hidden layers are left out of the export, while layer names, live text, link paths and the XMP packet are carried into the PDF.",
  },
  {
    id: "clean",
    label: "Flatten, then strip metadata from the export",
    removes: ["layerNames", "hidden", "appMetadata", "assetPaths"],
    platformRecord: false,
    note: "Flatten to a single layer, export, then clear tags with a metadata stripper. Only what is drawn in the artwork remains.",
  },
]);

export const CATALOGUE = Object.freeze([
  {
    id: "layer-group-names",
    group: "Layer and file naming",
    carrier: "layerNames",
    severity: "high",
    label: "Layer and group names",
    reveals:
      "Working names travel into exports: an SVG element id of 'Acme_pitch_v4_DONT_SEND' or a PDF layer called 'northwind_rebrand' tells the recipient the client, the stage and sometimes your opinion of the work.",
    fix: "Rename layers before export, or use an export preset that generates neutral ids.",
  },
  {
    id: "artboard-page-names",
    group: "Layer and file naming",
    carrier: "layerNames",
    severity: "medium",
    label: "Artboard and page names",
    reveals:
      "Multi-artboard documents carry the names of every board, including the ones for a different client that you did not export.",
    fix: "Export from a duplicated file that contains only the artboards being handed over.",
  },
  {
    id: "component-style-names",
    group: "Layer and file naming",
    carrier: "layerNames",
    severity: "low",
    label: "Component, symbol and colour style names",
    reveals:
      "Library names reference the design system and often the internal product codenames it was built for.",
    fix: "Detach shared components in the hand-off copy.",
  },
  {
    id: "hidden-layers",
    group: "Hidden inside the file",
    carrier: "hidden",
    severity: "high",
    label: "Hidden layers and rejected concepts",
    reveals:
      "Toggling a layer off does not remove it. Alternative routes, the previous client's logo and the pricing panel you were told to drop are all one click from visible.",
    fix: "Delete hidden layers in the export copy rather than switching them off.",
  },
  {
    id: "off-canvas-objects",
    group: "Hidden inside the file",
    carrier: "hidden",
    severity: "medium",
    label: "Objects parked outside the canvas",
    reveals:
      "Artwork dragged off the artboard is still in the document and appears in the source file and in SVG output.",
    fix: "Clear the pasteboard, then check the file at a zoomed-out view before exporting.",
  },
  {
    id: "cropped-placed-images",
    group: "Hidden inside the file",
    carrier: "hidden",
    severity: "medium",
    label: "Image data outside a crop or mask",
    reveals:
      "Masking hides pixels rather than deleting them, so the full photograph — including the frame you cropped out — sits inside the file.",
    fix: "Crop destructively in an image editor before placing, or flatten the export.",
  },
  {
    id: "stock-comp-watermarks",
    group: "Hidden inside the file",
    carrier: "hidden",
    severity: "medium",
    label: "Unlicensed stock comps under the artwork",
    reveals:
      "Watermarked preview images left in lower layers show which assets were never licensed, which is an invoice and a legal problem rather than a privacy one.",
    fix: "Replace comps with licensed files before any file leaves the studio.",
  },
  {
    id: "embedded-font-data",
    group: "Hidden inside the file",
    carrier: "hidden",
    severity: "low",
    label: "Embedded font data",
    reveals:
      "SVG and PDF exports can embed subsets of the typefaces you licensed, identifying the foundry files installed on your machine and raising an embedding-licence question.",
    fix: "Convert type to outlines for hand-off copies where the recipient does not need editable text.",
  },
  {
    id: "document-ancestors",
    group: "Embedded application metadata",
    carrier: "appMetadata",
    severity: "high",
    label: "XMP document ancestors",
    reveals:
      "Photoshop records the identifier of every document an element was pasted from in photoshop:DocumentAncestors, so an export can list the other client files, stock comps and mockups it was assembled from.",
    fix: "Clear XMP on export, or paste through a new document so no ancestry is recorded.",
  },
  {
    id: "xmp-author-name",
    group: "Embedded application metadata",
    carrier: "appMetadata",
    severity: "medium",
    label: "Author, title and copyright fields",
    reveals:
      "dc:creator, dc:title and the copyright notice carry your name, your studio and the original document title into every export made from that file.",
    fix: "Set these deliberately for client deliverables instead of leaving studio defaults.",
  },
  {
    id: "xmp-creator-tool",
    group: "Embedded application metadata",
    carrier: "appMetadata",
    severity: "low",
    label: "Creator tool and version",
    reveals:
      "xmp:CreatorTool names the application and version — useful fingerprinting, and enough to tell a client you produced 'bespoke' work from a template exporter.",
    fix: "Strip metadata from the final export.",
  },
  {
    id: "generator-comment",
    group: "Embedded application metadata",
    carrier: "appMetadata",
    severity: "low",
    label: "Generator comment in SVG source",
    reveals:
      "Vector exporters write a comment naming the application at the top of the SVG, and often an RDF metadata block with the document title.",
    fix: "Run the SVG through an optimiser that removes comments and metadata blocks.",
  },
  {
    id: "export-timestamps",
    group: "Embedded application metadata",
    carrier: "appMetadata",
    severity: "low",
    label: "Create and modify timestamps",
    reveals:
      "XMP records xmp:CreateDate and xmp:ModifyDate to the second with your time zone offset, which dates the work — including work billed as done on another day.",
    fix: "Strip metadata if the timing is sensitive.",
  },
  {
    id: "linked-file-paths",
    group: "Paths and production info",
    carrier: "assetPaths",
    severity: "high",
    label: "Paths to linked source files",
    reveals:
      "Placed images stay as links, so the file records something like /Users/you/Clients/Northwind/2026-pitch/hero.psd — naming your other clients, your folder structure and your username.",
    fix: "Embed or re-link assets from a neutral hand-off folder before exporting.",
  },
  {
    id: "slug-job-info",
    group: "Paths and production info",
    carrier: "assetPaths",
    severity: "medium",
    label: "Slug area, printer marks and job numbers",
    reveals:
      "Print exports carry the slug with the job number, studio name, operator initials and sometimes the client contact, outside the trim area but inside the file.",
    fix: "Turn slug and page information off for any PDF sent outside production.",
  },
  {
    id: "spot-colour-names",
    group: "Paths and production info",
    carrier: "assetPaths",
    severity: "low",
    label: "Swatch and spot colour names",
    reveals:
      "Custom swatch names such as 'Northwind Blue 2026 rebrand' survive in vector and PDF output and name unannounced projects.",
    fix: "Rename swatches generically in the hand-off copy.",
  },
  {
    id: "version-history-authors",
    group: "Platform record",
    carrier: "platform",
    severity: "medium",
    label: "Version history and named authors",
    reveals:
      "Collaborative tools keep a timeline of every change with the author and timestamp, so a viewer can watch the concept evolve and see how long it took.",
    fix: "Hand over a duplicate file, which starts a fresh history, rather than sharing the original.",
  },
  {
    id: "file-comments",
    group: "Platform record",
    carrier: "platform",
    severity: "medium",
    label: "Comment threads on the canvas",
    reveals:
      "Internal review comments stay attached to the frames and are visible to anyone with view access.",
    fix: "Resolve and delete comments in the copy you share externally.",
  },
  {
    id: "other-pages-branches",
    group: "Platform record",
    carrier: "platform",
    severity: "high",
    label: "Other pages and branches in the same file",
    reveals:
      "Link sharing is usually file-scoped, so a link to one frame gives access to every page in that file — including the exploration for another client.",
    fix: "Duplicate the specific page into a new file and share that instead.",
  },
  {
    id: "team-member-list",
    group: "Platform record",
    carrier: "platform",
    severity: "low",
    label: "Team and collaborator list",
    reveals:
      "Avatars and member lists show who else works on the file, which contractors you use and when they were last active.",
    fix: "Share from a project space that contains only the people the client should see.",
  },
  {
    id: "visible-client-marks",
    group: "Visible in the artwork",
    carrier: "visual",
    severity: "medium",
    label: "Client marks left in the picture",
    reveals:
      "Logos, addresses, prices and placeholder copy from a previous project stay visible in a flattened export, and no metadata clean-up touches them.",
    fix: "Review the rendered export at full size before you send it.",
  },
]);

export const RISK_BANDS = Object.freeze([
  { id: "none", label: "Nothing left from your list", min: 0, max: 0, advice: "Nothing you ticked survives this hand-off method." },
  { id: "low", label: "Low exposure", min: 1, max: 24, advice: "The export says little about how it was made." },
  { id: "moderate", label: "Moderate exposure", min: 25, max: 49, advice: "Naming or embedded tags identify the project. Clean the export before hand-off." },
  { id: "high", label: "High exposure", min: 50, max: 74, advice: "Another client's work or your folder structure is reachable from this file." },
  { id: "severe", label: "Severe exposure", min: 75, max: 100, advice: "Hidden concepts, links and history are all going with it. Rebuild a hand-off copy." },
]);

/** Sum of weights across the whole catalogue — the 100% reference point. */
export const MAX_WEIGHT = CATALOGUE.reduce(
  (total, item) => total + SEVERITY_WEIGHT[item.severity],
  0,
);

export function getHandoff(handoffId) {
  return HANDOFFS.find((handoff) => handoff.id === handoffId) || null;
}

/** Does this signal reach the recipient through the chosen hand-off? */
export function survivesHandoff(item, handoff) {
  if (!item || !handoff) return false;
  if (item.carrier === "visual") return true;
  if (item.carrier === "platform") return Boolean(handoff.platformRecord);
  return !handoff.removes.includes(item.carrier);
}

function bandFor(score) {
  return (
    RISK_BANDS.find((band) => score >= band.min && score <= band.max) ||
    RISK_BANDS[RISK_BANDS.length - 1]
  );
}

/**
 * Score what travels with a design hand-off.
 *
 * score = 100 x (severity weight reaching the recipient)
 *             / (severity weight of the whole catalogue)
 *
 * @param {{ selectedIds?: string[], handoffId?: string }} input
 * @returns {{ score:number, band:object, ... }|{ error:string }}
 */
export function assessDesignRisk({ selectedIds = [], handoffId = "source" } = {}) {
  if (!Array.isArray(selectedIds)) {
    return { error: "Selected signals must be a list of catalogue ids." };
  }
  const handoff = getHandoff(handoffId);
  if (!handoff) return { error: "Choose one of the listed hand-off methods." };

  const unique = Array.from(new Set(selectedIds.filter((id) => typeof id === "string")));
  const known = unique.map((id) => CATALOGUE.find((item) => item.id === id)).filter(Boolean);
  const unknownCount = unique.length - known.length;

  const surviving = [];
  const removed = [];
  known.forEach((item) => {
    if (survivesHandoff(item, handoff)) surviving.push(item);
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
    handoff,
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
