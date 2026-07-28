/**
 * Alt text policy generator.
 *
 * The rules below come from the Web Content Accessibility Guidelines and the
 * W3C's own techniques, not from house style:
 *
 *  - SC 1.1.1 Non-text Content (Level A): all non-text content that is
 *    presented to the user has a text alternative that serves the equivalent
 *    purpose. Purely decorative content is implemented so assistive technology
 *    can ignore it - in HTML that means alt="" rather than a missing attribute.
 *  - SC 1.4.5 Images of Text (Level AA): text is used rather than images of
 *    text, except for logotypes and where a particular presentation is
 *    essential. SC 1.4.9 (Level AAA) removes the customisable exception.
 *  - SC 1.1.1 also covers CAPTCHA: the alternative must describe the purpose of
 *    the test, and alternative forms of the test must exist for different
 *    disabilities.
 *  - Complex images such as charts need a short alternative plus a longer
 *    description available in text - W3C technique G92, usually implemented
 *    today with adjacent text or aria-describedby rather than the obsolete
 *    longdesc attribute.
 *  - EN 301 549 in the EU and Section 508 in the US both point at WCAG Level
 *    AA, so an AA target satisfies the common procurement requirements.
 *
 * The 125-character guideline is a practical convention, not a WCAG rule.
 * WCAG sets no character limit; the convention exists because some screen
 * reader and authoring combinations truncate or chunk longer alternatives, and
 * because an alternative that needs more than a sentence is usually describing
 * a complex image that deserves a long description instead.
 *
 * Informational only. An accessibility audit by a qualified specialist is what
 * establishes conformance; a policy document is how you keep it.
 */

/** Practical alt-length convention. WCAG itself sets no limit. */
export const CONVENTIONAL_MAX_ALT_CHARS = 125;
export const MIN_ALLOWED_ALT_CHARS = 40;
export const MAX_ALLOWED_ALT_CHARS = 300;

/** Guardrail on the workload estimate. */
export const MAX_IMAGES_PER_MONTH = 1000000;
export const MAX_SECONDS_PER_IMAGE = 3600;
export const SECONDS_PER_HOUR = 3600;

export const CONFORMANCE_LEVELS = [
  {
    id: "a",
    label: "WCAG 2.2 Level A",
    note: "Covers SC 1.1.1 Non-text Content. Does not require you to avoid images of text.",
  },
  {
    id: "aa",
    label: "WCAG 2.2 Level AA",
    note: "Adds SC 1.4.5 Images of Text. This is the level referenced by EN 301 549 and Section 508.",
  },
  {
    id: "aaa",
    label: "WCAG 2.2 Level AAA",
    note: "Adds SC 1.4.9 Images of Text (No Exception). Rarely adopted site-wide; usually applied to key pages.",
  },
];

export const SURFACES = [
  { id: "web", label: "Website and web app" },
  { id: "cms", label: "CMS-authored articles" },
  { id: "email", label: "Email campaigns" },
  { id: "social", label: "Social media posts" },
  { id: "docs", label: "Documents and PDFs" },
  { id: "product", label: "Product catalogue" },
  { id: "slides", label: "Slide decks" },
];

/**
 * One rule per kind of image. `wcag` names the success criterion the rule
 * implements, `pattern` is the sentence shape authors should follow.
 */
export const CONTENT_TYPES = [
  {
    id: "informative",
    label: "Informative photographs",
    wcag: "1.1.1 (A)",
    rule: "Describe what the image tells the reader that the surrounding text does not. Lead with the subject, then the action, then only the context that carries meaning.",
    pattern: "<subject> <action> <meaningful context>",
    example: "Two site engineers checking a rooftop solar array against a clipboard.",
    avoid: "Do not open with \"image of\" or \"photo of\" — the screen reader already announces that it is a graphic.",
  },
  {
    id: "decorative",
    label: "Decorative images, dividers, background textures",
    wcag: "1.1.1 (A)",
    rule: "Use an empty alt attribute (alt=\"\") so assistive technology skips it. Never omit the attribute entirely and never write \"decorative image\".",
    pattern: "alt=\"\"",
    example: 'alt="" on a gradient banner behind a headline',
    avoid: "Do not use a filename, a keyword string, or a single space as the alternative.",
  },
  {
    id: "functional",
    label: "Icons, buttons and linked images",
    wcag: "1.1.1 (A)",
    rule: "Describe the action, not the picture. The alternative for a linked or clickable image is the destination or the function.",
    pattern: "<verb> <object>",
    example: '"Search" for a magnifying-glass button, not "magnifying glass".',
    avoid: "Do not describe the glyph. \"Envelope\" tells nobody that the button opens the contact form.",
  },
  {
    id: "chart",
    label: "Charts, graphs and data visualisations",
    wcag: "1.1.1 (A) + G92",
    rule: "Short alternative names the chart type and the single takeaway. A long description or a data table adjacent to the chart carries the numbers.",
    pattern: "<chart type> showing <takeaway>. Full data in <where>.",
    example: '"Line chart: monthly active users rose from 12,000 to 41,000 between January and December. Data table follows."',
    avoid: "Do not put every data point in the alt attribute — link or place a table instead.",
  },
  {
    id: "infographic",
    label: "Infographics and diagrams",
    wcag: "1.1.1 (A) + G92",
    rule: "Treat as complex content: short alt naming the subject, plus the full content reproduced as real text on the page.",
    pattern: "<what it explains>. Full description below.",
    example: '"Five-step onboarding flow. Each step is described in the list below."',
    avoid: "Do not ship an infographic whose content exists nowhere except inside the picture.",
  },
  {
    id: "textInImage",
    label: "Images that contain text",
    wcag: "1.4.5 (AA)",
    rule: "Reproduce the wording exactly in the alternative, and prefer real text over an image of text wherever the design allows it.",
    pattern: "<verbatim text on the image>",
    example: '"Free delivery on orders over Rs 999" for a promo tile carrying that line.',
    avoid: "Do not paraphrase or drop the small print — the alternative must carry the same offer and conditions.",
  },
  {
    id: "logo",
    label: "Logos and brand marks",
    wcag: "1.1.1 (A)",
    rule: "Use the organisation name. Where the logo links to the home page, the alternative is the name plus the destination if that is not obvious.",
    pattern: "<organisation name>",
    example: '"Northwind Foods" — or "Northwind Foods, home" for a header logo link.',
    avoid: "Do not write \"logo\" or \"brand mark\" — that is the format, not the information.",
  },
  {
    id: "product",
    label: "Product images",
    wcag: "1.1.1 (A)",
    rule: "Describe the attributes a buyer decides on: what it is, colour, material, and the angle or use shown when several images differ only by view.",
    pattern: "<product> in <colour/material>, <view>",
    example: '"Navy cotton oxford shirt, front view with the collar buttoned."',
    avoid: "Do not repeat the product title verbatim on all eight gallery images.",
  },
  {
    id: "screenshot",
    label: "Screenshots and UI captures",
    wcag: "1.1.1 (A)",
    rule: "Describe the state being demonstrated, not the whole interface. Any instruction inside the screenshot must also exist as text.",
    pattern: "<screen> showing <state being demonstrated>",
    example: '"Billing settings with the annual plan selected and the discount applied."',
    avoid: "Do not rely on a screenshot to carry steps a reader has to follow.",
  },
  {
    id: "people",
    label: "Photographs of people",
    wcag: "1.1.1 (A)",
    rule: "Name the person if they are identified elsewhere on the page. Mention appearance only where it is relevant to the point being made.",
    pattern: "<name>, <role>, <what they are doing>",
    example: '"Dr Anita Rao, chief scientist, speaking at the annual review."',
    avoid: "Do not guess at age, ethnicity, gender or disability.",
  },
  {
    id: "animated",
    label: "GIFs, memes and animations",
    wcag: "1.1.1 (A)",
    rule: "Describe the joke or the sequence in one or two sentences, including any text that appears in the frames.",
    pattern: "<what happens>, <text shown>",
    example: '"Looping clip of a cat knocking a mug off a table, captioned \'me on Mondays\'."',
    avoid: "Do not leave a meme unlabelled on the assumption that everyone recognises it.",
  },
  {
    id: "captcha",
    label: "CAPTCHA and verification images",
    wcag: "1.1.1 (A)",
    rule: "The alternative describes the purpose of the test without defeating it, and an alternative form of the test is offered for a different sense.",
    pattern: "<purpose of the test>",
    example: '"Type the characters shown in the image. An audio version is available."',
    avoid: "Do not reveal the answer, and do not offer only one modality.",
  },
];

export const REVIEW_CADENCES = [
  { id: "sprint", label: "Every sprint", note: "Suits a product team shipping continuously." },
  { id: "monthly", label: "Monthly", note: "Suits a content team with a steady publishing rhythm." },
  { id: "quarterly", label: "Quarterly", note: "The minimum that keeps a policy from going stale." },
  { id: "annual", label: "Annually", note: "Only workable where the image library barely changes." },
];

/**
 * Estimated authoring effort for alt text, in hours per month.
 * Both inputs come from the team's own numbers — nothing is assumed.
 */
export function estimateMonthlyEffortHours(imagesPerMonth, secondsPerImage) {
  const images = Number(imagesPerMonth);
  const seconds = Number(secondsPerImage);
  if (!Number.isFinite(images) || images < 0) {
    return { error: "Images published per month must be zero or more." };
  }
  if (images > MAX_IMAGES_PER_MONTH) {
    return { error: "That volume is beyond what this estimate handles." };
  }
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return { error: "Time per image must be greater than zero seconds." };
  }
  if (seconds > MAX_SECONDS_PER_IMAGE) {
    return { error: "Time per image should be under an hour — check the units." };
  }
  const hours = (images * seconds) / SECONDS_PER_HOUR;
  return {
    hours,
    hoursRounded: Math.round(hours * 10) / 10,
    daysAtSevenHours: Math.round((hours / 7) * 10) / 10,
  };
}

/**
 * Generate the policy.
 *
 * @param {object} input
 * @param {string} input.orgName
 * @param {string[]} input.contentTypeIds  ids from CONTENT_TYPES
 * @param {string[]} input.surfaceIds      ids from SURFACES
 * @param {string} input.level             id from CONFORMANCE_LEVELS
 * @param {number} input.maxChars          house character limit
 * @param {string} input.cadence           id from REVIEW_CADENCES
 * @param {string} input.owner             role that owns the policy
 * @param {boolean} input.blockPublish     CMS blocks publishing without alt text
 * @param {number} input.imagesPerMonth
 * @param {number} input.secondsPerImage
 * @returns {object} sections, metrics and a markdown document — or { error }
 */
export function buildAltTextPolicy({
  orgName = "",
  contentTypeIds = [],
  surfaceIds = [],
  level = "aa",
  maxChars = CONVENTIONAL_MAX_ALT_CHARS,
  cadence = "quarterly",
  owner = "",
  blockPublish = true,
  imagesPerMonth = 200,
  secondsPerImage = 60,
} = {}) {
  const org = String(orgName).trim();
  if (!org) return { error: "Enter the organisation or team name the policy applies to." };
  if (org.length > 80) return { error: "Organisation name is too long — keep it under 80 characters." };

  const conformance = CONFORMANCE_LEVELS.find((item) => item.id === level);
  if (!conformance) return { error: "Choose a WCAG conformance target." };

  const cadenceItem = REVIEW_CADENCES.find((item) => item.id === cadence);
  if (!cadenceItem) return { error: "Choose how often the policy is reviewed." };

  const limit = Number(maxChars);
  if (!Number.isInteger(limit) || limit < MIN_ALLOWED_ALT_CHARS || limit > MAX_ALLOWED_ALT_CHARS) {
    return {
      error: `The house character limit should be a whole number between ${MIN_ALLOWED_ALT_CHARS} and ${MAX_ALLOWED_ALT_CHARS}.`,
    };
  }

  const selectedTypes = CONTENT_TYPES.filter((type) => contentTypeIds.includes(type.id));
  if (selectedTypes.length === 0) {
    return { error: "Select at least one kind of image for the policy to cover." };
  }

  const selectedSurfaces = SURFACES.filter((surface) => surfaceIds.includes(surface.id));
  if (selectedSurfaces.length === 0) {
    return { error: "Select at least one surface the policy applies to." };
  }

  const effort = estimateMonthlyEffortHours(imagesPerMonth, secondsPerImage);
  if (effort.error) return { error: effort.error };

  const coveragePercent = Math.round((selectedTypes.length / CONTENT_TYPES.length) * 100);

  const criteria = Array.from(new Set(selectedTypes.map((type) => type.wcag))).sort();

  const gaps = CONTENT_TYPES.filter((type) => !contentTypeIds.includes(type.id)).map(
    (type) => type.label,
  );

  const qaChecklist = [
    "Every img element has an alt attribute — a missing attribute is a failure, an empty one is a decision.",
    "Decorative images use alt=\"\" and carry no title attribute standing in for it.",
    "No alternative begins with \"image of\", \"picture of\", \"graphic of\" or a file name.",
    `No alternative exceeds ${limit} characters; anything longer becomes a long description.`,
    "Charts and infographics have their content available as real text on the page.",
    "Linked images describe the destination or action rather than the picture.",
    "Text inside an image is reproduced word for word in the alternative.",
    "Alternatives are reviewed with a screen reader, not only read in the CMS field.",
  ];
  if (blockPublish) {
    qaChecklist.push("The CMS blocks publishing when a non-decorative image has no alternative.");
  } else {
    qaChecklist.push(
      "Because the CMS does not block publishing, a pre-publish spot check is part of the editor's sign-off.",
    );
  }
  if (level !== "a") {
    qaChecklist.push(
      "Images of text are replaced with real text unless they are a logotype or the presentation is essential.",
    );
  }

  const roles = [
    ["Author or designer", "Writes the first alternative at the point the image is added."],
    ["Editor or reviewer", "Checks the alternative against this policy before publishing."],
    [
      owner.trim() || "Accessibility owner",
      `Owns this policy, answers judgement calls and reviews it ${cadenceItem.label.toLowerCase()}.`,
    ],
  ];

  const markdown = [
    `# Alt text policy — ${org}`,
    "",
    `**Conformance target:** ${conformance.label}. ${conformance.note}`,
    `**Applies to:** ${selectedSurfaces.map((surface) => surface.label).join(", ")}.`,
    `**House limit:** ${limit} characters for a short alternative.`,
    `**Review:** ${cadenceItem.label.toLowerCase()} — ${cadenceItem.note.toLowerCase()}`,
    "",
    "## Rules by content type",
    "",
    ...selectedTypes.flatMap((type) => [
      `### ${type.label}  — WCAG ${type.wcag}`,
      type.rule,
      `Pattern: \`${type.pattern}\``,
      `Example: ${type.example}`,
      type.avoid,
      "",
    ]),
    "## Quality checks before publishing",
    "",
    ...qaChecklist.map((item) => `- ${item}`),
    "",
    "## Who does what",
    "",
    ...roles.map(([role, duty]) => `- **${role}:** ${duty}`),
    "",
    "## Notes",
    "",
    "- WCAG sets no character limit for alt text. The limit above is a house convention that keeps short alternatives short and pushes complex images towards a proper long description.",
    "- An empty alt attribute is a deliberate statement that the image is decorative. A missing alt attribute is a defect.",
    "- This policy documents practice; it is not a conformance claim. A specialist audit is what establishes conformance.",
  ].join("\n");

  return {
    org,
    conformance,
    cadence: cadenceItem,
    surfaces: selectedSurfaces,
    types: selectedTypes,
    criteria,
    gaps,
    qaChecklist,
    roles,
    maxChars: limit,
    ruleCount: selectedTypes.length,
    coveragePercent,
    effortHours: effort.hoursRounded,
    effortDays: effort.daysAtSevenHours,
    markdown,
  };
}
