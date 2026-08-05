import Link from 'next/link';
import JsonLd from '@/platform/seo/JsonLd';
import {
  createPageMetadata,
  createCollectionPageJsonLd,
  createBreadcrumbJsonLd,
} from '@/platform/seo/generateMetadata';

import {
  getCategories,
  getGroups,
  getGroupsWithCategories,
  getTrendingLists,
  totals,
} from '../lib/data.js';
import { Band, SectionHead, Breadcrumbs, EmptyState, Stat } from '../components/primitives.jsx';
import { CategoryCard } from '../components/cards.jsx';
import ExploreMore from '../components/ExploreMore.jsx';

// Reads `searchParams` (group filter), so this route resolves per request.
export const dynamic = 'auto';

export async function generateMetadata() {
  return createPageMetadata({
    title: 'All 49 categories',
    description:
      'Browse every Top 49 category across seven groups — entertainment, tech, lifestyle, food and travel, sports, business and knowledge.',
    path: '/top49/categories',
    noindex: true,
    follow: true,
  });
}

export default async function CategoriesPage({ searchParams }) {
  const params = await searchParams;
  const activeGroup = typeof params?.group === 'string' ? params.group : null;

  const [allCategories, groups, groupsWithCategories, trending] = await Promise.all([
    getCategories(),
    getGroups(),
    getGroupsWithCategories(),
    getTrendingLists(6),
  ]);

  const known = groups.some((g) => g.slug === activeGroup);
  const filtered = known
    ? allCategories.filter((c) => c.group === activeGroup)
    : allCategories;
  const activeGroupMeta = known ? groups.find((g) => g.slug === activeGroup) : null;

  return (
    <main>
      <JsonLd
        id="top49-categories-schema"
        data={[
          createCollectionPageJsonLd({
            path: '/top49/categories',
            name: 'Top 49 categories',
            description: 'Every Top 49 category, grouped into seven families.',
          }),
          createBreadcrumbJsonLd([
            { name: 'Top 49', path: '/top49' },
            { name: 'Categories', path: '/top49/categories' },
          ]),
        ].filter(Boolean)}
      />

      <Band as="header" size="tight">
        <Breadcrumbs
          trail={[
            { label: 'Top 49', href: '/top49' },
            { label: 'Categories' },
          ]}
        />
        <h1 className="t49-hero-display" style={{ marginTop: 18, maxWidth: '18ch' }}>
          {activeGroupMeta ? activeGroupMeta.name : 'All 49 categories'}
        </h1>
        <p className="t49-lead" style={{ marginTop: 18, maxWidth: '62ch' }}>
          {activeGroupMeta
            ? activeGroupMeta.description
            : 'Seven groups, forty-nine categories, one scoring system. Every category carries its own lists, criteria and refresh cadence.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 5vw, 48px)', marginTop: 32 }}>
          <Stat value={filtered.length} label={activeGroupMeta ? 'Categories in group' : 'Categories'} />
          <Stat
            value={filtered.reduce((s, c) => s + c.listCount, 0)}
            label="Ranked lists"
          />
          <Stat value={filtered.reduce((s, c) => s + c.itemCount, 0)} label="Entries scored" />
        </div>
      </Band>

      {/* Group filter */}
      <Band tone="parchment" size="tight" aria-label="Filter by group">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link
            href="/top49/categories"
            className="t49-chip"
            aria-current={!known ? 'true' : undefined}
            data-selected={!known ? 'true' : undefined}
          >
            All
            <span className="t49-num" style={{ opacity: 0.6 }}>
              {totals.categories}
            </span>
          </Link>
          {groupsWithCategories.map(({ group, categories }) => (
            <Link
              key={group.slug}
              href={`/top49/categories?group=${group.slug}`}
              className="t49-chip"
              aria-current={activeGroup === group.slug ? 'true' : undefined}
              data-selected={activeGroup === group.slug ? 'true' : undefined}
            >
              {group.name}
              <span className="t49-num" style={{ opacity: 0.6 }}>
                {categories.length}
              </span>
            </Link>
          ))}
        </div>
      </Band>

      {/* Results */}
      {activeGroup && !known ? (
        <Band>
          <EmptyState
            title="No such group"
            body={`“${activeGroup}” is not one of the seven Top 49 groups. Pick one above, or browse the complete index.`}
            actions={
              <Link href="/top49/categories" className="t49-btn t49-btn--primary">
                Show all categories
              </Link>
            }
          />
        </Band>
      ) : known ? (
        <Band>
          <div className="t49-grid t49-grid--4">
            {filtered.map((category, i) => (
              <CategoryCard key={category.slug} category={category} priority={i < 4} />
            ))}
          </div>
        </Band>
      ) : (
        groupsWithCategories.map(({ group, categories }, gi) => (
          <Band
            key={group.slug}
            tone={gi % 2 === 1 ? 'parchment' : 'canvas'}
            aria-labelledby={`group-${group.slug}`}
          >
            <SectionHead
              id={`group-${group.slug}`}
              eyebrow={`${categories.length} categories`}
              title={group.name}
              lead={group.description}
              action={
                <Link
                  href={`/top49/categories?group=${group.slug}`}
                  className="t49-btn t49-btn--ghost t49-btn--sm"
                >
                  Focus this group
                </Link>
              }
            />
            <div className="t49-grid t49-grid--4">
              {categories.map((category, i) => (
                <CategoryCard
                  key={category.slug}
                  category={category}
                  priority={gi === 0 && i < 4}
                />
              ))}
            </div>
          </Band>
        ))
      )}

      <ExploreMore groups={groupsWithCategories} trending={trending} />
    </main>
  );
}
