"use client";

import { useState } from "react";
import Link from "next/link";
import LocalFactImage from "./LocalFactImage";

const PAGE_SIZE = 6;

function paginate(articles, size) {
  const pages = [];
  for (let index = 0; index < articles.length; index += size) {
    pages.push(articles.slice(index, index + size));
  }
  return pages.length ? pages : [[]];
}

export default function FeatureCarousel({ articles }) {
  const pages = paginate(articles, PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(0);
  const currentPage = pages[pageIndex] || [];

  function goToPrevious() {
    setPageIndex((index) => (index - 1 + pages.length) % pages.length);
  }

  function goToNext() {
    setPageIndex((index) => (index + 1) % pages.length);
  }

  return (
    <div className="fn-latest-wrap">
      <button
        type="button"
        className="fn-carousel-arrow fn-carousel-arrow-left"
        aria-label="Previous facts"
        onClick={goToPrevious}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div className="fn-feature-strip">
        {currentPage.map((article) => (
          <Link key={article.slug} href={article.href} className="fn-feature-card">
            <span className="fn-feature-image">
              <LocalFactImage article={article} fallbackLabel={article.title} />
            </span>
            <span className="fn-feature-meta">
              <strong>{article.categoryLabel}</strong>
              <i aria-hidden="true" />
              <time dateTime={article.lastmod}>{article.displayDate}</time>
            </span>
            <span className="fn-feature-title">{article.title}</span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="fn-carousel-arrow fn-carousel-arrow-right"
        aria-label="Next facts"
        onClick={goToNext}
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}
