import { productHuntQuery } from "./client";

const POSTS_BY_TOPIC_QUERY = `
  query PostsByTopic($topic: String!, $first: Int!) {
    posts(topic: $topic, order: VOTES, first: $first) {
      pageInfo { hasNextPage }
      edges {
        node {
          id
          name
          tagline
          description
          votesCount
          website
          url
          thumbnail { url }
        }
      }
    }
  }
`;

/** Builds a real, post-derived description — Product Hunt's tagline + description + real vote count, nothing invented. */
function buildDescription(node) {
  const parts = [];
  if (node.tagline) parts.push(`${node.tagline}.`);
  if (node.description && node.description !== node.tagline) parts.push(node.description);
  if (typeof node.votesCount === "number") parts.push(`${node.votesCount.toLocaleString()} upvotes on Product Hunt.`);
  return parts.join(" ") || null;
}

/**
 * votesCount is real, but it's an unbounded popularity count, not a 0-10
 * rating — left null rather than rescaled into a fake score, same policy
 * as every other provider here. The real ranking is Product Hunt's own
 * `order: VOTES` server-side sort, already reflected in list order.
 */
function normalizeProduct(node) {
  return {
    id: node.id,
    title: node.name,
    subtitle: node.tagline || null,
    image: node.thumbnail?.url || null,
    rating: null,
    description: buildDescription(node),
    url: node.website || node.url || null,
  };
}

/**
 * Real Product Hunt topic slugs — powers the "browse by category" grid.
 * The products themselves are always real, live-fetched via `topic:`;
 * this only decides which category buttons the grid offers, same idea
 * as TMDB's curated genre list. Images/descriptions are our own curated
 * set (Product Hunt's topic objects aren't queried for artwork here),
 * same approach as every other provider's category metadata.
 */
const TOOL_CATEGORIES = [
  {
    id: "artificial-intelligence",
    label: "Artificial Intelligence",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&q=75",
    description: "The AI tools everyone's actually using right now.",
  },
  {
    id: "productivity",
    label: "Productivity",
    image: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=500&q=75",
    description: "Tools built to save time — daily-use apps worth adopting.",
  },
  {
    id: "developer-tools",
    label: "Developer Tools",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=75",
    description: "New tools developers are shipping and using every day.",
  },
  {
    id: "saas",
    label: "SaaS",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=75",
    description: "Subscription software making waves this year.",
  },
  {
    id: "design-tools",
    label: "Design Tools",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=75",
    description: "Fresh tools for designers — from prototyping to handoff.",
  },
  {
    id: "no-code",
    label: "No-Code",
    image: "https://images.unsplash.com/photo-1522252234503-e356532cafd5?w=500&q=75",
    description: "Build without writing a line of code.",
  },
  {
    id: "marketing",
    label: "Marketing",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=75",
    description: "Growth, analytics, and campaign tools launching today.",
  },
  {
    id: "chrome-extensions",
    label: "Chrome Extensions",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&q=75",
    description: "Small add-ons, big daily-use impact.",
  },
];

export function getToolCategories() {
  return TOOL_CATEGORIES;
}

/**
 * Top products within a single topic, in Product Hunt's own real vote
 * order. The v2 API paginates by cursor, not offset/page number — so
 * rather than persist a cursor between stateless requests, each call
 * fetches everything up through the requested page in one shot (bounded
 * by the app's own MAX_ITEMS=20 cap, so this is at most 20 posts) and
 * slices the window actually needed, same "fetch-once-slice" pattern as
 * TheMealDB/TheCocktailDB/Foursquare.
 */
export async function getToolsByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  const fetchCount = Math.min(page * limit, 20);
  const data = await productHuntQuery(POSTS_BY_TOPIC_QUERY, { topic: categoryId, first: fetchCount });

  const edges = data.posts?.edges || [];
  const all = edges.map((edge) => normalizeProduct(edge.node));

  const start = (page - 1) * limit;
  const tools = all.slice(start, start + limit);
  const hasMore = Boolean(data.posts?.pageInfo?.hasNextPage) || all.length > start + limit;
  return { tools, hasMore };
}

/**
 * Product Hunt's v2 API has no full-text post search endpoint (confirmed
 * against their documented schema — posts are queried by topic,
 * collection, or id, never free text). This searches within the
 * Artificial Intelligence topic's real top posts by matching the query
 * against each post's own name/tagline/description — a practical
 * approximation given the API's actual constraints, not a fabricated
 * result set.
 */
export async function searchTools(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim().toLowerCase();
  if (!trimmed) return { tools: [], hasMore: false };

  const data = await productHuntQuery(POSTS_BY_TOPIC_QUERY, { topic: "artificial-intelligence", first: 50 });
  const edges = data.posts?.edges || [];
  const matches = edges
    .map((edge) => normalizeProduct(edge.node))
    .filter((tool) =>
      [tool.title, tool.subtitle, tool.description].some((field) => field?.toLowerCase().includes(trimmed)),
    );

  const start = (page - 1) * limit;
  const tools = matches.slice(start, start + limit);
  return { tools, hasMore: start + limit < matches.length };
}
