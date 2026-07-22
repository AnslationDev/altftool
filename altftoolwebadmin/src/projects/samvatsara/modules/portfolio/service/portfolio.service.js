import { createCollectionCrudService } from "@/lib/firestoreCrud";

const PROJECT_ID = "samvatsara";
const PORTFOLIO_PATH = ["projects", PROJECT_ID, "portfolio"];

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

function normalizePortfolioItem(payload) {
  return {
    slug: createSlug(payload.slug),
    title: cleanText(payload.title),
    category: cleanText(payload.category),
    summary: cleanText(payload.summary),
    results: cleanLines(payload.results),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const service = createCollectionCrudService(PORTFOLIO_PATH, { normalize: normalizePortfolioItem });

export const subscribePortfolio = service.subscribe;
export const createPortfolioItem = service.create;
export const updatePortfolioItem = service.update;
export const deletePortfolioItem = service.remove;
export const togglePortfolioStatus = service.toggleActive;

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
