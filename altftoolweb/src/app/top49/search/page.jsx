import Link from 'next/link';
import JsonLd from '@/platform/seo/JsonLd';
import { createPageMetadata, createBreadcrumbJsonLd } from '@/platform/seo/generateMetadata';

import {
  searchAll,
  getSearchSuggestions,
  getCategories,
  getGroupsWithCategories,
  getTrendingLists,
  totals,
} from '../lib/data.js';
import { Band, SectionHead, Breadcrumbs, EmptyState } from '../components/primitives.jsx';
import { CategoryCard, ListCard, ItemCard } from '../components/cards.jsx';
import SearchForm from '../components/SearchForm.jsx';
import ExploreMore from '../components/ExploreMore.jsx';

export const dynamic = 'auto';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const q = typeof params?.q === 'string' ? params.q.trim() : '';
  return createPageMetadata({
    title: q ? `Search: ${q}` : 'Search Top 49',
    description: q
      ? `Top 49 results for “${q}” across categories, ranked lists and scored entries.`
      : `Search ${totals.items.toLocaleString()} scored entries across ${totals.lists} ranked lists and ${totals.categories} categories.`,
    path: '/top49/search',
    noindex: true,
    follow: true,
  });
}

export default async function SearchPage({ searchParams }) {
  const params = (await searchParams) || {};
  const q = typeof params.q === 'string' ? params.q.trim() : '';

  const [results, suggestions, categories, groupsWithCategories, trending] = await Promise.all([
    searchAll(q),
    getSearchSuggestions(8),
    getCategories(),
    getGroupsWithCategories(),
    getTrendingLists(6),
  ]);

  const nameOf = (slug) => categories.find((c) => c.slug === slug)?.name;
  const hasResults = results.total > 0;

  return (
    <main>
      <JsonLd
        id="top49-search-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: 'Top 49', path: '/top49' },
            { name: 'Search', path: '/top49/search' },
          ]),
        ].filter(Boolean)}
      />

      <Band as="header" size="tight">
        <Breadcrumbs trail={[{ label: 'Top 49', href: '/top49' }, { label: 'Search' }]} />
        <h1 className="t49-hero-display" style={{ marginTop: 18, maxWidth: '16ch' }}>
          {q ? 'Search results' : 'Search Top 49'}
        </h1>
        <p className="t49-lead" style={{ marginTop: 16, maxWidth: '58ch' }}>
          {q ? (
            <>
              <strong className="t49-num">{results.total}</strong>{' '}
              {results.total === 1 ? 'match' : 'matches'} for “{q}” across categories, lists and
              ranked entries.
            </>
          ) : (
            <>
              One field across everything — {totals.items.toLocaleString()} scored entries,{' '}
              {totals.lists} ranked lists and all {totals.categories} categories.
            </>
          )}
        </p>

        <div style={{ marginTop: 26 }}>
          <SearchForm defaultValue={q} autoFocus={!q} />
        </div>
      </Band>

      {!q ? (
        <Band tone="parchment" aria-labelledby="t49-search-popular">
          <SectionHead
            id="t49-search-popular"
            eyebrow="Start here"
            title="Most-read lists"
            lead="Or jump straight into a category — every one is searchable from the same field."
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 34 }}>
            {suggestions.map((s) => (
              <Link key={s.href} href={s.href} className="t49-chip">
                {s.label}
              </Link>
            ))}
          </div>
          <div className="t49-grid t49-grid--4">
            {categories
              .filter((c) => c.isTrending)
              .slice(0, 8)
              .map((c, i) => (
                <CategoryCard key={c.slug} category={c} priority={i < 4} />
              ))}
          </div>
        </Band>
      ) : !hasResults ? (
        <Band>
          <EmptyState
            icon="⌕"
            title={`Nothing matches “${q}”`}
            body="Try a shorter phrase, a category name, or the name of a specific entry. Search covers titles, taglines, summaries and tags."
            actions={
              <>
                <Link href="/top49/search" className="t49-btn t49-btn--primary">
                  Clear search
                </Link>
                <Link href="/top49/categories" className="t49-btn t49-btn--ghost">
                  Browse all categories
                </Link>
              </>
            }
          />
          <div style={{ marginTop: 40 }}>
            <p className="t49-caption-strong" style={{ marginBottom: 12 }}>
              Popular right now
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {suggestions.map((s) => (
                <Link key={s.href} href={s.href} className="t49-chip">
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </Band>
      ) : (
        <>
          {results.items.length ? (
            <Band aria-labelledby="t49-search-entries">
              <SectionHead
                id="t49-search-entries"
                eyebrow={`${results.items.length} ${results.items.length === 1 ? 'entry' : 'entries'}`}
                title="Ranked entries"
              />
              <div className="t49-grid t49-grid--4">
                {results.items
                  .filter((r) => r.ranking)
                  .map(({ item, ranking }, i) => (
                    <ItemCard key={item.slug} item={item} ranking={ranking} priority={i < 4} />
                  ))}
              </div>
            </Band>
          ) : null}

          {results.lists.length ? (
            <Band tone="parchment" aria-labelledby="t49-search-lists">
              <SectionHead
                id="t49-search-lists"
                eyebrow={`${results.lists.length} ${results.lists.length === 1 ? 'list' : 'lists'}`}
                title="Ranked lists"
              />
              <div className="t49-grid t49-grid--3">
                {results.lists.map((list) => (
                  <ListCard key={list.slug} list={list} categoryName={nameOf(list.categorySlug)} />
                ))}
              </div>
            </Band>
          ) : null}

          {results.categories.length ? (
            <Band aria-labelledby="t49-search-categories">
              <SectionHead
                id="t49-search-categories"
                eyebrow={`${results.categories.length} ${results.categories.length === 1 ? 'category' : 'categories'}`}
                title="Categories"
              />
              <div className="t49-grid t49-grid--4">
                {results.categories.map((c) => (
                  <CategoryCard key={c.slug} category={c} />
                ))}
              </div>
            </Band>
          ) : null}
        </>
      )}

      <ExploreMore groups={groupsWithCategories} trending={trending} />
    </main>
  );
}
