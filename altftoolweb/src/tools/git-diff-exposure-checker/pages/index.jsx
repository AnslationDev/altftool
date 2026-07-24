"use client";

import { GitCompareArrows } from "lucide-react";

import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import {
  GIT_DIFF_LIMITS,
  buildGitDiffExposureReport,
  inspectUnifiedDiff,
} from "../lib/gitDiffExposure.mjs";

const SAMPLE = `diff --git a/src/config.js b/src/config.js
index 1111111..2222222 100644
--- a/src/config.js
+++ b/src/config.js
@@ -1,2 +1,3 @@
 export const mode = "production";
+export const supportEmail = "support@example.com";
+export const timeoutMs = 5000;`;

function summarize(result) {
  const level = result.assessment.level;
  return {
    tone:
      level === "action"
        ? "danger"
        : level === "review" || level === "invalid"
          ? "warning"
          : "success",
    statusLabel: result.assessment.label,
    title: "Added-line exposure review",
    description: result.assessment.description,
    metrics: [
      { label: "Files", value: result.stats.filesInspected },
      { label: "Added lines", value: result.stats.addedLinesInspected },
      { label: "High", value: result.counts.high },
      {
        label: "Review cues",
        value: result.counts.medium + result.counts.review,
      },
    ],
    findings: result.findings.map((finding, index) => ({
      id: `${finding.code}-${finding.file || 0}-${finding.line || index}`,
      tone: finding.severity === "high" ? "danger" : "warning",
      severity: finding.severity,
      title: finding.label || finding.title || finding.code,
      detail:
        finding.severity === "high"
          ? "A redacted credential-like pattern appears in an added line. Verify and rotate any real exposed value."
          : "Review this redacted pattern before the change is shared or committed.",
      location: [
        finding.file ? `File ${finding.file}` : "",
        finding.line ? `line ${finding.line}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      evidence: finding.evidence,
    })),
    limitations: [
      ...(result.truncated
        ? [
            `The display is truncated to ${result.findings.length.toLocaleString("en-US")} priority-retained findings; severity totals and the exported rule counts include every observed cue.`,
          ]
        : []),
      ...result.limitations,
    ],
  };
}

export default function GitDiffExposureChecker() {
  return (
    <LocalAuditWorkspace
      title="Git Diff Exposure Checker"
      eyebrow="Pre-commit privacy review"
      description="Inspect only added lines in a unified diff for credential, private-key, personal-data, sensitive-filename, and unsupported binary-patch cues."
      privacyNote="Diff text stays local. Findings redact matched values, and the downloadable report includes counts and rule codes only."
      icon={GitCompareArrows}
      inputLabel="Unified diff"
      inputHint="Paste git diff or a patch file. Removed lines are intentionally excluded from credential matching."
      placeholder={
        "diff --git a/file.js b/file.js\n--- a/file.js\n+++ b/file.js\n@@ -1 +1 @@\n-old\n+new"
      }
      sample={SAMPLE}
      sampleName="Load diff sample"
      accept=".diff,.patch,text/plain"
      maxCharacters={GIT_DIFF_LIMITS.maxCharacters}
      analyze={({ text }) => inspectUnifiedDiff(text)}
      summarize={summarize}
      buildReport={buildGitDiffExposureReport}
      reportName="git-diff-exposure-counts-only.json"
    />
  );
}
