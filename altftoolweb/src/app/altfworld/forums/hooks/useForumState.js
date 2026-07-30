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

  // A new search term can shrink the result set below the current page,
  // leaving the user stranded on an empty page — reset to page 1 like
  // chooseCategory already does for category changes.
  function updateQuery(value) {
    setQuery(value);
    setPage(1);
  }

  return {
    activeCategory,
    chooseCategory,
    query,
    setQuery: updateQuery,
    page,
    setPage,
    categories: forumCategories,
    totalThreads: filteredThreads.length,
    visibleThreads,
  };
}
