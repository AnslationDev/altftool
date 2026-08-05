import { CategoryTile, SectionHead } from "./primitives";
import { T } from "../i18n/T";

/**
 * The full 24-category grid — the real navigation of the whole vertical.
 *
 * Every category is rendered (not a "popular six" subset) because this grid is
 * both the human entry point and the crawler's route into `/bazaar/c/<slug>`.
 * Counts come from the listing corpus so a quiet category reads as quiet
 * instead of pretending to be busy.
 *
 * @param {{ categories: Array<object>, counts: Map<string, number> }} props
 */
export default function HomeCategoryStrip({ categories = [], counts }) {
  if (categories.length === 0) return null;

  return (
    <section className="bzr-section" aria-label="Browse by category">
      <div className="section-container">
        <SectionHead
          title={<T id="home.categories.title" fallback="Browse by category" />}
          href="/bazaar/categories"
          linkLabel={<T id="home.categories.link" fallback="Browse all categories" />}
        />

        <div className="bzr-cat-grid">
          {categories.map((category) => (
            <CategoryTile
              key={category.slug}
              category={category}
              count={counts?.get(category.slug) ?? 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
