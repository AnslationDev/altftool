const MAX_SOURCE_LENGTH = 300_000;
const MAX_ELEMENTS = 8_000;
const AUTH_NAME_PATTERN =
  /(?:auth|email|login|otp|one.?time|passcode|password|passwd|pin|user(?:name)?|verification.?code)/iu;
const CHALLENGE_PATTERN =
  /(?:captcha|security\s+question|mother(?:'s)?\s+maiden|solve\s+(?:the|this)|what\s+is\s+\d+\s*[+\-*/]|enter\s+(?:the\s+)?(?:\d+(?:st|nd|rd|th)[,\s]*)+(?:character|letter)|select\s+all\s+(?:images|pictures)|identify\s+(?:the\s+)?(?:object|image)|remember\s+your)/iu;
const ALTERNATIVE_PATTERN =
  /(?:passkey|web\s*authn|magic\s+link|email\s+link|sign\s+in\s+with|continue\s+with|use\s+another\s+method|try\s+another\s+way|scan\s+(?:a\s+)?qr|approve\s+(?:the\s+)?notification)/iu;
const ERROR_CLASS_PATTERN =
  /(?:^|[\s_-])(?:error|invalid|failure)(?:$|[\s_-])/iu;

const MANUAL_VALUES = {
  pasteSupport: new Set(["unknown", "allowed", "blocked"]),
  cognitiveRequirement: new Set([
    "unknown",
    "none",
    "assisted-or-alternative",
    "forced-recall-or-transcription",
    "object-recognition-only",
    "personal-content-only",
  ]),
  alternativeMethod: new Set([
    "unknown",
    "available",
    "unavailable",
    "not-applicable",
  ]),
  passwordManagerSupport: new Set(["unknown", "works", "blocked"]),
  codeEntrySupport: new Set([
    "unknown",
    "paste-or-autofill",
    "manual-transcription-only",
    "not-applicable",
  ]),
  timeoutSupport: new Set([
    "unknown",
    "no-content-limit",
    "turn-off-or-adjust",
    "warn-and-extend",
    "essential-exception",
    "unsupported",
  ]),
  errorRecovery: new Set([
    "unknown",
    "clear-text-and-suggestion",
    "generic-or-unclear",
    "no-recovery-path",
  ]),
};

export const authenticationAuditLimits = Object.freeze({
  maxSourceLength: MAX_SOURCE_LENGTH,
  maxElements: MAX_ELEMENTS,
});

export const defaultAuthenticationChecklist = Object.freeze({
  pasteSupport: "unknown",
  cognitiveRequirement: "unknown",
  alternativeMethod: "unknown",
  passwordManagerSupport: "unknown",
  codeEntrySupport: "unknown",
  timeoutSupport: "unknown",
  errorRecovery: "unknown",
  timeoutSeconds: "",
});

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/&quot;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'");
}

function cleanText(value, maximum = 500) {
  return decodeEntities(value).replace(/\s+/gu, " ").trim().slice(0, maximum);
}

function parseAttributes(source) {
  const attributes = {};
  const pattern =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu;
  let match;
  while ((match = pattern.exec(source))) {
    const name = match[1].toLowerCase();
    if (!Object.hasOwn(attributes, name)) {
      attributes[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
    }
  }
  return attributes;
}

function parseStartElements(source) {
  const markup = source
    .replace(/<!--[\s\S]*?-->/gu, "")
    .replace(
      /<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/giu,
      "",
    )
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*$/giu, "");
  const elements = [];
  const pattern = /<([a-z][\w:-]*)\b([^<>]*?)\/?>/giu;
  let match;
  let truncated = false;
  while ((match = pattern.exec(markup))) {
    if (elements.length >= MAX_ELEMENTS) {
      truncated = true;
      break;
    }
    elements.push({
      tag: match[1].toLowerCase(),
      attrs: parseAttributes(match[2]),
    });
  }
  return { elements, truncated };
}

function attributeValue(element, name) {
  return cleanText(element.attrs[name], 200).toLowerCase();
}

function combinedIdentity(element) {
  return cleanText(
    [
      element.attrs.id,
      element.attrs.name,
      element.attrs.type,
      element.attrs.autocomplete,
      element.attrs["aria-label"],
      element.attrs.placeholder,
    ].join(" "),
    600,
  );
}

function isCredentialInput(element) {
  if (element.tag !== "input") return false;
  return (
    attributeValue(element, "type") === "password" ||
    AUTH_NAME_PATTERN.test(combinedIdentity(element))
  );
}

function isPasswordInput(element) {
  return (
    element.tag === "input" && attributeValue(element, "type") === "password"
  );
}

function isCodeInput(element) {
  if (element.tag !== "input") return false;
  const identity = combinedIdentity(element);
  return (
    /(?:otp|one.?time|passcode|verification.?code)/iu.test(identity) ||
    attributeValue(element, "autocomplete")
      .split(/\s+/gu)
      .includes("one-time-code")
  );
}

function hasAttribute(element, name) {
  return Object.hasOwn(element.attrs, name);
}

function normalizedManualValue(key, value) {
  const normalized = cleanText(value, 80).toLowerCase();
  return MANUAL_VALUES[key].has(normalized)
    ? normalized
    : defaultAuthenticationChecklist[key];
}

function normalizeChecklist(checklist = {}) {
  const normalized = {};
  for (const key of Object.keys(MANUAL_VALUES)) {
    normalized[key] = normalizedManualValue(key, checklist[key]);
  }
  const timeoutValue = Number(checklist.timeoutSeconds);
  normalized.timeoutSeconds =
    Number.isFinite(timeoutValue) && timeoutValue > 0
      ? Math.min(Math.round(timeoutValue), 20 * 60 * 60)
      : null;
  return normalized;
}

function hasManualObservation(checklist) {
  return (
    Object.keys(MANUAL_VALUES).some(
      (key) => checklist[key] !== defaultAuthenticationChecklist[key],
    ) || checklist.timeoutSeconds !== null
  );
}

function finding({
  id,
  severity,
  title,
  count = 1,
  reason,
  action,
  reference,
  origin,
}) {
  return {
    id,
    severity,
    title,
    count,
    reason,
    action,
    reference,
    origin,
  };
}

function assessmentFor(counts) {
  if (counts.high > 0) {
    return {
      level: "action",
      label: "High-priority authentication barriers need review",
      description:
        "The supplied evidence includes one or more signals that can block or substantially burden an accessible authentication path.",
    };
  }
  if (counts.medium > 0) {
    return {
      level: "review",
      label: "Authentication friction needs review",
      description:
        "The supplied evidence includes implementation or recovery cues that deserve manual testing in the complete flow.",
    };
  }
  if (counts.review > 0) {
    return {
      level: "review",
      label: "Manual verification is still required",
      description:
        "The static review found ambiguous signals or unanswered behavior that source inspection alone cannot resolve.",
    };
  }
  return {
    level: "clear",
    label: "No configured risk signal was found",
    description:
      "This limited review found no configured cue, but it does not establish accessibility or WCAG conformance.",
  };
}

export function auditAuthenticationExperience({
  source = "",
  checklist = {},
} = {}) {
  const rawSource = String(source || "");
  const boundedSource = rawSource.slice(0, MAX_SOURCE_LENGTH);
  const normalizedChecklist = normalizeChecklist(checklist);
  const sourceProvided = Boolean(rawSource.trim());
  const manualProvided = hasManualObservation(normalizedChecklist);

  if (!sourceProvided && !manualProvided) {
    return {
      ok: false,
      errors: [
        "Paste authentication HTML or record at least one observed flow behavior.",
      ],
    };
  }

  const parsed = parseStartElements(boundedSource);
  const elements = parsed.elements;
  const inputs = elements.filter((element) => element.tag === "input");
  const credentialInputs = inputs.filter(isCredentialInput);
  const passwordInputs = inputs.filter(isPasswordInput);
  const codeInputs = inputs.filter(isCodeInput);
  const findings = [];

  const inlinePasteBlocks = credentialInputs.filter((element) => {
    const handler = attributeValue(element, "onpaste");
    return /(?:return\s+false|preventdefault\s*\()/iu.test(handler);
  }).length;
  const scriptPasteBlock =
    /(?:addEventListener\s*\(\s*["']paste["']|\.onpaste\s*=)[\s\S]{0,500}?preventDefault\s*\(/iu.test(
      boundedSource,
    ) ||
    /preventDefault\s*\([\s\S]{0,500}?(?:addEventListener\s*\(\s*["']paste["']|\.onpaste\s*=)/iu.test(
      boundedSource,
    );

  if (
    normalizedChecklist.pasteSupport === "blocked" ||
    inlinePasteBlocks > 0 ||
    scriptPasteBlock
  ) {
    findings.push(
      finding({
        id: "paste-blocked",
        severity: "high",
        title: "Paste appears to be blocked",
        count:
          inlinePasteBlocks +
          Number(scriptPasteBlock) +
          Number(normalizedChecklist.pasteSupport === "blocked"),
        reason:
          "Blocking paste can force users to transcribe credentials or verification codes and can interfere with password-manager workflows.",
        action:
          "Allow paste in every authentication field and test browser and third-party password managers.",
        reference: "WCAG 2.2 SC 3.3.8",
        origin:
          normalizedChecklist.pasteSupport === "blocked"
            ? "observed behavior and/or source"
            : "source heuristic",
      }),
    );
  }

  const autocompleteOff = credentialInputs.filter(
    (element) => attributeValue(element, "autocomplete") === "off",
  ).length;
  const formAutocompleteOff =
    credentialInputs.length > 0 &&
    elements.some(
      (element) =>
        element.tag === "form" &&
        attributeValue(element, "autocomplete") === "off",
    )
      ? 1
      : 0;
  if (
    normalizedChecklist.passwordManagerSupport === "blocked" ||
    autocompleteOff > 0 ||
    formAutocompleteOff > 0
  ) {
    findings.push(
      finding({
        id: "credential-assistance-blocked",
        severity: "high",
        title: "Credential assistance may be blocked",
        count:
          autocompleteOff +
          formAutocompleteOff +
          Number(normalizedChecklist.passwordManagerSupport === "blocked"),
        reason:
          "Preventing user-agent or password-manager assistance can turn credential entry into a memory or transcription task.",
        action:
          "Support password managers and use appropriate username and password autocomplete tokens without scripts that reject filled values.",
        reference: "WCAG 2.2 SC 3.3.8 and SC 1.3.5",
        origin:
          normalizedChecklist.passwordManagerSupport === "blocked"
            ? "observed behavior and/or source"
            : "source heuristic",
      }),
    );
  }

  const passwordWithoutPurpose = passwordInputs.filter((element) => {
    const tokens = attributeValue(element, "autocomplete").split(/\s+/gu);
    return !tokens.some((token) =>
      ["current-password", "new-password"].includes(token),
    );
  }).length;
  const usernameCandidates = credentialInputs.filter(
    (element) => !isPasswordInput(element) && !isCodeInput(element),
  );
  const usernameWithoutPurpose = usernameCandidates.filter((element) => {
    const tokens = attributeValue(element, "autocomplete").split(/\s+/gu);
    return !tokens.some((token) =>
      ["username", "email", "webauthn"].includes(token),
    );
  }).length;
  const missingCredentialPurpose =
    passwordWithoutPurpose + usernameWithoutPurpose;
  if (missingCredentialPurpose > 0) {
    findings.push(
      finding({
        id: "credential-purpose-unclear",
        severity: "medium",
        title: "Credential input purpose may be unclear",
        count: missingCredentialPurpose,
        reason:
          "Credential-looking fields lack the common autocomplete tokens that help browsers and assistive tools identify their purpose.",
        action:
          "Confirm the flow type, then apply valid tokens such as username, current-password, new-password, one-time-code, or webauthn as appropriate.",
        reference: "WCAG 2.2 SC 1.3.5 and SC 3.3.8",
        origin: "source heuristic",
      }),
    );
  }

  const segmentedCodeFields = codeInputs.filter((element) => {
    const maximum = Number(attributeValue(element, "maxlength"));
    return maximum === 1;
  }).length;
  const codeWithoutAutocomplete = codeInputs.filter(
    (element) =>
      !attributeValue(element, "autocomplete")
        .split(/\s+/gu)
        .includes("one-time-code"),
  ).length;
  if (
    normalizedChecklist.codeEntrySupport === "manual-transcription-only" ||
    (codeInputs.length > 0 &&
      (codeWithoutAutocomplete > 0 || segmentedCodeFields > 1))
  ) {
    findings.push(
      finding({
        id: "verification-code-transcription",
        severity:
          normalizedChecklist.codeEntrySupport === "manual-transcription-only"
            ? "high"
            : "medium",
        title: "Verification code entry may require transcription",
        count:
          Math.max(codeWithoutAutocomplete, segmentedCodeFields > 1 ? 1 : 0) +
          Number(
            normalizedChecklist.codeEntrySupport ===
              "manual-transcription-only",
          ),
        reason:
          "A one-time code must be pasteable or fillable by an assisting mechanism; segmented fields also need real-device testing.",
        action:
          "Allow full-code paste, support one-time-code autofill where applicable, and avoid forcing users to retype a code from another device.",
        reference: "WCAG 2.2 SC 3.3.8",
        origin:
          normalizedChecklist.codeEntrySupport === "manual-transcription-only"
            ? "observed behavior and/or source"
            : "source heuristic",
      }),
    );
  }

  const challengeSignal = CHALLENGE_PATTERN.test(boundedSource);
  const alternativeSignal = ALTERNATIVE_PATTERN.test(boundedSource);
  if (
    normalizedChecklist.cognitiveRequirement ===
    "forced-recall-or-transcription"
  ) {
    findings.push(
      finding({
        id: "forced-cognitive-test",
        severity: "high",
        title: "A cognitive function test is required",
        reason:
          "Forced recall, puzzle solving, or transcription can exclude users unless an allowed assisting mechanism or non-cognitive path is available.",
        action:
          "Provide a complete authentication path without a cognitive function test, or a mechanism that assists the user in completing it.",
        reference: "WCAG 2.2 SC 3.3.8 and SC 3.3.9",
        origin: "observed behavior",
      }),
    );
  } else if (
    ["object-recognition-only", "personal-content-only"].includes(
      normalizedChecklist.cognitiveRequirement,
    )
  ) {
    findings.push(
      finding({
        id: "minimum-exception-enhanced-barrier",
        severity: "review",
        title: "An AA exception may still be an enhanced-level barrier",
        reason:
          "Object recognition and user-provided non-text content are exceptions in SC 3.3.8, but they are not exceptions in SC 3.3.9.",
        action:
          "Offer a non-cognitive alternative or assisting mechanism to support a broader range of users.",
        reference: "WCAG 2.2 SC 3.3.8 and SC 3.3.9",
        origin: "observed behavior",
      }),
    );
  } else if (challengeSignal) {
    findings.push(
      finding({
        id: "cognitive-challenge-review",
        severity: "review",
        title: "Challenge language needs full-flow review",
        reason:
          "The pasted source contains challenge-related language, but static text cannot establish whether the challenge is required or whether an assisting mechanism exists.",
        action:
          "Test every normal, recovery, rate-limited, and multi-factor path for a usable non-cognitive route or assisting mechanism.",
        reference: "WCAG 2.2 SC 3.3.8 and SC 3.3.9",
        origin: "source heuristic",
      }),
    );
  }

  const cognitiveTestObserved = [
    "forced-recall-or-transcription",
    "object-recognition-only",
    "personal-content-only",
  ].includes(normalizedChecklist.cognitiveRequirement);
  if (
    (cognitiveTestObserved &&
      normalizedChecklist.alternativeMethod === "unavailable") ||
    (challengeSignal && !alternativeSignal)
  ) {
    findings.push(
      finding({
        id: "alternative-path-not-evident",
        severity:
          cognitiveTestObserved &&
          normalizedChecklist.alternativeMethod === "unavailable"
            ? "high"
            : "review",
        title: "An alternative authentication path is not evident",
        reason:
          challengeSignal && !alternativeSignal
            ? "No common alternative-method cue was found in the pasted fragment; another step or a non-text control may still provide one."
            : "The recorded flow requires a cognitive step without an available alternative method.",
        action:
          "Provide and clearly label another method that avoids the cognitive function test, then test the complete path.",
        reference: "WCAG 2.2 SC 3.3.8 and SC 3.3.9",
        origin:
          normalizedChecklist.alternativeMethod === "unavailable"
            ? "observed behavior and/or source"
            : "source heuristic",
      }),
    );
  }

  if (normalizedChecklist.timeoutSupport === "unsupported") {
    findings.push(
      finding({
        id: "time-limit-not-adjustable",
        severity: "high",
        title: "The recorded time limit lacks user control",
        reason:
          "Content-set time limits generally need a way to turn off, adjust, or extend them unless a documented exception applies.",
        action:
          "Let users turn off or widely adjust the limit, or warn before expiry and provide at least 20 seconds to extend it at least ten times.",
        reference: "WCAG 2.2 SC 2.2.1",
        origin: "observed behavior",
      }),
    );
  } else if (normalizedChecklist.timeoutSupport === "essential-exception") {
    findings.push(
      finding({
        id: "time-limit-exception-review",
        severity: "review",
        title: "Verify the claimed time-limit exception",
        reason:
          "Security-sensitive or real-time limits can be exceptions in some circumstances, but other authentication criteria can still apply.",
        action:
          "Document why the limit is essential or externally set, minimize time-critical steps, and test paste and autofill support.",
        reference: "WCAG 2.2 SC 2.2.1 and SC 3.3.8",
        origin: "observed behavior",
      }),
    );
  } else if (
    normalizedChecklist.timeoutSeconds !== null &&
    normalizedChecklist.timeoutSupport === "unknown"
  ) {
    findings.push(
      finding({
        id: "short-time-limit-review",
        severity: "review",
        title: "A recorded time limit needs controls verification",
        reason:
          "Duration alone does not determine accessibility; the ability to turn off, adjust, extend, or qualify for an exception must be verified.",
        action:
          "Record and test the warning, extension action, number of extensions, and any documented exception.",
        reference: "WCAG 2.2 SC 2.2.1",
        origin: "observed behavior",
      }),
    );
  }

  if (
    ["generic-or-unclear", "no-recovery-path"].includes(
      normalizedChecklist.errorRecovery,
    )
  ) {
    const noRecovery = normalizedChecklist.errorRecovery === "no-recovery-path";
    findings.push(
      finding({
        id: noRecovery
          ? "error-recovery-unavailable"
          : "error-recovery-unclear",
        severity: noRecovery ? "high" : "medium",
        title: noRecovery
          ? "No usable error-recovery path was recorded"
          : "Authentication errors may be unclear",
        reason: noRecovery
          ? "Users can become locked out when an authentication error does not lead to a usable recovery method."
          : "Generic errors may not identify the problem or give a known, security-safe correction suggestion.",
        action:
          "Identify the error in text, associate it with the affected step, provide a safe correction suggestion when known, and expose a clear recovery path.",
        reference: "WCAG 2.2 SC 3.3.1 and SC 3.3.3",
        origin: "observed behavior",
      }),
    );
  }

  const errorLookingElements = elements.filter((element) => {
    const identity = `${attributeValue(element, "id")} ${attributeValue(
      element,
      "class",
    )}`;
    return ERROR_CLASS_PATTERN.test(identity);
  });
  const programmaticErrorSignals = elements.filter(
    (element) =>
      ["alert", "status"].includes(attributeValue(element, "role")) ||
      hasAttribute(element, "aria-live") ||
      hasAttribute(element, "aria-errormessage") ||
      hasAttribute(element, "aria-describedby"),
  ).length;
  if (errorLookingElements.length > 0 && programmaticErrorSignals === 0) {
    findings.push(
      finding({
        id: "static-error-association-review",
        severity: "review",
        title: "Error-looking markup needs association testing",
        count: errorLookingElements.length,
        reason:
          "A class or ID suggests error content, but no common live-region or field-reference cue was found in the pasted fragment.",
        action:
          "Verify that errors are described in text, connected to the affected input, announced when added, and paired with safe correction guidance.",
        reference: "WCAG 2.2 SC 3.3.1, SC 3.3.3, and SC 4.1.3",
        origin: "source heuristic",
      }),
    );
  }

  const counts = {
    high: findings.filter((item) => item.severity === "high").length,
    medium: findings.filter((item) => item.severity === "medium").length,
    review: findings.filter((item) => item.severity === "review").length,
    total: findings.length,
  };

  return {
    ok: true,
    scope: {
      sourceProvided,
      manualProvided,
      sourceTruncated: rawSource.length > MAX_SOURCE_LENGTH || parsed.truncated,
      sourceExecuted: false,
      remoteFetched: false,
    },
    stats: {
      elementsInspected: elements.length,
      inputs: inputs.length,
      credentialInputs: credentialInputs.length,
      passwordInputs: passwordInputs.length,
      codeInputs: codeInputs.length,
      alternativeTextSignals: Number(alternativeSignal),
      challengeTextSignals: Number(challengeSignal),
    },
    counts,
    assessment: assessmentFor(counts),
    findings,
  };
}

export function buildAuthenticationAuditReport(result) {
  if (!result?.ok) return null;
  return {
    version: 1,
    tool: "Accessible Authentication Auditor",
    scope: {
      sourceProvided: result.scope.sourceProvided,
      manualProvided: result.scope.manualProvided,
      sourceTruncated: result.scope.sourceTruncated,
      sourceExecuted: false,
      remoteFetched: false,
      rawSourceIncluded: false,
      checklistAnswersIncluded: false,
      conformanceEstablished: false,
      legalCertification: false,
    },
    counts: { ...result.counts },
    inspectedCounts: { ...result.stats },
    findings: result.findings.map((item) => ({
      id: item.id,
      severity: item.severity,
      count: item.count,
    })),
  };
}
