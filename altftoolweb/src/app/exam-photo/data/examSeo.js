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

  const intro = [
    `This page states the exact photograph and signature upload specification for ${exam.name} (${exam.fullName}) and resizes a file to that target in the browser.`,
    photoSentence(exam),
    signatureSentence(exam),
    `Both the table and the resizer read the same record, taken from ${exam.source.doc} dated ${issued} and read on ${read}.`,
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

  const faqs = [];

  if (exam.photoMode === "live-capture") {
    faqs.push([
      `What is the ${exam.name} photo size in KB?`,
      `There is no KB figure. ${exam.photoNote} The only image file uploaded is the signature: ${describeTarget(signature, targetFor(signature))}. Read from ${exam.source.doc} dated ${issued}.`,
    ]);
  } else if (photo) {
    faqs.push([
      `What is the ${exam.name} photo size and dimension?`,
      `${describeTarget(photo, targetFor(photo))}. ${exam.background} ${sourceSentence(exam)}`,
    ]);
  }

  if (signature) {
    faqs.push([
      `What is the ${exam.name} signature size in KB?`,
      `${describeTarget(signature, targetFor(signature))}. ${(signature.notes || [])[0] || ""}`.trim(),
    ]);
  }

  faqs.push([
    `Does the ${exam.name} photo need the name and date printed on it?`,
    `${exam.nameDateOnPhoto} ${sourceSentence(exam)}`,
  ]);

  faqs.push([
    `Which notification are these ${exam.name} specs from?`,
    `${exam.source.doc}, dated ${issued}. It was opened and read on ${read}.${
      exam.source.confidence === "primary"
        ? " The figures were extracted from that document's own text."
        : ` ${exam.source.note || ""}`
    }`.trim(),
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
