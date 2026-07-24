"use client";

import { ShieldCheck } from "lucide-react";

import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import {
  IAM_POLICY_LIMITS,
  analyzeIamPolicyText,
  buildIamPolicyReport,
} from "../lib/iamPolicyAudit.mjs";

const SAMPLE = JSON.stringify(
  {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["s3:GetObject", "s3:ListBucket"],
        Resource: [
          "arn:aws:s3:::example-assets",
          "arn:aws:s3:::example-assets/*",
        ],
        Condition: {
          StringEquals: { "aws:PrincipalOrgID": "o-example" },
        },
      },
    ],
  },
  null,
  2,
);

function toneForAssessment(level) {
  if (level === "action") return "danger";
  if (level === "review" || level === "invalid") return "warning";
  if (level === "clear") return "success";
  return "neutral";
}

function summarize(result) {
  return {
    tone: toneForAssessment(result.assessment.level),
    statusLabel: result.assessment.label,
    title: "Policy structure review",
    description: result.assessment.description,
    metrics: [
      { label: "Statements", value: result.stats.statementsInspected },
      { label: "High", value: result.counts.high },
      { label: "Medium", value: result.counts.medium },
      { label: "Review", value: result.counts.review },
    ],
    findings: result.findings.map((finding, index) => ({
      id: `${finding.code}-${finding.statement || index}`,
      tone: finding.severity === "high" ? "danger" : "warning",
      severity: finding.severity,
      title: finding.title,
      detail: finding.detail,
      location: finding.statement
        ? `Statement ${finding.statement}`
        : "Policy document",
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

export default function AwsIamPolicyValidator() {
  return (
    <LocalAuditWorkspace
      title="AWS IAM Policy Validator"
      eyebrow="Least-privilege review"
      description="Review IAM policy JSON for malformed statements, broad Allow selectors, PassRole, privilege-management actions, and missing contextual conditions."
      privacyNote="Policy JSON is parsed and reviewed only in this tab. The downloadable report contains counts and rule codes, not ARNs or policy values."
      icon={ShieldCheck}
      inputLabel="IAM policy JSON"
      inputHint="Paste an identity or resource policy. Service-specific authorization semantics still require AWS tooling and human review."
      placeholder={'{\n  "Version": "2012-10-17",\n  "Statement": []\n}'}
      sample={SAMPLE}
      sampleName="Load policy sample"
      accept=".json,application/json,text/plain"
      maxCharacters={IAM_POLICY_LIMITS.maxCharacters}
      analyze={({ text }) => analyzeIamPolicyText(text)}
      summarize={summarize}
      buildReport={buildIamPolicyReport}
      reportName="aws-iam-policy-counts-only.json"
    />
  );
}
