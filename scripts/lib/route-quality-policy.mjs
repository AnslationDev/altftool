export const TITLE_HARD_MIN = 4;
export const TITLE_IDEAL_MAX = 70;
export const TITLE_HARD_MAX = 140;
export const DESCRIPTION_HARD_MIN = 40;
export const DESCRIPTION_IDEAL_MIN = 70;
export const DESCRIPTION_IDEAL_MAX = 165;
export const DESCRIPTION_HARD_MAX = 180;

export function classifyRenderedContentQuality({
  title = "",
  titleCount = 0,
  description = "",
  descriptionCount = 0,
  h1Count = 0,
} = {}) {
  const issues = [];
  const advisories = [];

  if (titleCount === 1) {
    if (title.length < TITLE_HARD_MIN || title.length > TITLE_HARD_MAX) {
      issues.push(
        `Title length is ${title.length}; expected ${TITLE_HARD_MIN}-${TITLE_HARD_MAX}`,
      );
    } else if (title.length > TITLE_IDEAL_MAX) {
      advisories.push(`Long title (${title.length})`);
    }
  }

  if (descriptionCount === 1) {
    if (
      description.length < DESCRIPTION_HARD_MIN ||
      description.length > DESCRIPTION_HARD_MAX
    ) {
      issues.push(
        `Description length is ${description.length}; expected ${DESCRIPTION_HARD_MIN}-${DESCRIPTION_HARD_MAX}`,
      );
    } else if (
      description.length < DESCRIPTION_IDEAL_MIN ||
      description.length > DESCRIPTION_IDEAL_MAX
    ) {
      advisories.push(`Non-ideal description (${description.length})`);
    }
  }

  if (h1Count === 0) issues.push("No rendered H1");

  return { issues, advisories };
}

export function passesStrictQuality({
  routesWithIssues = 0,
  indexConflicts = 0,
  missingCanonicalTargets = 0,
} = {}) {
  return (
    routesWithIssues === 0 &&
    indexConflicts === 0 &&
    missingCanonicalTargets === 0
  );
}
