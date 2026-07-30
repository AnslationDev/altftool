/**
 * Page copy generated from the ONE preset table in ./examSpecs.js.
 *
 * Nothing here hard-codes a KB figure or a pixel size: every number is read off
 * the exam record, so the prose, the FAQ schema and the resizer target are the
 * same numbers by construction and cannot drift apart.
 */

import { DERIVED_DPI, SPECS_READ_ON } from "./examSpecs";
import {
  describeDimensions,
  describeTarget,
  formatIsoDate,
  resolveTargetPixels,
} from "../lib/specMath";

function assetById(exam, id) {
  return (exam.assets || []).find((asset) => asset.id === id) || null;
}

function targetFor(asset) {
  if (!asset) return null;
  const target = resolveTargetPixels(asset, {}, DERIVED_DPI);
  return target.error ? null : target;
}

/**
 * Dimension wording for running prose. Where the notice printed a pixel figure
 * we quote the pixels; where we derived pixels from a cm/mm box, we quote the
 * box the notice actually printed rather than our own derivation, so a sentence
 * lifted out of this page still matches the source document. Returns "" when
 * the notice prints no dimension at all - never invents one.
 */
function proseDimension(asset) {
  const target = targetFor(asset);
  if (target && target.source === "stated" && target.width && target.height) {
    // Some notices print a floor ("minimum 140 x 60 pixels") rather than a
    // fixed size. Saying so keeps the sentence true to the document.
    const prefix = asset.pixelsAreMinimum ? "at least " : "";
    return `${prefix}${target.width} x ${target.height} px`;
  }
  if (asset.physical) {
    const { width, height, unit } = asset.physical;
    return `about ${width} ${unit} x ${height} ${unit}`;
  }
  if (asset.statedPixels) return asset.statedPixels;
  return "";
}

/** "JPG / JPEG, 20 to 50 KB, 200 x 230 px" - built only from stated figures. */
function proseSpec(asset) {
  if (!asset) return "";
  const parts = [];
  if (asset.format) parts.push(asset.format);
  if (Number.isFinite(asset.minKB) && Number.isFinite(asset.maxKB)) {
    parts.push(`${asset.minKB} to ${asset.maxKB} KB`);
  }
  const dimension = proseDimension(asset);
  if (dimension) parts.push(dimension);
  return parts.join(", ");
}

/**
 * The first body sentence of the page. It has to answer "what photo size does
 * this exam need?" on its own, with the real numbers, without the H1 for
 * context - so that an answer engine (or a person skimming) can lift it whole.
 */
export function answerFirstSentence(exam) {
  const photo = assetById(exam, "photo");
  const signature = assetById(exam, "signature");
  const signatureSpec = proseSpec(signature);

  if (exam.photoMode === "live-capture") {
    const tail = signature
      ? `; the only image you upload is your signature, in ${signatureSpec}`
      : "";
    return `${exam.name} does not take a photograph file at all - the application form captures a live photograph through your webcam or phone camera, so there is no KB limit and no pixel size to hit for the photo${tail}.`;
  }

  if (!photo) {
    return `${exam.name} does not list a photograph upload in the notice this page was read from${
      signature ? `, only a signature, in ${signatureSpec}` : ""
    }.`;
  }

  const live =
    exam.photoMode === "upload+live"
      ? " A live photograph is captured inside the form as well, and matched against the file you upload."
      : "";
  const tail = signature ? `, and a signature in ${signatureSpec}` : "";
  return `${exam.name} needs a photograph in ${proseSpec(photo)}${tail}.${live}`;
}

/** "JPG / JPEG - 20 to 50 KB - 200 x 230 px" for one asset, or "" if absent. */
export function assetLine(exam, id) {
  const asset = assetById(exam, id);
  if (!asset) return "";
  return describeTarget(asset, targetFor(asset));
}

/** One sentence describing how the exam takes the photograph. */
export function photoSentence(exam) {
  const photo = assetById(exam, "photo");
  if (exam.photoMode === "live-capture") {
    return `${exam.name} captures the photograph live inside the application form, so there is no photo file and no KB limit to hit.`;
  }
  if (!photo) {
    return `${exam.name} does not list a photograph upload in this notice.`;
  }
  const line = describeTarget(photo, targetFor(photo));
  const live = exam.photoMode === "upload+live" ? " A live photograph is also captured in the form and matched against it." : "";
  return `${exam.name} takes a photograph of ${line}.${live}`;
}

export function signatureSentence(exam) {
  const signature = assetById(exam, "signature");
  if (!signature) return `${exam.name} does not list a signature upload in this notice.`;
  return `The signature is ${describeTarget(signature, targetFor(signature))}.`;
}

export function sourceSentence(exam) {
  const issued = formatIsoDate(exam.source.issued);
  const read = formatIsoDate(SPECS_READ_ON);
  return `Read from ${exam.source.doc}, dated ${issued}, on ${read}.`;
}

export function buildExamSeo(exam) {
  const photo = assetById(exam, "photo");
  const signature = assetById(exam, "signature");
  const issued = formatIsoDate(exam.source.issued);
  const read = formatIsoDate(SPECS_READ_ON);
  const uploadable = (exam.assets || []).map((asset) => asset.label.toLowerCase()).join(", ");

  // Answer first: the opening sentence carries the actual numbers and stands on
  // its own without the H1. Everything after it is context, not the answer.
  const intro = [
    answerFirstSentence(exam),
    `Those figures are read from ${exam.source.doc}, dated ${issued}, checked on ${read}.`,
    `The table below and the resizer on this page are generated from that one record, so the specification shown and the target the tool encodes to cannot disagree.`,
  ].join(" ");

  const useCases = [
    `The ${exam.portal} upload gate rejected a file and the exact KB range is needed.`,
    `A scan is larger than the ceiling ${exam.body} sets and has to come down without changing the pixel size.`,
    `A ${exam.name} form asks for ${uploadable} and each one has a different limit.`,
    `A specification found on a coaching site needs checking against the notification it claims to quote.`,
  ];

  const benefits = [
    [
      "The spec and the tool are the same record",
      `The table above and the resizer preset are generated from one entry, so the ${exam.name} target shown is the target the tool encodes to.`,
    ],
    [
      "Every row is dated",
      `Each figure carries the document it came from (${exam.source.doc}) and the date that document was read (${read}), so a row that goes out of date reads as a dated fact rather than a wrong one.`,
    ],
    [
      "The file never leaves the device",
      "Decoding, resizing and JPEG encoding all happen in the browser through a canvas; nothing is uploaded to a server.",
    ],
    [
      "The size is searched, not guessed",
      "A binary search over JPEG quality finds the highest quality whose encoded size still sits inside the range, then reports the size, the quality and the number of steps it took.",
    ],
  ];

  // Every FAQ below is rendered visibly on the page. The FAQPage JSON-LD is
  // built from this same array, so the schema can never describe an answer the
  // reader cannot see.
  const faqs = [];

  if (exam.photoMode === "live-capture") {
    faqs.push([
      `What is the ${exam.name} photo size in KB?`,
      `There is no KB figure, because there is no photo file. ${exam.photoNote} The only image file you upload is the signature: ${proseSpec(signature)}. Read from ${exam.source.doc} dated ${issued}.`,
    ]);
  } else if (photo) {
    faqs.push([
      `What is the ${exam.name} photo size in KB?`,
      `${proseSpec(photo)}. ${exam.background} ${sourceSentence(exam)}`,
    ]);
    faqs.push([
      `How do I reduce a photo to under ${photo.maxKB} KB for ${exam.name}?`,
      `Keep the pixel size the notice asks for and lower the JPEG quality until the file lands between ${photo.minKB} KB and ${photo.maxKB} KB - that is the range ${exam.body} accepts. The resizer on this page does exactly that: it draws your photo onto a ${describeDimensions(photo, targetFor(photo))} canvas without cropping it, then binary-searches JPEG quality for the highest setting whose file still fits the range. Re-scanning at a lower DPI or fewer colours is the other route the notice itself suggests.`,
    ]);
  }

  if (signature) {
    faqs.push([
      `What is the ${exam.name} signature size in KB?`,
      `${proseSpec(signature)}. ${(signature.notes || [])[0] || ""}`.trim(),
    ]);
  }

  if (exam.photoMode === "upload+live") {
    faqs.push([
      `Does ${exam.name} need a live photo as well as an uploaded one?`,
      `${exam.photoNote} ${sourceSentence(exam)}`,
    ]);
  }

  if (exam.photoAge) {
    faqs.push([
      `Does the ${exam.name} photo have to be recent?`,
      `${exam.photoAge} ${sourceSentence(exam)}`,
    ]);
  }

  faqs.push([
    `Does the ${exam.name} photo need the name and date printed on it?`,
    `${exam.nameDateOnPhoto} ${sourceSentence(exam)}`,
  ]);

  if (exam.aadhaarNote) {
    faqs.push([
      `What happens if my ${exam.name} photo or signature is the wrong size?`,
      exam.aadhaarNote,
    ]);
  }

  faqs.push([
    `Which notification are these ${exam.name} specs from?`,
    `${exam.source.doc}, dated ${issued}. It was opened and read on ${read}.${
      exam.source.confidence === "primary" ? " The figures were read from that document itself." : ""
    }${exam.source.note ? ` ${exam.source.note}` : ""}`.trim(),
  ]);

  const firstAsset = (exam.assets || [])[0];
  const steps = firstAsset
    ? [
        `Pick the file you are fixing: ${exam.name} accepts ${uploadable}.`,
        "Choose the scan or photo from the device. It is decoded in the browser and never uploaded.",
        `The image is drawn onto a white canvas with its aspect ratio kept, so nothing is cropped or stretched. Canvas size: ${describeDimensions(firstAsset, targetFor(firstAsset))}.`,
        `A binary search over JPEG quality finds the highest quality whose encoded file still sits between ${firstAsset.minKB} KB and ${firstAsset.maxKB} KB.`,
        `Check the pass or fail line for each rule, then download the JPEG and upload it at ${exam.portal}.`,
      ]
    : [];

  return { intro, useCases, benefits, faqs, steps };
}
