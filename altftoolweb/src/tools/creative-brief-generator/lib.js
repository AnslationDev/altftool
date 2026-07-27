/**
 * Creative brief builder.
 *
 * Structure follows the long-standing agency "one-page brief" model popularised by
 * account-planning practice (BBH / D&AD style briefs): context, objective, audience,
 * a single-minded proposition, reasons to believe, tone, deliverables, mandatories,
 * timing and budget. Nothing here is invented scoring — the completeness figure is a
 * plain weighted count of the sections you have actually filled in.
 */

/** A proposition longer than this stops being "single-minded" and becomes a paragraph. */
export const SMP_MAX_WORDS = 25;

/** Briefs shorter than this read as a request, not a brief. Used only for a warning. */
export const MIN_USEFUL_WORDS = 120;

/** Reasons-to-believe below this count rarely survive a creative review. */
export const MIN_REASONS_TO_BELIEVE = 2;

/**
 * Section order, titles and weights. Weight reflects how load-bearing the section is
 * in a creative review: you can ship a brief with no budget line, never without an
 * objective, an audience and a proposition.
 */
export const BRIEF_SECTIONS = [
  { key: "background", title: "Background", weight: 10, list: false, hint: "Where the business is now and why this work exists." },
  { key: "objective", title: "Objective", weight: 15, list: false, hint: "The one thing this work must achieve." },
  { key: "successMetric", title: "How we will measure success", weight: 10, list: false, hint: "The number that moves if this works." },
  { key: "audience", title: "Target audience", weight: 15, list: false, hint: "Who, described as people rather than a segment code." },
  { key: "insight", title: "Audience insight", weight: 6, list: false, hint: "The tension or truth the work leans on." },
  { key: "proposition", title: "Single-minded proposition", weight: 15, list: false, hint: "One sentence. One idea." },
  { key: "reasonsToBelieve", title: "Reasons to believe", weight: 9, list: true, hint: "Proof points, one per line." },
  { key: "tone", title: "Tone of voice", weight: 5, list: false, hint: "How it should sound, and how it should not." },
  { key: "deliverables", title: "Deliverables", weight: 8, list: true, hint: "Every asset and size, one per line." },
  { key: "channels", title: "Channels", weight: 4, list: false, hint: "Where the work runs." },
  { key: "mandatories", title: "Mandatories", weight: 4, list: true, hint: "Legal lines, logo rules, claims, one per line." },
  { key: "timing", title: "Timing", weight: 5, list: false, hint: "Key dates: first review, sign-off, live." },
  { key: "budget", title: "Budget", weight: 4, list: false, hint: "Production budget or the range you are working to." },
];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Split a textarea into trimmed, non-empty lines with any leading bullet removed. */
export function splitLines(value) {
  return clean(value)
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*••]\s*/, "").trim())
    .filter(Boolean);
}

/** Word count that ignores punctuation-only tokens. */
export function countWords(value) {
  const matches = clean(value).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return matches ? matches.length : 0;
}

/**
 * Build the brief.
 *
 * @param {object} input every BRIEF_SECTIONS key plus projectName, client, owner, date
 * @returns {object} { sections, completeness, missing, warnings, text, markdown, wordCount }
 *                   or { error } when the brief cannot be built at all.
 */
export function buildCreativeBrief(input = {}) {
  const projectName = clean(input.projectName);
  const objective = clean(input.objective);

  if (!projectName) return { error: "Give the project a name — a brief with no name cannot be circulated." };
  if (!objective) return { error: "Add an objective. Everything else in the brief is judged against it." };

  const client = clean(input.client);
  const owner = clean(input.owner);
  const date = clean(input.date);

  const sections = BRIEF_SECTIONS.map((section) => {
    const raw = clean(input[section.key]);
    const items = section.list ? splitLines(raw) : [];
    const filled = section.list ? items.length > 0 : raw.length > 0;
    return { ...section, raw, items, filled };
  });

  const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
  const filledWeight = sections.reduce((sum, section) => sum + (section.filled ? section.weight : 0), 0);
  const completeness = totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;

  const missing = sections.filter((section) => !section.filled).map((section) => section.title);

  const propositionWords = countWords(input.proposition);
  const rtbCount = splitLines(input.reasonsToBelieve).length;

  const bodyWordCount = sections.reduce((sum, section) => sum + countWords(section.raw), 0);

  const warnings = [];
  if (propositionWords > SMP_MAX_WORDS) {
    warnings.push(
      `The proposition runs to ${propositionWords} words. Single-minded usually means ${SMP_MAX_WORDS} or fewer — cut it to one idea.`,
    );
  }
  if (propositionWords > 0 && /\band\b|;|,\s*(also|plus)\b/i.test(clean(input.proposition))) {
    warnings.push("The proposition joins two ideas. Pick the one you would defend if the other were cut.");
  }
  if (rtbCount > 0 && rtbCount < MIN_REASONS_TO_BELIEVE) {
    warnings.push(`Only ${rtbCount} reason to believe. Aim for at least ${MIN_REASONS_TO_BELIEVE} proof points.`);
  }
  if (bodyWordCount > 0 && bodyWordCount < MIN_USEFUL_WORDS) {
    warnings.push(`The brief is ${bodyWordCount} words. Under ${MIN_USEFUL_WORDS} it usually needs a second conversation to be workable.`);
  }
  if (!clean(input.successMetric)) {
    warnings.push("No success measure. Without one the work can only be judged on taste.");
  }

  const heading = [projectName, client && `for ${client}`].filter(Boolean).join(" ");
  const metaLine = [owner && `Brief owner: ${owner}`, date && `Date: ${date}`].filter(Boolean).join("  •  ");

  const textParts = ["CREATIVE BRIEF", heading.toUpperCase()];
  if (metaLine) textParts.push(metaLine);
  textParts.push("");

  const mdParts = [`# Creative brief — ${heading}`];
  if (metaLine) mdParts.push(`_${metaLine}_`);
  mdParts.push("");

  sections.forEach((section) => {
    if (!section.filled) return;
    if (section.list) {
      textParts.push(`${section.title.toUpperCase()}`);
      section.items.forEach((item) => textParts.push(`  - ${item}`));
      textParts.push("");
      mdParts.push(`## ${section.title}`);
      section.items.forEach((item) => mdParts.push(`- ${item}`));
      mdParts.push("");
    } else {
      textParts.push(`${section.title.toUpperCase()}`);
      textParts.push(section.raw);
      textParts.push("");
      mdParts.push(`## ${section.title}`);
      mdParts.push(section.raw);
      mdParts.push("");
    }
  });

  if (missing.length > 0) {
    textParts.push(`STILL TO COMPLETE: ${missing.join(", ")}`);
    mdParts.push(`> **Still to complete:** ${missing.join(", ")}`);
  }

  return {
    projectName,
    client,
    owner,
    date,
    sections,
    completeness,
    missing,
    warnings,
    propositionWords,
    reasonsToBelieveCount: rtbCount,
    wordCount: bodyWordCount,
    text: textParts.join("\n").trim(),
    markdown: mdParts.join("\n").trim(),
  };
}

/** Plain-language label for a completeness score. */
export function completenessLabel(score) {
  if (!Number.isFinite(score)) return "Unknown";
  if (score >= 90) return "Ready to brief in";
  if (score >= 70) return "Nearly there";
  if (score >= 40) return "Half a brief";
  return "Starting point only";
}
