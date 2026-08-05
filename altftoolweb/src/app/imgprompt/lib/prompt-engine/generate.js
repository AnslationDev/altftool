import { getModel } from "../../data/models";
import { getCategory } from "../../data/categories";
import { seededPick, seededRandom } from "../utils";
import { computeScores } from "./scoring";
import {
  ART_STYLES, CAMERAS, CAMERA_MOVES, COMPOSITION, DEFAULT_NEGATIVES,
  LENSES, LIGHTING, MOODS, PALETTES, QUALITY_BOOSTERS, RENDER_STYLES,
  TRANSITIONS, flavorFor,
} from "../modifiers";

function pick(seed, list, chosen) {
  return chosen && chosen !== "auto" ? chosen : seededPick(seed, list);
}

/** Remove duplicate suggestion values while preserving order (avoids React duplicate-key warnings). */
function dedupe(items) {
  return Array.from(new Set(items));
}

function titleCase(input) {
  return input
    .split(" ")
    .slice(0, 6)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function deriveTitle(idea, categoryName) {
  const cleaned = idea.replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return categoryName ? `${categoryName} Concept` : "Untitled Prompt";
  const t = titleCase(cleaned);
  return t.length > 48 ? t.slice(0, 45) + "…" : t;
}

/** Compose the visual/scene body shared by image + video prompts. */
function buildImageBody(input, subject) {
  const { params, categorySlug } = input;
  const s = subject + input.modelId + input.mode + params.seed;
  const style = pick(s + "st", ART_STYLES, params.artStyle);
  const comp = pick(s + "cp", COMPOSITION, params.composition);
  const light = pick(s + "li", LIGHTING, params.lighting);
  const cam = pick(s + "ca", CAMERAS, params.camera);
  const lens = pick(s + "ln", LENSES, params.lens);
  const mood = pick(s + "mo", MOODS, params.mood);
  const palette = pick(s + "pa", PALETTES, params.palette);
  const flavor = flavorFor(categorySlug);
  const flavorPick = flavor.length ? seededPick(s + "fl", flavor) : "";
  const boosters = [
    seededPick(s + "b1", QUALITY_BOOSTERS),
    seededPick(s + "b2", QUALITY_BOOSTERS.slice().reverse()),
  ];

  const parts = [
    subject,
    style,
    comp,
    light,
    `shot on ${cam} with ${lens}`,
    `${palette} color palette`,
    `${mood} mood`,
    flavorPick,
    ...boosters,
  ].filter(Boolean);

  return parts.join(", ");
}

function buildVideoBody(input, subject) {
  const { params } = input;
  const s = subject + input.modelId + input.mode + params.seed;
  const move = seededPick(s + "mv", CAMERA_MOVES);
  const light = pick(s + "li", LIGHTING, params.lighting);
  const mood = pick(s + "mo", MOODS, params.mood);
  const style = pick(s + "st", ART_STYLES, params.artStyle);
  const motionWord = params.motionLevel > 66 ? "high-energy dynamic motion" : params.motionLevel < 33 ? "subtle, slow motion" : "smooth natural motion";

  return [subject, `${move}`, motionWord, light, `${mood} atmosphere`, `cinematic ${style}`].join(", ");
}

function applyMode(body, input) {
  const clauses = body.split(", ");
  switch (input.mode) {
    case "shorten":
      return clauses.slice(0, Math.max(4, Math.ceil(clauses.length * 0.55))).join(", ");
    case "expand":
      return [...clauses, "rich atmospheric depth", "volumetric light rays", "fine micro-details"].join(", ");
    case "professional":
      return [...clauses, "professional color grading", "commercial-grade finish"].join(", ");
    default:
      return body;
  }
}

function modelSuffix(input) {
  const { params } = input;
  switch (input.modelId) {
    case "midjourney":
      return ` --ar ${params.aspectRatio} --stylize ${params.stylize} --chaos ${params.chaos} --v 6.1`;
    case "sd":
      return `\n\nSampler: DPM++ 2M Karras · Steps: 30 · CFG: 7 · Size: ${params.resolution}`;
    default:
      return "";
  }
}

function buildStory(input, subject) {
  const s = subject + input.modelId;
  const mood = pick(s + "mo", MOODS, input.params.mood);
  const isScript = input.toolSlug === "script-generator";
  if (isScript) {
    return [
      `TITLE: ${deriveTitle(subject)}`,
      `LOGLINE: ${subject} — a ${mood} short film that hooks in the first 3 seconds.`,
      ``,
      `INT. OPENING SCENE — ${input.params.voiceStyle.toUpperCase()}`,
      `A striking establishing shot introduces the world. ${subject}.`,
      ``,
      `NARRATOR (${input.params.narrationStyle})`,
      `"Every great story begins with a single, unforgettable image..."`,
      ``,
      `BEAT 2 — Rising tension. BEAT 3 — Turning point. BEAT 4 — Emotional payoff.`,
      `MUSIC: ${input.params.musicMood}. Runtime target: ${input.params.videoDuration}s.`,
    ].join("\n");
  }
  return [
    `A ${mood} short story: ${subject}.`,
    ``,
    `HOOK — Open on a vivid, cinematic moment that raises an immediate question.`,
    `RISE — Introduce the character's desire and the obstacle in their way.`,
    `TURN — A surprising reversal changes everything.`,
    `RESOLUTION — Land an emotional, memorable final beat.`,
    ``,
    `Tone: ${mood}. Narration: ${input.params.narrationStyle}. Score: ${input.params.musicMood}.`,
  ].join("\n");
}

function buildNegative(input) {
  const s = input.idea + "neg";
  const base = [seededPick(s + "1", DEFAULT_NEGATIVES), ...DEFAULT_NEGATIVES.slice(0, 8)];
  const set = Array.from(new Set(base));
  const user = input.params.negativePrompt.trim();
  return user ? `${user}, ${set.join(", ")}` : set.join(", ");
}

function complexityFor(scoreOverall, words) {
  if (words < 18) return "Beginner";
  if (scoreOverall > 92) return "Pro";
  if (scoreOverall > 82) return "Advanced";
  return "Intermediate";
}

function buildExplanation(input, prompt, negative, scores) {
  const model = getModel(input.modelId);
  const cat = getCategory(input.categorySlug);
  const words = prompt.trim().split(/\s+/).filter(Boolean).length;
  const s = input.idea + input.modelId + "exp";

  const strengths = [
    `Uses prompt terms associated with ${model.name}'s documented strengths: ${model.strengths.slice(0, 2).join(" & ")}.`,
    `Layered creative direction (composition, lighting, lens & palette) gives the model precise guidance.`,
    `${words} well-structured tokens keep the prompt information-dense without overloading the model.`,
    cat ? `Uses ${cat.name} category terms as a starting point.` : `Balances subject and style instructions for easier editing.`,
  ];

  const weaknesses = [];
  if (input.params.camera === "auto") weaknesses.push("No explicit camera body chosen — locking one improves realism consistency.");
  if (!input.params.negativePrompt) weaknesses.push("Custom negative prompt is empty — add subject-specific exclusions for cleaner output.");
  if (words > 90) weaknesses.push("Prompt is long; some models weight later tokens less — front-load the key subject.");
  if (weaknesses.length === 0) weaknesses.push("Minor: try 2–3 seed variations to find the strongest composition.");

  const missingKeywords = [
    ...(input.params.lighting === "auto" ? ["specific lighting ratio"] : []),
    ...(scores.seo < 75 ? ["searchable style keywords"] : []),
    ...(scores.realism < 80 ? ["material/texture descriptors"] : []),
    "depth of field",
  ].slice(0, 4);

  return {
    summary: `This draft combines a clear subject with ${model.name}-oriented styling, camera and lighting terms, plus an editable negative prompt. Treat it as a starting point and test it in your chosen model.`,
    scoreReason: `The ${scores.overall}/100 checklist value is a deterministic local heuristic based on prompt length, specificity and selected controls. It is not an external model evaluation or outcome prediction.`,
    strengths,
    weaknesses,
    missingKeywords,
    improvements: [
      `Add a specific ${seededPick(s + "i1", ["material", "texture", "fabric", "surface"])} descriptor for tactile realism.`,
      `Pin a seed value to reproduce the best variation.`,
      `Consider ${seededPick(s + "i2", CAMERAS)} for a signature look.`,
    ],
    betterCamera: seededPick(s + "bc", CAMERAS) + " + " + seededPick(s + "bl", LENSES),
    betterLighting: seededPick(s + "bli", LIGHTING),
    betterColor: seededPick(s + "bco", PALETTES),
    negativeSuggestions: negative.split(", ").slice(0, 6),
    expectedOutput: `One possible direction is a ${seededPick(s + "eo", MOODS)} ${model.medium === "video" ? "cinematic clip" : "image"} with ${seededPick(s + "eo2", ["crisp detail", "clean edges", "rich color", "a polished finish"])}; actual output depends on the model and settings.`,
    complexity: complexityFor(scores.overall, words),
  };
}

function buildSuggestions(subject, modelId, mode, seed) {
  const s = subject + modelId + mode + seed;
  return {
    cameras: dedupe([seededPick(s + "sc1", CAMERAS), seededPick(s + "sc2", CAMERAS.slice().reverse()), seededPick(s + "sc3", CAMERAS.slice(3))]),
    lighting: dedupe([seededPick(s + "sl1", LIGHTING), seededPick(s + "sl2", LIGHTING.slice().reverse()), seededPick(s + "sl3", LIGHTING.slice(2))]),
    lenses: dedupe([seededPick(s + "sn1", LENSES), seededPick(s + "sn2", LENSES.slice().reverse())]),
    composition: dedupe([seededPick(s + "sp1", COMPOSITION), seededPick(s + "sp2", COMPOSITION.slice().reverse())]),
    moods: dedupe([seededPick(s + "sm1", MOODS), seededPick(s + "sm2", MOODS.slice().reverse())]),
    palette: dedupe([seededPick(s + "spa1", PALETTES), seededPick(s + "spa2", PALETTES.slice().reverse())]),
  };
}

/**
 * Shared finalization step: takes a composed prompt (from the mock composer
 * OR a real OpenAI completion) and produces the full GeneratedPrompt —
 * scores, explanation and suggestions are computed identically regardless
 * of source, so mock and real generations stay consistent and explainable.
 */
export function finalizeGeneratedPrompt(input, prompt, negativePrompt, title) {
  const subject = input.idea.trim() || (getCategory(input.categorySlug)?.name ?? "a breathtaking scene");
  const scores = computeScores(prompt, negativePrompt, input);
  const explanation = buildExplanation(input, prompt, negativePrompt, scores);
  const words = prompt.trim().split(/\s+/).filter(Boolean).length;

  return {
    prompt,
    negativePrompt,
    title,
    scores,
    explanation,
    modelId: input.modelId,
    suggestions: buildSuggestions(subject, input.modelId, input.mode, input.params.seed),
    meta: {
      tokens: Math.round(words * 1.35),
      words,
      engine: "mock",
      generatedAt: new Date(0).toISOString(),
    },
  };
}

/**
 * The MOCK prompt engine. Produces a genuinely usable, professional prompt
 * with zero external calls. Used when OPENAI_API_KEY is unset, and as a
 * resilient fallback if the real OpenAI call fails.
 */
export function generatePromptMock(input) {
  const model = getModel(input.modelId);
  const subject = input.idea.trim() || (getCategory(input.categorySlug)?.name ?? "a breathtaking scene");
  const isVideo = model.medium === "video" || input.controls.includes("video");
  const isStory = input.controls.includes("story") && !input.controls.includes("image") && !input.controls.includes("video");

  let prompt;
  if (isStory) {
    prompt = buildStory(input, subject);
  } else {
    const body = isVideo ? buildVideoBody(input, subject) : buildImageBody(input, subject);
    prompt = applyMode(body, input) + modelSuffix(input);
    if (isVideo) {
      prompt += `\n\nSettings: ${input.params.videoDuration}s · ${input.params.fps}fps · motion ${input.params.motionLevel}% · ${input.params.transition} transitions`;
      if (input.controls.includes("audio")) {
        prompt += ` · VO: ${input.params.voiceStyle} · music: ${input.params.musicMood}`;
      }
    }
  }

  const negativePrompt = isStory ? "" : buildNegative(input);
  const title = deriveTitle(subject, getCategory(input.categorySlug)?.name);
  return finalizeGeneratedPrompt(input, prompt, negativePrompt, title);
}
