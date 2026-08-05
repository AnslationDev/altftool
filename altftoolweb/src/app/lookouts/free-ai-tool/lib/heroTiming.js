// Shared timing constants for the hero entrance choreography (heading
// typewriter -> subheading word reveal -> category cards flying in). Both
// HeroSection and CategoriesGridSection derive their delays from the same
// numbers here so the sequence stays in sync without the two components
// needing to talk to each other directly.

export const HEADING_CHAR_MS = 22; // ms per character of the typewriter heading
export const HEADING_START_DELAY = 0.15; // seconds before typing begins
export const PAUSE_AFTER_HEADING = 0.2; // seconds the caret lingers before the subheading starts
export const WORD_STAGGER = 0.035; // seconds between each subheading word
export const WORD_DURATION = 0.35; // seconds each subheading word takes to fade up
export const PAUSE_AFTER_SUBHEADING = 0.15; // seconds before the category cards start flying in

/**
 * Computes how long the heading + subheading intro takes for a given piece
 * of copy, so the category grid's entrance can be scheduled to start right
 * after the subheading settles rather than on a guessed fixed delay.
 */
export function getHeroSequenceTimings(title = "", description = "") {
  const headingDuration = HEADING_START_DELAY + title.length * (HEADING_CHAR_MS / 1000);
  const subheadingStart = headingDuration + PAUSE_AFTER_HEADING;
  const words = description.trim().split(/\s+/).filter(Boolean);
  const subheadingDuration = words.length ? (words.length - 1) * WORD_STAGGER + WORD_DURATION : 0;
  const categoriesStart = subheadingStart + subheadingDuration + PAUSE_AFTER_SUBHEADING;

  return { headingDuration, subheadingStart, subheadingDuration, categoriesStart, wordCount: words.length };
}
