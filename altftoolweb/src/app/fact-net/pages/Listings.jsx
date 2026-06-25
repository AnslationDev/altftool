import ArticleGrid from "../components/ArticleGrid";
import FactNetNav from "../components/FactNetNav";
import Pagination from "../components/Pagination";
import SearchForm from "../components/SearchForm";
import {
  formatCount,
  getAllCategories,
  getArticlesPage,
  getCategoryByPath,
  getSearchSuggestions,
} from "../data/factNetData";

export default function Listings({ searchParams }) {
  const query = searchParams?.q || "";
  const categoryPath = searchParams?.category || "";
  const sort = searchParams?.sort || "latest";
  const count = searchParams?.count || "";
  const page = searchParams?.page || 1;
  const categories = getAllCategories();
  const suggestions = getSearchSuggestions();
  const category = categoryPath ? getCategoryByPath(categoryPath) : null;
  const result = getArticlesPage({
    page,
    query,
    categoryPath,
    sort,
    factCount: count,
  });

  const activeLabel = category
    ? category.name
    : query
      ? `Search: ${query}`
      : count
        ? `${count} facts`
        : "All original topics";

  return (
    <main className="fn-page">
      <div className="fn-stack">
        <FactNetNav />
        <section className="fn-glass">
          <div className="fn-panel-inner">
            <p className="fn-kicker">Listings</p>
            <h1 className="fn-title-sm">{activeLabel}</h1>
            <p className="fn-subtitle">Explore {formatCount(result.total)} original topic guides and learning resources.</p>
          </div>
        </section>
        <SearchForm
          action="/fact-net/listings"
          query={query}
          categoryPath={categoryPath}
          sort={sort}
          categories={categories}
          suggestions={suggestions}
        />
        <ArticleGrid articles={result.items} />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          pathname="/fact-net/listings"
          params={{ q: query, category: categoryPath, sort, count }}
        />
      </div>
    </main>
  );
}
