const REVIEW_CUES = [
  {
    id: "network-copyleft",
    pattern: /\bAGPL(?:-\d(?:\.\d)?(?:-only|-or-later)?)?\b/iu,
    label: "network copyleft review cue",
  },
  {
    id: "copyleft",
    pattern: /\b(?:GPL|LGPL|EUPL|MPL)(?:-\d(?:\.\d)?(?:-only|-or-later)?)?\b/iu,
    label: "copyleft review cue",
  },
  {
    id: "source-available",
    pattern:
      /\b(?:SSPL|BUSL|Commons Clause|PolyForm|Elastic(?: License|-2\.0))\b/iu,
    label: "source-available or additional-terms review cue",
  },
  {
    id: "noncommercial",
    pattern: /\b(?:non[- ]?commercial|NC-\d|CC-BY-NC)\b/iu,
    label: "non-commercial-use wording cue",
  },
  {
    id: "unlicensed",
    pattern: /\b(?:UNLICENSED|SEE LICEN[CS]E IN)\b/iu,
    label: "package-specific or unpublished-license review cue",
  },
];

const UNRESOLVED_LICENSE_PATTERN =
  /(?:^|[\s(])(?:Proprietary|NOASSERTION|NONE|UNKNOWN|LicenseRef-[A-Za-z0-9.+-]+)(?=$|[\s)])/iu;

function findReviewCues(license) {
  return REVIEW_CUES.filter((cue) => cue.pattern.test(license)).map((cue) => ({
    id: cue.id,
    label: cue.label,
  }));
}

export function analyzeDependencyLicenses(inventory) {
  if (!inventory || !Array.isArray(inventory.components)) {
    throw new TypeError("A parsed dependency inventory is required.");
  }

  const findings = inventory.components.map((component) => {
    const license = String(component.license || "").trim();
    const cues = license ? findReviewCues(license) : [];
    const status = !license
      ? "missing"
      : UNRESOLVED_LICENSE_PATTERN.test(license)
        ? "unknown"
        : cues.length
          ? "review"
          : "declared";
    return {
      name: component.name,
      version: component.version,
      declaredRange: component.declaredRange,
      relationship: component.relationship,
      scope: component.scope,
      occurrenceCount: component.occurrenceCount || 1,
      paths: [...(component.paths || (component.path ? [component.path] : []))],
      aliases: [...(component.aliases || [])],
      license,
      status,
      cues,
    };
  });

  const counts = {
    total: findings.length,
    declared: findings.filter((item) => item.status === "declared").length,
    review: findings.filter((item) => item.status === "review").length,
    unknown: findings.filter((item) => item.status === "unknown").length,
    missing: findings.filter((item) => item.status === "missing").length,
  };

  const warnings = [...(inventory.warnings || [])];
  return {
    sourceKind: inventory.sourceKind,
    projectLicense: inventory.project?.license || "",
    counts,
    findings,
    incomplete: Boolean(inventory.truncated || warnings.length),
    warnings,
    limitations: [
      "Only license strings already present in the selected JSON are reviewed.",
      "Review cues are text matches, not SPDX validation, legal advice, or a compatibility decision.",
      "Proprietary, NOASSERTION, NONE, UNKNOWN, and LicenseRef values are kept as unresolved declarations for neutral manual review.",
      "A missing license field does not prove that a package has no license; inspect its distributed license files and authoritative metadata.",
    ],
  };
}

export function buildLicenseReport(analysis) {
  if (!analysis?.counts || !Array.isArray(analysis.findings)) {
    throw new TypeError("A license analysis result is required.");
  }
  return {
    reportType: "altftool-dependency-license-declared-metadata-review",
    sourceKind: analysis.sourceKind,
    counts: { ...analysis.counts },
    incomplete: Boolean(analysis.incomplete),
    warnings: [...(analysis.warnings || [])],
    projectLicenseDeclared: Boolean(analysis.projectLicense),
    findings: analysis.findings.map((finding) => ({
      name: finding.name,
      version: finding.version || null,
      declaredRange: finding.declaredRange || null,
      relationship: finding.relationship,
      scope: finding.scope,
      occurrenceCount: finding.occurrenceCount || 1,
      paths: [...(finding.paths || [])],
      aliases: [...(finding.aliases || [])],
      declaredLicense: finding.license || null,
      status: finding.status,
      reviewCues: finding.cues.map((cue) => cue.label),
    })),
    limitations: [...analysis.limitations],
  };
}
