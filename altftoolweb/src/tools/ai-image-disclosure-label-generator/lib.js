/**
 * AI disclosure label builder.
 *
 * The wording, the machine-readable tag and the obligation warnings produced here follow
 * published standards and rules rather than house style:
 *
 *  - IPTC "Digital Source Type" NewsCodes vocabulary (cv.iptc.org/newscodes/digitalsourcetype/)
 *    — the term set news agencies, Adobe, Google and Microsoft use to record how a piece of
 *    media was made. Google Images surfaces "AI generated with" from this field.
 *  - C2PA / Content Credentials — the provenance manifest embedded in the file itself.
 *  - Regulation (EU) 2024/1689 (the EU AI Act), Article 50(2) and Article 50(4).
 *  - 16 CFR Part 465, the FTC's Rule on the Use of Consumer Reviews and Testimonials.
 *
 * Nothing here is legal advice; it is a drafting aid.
 */

/**
 * IPTC digitalsourcetype NewsCodes term identifiers.
 * Source: http://cv.iptc.org/newscodes/digitalsourcetype/
 */
export const IPTC_SOURCE_TYPE_BASE = "http://cv.iptc.org/newscodes/digitalsourcetype/";

/**
 * Article 50(4) of the EU AI Act (deep fake disclosure by deployers) becomes applicable on
 * 2 August 2026 under Article 113 of the same Regulation.
 */
export const EU_AI_ACT_ARTICLE_50_APPLICATION_DATE = "2 August 2026";

/**
 * The FTC's Rule on the Use of Consumer Reviews and Testimonials, 16 CFR Part 465, took
 * effect on 21 October 2024 and reaches AI-generated fake reviews and testimonials.
 */
export const FTC_REVIEWS_RULE_EFFECTIVE_DATE = "21 October 2024";

/** How much of the work the model actually did. Drives both wording and the IPTC term. */
export const INVOLVEMENT_LEVELS = [
  {
    id: "fully-generated",
    label: "Fully generated from a prompt",
    hint: "Every pixel came out of a generative model. No camera involved.",
    iptcTerm: "trainedAlgorithmicMedia",
    synthetic: true,
    badge: "AI-generated",
    altPhrase: "AI-generated",
  },
  {
    id: "ai-composite",
    label: "Real capture with generated parts",
    hint: "A photograph or clip extended, inpainted or object-removed with generative fill.",
    iptcTerm: "compositeWithTrainedAlgorithmicMedia",
    synthetic: true,
    badge: "Contains AI-generated elements",
    altPhrase: "partly AI-generated",
  },
  {
    id: "ai-enhanced",
    label: "Captured, then AI-enhanced",
    hint: "Upscaling, denoise, sharpening or auto colour. Nothing new was invented in frame.",
    iptcTerm: "algorithmicallyEnhanced",
    synthetic: false,
    badge: "AI-enhanced",
    altPhrase: "AI-enhanced",
  },
  {
    id: "rule-based",
    label: "Algorithmic, not model-based",
    hint: "Procedural or generative code art with no trained model behind it.",
    iptcTerm: "algorithmicMedia",
    synthetic: true,
    badge: "Algorithmically generated",
    altPhrase: "algorithmically generated",
  },
  {
    id: "no-ai",
    label: "No AI in the visual itself",
    hint: "AI helped with ideas or copy only. The media is a straight capture.",
    iptcTerm: "digitalCapture",
    synthetic: false,
    badge: "No AI imagery",
    altPhrase: "",
  },
];

export const MEDIA_TYPES = [
  { id: "image", label: "Image", noun: "image" },
  { id: "video", label: "Video", noun: "video" },
  { id: "audio", label: "Audio", noun: "audio clip" },
  { id: "illustration", label: "Illustration", noun: "illustration" },
];

/**
 * Platforms, their in-product disclosure control, and the caption length they allow.
 * captionLimit is null where the platform has no single published figure worth quoting;
 * the tool then reports the length without a budget instead of inventing a ceiling.
 */
export const PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram / Facebook / Threads",
    control: 'the "AI info" label (Advanced settings, or applied automatically from C2PA metadata)',
    captionLimit: 2200,
  },
  {
    id: "youtube",
    label: "YouTube",
    control: 'the "Altered or synthetic content" question in the upload checklist',
    captionLimit: 5000,
  },
  {
    id: "tiktok",
    label: "TikTok",
    control: 'the "AI-generated content" toggle on the post screen',
    captionLimit: null,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    control: "Content Credentials, which LinkedIn reads from the file and shows on the post",
    captionLimit: 3000,
  },
  {
    id: "x",
    label: "X",
    control: "no upload-time toggle — the disclosure has to live in the post text",
    captionLimit: 280,
  },
  {
    id: "web",
    label: "Own site, blog or newsletter",
    control: "your own caption, cutline or figure credit",
    captionLimit: null,
  },
  {
    id: "news",
    label: "News or editorial wire",
    control: "the IPTC Digital Source Type field plus a visible cutline",
    captionLimit: null,
  },
];

const MAX_TOOL_NAME = 60;

function findById(list, id) {
  return list.find((item) => item.id === id) ?? null;
}

/** Collapse whitespace and trim a free-text field. Returns "" for anything unusable. */
export function cleanText(value, maxLength = MAX_TOOL_NAME) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/**
 * The machine-readable side of the disclosure: the IPTC term, its full NewsCodes URI and
 * the XMP property name that carries it in the file.
 */
export function buildMachineReadableTags(involvementId) {
  const level = findById(INVOLVEMENT_LEVELS, involvementId);
  if (!level) return { error: "Choose how much of the media the model produced." };
  return {
    iptcTerm: level.iptcTerm,
    iptcUri: `${IPTC_SOURCE_TYPE_BASE}${level.iptcTerm}`,
    xmpProperty: "Iptc4xmpExt:DigitalSourceType",
    exiftoolCommand: `exiftool -XMP-iptcExt:DigitalSourceType="${IPTC_SOURCE_TYPE_BASE}${level.iptcTerm}" <file>`,
  };
}

/**
 * Build a disclosure badge, caption, alt-text suffix and machine-readable tag for one asset.
 *
 * @param {object} input
 * @param {string} input.platformId          One of PLATFORMS[].id
 * @param {string} input.involvementId       One of INVOLVEMENT_LEVELS[].id
 * @param {string} input.mediaTypeId         One of MEDIA_TYPES[].id
 * @param {string} [input.toolName]          Model or product used, e.g. "Midjourney v6"
 * @param {boolean} [input.photorealistic]   True if a viewer could mistake it for a photograph
 * @param {boolean} [input.realPerson]       True if it shows an identifiable real person or event
 * @param {boolean} [input.commercial]       True if it advertises, endorses or sells something
 * @param {boolean} [input.contentCredentials] True if a C2PA manifest is embedded in the file
 * @returns {object} the drafted disclosure, or { error } when the input is unusable
 */
export function buildDisclosureLabel({
  platformId,
  involvementId,
  mediaTypeId,
  toolName = "",
  photorealistic = false,
  realPerson = false,
  commercial = false,
  contentCredentials = false,
}) {
  const platform = findById(PLATFORMS, platformId);
  const level = findById(INVOLVEMENT_LEVELS, involvementId);
  const media = findById(MEDIA_TYPES, mediaTypeId);

  if (!platform) return { error: "Choose the platform this will be published on." };
  if (!level) return { error: "Choose how much of the media the model produced." };
  if (!media) return { error: "Choose whether this is an image, video, audio or illustration." };
  if (realPerson && !photorealistic && level.synthetic) {
    // Not fatal, but the combination is contradictory enough to be worth blocking.
    return {
      error:
        "An identifiable real person in a non-photorealistic piece still needs a disclosure — tick photorealistic, or untick the real-person box if the likeness is clearly stylised.",
    };
  }

  const tool = cleanText(toolName);
  const toolPart = tool ? ` using ${tool}` : "";
  const noun = media.noun;

  let sentence;
  switch (level.id) {
    case "fully-generated":
      sentence = `This ${noun} was generated with AI${toolPart}.`;
      break;
    case "ai-composite":
      sentence = `This ${noun} is a real capture with parts generated or edited by AI${toolPart}.`;
      break;
    case "ai-enhanced":
      sentence = `This ${noun} was captured normally and then enhanced with AI${toolPart} — upscaling and clean-up only, nothing was added to the scene.`;
      break;
    case "rule-based":
      sentence = `This ${noun} was produced by an algorithm${toolPart} rather than a camera. No trained image model was used.`;
      break;
    default:
      sentence = `No generative AI was used to produce this ${noun}${toolPart ? `; AI assisted only with planning${toolPart}` : ""}.`;
      break;
  }

  const extras = [];
  if (level.synthetic && photorealistic && realPerson) {
    extras.push("It shows a real person in a scene that did not happen.");
  } else if (level.synthetic && photorealistic) {
    extras.push("The people, places and events shown are not real.");
  }
  if (contentCredentials) {
    extras.push("Content Credentials (C2PA) are embedded in the file.");
  }

  const shortSentence = sentence;
  const fullCaption = [sentence, ...extras].join(" ");
  const limit = platform.captionLimit;

  // If the full wording will not fit the platform's caption budget, fall back to the
  // one-sentence version rather than shipping something the platform will cut mid-word.
  const overBudget = typeof limit === "number" && fullCaption.length > limit;
  const caption = overBudget ? shortSentence : fullCaption;
  const stillOverBudget = typeof limit === "number" && caption.length > limit;

  const badge = level.badge;
  const altTextSuffix = level.altPhrase ? ` (${level.altPhrase} ${noun})` : "";

  let hashtags;
  if (level.synthetic) hashtags = ["#AIgenerated", "#MadeWithAI"];
  else if (level.id === "ai-enhanced") hashtags = ["#AIenhanced"];
  else hashtags = [];

  const warnings = [];
  if (level.synthetic && photorealistic && realPerson) {
    warnings.push(
      `Deep fake territory. Article 50(4) of the EU AI Act requires the deployer to disclose that the content is artificially generated or manipulated; that duty applies from ${EU_AI_ACT_ARTICLE_50_APPLICATION_DATE}. Publishing rights in the likeness are a separate question.`,
    );
  }
  if (level.synthetic && commercial) {
    warnings.push(
      `Commercial use. The FTC rule on consumer reviews and testimonials (16 CFR Part 465, effective ${FTC_REVIEWS_RULE_EFFECTIVE_DATE}) prohibits AI-generated reviews, testimonials and endorsers presented as real people.`,
    );
  }
  if (level.synthetic && !contentCredentials) {
    warnings.push(
      "No C2PA manifest. Article 50(2) of the EU AI Act expects synthetic output to be marked in a machine-readable way, and several platforms apply their label automatically only when they can read that metadata.",
    );
  }
  if (level.synthetic && platform.id === "news") {
    warnings.push(
      "Editorial use. Wire standards expect the disclosure in the visible cutline as well as the IPTC field — metadata alone is not a caption.",
    );
  }
  if (stillOverBudget) {
    warnings.push(
      `Even the short version is ${caption.length - limit} characters over the ${limit}-character caption limit. Shorten the tool name or drop it.`,
    );
  }

  const tags = buildMachineReadableTags(level.id);

  return {
    badge,
    caption,
    shortSentence,
    altTextSuffix,
    hashtags,
    usedShortVersion: overBudget,
    captionLength: caption.length,
    captionLimit: limit,
    remainingCharacters: typeof limit === "number" ? limit - caption.length : null,
    platformLabel: platform.label,
    platformControl: platform.control,
    mediaLabel: media.label,
    involvementLabel: level.label,
    disclosureRequired: level.synthetic,
    iptcTerm: tags.iptcTerm,
    iptcUri: tags.iptcUri,
    xmpProperty: tags.xmpProperty,
    exiftoolCommand: tags.exiftoolCommand,
    warnings,
  };
}
