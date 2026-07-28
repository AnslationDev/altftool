import community from "../../data/mockCommunity";

export const forumCategories = community.categories;
export const forumThreads = community.threads;
export const forumStats = community.stats;

export function getCategoryBySlug(slug) {
  return forumCategories.find((category) => category.slug === slug) || forumCategories[0];
}
