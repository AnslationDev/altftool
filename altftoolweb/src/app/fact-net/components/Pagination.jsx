import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createPageUrl } from "../data/factNetData";

export default function Pagination({ page, totalPages, pathname, params = {} }) {
  if (totalPages <= 1) return null;

  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav className="fn-panel fn-pagination" aria-label="Pagination">
      <Link
        href={previous ? createPageUrl(pathname, { ...params, page: previous }) : "#"}
        aria-disabled={!previous}
        className={`fn-button ${previous ? "" : "fn-disabled"}`}
      >
        <ArrowLeft className="fn-icon" />
        Previous
      </Link>

      <div className="fn-chip">
        Page {page} of {totalPages}
      </div>

      <Link
        href={next ? createPageUrl(pathname, { ...params, page: next }) : "#"}
        aria-disabled={!next}
        className={`fn-button ${next ? "" : "fn-disabled"}`}
      >
        Next
        <ArrowRight className="fn-icon" />
      </Link>
    </nav>
  );
}
