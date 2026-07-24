"use client";

import { FileSearch } from "lucide-react";

import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import {
  SIGNATURE_READ_BYTES,
  inspectFileSignature,
} from "../lib/fileSignatures.mjs";

function matchLabel(value) {
  if (value === true) return "Matches";
  if (value === false) return "Mismatch";
  return "Not available";
}

function summarize(result) {
  const mismatch =
    result.extensionMatch === false || result.mimeMatch === false;
  const findings = [];
  if (result.extensionMatch === false) {
    findings.push({
      id: "extension-mismatch",
      tone: "danger",
      severity: "Mismatch",
      title: result.detected
        ? "Extension conflicts with detected signature"
        : "Known extension lacks its expected leading signature",
      detail:
        "Treat the filename as untrusted metadata and verify the source before opening the file.",
      evidence: result.detected
        ? `Detected ${result.detected.name}; extension .${result.extension || "none"}`
        : "",
    });
  }
  if (result.mimeMatch === false) {
    findings.push({
      id: "mime-mismatch",
      tone: "warning",
      severity: "Review",
      title: result.detected
        ? "Browser MIME conflicts with detected signature"
        : "Known browser MIME lacks its expected leading signature",
      detail:
        "Browser-reported MIME can be absent or inaccurate, but a conflict deserves review.",
      evidence: result.browserType || "No browser MIME",
    });
  }

  return {
    tone: mismatch
      ? "danger"
      : result.verdict === "consistent"
        ? "success"
        : "warning",
    statusLabel:
      result.verdict === "consistent"
        ? "Metadata is consistent"
        : result.verdict === "mismatch"
          ? "Metadata mismatch found"
          : result.detected
            ? "Signature detected"
            : "Signature not recognized",
    title: result.detected?.name || "Unknown leading signature",
    description: result.detected
      ? "The result compares bounded leading bytes with filename and browser MIME metadata."
      : mismatch
        ? "The selected signature table did not recognize the leading bytes expected by the supplied extension or MIME metadata."
        : "The selected signature table did not recognize these leading bytes.",
    metrics: [
      { label: "Extension", value: result.extension || "None" },
      { label: "Extension check", value: matchLabel(result.extensionMatch) },
      { label: "MIME check", value: matchLabel(result.mimeMatch) },
      { label: "Bytes read", value: result.bytesRead },
    ],
    findings,
    limitations: [
      `Only the first ${SIGNATURE_READ_BYTES} bytes are read for selected common signatures.`,
      "A matching signature does not prove that the complete file is valid, safe, unmodified, or malware-free.",
      "Container formats such as ZIP can represent many different document and package types.",
    ],
    outputLabel: "Leading signature bytes",
    outputText: result.signatureHex || "No bytes available",
  };
}

function buildReport(result) {
  return {
    tool: "File Signature Verifier",
    verdict: result.verdict,
    detectedType: result.detected?.name || null,
    expectedExtensions: result.detected?.extensions || [],
    expectedMimeTypes: result.detected?.mimes || [],
    selectedExtension: result.extension || null,
    browserMimeType: result.browserType || null,
    extensionMatch: result.extensionMatch,
    mimeMatch: result.mimeMatch,
    bytesRead: result.bytesRead,
    signatureHex: result.signatureHex,
  };
}

export default function FileSignatureVerifier() {
  return (
    <LocalAuditWorkspace
      title="File Signature Verifier"
      eyebrow="Magic-byte inspection"
      description="Compare a file's leading signature bytes with its extension and browser-reported MIME type before deciding how to handle it."
      privacyNote={`Only up to ${SIGNATURE_READ_BYTES} leading bytes are inspected locally. The complete file is never uploaded or opened.`}
      icon={FileSearch}
      inputMode="file"
      inputLabel="Local file"
      inputHint="Choose any file. Recognition covers common images, documents, archives, executables, databases, audio, and video containers."
      accept="*/*"
      byteReadLimit={SIGNATURE_READ_BYTES}
      analyze={({ bytes, file }) =>
        inspectFileSignature(bytes.slice(0, SIGNATURE_READ_BYTES), {
          fileName: file.name,
          browserType: file.type,
        })
      }
      summarize={summarize}
      buildReport={buildReport}
      reportName="file-signature-review.json"
    />
  );
}
