"use client";

import { FileSearch } from "lucide-react";

import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import {
  OFFICE_MACRO_LIMITS,
  buildOfficeMacroCountsReport,
  inspectOfficeMacroBytes,
  validateOfficeMacroFile,
} from "../lib/officeMacroInspection.mjs";

function summarize(result) {
  const directCues =
    result.summary.macroPartPaths +
    result.summary.vbaContentTypeCues +
    result.summary.vbaRelationshipCues +
    result.summary.macroSheetParts +
    result.summary.legacyStringCues;
  const capabilityOnly =
    !directCues && result.evidenceLevel === "macro-capable-container-cues-only";
  const findings = [
    ...result.observations.map((observation, index) => ({
      id: `observation-${index}`,
      tone: directCues || capabilityOnly ? "warning" : "neutral",
      severity: directCues || capabilityOnly ? "Review" : "Observation",
      title:
        directCues || capabilityOnly
          ? "Macro-related package cue"
          : "Bounded inspection",
      detail: observation,
    })),
    ...result.warnings.map((warning, index) => ({
      id: `warning-${index}`,
      tone: "warning",
      severity: "Warning",
      title: "Inspection boundary",
      detail: warning,
    })),
  ];

  return {
    tone:
      directCues || capabilityOnly
        ? "warning"
        : result.warnings.length
          ? "warning"
          : "neutral",
    statusLabel: directCues
      ? "Macro-related package cues observed"
      : capabilityOnly
        ? "Macro-capable container cue only"
        : "No selected direct macro cue observed",
    title:
      result.format === "legacy-ole"
        ? "Legacy OLE bounded review"
        : "Office package bounded review",
    description:
      "Macro presence does not establish malicious intent, and a clear bounded result does not prove that a document is macro-free.",
    metrics: [
      { label: "Package entries", value: result.summary.packageEntries },
      { label: "Direct/string cues", value: directCues },
      {
        label: "Relationship cues",
        value: result.summary.vbaRelationshipCues,
      },
      { label: "Warnings", value: result.warnings.length },
    ],
    findings,
    limitations: result.limitations,
  };
}

export default function OfficeMacroInspector() {
  return (
    <LocalAuditWorkspace
      title="Office Macro Inspector"
      eyebrow="Static Office package review"
      description="Inspect local Office containers for VBA part paths, content types, relationships, macro sheets, ActiveX, external links, and bounded legacy string cues."
      privacyNote="Office content stays local. The tool never opens Office, executes VBA, evaluates formulas, follows links, or includes filenames and document values in its report."
      icon={FileSearch}
      inputMode="file"
      inputLabel="Office document"
      inputHint={`Supports bounded OOXML and legacy Office containers up to ${Math.round(OFFICE_MACRO_LIMITS.fileBytes / 1_048_576)} MB.`}
      accept=".doc,.dot,.docx,.docm,.dotx,.dotm,.xls,.xla,.xlsx,.xlsm,.xlsb,.xlam,.xltx,.xltm,.ppt,.pps,.pptx,.pptm,.ppam,.potx,.potm,.ppsx,.ppsm,.sldx,.sldm"
      validateFile={validateOfficeMacroFile}
      analyze={({ bytes, file }) =>
        inspectOfficeMacroBytes(bytes, {
          fileName: file.name,
          fileSize: file.size,
        })
      }
      summarize={summarize}
      buildReport={buildOfficeMacroCountsReport}
      reportName="office-macro-cue-counts-only.json"
    />
  );
}
