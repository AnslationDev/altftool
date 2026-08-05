"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, PackageSearch } from "lucide-react";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";
import Pagination from "./Pagination";
import { baloo2 } from "../lib/fonts";

const SKELETON_COUNT = 12;

export default function ProductGrid({
  id,
  items,
  status,
  filteredCount,
  page,
  pageCount,
  onPageChange,
  onOpenFilters,
  wishlist,
}) {
  const isLoading = status === "loading";
  const isError = status === "error";
  const isEmpty = status === "ready" && items.length === 0;

  return (
    <div id={id} className="min-w-0 flex-1 scroll-mt-20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className={`${baloo2.className} text-sm font-bold text-[#171717]`}>
          {isLoading ? "Loading deals…" : `${filteredCount.toLocaleString("en-IN")} deals found`}
        </p>
        <button
          type="button"
          onClick={onOpenFilters}
          className="tdp-neo-chip flex items-center gap-2 bg-[#ffffff] px-4 py-2 text-sm text-[#171717] lg:hidden"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {isError && (
        <div className="tdp-neo-card bg-[#ffffff] p-10 text-center">
          <p className="text-sm font-semibold text-[#171717]">
            Couldn&apos;t load deals right now.
          </p>
          <p className="mt-1 text-sm text-[#8a8578]">
            Make sure the deals API is running, then refresh the page.
          </p>
        </div>
      )}

      {isEmpty && (
        <div className="tdp-neo-card flex flex-col items-center bg-[#ffffff] p-14 text-center">
          <PackageSearch size={32} className="text-[#8a8578]" strokeWidth={1.6} />
          <p className="mt-3 text-sm font-semibold text-[#171717]">No deals match your filters</p>
          <p className="mt-1 text-sm text-[#8a8578]">Try loosening a filter or two.</p>
        </div>
      )}

      {!isError && !isEmpty && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
            : (
              <AnimatePresence mode="popLayout">
                {items.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard
                      product={product}
                      saved={wishlist.isSaved(product.id)}
                      onToggleWishlist={wishlist.toggle}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
        </div>
      )}

      {!isLoading && !isError && (
        <Pagination page={page} pageCount={pageCount} onChange={onPageChange} />
      )}
    </div>
  );
}
