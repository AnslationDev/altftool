"use client";

import { PackageSearch } from "lucide-react";

import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import {
  ZIP_INSPECTION_LIMITS,
  buildArchiveCountsReport,
  inspectArchiveBytes,
  validateArchiveFile,
} from "../lib/zipCentralDirectory.mjs";

const COUNT_LABELS = {
  pathTraversal: "Path traversal names",
  absolutePaths: "Absolute paths",
  controlCharacterNames: "Control characters in names",
  symlinks: "Symbolic links",
  suspiciousExtensions: "Suspicious extensions",
  doubleExtensions: "Double extensions",
  encryptedEntries: "Encrypted entries",
  unsupportedCompression: "Unsupported compression",
  invalidLocalHeaders: "Invalid local-header pointers",
  oversizedEntries: "Oversized entries",
  highCompressionRatio: "High compression ratios",
};

function summarize(result) {
  const markers = result.summary.reviewMarkerCount;
  const blocked = !result.expansionAllowed;
  const findings = Object.entries(result.counts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      id: key,
      tone: [
        "pathTraversal",
        "absolutePaths",
        "encryptedEntries",
        "invalidLocalHeaders",
        "oversizedEntries",
        "highCompressionRatio",
      ].includes(key)
        ? "danger"
        : "warning",
      severity: blocked ? "Action" : "Review",
      title: COUNT_LABELS[key] || key,
      detail: `${count.toLocaleString("en-US")} archive entr${count === 1 ? "y matches" : "ies match"} this metadata cue.`,
    }));

  return {
    tone: blocked ? "danger" : markers ? "warning" : "neutral",
    statusLabel: blocked
      ? "Follow-on expansion should remain blocked"
      : markers
        ? "Archive metadata needs review"
        : "No configured metadata cue observed",
    title: "ZIP central-directory preflight",
    description:
      "This result uses declared archive metadata only. It does not extract or inspect file contents.",
    metrics: [
      { label: "Entries", value: result.summary.entryCount },
      { label: "Files", value: result.summary.fileEntries },
      { label: "Review markers", value: markers },
      {
        label: "Declared expanded",
        value: `${(result.summary.totalDeclaredExpandedBytes / 1_048_576).toFixed(1)} MB`,
      },
    ],
    findings,
    limitations: result.limitations,
  };
}

export default function ArchiveSafetyInspector() {
  return (
    <LocalAuditWorkspace
      title="Archive Safety Inspector"
      eyebrow="ZIP metadata preflight"
      description="Review bounded central-directory metadata for risky paths, links, encryption, compression pressure, suspicious extensions, and misleading double extensions."
      privacyNote="The archive stays in memory. Entry payloads are never extracted, opened, executed, uploaded, or included in the counts-only report."
      icon={PackageSearch}
      inputMode="file"
      inputLabel="ZIP-compatible archive"
      inputHint={`Supports ZIP and common ZIP-based packages up to ${Math.round(ZIP_INSPECTION_LIMITS.fileBytes / 1_048_576)} MB.`}
      accept=".zip,.jar,.apk,.epub,.whl,.docx,.docm,.xlsx,.xlsm,.xlam,.pptx,.pptm,.odt,.ods,.odp"
      validateFile={validateArchiveFile}
      analyze={({ bytes, file }) =>
        inspectArchiveBytes(bytes, {
          fileName: file.name,
          fileSize: file.size,
        })
      }
      summarize={summarize}
      buildReport={buildArchiveCountsReport}
      reportName="archive-central-directory-counts-only.json"
    />
  );
}
