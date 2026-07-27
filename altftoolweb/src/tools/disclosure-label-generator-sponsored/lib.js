/**
 * Sponsored-content disclosure builder.
 *
 * The wording and placement rules encoded below are drawn from published regulator guidance:
 *  - United States: FTC Endorsement Guides, 16 CFR Part 255, and the FTC's "Disclosures 101
 *    for Social Media Influencers" — disclosures must be clear and conspicuous, hard to miss,
 *    in the same language as the endorsement, and must not be buried in a link, a bio, or a
 *    block of hashtags. The FTC explicitly warns against vague tags such as "sp", "spon",
 *    "collab", "thanks [brand]" and "ambassador" used alone.
 *  - United Kingdom: the CAP Code as enforced by the ASA, which asks for a prominent "Ad"
 *    (or "Advertisement") label at the start of the content, visible before any interaction.
 *  - India: the ASCI Guidelines for Influencer Advertising in Digital Media, which list the
 *    permitted labels and require them upfront in the first two lines, on the post itself
 *    rather than in a comment.
 *
 * Informational only — this is not legal advice.
 */

/** Labels each regulator names as acceptable. Order matters: index 0 is the default. */
export const REGIONS = {
  us: {
    label: "United States (FTC)",
    authority: "FTC Endorsement Guides, 16 CFR Part 255",
    approvedLabels: ["#Ad", "#Sponsored", "Advertisement", "Paid partnership"],
    rules: [
      "Disclosure must be clear and conspicuous — hard to miss, not hidden behind a 'more' link, and in the same language as the post.",
      "A platform's own 'paid partnership' tool alone may not be enough; the FTC expects your own disclosure in the content as well.",
    ],
  },
  uk: {
    label: "United Kingdom (ASA / CAP Code)",
    authority: "CAP Code, enforced by the ASA",
    approvedLabels: ["Ad", "Advertisement", "#Ad"],
    rules: [
      "The ASA expects a prominent 'Ad' label at the very start of the content, visible without tapping 'more'.",
      "'Ad' works; 'affiliate', 'sp', 'gifted' alone are treated as insufficiently clear for paid ads.",
    ],
  },
  in: {
    label: "India (ASCI)",
    authority: "ASCI Guidelines for Influencer Advertising in Digital Media",
    approvedLabels: [
      "#Ad",
      "#Advertisement",
      "#Sponsored",
      "#Collaboration",
      "#Partnership",
      "#Employee",
      "#FreeGift",
    ],
    rules: [
      "ASCI requires the label upfront and within the first two lines, so it is visible without expanding the caption.",
      "The label must be on the post itself, not only in a comment, and must be in the same language as the post.",
    ],
  },
  other: {
    label: "Other / international",
    authority: "General advertising-standards practice",
    approvedLabels: ["#Ad", "#Sponsored", "Advertisement"],
    rules: [
      "Where no local rule is written down, follow the strictest market you publish into — usually a plain 'Ad' at the start.",
    ],
  },
};

/**
 * Relationship types. `needsBrand` marks the ones where the brand has to be named for the
 * disclosure to mean anything.
 */
export const RELATIONSHIPS = {
  paid: {
    label: "Paid post / paid partnership",
    template: "Paid partnership with {brand}",
    needsBrand: true,
    note: "Money changed hands, so this is straightforwardly an advertisement.",
  },
  gifted: {
    label: "Free product / gifted item",
    template: "{brand} sent me this free to try",
    needsBrand: true,
    note: "A free product is a material connection even with no payment and no obligation to post.",
  },
  affiliate: {
    label: "Affiliate / commission links",
    template: "Contains affiliate links — I earn a commission from {brand} if you buy",
    needsBrand: true,
    note: "Commission has to be disclosed near the link itself, not only at the bottom of the page.",
  },
  ambassador: {
    label: "Brand ambassador / ongoing deal",
    template: "Paid {brand} ambassador",
    needsBrand: true,
    note: "The word 'ambassador' on its own is not a disclosure — pair it with Ad or Paid.",
  },
  employee: {
    label: "Employee or contractor of the brand",
    template: "I work for {brand}",
    needsBrand: true,
    note: "Employment is a material connection and must be stated when you endorse your employer.",
  },
  ownBrand: {
    label: "My own company / financial interest",
    template: "{brand} is my own company",
    needsBrand: true,
    note: "Ownership or equity is a material connection just as much as a fee is.",
  },
  trip: {
    label: "Paid trip, event or hosted stay",
    template: "{brand} paid for this trip",
    needsBrand: true,
    note: "Travel, tickets and hotel stays are payment in kind and need the same disclosure.",
  },
  giveaway: {
    label: "Contest or giveaway with a brand",
    template: "Giveaway in partnership with {brand}",
    needsBrand: true,
    note: "Prize sponsorship is a material connection; the entry terms do not replace the label.",
  },
};

/**
 * Platform placement rules.
 *  - firstLineLimit: characters visible before the caption is truncated with "more" on that
 *    surface (Instagram feed captions truncate around 125 characters; X posts cap at 280).
 *    0 means the platform does not truncate in a way that hides the opening line.
 */
export const PLATFORMS = {
  instagramFeed: {
    label: "Instagram feed post",
    firstLineLimit: 125,
    builtInTool: "Paid partnership label",
    placement: [
      "Put the label as the very first thing in the caption, before the hook.",
      "Instagram truncates feed captions around 125 characters — the label must land before the 'more' cut.",
      "Turn on the Paid partnership label as well, but do not rely on it by itself.",
    ],
  },
  instagramStory: {
    label: "Instagram Story",
    firstLineLimit: 0,
    builtInTool: "Paid partnership label",
    placement: [
      "Superimpose the label as text on the frame itself — a sticker link or swipe-up is not a disclosure.",
      "Repeat it on every sponsored frame, not just the first one; viewers tap through.",
      "Keep the text large enough to read on a phone and off any area covered by the UI.",
    ],
  },
  reelsTikTok: {
    label: "Reels / TikTok / Shorts",
    firstLineLimit: 100,
    builtInTool: "Branded content toggle",
    placement: [
      "Superimpose the label on the video itself and keep it on screen while the product is featured.",
      "Say it out loud too — many people watch with the caption collapsed or the sound on and eyes off.",
      "Short captions truncate fast, so the label goes first, before the hook and before any hashtags.",
    ],
  },
  youtubeVideo: {
    label: "YouTube video",
    firstLineLimit: 100,
    builtInTool: "'Includes paid promotion' checkbox",
    placement: [
      "Disclose verbally in the first few seconds and with an on-screen title card, not only in the description.",
      "Only the first ~100 characters of the description show above 'Show more', so repeat the label there too.",
      "Tick the 'contains paid promotion' box in YouTube Studio in addition to your own disclosure.",
    ],
  },
  xPost: {
    label: "X / Twitter post",
    firstLineLimit: 280,
    builtInTool: "",
    placement: [
      "Start the post with the label; a post can be quoted or embedded without your thread context.",
      "Repeat the label in each post of a sponsored thread — people arrive mid-thread.",
    ],
  },
  facebook: {
    label: "Facebook post",
    firstLineLimit: 125,
    builtInTool: "Branded content tag",
    placement: [
      "Lead with the label — Facebook collapses longer posts behind 'See more'.",
      "Use the branded content tag as well so the brand is named in the post header.",
    ],
  },
  linkedin: {
    label: "LinkedIn post",
    firstLineLimit: 140,
    builtInTool: "",
    placement: [
      "LinkedIn hides the rest of a post behind '…see more' after roughly 140 characters, so the label goes first.",
      "State the commercial relationship in plain words — this audience reads the disclosure as credibility.",
    ],
  },
  blog: {
    label: "Blog post / article",
    firstLineLimit: 0,
    builtInTool: "",
    placement: [
      "Put the disclosure above the fold, before the first affiliate link — not in the footer or a separate policy page.",
      "Repeat it next to any in-article buy button or price table.",
    ],
  },
  newsletter: {
    label: "Email newsletter",
    firstLineLimit: 0,
    builtInTool: "",
    placement: [
      "Disclose at the top of the sponsored section, in the same size and colour as the body text.",
      "If the whole issue is sponsored, say so above the first paragraph, not in the footer.",
    ],
  },
  podcast: {
    label: "Podcast episode",
    firstLineLimit: 0,
    builtInTool: "",
    placement: [
      "Read the disclosure aloud before the endorsement — show notes alone do not reach listeners.",
      "Add the label to the episode description as well for anyone reading in a podcast app.",
    ],
  },
  liveStream: {
    label: "Live stream (Twitch / YouTube Live)",
    firstLineLimit: 0,
    builtInTool: "",
    placement: [
      "Keep a persistent on-screen label while the sponsored segment runs.",
      "Repeat the disclosure verbally at intervals — viewers join part-way through a stream.",
    ],
  },
};

/** Tags regulators single out as too vague to count as a disclosure. */
export const VAGUE_TAGS = [
  "sp",
  "spon",
  "collab",
  "thanks",
  "thankyou",
  "ambassador",
  "partner",
  "sponsoredby",
  "gifted",
  "aff",
];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/**
 * Build a disclosure label and full disclosure line for one platform.
 * Pure function: same inputs always produce the same output.
 *
 * @returns {{error: string} | {label: string, line: string, chars: number,
 *   firstLineLimit: number, fitsBeforeTruncation: boolean, placement: string[],
 *   warnings: string[], authority: string, approvedLabels: string[]}}
 */
export function buildDisclosure(input = {}) {
  const platformKey = clean(input.platform) || "instagramFeed";
  const regionKey = clean(input.region) || "us";
  const relationshipKey = clean(input.relationship) || "paid";

  const platform = PLATFORMS[platformKey];
  if (!platform) return { error: "Pick a platform from the list." };

  const region = REGIONS[regionKey];
  if (!region) return { error: "Pick the market whose rules you are publishing under." };

  const relationship = RELATIONSHIPS[relationshipKey];
  if (!relationship) return { error: "Pick how you are connected to the brand." };

  const brand = clean(input.brand);
  if (relationship.needsBrand && !brand) {
    return { error: "Enter the brand name — a disclosure has to say who the relationship is with." };
  }
  if (brand.length > 60) {
    return { error: "Brand name is too long for a caption label. Use the trading name, under 60 characters." };
  }

  const requestedLabel = clean(input.label);
  const label = requestedLabel || region.approvedLabels[0];
  const detail = relationship.template.replace("{brand}", brand || "the brand");
  const line = `${label} — ${detail}`;

  const chars = line.length;
  const firstLineLimit = platform.firstLineLimit;
  const fitsBeforeTruncation = firstLineLimit === 0 || chars <= firstLineLimit;

  const warnings = [];
  const bare = label.replace(/[#\s]/g, "").toLowerCase();
  if (VAGUE_TAGS.includes(bare)) {
    warnings.push(
      `"${label}" is on the list of tags regulators call too vague to count as a disclosure. Use ${region.approvedLabels[0]} instead.`,
    );
  }
  if (!fitsBeforeTruncation) {
    warnings.push(
      `This line is ${chars} characters but only about ${firstLineLimit} show before the caption is cut off. Shorten the wording or move the brand name later.`,
    );
  }
  // Match whole words only: "Ambassador" happens to contain the letters "ad".
  const carriesAdWord = /(^|[^a-z])(ad|advert|advertisement|sponsored|sponsor|paid)([^a-z]|$)/i.test(label);
  if (relationshipKey === "ambassador" && !carriesAdWord) {
    warnings.push("'Ambassador' on its own is not treated as a disclosure — keep Ad, Sponsored or Paid in the label.");
  }
  if (relationshipKey === "affiliate") {
    warnings.push("Affiliate commission has to be disclosed next to the link itself, not only at the top of the page.");
  }
  if (platform.builtInTool) {
    warnings.push(
      `Switch on the platform's ${platform.builtInTool} as well — regulators treat it as an extra signal, not a substitute for your own wording.`,
    );
  }

  return {
    label,
    line,
    detail,
    chars,
    firstLineLimit,
    fitsBeforeTruncation,
    placement: platform.placement,
    warnings,
    regionRules: region.rules,
    authority: region.authority,
    approvedLabels: region.approvedLabels,
    relationshipNote: relationship.note,
  };
}
