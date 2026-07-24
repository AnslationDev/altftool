"use client";

import { Container } from "lucide-react";

import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import {
  DOCKERFILE_LIMITS,
  analyzeDockerfile,
  buildDockerfileAuditReport,
} from "../lib/dockerfileAudit.mjs";

const SAMPLE = `FROM node:22.4.1@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src

FROM gcr.io/distroless/nodejs22-debian12@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
COPY --from=build /app /app
USER 10001
HEALTHCHECK CMD ["/nodejs/bin/node", "/app/healthcheck.js"]
CMD ["/app/server.js"]`;

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
    title: "Dockerfile review",
    description: result.assessment.description,
    metrics: [
      { label: "Stages", value: result.stats.stages },
      { label: "Instructions", value: result.stats.logicalInstructions },
      { label: "High", value: result.counts.high },
      {
        label: "Review cues",
        value: result.counts.medium + result.counts.review,
      },
    ],
    findings: result.findings.map((finding, index) => ({
      id: `${finding.code}-${finding.line || index}`,
      tone: finding.severity === "high" ? "danger" : "warning",
      severity: finding.severity,
      title: finding.title,
      detail: finding.detail,
      location: [
        finding.line ? `Line ${finding.line}` : "",
        finding.stage ? `stage ${finding.stage}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
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

export default function DockerfileSecurityLinter() {
  return (
    <LocalAuditWorkspace
      title="Dockerfile Security Linter"
      eyebrow="Container build review"
      description="Inspect Dockerfile text for risky shell pipelines, floating images, embedded secret cues, broad context copies, root runtime signals, and missing health checks."
      icon={Container}
      inputLabel="Dockerfile source"
      inputHint="The linter parses text only. It never builds an image, pulls a base, or executes an instruction."
      placeholder={
        'FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nCMD ["node", "server.js"]'
      }
      sample={SAMPLE}
      sampleName="Load hardened sample"
      accept=".dockerfile,Dockerfile,text/plain"
      maxCharacters={DOCKERFILE_LIMITS.maxCharacters}
      analyze={({ text }) => analyzeDockerfile(text)}
      summarize={summarize}
      buildReport={buildDockerfileAuditReport}
      reportName="dockerfile-audit-counts-only.json"
    />
  );
}
