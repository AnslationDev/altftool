"use client";

import JSZip from "jszip";
import { ShieldAlert } from "lucide-react";

import { readBoundedZipText } from "@/platform/files/readBoundedZipText.mjs";
import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import { preflightZipCentralDirectory } from "../../archive-safety-inspector/lib/zipCentralDirectory.mjs";
import {
  MAX_SECRET_SCAN_CHARACTERS,
  buildSecretScanReport,
  mergeSecretScanResults,
  scanSecrets,
} from "../lib/scanSecrets.mjs";
import {
  extensionOfTextSource,
  isSupportedSecretTextName,
} from "../lib/textSourceNames.mjs";

const MAX_ARCHIVE_BYTES = 10 * 1_024 * 1_024;
const MAX_ARCHIVE_FILES = 30;
const MAX_ARCHIVE_EXPANDED_BYTES = 10 * 1_024 * 1_024;
const SAMPLE = `DATABASE_URL=postgres://localhost/example
API_KEY=placeholder
LOG_LEVEL=info
# Try a real provider token pattern locally to verify detection.`;

function validateFile(file) {
  if (!file?.size) return { ok: false, error: "Choose a non-empty file." };
  if (file.size > MAX_ARCHIVE_BYTES) {
    return { ok: false, error: "Choose a source file or ZIP up to 10 MB." };
  }
  const extension = extensionOfTextSource(file.name);
  if (extension !== "zip" && file.size > MAX_SECRET_SCAN_CHARACTERS) {
    return {
      ok: false,
      error: `Choose a text source no larger than ${MAX_SECRET_SCAN_CHARACTERS.toLocaleString("en-US")} bytes.`,
    };
  }
  if (extension !== "zip" && !isSupportedSecretTextName(file.name)) {
    return {
      ok: false,
      error: "Choose a text-based source, configuration, log, or ZIP file.",
    };
  }
  return { ok: true };
}

async function scanArchive(bytes) {
  const preflight = preflightZipCentralDirectory(bytes, {
    maxFileBytes: MAX_ARCHIVE_BYTES,
    maxEntries: 100,
    maxCentralDirectoryBytes: 2 * 1_024 * 1_024,
    maxTotalExpandedBytes: MAX_ARCHIVE_EXPANDED_BYTES,
    maxSingleExpandedBytes: 2 * 1_024 * 1_024,
  });
  if (!preflight.ok) throw new Error(preflight.error);
  if (!preflight.expansionAllowed) {
    throw new Error(
      "The ZIP was not opened because its metadata declares encryption, unsupported compression, or an expansion-bound violation.",
    );
  }

  const candidates = preflight.entries.filter(
    (entry) =>
      !entry.directory &&
      isSupportedSecretTextName(entry.name) &&
      entry.uncompressedSize <= 2 * 1_024 * 1_024,
  );
  if (!candidates.length) {
    throw new Error("No supported bounded text source was found in the ZIP.");
  }
  if (candidates.length > MAX_ARCHIVE_FILES) {
    throw new Error(
      `The ZIP contains more than ${MAX_ARCHIVE_FILES} supported text files, so a complete bounded scan cannot be produced.`,
    );
  }

  const zip = await JSZip.loadAsync(bytes, {
    checkCRC32: false,
    createFolders: false,
  });
  const scans = [];
  let remainingExpandedBytes = MAX_ARCHIVE_EXPANDED_BYTES;
  for (const [index, entry] of candidates.entries()) {
    const zipEntry = zip.file(entry.name);
    if (!zipEntry) {
      throw new Error(
        "The ZIP filename mapping changed during expansion, so no complete result can be produced.",
      );
    }
    if (remainingExpandedBytes <= 0) {
      throw new Error(
        "Expanded archive text exceeds the 10 MB combined runtime limit.",
      );
    }
    const read = await readBoundedZipText(zipEntry, {
      maximumBytes: Math.min(2 * 1_024 * 1_024, remainingExpandedBytes),
      label: `Archive text file ${index + 1}`,
    });
    remainingExpandedBytes -= read.inflatedBytes;
    scans.push(
      scanSecrets(read.text, {
        sourceName: `Archive text file ${index + 1}`,
      }),
    );
  }
  if (scans.length !== candidates.length) {
    throw new Error(
      "Not every selected ZIP source could be scanned completely.",
    );
  }
  return mergeSecretScanResults(scans);
}

async function analyze({ text, file, bytes }) {
  if (!file) {
    return mergeSecretScanResults([
      scanSecrets(text, { sourceName: "Pasted text" }),
    ]);
  }
  if (extensionOfTextSource(file.name) === "zip") return scanArchive(bytes);
  const decoded = new TextDecoder().decode(bytes);
  return mergeSecretScanResults([
    scanSecrets(decoded, { sourceName: "Local text file" }),
  ]);
}

function summarize(result) {
  const totalFindings =
    result.counts.critical + result.counts.high + result.counts.medium;
  return {
    tone:
      result.level === "critical" || result.level === "high"
        ? "danger"
        : result.level === "review"
          ? "warning"
          : "success",
    statusLabel:
      result.level === "critical"
        ? "Critical credential cues found"
        : result.level === "high"
          ? "High-priority credential cues found"
          : result.level === "review"
            ? "Potential secret cues need review"
            : "No configured credential cue observed",
    title: "Redacted secret scan",
    description:
      result.level === "none"
        ? "The selected patterns found no credential-like match. A clear result does not prove the source is secret-free."
        : "Matched values are omitted. Revoke or rotate any real exposed credential through its provider.",
    metrics: [
      { label: "Sources", value: result.scannedSources },
      { label: "Characters", value: result.scannedCharacters },
      { label: "Findings", value: totalFindings },
      { label: "Retained", value: result.findings.length },
      { label: "Critical", value: result.counts.critical },
      {
        label: "High + review",
        value: result.counts.high + result.counts.medium,
      },
    ],
    findings: result.findings.map((finding, index) => ({
      id: `${finding.ruleId}-${finding.sourceName}-${finding.line}-${index}`,
      tone:
        finding.severity === "critical" || finding.severity === "high"
          ? "danger"
          : "warning",
      severity: finding.severity,
      title: finding.title,
      detail: finding.advice,
      location: `${finding.sourceName} · line ${finding.line}, column ${finding.column}`,
      evidence: finding.evidence,
    })),
    limitations: [
      ...(result.truncated
        ? [
            `The display is truncated to ${result.findings.length.toLocaleString("en-US")} priority-retained findings; severity totals include every configured-pattern match.`,
          ]
        : []),
      "Heuristic matches can be false positives, and a clear result does not prove that a source is secret-free.",
      "ZIP inspection is bounded to 30 supported text entries and blocks encrypted, unsupported, or expansion-heavy packages.",
      "Matched values are redacted from findings and reports; source content remains only in this browser tab.",
    ],
  };
}

export default function SecretCredentialLeakScanner() {
  return (
    <LocalAuditWorkspace
      title="Secret & Credential Leak Scanner"
      eyebrow="Local credential hygiene"
      description="Scan pasted text, a local source or log file, or a bounded ZIP archive for provider tokens, private keys, bearer credentials, and generic secret assignments."
      privacyNote="Source values stay local and are redacted from findings. Bounded ZIP entries are treated as inert text and never executed."
      icon={ShieldAlert}
      inputLabel="Text, source file, log, or ZIP"
      inputHint="Paste text directly or choose one supported local file. ZIP expansion is blocked when metadata exceeds strict limits."
      placeholder="Paste source, configuration, or log text..."
      sample={SAMPLE}
      sampleName="Load safe sample"
      accept=".txt,.log,.env,.json,.js,.jsx,.ts,.tsx,.mjs,.py,.java,.go,.rs,.rb,.php,.sh,.sql,.yaml,.yml,.toml,.ini,.conf,.config,.properties,.xml,.html,.css,.c,.h,.cpp,.cs,.kt,.md,.zip,text/plain,application/zip"
      maxCharacters={MAX_SECRET_SCAN_CHARACTERS}
      maxTextFileBytes={MAX_ARCHIVE_BYTES}
      deferFileRead
      readSelectedFileAsBytes
      validateFile={validateFile}
      analyze={analyze}
      summarize={summarize}
      buildReport={buildSecretScanReport}
      reportName="secret-scan-redacted-report.txt"
      reportMime="text/plain"
    />
  );
}
