// Articles carry no engagement data (we do not measure likes/comments/shares
// for syndicated feed items), so every "most popular" style view falls back to
// recency — the only signal we actually have.
function byNewestFirst(news) {
  return [...news].sort(
    (a, b) => (a.published_hours_ago ?? 0) - (b.published_hours_ago ?? 0)
  );
}

export function filterNews(news, type) {
  switch (type) {
    case "trending":
      return byNewestFirst(news).slice(0, 6);

    case "local":
      return news.filter(
        (n) =>
          n.publisher_type === "local" ||
          n.location?.includes("Minneapolis")
      );

    case "headlines":
      return news.filter(
        (n) => n.publisher_type === "media" || n.publisher_type === "wire"
      );

    case "newsletter":
      return byNewestFirst(news).slice(0, 5);

    default:
      return news;
  }
}
