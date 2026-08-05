"use client";

import { useSearchParams, usePathname } from "next/navigation";

export default function Pagination({ page, totalPages }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(nextPage) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    // Hard navigation — see FestivalHero.jsx for why router.push() is
    // unreliable here (transition update that can sit pending indefinitely).
    window.location.href = `${pathname}?${params.toString()}`;
  }

  return (
    <div className="pagination">
      <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
        Previous
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
