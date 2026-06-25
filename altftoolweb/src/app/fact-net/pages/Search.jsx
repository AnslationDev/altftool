import ArticleGrid from "../components/ArticleGrid";
import FactNetNav from "../components/FactNetNav";
import Pagination from "../components/Pagination";
import SearchForm from "../components/SearchForm";
import {
  formatCount,
  getAllCategories,
  getArticlesPage,
  getSearchSuggestions,
} from "../data/factNetData";

export default function Search({ searchParams }) {
  const query = searchParams?.q || "";
  const categoryPath = searchParams?.category || "";
  const sort = searchParams?.sort || "latest";
  const page = searchParams?.page || 1;
  const categories = getAllCategories();
  const suggestions = getSearchSuggestions();
  const result = getArticlesPage({ page, query, categoryPath, sort });

  return (
    <main className="fn-page">
      <div className="fn-stack">
        <FactNetNav />
        <section className="fn-glass">
          <div className="fn-panel-inner">
            <p className="fn-kicker">Search</p>
            <h1 className="fn-title-sm">{query ? `Results for ${query}` : "Search Fact Hub"}</h1>
            <p className="fn-subtitle">Found {formatCount(result.total)} original topic guides matching your search query.</p>
          </div>
        </section>
        <SearchForm
          action="/fact-net/search"
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
          pathname="/fact-net/search"
          params={{ q: query, category: categoryPath, sort }}
        />
      </div>
    </main>
  );
}
