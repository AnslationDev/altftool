/**
 * Email Attachment Metadata Explainer — logic module.
 *
 * Pure data + arithmetic. No React, no DOM, no clock reads.
 *
 * Email transport does not clean attachments: SMTP carries the file bytes
 * verbatim (Base64-encoded in transit and decoded back to the identical file),
 * so whatever is in the document when you press Send is what the recipient
 * gets. The only things that remove metadata are steps you take beforehand,
 * and each step removes a different part of the file.
 */

/** Severity ladder: 1 / 3 / 6 so one "high" outranks two "medium". */
export const SEVERITY_WEIGHT = Object.freeze({ low: 1, medium: 3, high: 6 });

export const SEVERITY_LABEL = Object.freeze({ low: "Low", medium: "Medium", high: "High" });

/** File types you can attach. `id` is matched against each catalogue entry's formats list. */
export const FORMATS = Object.freeze([
  { id: "docx", label: "Word document (.docx)" },
  { id: "xlsx", label: "Spreadsheet (.xlsx)" },
  { id: "pptx", label: "Presentation (.pptx)" },
  { id: "pdf", label: "PDF" },
  { id: "image", label: "Photo or image (.jpg / .png)" },
  { id: "zip", label: "Zip archive" },
]);

/**
 * Where the signal lives:
 *  - "fileprops"      → Office core properties (core.xml / app.xml) or the PDF /Info dictionary.
 *  - "editingHistory" → tracked changes, comments, revision counters, save history.
 *  - "hiddenContent"  → data that is in the file but not on the visible page.
 *  - "embeddedMedia"  → tags inside pictures, fonts and objects embedded in the document.
 *  - "filename"       → the attachment's name.
 *  - "transport"      → what the email itself adds; no attachment clean-up touches it.
 *
 * These carrier ids are the values used in each CATALOGUE entry's `carrier`
 * field below, and in each PREP_STEPS entry's `removes` list.
 */

/**
 * Preparation steps and the carriers each one actually clears.
 * "transport" appears in no list because nothing you do to the file changes
 * the headers your mail server writes.
 */
export const PREP_STEPS = Object.freeze([
  {
    id: "as-is",
    label: "Attach the working file as it is",
    removes: [],
    note: "Mail servers copy attachments byte-for-byte, so the recipient opens the exact file sitting on your disk.",
  },
  {
    id: "inspector",
    label: "Run Office 'Inspect Document' and remove what it finds",
    removes: ["fileprops", "editingHistory", "hiddenContent"],
    note: "Clears author and company fields, comments, tracked changes and hidden rows or sheets. It does not look inside embedded pictures and it cannot rename the file.",
  },
  {
    id: "export-pdf",
    label: "Export a PDF copy and send that",
    removes: ["editingHistory", "hiddenContent", "embeddedMedia"],
    note: "Only the printed view is exported, so comments and hidden data are dropped — but Word and PowerPoint copy the Author and Title straight into the PDF properties.",
  },
  {
    id: "strip-tool",
    label: "Run a metadata stripper on the finished file",
    removes: ["fileprops", "embeddedMedia"],
    note: "ExifTool and similar cleaners clear file properties and image tags, but they do not understand tracked changes or hidden worksheets.",
  },
  {
    id: "rebuild",
    label: "Rebuild it: paste the content into a new file and rename it",
    removes: ["fileprops", "editingHistory", "hiddenContent", "embeddedMedia", "filename"],
    note: "The most thorough option. Re-insert pictures from cleaned originals, because pasting can carry their tags across.",
  },
]);

export const CATALOGUE = Object.freeze([
  {
    id: "author-lastmodified",
    group: "Document properties",
    carrier: "fileprops",
    severity: "high",
    label: "Author, Last modified by and Company",
    formats: ["docx", "xlsx", "pptx"],
    reveals:
      "Office writes the licensed user's name into Author and stamps every save into 'Last modified by', so a document reused across clients names everyone who touched it and the company its copy of Office is registered to.",
    fix: "Clear the properties, or turn on 'Remove personal information from file properties on save'.",
  },
  {
    id: "app-version-template",
    group: "Document properties",
    carrier: "fileprops",
    severity: "low",
    label: "Application version and template path",
    formats: ["docx", "xlsx", "pptx"],
    reveals:
      "app.xml records the exact Office build, and a document made from a company template can keep a path like \\\\fileserver\\templates\\ — naming an internal server.",
    fix: "Inspect the document and remove document properties and personal information.",
  },
  {
    id: "pdf-info",
    group: "Document properties",
    carrier: "fileprops",
    severity: "medium",
    label: "PDF Producer, Creator and dates",
    formats: ["pdf"],
    reveals:
      "The /Info dictionary names the software that made the file and stores CreationDate and ModDate to the second with your UTC offset.",
    fix: "Clear document properties before sending, or re-print the PDF.",
  },
  {
    id: "tracked-changes",
    group: "Editing history",
    carrier: "editingHistory",
    severity: "high",
    label: "Tracked changes still in the file",
    formats: ["docx", "xlsx", "pptx"],
    reveals:
      "Accepting changes in the view is not the same as removing them: unaccepted revisions keep the deleted wording, the old price and the reviewer's name with a timestamp.",
    fix: "Accept or reject all changes, then turn tracking off and inspect the document.",
  },
  {
    id: "comments-notes",
    group: "Editing history",
    carrier: "editingHistory",
    severity: "high",
    label: "Comments and review notes",
    formats: ["docx", "xlsx", "pptx", "pdf"],
    reveals:
      "Internal comments — 'we can go 15% lower', 'check this with legal' — stay in the file and are attributed to the person who wrote them.",
    fix: "Delete all comments rather than hiding the review pane.",
  },
  {
    id: "revision-editing-time",
    group: "Editing history",
    carrier: "editingHistory",
    severity: "medium",
    label: "Revision number, editing time and last printed date",
    formats: ["docx", "xlsx", "pptx"],
    reveals:
      "Office counts saves and accumulates total editing minutes, so a 'bespoke' proposal that took eleven minutes and one revision is easy to spot.",
    fix: "Remove document properties, or rebuild the file.",
  },
  {
    id: "pdf-incremental",
    group: "Editing history",
    carrier: "editingHistory",
    severity: "high",
    label: "PDF incremental save history",
    formats: ["pdf"],
    reveals:
      "PDF editors can append changes instead of rewriting the file, leaving earlier versions of the page — including content you deleted — inside the bytes.",
    fix: "Re-print the PDF to a new file so only the final state is written.",
  },
  {
    id: "hidden-rows-sheets",
    group: "Hidden content",
    carrier: "hiddenContent",
    severity: "high",
    label: "Hidden rows, columns, worksheets and filters",
    formats: ["xlsx"],
    reveals:
      "Hiding and filtering only change what is displayed. The cost model, the other bidders' numbers and the source list are all still in the workbook and one right-click from view.",
    fix: "Delete the data and paste only the values you intend to share into a fresh workbook.",
  },
  {
    id: "cropped-image-remnants",
    group: "Hidden content",
    carrier: "hiddenContent",
    severity: "high",
    label: "Cropped-away parts of pictures",
    formats: ["docx", "xlsx", "pptx"],
    reveals:
      "Office crops non-destructively: the part of the photo or screenshot you cropped out is still stored and can be restored by dragging the crop handles back.",
    fix: "Use Compress Pictures with 'Delete cropped areas of pictures' ticked, or crop in an image editor first.",
  },
  {
    id: "speaker-notes-offslide",
    group: "Hidden content",
    carrier: "hiddenContent",
    severity: "medium",
    label: "Speaker notes, hidden slides and off-canvas objects",
    formats: ["pptx"],
    reveals:
      "Notes with the internal narrative, slides marked hidden and objects parked outside the slide area all ship with the deck even though nobody sees them in presentation mode.",
    fix: "Delete hidden slides and notes, or export the deck to PDF.",
  },
  {
    id: "chart-source-workbook",
    group: "Hidden content",
    carrier: "hiddenContent",
    severity: "high",
    label: "The workbook embedded behind a chart",
    formats: ["docx", "pptx"],
    reveals:
      "A chart pasted with its data carries an entire embedded spreadsheet, which usually holds far more rows than the chart plots.",
    fix: "Paste charts as pictures when the underlying data is not for the recipient.",
  },
  {
    id: "white-text-behind",
    group: "Hidden content",
    carrier: "hiddenContent",
    severity: "low",
    label: "Text hidden by formatting",
    formats: ["docx", "pdf"],
    reveals:
      "White-on-white text, zero-size fonts and content behind an image are invisible on screen but come straight out with a select-all and copy.",
    fix: "Delete the text instead of formatting it away.",
  },
  {
    id: "image-exif-gps",
    group: "Embedded media",
    carrier: "embeddedMedia",
    severity: "high",
    label: "EXIF and GPS in embedded photos",
    formats: ["docx", "xlsx", "pptx", "pdf", "image"],
    reveals:
      "A phone photo dropped into a report keeps its capture time, camera serial in some models, and GPS coordinates accurate to a few metres — the site address, or your home.",
    fix: "Strip EXIF from the picture before inserting it, not after.",
  },
  {
    id: "image-thumbnail-preview",
    group: "Embedded media",
    carrier: "embeddedMedia",
    severity: "medium",
    label: "Embedded thumbnail or preview image",
    formats: ["image", "docx", "pdf"],
    reveals:
      "Files can carry a small preview generated before your last edit, so an old thumbnail may still show the un-cropped or un-edited version.",
    fix: "Re-export the file from a clean source so a fresh preview is generated.",
  },
  {
    id: "font-object-embedding",
    group: "Embedded media",
    carrier: "embeddedMedia",
    severity: "low",
    label: "Embedded fonts and linked objects",
    formats: ["docx", "pptx", "pdf"],
    reveals:
      "Embedded fonts identify licensed software on your machine, and linked objects can keep the original path to a network share.",
    fix: "Turn off font embedding for external copies and break links before sending.",
  },
  {
    id: "filename-clues",
    group: "The attachment itself",
    carrier: "filename",
    severity: "medium",
    label: "What the filename says",
    formats: ["docx", "xlsx", "pptx", "pdf", "image", "zip"],
    reveals:
      "Names like 'Acme_offer_v3_FINAL_signed_JS.xlsx' hand over the client, the negotiation stage and someone's initials before the file is even opened.",
    fix: "Rename to a neutral, descriptive name at the moment you attach it.",
  },
  {
    id: "zip-listing",
    group: "The attachment itself",
    carrier: "filename",
    severity: "medium",
    label: "Everything a zip's directory lists",
    formats: ["zip"],
    reveals:
      "A zip's central directory holds every entry's name, original folder path, size and modification time, readable without extracting — and a standard password-protected zip still exposes that list.",
    fix: "Repackage from a clean folder, or use an archive format that encrypts the file list too.",
  },
  {
    id: "mail-headers",
    group: "What email adds",
    carrier: "transport",
    severity: "medium",
    label: "Received headers, Message-ID and mail client",
    formats: ["docx", "xlsx", "pptx", "pdf", "image", "zip"],
    reveals:
      "Headers trace the route your message took, name your mail host in the Message-ID and often name your client and version. Desktop clients frequently add the IP address you were connecting from.",
    fix: "Send from a webmail session if you do not want your connecting IP recorded, and remember no attachment clean-up affects headers.",
  },
  {
    id: "forwarded-thread",
    group: "What email adds",
    carrier: "transport",
    severity: "medium",
    label: "The quoted thread and recipient list",
    formats: ["docx", "xlsx", "pptx", "pdf", "image", "zip"],
    reveals:
      "Everything quoted below your reply, plus every address in To and Cc, travels onward the moment the recipient forwards the message.",
    fix: "Start a fresh message for external recipients and trim the quoted history.",
  },
  {
    id: "read-receipts",
    group: "What email adds",
    carrier: "transport",
    severity: "low",
    label: "Remote images and read receipts",
    formats: ["docx", "xlsx", "pptx", "pdf", "image", "zip"],
    reveals:
      "Tracking pixels report the moment you open a message and the network you opened it on; requested read receipts do the same in the open.",
    fix: "Block remote images by default and decline receipt requests.",
  },
]);

export const RISK_BANDS = Object.freeze([
  { id: "none", label: "Nothing left from your list", min: 0, max: 0, advice: "Nothing you ticked survives this preparation step for this file type." },
  { id: "low", label: "Low exposure", min: 1, max: 24, advice: "Mostly incidental detail. Rename the file and send." },
  { id: "moderate", label: "Moderate exposure", min: 25, max: 49, advice: "Identifying properties still travel with the file. Clear them before attaching." },
  { id: "high", label: "High exposure", min: 50, max: 74, advice: "Content you did not intend to send is still inside the file. Rebuild or export before attaching." },
  { id: "severe", label: "Severe exposure", min: 75, max: 100, advice: "Deleted text, hidden data and author details are all going out. Do not attach this file." },
]);

export function getFormat(formatId) {
  return FORMATS.find((format) => format.id === formatId) || null;
}

export function getPrepStep(prepId) {
  return PREP_STEPS.find((step) => step.id === prepId) || null;
}

/** Catalogue entries that can apply to the chosen file type. */
export function itemsForFormat(formatId) {
  return CATALOGUE.filter((item) => item.formats.includes(formatId));
}

/** Does the preparation step leave this signal in place? */
export function survivesPrep(item, step) {
  if (!item || !step) return false;
  return !step.removes.includes(item.carrier);
}

function bandFor(score) {
  return (
    RISK_BANDS.find((band) => score >= band.min && score <= band.max) ||
    RISK_BANDS[RISK_BANDS.length - 1]
  );
}

/**
 * Score what still leaves your outbox with the attachment.
 *
 * score = 100 x (severity weight surviving)
 *             / (severity weight of every signal that can apply to this file type)
 *
 * @param {{ selectedIds?: string[], formatId?: string, prepId?: string }} input
 * @returns {{ score:number, band:object, ... }|{ error:string }}
 */
export function assessAttachmentRisk({
  selectedIds = [],
  formatId = "docx",
  prepId = "as-is",
} = {}) {
  if (!Array.isArray(selectedIds)) {
    return { error: "Selected signals must be a list of catalogue ids." };
  }
  const format = getFormat(formatId);
  if (!format) return { error: "Choose one of the listed attachment types." };
  const step = getPrepStep(prepId);
  if (!step) return { error: "Choose one of the listed preparation steps." };

  const applicable = itemsForFormat(format.id);
  const maxWeight = applicable.reduce(
    (total, item) => total + SEVERITY_WEIGHT[item.severity],
    0,
  );

  const unique = Array.from(new Set(selectedIds.filter((id) => typeof id === "string")));
  const known = unique.map((id) => applicable.find((item) => item.id === id)).filter(Boolean);
  const ignoredCount = unique.length - known.length;

  const surviving = [];
  const removed = [];
  known.forEach((item) => {
    if (survivesPrep(item, step)) surviving.push(item);
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
  // The headline score measures how much of what the user actually flagged is still
  // exposed, so it is weighed against what they ticked (selectedWeight), not against
  // every signal that could apply to the file type (maxWeight) — ticking a true subset
  // of the applicable risks should not dilute the score toward a falsely reassuring
  // "Moderate" band when 100% of the flagged risk survives untouched.
  const score = selectedWeight > 0 ? Math.round((survivingWeight / selectedWeight) * 100) : 0;
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
    format,
    step,
    applicableCount: applicable.length,
    selectedCount: known.length,
    ignoredCount,
    surviving,
    removed,
    survivingWeight,
    selectedWeight,
    maxWeight,
    removedShare,
    bySeverity,
    actions,
  };
}

/** Applicable catalogue for a format, grouped for display. */
export function groupedItemsForFormat(formatId) {
  const groups = [];
  itemsForFormat(formatId).forEach((item) => {
    let group = groups.find((entry) => entry.name === item.group);
    if (!group) {
      group = { name: item.group, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  });
  return groups;
}
