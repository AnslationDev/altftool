export const TONES = [
  { id: "professional", label: "Professional", opener: "is a" },
  { id: "warm", label: "Warm", opener: "is a thoughtful" },
  { id: "bold", label: "Bold", opener: "is a" },
  { id: "academic", label: "Academic", opener: "is a researcher and" },
];

export const LENGTHS = [
  { id: "micro", label: "Micro", words: 25 },
  { id: "short", label: "Short", words: 55 },
  { id: "long", label: "Long", words: 110 },
];

function clean(value, fallback = "") {
  return String(value || fallback).trim().replace(/\s+/g, " ");
}

function sentenceJoin(parts) {
  return parts.filter(Boolean).join(" ");
}

function firstPerson(text) {
  return text
    .replace(/^([A-Z][^ ]*) is /, "I am ")
    .replace(/\bthey\b/gi, "I")
    .replace(/\btheir\b/gi, "my")
    .replace(/\bthem\b/gi, "me");
}

export function wordCount(text) {
  return clean(text).split(/\s+/).filter(Boolean).length;
}

export function buildBio({
  name = "Alex Morgan",
  role = "independent writer",
  niche = "digital privacy and practical technology",
  proof = "featured in community workshops and trusted by small teams",
  audience = "curious readers",
  cta = "Find more work at altftool.com",
  tone = "professional",
  person = "third",
  length = "short",
} = {}) {
  const toneDef = TONES.find((item) => item.id === tone) || TONES[0];
  const lengthDef = LENGTHS.find((item) => item.id === length) || LENGTHS[1];
  const safeName = clean(name, "Alex Morgan");
  const safeRole = clean(role, "independent writer");
  const safeNiche = clean(niche, "digital privacy and practical technology");
  const safeProof = clean(proof);
  const safeAudience = clean(audience, "curious readers");
  const safeCta = clean(cta);

  const base = sentenceJoin([
    `${safeName} ${toneDef.opener} ${safeRole}`,
    safeNiche ? `focused on ${safeNiche}.` : ".",
  ]);
  const short = sentenceJoin([
    base,
    safeProof ? `Their work is ${safeProof}.` : "",
    `They help ${safeAudience} understand useful ideas without the noise.`,
  ]);
  const long = sentenceJoin([
    short,
    "Their writing turns complex topics into practical, humane guidance with clear next steps.",
    safeCta ? safeCta : "",
  ]);

  const text =
    lengthDef.id === "micro"
      ? base
      : lengthDef.id === "long"
        ? long
        : short;
  const finalText = person === "first" ? firstPerson(text) : text;

  return {
    text: finalText,
    words: wordCount(finalText),
    targetWords: lengthDef.words,
    length: lengthDef,
    tone: toneDef,
  };
}
