"use client";

import { FileLock2 } from "lucide-react";

import LocalAuditWorkspace from "../../_shared/security/LocalAuditWorkspace";
import { MAX_HAR_CHARACTERS, sanitizeHar } from "../lib/sanitizeHar.mjs";

const SAMPLE = JSON.stringify(
  {
    log: {
      version: "1.2",
      creator: { name: "Browser", version: "1" },
      entries: [
        {
          request: {
            method: "GET",
            url: "https://example.com/api?token=sample-secret&page=2",
            headers: [
              { name: "Authorization", value: "Bearer sample-secret" },
              { name: "Accept", value: "application/json" },
            ],
            cookies: [{ name: "session", value: "sample-secret" }],
            queryString: [
              { name: "token", value: "sample-secret" },
              { name: "page", value: "2" },
            ],
          },
          response: {
            headers: [{ name: "Set-Cookie", value: "session=sample-secret" }],
            cookies: [{ name: "session", value: "sample-secret" }],
            content: {
              mimeType: "application/json",
              text: '{"private":"sample-secret"}',
            },
          },
        },
      ],
    },
  },
  null,
  2,
);

const OPTIONS = [
  {
    key: "removeSensitiveHeaders",
    label: "Sensitive headers",
    description: "Remove authorization, cookie, API-key, and related headers.",
  },
  {
    key: "removeCookies",
    label: "Cookies",
    description: "Remove request and response cookie collections.",
  },
  {
    key: "removeSensitiveQuery",
    label: "Sensitive URL values",
    description:
      "Remove selected token, key, password, session, URL user-info, and fragment parameters.",
  },
  {
    key: "removeRequestBodies",
    label: "Request bodies",
    description: "Remove request text and form parameter values.",
  },
  {
    key: "removeResponseBodies",
    label: "Response bodies",
    description: "Remove response content text and encoding metadata.",
  },
];

function summarize(result) {
  const removed = Object.entries(result.summary)
    .filter(([key]) => !["entries", "protectionsEnabled"].includes(key))
    .reduce((total, [, count]) => total + count, 0);
  const hasProtection = result.summary.protectionsEnabled > 0;
  const hasAllProtections = result.summary.protectionsEnabled === OPTIONS.length;
  return {
    tone: hasAllProtections ? "success" : "warning",
    statusLabel: hasAllProtections
      ? "Sanitized copy is ready"
      : hasProtection
        ? "Partial sanitization selected"
        : "No removal protection selected",
    title: "HAR privacy summary",
    description:
      hasAllProtections
        ? "Review the output before sharing it. Custom application fields and sensitive values outside the selected rules may remain."
        : hasProtection
          ? "Some sensitive-data categories were intentionally retained. Treat the output as partial and review every disabled protection before sharing."
          : "The output is only a copy of the input. Enable the removal rules before treating it as sanitized.",
    metrics: [
      { label: "Entries", value: result.summary.entries },
      { label: "Headers removed", value: result.summary.headersRemoved },
      { label: "Cookies removed", value: result.summary.cookiesRemoved },
      { label: "URL secrets removed", value: result.summary.urlSecretsRemoved },
      { label: "Total removals", value: removed },
    ],
    findings: [],
    limitations: [
      ...(!hasProtection
        ? [
            "No sanitization rule was enabled, so this output must not be treated as share-safe.",
          ]
        : !hasAllProtections
          ? [
              "One or more sanitization categories are disabled, so credentials or payload data can remain by design.",
            ]
          : []),
      "The sanitizer works from a copy and does not modify the original local HAR file.",
      "Rule-based removal cannot identify every custom credential, personal-data field, path, hostname, or payload.",
      "Always inspect the sanitized output before sending it to another person or service.",
    ],
    outputLabel: "Sanitized HAR preview",
    outputText: result.json,
  };
}

export default function HarPrivacySanitizer() {
  return (
    <LocalAuditWorkspace
      title="HAR Privacy Sanitizer"
      eyebrow="Share-safe network diagnostics"
      description="Create a local sanitized HAR copy by removing selected sensitive headers, cookies, query parameters, and request or response bodies."
      privacyNote="The original HAR is never uploaded or changed. Only the sanitized copy can be downloaded from this tab."
      icon={FileLock2}
      inputLabel="HAR JSON"
      inputHint="Paste HAR JSON or choose a .har file, then confirm each removal option before sanitizing."
      placeholder='{"log":{"version":"1.2","entries":[]}}'
      sample={SAMPLE}
      sampleName="Load HAR sample"
      accept=".har,.json,application/json"
      maxCharacters={MAX_HAR_CHARACTERS}
      maxTextFileBytes={MAX_HAR_CHARACTERS}
      options={OPTIONS}
      analyze={({ text, options }) => sanitizeHar(text, options)}
      summarize={summarize}
      buildReport={(result) => result.json}
      reportName="sanitized-network-log.har"
      reportMime="application/json"
    />
  );
}
