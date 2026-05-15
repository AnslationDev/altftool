import rawBlogData from "./blogs.json";

export const BLOG_CHUNK_SIZE = 12;
export const BLOG_REMOTE_LIMIT = 72;

const DEFAULT_AUTHOR = "AltFTool Editorial";
const FALLBACK_IMAGES = [
  "/images/featured1.png",
  "/images/featured2.png",
  "/images/featured3.png",
  "/images/featured4.png",
  "/images/featured8.png",
  "/images/featured11.png",
];

export const BLOG_CONTENT_LANES = [
  {
    title: "Smart savings",
    eyebrow: "Buying guides",
    description: "Practical checklists, coupon habits, and comparison-led reads for people who want the best value fast.",
  },
  {
    title: "Student stack",
    eyebrow: "Campus picks",
    description: "Student-friendly tools, productivity workflows, and simple resources for study, writing, and digital life.",
  },
  {
    title: "Creator growth",
    eyebrow: "Monetization",
    description: "Readable playbooks for creators, link workflows, downloads, and lightweight growth systems.",
  },
  {
    title: "Tool mastery",
    eyebrow: "How-to",
    description: "Short tutorials that help readers choose, use, and combine AltFTool utilities with less friction.",
  },
];

function getRawBlogs() {
  if (Array.isArray(rawBlogData)) return rawBlogData;
  if (Array.isArray(rawBlogData?.blogs)) return rawBlogData.blogs;
  return [];
}

export function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarize(value = "", maxLength = 155) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function blogTaxonomySlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function taxonomyLabelFromSlug(slug = "") {
  return String(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function coerceDate(value, index = 0) {
  let date = null;

  if (value?.toDate) {
    date = value.toDate();
  } else if (typeof value?.seconds === "number") {
    date = new Date(value.seconds * 1000);
  } else if (value) {
    date = new Date(value);
  }

  if (!date || Number.isNaN(date.getTime())) {
    date = new Date(Date.UTC(2026, 0, 1 + index));
  }

  return date.toISOString().slice(0, 10);
}

function estimateReadTime(...parts) {
  const words = stripHtml(parts.filter(Boolean).join(" ")).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 180));
}

export function normalizeBlog(blog = {}, index = 0) {
  const heading = blog.heading || blog.title || "Untitled AltFTool guide";
  const slug = blog.slug || slugify(heading);
  const category = blog.category || "Guides";
  const description = blog.description || blog.content || blog.body || blog.excerpt || "";
  const excerpt = blog.excerpt || summarize(description);
  const readTimeMinutes = Number(blog.readTimeMinutes) || estimateReadTime(description, excerpt);
  const image = blog.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const tags = Array.isArray(blog.tags)
    ? blog.tags
    : [category, blog.tool, blog.topic].filter(Boolean);
  const date = coerceDate(blog.date || blog.publishedAt || blog.createdAt || blog.updatedAt, index);

  return {
    ...blog,
    id: blog.id ?? slug,
    title: heading,
    heading,
    slug,
    category,
    tool: blog.tool || blog.topic || category,
    excerpt,
    description,
    content: blog.content || description,
    image,
    imageAlt: blog.imageAlt || `${heading} cover image`,
    date,
    author: blog.author || DEFAULT_AUTHOR,
    authorRole: blog.authorRole || "AltFTool Editorial",
    reviewedBy: blog.reviewedBy || "AltFTool Editorial Team",
    editorialNote: blog.editorialNote || "",
    readTime: `${readTimeMinutes} min read`,
    readTimeMinutes,
    tags,
    searchText: stripHtml([heading, excerpt, description, category, blog.tool, ...tags].filter(Boolean).join(" ")).toLowerCase(),
  };
}

export function sortBlogsByDate(posts = []) {
  return [...posts].sort((a, b) => {
    const dateA = Date.parse(a.date || "") || 0;
    const dateB = Date.parse(b.date || "") || 0;
    return dateB - dateA;
  });
}

const normalizedBlogs = sortBlogsByDate(
  getRawBlogs()
    .map((blog, index) => normalizeBlog(blog, index))
    .filter((blog) => blog.slug)
);

export const blogPosts = normalizedBlogs;

export function mergeBlogPosts(localPosts = blogPosts, remotePosts = []) {
  const merged = new Map();

  localPosts.forEach((post, index) => {
    const normalized = normalizeBlog(post, index);
    merged.set(normalized.slug, normalized);
  });

  remotePosts.forEach((post, index) => {
    const normalized = normalizeBlog(post, index);
    const existing = merged.get(normalized.slug);
    merged.set(normalized.slug, existing ? { ...existing, ...normalized } : normalized);
  });

  return sortBlogsByDate([...merged.values()]);
}

export function getAllBlogs() {
  return blogPosts;
}

export function getBlogBySlug(slug) {
  return blogPosts.find((blog) => blog.slug === slug) || null;
}

export function getBlogCategories(posts = blogPosts) {
  return ["All", ...new Set(posts.map((post) => post.category).filter(Boolean))];
}

export function getBlogCategoryBySlug(categorySlug, posts = blogPosts) {
  const categories = getBlogCategories(posts).filter((category) => category !== "All");
  return (
    categories.find((category) => blogTaxonomySlug(category) === categorySlug) ||
    taxonomyLabelFromSlug(categorySlug)
  );
}

export function getAllBlogTags(posts = blogPosts) {
  const tags = posts.flatMap((post) => (Array.isArray(post.tags) ? post.tags : []));
  return [...new Set(tags.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function getNumericMetric(post = {}, keys = []) {
  const key = keys.find((metricKey) => post[metricKey] !== undefined);
  return Number(post[key]) || 0;
}

export function getBlogPopularityScore(post = {}) {
  const views = getNumericMetric(post, ["views", "viewCount", "totalViews"]);
  const likes = getNumericMetric(post, ["likesCount", "likes", "reactions"]);
  const comments = getNumericMetric(post, ["commentsCount", "commentCount", "comments"]);
  const dateTime = Date.parse(post.date || post.updatedAt || post.createdAt || "");
  const daysOld = dateTime
    ? Math.max(0, (Date.now() - dateTime) / (1000 * 60 * 60 * 24))
    : 90;
  const recencyBoost = Math.max(0, 45 - Math.min(daysOld, 45));

  return views + likes * 12 + comments * 18 + recencyBoost;
}

export function getTrendingBlogs(posts = blogPosts, limit = 6) {
  return [...posts]
    .map((post, index) => ({
      post,
      index,
      score: getBlogPopularityScore(post),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateA = Date.parse(a.post.date || "") || 0;
      const dateB = Date.parse(b.post.date || "") || 0;
      if (dateB !== dateA) return dateB - dateA;
      return a.index - b.index;
    })
    .slice(0, limit)
    .map(({ post }) => post);
}

function tokenizeBlogText(value = "") {
  const stopWords = new Set([
    "about",
    "after",
    "also",
    "and",
    "are",
    "best",
    "blog",
    "can",
    "for",
    "from",
    "guide",
    "has",
    "how",
    "into",
    "online",
    "that",
    "the",
    "this",
    "tool",
    "tools",
    "use",
    "with",
    "you",
    "your",
  ]);

  return new Set(
    stripHtml(value)
      .toLowerCase()
      .replace(/&/g, " and ")
      .split(/[^a-z0-9]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 2 && !stopWords.has(word)),
  );
}

function getTagOverlapScore(currentTags = [], candidateTags = []) {
  const current = new Set(currentTags.map((tag) => blogTaxonomySlug(tag)));
  return candidateTags.reduce(
    (score, tag) => score + (current.has(blogTaxonomySlug(tag)) ? 1 : 0),
    0,
  );
}

function getKeywordOverlapScore(current = {}, candidate = {}) {
  const currentTokens = tokenizeBlogText([
    current.heading,
    current.excerpt,
    current.category,
    current.tool,
    ...(Array.isArray(current.tags) ? current.tags : []),
  ].filter(Boolean).join(" "));
  const candidateTokens = tokenizeBlogText([
    candidate.heading,
    candidate.excerpt,
    candidate.category,
    candidate.tool,
    ...(Array.isArray(candidate.tags) ? candidate.tags : []),
  ].filter(Boolean).join(" "));

  let overlap = 0;
  candidateTokens.forEach((token) => {
    if (currentTokens.has(token)) overlap += 1;
  });
  return overlap;
}

export function scoreRelatedBlog(current = {}, candidate = {}) {
  if (!current?.slug || !candidate?.slug || current.slug === candidate.slug) return -1;

  const currentTags = Array.isArray(current.tags) ? current.tags : [];
  const candidateTags = Array.isArray(candidate.tags) ? candidate.tags : [];
  const sameCategory = current.category && candidate.category && current.category === candidate.category;
  const sameTool = current.tool && candidate.tool && current.tool === candidate.tool;
  const tagOverlap = getTagOverlapScore(currentTags, candidateTags);
  const keywordOverlap = getKeywordOverlapScore(current, candidate);
  const popularity = Math.min(24, getBlogPopularityScore(candidate) / 8);
  const dateTime = Date.parse(candidate.date || candidate.updatedAt || candidate.createdAt || "");
  const daysOld = dateTime
    ? Math.max(0, (Date.now() - dateTime) / (1000 * 60 * 60 * 24))
    : 120;
  const recency = Math.max(0, 16 - Math.min(daysOld, 60) / 4);

  return (
    (sameCategory ? 42 : 0) +
    (sameTool ? 18 : 0) +
    tagOverlap * 20 +
    Math.min(keywordOverlap, 8) * 4 +
    popularity +
    recency
  );
}

export function getRelatedBlogsForPost(currentPost, posts = blogPosts, limit = 6) {
  if (!currentPost) return sortBlogsByDate(posts).slice(0, limit);

  return posts
    .filter((post) => post?.slug && post.slug !== currentPost.slug)
    .map((post, index) => ({
      post,
      index,
      score: scoreRelatedBlog(currentPost, post),
    }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateA = Date.parse(a.post.date || "") || 0;
      const dateB = Date.parse(b.post.date || "") || 0;
      if (dateB !== dateA) return dateB - dateA;
      return a.index - b.index;
    })
    .slice(0, limit)
    .map(({ post }) => post);
}

export function getBlogTagBySlug(tagSlug, posts = blogPosts) {
  return (
    getAllBlogTags(posts).find((tag) => blogTaxonomySlug(tag) === tagSlug) ||
    taxonomyLabelFromSlug(tagSlug)
  );
}

export function filterBlogsByCategorySlug(posts = blogPosts, categorySlug) {
  if (!categorySlug) return posts;
  return posts.filter((post) => blogTaxonomySlug(post.category) === categorySlug);
}

export function filterBlogsByTagSlug(posts = blogPosts, tagSlug) {
  if (!tagSlug) return posts;
  return posts.filter((post) =>
    (Array.isArray(post.tags) ? post.tags : []).some(
      (tag) => blogTaxonomySlug(tag) === tagSlug,
    ),
  );
}

export function getBlogStats(posts = blogPosts) {
  const categories = getBlogCategories(posts).filter((category) => category !== "All");
  return {
    posts: posts.length,
    categories: categories.length,
    tools: new Set(posts.map((post) => post.tool).filter(Boolean)).size,
  };
}

export function getFeaturedBlogGroups(posts = blogPosts) {
  return {
    hero: posts[0] || null,
    side: posts.slice(1, 5),
    trending: posts.slice(5, 11),
    latest: posts.slice(0, 12),
  };
}

export function getRelatedBlogs(slug, limit = 6) {
  const current = getBlogBySlug(slug);
  if (!current) return blogPosts.filter((post) => post.slug !== slug).slice(0, limit);
  return getRelatedBlogsForPost(current, blogPosts, limit);
}

export default blogPosts;
