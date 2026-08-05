import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/platform/seo/JsonLd';
import {
  createPageMetadata,
  createItemListJsonLd,
  createFaqJsonLd,
  createBreadcrumbJsonLd,
} from '@/platform/seo/generateMetadata';

import {
  getCategory,
  getList,
  getPodium,
  getRankedItems,
  getListFacets,
  getRelatedLists,
  getAllRankedItems,
  getGroupsWithCategories,
  getTrendingLists,
  allListParams,
} from '../../lib/data.js';
import {
  Band,
  SectionHead,
  Breadcrumbs,
  Stat,
  EmptyState,
  Faq,
  Meter,
  Score,
} from '../../components/primitives.jsx';
import { PodiumCard, RankRow, ItemCard, ListCard } from '../../components/cards.jsx';
import ListControls from '../../components/ListControls.jsx';
import Pagination from '../../components/Pagination.jsx';
import ExploreMore from '../../components/ExploreMore.jsx';
import { shortDate, relativeDate, compactNumber } from '../../lib/format.js';

// Reads `searchParams` for sort/filter/pagination, so this route is rendered
// on demand. `dynamicParams` is deliberately left open: pinning it to false on
// a request-time route produces NoFallbackError instead of a clean 404, so an
// unknown slug is rejected by notFound() in the body below.
export const dynamic = 'auto';

export function generateStaticParams() {
  return allListParams();
}

export async function generateMetadata({ params }) {
  const { category: categorySlug, list: listSlug } = await params;
  const list = await getList(categorySlug, listSlug);
  if (!list) {
    return createPageMetadata({ title: 'List not found', path: `/top49/${categorySlug}/${listSlug}`, noindex: true });
  }
  return createPageMetadata({
    title: list.title,
    description: `${list.tagline}. ${list.itemCount} entries, each scored out of 100 and refreshed ${list.updateFrequency}.`,
    path: `/top49/${list.categorySlug}/${list.slug}`,
    noindex: true,
    follow: true,
  });
}

const PER_PAGE = 12;

export default async function ListPage({ params, searchParams }) {
  const { category: categorySlug, list: listSlug } = await params;
  const query = (await searchParams) || {};

  const [category, list] = await Promise.all([
    getCategory(categorySlug),
    getList(categorySlug, listSlug),
  ]);
  if (!category || !list) notFound();

  const page = Math.max(1, Number(query.page) || 1);
  const sort = typeof query.sort === 'string' ? query.sort : 'rank';
  const view = query.view === 'grid' ? 'grid' : 'list';
  const tags = typeof query.tags === 'string' ? query.tags.split(',').filter(Boolean) : [];
  const picksOnly = query.picks === '1';

  const rangeFilter = list.filters.find((f) => f.type === 'range') || null;
  const rangeKey = rangeFilter?.key || null;
  const min = query.min !== undefined && query.min !== '' ? Number(query.min) : null;
  const max = query.max !== undefined && query.max !== '' ? Number(query.max) : null;
  const range =
    rangeKey && (min !== null || max !== null)
      ? [
          Number.isFinite(min) ? min : (rangeFilter.range?.min ?? -Infinity),
          Number.isFinite(max) ? max : (rangeFilter.range?.max ?? Infinity),
        ]
      : null;

  const [podium, results, facets, related, allRows, groupsWithCategories, trending] =
    await Promise.all([
      getPodium(list.slug),
      getRankedItems(list.slug, {
        sort,
        tags,
        range,
        rangeKey,
        editorsPick: picksOnly,
        page,
        limit: PER_PAGE,
      }),
      getListFacets(list.slug),
      getRelatedLists(list.relatedListSlugs, list.categorySlug, 3),
      getAllRankedItems(list.slug),
      getGroupsWithCategories(),
      getTrendingLists(6),
    ]);

  const sortableColumns = list.columns.filter((c) => c.sortable !== false && c.key !== 'score');
  const pathname = `/top49/${list.categorySlug}/${list.slug}`;
  const baseParams = {
    sort: sort !== 'rank' ? sort : '',
    view: view !== 'list' ? view : '',
    tags: tags.join(','),
    picks: picksOnly ? '1' : '',
    min: query.min || '',
    max: query.max || '',
  };

  return (
    <main>
      <JsonLd
        id={`top49-list-${list.slug}`}
        data={[
          createItemListJsonLd({
            path: pathname,
            name: list.title,
            items: allRows.map(({ item }) => ({
              name: item.name,
              path: `/top49/item/${item.slug}`,
            })),
          }),
          createFaqJsonLd({ path: pathname, questions: list.faqs }),
          createBreadcrumbJsonLd([
            { name: 'Top 49', path: '/top49' },
            { name: category.name, path: `/top49/${category.slug}` },
            { name: list.shortTitle, path: pathname },
          ]),
        ].filter(Boolean)}
      />

      {/* Hero */}
      <Band as="header" size="tight">
        <Breadcrumbs
          trail={[
            { label: 'Top 49', href: '/top49' },
            { label: category.name, href: `/top49/${category.slug}` },
            { label: list.shortTitle },
          ]}
        />
        <p className="t49-eyebrow" style={{ marginTop: 22 }}>
          {category.name} · refreshed {list.updateFrequency}
        </p>
        <h1 className="t49-hero-display" style={{ marginTop: 14, maxWidth: '20ch' }}>
          {list.title}
        </h1>
        <p className="t49-lead" style={{ marginTop: 16, maxWidth: '58ch' }}>
          {list.tagline}
        </p>
        <p className="t49-body t49-muted" style={{ marginTop: 20, maxWidth: '70ch' }}>
          {list.intro}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(22px, 4vw, 44px)', marginTop: 32 }}>
          <Stat value={list.itemCount} label="Entries ranked" />
          <Stat value={list.totalVotes} label="Reader votes" compact />
          <Stat value={shortDate(list.dataAsOf)} label="Data as of" />
        </div>
      </Band>

      {/* Podium */}
      {podium.length ? (
        <Band tone="parchment" aria-labelledby="t49-podium">
          <SectionHead id="t49-podium" eyebrow="The top three" title="Leading the list" />
          <ol className="t49-podium">
            {podium.map(({ item, ranking }) => (
              <li key={item.slug}>
                <PodiumCard item={item} ranking={ranking} featured={ranking.rank === 1} />
              </li>
            ))}
          </ol>
        </Band>
      ) : null}

      {/* Ranked results */}
      <Band id="rankings" className="t49-anchor" aria-labelledby="t49-rankings-heading">
        <SectionHead
          id="t49-rankings-heading"
          eyebrow="Full ranking"
          title={`All ${list.itemCount} ranked`}
          lead="Filter, re-sort or switch view — every combination is a shareable URL."
        />

        <ListControls
          facets={facets}
          sortOptions={sortableColumns.map((c) => ({ key: c.key, label: c.label }))}
          rangeFilter={rangeFilter}
          totalShown={results.total}
          totalAvailable={results.unfilteredTotal}
          rangeStart={results.total ? (results.page - 1) * results.limit + 1 : 0}
          rangeEnd={Math.min(results.page * results.limit, results.total)}
        />

        <div style={{ marginTop: 26 }}>
          {results.rows.length === 0 ? (
            <EmptyState
              icon="⌕"
              title="Nothing matches those filters"
              body={`All ${results.unfilteredTotal} entries are still here — the current combination of filters just excludes every one of them.`}
              actions={
                <Link href={pathname} className="t49-btn t49-btn--primary">
                  Clear filters
                </Link>
              }
            />
          ) : view === 'grid' ? (
            <div className="t49-grid t49-grid--4">
              {results.rows.map(({ item, ranking }, i) => (
                <ItemCard key={item.slug} item={item} ranking={ranking} priority={i < 4} />
              ))}
            </div>
          ) : (
            <ol className="t49-ranklist">
              {results.rows.map(({ item, ranking }) => (
                <RankRow key={item.slug} item={item} ranking={ranking} columns={list.columns} />
              ))}
            </ol>
          )}
        </div>

        <Pagination
          page={results.page}
          pageCount={results.pageCount}
          baseParams={baseParams}
          pathname={pathname}
        />
      </Band>

      {/* Methodology */}
      <Band tone="dark" aria-labelledby="t49-method">
        <div className="t49-split">
          <div>
            <p className="t49-eyebrow">How this list is scored</p>
            <h2 id="t49-method" className="t49-display" style={{ marginTop: 14 }}>
              Four criteria, weighted before the first entry
            </h2>
            <p className="t49-lead" style={{ marginTop: 16, color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
              {list.methodologyNote ||
                'Scores are recalculated from scratch on every refresh rather than carried forward, so a position can move without the entry itself changing.'}
            </p>

            <dl style={{ marginTop: 34, display: 'grid', gap: 22 }}>
              {list.criteria.map((criterion) => (
                <div key={criterion.name}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <dt className="t49-tagline">{criterion.name}</dt>
                    <span className="t49-body-strong t49-num">
                      {Math.round(criterion.weight * 100)}%
                    </span>
                  </div>
                  <Meter
                    value={criterion.weight * 100}
                    label={`${criterion.name} carries ${Math.round(criterion.weight * 100)} percent of the score`}
                  />
                  <dd className="t49-caption" style={{ margin: '10px 0 0', color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
                    {criterion.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="t49-split__aside">
            <div
              style={{
                border: '1px solid var(--anslation-ds-footer-border)',
                borderRadius: 'var(--t49-r-lg)',
                padding: 'var(--t49-lg)',
              }}
            >
              <p className="t49-caption-strong">List record</p>
              <dl style={{ margin: '14px 0 0', display: 'grid', gap: 12 }}>
                {[
                  ['Entries', String(list.itemCount)],
                  ['Data as of', shortDate(list.dataAsOf)],
                  ['Refreshed', list.updateFrequency],
                  ['Last change', relativeDate(list.updatedAt)],
                  ['Reader votes', compactNumber(list.totalVotes)],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <dt className="t49-caption" style={{ color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
                      {label}
                    </dt>
                    <dd className="t49-caption-strong t49-num" style={{ margin: 0, textTransform: 'capitalize' }}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/top49/how-we-rank"
                className="t49-btn t49-btn--ghost t49-btn--sm t49-btn--block"
                style={{ marginTop: 18 }}
              >
                Full methodology
              </Link>
            </div>
          </aside>
        </div>
      </Band>

      {/* FAQ */}
      {list.faqs.length ? (
        <Band wrap="prose" aria-labelledby="t49-faq">
          <p className="t49-eyebrow">Questions</p>
          <h2 id="t49-faq" className="t49-display" style={{ marginTop: 14, marginBottom: 24 }}>
            About this ranking
          </h2>
          <Faq items={list.faqs} />
        </Band>
      ) : null}

      {/* Related */}
      {related.length ? (
        <Band tone="parchment" aria-labelledby="t49-related">
          <SectionHead
            id="t49-related"
            eyebrow="Keep going"
            title="Related rankings"
            action={
              <Link href={`/top49/${category.slug}`} className="t49-btn t49-btn--ghost t49-btn--sm">
                All {category.name} lists
              </Link>
            }
          />
          <div className="t49-grid t49-grid--3">
            {related.map((l) => (
              <ListCard key={l.slug} list={l} />
            ))}
          </div>
        </Band>
      ) : null}

      <ExploreMore groups={groupsWithCategories} trending={trending} />
    </main>
  );
}
