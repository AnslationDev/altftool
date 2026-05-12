import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function FilterBar({ filters, activeFilter, setActiveFilter }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-8 w-full">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 flex-1 pr-4">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-[9999px] text-[14px] font-medium transition-all ${
              activeFilter === filter
                ? "bg-[#2563EB] text-white"
                : "bg-[#F3F4F6] dark:bg-[var(--muted)] text-[#111827] dark:text-[var(--foreground)] hover:bg-[#E5E7EB] dark:hover:bg-[var(--border)]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <button className="w-[44px] h-[44px] flex items-center justify-center bg-[#F3F4F6] dark:bg-[var(--muted)] hover:bg-[#E5E7EB] dark:hover:bg-[var(--border)] rounded-[9999px] shrink-0 transition-colors text-[#111827] dark:text-[var(--foreground)]">
        <SlidersHorizontal size={18} />
      </button>
    </div>
  );
}
