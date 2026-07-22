import { getCategory } from "../../data/categories";
import { seededPick } from "../utils";
import { ART_STYLES, CAMERA_MOVES, COMPOSITION, LIGHTING, MOODS, PALETTES, flavorFor } from "../modifiers";
import { createChatCompletion } from "./openai";

/** Vivid, subject-agnostic scene fragments used by the tool-based (no
 *  category) fallback so it never repeats a single canned sentence. */
const GENERIC_SUBJECTS = [
  "a lone wanderer crossing a neon-lit city street",
  "a floating island drifting above the clouds",
  "a vintage motorcycle parked at golden hour",
  "an underwater coral palace teeming with light",
  "a robot gardener tending a rooftop greenhouse",
  "a chef plating a dessert under a single spotlight",
  "a violinist performing on a rain-soaked street",
  "a spacecraft docking at a distant space station",
  "a mountain village waking up at first light",
  "a dragon curled protectively around an ancient tower",
];

/** Per-tool creative brief for the "Prompt Studio" tools that have no
 *  category context of their own (Prompt Generator, Prompt Optimizer,
 *  Image/Video/Cinema Prompt) — used for both the OpenAI instruction and
 *  the offline mock fallback. */
const TOOL_CONTEXT = {
  "prompt-generator": {
    label: "Prompt Generator",
    instruction: "Write ONE short, vivid, general-purpose AI image prompt idea (8-20 words) that showcases strong prompt-writing technique — a concrete subject, setting and mood a beginner could learn from.",
    mock: (s) => `${seededPick(s + "su", GENERIC_SUBJECTS)}, ${seededPick(s + "m", MOODS)}, ${seededPick(s + "p", PALETTES)}`,
  },
  "prompt-optimizer": {
    label: "Prompt Optimizer",
    instruction: "Write ONE short, rough, under-specified AI image prompt (6-14 words) — the kind of vague first draft a beginner would write, on purpose, so it has clear room for a prompt optimizer to improve it. Keep it simple and a little generic.",
    mock: (s) => `${seededPick(s + "su", GENERIC_SUBJECTS).replace(/^a |^an /, "")} photo`,
  },
  "image-prompt": {
    label: "Image Prompt",
    instruction: "Write ONE short, vivid still-image idea (8-20 words) with a clear subject, setting and visual mood.",
    mock: (s) => `${seededPick(s + "su", GENERIC_SUBJECTS)}, ${seededPick(s + "st", ART_STYLES)}, ${seededPick(s + "m", MOODS)}`,
  },
  "video-prompt": {
    label: "Video Prompt",
    instruction: "Write ONE short video/motion idea (8-20 words) that names a subject AND a camera move or motion so it reads as a video prompt, not a still image.",
    mock: (s) => `a ${seededPick(s + "mv", CAMERA_MOVES)} revealing ${seededPick(s + "su", GENERIC_SUBJECTS)}, ${seededPick(s + "m", MOODS)}`,
  },
  "cinema-prompt": {
    label: "Cinema Prompt",
    instruction: "Write ONE short cinematic scene idea (8-20 words) — a specific shot type, subject and mood, like a single line from a director's shot list.",
    mock: (s) => `${seededPick(s + "su", GENERIC_SUBJECTS)}, framed as ${seededPick(s + "cp", COMPOSITION)}, ${seededPick(s + "m", MOODS)}`,
  },
};

function buildSystemPrompt({ category, tool }) {
  const brief = category
    ? [
        `Category: ${category.name} — ${category.description}`,
        "Write ONE short, vivid, concrete visual idea (8-20 words) they could drop straight into an AI image/video prompt box as a starting point — a specific subject and scene, not generic advice.",
      ]
    : [
        `Tool: ${tool.label}.`,
        tool.instruction,
      ];

  return [
    "You are Imaginnex's senior creative director. A user just opened a prompt tool and needs a spark to start from.",
    ...brief,
    "Respond with ONLY the idea sentence. No quotes, no markdown, no prefix like \"Idea:\".",
  ].join("\n");
}

async function suggestWithOpenAI(target) {
  const label = target.category ? target.category.name : target.tool.label;
  const completion = await createChatCompletion({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 1,
    max_tokens: 80,
    messages: [
      { role: "system", content: buildSystemPrompt(target) },
      { role: "user", content: `Give me one fresh idea for "${label}".` },
    ],
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned an empty suggestion");
  return text.replace(/^["']|["']$/g, "");
}

/** Group-aware sentence shapes so the offline fallback still reads as a
 *  purpose-built idea rather than one generic template stretched over
 *  every category. Each still resolves through seededPick for variety. */
const GROUP_TEMPLATES = {
  "Commerce & Product": (name, s) => `a hero product shot of ${name.toLowerCase()}, ${seededPick(s + "m", MOODS)}, ${seededPick(s + "p", PALETTES)}`,
  "Marketing & Social": (name, s) => `a scroll-stopping ${name.toLowerCase()} campaign visual with a bold headline moment, ${seededPick(s + "p", PALETTES)}`,
  "Healthcare & Medical": (name, s) => `a clean, trustworthy ${name.toLowerCase()} illustration with ${seededPick(s + "l", LIGHTING)}`,
  "Architecture & Interior": (name, s) => `a ${seededPick(s + "st", ART_STYLES)} ${name.toLowerCase()} bathed in ${seededPick(s + "l", LIGHTING)}`,
  "Characters & Story": (name, s) => `a ${seededPick(s + "m", MOODS)} ${name.toLowerCase()} caught in a pivotal story moment`,
  "Worlds & Genres": (name, s) => `an epic ${name.toLowerCase()} world with ${seededPick(s + "m", MOODS)} atmosphere and ${seededPick(s + "p", PALETTES)}`,
  "Festivals & Culture": (name, s) => `a joyful ${name.toLowerCase()} celebration scene glowing with warm light`,
  "Art Styles": (name, s) => `a striking subject rendered in ${name.toLowerCase()}, ${seededPick(s + "m", MOODS)}`,
  Photography: (name, s) => `a ${seededPick(s + "m", MOODS)} ${name.toLowerCase()} shot with ${seededPick(s + "l", LIGHTING)}`,
  "Lifestyle & Nature": (name, s) => `a ${seededPick(s + "m", MOODS)} ${name.toLowerCase()} moment with ${seededPick(s + "p", PALETTES)}`,
  "Core Formats": (name, s) => `a breathtaking ${name.toLowerCase()} concept with ${seededPick(s + "m", MOODS)} atmosphere`,
};

/** Offline-safe fallback for category pages — templated + randomized per
 *  call, never a fixed string per category. Runs when OPENAI_API_KEY is
 *  unset or the live call fails, so the box always gets *something*. */
function suggestMock(category) {
  const seed = `${category.slug}-${Date.now()}-${Math.random()}`;
  const template = GROUP_TEMPLATES[category.group];
  const base = template
    ? template(category.name, seed)
    : `a striking ${category.name.toLowerCase()} scene with ${seededPick(seed + "m", MOODS)} atmosphere and ${seededPick(seed + "p", PALETTES)}`;
  const flavor = flavorFor(category.slug);
  const sentence = flavor.length ? `${base}, ${seededPick(seed + "fl", flavor)}` : base;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/** Same offline-safe idea, for the 5 category-less Prompt Studio tools. */
function suggestMockForTool(toolSlug) {
  const ctx = TOOL_CONTEXT[toolSlug];
  if (!ctx) return "";
  const seed = `${toolSlug}-${Date.now()}-${Math.random()}`;
  const sentence = ctx.mock(seed);
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/**
 * Server-side seam: calls OpenAI for a category- or tool-specific idea
 * when OPENAI_API_KEY is configured, otherwise (or if the call fails)
 * falls back to the templated mock so the page never breaks.
 */
export async function suggestIdea({ categorySlug, toolSlug } = {}) {
  const category = getCategory(categorySlug);
  const tool = !category ? TOOL_CONTEXT[toolSlug] : null;
  if (!category && !tool) throw new Error(`Unknown suggestion target: ${categorySlug || toolSlug}`);

  if (!process.env.OPENAI_API_KEY) {
    return category ? suggestMock(category) : suggestMockForTool(toolSlug);
  }

  try {
    return await suggestWithOpenAI({ category, tool });
  } catch (err) {
    console.error("[prompt-engine] OpenAI suggestion failed, falling back to mock:", err);
    return category ? suggestMock(category) : suggestMockForTool(toolSlug);
  }
}

export { suggestMock, suggestMockForTool };
