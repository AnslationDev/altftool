import { generatePromptMock, finalizeGeneratedPrompt } from "./generate";
import { createChatCompletion } from "./openai";
import { getModel } from "../../data/models";
import { getCategory } from "../../data/categories";

const MODE_INSTRUCTIONS = {
  generate: "Write a fresh, complete prompt from the idea below.",
  improve: "Improve clarity, vividness and technical precision while keeping the same idea.",
  rewrite: "Rewrite the idea with a different creative angle or phrasing — same subject, fresh execution.",
  expand: "Expand with richer sensory, atmospheric and technical detail than a typical prompt.",
  shorten: "Keep it tight and punchy — the fewest words that still describe a strong shot.",
  professional: "Polish it into commercial-grade, client-ready language.",
};

function buildSystemPrompt(input) {
  const model = getModel(input.modelId);
  const category = getCategory(input.categorySlug);
  const isVideo = model.medium === "video" || input.controls.includes("video");
  const isStory = input.controls.includes("story") && !input.controls.includes("image") && !input.controls.includes("video");
  const p = input.params;

  const directionBits = [];
  if (p.artStyle !== "auto") directionBits.push(`art style: ${p.artStyle}`);
  if (p.camera !== "auto") directionBits.push(`camera: ${p.camera}`);
  if (p.lens !== "auto") directionBits.push(`lens: ${p.lens}`);
  if (p.lighting !== "auto") directionBits.push(`lighting: ${p.lighting}`);
  if (p.composition !== "auto") directionBits.push(`composition: ${p.composition}`);
  if (p.mood !== "auto") directionBits.push(`mood: ${p.mood}`);
  if (p.palette !== "auto") directionBits.push(`color palette: ${p.palette}`);

  const lines = [
    `You are Imaginnex's senior AI prompt engineer. You write production-grade prompts for ${model.name} (${model.vendor}), known for: ${model.strengths.join(", ")}.`,
    category ? `Category: ${category.name} — ${category.description}` : "",
    isStory
      ? "This is a STORY/SCRIPT tool, not a visual prompt — write narrative or screenplay text, not image/video descriptors."
      : `Write a single-paragraph, comma-separated ${isVideo ? "video" : "image"} generation prompt (no line breaks in "prompt"), in the vocabulary ${model.name} responds best to.`,
    directionBits.length ? `Required creative direction to weave in naturally: ${directionBits.join("; ")}.` : "",
    isVideo && !isStory ? `Video context: ~${p.videoDuration}s, motion level ${p.motionLevel}/100. Reflect pacing/camera movement in the prompt text itself.` : "",
    MODE_INSTRUCTIONS[input.mode] ?? MODE_INSTRUCTIONS.generate,
    !isStory ? "Also write a short comma-separated negative prompt (things to avoid) tailored to the subject — not just generic boilerplate." : "",
    `Respond with ONLY a JSON object: {"title": string (max 48 chars, no quotes), "prompt": string, "negativePrompt": string (empty string if not applicable)}. No markdown, no commentary.`,
  ];

  return lines.filter(Boolean).join("\n");
}

/** Calls the real OpenAI API and finalizes the result through the same
 *  scoring/explanation engine the mock generator uses, so both paths are
 *  consistent and explainable. Throws on any failure — caller falls back. */
async function generateWithOpenAI(input) {
  const completion = await createChatCompletion({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.9,
    max_tokens: 700,
    messages: [
      { role: "system", content: buildSystemPrompt(input) },
      { role: "user", content: input.idea.trim() || "Surprise me with something breathtaking for this category." },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned an empty response");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI response was not valid JSON");
  }
  if (!parsed.prompt) throw new Error("OpenAI response missing 'prompt' field");

  const result = finalizeGeneratedPrompt(
    input,
    parsed.prompt,
    parsed.negativePrompt ?? "",
    parsed.title || parsed.prompt.slice(0, 45)
  );
  result.meta.engine = "openai";
  return result;
}

/**
 * ─────────────────────────────────────────────────────────────
 *  THE OPENAI SEAM  👇
 * ─────────────────────────────────────────────────────────────
 * Runs server-side (called from /imgprompt/api/generate). When
 * OPENAI_API_KEY is set, calls the real model above; otherwise (or if
 * that call fails for any reason) falls back to the deterministic mock
 * engine so the studio never breaks.
 */
export async function generateWithProvider(input) {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  if (!hasOpenAI) {
    const result = generatePromptMock(input);
    result.meta.generatedAt = new Date().toISOString();
    return result;
  }

  try {
    const result = await generateWithOpenAI(input);
    result.meta.generatedAt = new Date().toISOString();
    return result;
  } catch (err) {
    console.error("[prompt-engine] OpenAI call failed, falling back to mock engine:", err);
    const result = generatePromptMock(input);
    result.meta.generatedAt = new Date().toISOString();
    return result;
  }
}
