import Link from "next/link";
import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "No topics found",
  description = "Try a broader query or browse the category index.",
}) {
  return (
    <div className="fn-panel fn-empty">
      <span className="fn-stat-icon">
        <SearchX className="fn-icon" />
      </span>
      <h2 className="fn-title-sm">{title}</h2>
      <p className="fn-subtitle">{description}</p>
      <Link href="/fact-net/categories" className="fn-button fn-button-primary">
        Browse categories
      </Link>
    </div>
  );
}
