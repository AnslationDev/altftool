"use client";

import AcademyGrid from "./AcademyGrid";
import { AcademyResultsSkeleton } from "@/components/ui/skeleton";

export default function AcademyResults({ items, activeCategory, loading = false }) {
  if (!activeCategory) return null;

  if (loading) {
    return <AcademyResultsSkeleton />;
  }

  return (
    <section id="academy-project" className="section animate-slide-up">
      {items?.length > 0 ? (
        <AcademyGrid items={items} activeCategory={activeCategory}/>
      ) : (
        <p className="text-center text-gray-500 py-10 animate-slide-up">No results found</p>
      )}
    </section>
  );
}
