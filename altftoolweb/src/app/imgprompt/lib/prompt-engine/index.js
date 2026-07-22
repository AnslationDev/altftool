import { generatePromptMock } from "./generate";
import { getCategory } from "../../data/categories";
import { suggestMock, suggestMockForTool } from "./suggest";

export { generatePromptMock } from "./generate";
export { computeScores } from "./scoring";
export { DEFAULT_PARAMS } from "./params";
export * as Modifiers from "../modifiers";

/**
 * Client-side entry point used by the Studio.
 * Tries the server route (which is where OpenAI lives) and falls
 * back to the local mock so the app always works, even offline.
 */
export async function generatePrompt(input) {
  try {
    const res = await fetch("/imgprompt/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`generate failed: ${res.status}`);
    return await res.json();
  } catch {
    const result = generatePromptMock(input);
    result.meta.generatedAt = new Date().toISOString();
    return result;
  }
}

/**
 * Client-side entry point for the "auto-suggest an idea" feature — used
 * both for category pages (categorySlug) and the category-less Prompt
 * Studio tools (toolSlug: prompt-generator, prompt-optimizer, image-prompt,
 * video-prompt, cinema-prompt). Tries the server route (OpenAI, with its
 * own mock fallback) and if the request itself fails (offline, network
 * error) falls back to the same templated mock locally so a page never
 * dead-ends with an empty box.
 */
export async function suggestIdeaFor({ categorySlug, toolSlug } = {}) {
  try {
    const res = await fetch("/imgprompt/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categorySlug, toolSlug }),
    });
    if (!res.ok) throw new Error(`suggest failed: ${res.status}`);
    const data = await res.json();
    if (!data.idea) throw new Error("suggest returned no idea");
    return data.idea;
  } catch {
    const category = getCategory(categorySlug);
    if (category) return suggestMock(category);
    return toolSlug ? suggestMockForTool(toolSlug) : "";
  }
}
