'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';

/**
 * Filter, sort and view controls for a ranked list.
 *
 * State lives entirely in the URL so every view is shareable, the back button
 * behaves, and results stay server-rendered. Updates run inside a transition so
 * the current rows stay on screen (dimmed) while the next set streams in.
 */
export default function ListControls({
  facets = [],
  sortOptions = [],
  rangeFilter = null,
  totalShown = 0,
  totalAvailable = 0,
  rangeStart = 0,
  rangeEnd = 0,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const activeTags = useMemo(() => {
    const raw = searchParams.get('tags');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const sort = searchParams.get('sort') || 'rank';
  const view = searchParams.get('view') || 'list';
  const picksOnly = searchParams.get('picks') === '1';
  const rangeMin = searchParams.get('min') || '';
  const rangeMax = searchParams.get('max') || '';

  const push = useCallback(
    (mutate) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete('page'); // any control change returns to page one
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const toggleTag = (tag) =>
    push((params) => {
      const next = activeTags.includes(tag)
        ? activeTags.filter((t) => t !== tag)
        : [...activeTags, tag];
      if (next.length) params.set('tags', next.join(','));
      else params.delete('tags');
    });

  const hasFilters = activeTags.length > 0 || picksOnly || rangeMin || rangeMax;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: pending ? 0.6 : 1 }}
      aria-busy={pending}
    >
      {/* Row 1 — sort, range, view */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <label className="t49-caption t49-faint" htmlFor="t49-sort">
            Sort
          </label>
          <select
            id="t49-sort"
            className="t49-select"
            value={sort}
            onChange={(e) =>
              push((params) => {
                if (e.target.value === 'rank') params.delete('sort');
                else params.set('sort', e.target.value);
              })
            }
          >
            <option value="rank">Rank</option>
            <option value="score">Top 49 score</option>
            <option value="votes">Most voted</option>
            <option value="name">Name (A–Z)</option>
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>

          {rangeFilter ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <label className="t49-caption t49-faint" htmlFor="t49-min">
                {rangeFilter.label}
              </label>
              <input
                id="t49-min"
                className="t49-input t49-input--rect t49-num"
                inputMode="numeric"
                style={{ width: 90, minHeight: 40, padding: '8px 12px', fontSize: 14 }}
                placeholder={String(rangeFilter.range?.min ?? 'Min')}
                defaultValue={rangeMin}
                onBlur={(e) =>
                  push((params) => {
                    if (e.target.value) params.set('min', e.target.value);
                    else params.delete('min');
                  })
                }
              />
              <span className="t49-caption t49-faint" aria-hidden="true">
                –
              </span>
              <input
                aria-label={`${rangeFilter.label} maximum`}
                className="t49-input t49-input--rect t49-num"
                inputMode="numeric"
                style={{ width: 90, minHeight: 40, padding: '8px 12px', fontSize: 14 }}
                placeholder={String(rangeFilter.range?.max ?? 'Max')}
                defaultValue={rangeMax}
                onBlur={(e) =>
                  push((params) => {
                    if (e.target.value) params.set('max', e.target.value);
                    else params.delete('max');
                  })
                }
              />
            </span>
          ) : null}
        </div>

        <div role="group" aria-label="View" style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'list', label: 'List' },
            { key: 'grid', label: 'Grid' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              className="t49-chip"
              aria-pressed={view === opt.key}
              onClick={() =>
                push((params) => {
                  if (opt.key === 'list') params.delete('view');
                  else params.set('view', opt.key);
                })
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2 — tag facets + editor's picks */}
      {facets.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {facets.map((facet) => (
            <button
              key={facet.value}
              type="button"
              className="t49-chip"
              aria-pressed={activeTags.includes(facet.value)}
              onClick={() => toggleTag(facet.value)}
            >
              {facet.label}
              <span className="t49-num" style={{ opacity: 0.6 }}>
                {facet.count}
              </span>
            </button>
          ))}

          <button
            type="button"
            className="t49-chip"
            aria-pressed={picksOnly}
            onClick={() =>
              push((params) => {
                if (picksOnly) params.delete('picks');
                else params.set('picks', '1');
              })
            }
          >
            Editor’s picks
          </button>

          {hasFilters ? (
            <button
              type="button"
              className="t49-link"
              style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 14, padding: '7px 4px' }}
              onClick={() =>
                push((params) => {
                  ['tags', 'picks', 'min', 'max'].forEach((k) => params.delete(k));
                })
              }
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Live result count — states the page range, not just the filtered total */}
      <p className="t49-caption t49-faint" aria-live="polite">
        {totalShown === 0 ? (
          <>
            No entries match the current filters — all{' '}
            <span className="t49-num">{totalAvailable}</span> are still in the list.
          </>
        ) : (
          <>
            Showing{' '}
            <span className="t49-num">
              {rangeStart}–{rangeEnd}
            </span>{' '}
            of <span className="t49-num">{totalShown}</span>
            {hasFilters ? (
              <>
                {' '}
                matching entries (<span className="t49-num">{totalAvailable}</span> in the full
                list).
              </>
            ) : (
              ' ranked entries.'
            )}
          </>
        )}
      </p>
    </div>
  );
}
