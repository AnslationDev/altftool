/**
 * The two public open-data payloads, built from the same registries the pages
 * render from, so a consumer can never be served a figure the site itself does
 * not show.
 *
 *   /api/open-data/exam-photo-specs   ← src/app/exam-photo/data/examSpecs.js
 *   /api/open-data/transform-converters ← src/app/transform/_data/transform.manifest.json
 *
 * Two rules this file exists to enforce:
 *
 * 1. PROVENANCE TRAVELS WITH THE NUMBER. Every exam record carries its own
 *    `source` block — the document, the date printed on it, its URL, and the
 *    confidence flag. A KB figure with no notification behind it is worse than
 *    no figure at all: the consumer republishes it, a candidate hits it, and
 *    nobody can trace where it came from when the body revises the spec.
 *
 * 2. INTERNALS STAY IN. The transform manifest carries `status`, `engine`,
 *    `lib`, `uses` and `blocked_reason` — build-system bookkeeping that means
 *    nothing to a consumer and would age into a lie the moment a converter is
 *    re-implemented. Only slug, title, category, from, to and url go out.
 *
 * The licence terms are written out in words here on purpose. See
 * OPEN_DATA_LICENSE.named_license_note.
 */

import {
  EXAM_SPECS,
  SPECS_READ_ON,
  confidenceLabel,
} from "@/app/exam-photo/data/examSpecs";
import { TOOLS as TRANSFORM_TOOLS } from "@/app/transform/_lib/manifest";

/** Same shape the other static text routes use (llms.txt, ai.txt). */
export const OPEN_DATA_CACHE_CONTROL =
  "public, max-age=86400, stale-while-revalidate=604800";

/**
 * These two routes are the only ones on the site that answer any origin. The
 * entire point of publishing them is that other people's pages fetch them from
 * the browser; without this header that fetch fails and the dataset might as
 * well not exist. Nothing here is user-specific, authenticated, or writable,
 * so there is no cross-origin state to leak.
 */
export const OPEN_DATA_CORS_HEADERS = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
});

export const OPEN_DATA_PUBLISHER = "AltFTool";
export const OPEN_DATA_DOCS_PATH = "/open-data";

/**
 * Plain-words terms. Deliberately NOT labelled with a named licence: writing
 * "CC BY 4.0" would import a legal text nobody here has adopted, and a
 * consumer who then relies on a clause of that text (share-alike behaviour,
 * the specific attribution formula, the database-rights waiver) would be
 * relying on something that was never granted.
 */
export const OPEN_DATA_LICENSE = Object.freeze({
  summary:
    "Free to use. You may copy, republish, translate, reformat and build on this data, including inside a commercial product, on one condition: credit AltFTool and link to the AltFTool page the record describes.",
  attribution: Object.freeze({
    required: true,
    credit: OPEN_DATA_PUBLISHER,
    link_to:
      "the record's own page URL on this site — the `page_url` field on an exam record, the `url` field on a converter record. Not this endpoint, and not the site root.",
    where:
      "Next to the figures, wherever a reader can see them — a footnote at the bottom of a long page is fine, a link buried in a colophon is not.",
    format:
      'A visible "Source: AltFTool" credit that hyperlinks to that record\'s page. Each dataset carries a worked example in its `attribution_example` block.',
  }),
  named_license: null,
  named_license_note:
    "There is no named licence here on purpose. AltFTool has not adopted CC BY, ODbL, or any other standard licence for this data, so please do not label it with one. The terms above are the whole grant; quote them rather than substituting a licence name.",
  no_warranty:
    "Published as-is, with no warranty of accuracy, completeness or fitness for any purpose. Every figure is a dated reading of a named document, not a live feed and not advice. Read `limitations` before you republish anything.",
  requests: Object.freeze([
    "Please cache. The underlying records change a few times a year at most; fetching once a day is more than enough.",
    "Please keep the `source` block attached to any exam figure you republish. Numbers without their notification are what this dataset exists to replace.",
    "Please do not present AltFTool as the authority behind a figure. The conducting body named in `source.document` is the authority; AltFTool read its document and wrote down what it said.",
  ]),
  changes:
    "These terms may change for future data. Anything you already fetched under them stays under them.",
});

/** Verbatim from the comment block at the top of examSpecs.js. */
export const EXAM_CONFIDENCE_LEVELS = Object.freeze({
  primary:
    "The figures were extracted from the conducting body's own PDF for this exam.",
  derived:
    "The exam's own PDF was not readable. The upload block was read from a sibling notice of the same cycle from the same body, where that block is boilerplate.",
  unconfirmed:
    "Only secondary listings were reachable. The number is reported as-published elsewhere and is flagged as unconfirmed on the exam page too.",
});

function liveCaptureExamNames() {
  return EXAM_SPECS.filter((exam) => exam.photoMode === "live-capture").map(
    (exam) => exam.name,
  );
}

/**
 * Counted, never written down. An earlier generation of this site's copy stated
 * a slug pattern that held for most converters and not all, which sends anyone
 * composing a URL from it to a 404.
 */
function offPatternConverterCount() {
  return TRANSFORM_TOOLS.filter(
    (tool) => tool.slug !== `${tool.from}-to-${tool.to}`,
  ).length;
}

export function examSpecLimitations() {
  const liveCapture = liveCaptureExamNames();

  return [
    `Every figure below was read out of the document named in that record's \`source\` block, on ${SPECS_READ_ON}. It is a dated fact about that document — "this is what the notification said when it was read" — not a live feed from the conducting body.`,
    "Exam bodies revise these specs every cycle. Before you act on a number, and before you republish it, open `source.url` and check it against the notification for the cycle your reader is actually applying for.",
    "Some records describe the most recent notification a body had published rather than the cycle now open. Where that is true the record says so in `source.note`, and that note has to travel with the figures.",
    "Confidence is per record, in `source.confidence`. Anything other than `primary` was not read from that exam's own PDF — see `confidence_levels`.",
    liveCapture.length
      ? `${liveCapture.length} of these exams no longer accept a photograph file at all (\`photo_mode: "live-capture"\`): ${liveCapture.join(", ")}. They capture the photograph inside the application form, so there is no KB limit and no pixel size for it. Widely copied photo figures for those exams describe a step the form no longer has.`
      : null,
    "Where an official document contradicts itself, both figures are kept in the asset `notes` rather than one being silently chosen. Do not drop those notes — the contradiction is in the source, not in this dataset.",
    "AltFTool is not a conducting body, a government department, or an authority on any exam's rules. It is a tools site that opened the notifications and wrote down what they say.",
  ].filter(Boolean);
}

export function transformConverterLimitations() {
  const offPattern = offPatternConverterCount();

  return [
    "This is an index of converter pages, not a conversion API. There is no public endpoint that converts a file; each converter runs on its own page.",
    `Slugs are not reliably \`{from}-to-{to}\`: ${offPattern} of the ${TRANSFORM_TOOLS.length} do not follow that shape. Use the \`url\` field on the record instead of composing one.`,
    "`from` and `to` are the format identifiers AltFTool groups converters by. They are not MIME types and not guaranteed file extensions.",
    "Converters are added and retired. Treat a response as a snapshot and re-fetch rather than hardcoding the list.",
  ];
}

function examAssetRecord(asset) {
  const record = {
    id: asset.id,
    label: asset.label,
    format: asset.format,
  };

  if (asset.minKB != null) record.min_kb = asset.minKB;
  if (asset.maxKB != null) record.max_kb = asset.maxKB;

  if (asset.pixels?.width && asset.pixels?.height) {
    record.pixels = { width: asset.pixels.width, height: asset.pixels.height };
    // Some notices print a floor rather than a target (RRB NTPC's 140×60 px).
    // Serving the pair without this flag tells a candidate to hit it exactly.
    record.pixels_are_minimum = Boolean(asset.pixelsAreMinimum);
  }
  if (asset.statedPixels) record.stated_pixels = asset.statedPixels;
  if (asset.longEdgePx) record.long_edge_px = asset.longEdgePx;

  if (asset.physical?.width && asset.physical?.height) {
    record.physical = {
      width: asset.physical.width,
      height: asset.physical.height,
      unit: asset.physical.unit || "cm",
    };
  }
  if (asset.dpi) record.dpi = asset.dpi;
  if (asset.notes?.length) record.notes = [...asset.notes];

  return record;
}

function examSpecRecord(site, exam) {
  const pageUrl = `${site}/exam-photo/${exam.slug}`;
  const source = exam.source || {};

  const record = {
    slug: exam.slug,
    name: exam.name,
    full_name: exam.fullName,
    conducting_body: exam.body,
    portal: exam.portal,
    page_url: pageUrl,
    photo_mode: exam.photoMode,
  };

  if (exam.photoNote) record.photo_note = exam.photoNote;
  if (exam.photoAge) record.photo_age_rule = exam.photoAge;
  if (exam.nameDateOnPhoto) record.name_or_date_on_photo = exam.nameDateOnPhoto;
  if (exam.background) record.background = exam.background;
  if (exam.aadhaarNote) record.aadhaar_note = exam.aadhaarNote;

  record.assets = (exam.assets || []).map(examAssetRecord);
  if (exam.extras?.length) record.extras = [...exam.extras];

  // Last, and never optional: the document the numbers above came out of.
  record.source = {
    document: source.doc,
    issued: source.issued,
    url: source.url,
    confidence: source.confidence,
    confidence_label: confidenceLabel(source.confidence),
    read_on: SPECS_READ_ON,
  };
  if (source.note) record.source.note = source.note;

  record.attribution = {
    credit: OPEN_DATA_PUBLISHER,
    link: pageUrl,
  };

  return record;
}

/**
 * A worked attribution example built from a real record, so the example can
 * never point at a URL this dataset does not contain.
 */
function attributionExample(linkField, url) {
  return {
    link_field: linkField,
    text: `Source: ${OPEN_DATA_PUBLISHER} — ${url}`,
    html: `<a href="${url}">Source: ${OPEN_DATA_PUBLISHER}</a>`,
  };
}

export function buildExamSpecDataset(site) {
  const records = EXAM_SPECS.map((exam) => examSpecRecord(site, exam));

  return {
    dataset: {
      name: "Exam photograph and signature upload specifications",
      description: `The photograph and signature upload rules ${EXAM_SPECS.length} Indian recruitment and entrance bodies publish, each figure quoted from a named notification with the date printed on that notification, a confidence flag, and the honest qualifications attached to it.`,
      publisher: OPEN_DATA_PUBLISHER,
      documentation: `${site}${OPEN_DATA_DOCS_PATH}`,
      endpoint: `${site}/api/open-data/exam-photo-specs`,
      human_readable_pages: `${site}/exam-photo`,
      record_count: EXAM_SPECS.length,
      specs_read_on: SPECS_READ_ON,
      coverage: "India — SSC, IBPS, SBI, UPSC, RRB and NTA examinations.",
    },
    license: OPEN_DATA_LICENSE,
    attribution_example: attributionExample("page_url", records[0]?.page_url),
    limitations: examSpecLimitations(),
    confidence_levels: EXAM_CONFIDENCE_LEVELS,
    records,
  };
}

export function buildTransformConverterDataset(site) {
  const categories = [...new Set(TRANSFORM_TOOLS.map((tool) => tool.category))];
  const records = TRANSFORM_TOOLS.map((tool) => ({
    slug: tool.slug,
    title: tool.title,
    category: tool.category,
    from: tool.from,
    to: tool.to,
    url: `${site}/transform/${tool.slug}`,
  }));

  return {
    dataset: {
      name: "AltFTool format converter index",
      description: `Every format converter published under ${site}/transform, with the format pair it handles and its own page URL. An index of pages, not a conversion API.`,
      publisher: OPEN_DATA_PUBLISHER,
      documentation: `${site}${OPEN_DATA_DOCS_PATH}`,
      endpoint: `${site}/api/open-data/transform-converters`,
      human_readable_pages: `${site}/transform`,
      record_count: TRANSFORM_TOOLS.length,
      categories,
    },
    license: OPEN_DATA_LICENSE,
    attribution_example: attributionExample("url", records[0]?.url),
    limitations: transformConverterLimitations(),
    records,
  };
}

/**
 * What the /open-data page lists. Kept here so the page and the endpoints can
 * never disagree about how many records exist or where they live.
 */
export function openDataCatalog(site) {
  return [
    {
      id: "exam-photo-specs",
      name: "Exam photograph and signature upload specifications",
      path: "/api/open-data/exam-photo-specs",
      endpoint: `${site}/api/open-data/exam-photo-specs`,
      recordCount: EXAM_SPECS.length,
      recordNoun: "exams",
      sourcePath: "/exam-photo",
      sourceLabel: "Exam photo & signature specs",
      updated: SPECS_READ_ON,
      attributionExample: attributionExample(
        "page_url",
        `${site}/exam-photo/${EXAM_SPECS[0]?.slug}`,
      ),
      blurb:
        "One record per exam. Each carries the photograph mode, every uploadable asset with its KB range, pixel or physical dimensions and DPI where the body prints one, the background and face-coverage rules, and the notification the whole record was read out of.",
      fields: [
        ["slug", "Stable identifier. Also the last segment of page_url."],
        ["name / full_name", "Short exam name, and the full title the notification uses."],
        ["conducting_body / portal", "Who runs the exam, and the portal applications are filed on."],
        ["page_url", "The AltFTool page this record describes. This is the link attribution has to point at."],
        [
          "photo_mode",
          '"upload" (a photo file is uploaded), "live-capture" (no photo file at all — the form takes the photograph) or "upload+live" (both).',
        ],
        ["photo_note / photo_age_rule", "How the photograph is captured, and any cut-off date after which it must have been taken. Absent when the document sets none."],
        ["name_or_date_on_photo", "Whether the body wants the candidate's name and date printed on the image. Several forbid it outright."],
        ["background", "The background, dress and face-visibility rules as printed."],
        ["aadhaar_note", "SSC only: the concession for candidates who opt for Aadhaar authentication."],
        [
          "assets[]",
          "id, label, format, min_kb, max_kb, pixels {width,height}, pixels_are_minimum, stated_pixels, long_edge_px, physical {width,height,unit}, dpi, notes[]. Keys are omitted rather than nulled when the document does not print that figure.",
        ],
        ["extras[]", "Rules that sit outside the upload boxes — printed copies to carry, certificates uploaded as PDFs."],
        [
          "source",
          "document, issued, url, confidence, confidence_label, read_on, and note where a qualification applies. Never absent.",
        ],
      ],
    },
    {
      id: "transform-converters",
      name: "Format converter index",
      path: "/api/open-data/transform-converters",
      endpoint: `${site}/api/open-data/transform-converters`,
      recordCount: TRANSFORM_TOOLS.length,
      recordNoun: "converters",
      sourcePath: "/transform",
      sourceLabel: "Transform",
      updated: null,
      attributionExample: attributionExample(
        "url",
        `${site}/transform/${TRANSFORM_TOOLS[0]?.slug}`,
      ),
      blurb:
        "One record per converter page, with the format pair it handles. Build a directory, a \"convert X to Y\" lookup, or a link map from it. Build-system internals — engine, library, status — are deliberately not served.",
      fields: [
        ["slug", "Stable identifier. Not reliably {from}-to-{to} — use url."],
        ["title", "The converter's display name."],
        ["category", "The format family it is grouped under."],
        ["from / to", "The format pair, as AltFTool identifies formats. Not MIME types."],
        ["url", "The converter's page. This is the link attribution has to point at."],
      ],
    },
  ];
}
