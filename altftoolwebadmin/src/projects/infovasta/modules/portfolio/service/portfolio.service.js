import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "infovasta";
const PORTFOLIO_PATH = ["projects", PROJECT_ID, "portfolio"];
// Isolated from the `portfolio` item collection on purpose — the deployed
// infovasta firestore.rules keep list-page hero/meta/template copy in its
// own `pages/{pageId}` doc, never inside the item collections themselves.
const PAGE_PATH = ["projects", PROJECT_ID, "pages", "portfolio"];

export const DEFAULT_PORTFOLIO_PAGE = {
  meta: {
    title: "",
    description: "",
  },
  hero: {
    eyebrow: "",
    title: "",
    highlight: "",
    description: "",
  },
  detail: {
    breadcrumb: "",
    challengeHeading: "The Challenge",
    solutionHeading: "The Solution",
    techHeading: "Technology Used",
    resultsHeading: "Results",
    ctaLabel: "",
    ctaHref: "",
    moreHeading: "More Projects",
  },
};

const cleanText = (value = "") => String(value).trim();

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanResults(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => ({ label: cleanText(row?.label), value: cleanText(row?.value) }))
    .filter((row) => row.label || row.value);
}

function normalizePortfolioItem(payload) {
  return {
    slug: createSlug(payload.slug || payload.title),
    title: cleanText(payload.title),
    client: cleanText(payload.client),
    industry: cleanText(payload.industry),
    category: cleanText(payload.category),
    image: cleanText(payload.image),
    imagePath: cleanText(payload.imagePath),
    width: Number(payload.width) || 0,
    height: Number(payload.height) || 0,
    // Free-text HSL triplet string, e.g. "210, 100%, 56%" — mirrors the
    // `services` module's `color` field convention for this project.
    color: cleanText(payload.color),
    summary: cleanText(payload.summary),
    challenge: cleanText(payload.challenge),
    solution: cleanText(payload.solution),
    techUsed: cleanLines(payload.techUsed),
    results: cleanResults(payload.results),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const portfolioItems = createCollectionCrudService(PORTFOLIO_PATH, { normalize: normalizePortfolioItem });
const portfolioPage = createSingletonDocService(PAGE_PATH, DEFAULT_PORTFOLIO_PAGE);
const cover = createImageUploader({ pathPrefix: `${PROJECT_ID}/portfolio/cover`, maxSizeMB: 8 });

export const subscribePortfolio = portfolioItems.subscribe;
export const createPortfolioItem = portfolioItems.create;
export const updatePortfolioItem = portfolioItems.update;
export const deletePortfolioItem = portfolioItems.remove;
export const togglePortfolioStatus = portfolioItems.toggleActive;

export const subscribePortfolioPage = portfolioPage.subscribe;
export const savePortfolioPage = portfolioPage.save;

export const uploadPortfolioCover = cover.upload;
export const deletePortfolioCover = cover.remove;

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
