import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ArticleGrid from "../components/ArticleGrid";
import FactNetNav from "../components/FactNetNav";
import Pagination from "../components/Pagination";
import SearchForm from "../components/SearchForm";
import StatSummary from "../components/StatSummary";
import {
  formatCount,
  formatDate,
  getAllCategories,
  getArticlesPage,
  getCategoryByPath,
  getSearchSuggestions,
} from "../data/factNetData";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";

export default function CategoryDetail({ categoryPath, searchParams }) {
  const category = getCategoryByPath(categoryPath);

  if (!category) notFound();

  const query = searchParams?.q || "";
  const sort = searchParams?.sort || "latest";
  const page = searchParams?.page || 1;
  const categories = getAllCategories();
  const suggestions = getSearchSuggestions();
  const result = getArticlesPage({
    page,
    query,
    categoryPath: category.categoryPath,
    sort,
  });

  const stats = [
    { label: "Guides", value: result.total, icon: "archive" },
    { label: "Category path", value: category.categoryPath, icon: "folder" },
    { label: "Last update", value: formatDate(category.lastmod), icon: "calendar" },
    { label: "Image slots", value: result.total, icon: "link" },
  ];

  const path = `/fact-net/categories/${category.categoryPath}`;

  return (
    <main className="fn-page">
      {/* ItemList mirrors the page of topics ArticleGrid renders below (the
          grid is paginated, so this is the current page, in render order). */}
      <JsonLd
        id={`fact-net-category-schema-${category.categoryPath}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: category.name,
            description: category.description,
          }),
          createItemListJsonLd({
            path,
            name: `${category.name} fact guides`,
            items: result.items.map((article) => ({
              name: article.title,
              path: article.href,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Fact Hub", path: "/fact-net" },
            { name: "Categories", path: "/fact-net/categories" },
            { name: category.name, path },
          ]),
        ]}
      />
      <div className="fn-stack">
        <FactNetNav />
        <section className="fn-glass">
          <div className="fn-panel-inner">
            <p className="fn-kicker">Category</p>
            <h1 className="fn-title-sm">{category.name}</h1>
            <p className="fn-subtitle">
              {formatCount(result.total)} original topics matched this category path.
            </p>
          </div>
        </section>
        <StatSummary items={stats} />
        <SearchForm
          action={`/fact-net/categories/${category.categoryPath}`}
          query={query}
          categoryPath={category.categoryPath}
          sort={sort}
          categories={categories}
          suggestions={suggestions}
          compact
        />
        <ArticleGrid articles={result.items} emptyTitle="No original topics in this category" />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          pathname={`/fact-net/categories/${category.categoryPath}`}
          params={{ q: query, sort }}
        />
        <div className="fn-nav">
          <Link href="/fact-net/categories" className="fn-button fn-button-primary">
            All categories
            <ArrowRight className="fn-icon" />
          </Link>
        </div>
      </div>
    </main>
  );
}
