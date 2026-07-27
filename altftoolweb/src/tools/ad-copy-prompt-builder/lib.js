/**
 * Ad Copy Prompt Builder — assembles a structured LLM prompt for writing paid
 * ad copy that respects each platform's published character limits.
 *
 * Character limits below are the platforms' own documented values:
 * - Google Ads responsive search ads: 30-character headlines (up to 15) and
 *   90-character descriptions (up to 4) — Google Ads Help, "About responsive
 *   search ads".
 * - Meta (Facebook/Instagram) feed ads: recommended 125 characters of primary
 *   text, 40-character headline and 30-character description before
 *   truncation — Meta Ads Guide recommendations.
 * - LinkedIn single-image Sponsored Content: introductory text truncates at
 *   about 150 characters on desktop (600 max) and headlines at about 70
 *   characters (200 max) — LinkedIn advertising specs.
 * - X (Twitter) promoted posts: 280-character post limit, same as organic.
 */

export const PLATFORM_OPTIONS = [
  {
    id: "google-rsa",
    label: "Google Ads — responsive search ad",
    fields: [
      { name: "Headline", maxChars: 30, count: 5, note: "Google allows up to 15 headlines of 30 characters; ask for 5 distinct ones" },
      { name: "Description", maxChars: 90, count: 4, note: "up to 4 descriptions of 90 characters" },
    ],
    platformRules: [
      "No exclamation marks in headlines and no gimmicky punctuation or ALL-CAPS words (Google Ads editorial policy).",
      "Each headline must stand alone — Google mixes and matches them, so none may depend on another.",
      "Include the main keyword naturally in at least 2 headlines.",
    ],
  },
  {
    id: "meta-feed",
    label: "Meta — Facebook/Instagram feed ad",
    fields: [
      { name: "Primary text", maxChars: 125, count: 3, note: "Meta recommends 125 characters before truncation" },
      { name: "Headline", maxChars: 40, count: 3, note: "recommended 40 characters" },
      { name: "Description", maxChars: 30, count: 3, note: "recommended 30 characters" },
    ],
    platformRules: [
      "Never imply knowledge of personal attributes (health, finances, age, religion) — 'Struggling with debt?' is disallowed framing under Meta's personal attributes policy; address the situation, not the reader's condition.",
      "Front-load the hook in the first sentence of primary text; assume everything after ~125 characters is hidden behind 'See more'.",
    ],
  },
  {
    id: "linkedin-sponsored",
    label: "LinkedIn — sponsored content (single image)",
    fields: [
      { name: "Introductory text", maxChars: 150, count: 3, note: "truncates at ~150 characters on desktop" },
      { name: "Headline", maxChars: 70, count: 3, note: "truncates at ~70 characters" },
    ],
    platformRules: [
      "Professional, peer-to-peer tone; lead with the business outcome, not the product name.",
      "Avoid clickbait framing — LinkedIn audiences respond to specificity (numbers, roles, industries).",
    ],
  },
  {
    id: "x-post",
    label: "X (Twitter) — promoted post",
    fields: [
      { name: "Post copy", maxChars: 280, count: 3, note: "280-character post limit" },
    ],
    platformRules: [
      "Write like a person, not a press release; one idea per post.",
      "Leave room for a short link if one will be appended (assume ~24 characters for the t.co link).",
    ],
  },
];

export const ANGLE_OPTIONS = [
  {
    id: "problem-solution",
    label: "Problem → solution",
    instruction: "open on the audience's problem in their own words, then present the product as the specific fix",
  },
  {
    id: "benefit-led",
    label: "Benefit-led",
    instruction: "lead every line with the single most concrete benefit or outcome, stated in measurable terms where possible",
  },
  {
    id: "social-proof",
    label: "Social proof",
    instruction: "build the copy around the supplied proof points (customers, ratings, results) — never invent numbers or testimonials",
  },
  {
    id: "urgency",
    label: "Urgency / offer",
    instruction: "centre the copy on the supplied offer and its genuine deadline — do not fabricate scarcity or countdowns that are not real",
  },
  {
    id: "comparison",
    label: "Comparison / switch",
    instruction: "position against the status quo or the old way of doing things — contrast without naming competitors or making disparaging claims",
  },
];

/** Extra rules appended when the advertiser is in a commonly regulated vertical. */
export const REGULATED_OPTIONS = [
  { id: "none", label: "Not a regulated category", rules: [] },
  {
    id: "finance",
    label: "Finance / credit / investing",
    rules: [
      "No promises or guarantees of returns, approval or savings; use conditional language.",
      "Flag where risk disclosures or APR-style disclaimers are typically required and insert [DISCLOSURE] placeholders — compliance sign-off is mandatory before running.",
    ],
  },
  {
    id: "health",
    label: "Health / wellness",
    rules: [
      "No cure, treatment or guaranteed-result claims; describe support and general benefits only.",
      "Do not imply the reader has a medical condition (also a Meta personal-attributes violation); insert [SUBSTANTIATION] where a claim would need evidence.",
    ],
  },
  {
    id: "employment-housing",
    label: "Employment / housing / credit opportunity",
    rules: [
      "These are special ad categories on Meta and restricted on Google: copy must not reference or imply protected characteristics (age, gender, family status, etc.).",
      "State the opportunity neutrally and factually; targeting restrictions apply regardless of copy.",
    ],
  },
];

export const VARIANT_MIN = 1;
export const VARIANT_MAX = 10;

/** Count words in a plain-text string; empty and whitespace-only strings count as 0. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Build the ad copy prompt.
 * Required: product and keyBenefit — without them there is nothing truthful to
 * advertise, so the builder refuses rather than inviting invented claims.
 */
export function buildAdPrompt({
  product,
  keyBenefit,
  audience = "",
  proofPoints = "",
  offer = "",
  cta = "",
  platformId = "google-rsa",
  angleId = "benefit-led",
  regulatedId = "none",
  variants = 3,
}) {
  const productText = typeof product === "string" ? product.trim() : "";
  const benefitText = typeof keyBenefit === "string" ? keyBenefit.trim() : "";
  if (!productText) return { error: "Name the product or service being advertised." };
  if (!benefitText) return { error: "State the key benefit — the one true claim the ad is built on." };

  const variantCount = Number(variants);
  if (!Number.isInteger(variantCount) || variantCount < VARIANT_MIN || variantCount > VARIANT_MAX) {
    return { error: `Number of ad variants must be a whole number between ${VARIANT_MIN} and ${VARIANT_MAX}.` };
  }

  const platform = PLATFORM_OPTIONS.find((p) => p.id === platformId) ?? PLATFORM_OPTIONS[0];
  const angle = ANGLE_OPTIONS.find((a) => a.id === angleId) ?? ANGLE_OPTIONS[1];
  const regulated = REGULATED_OPTIONS.find((r) => r.id === regulatedId) ?? REGULATED_OPTIONS[0];

  const lines = [];
  lines.push(
    `You are a direct-response copywriter. Write ${variantCount} ad variant${variantCount === 1 ? "" : "s"} for the platform below. Stay strictly inside every character limit — count characters, not words.`,
  );
  lines.push("");
  lines.push(`Platform: ${platform.label}`);
  lines.push("Required fields per variant (hard character limits):");
  platform.fields.forEach((field) => {
    lines.push(`- ${field.name}: max ${field.maxChars} characters, write ${field.count} option${field.count === 1 ? "" : "s"} (${field.note}).`);
  });
  lines.push("");
  lines.push(`Product / service: ${productText}`);
  lines.push(`Key benefit (the core claim): ${benefitText}`);
  if (audience.trim()) lines.push(`Target audience: ${audience.trim()}`);
  if (proofPoints.trim()) lines.push(`Proof points you may cite verbatim (use ONLY these; never invent numbers, reviews or awards): ${proofPoints.trim()}`);
  if (offer.trim()) lines.push(`Offer / promotion (quote exactly, including any deadline): ${offer.trim()}`);
  if (cta.trim()) lines.push(`Call to action to use or adapt: ${cta.trim()}`);
  lines.push("");
  lines.push(`Angle: ${angle.label} — ${angle.instruction}.`);
  lines.push("");
  lines.push("Platform rules:");
  platform.platformRules.forEach((rule) => lines.push(`- ${rule}`));
  lines.push("");
  lines.push("Compliance rules:");
  lines.push("- Every factual claim must come from the inputs above; if a claim needs evidence you were not given, soften it or drop it.");
  lines.push("- No fake urgency, invented statistics, fabricated testimonials or 'best/#1' superlatives without supplied proof.");
  regulated.rules.forEach((rule) => lines.push(`- ${rule}`));
  lines.push("");
  lines.push("Output format: for each variant, label every field, then show its character count in parentheses. After the variants, list any claims a reviewer should verify before launch.");

  const prompt = lines.join("\n");
  const fieldSummary = platform.fields
    .map((f) => `${f.name} ≤ ${f.maxChars} chars ×${f.count}`)
    .join("; ");

  return {
    prompt,
    platformLabel: platform.label,
    fieldSummary,
    angleLabel: angle.label,
    variantCount,
    regulatedLabel: regulated.label,
    promptWords: countWords(prompt),
    promptChars: prompt.length,
  };
}
