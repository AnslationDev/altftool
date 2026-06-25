import CategoryCard from "./CategoryCard";
import EmptyState from "./EmptyState";

export default function CategoryGrid({ categories }) {
  if (!categories.length) {
    return <EmptyState title="No categories found" />;
  }

  return (
    <div className="fn-grid">
      {categories.map((category) => (
        <CategoryCard key={category.categoryPath} category={category} />
      ))}
    </div>
  );
}
