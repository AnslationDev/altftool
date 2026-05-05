export function filterNews(news, type) {
  switch (type) {
    case "trending":
      return [...news]
        .sort(
          (a, b) =>
            b.likes + b.comments + b.shares -
            (a.likes + a.comments + a.shares)
        )
        .slice(0, 6);

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
      return [...news]
        .sort(
          (a, b) =>
            b.likes + b.comments + b.shares -
            (a.likes + a.comments + a.shares)
        )
        .slice(0, 5);

    default:
      return news;
  }
}
