import ArticleCard from "./ArticleCard";
import EmptyState from "./EmptyState";

export default function ArticleGrid({ articles, emptyTitle = "No topics found" }) {
  if (!articles.length) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="fn-grid">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
