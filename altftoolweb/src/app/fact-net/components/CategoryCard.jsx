import Link from "next/link";
import { ArrowRight, FolderTree } from "lucide-react";
import { formatCount, formatDate } from "../data/factNetData";

export default function CategoryCard({ category }) {
  return (
    <Link href={category.href} className={`fn-card fn-category-card fn-cat-${category.categoryPath}`}>
      <div className="fn-chip-row">
        <span className="fn-category-icon">
          <FolderTree className="fn-icon" />
        </span>
        <span className="fn-icon-button" aria-hidden="true">
          <ArrowRight className="fn-icon" />
        </span>
      </div>
      <div className="fn-card-body">
        <h3 className="fn-card-title">{category.name}</h3>
        <p className="fn-card-summary">{category.description}</p>
        <div className="fn-chip-row">
          <span className="fn-chip">{formatCount(category.count)} topics</span>
          <span className="fn-chip">{formatDate(category.lastmod)}</span>
        </div>
      </div>
    </Link>
  );
}
