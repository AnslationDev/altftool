/**
 * Document metadata (OOXML + PDF) privacy risk model.
 *
 * Office file names below are the real parts inside an OOXML package: a .docx,
 * .xlsx or .pptx is a ZIP containing docProps/core.xml (Dublin Core properties
 * such as dc:creator and cp:lastModifiedBy), docProps/app.xml (Company,
 * Manager, Template, TotalTime) and the document body parts. PDF fields refer
 * to the document Information dictionary (/Author, /Producer, /CreationDate)
 * and to the XMP packet (xmpMM:DocumentID, xmpMM:InstanceID).
 *
 * `weight` is a documented relative privacy weight from 1 to 10. It ranks
 * fields against each other; it is not a measurement.
 *
 * Pure module: no React, no DOM, no I/O, no clock reads.
 */

export const FILE_TYPES = [
  { id: "office", label: "Word, Excel or PowerPoint (OOXML)" },
  { id: "pdf", label: "PDF" },
  { id: "both", label: "A Word file exported to PDF" },
];

export const CATEGORIES = [
  { id: "people", label: "Who wrote and touched it" },
  { id: "organisation", label: "Which organisation you belong to" },
  { id: "machine", label: "Your machine and file system" },
  { id: "history", label: "Edit history and unpublished content" },
  { id: "linkage", label: "Links between versions and files" },
];

export const DOCUMENT_FIELDS = [
  {
    id: "author",
    label: "Author name",
    tag: "dc:creator (docProps/core.xml) · /Author (PDF Info dictionary)",
    category: "people",
    weight: 7,
    appliesTo: ["office", "pdf"],
    example: "Priya Nair",
    reveals:
      "The name registered in the Office or PDF tool that created the file — often a full legal name, sometimes a Windows account name you have never seen.",
    default: true,
  },
  {
    id: "last-modified-by",
    label: "Last modified by",
    tag: "cp:lastModifiedBy (docProps/core.xml)",
    category: "people",
    weight: 7,
    appliesTo: ["office"],
    example: "n.sharma",
    reveals:
      "The person who saved it last. On a document sent out as one team's work this quietly names the real editor, the reviewer, or an outside consultant.",
    default: true,
  },
  {
    id: "company",
    label: "Company",
    tag: "Company (docProps/app.xml)",
    category: "organisation",
    weight: 6,
    appliesTo: ["office"],
    example: "Northgate Legal LLP",
    reveals:
      "The licensed organisation name from the Office installation, which identifies your employer even on a document you meant to send anonymously.",
    default: true,
  },
  {
    id: "manager",
    label: "Manager",
    tag: "Manager (docProps/app.xml)",
    category: "organisation",
    weight: 3,
    appliesTo: ["office"],
    example: "R. Iyer",
    reveals: "A named supervisor, which sketches part of your reporting line to anyone who reads the file.",
    default: false,
  },
  {
    id: "revision-count",
    label: "Revision number",
    tag: "cp:revision (docProps/core.xml)",
    category: "history",
    weight: 2,
    appliesTo: ["office"],
    example: "37",
    reveals:
      "How many save cycles the document went through. A contract on revision 2 and one on revision 60 tell very different stories in a negotiation.",
    default: true,
  },
  {
    id: "total-edit-time",
    label: "Total editing time",
    tag: "TotalTime (docProps/app.xml), in minutes",
    category: "history",
    weight: 3,
    appliesTo: ["office"],
    example: "412",
    reveals:
      "Minutes of editing. Twelve minutes on a document you described as thoroughly reviewed is an awkward number to have published.",
    default: true,
  },
  {
    id: "timestamps",
    label: "Created and modified timestamps",
    tag: "dcterms:created / dcterms:modified · /CreationDate, /ModDate",
    category: "history",
    weight: 4,
    appliesTo: ["office", "pdf"],
    example: "2026-03-14T22:41:00+05:30",
    reveals:
      "When it was written and last touched, including a UTC offset that gives away your time zone and shows whether you worked at 2am or backdated a file.",
    default: true,
  },
  {
    id: "template-path",
    label: "Template name and path",
    tag: "Template (docProps/app.xml)",
    category: "organisation",
    weight: 4,
    appliesTo: ["office"],
    example: "Northgate_Client_Letter_v4.dotx",
    reveals:
      "The house template the file was built from, which can name the firm, the client team, or a matter type you did not intend to disclose.",
    default: true,
  },
  {
    id: "tracked-changes",
    label: "Tracked changes",
    tag: "w:ins / w:del with w:author and w:date (word/document.xml)",
    category: "history",
    weight: 9,
    appliesTo: ["office"],
    example: "Deleted by 'R. Iyer' on 2026-03-12: 'our liability is uncapped'",
    reveals:
      "Every accepted-looking sentence may still carry the version it replaced, attributed by name and timestamp. Accepting changes is not the same as removing them if the recipient can reopen the file.",
    default: false,
  },
  {
    id: "comments",
    label: "Comments and initials",
    tag: "word/comments.xml, xl/comments1.xml, w:initials",
    category: "history",
    weight: 8,
    appliesTo: ["office"],
    example: "[RI] don't send this section to the client",
    reveals:
      "Internal discussion that stays in the file until it is deleted, complete with author initials and timestamps.",
    default: false,
  },
  {
    id: "hidden-content",
    label: "Hidden text, rows and slides",
    tag: "w:vanish, hidden rows/columns, hidden slides",
    category: "history",
    weight: 6,
    appliesTo: ["office"],
    example: "Hidden column H: unit cost before markup",
    reveals:
      "Content hidden for a presentation is still in the file. Hidden spreadsheet columns are the classic way a cost base reaches a customer.",
    default: false,
  },
  {
    id: "cropped-images",
    label: "Cropped image originals",
    tag: "word/media/*, PDF image XObjects",
    category: "history",
    weight: 7,
    appliesTo: ["office", "pdf"],
    example: "Screenshot cropped to hide a chat window — full pixels retained",
    reveals:
      "Cropping in Office and in many PDF tools hides pixels rather than deleting them, so the full original can be restored by anyone who opens the file.",
    default: false,
  },
  {
    id: "speaker-notes",
    label: "Speaker notes",
    tag: "ppt/notesSlides/notesSlide*.xml",
    category: "history",
    weight: 5,
    appliesTo: ["office"],
    example: "Note: do not mention the redundancy timeline",
    reveals:
      "Notes are shipped inside the deck. Sending the .pptx rather than a flattened PDF hands them over with it.",
    default: false,
  },
  {
    id: "local-paths",
    label: "Local file paths and printer names",
    tag: "Hyperlink targets, OLE links, /F file specifications",
    category: "machine",
    weight: 8,
    appliesTo: ["office", "pdf"],
    example: "file:///C:/Users/priya.nair/OneDrive - Northgate/Matters/2026/",
    reveals:
      "A path contains your account name, your employer's tenant name and often the client or matter folder. It is the single most quoted metadata leak in published documents.",
    default: true,
  },
  {
    id: "custom-properties",
    label: "Custom document properties",
    tag: "docProps/custom.xml · custom PDF Info keys",
    category: "organisation",
    weight: 5,
    appliesTo: ["office", "pdf"],
    example: "MatterNumber: 2026-0441; Classification: INTERNAL ONLY",
    reveals:
      "Matter numbers, cost codes and data-classification labels written by document management or DLP tools, all readable by the recipient.",
    default: false,
  },
  {
    id: "rsid",
    label: "Revision save IDs (RSIDs)",
    tag: "w:rsid values in word/settings.xml",
    category: "linkage",
    weight: 6,
    appliesTo: ["office"],
    example: "rsidRoot 00A1F4C2",
    reveals:
      "Word writes a session identifier on each save. Two documents sharing RSIDs were edited in the same Word sessions, which is how anonymous documents get traced back to an author's machine.",
    default: false,
  },
  {
    id: "producer",
    label: "Producer and creator strings",
    tag: "/Producer, /Creator (PDF Info dictionary)",
    category: "machine",
    weight: 4,
    appliesTo: ["pdf"],
    example: "Microsoft Word for Microsoft 365; Acrobat Distiller 25.1 (Windows)",
    reveals:
      "The exact software and version that produced the PDF, which reveals your platform and any unpatched version you are running.",
    default: true,
  },
  {
    id: "xmp-docid",
    label: "XMP document and instance IDs",
    tag: "xmpMM:DocumentID, xmpMM:InstanceID, xmpMM:DerivedFrom",
    category: "linkage",
    weight: 5,
    appliesTo: ["office", "pdf"],
    example: "xmp.did:9f1c... derived from xmp.did:2b77...",
    reveals:
      "A lineage identifier that survives export. It can prove that a public file was derived from a specific earlier draft you never meant to link it to.",
    default: false,
  },
  {
    id: "failed-redaction",
    label: "Black boxes drawn over live text",
    tag: "Annotation or filled rectangle above an intact text layer",
    category: "history",
    weight: 10,
    appliesTo: ["pdf"],
    example: "Name still selectable and copyable under the black bar",
    reveals:
      "Drawing a rectangle hides nothing: the text underneath is still in the content stream and can be copied out in seconds. Real redaction must delete the text, not cover it.",
    default: false,
  },
  {
    id: "embedded-files",
    label: "Embedded and attached files",
    tag: "/EmbeddedFiles name tree, /FileAttachment annotations",
    category: "history",
    weight: 5,
    appliesTo: ["pdf"],
    example: "Attached: pricing_model_internal.xlsx",
    reveals:
      "PDFs can carry whole files inside them. A source spreadsheet attached during review travels with every copy of the PDF.",
    default: false,
  },
  {
    id: "form-values",
    label: "Retained form field values",
    tag: "AcroForm /V values",
    category: "people",
    weight: 4,
    appliesTo: ["pdf"],
    example: "Field 'NationalID' still holds the typed value",
    reveals:
      "A flattened-looking form can still hold the values typed into it, including data you cleared from the visible page.",
    default: false,
  },
];

export const RISK_COMBOS = [
  {
    id: "author-and-employer",
    requires: ["author", "company"],
    bonus: 5,
    label: "Named author plus employer",
    detail:
      "A personal name beside an organisation name identifies exactly who produced the document and on whose behalf, with no guesswork.",
  },
  {
    id: "full-edit-history",
    requires: ["tracked-changes", "comments"],
    bonus: 6,
    label: "Complete internal debate",
    detail:
      "Tracked changes plus comments reconstruct the argument behind the final text, attributed by name and date. This is the leak that ends up quoted in news stories.",
  },
  {
    id: "machine-fingerprint",
    requires: ["local-paths", "rsid"],
    bonus: 5,
    label: "Machine fingerprint",
    detail:
      "A local path names your account and folder structure; RSIDs tie the file to the same Word sessions as your other documents. Together they de-anonymise a supposedly anonymous file.",
  },
  {
    id: "traceable-redaction",
    requires: ["failed-redaction", "xmp-docid"],
    bonus: 4,
    label: "Redaction that points at the original",
    detail:
      "A cosmetic black box leaves the text readable, and the XMP lineage identifier links the released file back to the unredacted draft it came from.",
  },
];

export const SHARING_CONTEXTS = [
  {
    id: "published",
    label: "Published on a website or filed publicly",
    factor: 1.15,
    note: "Anyone can download the original file and mine it at leisure, and archives keep a copy permanently.",
  },
  {
    id: "job-application",
    label: "Job application or proposal to a stranger",
    factor: 1.1,
    note: "A CV or pitch is read by people you have not met, at an organisation with no duty of care to you.",
  },
  {
    id: "counterparty",
    label: "Client, counterparty or regulator",
    factor: 1.05,
    note: "The recipient has an interest in what you did not intend to send — edit history most of all.",
  },
  {
    id: "internal",
    label: "Internal circulation only",
    factor: 0.7,
    note: "Lower risk today, but internal files get forwarded outward later, usually without a fresh review.",
  },
  {
    id: "archive",
    label: "Your own archive",
    factor: 0.4,
    note: "Metadata is useful here. The exposure comes from a future breach or a shared cloud link.",
  },
];

export const RISK_BANDS = [
  { min: 70, id: "severe", label: "Severe", advice: "Do not send this file as-is — inspect and clean it first." },
  { min: 45, id: "high", label: "High", advice: "Remove edit history and personal fields before it leaves." },
  { min: 20, id: "moderate", label: "Moderate", advice: "Run Document Inspector or an equivalent before sending." },
  { min: 1, id: "low", label: "Low", advice: "Modest exposure — check the hidden content items." },
  { min: 0, id: "none", label: "None", advice: "Nothing selected — this is what a properly cleaned file looks like." },
];

export function getField(fieldId) {
  return DOCUMENT_FIELDS.find((field) => field.id === fieldId) || null;
}

export function getContext(contextId) {
  return SHARING_CONTEXTS.find((context) => context.id === contextId) || null;
}

export function getFileType(fileTypeId) {
  return FILE_TYPES.find((type) => type.id === fileTypeId) || null;
}

/** Fields that can exist in the chosen file type. "both" is the union. */
export function fieldsForType(fileTypeId) {
  if (!getFileType(fileTypeId)) return [];
  if (fileTypeId === "both") return DOCUMENT_FIELDS.slice();
  return DOCUMENT_FIELDS.filter((field) => field.appliesTo.includes(fileTypeId));
}

/** Combos whose required fields all exist in the chosen file type. */
export function combosForType(fileTypeId) {
  const available = new Set(fieldsForType(fileTypeId).map((field) => field.id));
  return RISK_COMBOS.filter((combo) => combo.requires.every((id) => available.has(id)));
}

/** Fields a file of this type usually carries with no cleaning at all. */
export function defaultPresentFieldIds(fileTypeId) {
  return fieldsForType(fileTypeId)
    .filter((field) => field.default)
    .map((field) => field.id);
}

/** Maximum obtainable raw points for a file type: all its fields plus all its combos. */
export function maxPointsForType(fileTypeId) {
  const fieldPoints = fieldsForType(fileTypeId).reduce((sum, field) => sum + field.weight, 0);
  const comboPoints = combosForType(fileTypeId).reduce((sum, combo) => sum + combo.bonus, 0);
  return fieldPoints + comboPoints;
}

function bandFor(score) {
  return RISK_BANDS.find((band) => score >= band.min) || RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * @param {{presentIds?:string[], fileTypeId?:string, contextId?:string}} input
 * @returns {{error:string}|object}
 */
export function assessDocumentMetadata({
  presentIds = [],
  fileTypeId = "office",
  contextId = "counterparty",
} = {}) {
  if (!Array.isArray(presentIds)) {
    return { error: "Present fields must be given as a list of field ids." };
  }
  const fileType = getFileType(fileTypeId);
  if (!fileType) {
    return { error: "Choose a file type: an Office document, a PDF, or a Word file exported to PDF." };
  }
  const context = getContext(contextId);
  if (!context) {
    return { error: "Choose who receives the document — that decides how much the metadata matters." };
  }

  const available = fieldsForType(fileTypeId);
  const availableIds = new Set(available.map((field) => field.id));
  const known = presentIds.map(getField).filter(Boolean);
  const applicable = known.filter((field) => availableIds.has(field.id));

  if (presentIds.length > 0 && known.length === 0) {
    return { error: "None of those field ids match a known Office or PDF metadata field." };
  }

  const ignored = known.filter((field) => !availableIds.has(field.id));
  const presentSet = new Set(applicable.map((field) => field.id));
  const fieldPoints = applicable.reduce((sum, field) => sum + field.weight, 0);

  const combos = combosForType(fileTypeId).filter((combo) =>
    combo.requires.every((id) => presentSet.has(id))
  );
  const comboPoints = combos.reduce((sum, combo) => sum + combo.bonus, 0);

  const raw = fieldPoints + comboPoints;
  const maxPoints = maxPointsForType(fileTypeId);
  const base = maxPoints > 0 ? (raw / maxPoints) * 100 : 0;
  const score = Math.max(0, Math.min(100, Math.round(base * context.factor)));

  const byCategory = CATEGORIES.map((category) => {
    const fields = applicable.filter((field) => field.category === category.id);
    return {
      ...category,
      count: fields.length,
      points: fields.reduce((sum, field) => sum + field.weight, 0),
    };
  }).filter((entry) => entry.count > 0);

  return {
    score,
    band: bandFor(score),
    context,
    fileType,
    rawPoints: raw,
    maxPoints,
    fieldCount: applicable.length,
    totalFields: available.length,
    ignoredCount: ignored.length,
    combos,
    byCategory,
    topRisks: [...applicable].sort((a, b) => b.weight - a.weight).slice(0, 5),
    fields: applicable,
  };
}

/** Ordered clean-up actions, derived from what is actually present. */
export function sanitisePlan(assessment) {
  if (!assessment || assessment.error) return [];
  const ids = new Set(assessment.fields.map((field) => field.id));
  const plan = [];

  if (ids.has("tracked-changes") || ids.has("comments") || ids.has("hidden-content") || ids.has("speaker-notes")) {
    plan.push({
      id: "inspector",
      title: "Run Document Inspector before you send",
      detail:
        "In Word, Excel or PowerPoint: File, Info, Check for Issues, Inspect Document. It finds comments, tracked changes, hidden rows, speaker notes and personal properties, and removes them in one pass.",
    });
  }
  if (ids.has("author") || ids.has("last-modified-by") || ids.has("company") || ids.has("manager")) {
    plan.push({
      id: "personal-info",
      title: "Remove personal information on save",
      detail:
        "The inspector's 'Document Properties and Personal Information' section blanks the author, last-modified-by, company and manager fields. Fix the Office user name too, or the next save writes them back.",
    });
  }
  if (ids.has("failed-redaction")) {
    plan.push({
      id: "true-redaction",
      title: "Redact properly, do not draw boxes",
      detail:
        "Use a redaction tool that deletes the underlying text and then applies the change, and verify by selecting and copying the redacted area afterwards. A drawn rectangle hides nothing.",
    });
  }
  if (ids.has("cropped-images")) {
    plan.push({
      id: "flatten-images",
      title: "Delete cropped areas, or re-insert the image",
      detail:
        "Office has a 'Delete cropped areas of pictures' option under Compress Pictures. Safer still, crop the image in an editor and insert the cropped version.",
    });
  }
  if (ids.has("local-paths") || ids.has("custom-properties") || ids.has("template-path")) {
    plan.push({
      id: "paths",
      title: "Strip paths, matter numbers and template names",
      detail:
        "Check hyperlink targets and custom properties by hand. These survive many automated cleaners because they look like content rather than metadata.",
    });
  }
  if (ids.has("producer") || ids.has("xmp-docid") || ids.has("embedded-files") || ids.has("form-values")) {
    plan.push({
      id: "pdf-clean",
      title: "Clean the PDF after export, not before",
      detail:
        "Exporting to PDF creates fresh Info-dictionary and XMP entries. Check attachments, form values and document properties in the exported file itself.",
    });
  }
  plan.push({
    id: "verify",
    title: "Re-open the cleaned file and check",
    detail:
      "Inspect the finished file the way a recipient would: open document properties, try to select text under any redaction, and unzip an OOXML file to confirm nothing is left behind.",
  });

  return plan;
}
