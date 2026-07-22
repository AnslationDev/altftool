import { workflows } from "./workflows";
import { categories } from "./categories";

export function getAllWorkflows() {
  return workflows;
}

export function getWorkflowBySlug(slug) {
  return workflows.find((w) => w.slug === slug) || null;
}

export function getCategories() {
  return categories;
}

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug) || null;
}

export function getWorkflowsByCategory(slug) {
  return workflows.filter((w) => w.categories.some((c) => c.slug === slug));
}

export function getWorkflowsByNode(slug) {
  return workflows.filter((w) => w.nodes.some((n) => n.slug === slug));
}

export function getAllNodes() {
  const map = new Map();
  for (const w of workflows) {
    for (const n of w.nodes) {
      const entry = map.get(n.slug) || { name: n.name, slug: n.slug, count: 0 };
      entry.count += 1;
      map.set(n.slug, entry);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function getTrending(limit = 60) {
  return [...workflows].sort((a, b) => b.totalViews - a.totalViews).slice(0, limit);
}

export function getTrendingCards(limit = 60) {
  return getTrending(limit).map((workflow) => ({
    slug: workflow.slug,
    title: workflow.title,
    description:
      workflow.description.length > 240
        ? `${workflow.description.slice(0, 237).trimEnd()}...`
        : workflow.description,
    author: {
      name: workflow.author.name,
      avatar: workflow.author.avatar,
    },
    categories: workflow.categories.map(({ name, slug }) => ({ name, slug })),
    nodes: workflow.nodes.map(({ name, slug }) => ({ name, slug })),
    nodeCount: workflow.nodeCount || workflow.nodes.length,
    totalViews: workflow.totalViews,
  }));
}

export function getNewest(limit = 6) {
  return [...workflows]
    .filter((w) => w.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export function getRelated(slug, limit = 4) {
  const current = getWorkflowBySlug(slug);
  if (!current) return [];
  const currentCats = new Set(current.categories.map((c) => c.slug));
  return workflows
    .filter((w) => w.slug !== slug)
    .map((w) => ({
      w,
      score: w.categories.filter((c) => currentCats.has(c.slug)).length,
    }))
    .sort((a, b) => b.score - a.score || b.w.totalViews - a.w.totalViews)
    .slice(0, limit)
    .map((x) => x.w);
}

export function getStats() {
  const total = workflows.length;
  const avgComplexity =
    total === 0
      ? 0
      : workflows.reduce((sum, w) => sum + (w.nodeCount || 0), 0) / total;
  const topCategory = categories[0] || null;
  return {
    total,
    avgComplexity: Number(avgComplexity.toFixed(1)),
    topCategory: topCategory ? topCategory.name : "—",
    topCategoryShare:
      topCategory && total
        ? Math.round((topCategory.count / total) * 100)
        : 0,
  };
}

export function searchWorkflows(query, list = workflows) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return list;
  return list.filter((w) => {
    const haystack = [
      w.title,
      w.description,
      w.author.name,
      ...w.categories.map((c) => c.name),
      ...w.nodes.map((n) => n.name),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
