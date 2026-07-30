import FactNetNav from "../components/FactNetNav";
import CategoryGrid from "../components/CategoryGrid";
import SearchForm from "../components/SearchForm";
import { getAllCategories, getSearchSuggestions } from "../data/factNetData";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";

const CATEGORY_INDEX_SUBTITLE =
  "Browse our original knowledge categories, covering sports culture, digital culture, design wellness, science, and future home systems.";

export default function Categories() {
  const categories = [...getAllCategories()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
  const suggestions = getSearchSuggestions();

  return (
    <main className="fn-page">
      {/* The grid is the whole page, so the ItemList is that grid in render
          order — same sorted array CategoryGrid receives below. */}
      <JsonLd
        id="fact-net-categories-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/fact-net/categories",
            name: "Knowledge Category Index",
            description: CATEGORY_INDEX_SUBTITLE,
          }),
          createItemListJsonLd({
            path: "/fact-net/categories",
            name: "Fact Hub categories",
            items: categories.map((category) => ({
              name: category.name,
              path: category.href,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Fact Hub", path: "/fact-net" },
            { name: "Categories", path: "/fact-net/categories" },
          ]),
        ]}
      />
      <div className="fn-stack">
        <FactNetNav />
        <section className="fn-glass">
          <div className="fn-panel-inner">
            <p className="fn-kicker">Categories</p>
            <h1 className="fn-title-sm">Knowledge Category Index</h1>
            <p className="fn-subtitle">{CATEGORY_INDEX_SUBTITLE}</p>
          </div>
        </section>
        <SearchForm action="/fact-net/listings" categories={categories} suggestions={suggestions} compact />
        <CategoryGrid categories={categories} />
      </div>
    </main>
  );
}
