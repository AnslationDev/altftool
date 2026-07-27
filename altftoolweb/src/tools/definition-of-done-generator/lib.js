/**
 * Definition of Done generator — pure logic.
 *
 * A Definition of Done is a shared checklist every increment must satisfy
 * before it counts as finished. The Scrum Guide requires one and requires it
 * to be identical for all items in the increment; it deliberately does not say
 * what belongs on it, because that depends on the product.
 *
 * This generator assembles one from four inputs: what is being built, the
 * team's size, how often it ships, and which compliance regimes apply. Every
 * item is tagged with the reason it is there, and compliance items name the
 * clause they come from so a reviewer can check them.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Team-size thresholds that change the review rules. */
export const SOLO_TEAM_MAX = 1;
export const SMALL_TEAM_MAX = 4;
export const LARGE_TEAM_MIN = 9; // beyond the Scrum Guide's 10-person guidance
export const MAX_TEAM_SIZE = 200;

/**
 * Default line-coverage target. 80% is a widely used team convention, not a
 * standard — it is exposed as an input for exactly that reason.
 */
export const DEFAULT_COVERAGE_TARGET = 80;
export const MIN_COVERAGE_TARGET = 0;
export const MAX_COVERAGE_TARGET = 100;

/** Sections the checklist is grouped into, in the order they are worked. */
export const SECTION_ORDER = [
  "Code",
  "Testing",
  "Review",
  "Documentation",
  "Security",
  "Accessibility",
  "Compliance",
  "Observability",
  "Release",
];

/** What is being built. Each type adds its own domain-specific items. */
export const PROJECT_TYPES = [
  {
    key: "web-app",
    label: "Web application",
    items: [
      ["Testing", "Works in the two most recent versions of Chrome, Safari and Firefox", "Browser drift is the main source of 'works on my machine' bugs.", true],
      ["Testing", "Layout verified at 375px, 768px and 1280px widths", "375px is the narrowest common phone; skipping it is how horizontal scroll ships.", true],
      ["Code", "No new console errors or unhandled promise rejections in the browser", "They are almost always a real bug that has not surfaced yet.", true],
      ["Release", "Bundle size change checked against the previous build", "Front-end weight regresses silently, one dependency at a time.", false],
    ],
  },
  {
    key: "mobile-app",
    label: "Mobile app",
    items: [
      ["Testing", "Tested on the oldest OS version the app still supports", "The support floor is where crashes concentrate.", true],
      ["Testing", "Behaviour on flaky and offline connections checked", "Mobile networks fail partially far more often than they fail completely.", true],
      ["Release", "Store metadata, screenshots and release notes updated", "App-store review rejects on metadata as often as on code.", true],
      ["Code", "No new permissions requested without a written justification", "New permissions trigger store review and user distrust.", true],
    ],
  },
  {
    key: "api",
    label: "API or backend service",
    items: [
      ["Documentation", "OpenAPI or schema definition updated and published", "An undocumented endpoint is an endpoint nobody can integrate with.", true],
      ["Code", "Backward compatibility preserved, or a versioned breaking change agreed", "Silent contract breaks are the most expensive kind of bug to find.", true],
      ["Testing", "Error paths return the documented status codes, not just the happy path", "Clients branch on status codes; undocumented ones become outages.", true],
      ["Observability", "New endpoints emit latency and error-rate metrics", "You cannot alert on what you do not measure.", true],
    ],
  },
  {
    key: "data",
    label: "Data pipeline or analytics",
    items: [
      ["Testing", "Pipeline re-run on a sample and output row counts reconciled", "Row-count drift is the earliest visible symptom of a broken join.", true],
      ["Code", "Job is idempotent — a re-run produces the same result, not duplicates", "Retries happen; a non-idempotent job turns a blip into corrupt data.", true],
      ["Documentation", "Schema and lineage documentation updated for changed tables", "Downstream consumers cannot see your change until it breaks them.", true],
      ["Observability", "Freshness and null-rate checks in place for new columns", "Silent nulls are how a dashboard lies for a month.", false],
    ],
  },
  {
    key: "library",
    label: "Library or SDK",
    items: [
      ["Documentation", "Public API documented with a runnable example", "An undocumented public function is a support ticket waiting to happen.", true],
      ["Code", "Semantic version bump chosen to match the change", "A breaking change in a patch release breaks every consumer at once.", true],
      ["Testing", "Tested against the oldest supported runtime version", "Consumers upgrade slowly; your CI defaults do not reflect them.", true],
      ["Release", "Changelog entry written for the release", "The changelog is the only thing most consumers read.", true],
    ],
  },
  {
    key: "internal-tool",
    label: "Internal tool",
    items: [
      ["Documentation", "A colleague can run it from the README with no verbal help", "Internal tools rot fastest when the author is the only operator.", true],
      ["Security", "Access restricted to the group that needs it", "Internal does not mean unauthenticated.", true],
      ["Code", "Destructive actions require an explicit confirmation", "Internal tools have the fewest guardrails and the highest privileges.", false],
    ],
  },
];

/**
 * Compliance regimes. Each item names the clause it comes from so it can be
 * checked against the source text rather than taken on trust.
 */
export const COMPLIANCE_REGIMES = [
  {
    key: "gdpr",
    label: "GDPR (EU personal data)",
    items: [
      ["Compliance", "Personal data added by this change is recorded in the processing register", "GDPR Article 30 requires a record of processing activities.", true],
      ["Compliance", "Only the data actually needed is collected and stored", "GDPR Article 5(1)(c), data minimisation.", true],
      ["Compliance", "Retention period set, and deletion is possible on request", "GDPR Articles 5(1)(e) and 17, storage limitation and erasure.", true],
      ["Security", "Data protection considered at design time, not bolted on", "GDPR Article 25, data protection by design and by default.", true],
    ],
  },
  {
    key: "hipaa",
    label: "HIPAA (US health data)",
    items: [
      ["Security", "Protected health information encrypted in transit and at rest", "HIPAA Security Rule 45 CFR 164.312(a)(2)(iv) and (e)(2)(ii).", true],
      ["Security", "Access to PHI is unique per user and logged", "45 CFR 164.312(a)(2)(i) unique user identification and (b) audit controls.", true],
      ["Compliance", "Any new third-party processor is covered by a business associate agreement", "45 CFR 164.308(b)(1).", true],
    ],
  },
  {
    key: "pci",
    label: "PCI DSS (card payments)",
    items: [
      ["Security", "No card number, CVV or track data written to logs", "PCI DSS v4.0 Requirement 3.3 — sensitive authentication data must not be stored after authorisation.", true],
      ["Code", "Change reviewed against secure coding guidance before release", "PCI DSS v4.0 Requirement 6.2.", true],
      ["Compliance", "Change recorded with approval and a back-out plan", "PCI DSS v4.0 Requirement 6.5 change control.", true],
    ],
  },
  {
    key: "soc2",
    label: "SOC 2",
    items: [
      ["Compliance", "Change authorised, tested and approved before deployment", "SOC 2 Common Criteria CC8.1, change management.", true],
      ["Security", "Access changes follow least privilege and are evidenced", "SOC 2 Common Criteria CC6.1 and CC6.3.", true],
      ["Observability", "Monitoring covers the new component", "SOC 2 Common Criteria CC7.2.", false],
    ],
  },
  {
    key: "wcag",
    label: "Accessibility (WCAG 2.2 AA)",
    items: [
      ["Accessibility", "Every interactive element is reachable and operable by keyboard alone", "WCAG 2.2 SC 2.1.1 Keyboard.", true],
      ["Accessibility", "Text contrast is at least 4.5:1, and 3:1 for large text and UI components", "WCAG 2.2 SC 1.4.3 and 1.4.11.", true],
      ["Accessibility", "Every form control has a programmatically associated label", "WCAG 2.2 SC 1.3.1 and 3.3.2.", true],
      ["Accessibility", "Focus indicator is visible and not obscured", "WCAG 2.2 SC 2.4.7 and 2.4.11.", true],
      ["Testing", "Checked once with a screen reader, not only with an automated scanner", "Automated tools catch roughly a third of issues; the rest need a human.", false],
    ],
  },
];

/** How often the team ships, which changes what has to be ready at merge. */
export const CADENCES = [
  { key: "continuous", label: "Continuous deployment", note: "Merged code reaches production, so everything must be release-ready at merge." },
  { key: "weekly", label: "Weekly or fortnightly release" },
  { key: "monthly", label: "Monthly or slower release" },
];

/** Items every team needs whatever they build. */
export const BASE_ITEMS = [
  ["Code", "Acceptance criteria on the ticket are all met", "The Definition of Done complements acceptance criteria; it does not replace them.", true],
  ["Code", "Code merged to the main branch with no unresolved conflicts", "Unmerged work is not done, however finished it looks.", true],
  ["Code", "Feature flags and debug code removed or deliberately left with an owner", "Orphaned flags become permanent untested branches.", true],
  ["Testing", "Automated tests added or updated for the change", "Without a test, the next change silently undoes this one.", true],
  ["Testing", "The full test suite passes on CI, not only locally", "A green local run proves your machine works.", true],
  ["Documentation", "User-facing or developer-facing docs updated where behaviour changed", "Documentation drift is invisible until someone is misled by it.", true],
  ["Security", "No secrets, tokens or credentials committed", "A committed secret is compromised the moment it is pushed.", true],
];

/* ------------------------------------------------------------------ */
/* Rules driven by team size and cadence                               */
/* ------------------------------------------------------------------ */

function reviewItemsForTeam(teamSize, hasDedicatedQa) {
  const items = [];
  if (teamSize <= SOLO_TEAM_MAX) {
    items.push([
      "Review",
      "Self-review the full diff at least one hour after writing it",
      "With no second reviewer, distance in time is the only substitute available.",
      true,
    ]);
    items.push([
      "Review",
      "Anything security-sensitive or irreversible gets an outside pair of eyes",
      "Solo work is fine until the mistake cannot be undone.",
      true,
    ]);
  } else if (teamSize <= SMALL_TEAM_MAX) {
    items.push(["Review", "Reviewed and approved by one other engineer", "One reviewer is enough at this size and keeps the loop fast.", true]);
  } else if (teamSize >= LARGE_TEAM_MIN) {
    items.push(["Review", "Reviewed and approved by two engineers, one outside the immediate pair", "At this size, knowledge silos form quickly; a second reviewer spreads context.", true]);
    items.push(["Review", "Owning team notified for any change crossing a service boundary", "Cross-team changes are where large-team incidents start.", true]);
  } else {
    items.push(["Review", "Reviewed and approved by at least one other engineer", "The standard rule for a team of this size.", true]);
    items.push(["Review", "Reviewer left at least one substantive comment or an explicit 'no concerns'", "A rubber-stamp approval is worse than no review, because it looks like assurance.", false]);
  }

  if (hasDedicatedQa) {
    items.push(["Review", "Verified by QA against the acceptance criteria", "A dedicated tester is only useful if the handover is part of Done.", true]);
  } else {
    items.push(["Review", "Exploratory pass by someone who did not write the code", "Without a QA function, the exploratory pass has to be scheduled or it does not happen.", false]);
  }
  return items;
}

function cadenceItems(cadenceKey) {
  if (cadenceKey === "continuous") {
    return [
      ["Release", "Change is safe to release the moment it merges", "With continuous deployment, merge is release; there is no staging buffer.", true],
      ["Release", "Rollback path is a revert or a flag flip, not a hotfix", "Recovery time is what matters when you deploy many times a day.", true],
      ["Observability", "Dashboards and alerts cover the new behaviour before merge", "You will find out from production, so make production tell you.", true],
    ];
  }
  if (cadenceKey === "weekly") {
    return [
      ["Release", "Deployed and verified on staging with production-like data", "A weekly cadence gives you a staging step — use it.", true],
      ["Release", "Release notes entry drafted", "Written at the end of the week, release notes are guesswork.", false],
    ];
  }
  return [
    ["Release", "Deployed and verified on staging", "A long cadence means a bug found late waits a full cycle for its fix.", true],
    ["Release", "Migration and rollback steps written down and reviewed", "By release day nobody remembers what this change needed.", true],
    ["Release", "Release notes entry drafted", "Monthly releases bundle enough change that notes stop being optional.", true],
  ];
}

/* ------------------------------------------------------------------ */
/* Generation                                                          */
/* ------------------------------------------------------------------ */

function toItem([section, text, why, mandatory]) {
  return { section, text, why, mandatory: Boolean(mandatory) };
}

/**
 * Build a Definition of Done.
 *
 * @param {object} input
 * @param {string} input.projectTypeKey
 * @param {number} input.teamSize
 * @param {string} input.cadenceKey
 * @param {string[]} input.complianceKeys
 * @param {boolean} input.hasDedicatedQa
 * @param {number} input.coverageTarget percent, 0 disables the coverage item
 */
export function generateDefinitionOfDone({
  projectTypeKey = "web-app",
  teamSize = 5,
  cadenceKey = "weekly",
  complianceKeys = [],
  hasDedicatedQa = false,
  coverageTarget = DEFAULT_COVERAGE_TARGET,
} = {}) {
  const projectType = PROJECT_TYPES.find((entry) => entry.key === projectTypeKey);
  if (!projectType) return { error: "Choose what you are building." };

  const cadence = CADENCES.find((entry) => entry.key === cadenceKey);
  if (!cadence) return { error: "Choose how often the team releases." };

  const size = Math.trunc(Number(teamSize));
  if (!Number.isFinite(size) || size < 1 || size > MAX_TEAM_SIZE) {
    return { error: `Team size must be a whole number from 1 to ${MAX_TEAM_SIZE}.` };
  }

  const coverage = Number(coverageTarget);
  if (!Number.isFinite(coverage) || coverage < MIN_COVERAGE_TARGET || coverage > MAX_COVERAGE_TARGET) {
    return { error: `Coverage target must be between ${MIN_COVERAGE_TARGET} and ${MAX_COVERAGE_TARGET}%.` };
  }

  const regimes = [];
  for (const key of complianceKeys || []) {
    const regime = COMPLIANCE_REGIMES.find((entry) => entry.key === key);
    if (!regime) return { error: `Unknown compliance regime "${key}".` };
    regimes.push(regime);
  }

  const rows = [
    ...BASE_ITEMS,
    ...projectType.items,
    ...reviewItemsForTeam(size, Boolean(hasDedicatedQa)),
    ...cadenceItems(cadence.key),
  ];

  if (coverage > 0) {
    rows.push([
      "Testing",
      `Line coverage for changed files is at least ${coverage}%`,
      "A per-change threshold stops coverage sliding without blocking work on legacy files.",
      true,
    ]);
  }

  for (const regime of regimes) rows.push(...regime.items);

  const items = rows.map(toItem);

  // Group into sections, dropping empty ones and preserving the working order.
  const sections = SECTION_ORDER.map((title) => ({
    title,
    items: items.filter((item) => item.section === title),
  })).filter((section) => section.items.length > 0);

  const mandatoryCount = items.filter((item) => item.mandatory).length;
  const teamBand =
    size <= SOLO_TEAM_MAX ? "Solo" : size <= SMALL_TEAM_MAX ? "Small team" : size >= LARGE_TEAM_MIN ? "Large team" : "Standard team";

  return {
    projectType: projectType.label,
    cadence: cadence.label,
    cadenceNote: cadence.note || "",
    teamSize: size,
    teamBand,
    regimes: regimes.map((regime) => regime.label),
    sections,
    totalItems: items.length,
    mandatoryItems: mandatoryCount,
    optionalItems: items.length - mandatoryCount,
    sectionCount: sections.length,
    coverageTarget: coverage,
  };
}

/** Render a generated Definition of Done as markdown. */
export function toMarkdown(result, title = "Definition of Done") {
  if (!result || result.error) return "";
  const lines = [`# ${title}`, ""];
  lines.push(
    `_${result.projectType} · ${result.teamSize}-person team · ${result.cadence}${
      result.regimes.length ? ` · ${result.regimes.join(", ")}` : ""
    }_`,
  );
  lines.push("");
  for (const section of result.sections) {
    lines.push(`## ${section.title}`);
    for (const item of section.items) {
      lines.push(`- [ ] ${item.text}${item.mandatory ? "" : " _(recommended)_"}`);
    }
    lines.push("");
  }
  lines.push(
    `${result.totalItems} checks — ${result.mandatoryItems} required, ${result.optionalItems} recommended.`,
  );
  return lines.join("\n");
}
