/**
 * Influencer disclosure label generator.
 *
 * Sources for the rules encoded here (all public regulator guidance):
 *
 *  - India: ASCI "Guidelines for Influencer Advertising in Digital Media"
 *    (in force from 14 June 2021, revised since). It permits a closed list of
 *    disclosure labels, requires the label to sit upfront in the first two
 *    lines of the post, and sets minimum on-screen durations for video:
 *      * video shorter than 15 seconds  -> label stays at least 2 seconds
 *      * video 15 seconds to 2 minutes  -> label stays for at least 1/3 of the video
 *      * video longer than 2 minutes    -> label stays for the whole time the
 *        promoted brand is mentioned
 *      * live streams -> label displayed continuously for the promoted portion
 *      * audio -> disclosure announced at the start and end, and around breaks
 *    The Central Consumer Protection Authority's Endorsement Know-hows (2023)
 *    independently require a "material connection" to be disclosed.
 *
 *  - United States: FTC Endorsement Guides, 16 CFR Part 255, revised June 2023,
 *    plus the FTC's "Disclosures 101 for Social Media Influencers". Disclosure
 *    must be clear and conspicuous, unavoidable, and in the same medium as the
 *    claim - video claims need a disclosure in the video itself, and the FTC
 *    recommends both audio and superimposed text for video.
 *
 *  - United Kingdom: the CAP Code (rule 2.1 / 2.4) as enforced by the ASA,
 *    together with the CMA/ASA "Influencer's Guide". The ASA accepts "Ad",
 *    "Advert", "Advertisement", "Ad feature" and "Advertisement feature", and
 *    has repeatedly ruled that "sp", "spon", "collab", "gifted", "in
 *    association with" and a plain brand tag are NOT sufficient on their own.
 *
 * This module is informational. Advertising law differs by country and changes;
 * confirm anything commercially important with the regulator's current guidance
 * or a qualified adviser.
 */

/** ASCI thresholds, in seconds. */
export const ASCI_SHORT_VIDEO_MAX_SECONDS = 15;
export const ASCI_MID_VIDEO_MAX_SECONDS = 120;
/** ASCI floor for videos shorter than 15 seconds. */
export const ASCI_MIN_LABEL_SECONDS = 2;
/** ASCI fraction of the running time for 15s-2min videos. */
export const ASCI_MID_VIDEO_FRACTION = 1 / 3;

/** Longest video this tool will reason about (4 hours). */
export const MAX_VIDEO_SECONDS = 14400;

export const JURISDICTIONS = [
  { id: "in", label: "India (ASCI / CCPA)" },
  { id: "us", label: "United States (FTC)" },
  { id: "uk", label: "United Kingdom (ASA / CMA)" },
  { id: "eu", label: "European Union (UCPD / Omnibus)" },
];

export const RELATIONSHIPS = [
  { id: "paid", label: "Paid post — the brand paid me" },
  { id: "ambassador", label: "Long-term ambassador or retainer" },
  { id: "gifted", label: "Gifted — free product, no fee" },
  { id: "affiliate", label: "Affiliate — I earn commission on sales" },
  { id: "press", label: "Press trip, event or hosted stay" },
  { id: "own", label: "My own brand, or my employer's" },
];

export const PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    /** Instagram truncates a feed caption at roughly 125 characters before "more". */
    previewChars: 125,
    nativeTool: "Paid partnership label (Branded content tool)",
    formats: ["image", "shortVideo", "story", "live"],
  },
  {
    id: "tiktok",
    label: "TikTok",
    previewChars: 100,
    nativeTool: "Branded content toggle",
    formats: ["shortVideo", "live"],
  },
  {
    id: "youtube",
    label: "YouTube",
    /** YouTube shows roughly the first 157 characters of a description before "Show more". */
    previewChars: 157,
    nativeTool: "\"Includes paid promotion\" checkbox",
    formats: ["shortVideo", "longVideo", "live"],
  },
  {
    id: "facebook",
    label: "Facebook",
    previewChars: 125,
    nativeTool: "Branded content tag",
    formats: ["image", "shortVideo", "longVideo", "text", "live"],
  },
  {
    id: "x",
    label: "X (Twitter)",
    previewChars: 280,
    nativeTool: "",
    formats: ["text", "image", "shortVideo"],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    previewChars: 140,
    nativeTool: "",
    formats: ["text", "image", "shortVideo", "longVideo"],
  },
  {
    id: "blog",
    label: "Blog or website",
    previewChars: 300,
    nativeTool: "",
    formats: ["text", "image"],
  },
  {
    id: "podcast",
    label: "Podcast or audio",
    previewChars: 300,
    nativeTool: "",
    formats: ["audio"],
  },
  {
    id: "newsletter",
    label: "Email newsletter",
    previewChars: 300,
    nativeTool: "",
    formats: ["text", "image"],
  },
];

export const FORMATS = [
  { id: "image", label: "Image or carousel post" },
  { id: "shortVideo", label: "Short video (Reel / Short / TikTok)" },
  { id: "longVideo", label: "Long-form video" },
  { id: "story", label: "Story or ephemeral post" },
  { id: "live", label: "Live stream" },
  { id: "text", label: "Text post or article" },
  { id: "audio", label: "Audio episode" },
];

const VIDEO_FORMATS = new Set(["shortVideo", "longVideo", "story", "live"]);

/**
 * Permitted label per jurisdiction and relationship.
 * India's list is closed - ASCI names the exact words that may be used.
 */
const LABELS = {
  in: {
    paid: "Ad",
    ambassador: "Partnership",
    gifted: "Free gift",
    affiliate: "Ad",
    press: "Sponsored",
    own: "Employee",
  },
  us: {
    paid: "Ad",
    ambassador: "Ad",
    gifted: "Ad",
    affiliate: "Ad",
    press: "Ad",
    own: "Ad",
  },
  uk: {
    paid: "Ad",
    ambassador: "Ad",
    gifted: "Ad",
    affiliate: "Ad",
    press: "Ad",
    own: "Ad",
  },
  eu: {
    paid: "Advertisement",
    ambassador: "Advertisement",
    gifted: "Advertisement",
    affiliate: "Advertisement",
    press: "Advertisement",
    own: "Advertisement",
  },
};

/** Plain-language sentence that explains the connection, per relationship. */
const PLAIN_SENTENCE = {
  paid: (brand) => `${brand} paid me to make this post.`,
  ambassador: (brand) => `I am a paid ambassador for ${brand}.`,
  gifted: (brand) => `${brand} sent me this product free of charge.`,
  affiliate: (brand) => `Links to ${brand} are affiliate links — I earn a commission if you buy.`,
  press: (brand) => `${brand} paid for this trip / event.`,
  own: (brand) => `I work for ${brand} / ${brand} is my own brand.`,
};

/** How the caption names the relationship after the label. */
const CAPTION_TAIL = {
  paid: (brand) => `Paid partnership with ${brand}`,
  ambassador: (brand) => `Paid ambassador for ${brand}`,
  gifted: (brand) => `Product gifted by ${brand}`,
  affiliate: (brand) => `Affiliate links to ${brand}`,
  press: (brand) => `Trip hosted by ${brand}`,
  own: (brand) => `${brand} is my own brand / employer`,
};

/** Extra qualifier appended after the label where the relationship needs it. */
const QUALIFIER = {
  paid: "",
  ambassador: "",
  gifted: "gifted",
  affiliate: "affiliate",
  press: "hosted",
  own: "",
};

/** Labels regulators have specifically rejected. */
export const REJECTED_LABELS = [
  "#sp",
  "#spon",
  "#collab",
  "#gifted on its own",
  "#ambassador on its own",
  "thanks to @brand",
  "in association with",
  "a brand tag with no label",
];

/**
 * ASCI minimum time the disclosure must stay on screen.
 *
 * @param {number} videoSeconds running time of the video
 * @param {boolean} isLive true for a live stream
 * @returns {{seconds:number, rule:string}|{error:string}}
 */
export function asciLabelDurationSeconds(videoSeconds, isLive = false) {
  if (isLive) {
    return {
      seconds: 0,
      rule: "Live stream — keep the disclosure on screen for the whole promoted segment.",
      continuous: true,
    };
  }
  const seconds = Number(videoSeconds);
  if (!Number.isFinite(seconds)) return { error: "Enter the video length in seconds." };
  if (seconds <= 0) return { error: "Video length must be greater than zero seconds." };
  if (seconds > MAX_VIDEO_SECONDS) {
    return { error: "Video length looks wrong — keep it under 4 hours (14400 seconds)." };
  }

  if (seconds < ASCI_SHORT_VIDEO_MAX_SECONDS) {
    return {
      seconds: ASCI_MIN_LABEL_SECONDS,
      rule: "Under 15 seconds — the label must stay visible for at least 2 seconds.",
      continuous: false,
    };
  }
  if (seconds <= ASCI_MID_VIDEO_MAX_SECONDS) {
    return {
      seconds: Math.round(seconds * ASCI_MID_VIDEO_FRACTION * 10) / 10,
      rule: "15 seconds to 2 minutes — the label must stay for at least one third of the running time.",
      continuous: false,
    };
  }
  return {
    seconds,
    rule: "Over 2 minutes — keep the label on screen for the whole time the brand is promoted.",
    continuous: true,
  };
}

/**
 * Build a disclosure for one post.
 *
 * @param {object} input
 * @param {string} input.jurisdiction  one of JURISDICTIONS ids
 * @param {string} input.platform      one of PLATFORMS ids
 * @param {string} input.format        one of FORMATS ids
 * @param {string} input.relationship  one of RELATIONSHIPS ids
 * @param {string} input.brand         brand name shown in the caption
 * @param {string} input.leadIn        any text you want before the label
 * @param {number} input.videoSeconds  running time, for video formats
 * @returns {object} label, caption, placement, duration, warnings — or { error }
 */
export function buildDisclosure({
  jurisdiction = "in",
  platform = "instagram",
  format = "image",
  relationship = "paid",
  brand = "",
  leadIn = "",
  videoSeconds = 30,
} = {}) {
  const jur = JURISDICTIONS.find((item) => item.id === jurisdiction);
  if (!jur) return { error: "Choose a country whose rules you want to follow." };

  const plat = PLATFORMS.find((item) => item.id === platform);
  if (!plat) return { error: "Choose a platform." };

  const fmt = FORMATS.find((item) => item.id === format);
  if (!fmt) return { error: "Choose a content format." };
  if (!plat.formats.includes(format)) {
    return { error: `${plat.label} does not have a "${fmt.label}" format — pick another one.` };
  }

  const rel = RELATIONSHIPS.find((item) => item.id === relationship);
  if (!rel) return { error: "Choose how you are connected to the brand." };

  const brandName = String(brand).trim();
  if (!brandName) return { error: "Enter the brand name so the disclosure can name it." };
  if (brandName.length > 60) return { error: "Brand name is too long — keep it under 60 characters." };

  const lead = String(leadIn).trim();

  const label = LABELS[jurisdiction][relationship];
  const qualifier = QUALIFIER[relationship];
  const isVideo = VIDEO_FORMATS.has(format);
  const isLive = format === "live";

  let duration = null;
  if (isVideo) {
    const result = asciLabelDurationSeconds(videoSeconds, isLive);
    if (result.error) return { error: result.error };
    duration = result;
  }

  // The visible label string, e.g. "Ad" or "Ad - affiliate".
  const needsQualifier = Boolean(qualifier) && !label.toLowerCase().includes(qualifier.slice(0, 4));
  const labelText = needsQualifier ? `${label} — ${qualifier}` : label;
  const hashtag = `#${label.toLowerCase().replace(/[^a-z]/g, "")}`;

  const plain = PLAIN_SENTENCE[relationship](brandName);
  const captionLine = `${labelText} · ${CAPTION_TAIL[relationship](brandName)}`;
  const caption = lead ? `${lead}\n${captionLine}` : captionLine;

  // Does the label survive the platform's "more" truncation?
  const labelStart = lead ? lead.length + 1 : 0;
  const labelEnd = labelStart + labelText.length;
  const labelVisible = labelEnd <= plat.previewChars;
  const charsBeforeCut = Math.max(0, plat.previewChars - labelEnd);

  const placement = [];
  if (format === "image" || format === "text") {
    placement.push("Put the label in the first two lines of the caption, before the \"more\" cut.");
    placement.push("Keep it separate from the block of hashtags — a label lost in 20 hashtags is not conspicuous.");
  }
  if (format === "shortVideo" || format === "longVideo") {
    placement.push("Superimpose the label on the video itself, not only in the caption.");
    placement.push("Say it out loud too — viewers who watch muted and viewers who only listen both need it.");
  }
  if (format === "story") {
    placement.push("Superimpose the label over the story frame, in a size and colour that reads against the background.");
    placement.push("Repeat it on every frame of the sponsored sequence, not just the first.");
  }
  if (isLive) {
    placement.push("Keep the label on screen for the entire promoted segment and repeat it verbally as new viewers join.");
  }
  if (format === "audio") {
    placement.push("Announce the disclosure at the start and end of the episode, and either side of every break.");
    placement.push("Repeat it immediately before the sponsored segment — a note in the show description is not enough.");
  }
  if (plat.nativeTool) {
    placement.push(`Also switch on ${plat.label}'s ${plat.nativeTool} — but keep the written label as well, because the platform banner alone has been ruled insufficient.`);
  }

  const warnings = [];
  if (!labelVisible) {
    warnings.push(
      `Your lead-in text pushes the label past the roughly ${plat.previewChars} characters ${plat.label} shows before truncating. Move the label to the very front.`,
    );
  }
  if (jurisdiction === "in") {
    warnings.push(
      "ASCI allows only these words: Advertisement, Ad, Sponsored, Collaboration, Partnership, Employee, Free gift. They may carry a # or @ prefix, and must be in the language of the post.",
    );
  }
  if (jurisdiction === "uk" && relationship === "gifted") {
    warnings.push(
      "In the UK a gifted item still needs \"Ad\" upfront if the brand had any control over what you posted. \"Gifted\" on its own has been ruled insufficient by the ASA.",
    );
  }
  if (jurisdiction === "us" && (relationship === "affiliate" || relationship === "gifted")) {
    warnings.push(
      "The FTC prefers a plain-English sentence over a bare hashtag for commissions and freebies — state the connection in words a scrolling reader will understand.",
    );
  }
  if (jurisdiction === "eu") {
    warnings.push(
      "Translate the label into the language of the audience — for example Werbung or Anzeige in German, Publicité or Collaboration commerciale in French. Several member states also have sector-specific rules.",
    );
  }
  if (isVideo && duration && !duration.continuous) {
    warnings.push(
      `Keep the on-screen label up for at least ${duration.seconds} seconds — a one-frame flash does not count.`,
    );
  }

  return {
    jurisdictionLabel: jur.label,
    platformLabel: plat.label,
    formatLabel: fmt.label,
    relationshipLabel: rel.label,
    label: labelText,
    hashtag,
    caption,
    captionLine,
    plainSentence: plain,
    captionChars: caption.length,
    previewChars: plat.previewChars,
    labelVisible,
    charsBeforeCut,
    duration,
    placement,
    warnings,
    rejected: REJECTED_LABELS,
  };
}
