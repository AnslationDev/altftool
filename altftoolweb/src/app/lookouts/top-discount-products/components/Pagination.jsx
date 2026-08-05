import { ChevronLeft, ChevronRight } from "lucide-react";
import { baloo2 } from "../lib/fonts";

function pageWindow(current, total) {
  const span = 1;
  const pages = new Set([1, total, current]);
  for (let i = current - span; i <= current + span; i++) {
    if (i > 0 && i <= total) pages.add(i);
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  const pages = pageWindow(page, pageCount).map((p, i, arr) => ({
    page: p,
    showEllipsis: i > 0 && p - arr[i - 1] > 1,
  }));

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="tdp-neo-card-sm flex h-9 w-9 items-center justify-center bg-[#ffffff] text-[#171717] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map(({ page: p, showEllipsis }) => {
        return (
          <span key={p} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-sm text-[#8a8578]">…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${baloo2.className} tdp-neo-card-sm flex h-9 w-9 items-center justify-center text-sm font-bold ${
                p === page ? "bg-[#4CC9F0] text-[#171717]" : "bg-[#ffffff] text-[#171717]"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className="tdp-neo-card-sm flex h-9 w-9 items-center justify-center bg-[#ffffff] text-[#171717] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
