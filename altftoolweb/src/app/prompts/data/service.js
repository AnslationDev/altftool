import { prompts } from "./seedream";
import { categories } from "./categories";

/**
 * Prompt cards for the marketplace grid. Returned in seed order; the UI applies
 * its own sort (Most Liked / Newest) client-side.
 */
export function getPromptCards() {
  return [...prompts];
}

export function getPromptCategories() {
  return categories;
}
