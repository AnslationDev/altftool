"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  SORT_OPTIONS,
  RATING_OPTIONS,
  DELIVERY_OPTIONS,
  STATUS_OPTIONS,
} from "../data/staticContent";
import { baloo2 } from "../lib/fonts";

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b-2 border-dashed border-[#e2ded0] py-4 first:pt-0 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className={`${baloo2.className} text-sm font-bold text-[#171717]`}>{title}</span>
        <ChevronDown
          size={15}
          className={`text-[#8a8578] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({ checked, onChange, label, count }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-sm text-[#171717]">
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-2 border-[#171717] accent-[#4CC9F0]"
        />
        {label}
      </span>
      {count != null && <span className="text-xs text-[#8a8578]">{count}</span>}
    </label>
  );
}

export default function FilterSidebar({
  categories,
  brands,
  priceRanges,
  discountRanges,
  filters,
  setFilter,
  toggleFilter,
  resetFilters,
  filteredCount,
  activeFilterCount,
  isOpen,
  onClose,
}) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b-[3px] border-[#171717] px-5 py-4 lg:hidden">
        <span className={`${baloo2.className} flex items-center gap-2 text-sm font-bold text-[#171717]`}>
          <SlidersHorizontal size={15} />
          Filters
        </span>
        <button type="button" onClick={onClose} aria-label="Close filters" className="text-[#171717]">
          <X size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="relative mb-4">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8578]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border-2 border-[#171717] bg-[#ffffff] py-2.5 pl-9 pr-3 text-sm text-[#171717] outline-none transition-colors focus:border-[#4CC9F0]"
          />
        </div>

        <FilterGroup title="Sort by">
          <select
            value={filters.sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="w-full rounded-lg border-2 border-[#171717] bg-[#ffffff] px-3 py-2 text-sm text-[#171717] outline-none focus:border-[#4CC9F0]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup title="Category">
          <div className="max-h-44 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <Checkbox
                key={cat.key}
                label={cat.label}
                count={cat.count}
                checked={filters.categories.includes(cat.key)}
                onChange={() => toggleFilter("categories", cat.key)}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Discount">
          {discountRanges.map((d) => (
            <Checkbox
              key={d.key}
              label={`${d.min}% or more`}
              count={d.count}
              checked={filters.discountMins.includes(d.min)}
              onChange={() => toggleFilter("discountMins", d.min)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Brand" defaultOpen={false}>
          <div className="max-h-44 overflow-y-auto pr-1">
            {brands.slice(0, 30).map((b) => (
              <Checkbox
                key={b.key}
                label={b.label}
                count={b.count}
                checked={filters.brands.includes(b.key)}
                onChange={() => toggleFilter("brands", b.key)}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Price Range">
          {priceRanges.map((r) => (
            <Checkbox
              key={r.key}
              label={r.label}
              count={r.count}
              checked={filters.priceRanges.includes(r.key)}
              onChange={() => toggleFilter("priceRanges", r.key)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Rating">
          {RATING_OPTIONS.map((r) => (
            <label key={r.key} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-[#171717]">
              <input
                type="radio"
                name="tdp-rating"
                checked={filters.minRating === r.min}
                onChange={() => setFilter("minRating", filters.minRating === r.min ? 0 : r.min)}
                className="h-4 w-4 border-2 border-[#171717] accent-[#4CC9F0]"
              />
              {r.label}
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Delivery">
          {DELIVERY_OPTIONS.map((d) => (
            <Checkbox
              key={d.key}
              label={d.label}
              checked={filters.deliverySpeeds.includes(d.key)}
              onChange={() => toggleFilter("deliverySpeeds", d.key)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Product Status">
          {STATUS_OPTIONS.map((s) => (
            <Checkbox
              key={s.key}
              label={s.label}
              checked={filters.status.includes(s.key)}
              onChange={() => toggleFilter("status", s.key)}
            />
          ))}
        </FilterGroup>
      </div>

      <div className="border-t-[3px] border-[#171717] px-5 py-4">
        <p className="mb-3 text-center text-xs font-semibold text-[#8a8578]">
          {filteredCount.toLocaleString("en-IN")} deals match
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetFilters}
            disabled={!activeFilterCount}
            className="tdp-neo-btn flex-1 bg-[#ffffff] py-2.5 text-sm text-[#171717]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="tdp-neo-btn flex-1 bg-[#4CC9F0] py-2.5 text-sm text-[#171717] lg:hidden"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sticky sidebar. A fixed `h-` (not `max-h-`) is required
          here: percentage heights (the `h-full` on the flex column inside)
          only resolve against a definite parent height, and `max-height`
          alone doesn't count as one. With only max-h, `h-full` fell back to
          auto, the inner `flex-1 overflow-y-auto` list never got a size to
          shrink against, and its content silently overflowed past the
          sidebar's bounds. */}
      <aside className="tdp-neo-card sticky top-20 hidden h-[calc(100vh-6rem)] w-72 shrink-0 overflow-hidden bg-[#ffffff] lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-[#171717]/40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm border-r-[3px] border-[#171717] bg-[#ffffff] shadow-2xl lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
