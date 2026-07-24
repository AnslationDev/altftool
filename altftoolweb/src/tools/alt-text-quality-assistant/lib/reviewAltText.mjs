export const ALT_TEXT_LIMITS = {
  textCharacters: 2_000,
  contextCharacters: 4_000,
};

export const IMAGE_PURPOSES = new Set([
  "decorative",
  "informative",
  "functional",
  "complex",
  "text-image",
  "unclear",
]);

export const ALT_STATES = new Set(["missing", "empty", "present"]);

function clean(value, maximum) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximum);
}

function words(value) {
  return (
    clean(value, ALT_TEXT_LIMITS.contextCharacters)
      .toLocaleLowerCase("en-US")
      .match(/[\p{L}\p{N}]+/gu) || []
  );
}

function meaningfulWords(value) {
  const stop = new Set([
    "a",
    "an",
    "and",
    "at",
    "by",
    "for",
    "from",
    "in",
    "is",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ]);
  return words(value).filter((word) => word.length > 2 && !stop.has(word));
}

function tokenCoverage(reference, candidate) {
  const expected = [...new Set(meaningfulWords(reference))];
  if (!expected.length) return null;
  const actual = new Set(meaningfulWords(candidate));
  return Number(
    (
      (expected.filter((word) => actual.has(word)).length / expected.length) *
      100
    ).toFixed(1),
  );
}

function finding(id, severity, title, message) {
  return { id, severity, title, message };
}

export function reviewAltText(input = {}) {
  const purpose = IMAGE_PURPOSES.has(input.purpose) ? input.purpose : "unclear";
  const altState = ALT_STATES.has(input.altState) ? input.altState : "missing";
  const altText = clean(input.altText, ALT_TEXT_LIMITS.textCharacters);
  const essentialInformation = clean(
    input.essentialInformation,
    ALT_TEXT_LIMITS.contextCharacters,
  );
  const actionPurpose = clean(
    input.actionPurpose,
    ALT_TEXT_LIMITS.contextCharacters,
  );
  const nearbyText = clean(input.nearbyText, ALT_TEXT_LIMITS.contextCharacters);
  const longerAlternativeAvailable = Boolean(input.longerAlternativeAvailable);
  const findings = [];

  if (altState === "missing") {
    findings.push(
      finding(
        "missing-alt-attribute",
        "error",
        "Alt attribute is missing",
        "HTML images need an alt attribute. Decorative images normally use an explicitly empty alt attribute rather than omitting it.",
      ),
    );
  }

  if (altState === "empty" && purpose !== "decorative") {
    findings.push(
      finding(
        "empty-for-meaningful-image",
        "error",
        "Meaningful image has an empty alternative",
        "An empty alt hides the image from many screen-reader users. Recheck the image's information or function.",
      ),
    );
  }

  if (altState === "present" && !altText) {
    findings.push(
      finding(
        "present-state-without-text",
        "error",
        "Present alt text is blank",
        "Enter the actual alt value or choose the explicitly empty state.",
      ),
    );
  }

  if (purpose === "decorative" && altState === "present" && altText) {
    findings.push(
      finding(
        "decorative-has-text",
        "review",
        "Decorative image may be announced unnecessarily",
        'If the image adds no information or function, W3C guidance normally uses alt="".',
      ),
    );
  }

  if (purpose === "functional" && altState === "present" && !actionPurpose) {
    findings.push(
      finding(
        "functional-purpose-missing",
        "review",
        "Action or destination is not documented",
        "For an image used as a link or button, review the alt against what the control does rather than only how it looks.",
      ),
    );
  }

  if (purpose === "functional" && actionPurpose && altState === "present") {
    const coverage = tokenCoverage(actionPurpose, altText);
    if (coverage !== null && coverage < 50) {
      findings.push(
        finding(
          "functional-purpose-low-coverage",
          "review",
          "Alt may not communicate the control purpose",
          "Few meaningful words from the entered action or destination appear in the alt text. Human review is required.",
        ),
      );
    }
  }

  if (
    ["informative", "complex", "text-image"].includes(purpose) &&
    essentialInformation &&
    altState === "present"
  ) {
    const coverage = tokenCoverage(essentialInformation, altText);
    const threshold = purpose === "complex" ? 25 : 50;
    if (coverage !== null && coverage < threshold) {
      findings.push(
        finding(
          "essential-information-low-coverage",
          "review",
          "Entered essential information is weakly represented",
          "The word-overlap heuristic found limited coverage. It cannot judge synonyms, meaning, language quality, or context.",
        ),
      );
    }
  }

  if (purpose === "complex" && !longerAlternativeAvailable) {
    findings.push(
      finding(
        "complex-alternative-missing",
        "error",
        "No longer equivalent is available",
        "A concise alt alone rarely carries all information in a complex chart, diagram, or data visualization. Provide the full information in nearby text or another accessible equivalent.",
      ),
    );
  }

  if (
    purpose === "text-image" &&
    altState === "present" &&
    !essentialInformation
  ) {
    findings.push(
      finding(
        "image-text-not-entered",
        "review",
        "Relevant image text was not entered",
        "Record the text that users need so the alternative can be checked against it.",
      ),
    );
  }

  if (altState === "present" && altText) {
    if (
      /^(image|photo|picture|graphic|icon|screenshot)(\s+of)?[.!]?$/iu.test(
        altText,
      )
    ) {
      findings.push(
        finding(
          "generic-alt",
          "error",
          "Alt text is generic",
          "The current value does not communicate the image's specific information or function.",
        ),
      );
    } else if (
      /^(image|photo|picture|graphic|icon|screenshot)\s+of\b/iu.test(altText)
    ) {
      findings.push(
        finding(
          "redundant-object-prefix",
          "review",
          "Object-type prefix may be unnecessary",
          "Screen readers normally announce the image role. Keep the prefix only when that distinction matters in context.",
        ),
      );
    }
    if (/^(?:[a-z0-9_-]+\.(?:avif|gif|jpe?g|png|svg|webp))$/iu.test(altText)) {
      findings.push(
        finding(
          "filename-alt",
          "error",
          "Alt text looks like a filename",
          "Replace the filename with the image's purpose or explicitly mark a decorative image with empty alt.",
        ),
      );
    }
    if (
      nearbyText &&
      altText.toLocaleLowerCase("en-US") ===
        nearbyText.toLocaleLowerCase("en-US")
    ) {
      findings.push(
        finding(
          "duplicates-nearby-text",
          "review",
          "Alt duplicates the entered nearby text",
          "Check whether repeating the same words is useful. If nearby text already provides the equivalent and the image adds no function, an empty alt may be appropriate.",
        ),
      );
    }
    if (altText.length > 200) {
      findings.push(
        finding(
          "long-alt-review",
          "review",
          "Alt text is lengthy",
          "WCAG does not set a universal character limit. Review whether a concise alt plus nearby longer equivalent would communicate more clearly.",
        ),
      );
    }
  }

  if (purpose === "unclear") {
    findings.push(
      finding(
        "purpose-unclear",
        "review",
        "Image purpose is undecided",
        "Alt quality depends on the image's purpose in this exact context. Use the decision questions before judging wording.",
      ),
    );
  }

  const draftSource =
    purpose === "decorative"
      ? ""
      : purpose === "functional"
        ? actionPurpose
        : essentialInformation;
  const suggestedDraft = clean(draftSource, ALT_TEXT_LIMITS.textCharacters);
  const counts = {
    errors: findings.filter((item) => item.severity === "error").length,
    reviews: findings.filter((item) => item.severity === "review").length,
    characters: altText.length,
    words: words(altText).length,
  };

  return {
    purpose,
    altState,
    altText,
    essentialInformation,
    actionPurpose,
    nearbyText,
    longerAlternativeAvailable,
    findings,
    counts,
    suggestedDraft,
    outcome:
      counts.errors > 0
        ? "needs-change"
        : counts.reviews > 0
          ? "needs-human-review"
          : "no-configured-cue",
    limitations: [
      "This tool reviews user-entered text and context; it does not inspect image pixels or generate a semantic description.",
      "Word overlap cannot understand synonyms, nuance, tone, language quality, or whether the description is accurate.",
      "A zero-cue result does not establish WCAG conformance or a good user experience.",
      "The same image can require different alternatives in different contexts.",
    ],
  };
}

export function buildAltTextCountsReport(result) {
  if (!result?.counts) return null;
  return {
    schema: "altftool.alt-text-quality-counts.v1",
    createdAt: new Date().toISOString(),
    purpose: result.purpose,
    altState: result.altState,
    outcome: result.outcome,
    counts: { ...result.counts },
    findingCounts: result.findings.reduce((counts, item) => {
      counts[item.id] = (counts[item.id] || 0) + 1;
      return counts;
    }, {}),
    scope: {
      enteredTextIncluded: false,
      suggestedDraftIncluded: false,
      imageInspected: false,
      conformanceEstablished: false,
    },
  };
}
