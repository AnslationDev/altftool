import FactNetNav from "../components/FactNetNav";
import CategoryGrid from "../components/CategoryGrid";
import SearchForm from "../components/SearchForm";
import { getAllCategories, getSearchSuggestions } from "../data/factNetData";

export default function Categories() {
  const categories = [...getAllCategories()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
  const suggestions = getSearchSuggestions();

  return (
    <main className="fn-page">
      <div className="fn-stack">
        <FactNetNav />
        <section className="fn-glass">
          <div className="fn-panel-inner">
            <p className="fn-kicker">Categories</p>
            <h1 className="fn-title-sm">Knowledge Category Index</h1>
            <p className="fn-subtitle">
              Browse our original knowledge categories, covering sports culture, digital culture, design wellness, science, and future home systems.
            </p>
          </div>
        </section>
        <SearchForm action="/fact-net/listings" categories={categories} suggestions={suggestions} compact />
        <CategoryGrid categories={categories} />
      </div>
    </main>
  );
}
