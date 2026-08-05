'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { photo } from '../lib/images.js';
import { initials } from '../lib/format.js';

const MAX = 4;

/**
 * Entry picker for the compare page.
 *
 * Follows the shared configurator grammar: a pill search input
 * above a grid of option chips, each carrying a thumbnail, a label and the
 * context that distinguishes it. Selection lives in the URL so the comparison
 * itself stays server-rendered and every comparison is a shareable link.
 */
export default function ComparePicker({ candidates = [], selectedSlugs = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();

  const full = selectedSlugs.length >= MAX;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = candidates.filter((c) => !selectedSlugs.includes(c.item.slug));
    if (!q) return pool.slice(0, 12);
    return pool
      .filter(
        (c) =>
          c.item.name.toLowerCase().includes(q) ||
          (c.item.subtitle || '').toLowerCase().includes(q) ||
          c.list.shortTitle.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [candidates, query, selectedSlugs]);

  function navigate(slugs) {
    startTransition(() => {
      router.push(slugs.length ? `/top49/compare?items=${slugs.join(',')}` : '/top49/compare', {
        scroll: false,
      });
    });
  }

  function add(slug) {
    if (full || selectedSlugs.includes(slug)) return;
    setQuery('');
    navigate([...selectedSlugs, slug]);
  }

  return (
    <div style={{ opacity: pending ? 0.6 : 1 }} aria-busy={pending}>
      <label htmlFor="t49-compare-search" className="t49-sr">
        Find an entry to compare
      </label>
      <div className="t49-field" style={{ maxWidth: 460 }}>
        <span className="t49-field__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          id="t49-compare-search"
          className="t49-input"
          type="search"
          autoComplete="off"
          placeholder={full ? 'Remove one to add another' : 'Search any ranked entry…'}
          value={query}
          disabled={full}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {full ? (
        <p className="t49-caption t49-faint" style={{ marginTop: 16 }}>
          Four is the maximum — the matrix stays readable at that width.
        </p>
      ) : (
        <ul className="t49-cmp-options" style={{ marginTop: 20 }}>
          {results.length ? (
            results.map(({ item, list, ranking }) => (
              <li key={item.slug}>
                <button type="button" className="t49-cmp-chip" onClick={() => add(item.slug)}>
                  <Thumb item={item} />
                  <span className="t49-cmp-chip__text">
                    <span className="t49-cmp-chip__name">{item.name}</span>
                    <span className="t49-cmp-chip__where">
                      #{ranking.rank} · {list.shortTitle}
                    </span>
                  </span>
                  <span aria-hidden="true" style={{ marginLeft: 'auto', opacity: 0.45 }}>
                    ＋
                  </span>
                  <span className="t49-sr">Add {item.name} to the comparison</span>
                </button>
              </li>
            ))
          ) : (
            <li className="t49-caption t49-faint">No entries match “{query}”.</li>
          )}
        </ul>
      )}
    </div>
  );
}

function Thumb({ item }) {
  const [failed, setFailed] = useState(false);
  const src = item.image ? photo(item.image, { w: 96 }) : null;

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="t49-cmp-chip__thumb"
        style={{
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--muted-foreground)',
        }}
      >
        {initials(item.name)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={34}
      height={34}
      loading="lazy"
      className="t49-cmp-chip__thumb"
      onError={() => setFailed(true)}
    />
  );
}
