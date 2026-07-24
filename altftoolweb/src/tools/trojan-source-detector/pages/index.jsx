"use client";

import { ScanSearch } from "lucide-react";

import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import {
  MAX_SOURCE_CHARACTERS,
  buildTrojanSourceReport,
  detectTrojanSource,
} from "../lib/detectTrojanSource.mjs";

const SAMPLE =
  'const account = "trusted";\nconst pаypal = account;\n// The second character in pаypal is Cyrillic.';

function summarize(result) {
  const totalFindings = result.counts.high + result.counts.medium;
  return {
    tone:
      result.level === "high"
        ? "danger"
        : result.level === "review"
          ? "warning"
          : "success",
    statusLabel:
      result.level === "high"
        ? "High-priority Unicode cues found"
        : result.level === "review"
          ? "Invisible-character review needed"
          : "No configured deception cue observed",
    title: "Unicode source review",
    description:
      result.level === "none"
        ? "The focused rules found no bidi control, selected invisible character, or Latin/Cyrillic/Greek identifier mix."
        : "Inspect each location in the original editor and compare visible notation with the underlying code points.",
    metrics: [
      { label: "Characters", value: result.characterCount },
      { label: "Findings", value: totalFindings },
      { label: "Retained", value: result.findings.length },
      { label: "High", value: result.counts.high },
      { label: "Review", value: result.counts.medium },
    ],
    findings: result.findings.map((finding, index) => ({
      id: `${finding.id}-${finding.line}-${finding.column}-${index}`,
      tone: finding.severity === "high" ? "danger" : "warning",
      severity: finding.severity,
      title: finding.title,
      detail: finding.explanation,
      location: `Line ${finding.line}, column ${finding.column}`,
      evidence: finding.evidence,
    })),
    limitations: [
      ...(result.truncated
        ? [
            `The display is truncated to ${result.findings.length.toLocaleString("en-US")} priority-retained findings; severity totals include every observed cue.`,
          ]
        : []),
      "This is a focused heuristic inspection, not a complete implementation of every Unicode security profile.",
      "A clear result does not prove that source code is trustworthy, reviewed, or safe to execute.",
      "The visible-source preview changes control characters into notation; it does not modify the original input.",
    ],
    outputLabel: "Controls made visible",
    outputText: result.visibleSource,
  };
}

export default function TrojanSourceDetector() {
  return (
    <LocalAuditWorkspace
      title="Trojan Source Detector"
      eyebrow="Unicode source review"
      description="Find bidirectional controls, selected invisible characters, and mixed-script identifier cues without parsing or executing source code."
      icon={ScanSearch}
      inputLabel="Source text"
      inputHint="Paste code from any language or choose a local text source file."
      placeholder="Paste source code to inspect its Unicode characters..."
      sample={SAMPLE}
      sampleName="Load Unicode sample"
      accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.rs,.rb,.php,.c,.h,.cpp,.cs,.swift,.kt,.txt,text/plain"
      maxCharacters={MAX_SOURCE_CHARACTERS}
      analyze={({ text }) => detectTrojanSource(text)}
      summarize={summarize}
      buildReport={buildTrojanSourceReport}
      reportName="trojan-source-redacted-report.txt"
      reportMime="text/plain"
    />
  );
}
