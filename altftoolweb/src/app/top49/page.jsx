import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/platform/seo/JsonLd';
import {
  createPageMetadata,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from '@/platform/seo/generateMetadata';

import {
  getCategories,
  getGroupsWithCategories,
  getFeaturedLists,
  getTrendingLists,
  getPodium,
  getListBySlug,
  totals,
} from './lib/data.js';
import { Band, SectionHead, Stat } from './components/primitives.jsx';
import { CategoryCard, CategoryTile, ListCard, ItemCard } from './components/cards.jsx';
import T49Image from './components/T49Image.jsx';
import SearchForm from './components/SearchForm.jsx';
import ExploreMore from './components/ExploreMore.jsx';
import TypewriterHeading from './components/TypewriterHeading.jsx';
import ExpandableCategoryGrid from './components/ExpandableCategoryGrid.jsx';
import { sizes } from './lib/images.js';

import top49Hero from '../../../public/images/top49-hero.webp';

export const dynamic = 'force-static';

export async function generateMetadata() {
  return createPageMetadata({
    title: 'Top 49 — the best of everything, ranked',
    description: `${totals.categories} categories, ${totals.lists} curated lists, ${totals.items.toLocaleString('en-US')} ranked entries. Every pick scored out of 100 against criteria published on every list.`,
    path: '/top49',
    noindex: true,
    follow: true,
  });
}

/* ── 1. Hero ─────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <header className="t49-hero">
      <div className="t49-hero__bg">
        <Image
          src={top49Hero}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>
      <span className="t49-hero__scrim" aria-hidden="true" />
      <span className="t49-hero__glow-orb t49-hero__glow-orb--1" aria-hidden="true" />
      <span className="t49-hero__glow-orb t49-hero__glow-orb--2" aria-hidden="true" />
      <span className="t49-hero__glow-center" aria-hidden="true" />

      <div className="t49-wrap">
        <div className="t49-hero__content">
          <p className="t49-eyebrow">49 categories · one scoring system</p>

          <TypewriterHeading
            as="h1"
            prefix="The best of"
            phrases={[
              "everything, ranked.",
              "top products, ranked.",
              "tools & apps, ranked.",
              "tech & gear, ranked.",
            ]}
            style={{ marginTop: 18 }}
            ariaLabel="The best of everything, ranked."
          />

          <p className="t49-lead" style={{ marginTop: 22, maxWidth: '52ch' }}>
            Every entry is scored out of 100 against criteria we publish on the list itself. No
            sponsored placements, no hidden weighting — each displayed position follows the published
            criteria in this editorial preview.
          </p>

          <div style={{ marginTop: 32 }}>
            <SearchForm cta="Search rankings" />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(22px, 5vw, 52px)',
              marginTop: 40,
            }}
          >
            <Stat value={totals.categories} label="Categories" />
            <Stat value={totals.lists} label="Ranked lists" />
            <Stat value={totals.items} label="Entries scored" />
            <Stat value={totals.rankings} label="Ranking records" compact />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── 2. Trending rail ────────────────────────────────────────────────────── */

async function Trending() {
  const [lists, categories] = await Promise.all([getTrendingLists(10), getCategories()]);
  const nameOf = (slug) => categories.find((c) => c.slug === slug)?.name;

  return (
    <Band tone="parchment" aria-labelledby="t49-trending-heading">
      <SectionHead
        id="t49-trending-heading"
        eyebrow="Catalogue selection"
        title="Lists selected from across Top 49"
        lead="A stable cross-category selection from the curated preview catalogue."
        action={
          <Link href="/top49/categories" className="t49-btn t49-btn--ghost t49-btn--sm">
            Browse all categories
          </Link>
        }
      />
      <div className="t49-rail">
        {lists.map((list, i) => (
          <ListCard
            key={list.slug}
            list={list}
            categoryName={nameOf(list.categorySlug)}
            variant="rail"
            priority={i < 2}
          />
        ))}
      </div>
    </Band>
  );
}

/* ── 3. Scoring explainer (dark band) ────────────────────────────────────── */

function Scoring() {
  const criteria = [
    {
      weight: '30%',
      name: 'Expert assessment',
      body: 'Specialist review consensus, weighted by depth of testing rather than publication size.',
    },
    {
      weight: '25%',
      name: 'Audience score',
      body: 'An illustrative audience-response field, weighted alongside the other published criteria.',
    },
    {
      weight: '25%',
      name: 'Lasting impact',
      body: 'What the entry changed for everything that came after it. The slowest input to move.',
    },
    {
      weight: '20%',
      name: 'Holds up over time',
      body: 'Whether it survives repeat exposure, long ownership or a second season.',
    },
  ];

  return (
    <Band tone="dark" aria-labelledby="t49-scoring-heading">
      <div style={{ maxWidth: 760 }}>
        <p className="t49-eyebrow">The Top 49 score</p>
        <h2 id="t49-scoring-heading" className="t49-display" style={{ marginTop: 14 }}>
          One number, four inputs, published weights
        </h2>
        <p className="t49-lead" style={{ marginTop: 18, color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
          Each list states its own criteria and weighting before the first entry. Categories differ
          — a lens is not judged like a novel — but the arithmetic is always visible.
        </p>
      </div>

      <div className="t49-grid t49-grid--4" style={{ marginTop: 44 }}>
        {criteria.map((c) => (
          <div key={c.name}>
            <span className="t49-numeral" style={{ fontSize: 'clamp(40px, 2rem + 3vw, 64px)' }}>
              {c.weight}
            </span>
            <h3 className="t49-tagline" style={{ marginTop: 14 }}>
              {c.name}
            </h3>
            <p className="t49-caption" style={{ marginTop: 8, color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
              {c.body}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 44 }}>
        <Link href="/top49/how-we-rank" className="t49-btn t49-btn--primary">
          Read the full methodology
        </Link>
        <Link href="/top49/compare" className="t49-btn t49-btn--ghost">
          Compare entries
        </Link>
      </div>
    </Band>
  );
}

/* ── 4. Live ranking preview ─────────────────────────────────────────────── */

async function Preview() {
  const featured = await getFeaturedLists(4);
  const target = featured[1] || featured[0];
  if (!target) return null;

  const list = await getListBySlug(target.slug);
  const podium = await getPodium(target.slug);
  const { getAllRankedItems } = await import('./lib/data.js');
  const rows = (await getAllRankedItems(target.slug)).slice(0, 8);

  return (
    <Band aria-labelledby="t49-preview-heading">
      <SectionHead
        id="t49-preview-heading"
        eyebrow="Inside a list"
        title={list.title}
        lead={list.tagline}
        action={
          <Link
            href={`/top49/${list.categorySlug}/${list.slug}`}
            className="t49-btn t49-btn--primary t49-btn--sm"
          >
            Open the full list
          </Link>
        }
      />

      <div className="t49-grid t49-grid--4">
        {rows.map(({ item, ranking }, i) => (
          <ItemCard key={item.slug} item={item} ranking={ranking} priority={i < 4} />
        ))}
      </div>

      {podium.length ? (
        <p className="t49-caption t49-faint" style={{ marginTop: 22 }}>
          Scored on {list.criteria.map((c) => c.name.toLowerCase()).join(', ')} — refreshed{' '}
          {list.updateFrequency}.
        </p>
      ) : null}
    </Band>
  );
}

/* ── 5. Groups ───────────────────────────────────────────────────────────── */

async function Groups() {
  const groups = await getGroupsWithCategories();

  return (
    <Band tone="parchment" aria-labelledby="t49-groups-heading">
      <SectionHead
        id="t49-groups-heading"
        eyebrow="Seven groups"
        title="Start where you already have an opinion"
        lead="Every category belongs to exactly one group, so nothing is double-counted and nothing is missing."
      />
      <div className="t49-grid t49-grid--4">
        {groups.map(({ group, categories }, i) => (
          <Link key={group.slug} href={`/top49/categories?group=${group.slug}`} className="t49-card">
            <T49Image
              id={group.image}
              name={group.name}
              alt=""
              ratio="16-10"
              sizes={sizes.card4}
              width={640}
              priority={i < 2}
            >
              <span className="t49-media__scrim" aria-hidden="true" />
              <div className="t49-media__overlay">
                <h3 className="t49-tagline" style={{ color: 'var(--on-media)' }}>
                  {group.name}
                </h3>
              </div>
            </T49Image>
            <div className="t49-card__body t49-card__body--tight">
              <p className="t49-caption t49-muted t49-clamp-3">{group.blurb}</p>
            </div>
            <div className="t49-card__foot">
              <span className="t49-fine t49-faint">{categories.length} categories</span>
              <span className="t49-fine t49-faint t49-num">
                {categories.reduce((s, c) => s + c.listCount, 0)} lists
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Band>
  );
}

/* ── 6. All 49 categories ────────────────────────────────────────────────── */

async function AllCategories() {
  const categories = await getCategories();
  const trending = categories.filter((c) => c.isTrending).slice(0, 6);

  return (
    <Band aria-labelledby="t49-all-heading">
      <SectionHead
        id="t49-all-heading"
        eyebrow="The full index"
        title="All 49 categories"
        lead="Each one carries its own lists, its own criteria and its own update cadence."
        action={
          <Link href="/top49/categories" className="t49-btn t49-btn--ghost t49-btn--sm">
            Category browser
          </Link>
        }
      />

      <div className="t49-grid t49-grid--3" style={{ marginBottom: 32 }}>
        {trending.slice(0, 3).map((category, i) => (
          <CategoryCard key={category.slug} category={category} priority={i === 0} />
        ))}
      </div>

      <ExpandableCategoryGrid categories={categories} />
    </Band>
  );
}

/* ── 7. Closing call to action ───────────────────────────────────────────── */

function Closing() {
  return (
    <Band tone="primary" aria-labelledby="t49-cta-heading">
      <div style={{ maxWidth: 760 }}>
        <TypewriterHeading
          as="h2"
          id="t49-cta-heading"
          phrases={[
            "Settle it with a score.",
            "Compare side by side.",
            "Find the clear winner.",
            "Zero sponsored bias.",
          ]}
          style={{ fontSize: 'clamp(34px, 1.4rem + 4.4vw, 72px)' }}
          ariaLabel="Settle it with a score."
        />
        <p
          className="t49-lead"
          style={{
            marginTop: 20,
            color: 'color-mix(in srgb, var(--primary-foreground) 88%, transparent)',
          }}
        >
          Put up to four entries side by side and compare them on the attributes that actually
          differ — across any category, from any list.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
          <Link href="/top49/compare" className="t49-btn t49-btn--primary t49-btn--lg">
            Start comparing
          </Link>
          <Link href="/top49/categories" className="t49-btn t49-btn--ghost t49-btn--lg">
            Browse categories
          </Link>
        </div>
      </div>
    </Band>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default async function Top49Page() {
  const [groups, trending, featured] = await Promise.all([
    getGroupsWithCategories(),
    getTrendingLists(6),
    getFeaturedLists(12),
  ]);

  return (
    <main>
      <JsonLd
        id="top49-home-schema"
        data={[
          createCollectionPageJsonLd({
            path: '/top49',
            name: 'Top 49 — the best of everything, ranked',
            description:
              '49 categories of curated rankings, every entry scored out of 100 against published criteria.',
          }),
          createItemListJsonLd({
            path: '/top49',
            name: 'Featured Top 49 lists',
            items: featured.map((l) => ({
              name: l.title,
              path: `/top49/${l.categorySlug}/${l.slug}`,
            })),
          }),
        ].filter(Boolean)}
      />

      <Hero />
      <Trending />
      <Scoring />
      <Preview />
      <Groups />
      <AllCategories />
      <Closing />
      <ExploreMore groups={groups} trending={trending} />
    </main>
  );
}
