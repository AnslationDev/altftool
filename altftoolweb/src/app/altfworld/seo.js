import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const ALTFWORLD_DESCRIPTION =
  "AltfWorld is AltFTool's community-style space for independent builders, tool users, creators, and privacy-minded digital explorers.";

const ALTFWORLD_KEYWORDS = [
  "AltfWorld",
  "AltFTool community",
  "builder community",
  "digital tools community",
  "independent creators",
  "online forums",
];

export function formatAltfWorldSlug(value = "") {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function buildAltfWorldMetadata({
  title,
  description = ALTFWORLD_DESCRIPTION,
  path = "/altfworld",
  keywords = [],
} = {}) {
  return createPageMetadata({
    title,
    description,
    path,
    keywords: [...ALTFWORLD_KEYWORDS, ...keywords],
  });
}
