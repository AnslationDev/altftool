/**
 * AI Incident Response Checklist — generates a tailored response checklist for
 * incidents involving AI system output (harmful content, leaked data, prompt
 * injection, or leaked system artefacts).
 *
 * The phase structure follows the NIST SP 800-61 (Computer Security Incident
 * Handling Guide) lifecycle: Preparation; Detection & Analysis; Containment,
 * Eradication & Recovery; and Post-Incident Activity. AI-specific items draw
 * on the NIST AI Risk Management Framework's govern/measure/manage functions
 * and the OWASP Top 10 for LLM Applications (prompt injection, sensitive
 * information disclosure, system prompt leakage).
 */

/**
 * Article 33 GDPR: a personal data breach must be notified to the supervisory
 * authority without undue delay and, where feasible, within 72 hours of the
 * controller becoming aware of it.
 */
export const GDPR_BREACH_NOTIFICATION_HOURS = 72;

export const INCIDENT_TYPE_OPTIONS = [
  {
    id: "harmful-output",
    label: "Harmful or dangerous output shown to users",
    analysis: [
      "Capture the exact prompt, output, model version, system prompt version and safety-filter configuration involved.",
      "Determine whether the output is reproducible or was a low-probability generation.",
      "Classify the harm type (dangerous instructions, harassment, defamation, self-harm content, biased decision) against your content policy.",
    ],
    containment: [
      "Add the failing pattern to the moderation/blocklist layer or tighten the safety filter threshold for the affected route.",
      "If the harm is severe or reproducible, disable the affected feature or fall back to a restricted mode while the fix is validated.",
      "Re-run the failing prompt plus a regression suite of adjacent prompts to confirm the block holds.",
    ],
  },
  {
    id: "data-leak",
    label: "Sensitive or personal data leaked in output",
    analysis: [
      "Identify what data was exposed, whose it is, and whether the source was training data, RAG context, conversation memory or a connected tool.",
      "Establish who saw the leaked output (single user, tenant, public) and pull access logs for the exposure window.",
      "Determine whether the leak is repeatable — try sanitised reproductions before shutting anything down.",
    ],
    containment: [
      "Cut the leaking data source: revoke the retriever's access to the affected store, scrub the context index, or disable the offending tool.",
      "Purge leaked content from logs, caches, conversation history and any analytics pipelines that stored the output.",
      "Rotate any credentials, keys or tokens that appeared in the leaked output — treat them as compromised.",
    ],
  },
  {
    id: "prompt-injection",
    label: "Prompt injection / jailbreak abuse",
    analysis: [
      "Preserve the injected content (message, document, web page) and map which untrusted channel it entered through.",
      "Identify every tool, API or data source the compromised session could reach and what actions it actually took.",
      "Check logs for the same injection pattern across other sessions and tenants — injections are rarely one-offs.",
    ],
    containment: [
      "Disable or scope down the tools/actions reachable from the injected context until input isolation is fixed.",
      "Add the injection pattern to detection rules, but assume variants exist — fix the trust boundary, not just the string.",
      "Invalidate sessions and undo any state changes (sent messages, created records, permissions) the injected instructions caused.",
    ],
  },
  {
    id: "artifact-leak",
    label: "System prompt, weights or eval data leaked",
    analysis: [
      "Confirm exactly which artefact leaked (system prompt text, fine-tuned weights, eval sets, guardrail rules) and from where.",
      "Assess what the artefact enables an attacker to do: bypass guardrails, clone behaviour, or extract embedded secrets.",
      "Search the leaked artefact for embedded credentials, internal URLs, personal data or customer names.",
    ],
    containment: [
      "Rotate every secret referenced in the leaked artefact immediately.",
      "Rewrite the system prompt or guardrails on the assumption the old ones are public; do not rely on their secrecy again.",
      "Issue takedown requests where the artefact is hosted, and monitor for re-uploads.",
    ],
  },
];

export const SEVERITY_OPTIONS = [
  {
    id: "sev1",
    label: "SEV1 — active, widespread harm or exposure",
    escalation: [
      "Declare a formal incident now: assign an incident commander, open a dedicated channel, and start a timestamped log.",
      "Notify executive sponsor and legal counsel immediately — before external statements of any kind.",
    ],
  },
  {
    id: "sev2",
    label: "SEV2 — limited scope, contained or low harm",
    escalation: [
      "Assign an owner and a scribe; track the incident in your normal incident tooling with AI-incident tags.",
    ],
  },
  {
    id: "sev3",
    label: "SEV3 — near-miss caught before user exposure",
    escalation: [
      "Log as a near-miss with the same evidence rigour — near-misses are the cheapest learning your programme gets.",
    ],
  },
];

export const PHASE_ORDER = [
  { id: "preparation", label: "Preparation (verify these exist — gaps become findings)" },
  { id: "detection", label: "Detection & Analysis" },
  { id: "containment", label: "Containment, Eradication & Recovery" },
  { id: "post-incident", label: "Post-Incident Activity" },
];

const PREPARATION_BASE = [
  "An inventory exists of every AI feature, its model/version, system prompts and connected tools.",
  "Prompts, outputs and tool calls are logged with retention long enough to investigate (30+ days is a common floor).",
  "A kill switch or feature flag can disable each AI feature without a full deploy.",
  "An escalation path with named owners exists for AI incidents, including legal/privacy contacts.",
];

const DETECTION_BASE = [
  "Freeze and preserve evidence first: conversation logs, model/config versions, filter settings and relevant traffic captures.",
  "Establish the timeline: first occurrence, detection time, and the window of user exposure.",
  "Estimate blast radius: how many users, tenants or records are affected.",
];

const POST_INCIDENT_BASE = [
  "Hold a blameless post-incident review within two weeks; record root cause across model, prompts, filters and process.",
  "Convert the failing case(s) into a permanent regression test in your evaluation suite.",
  "Update the risk register and re-score the affected use case; feed findings back into vendor or model selection.",
  "Track remediation actions to closure with owners and dates.",
];

/**
 * Build the tailored checklist.
 * @returns {object} { phases: [{id,label,items:[{id,text}]}], totalItems, ... } or { error }.
 */
export function buildIncidentChecklist({
  incidentTypeId,
  severityId,
  userFacing = true,
  piiInvolved = false,
  thirdPartyModel = false,
}) {
  const incidentType = INCIDENT_TYPE_OPTIONS.find((t) => t.id === incidentTypeId);
  if (!incidentType) {
    return { error: "Choose the type of AI incident you are responding to." };
  }
  const severity = SEVERITY_OPTIONS.find((s) => s.id === severityId);
  if (!severity) {
    return { error: "Choose a severity level so the checklist can scale its escalation steps." };
  }

  // Item ids are derived from what the item *is* (its source and position
  // within that fixed source), not from a running counter over the merged
  // list. That keeps an item's id — and therefore its checked state — stable
  // across unrelated form changes: toggling `piiInvolved` only adds/removes
  // the `pii-*` items instead of renumbering every item that happens to sit
  // after it.
  const withIds = (prefix, texts) => texts.map((text, index) => ({ id: `${prefix}-${index}`, text }));

  const detection = [
    ...withIds(`sev-${severityId}-esc`, severity.escalation),
    ...withIds("det-base", DETECTION_BASE),
    ...withIds(`${incidentTypeId}-analysis`, incidentType.analysis),
  ];
  const containment = [...withIds(`${incidentTypeId}-containment`, incidentType.containment)];
  const postIncident = [...withIds("post-base", POST_INCIDENT_BASE)];

  if (userFacing) {
    containment.push({
      id: "userfacing-comms",
      text: "Prepare user-facing communication: what happened, what you did, and what users should do — reviewed by legal before sending.",
    });
  }
  if (piiInvolved) {
    detection.push({
      id: "pii-detection",
      text: "Treat this as a potential personal data breach: involve your DPO/privacy lead now and start the breach assessment record.",
    });
    containment.push({
      id: "pii-containment",
      text: `Assess notification duties: under GDPR Article 33, notifiable breaches must reach the supervisory authority within ${GDPR_BREACH_NOTIFICATION_HOURS} hours of awareness; other regimes (US state laws, sector rules) have their own clocks.`,
    });
  }
  if (thirdPartyModel) {
    detection.push({
      id: "vendor-detection",
      text: "Notify the model/API vendor through their security contact; request their logs for the affected window and any known-issue advisories.",
    });
    postIncident.push({
      id: "vendor-post",
      text: "Review the vendor contract for incident-notification and liability clauses; log a formal vendor issue if their control failed.",
    });
  }

  const phaseItems = {
    preparation: withIds("prep", PREPARATION_BASE),
    detection,
    containment,
    "post-incident": postIncident,
  };

  let totalItems = 0;
  const phases = PHASE_ORDER.map((phase) => {
    const items = phaseItems[phase.id];
    totalItems += items.length;
    return { id: phase.id, label: phase.label, items };
  });

  return {
    phases,
    totalItems,
    incidentTypeLabel: incidentType.label,
    severityLabel: severity.label,
  };
}

/** Percentage of items done, guarded against divide-by-zero. */
export function computeProgress({ total, done }) {
  const t = Number(total);
  const d = Number(done);
  if (!Number.isFinite(t) || t <= 0) return 0;
  if (!Number.isFinite(d) || d <= 0) return 0;
  return Math.min(100, Math.round((d / t) * 100));
}

/** Render the checklist as copy-ready Markdown, marking done items. */
export function checklistToMarkdown(checklist, doneIds = []) {
  if (!checklist || !Array.isArray(checklist.phases)) return "";
  const done = new Set(doneIds);
  const lines = [
    `# AI incident response checklist`,
    `Incident type: ${checklist.incidentTypeLabel}`,
    `Severity: ${checklist.severityLabel}`,
    "",
  ];
  checklist.phases.forEach((phase) => {
    lines.push(`## ${phase.label}`);
    phase.items.forEach((item) => {
      lines.push(`- [${done.has(item.id) ? "x" : " "}] ${item.text}`);
    });
    lines.push("");
  });
  return lines.join("\n").trimEnd();
}
