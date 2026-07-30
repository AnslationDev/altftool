"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, List } from "lucide-react";
import { formatAuthorName } from "@/app/wattpad/utils/formatAuthorName";

const REFINE_TAGS = [
  "romance", "love", "slowburn", "billionaire",
  "darkromance", "mafia", "enemiestolovers",
  "newadult", "possessive", "marriage", "ceo",
  "india", "mature",
];

const SORT_OPTIONS = [
  { value: "hot", label: "Hot" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

function sortBooks(list, sortKey) {
  const sorted = [...list];
  if (sortKey === "popular") {
    sorted.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
  } else if (sortKey === "rating") {
    sorted.sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0));
  } else if (sortKey === "newest") {
    sorted.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  }
  return sorted;
}

export default function CategoryStoryList({ books }) {
  const [activeTags, setActiveTags] = useState([]);
  const [sortKey, setSortKey] = useState("hot");

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const visibleBooks = useMemo(() => {
    const filtered = activeTags.length
      ? books.filter((book) =>
          book.tags?.some((tag) => activeTags.includes(tag.toLowerCase()))
        )
      : books;
    return sortBooks(filtered, sortKey);
  }, [books, activeTags, sortKey]);

  return (
    <>
      <div className="bg-card border border-(--border) rounded-xl p-4 md:p-6 mb-6 shadow-sm">
        <h3 className="text-sm text-(--muted-foreground) mb-3 font-medium">
          Refine by tag:
        </h3>
        <div className="flex flex-wrap gap-2">
          {REFINE_TAGS.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={active}
                className={`wp-filter-btn ${
                  active
                    ? "bg-(--primary) text-primary-foreground border-(--primary)"
                    : ""
                }`}
              >
                {active ? "✓" : "+"} {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="bg-card border border-(--border) rounded-xl p-4 md:p-6 shadow-sm">
          <div className="wp-hot-header">
            <h2 className="wp-hot-title">{visibleBooks.length} Stories</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-(--muted-foreground)">
                Sort by:
              </span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value)}
                aria-label="Sort stories"
                className="wp-hot-sort bg-transparent cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visibleBooks.length === 0 ? (
            <p className="text-sm text-(--muted-foreground) py-10 text-center">
              No stories match the selected tags.
            </p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-7 gap-y-6">
              {visibleBooks.map((book, index) => (
                <Link key={book.id} href={`/wattpad/book/${book.slug}`}>
                  <div className="wp-related-card">
                    <div className="wp-related-cover">
                      <Image
                        src={book.coverImage}
                        width={170}
                        height={260}
                        alt={book.title}
                        className="w-full h-[170px] sm:h-[190px] md:h-[220px] object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-start pt-1">
                      <h3 className="wp-related-title">
                        <span className="wp-related-number">{index + 1}.</span>{" "}
                        {book.title}
                      </h3>
                      <p className="wp-related-author">{formatAuthorName(book.authorId)}</p>
                      <div className="wp-related-stats">
                        <span className="flex items-center gap-1">
                          <Eye size={16} /> {book.stats.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <List size={16} /> {book.stats.totalChapters} parts
                        </span>
                      </div>
                      <p className="wp-related-summary">{book.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {book.tags?.slice(0, 4).map((tag) => (
                          <span key={tag} className="wp-book-tag text-xs py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
