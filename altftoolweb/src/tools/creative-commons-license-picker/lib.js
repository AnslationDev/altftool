/**
 * Creative Commons licence picker and attribution builder.
 *
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * The chooser reproduces the two questions the Creative Commons licence suite
 * is built on — may others use the work commercially, and may they share
 * adaptations — and maps the answers onto the six 4.0 licences plus the CC0
 * public domain dedication.
 *
 * Facts encoded here:
 *  - Every current Creative Commons licence includes the BY (attribution)
 *    condition; the "CC BY" family replaced the withdrawn attribution-free
 *    variants years ago.
 *  - ND and SA are mutually exclusive: SA governs how adaptations are shared,
 *    and ND forbids sharing adaptations at all.
 *  - CC BY, CC BY-SA and CC0 are Approved for Free Cultural Works. Licences
 *    carrying NC or ND are not.
 *  - CC licences are irrevocable. You can stop distributing under them, but
 *    anyone who already received a copy keeps their licence.
 *  - Creative Commons itself recommends against applying its licences to
 *    software, and points to purpose-built open source licences instead.
 *  - The recommended attribution pattern is TASL: Title, Author, Source,
 *    Licence — plus a note when the work has been changed.
 */

/** Canonical licence records. Codes and URLs follow creativecommons.org. */
export const LICENCES = {
  cc0: {
    id: "cc0",
    code: "CC0 1.0",
    name: "CC0 1.0 Universal Public Domain Dedication",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
    version: "1.0",
    requiresAttribution: false,
    allowsCommercial: true,
    allowsAdaptations: true,
    shareAlike: false,
    freeCulturalWork: true,
    summary:
      "You waive every right you can, worldwide. Anyone may copy, change, sell and republish the work without asking or crediting you.",
  },
  by: {
    id: "by",
    code: "CC BY 4.0",
    name: "Attribution 4.0 International",
    url: "https://creativecommons.org/licenses/by/4.0/",
    version: "4.0",
    requiresAttribution: true,
    allowsCommercial: true,
    allowsAdaptations: true,
    shareAlike: false,
    freeCulturalWork: true,
    summary:
      "The most permissive licence in the suite. Anyone may copy, adapt and sell the work in any medium, as long as they credit you.",
  },
  bySa: {
    id: "bySa",
    code: "CC BY-SA 4.0",
    name: "Attribution-ShareAlike 4.0 International",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
    version: "4.0",
    requiresAttribution: true,
    allowsCommercial: true,
    allowsAdaptations: true,
    shareAlike: true,
    freeCulturalWork: true,
    summary:
      "Copyleft for creative work. Adaptations are allowed, including commercially, but must be released under this same licence.",
  },
  byNd: {
    id: "byNd",
    code: "CC BY-ND 4.0",
    name: "Attribution-NoDerivatives 4.0 International",
    url: "https://creativecommons.org/licenses/by-nd/4.0/",
    version: "4.0",
    requiresAttribution: true,
    allowsCommercial: true,
    allowsAdaptations: false,
    shareAlike: false,
    freeCulturalWork: false,
    summary:
      "Share it anywhere, including commercially, but only unchanged and in full. Adapted versions may not be published.",
  },
  byNc: {
    id: "byNc",
    code: "CC BY-NC 4.0",
    name: "Attribution-NonCommercial 4.0 International",
    url: "https://creativecommons.org/licenses/by-nc/4.0/",
    version: "4.0",
    requiresAttribution: true,
    allowsCommercial: false,
    allowsAdaptations: true,
    shareAlike: false,
    freeCulturalWork: false,
    summary:
      "Copying and adaptation are allowed for non-commercial purposes only. Adaptations need not use the same licence.",
  },
  byNcSa: {
    id: "byNcSa",
    code: "CC BY-NC-SA 4.0",
    name: "Attribution-NonCommercial-ShareAlike 4.0 International",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    version: "4.0",
    requiresAttribution: true,
    allowsCommercial: false,
    allowsAdaptations: true,
    shareAlike: true,
    freeCulturalWork: false,
    summary:
      "Non-commercial adaptation is allowed, and every adaptation has to carry this same licence.",
  },
  byNcNd: {
    id: "byNcNd",
    code: "CC BY-NC-ND 4.0",
    name: "Attribution-NonCommercial-NoDerivatives 4.0 International",
    url: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    version: "4.0",
    requiresAttribution: true,
    allowsCommercial: false,
    allowsAdaptations: false,
    shareAlike: false,
    freeCulturalWork: false,
    summary:
      "The most restrictive licence in the suite. Others may only redistribute the work unchanged, and only for non-commercial purposes.",
  },
};

/** Answers to the commercial-use question. */
export const COMMERCIAL_OPTIONS = {
  yes: { id: "yes", label: "Yes — including for commercial purposes" },
  no: { id: "no", label: "No — non-commercial use only" },
};

/** Answers to the adaptation question. */
export const ADAPTATION_OPTIONS = {
  yes: { id: "yes", label: "Yes, and adaptations can use any licence" },
  shareAlike: { id: "shareAlike", label: "Yes, but adaptations must use this same licence" },
  no: { id: "no", label: "No — share the work unchanged only" },
};

/** Types of work, used to warn where a CC licence is the wrong instrument. */
export const WORK_TYPES = {
  image: { id: "image", label: "Photograph, illustration or design" },
  writing: { id: "writing", label: "Article, book or documentation" },
  audioVideo: { id: "audioVideo", label: "Music, podcast or video" },
  data: { id: "data", label: "Dataset or database" },
  software: { id: "software", label: "Software or source code" },
};

const MAX_FIELD_LENGTH = 300;

const clean = (value) => String(value ?? "").trim().replace(/\s+/g, " ");

/** Minimal HTML escaping for the generated attribution snippet. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Accepts only absolute http and https URLs. */
export function isSafeUrl(value) {
  const text = clean(value);
  if (!text) return false;
  return /^https?:\/\/[^\s"'<>]+$/i.test(text);
}

/**
 * Pick the licence that matches the two answers.
 */
export function pickLicence({ commercial = "yes", adaptations = "yes", publicDomain = false } = {}) {
  if (publicDomain === true) return { licence: LICENCES.cc0, impossible: false };
  if (publicDomain !== false) return { error: "Public domain dedication must be yes or no." };

  const commercialOption = COMMERCIAL_OPTIONS[commercial];
  const adaptationOption = ADAPTATION_OPTIONS[adaptations];
  if (!commercialOption) return { error: "Answer whether commercial use is allowed." };
  if (!adaptationOption) return { error: "Answer whether adaptations are allowed." };

  const nc = commercial === "no";
  if (adaptations === "no") return { licence: nc ? LICENCES.byNcNd : LICENCES.byNd, impossible: false };
  if (adaptations === "shareAlike") return { licence: nc ? LICENCES.byNcSa : LICENCES.bySa, impossible: false };
  return { licence: nc ? LICENCES.byNc : LICENCES.by, impossible: false };
}

/**
 * Build the licence choice, the permissions summary, the warnings and the
 * attribution strings.
 */
export function buildLicenceGuidance({
  commercial = "yes",
  adaptations = "yes",
  publicDomain = false,
  workType = "image",
  title = "",
  creator = "",
  sourceUrl = "",
  modified = false,
  modificationNote = "",
} = {}) {
  const type = WORK_TYPES[workType];
  if (!type) return { error: "Choose the kind of work you are licensing." };
  if (typeof modified !== "boolean") return { error: "Say whether the work has been modified." };

  const picked = pickLicence({ commercial, adaptations, publicDomain });
  if (picked.error) return { error: picked.error };
  const licence = picked.licence;

  const cleanTitle = clean(title).slice(0, MAX_FIELD_LENGTH);
  const cleanCreator = clean(creator).slice(0, MAX_FIELD_LENGTH);
  const cleanNote = clean(modificationNote).slice(0, MAX_FIELD_LENGTH);
  const cleanUrl = clean(sourceUrl).slice(0, MAX_FIELD_LENGTH);
  const urlOk = cleanUrl === "" || isSafeUrl(cleanUrl);
  if (!urlOk) {
    return { error: "The source link must be a full http or https URL, or left blank." };
  }

  const permissions = [
    {
      id: "share",
      label: "Copy and redistribute in any medium or format",
      allowed: true,
      detail: "All Creative Commons tools grant this.",
    },
    {
      id: "commercial",
      label: "Use for commercial purposes",
      allowed: licence.allowsCommercial,
      detail: licence.allowsCommercial
        ? "Including in advertising, paid products and anything a business does to make money."
        : "Any use primarily intended for commercial advantage or monetary compensation is outside this licence.",
    },
    {
      id: "adapt",
      label: "Remix, transform and build upon the work",
      allowed: licence.allowsAdaptations,
      detail: licence.allowsAdaptations
        ? licence.shareAlike
          ? "Allowed, but the adaptation has to be released under this same licence."
          : "Allowed, and the adaptation may carry a different licence."
        : "Cropping, translating, remixing and republishing an edited version are all forbidden.",
    },
    {
      id: "attribution",
      label: "Use without crediting the creator",
      allowed: !licence.requiresAttribution,
      detail: licence.requiresAttribution
        ? "Attribution is mandatory: name the creator, the work, the source and the licence."
        : "CC0 asks for no credit, though giving it is still good practice.",
    },
  ];

  const warnings = [];
  if (adaptations === "no" && commercial === "no" && !publicDomain) {
    warnings.push({
      id: "most-restrictive",
      severity: "info",
      text: "This is the most restrictive Creative Commons licence. Teachers, archives and translators often cannot use it, so consider whether you need both conditions.",
    });
  }
  if (!licence.freeCulturalWork) {
    warnings.push({
      id: "free-cultural",
      severity: "info",
      text: "Licences carrying NC or ND are not Approved for Free Cultural Works, and several projects — Wikipedia and Wikimedia Commons among them — will not accept material under them.",
    });
  }
  if (!licence.allowsCommercial) {
    warnings.push({
      id: "nc-vague",
      severity: "warning",
      text: "The NC term is not precisely defined. Whether a school, a charity or an ad-supported blog counts as commercial is genuinely unclear, which puts good-faith reusers off.",
    });
  }
  if (workType === "software") {
    warnings.push({
      id: "software",
      severity: "warning",
      text: "Creative Commons recommends not using its licences for software. They do not address source code distribution, patent grants or warranty disclaimers. Use an OSI-approved open source licence instead.",
    });
  }
  if (workType === "data") {
    warnings.push({
      id: "data",
      severity: "info",
      text: "For databases, CC0 or CC BY 4.0 are the usual choices. Version 4.0 explicitly covers sui generis database rights, which earlier versions did not.",
    });
  }
  warnings.push({
    id: "irrevocable",
    severity: "warning",
    text: "Creative Commons licences cannot be revoked. You may stop distributing the work, but everyone who already has a copy keeps their licence permanently.",
  });
  warnings.push({
    id: "ownership",
    severity: "warning",
    text: "Only apply a licence to work whose rights you hold. If a client owns the copyright, or the work includes third-party material, you cannot license it out.",
  });

  // TASL: Title, Author, Source, Licence.
  const titlePart = cleanTitle ? `"${cleanTitle}"` : "This work";
  const creatorPart = cleanCreator ? ` by ${cleanCreator}` : "";
  const sourcePart = cleanUrl ? `, from ${cleanUrl},` : "";
  const modifiedPart = modified ? ` ${cleanNote || "Modified from the original."}` : "";

  const attributionText = licence.requiresAttribution
    ? `${titlePart}${creatorPart}${sourcePart} is licensed under ${licence.code} (${licence.url}).${modifiedPart}`.replace(
        /,\s+is licensed/,
        " is licensed",
      )
    : `${titlePart}${creatorPart} has been dedicated to the public domain under ${licence.code} (${licence.url}).${modifiedPart}`;

  const linkedTitle = cleanUrl
    ? `<a href="${escapeHtml(cleanUrl)}">${escapeHtml(cleanTitle || "This work")}</a>`
    : escapeHtml(cleanTitle || "This work");
  const htmlCreator = cleanCreator ? ` by ${escapeHtml(cleanCreator)}` : "";
  const licenceLink = `<a href="${escapeHtml(licence.url)}" rel="license noopener noreferrer" target="_blank">${escapeHtml(licence.code)}</a>`;
  const attributionHtml = licence.requiresAttribution
    ? `<p>${linkedTitle}${htmlCreator} is licensed under ${licenceLink}.${modified ? ` ${escapeHtml(cleanNote || "Modified from the original.")}` : ""}</p>`
    : `<p>${linkedTitle}${htmlCreator} has been dedicated to the public domain under ${licenceLink}.${modified ? ` ${escapeHtml(cleanNote || "Modified from the original.")}` : ""}</p>`;

  const missing = [];
  if (licence.requiresAttribution) {
    if (!cleanTitle) missing.push("title of the work");
    if (!cleanCreator) missing.push("creator name");
    if (!cleanUrl) missing.push("link to the original");
  }

  return {
    licence,
    commercial,
    adaptations,
    publicDomain: publicDomain === true,
    workType: type.id,
    workTypeLabel: type.label,
    permissions,
    allowedCount: permissions.filter((permission) => permission.allowed).length,
    totalPermissions: permissions.length,
    warnings,
    attributionText,
    attributionHtml,
    missingAttributionFields: missing,
    attributionComplete: missing.length === 0,
  };
}

/** Plain-text summary for pasting into a licence page or a README. */
export function formatGuidance(result) {
  if (!result || result.error) return "";
  return [
    `Recommended licence: ${result.licence.name}`,
    `Short code: ${result.licence.code}`,
    `Deed: ${result.licence.url}`,
    "",
    result.licence.summary,
    "",
    "What others may do",
    ...result.permissions.map(
      (permission) => `${permission.allowed ? "[yes]" : "[no] "} ${permission.label} — ${permission.detail}`,
    ),
    "",
    "Attribution to give the reuser",
    result.attributionText,
    "",
    "HTML",
    result.attributionHtml,
    "",
    "Points to be aware of",
    ...result.warnings.map((warning) => `- ${warning.text}`),
    "",
    "Informational only. Licensing your work is a legal decision — take advice if the work is commercially significant or if you do not clearly hold the rights.",
  ].join("\n");
}
