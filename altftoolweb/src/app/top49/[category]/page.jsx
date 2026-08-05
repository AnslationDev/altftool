import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/platform/seo/JsonLd';
import {
  createPageMetadata,
  createCollectionPageJsonLd,
  createBreadcrumbJsonLd,
} from '@/platform/seo/generateMetadata';

import {
  getCategory,
  getListsByCategory,
  getCategoryGroup,
  getGroupWithCategories,
  getPodium,
  getGroupsWithCategories,
  getTrendingLists,
  allCategoryParams,
} from '../lib/data.js';
import {
  Band,
  SectionHead,
  Breadcrumbs,
  Stat,
  EmptyState,
  RankBadge,
  Score,
} from '../components/primitives.jsx';
import { ListCard, CategoryCard } from '../components/cards.jsx';
import T49Image from '../components/T49Image.jsx';
import ExploreMore from '../components/ExploreMore.jsx';
import { sizes } from '../lib/images.js';
import { compactNumber, shortDate } from '../lib/format.js';

// All 49 categories are prerendered. `dynamicParams` stays open so an unknown
// slug enters this segment and is rejected by notFound() below — that routes
// the visitor to the Top 49 not-found screen (which suggests real lists)
// instead of bouncing them to the generic site-wide 404.
export const dynamicParams = true;

export function generateStaticParams() {
  return allCategoryParams();
}

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    return createPageMetadata({
      title: 'Category not found',
      path: `/top49/${slug}`,
      noindex: true,
    });
  }
  return createPageMetadata({
    title: `${category.name} rankings`,
    description: `${category.tagline}. ${category.listCount} ranked lists and ${category.itemCount} scored entries in the Top 49 ${category.name} category.`,
    path: `/top49/${category.slug}`,
    noindex: true,
    follow: true,
  });
}

export default async function CategoryPage({ params }) {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const [lists, group, groupsWithCategories, trending] = await Promise.all([
    getListsByCategory(slug),
    getCategoryGroup(slug),
    getGroupsWithCategories(),
    getTrendingLists(6),
  ]);

  const siblings = group ? await getGroupWithCategories(group.slug) : null;
  const primary = lists[0];
  const podium = primary ? await getPodium(primary.slug) : [];
  const lastUpdated = lists
    .map((l) => l.dataAsOf)
    .sort()
    .reverse()[0];

  return (
    <main>
      <JsonLd
        id={`top49-category-${category.slug}`}
        data={[
          createCollectionPageJsonLd({
            path: `/top49/${category.slug}`,
            name: `Top 49 ${category.name}`,
            description: category.description,
          }),
          createBreadcrumbJsonLd([
            { name: 'Top 49', path: '/top49' },
            { name: 'Categories', path: '/top49/categories' },
            { name: category.name, path: `/top49/${category.slug}` },
          ]),
        ].filter(Boolean)}
      />

      {/* Hero */}
      <Band as="header" size="tight" wrap="none" className="t49-band--flush">
        <div className="t49-wrap" style={{ paddingTop: 'clamp(28px, 4vw, 48px)' }}>
          <Breadcrumbs
            trail={[
              { label: 'Top 49', href: '/top49' },
              { label: 'Categories', href: '/top49/categories' },
              { label: category.name },
            ]}
          />
        </div>

        <div className="t49-wrap" style={{ paddingBlock: 'clamp(28px, 4vw, 44px)' }}>
          <div className="t49-hero-grid">
            <div>
              {group ? (
                <Link href={`/top49/categories?group=${group.slug}`} className="t49-eyebrow" style={{ textDecoration: 'none' }}>
                  {group.name}
                </Link>
              ) : null}
              <h1 className="t49-hero-display" style={{ marginTop: 16 }}>
                {category.name}
              </h1>
              <p className="t49-lead" style={{ marginTop: 16, maxWidth: '52ch' }}>
                {category.tagline}
              </p>
              <p className="t49-body t49-muted" style={{ marginTop: 18, maxWidth: '62ch' }}>
                {category.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(22px, 4vw, 44px)', marginTop: 30 }}>
                <Stat value={category.listCount} label={category.listCount === 1 ? 'Ranked list' : 'Ranked lists'} />
                <Stat value={category.itemCount} label="Entries scored" />
                <Stat value={category.totalVotes} label="Reader votes" compact />
              </div>

              {primary ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
                  <Link
                    href={`/top49/${category.slug}/${primary.slug}`}
                    className="t49-btn t49-btn--primary"
                  >
                    Open {primary.shortTitle}
                  </Link>
                  <Link href="/top49/compare" className="t49-btn t49-btn--ghost">
                    Compare entries
                  </Link>
                </div>
              ) : null}
            </div>

            <T49Image
              id={category.image}
              name={category.name}
              alt=""
              ratio="4-3"
              sizes={sizes.band}
              width={1000}
              rounded
              priority
            />
          </div>
        </div>
      </Band>

      {/* Podium of the primary list */}
      {podium.length ? (
        <Band tone="dark" aria-labelledby="t49-cat-podium">
          <SectionHead
            id="t49-cat-podium"
            eyebrow="Top of the category"
            title={primary.title}
            lead={primary.tagline}
            action={
              <Link
                href={`/top49/${category.slug}/${primary.slug}`}
                className="t49-btn t49-btn--primary t49-btn--sm"
              >
                All {primary.itemCount} ranked
              </Link>
            }
          />
          <ol className="t49-grid t49-grid--3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {podium.map(({ item, ranking }) => (
              <li key={item.slug}>
                <Link
                  href={`/top49/item/${item.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <T49Image
                    id={item.image}
                    name={item.name}
                    alt={item.imageAlt || ''}
                    ratio="16-9"
                    sizes={sizes.card3}
                    width={720}
                    rounded
                    shadow
                  >
                    <span className="t49-media__corner t49-media__corner--tl">
                      <RankBadge rank={ranking.rank} />
                    </span>
                  </T49Image>
                  <h3 className="t49-tagline" style={{ marginTop: 16 }}>
                    {item.name}
                  </h3>
                  {item.subtitle ? (
                    <p className="t49-fine" style={{ marginTop: 4, color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
                      {item.subtitle}
                    </p>
                  ) : null}
                  <p
                    className="t49-caption t49-clamp-3"
                    style={{ marginTop: 10, color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}
                  >
                    {item.summary}
                  </p>
                  <div style={{ marginTop: 12 }}>
                    <Score value={ranking.score} />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </Band>
      ) : null}

      {/* All lists in this category */}
      <Band aria-labelledby="t49-cat-lists">
        <SectionHead
          id="t49-cat-lists"
          eyebrow={`${lists.length} ${lists.length === 1 ? 'list' : 'lists'}`}
          title={`Every ${category.name} ranking`}
          lead={
            lastUpdated
              ? `Each list states its own criteria and cadence. Most recent data refresh: ${shortDate(lastUpdated)}.`
              : undefined
          }
        />
        {lists.length ? (
          <div className="t49-grid t49-grid--3">
            {lists.map((list, i) => (
              <ListCard key={list.slug} list={list} priority={i < 3} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No lists published yet"
            body={`${category.name} is in the index but its rankings have not been published. Trending lists elsewhere are ready now.`}
            actions={
              <Link href="/top49/categories" className="t49-btn t49-btn--primary">
                Browse other categories
              </Link>
            }
          />
        )}
      </Band>

      {/* Sibling categories */}
      {siblings && siblings.categories.length > 1 ? (
        <Band tone="parchment" aria-labelledby="t49-cat-siblings">
          <SectionHead
            id="t49-cat-siblings"
            eyebrow={siblings.group.name}
            title="Related categories"
            lead={siblings.group.blurb}
          />
          <div className="t49-grid t49-grid--4">
            {siblings.categories
              .filter((c) => c.slug !== category.slug)
              .slice(0, 8)
              .map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
          </div>
        </Band>
      ) : null}

      <ExploreMore groups={groupsWithCategories} trending={trending} />
    </main>
  );
}
