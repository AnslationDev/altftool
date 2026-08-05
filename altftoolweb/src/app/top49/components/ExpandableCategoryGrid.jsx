'use client';

import { useState } from 'react';
import { CategoryTile } from './cards.jsx';

const INITIAL_COUNT = 16; // 4 rows on the widest grid
const STEP = 16;

/**
 * Progressive category reveal.
 *
 * The affordance is a bare chevron, not a button: each press reveals the next
 * batch of categories and the chevron keeps bouncing while more remain. Once
 * everything is showing it flips to point up and collapses back.
 */
export default function ExpandableCategoryGrid({ categories = [] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const total = categories.length;
  const isFullyExpanded = visibleCount >= total;
  const visibleCategories = categories.slice(0, visibleCount);
  const remaining = Math.max(0, total - visibleCount);

  function handleToggle() {
    setVisibleCount((prev) => (prev >= total ? INITIAL_COUNT : Math.min(prev + STEP, total)));
  }

  return (
    <div className="t49-expandable-grid-container">
      <div id="t49-category-grid" className="t49-grid t49-grid--4 t49-grid--tight">
        {visibleCategories.map((category, index) => (
          <div
            key={category.slug}
            className={index >= INITIAL_COUNT ? 't49-grid-item-fade' : undefined}
            style={
              index >= INITIAL_COUNT
                ? { animationDelay: `${(index % STEP) * 30}ms` }
                : undefined
            }
          >
            <CategoryTile category={category} />
          </div>
        ))}
      </div>

      {total > INITIAL_COUNT ? (
        <div className="t49-expand-controls">
          <button
            type="button"
            onClick={handleToggle}
            className="t49-expand-arrow"
            aria-expanded={isFullyExpanded}
            aria-controls="t49-category-grid"
            title={isFullyExpanded ? 'Collapse' : `Show ${Math.min(STEP, remaining)} more`}
          >
            <span className="t49-sr">
              {isFullyExpanded
                ? `Showing all ${total} categories. Collapse the list.`
                : `Showing ${visibleCount} of ${total} categories. Show ${Math.min(STEP, remaining)} more.`}
            </span>
            <svg
              className={`t49-expand-arrow__icon${isFullyExpanded ? ' is-expanded' : ' is-bouncing'}`}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      ) : null}

      <p className="t49-sr" aria-live="polite">
        {isFullyExpanded
          ? `All ${total} categories shown.`
          : `${visibleCount} of ${total} categories shown.`}
      </p>
    </div>
  );
}
