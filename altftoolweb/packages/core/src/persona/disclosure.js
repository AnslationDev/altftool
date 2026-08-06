/*
 * AltF Persona — disclosure
 *
 * The part of the category nobody else ships. Every AI-influencer tool will
 * help you build a face; none of them will tell you what you are obliged to
 * say about it, which is the one question that can cost a client money.
 *
 * THIS IS A PLAIN-LANGUAGE SUMMARY OF PUBLISHED RULES, NOT LEGAL ADVICE. Every
 * page that renders any of this must render DISCLAIMER alongside it. The rules
 * change, they differ by market, and the person who ends up in front of a
 * regulator is the account operator rather than the persona.
 *
 * Two obligations, always. They are separate and one does not satisfy the
 * other:
 *   1. That the depicted creator is synthetic.
 *   2. That the post is commercial, where it is.
 */

import { LANGUAGE_BY_ID, MARKET_BY_ID, PLATFORM_BY_ID } from "./taxonomy.js";
import { normaliseSpec } from "./compose.js";

export const DISCLAIMER =
  "AltF Persona summarises published guidance so you know which questions to ask. It is not legal advice, rules differ by market and change often, and responsibility sits with whoever operates the account.";

/*
 * Ad-label wording, per language. These are the words regulators name rather
 * than paraphrases of them — ASCI in particular lists the accepted terms, and a
 * clever synonym is exactly what gets ruled insufficient.
 */
const AD_LABELS = {
  en: "#ad",
  hi: "#विज्ञापन",
  es: "#publicidad",
  pt: "#publicidade",
  fr: "#publicité",
  de: "#Werbung",
  ar: "#إعلان",
  id: "#iklan",
  ja: "#広告",
  ko: "#광고",
  it: "#pubblicità",
  tr: "#reklam",
};

const PROFILE_TEMPLATES = {
  en: "{disclosure} character. Operated by a human who answers the comments.",
  hi: "{disclosure} किरदार। एक असली व्यक्ति द्वारा संचालित।",
  es: "Personaje {disclosure}. Gestionado por una persona real.",
  pt: "Personagem {disclosure}. Operado por uma pessoa real.",
  fr: "Personnage {disclosure}. Géré par une personne réelle.",
  de: "{disclosure}e Figur. Betrieben von einem echten Menschen.",
  ar: "شخصية {disclosure}. يديرها إنسان حقيقي.",
  id: "Karakter {disclosure}. Dikelola oleh orang sungguhan.",
  ja: "{disclosure}のキャラクターです。運営は実在の人物です。",
  ko: "{disclosure} 캐릭터입니다. 실제 사람이 운영합니다.",
  it: "Personaggio {disclosure}. Gestito da una persona reale.",
  tr: "{disclosure} karakter. Gerçek bir kişi tarafından yönetiliyor.",
};

const CAPTION_TEMPLATES = {
  en: "This creator is {disclosure}.",
  hi: "यह क्रिएटर {disclosure} है।",
  es: "Este creador es {disclosure}.",
  pt: "Este criador é {disclosure}.",
  fr: "Ce créateur est {disclosure}.",
  de: "Dieser Creator ist {disclosure}.",
  ar: "هذا المُنشئ {disclosure}.",
  id: "Kreator ini {disclosure}.",
  ja: "このクリエイターは{disclosure}です。",
  ko: "이 크리에이터는 {disclosure}입니다.",
  it: "Questo creator è {disclosure}.",
  tr: "Bu içerik üreticisi {disclosure}.",
};

function fill(template, disclosure) {
  return String(template || "").replace(/\{disclosure\}/g, disclosure);
}

/*
 * Where the disclosure has to physically sit on each surface. Placement is
 * where most of the enforcement actually lands — "it was in the bio" and "it
 * was in the hashtag block" are both findings against, not defences.
 */
const PLACEMENT = {
  instagram: "First line of the caption, above the 'more' fold, plus the paid-partnership label where money changed hands.",
  tiktok: "The AI-generated toggle at upload AND a line of on-screen text in the first two seconds. The toggle alone is not visible enough on a muted autoplay.",
  "youtube-shorts": "Answer yes to the altered-or-synthetic question at upload, and burn the line into the first two seconds.",
  youtube: "Answer yes at upload, say it aloud within the first fifteen seconds, and repeat it in the pinned comment.",
  linkedin: "First two lines of the post text. There is no toggle here, so the words are the only mechanism.",
  x: "In the post text itself. There is no first-party label, and a community note is a worse outcome than a self-disclosure.",
  pinterest: "In the pin description and left in the file metadata, which is what the generated-AI label reads.",
  threads: "First line of the post. Meta's provenance label may or may not fire — do not rely on it.",
};

const ONSCREEN_SECONDS = {
  instagram: 2,
  tiktok: 2,
  "youtube-shorts": 2,
  youtube: 15,
  linkedin: 0,
  x: 0,
  pinterest: 0,
  threads: 0,
};

export function buildDisclosure(input = {}) {
  const spec = input.spec ? normaliseSpec(input.spec) : null;
  const marketId = input.market || spec?.market || "global";
  const platformId = input.platform || spec?.platform || "instagram";
  const languageId = input.language || spec?.language || "en";
  const paid = Boolean(input.paid);

  const market = MARKET_BY_ID[marketId] || MARKET_BY_ID.global;
  const platform = PLATFORM_BY_ID[platformId] || PLATFORM_BY_ID.instagram;
  const language = LANGUAGE_BY_ID[languageId] || LANGUAGE_BY_ID.en;

  const word = language.disclosure;
  const adLabel = AD_LABELS[language.id] || AD_LABELS.en;

  const captionLine = [
    paid ? adLabel : "",
    fill(CAPTION_TEMPLATES[language.id] || CAPTION_TEMPLATES.en, word),
  ]
    .filter(Boolean)
    .join(" · ");

  const onScreenSeconds = ONSCREEN_SECONDS[platform.id] ?? 0;

  const obligations = [
    {
      id: "synthetic",
      title: "Say the creator is synthetic",
      detail: `Use the words, in ${language.label}, where the audience reads them first — not in a hashtag block and not only in the bio.`,
      required: true,
    },
    {
      id: "platform-control",
      title: `Use the platform control: ${platform.labelName}`,
      detail: platform.labelNote,
      required: true,
    },
    {
      id: "metadata",
      title: "Leave the content credentials in the file",
      detail:
        "Most platform AI labels are driven by provenance metadata written by the generator. Stripping it to avoid a label is the step that turns a disclosure question into a deception question.",
      required: true,
    },
  ];

  if (paid) {
    obligations.unshift({
      id: "commercial",
      title: `Label the commercial relationship: ${adLabel}`,
      detail: `${market.regulator} treats an unlabelled paid post as a separate problem from an unlabelled synthetic one. Both labels, in ${language.label}, at the front.`,
      required: true,
    });
  }

  if (onScreenSeconds > 0) {
    obligations.push({
      id: "onscreen",
      title: `Burn it on screen for the first ${onScreenSeconds} seconds`,
      detail:
        "Autoplay is muted and captions are collapsed. A disclosure that only exists in text below the fold has not reached the person who scrolled past.",
      required: false,
    });
  }

  const risks = [
    {
      id: "likeness",
      title: "Never build a persona to resemble a real person",
      detail:
        "Publicity and personality rights protect a real individual's face and voice in most of the markets listed here. A resemblance you deny is still a resemblance a court can find.",
    },
    {
      id: "testimonial",
      title: "A synthetic creator cannot give a testimonial",
      detail:
        "An experience the persona did not have, presented as a customer experience, is a fabricated endorsement. This is the single most enforced failure in the category.",
    },
    {
      id: "regulated",
      title: "Regulated topics stack rules on top of these",
      detail:
        "Finance, health, alcohol, gambling and children's advertising each carry their own regime. The AI disclosure does not replace any of them.",
    },
  ];

  return {
    market,
    platform,
    language,
    paid,
    word,
    adLabel,
    profileLine: fill(PROFILE_TEMPLATES[language.id] || PROFILE_TEMPLATES.en, word),
    captionLine,
    onScreenLine: `${word.toUpperCase()}${paid ? ` · ${adLabel.toUpperCase()}` : ""}`,
    spokenLine: `Before we start — this creator is ${word}${paid ? ", and this video is a paid partnership" : ""}.`,
    placement: PLACEMENT[platform.id] || PLACEMENT.instagram,
    onScreenSeconds,
    obligations,
    risks,
    marketSummary: market.summary,
    marketMustDo: market.mustDo,
    disclaimer: DISCLAIMER,
  };
}

/**
 * A single persona posting into several markets is subject to all of them at
 * once. This returns the union — the strictest-rule-wins list the guides point
 * an account with a spread audience at.
 */
export function combinedObligations(marketIds = []) {
  const markets = marketIds
    .map((id) => MARKET_BY_ID[id])
    .filter(Boolean);
  if (!markets.length) return [];

  const seen = new Set();
  const out = [];
  for (const market of markets) {
    for (const item of market.mustDo) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ market, text: item });
    }
  }
  return out;
}
