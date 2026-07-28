"use client";

import { useMemo, useState } from "react";
import { forumCategories, forumThreads } from "../data/forums";
import { paginate } from "../utils/forumUtils";

export default function useForumState() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredThreads = useMemo(() => {
    const term = query.trim().toLowerCase();
    return forumThreads.filter((thread) => {
      const categoryMatch = activeCategory === "all" || thread.categorySlug === activeCategory;
      const textMatch = !term || `${thread.title} ${thread.excerpt} ${thread.author}`.toLowerCase().includes(term);
      return categoryMatch && textMatch;
    });
  }, [activeCategory, query]);

  const visibleThreads = useMemo(() => paginate(filteredThreads, page, 12), [filteredThreads, page]);

  function chooseCategory(slug) {
    setActiveCategory(slug);
    setPage(1);
  }

  return {
    activeCategory,
    chooseCategory,
    query,
    setQuery,
    page,
    setPage,
    categories: forumCategories,
    totalThreads: filteredThreads.length,
    visibleThreads,
  };
}
