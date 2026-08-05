import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/platform/seo/JsonLd';
import {
  createPageMetadata,
  createBreadcrumbJsonLd,
} from '@/platform/seo/generateMetadata';

import {
  getItem,
  getItemRankings,
  getItemNeighbours,
  getSimilarItems,
  getCategory,
  getGroupsWithCategories,
  getTrendingLists,
  getAllLists,
} from '../../lib/data.js';
import {
  Band,
  SectionHead,
  Breadcrumbs,
  RankBadge,
  Score,
  Meter,
  TrendBadge,
  Stat,
} from '../../components/primitives.jsx';
import { ItemCard } from '../../components/cards.jsx';
import T49Image from '../../components/T49Image.jsx';
import ExploreMore from '../../components/ExploreMore.jsx';
import { sizes } from '../../lib/images.js';
import { formatValue, groupedNumber } from '../../lib/format.js';

// Left on the default rendering mode deliberately: `force-static` would make
// notFound() answer 200 for an unknown slug. Params returned below are still
// prerendered; the long tail renders on first request, then caches.
export const dynamicParams = true;

/**
 * Prerender the podium of every list at build time; the long tail renders on
 * first request and is then cached. Prerendering all 1,600 entries would blow
 * the deployment's build-output budget for very little benefit.
 */
export async function generateStaticParams() {
  const { getPodium } = await import('../../lib/data.js');
  const lists = await getAllLists();
  const rows = await Promise.all(lists.map((l) => getPodium(l.slug)));
  const slugs = new Set();
  rows.flat().forEach(({ item }) => slugs.add(item.slug));
  return [...slugs].map((item) => ({ item }));
}

export async function generateMetadata({ params }) {
  const { item: slug } = await params;
  const item = await getItem(slug);
  if (!item) {
    return createPageMetadata({ title: 'Entry not found', path: `/top49/item/${slug}`, noindex: true });
  }
  const rankings = await getItemRankings(slug);
  const best = rankings[0];
  return createPageMetadata({
    title: item.name,
    description: best
      ? `Ranked #${best.ranking.rank} in ${best.list.title} with a Top 49 score of ${best.ranking.score}. ${item.summary}`
      : item.summary,
    path: `/top49/item/${item.slug}`,
    type: 'article',
    noindex: true,
    follow: true,
  });
}

export default async function ItemPage({ params }) {
  const { item: slug } = await params;
  const item = await getItem(slug);
  if (!item) notFound();

  const [rankings, category, similar, groupsWithCategories, trending] = await Promise.all([
    getItemRankings(slug),
    getCategory(item.categorySlug),
    getSimilarItems(slug, 8),
    getGroupsWithCategories(),
    getTrendingLists(6),
  ]);

  const best = rankings[0];
  const neighbours = best
    ? await getItemNeighbours(best.ranking.listSlug, best.ranking.rank)
    : { prev: null, next: null };

  const breakdown = best ? Object.entries(best.ranking.scoreBreakdown) : [];

  return (
    <main>
      <JsonLd
        id={`top49-item-${item.slug}`}
        data={[
          createBreadcrumbJsonLd(
            [
              { name: 'Top 49', path: '/top49' },
              category ? { name: category.name, path: `/top49/${category.slug}` } : null,
              best ? { name: best.list.shortTitle, path: `/top49/${best.list.categorySlug}/${best.list.slug}` } : null,
              { name: item.name, path: `/top49/item/${item.slug}` },
            ].filter(Boolean),
          ),
        ].filter(Boolean)}
      />

      {/* Hero */}
      <Band as="header" size="tight">
        <Breadcrumbs
          trail={[
            { label: 'Top 49', href: '/top49' },
            category ? { label: category.name, href: `/top49/${category.slug}` } : null,
            best
              ? { label: best.list.shortTitle, href: `/top49/${best.list.categorySlug}/${best.list.slug}` }
              : null,
            { label: item.name },
          ].filter(Boolean)}
        />

        <div className="t49-hero-grid" style={{ marginTop: 26 }}>
          <div>
            {best ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <RankBadge rank={best.ranking.rank} size="lg" />
                <div>
                  <p className="t49-eyebrow">
                    #{best.ranking.rank} in {best.list.shortTitle}
                  </p>
                  <p className="t49-fine t49-faint" style={{ marginTop: 4 }}>
                    of {best.list.itemCount} ranked entries
                  </p>
                </div>
                <TrendBadge rank={best.ranking.rank} previousRank={best.ranking.previousRank} />
                {best.ranking.isEditorsPick ? (
                  <span className="t49-badge t49-badge--primary">Editor’s pick</span>
                ) : null}
              </div>
            ) : null}

            <h1 className="t49-hero-display" style={{ marginTop: 20 }}>
              {item.name}
            </h1>
            {item.subtitle ? (
              <p className="t49-lead" style={{ marginTop: 12 }}>
                {item.subtitle}
              </p>
            ) : null}
            <p className="t49-body t49-muted" style={{ marginTop: 20, maxWidth: '66ch' }}>
              {item.description}
            </p>

            {item.tags.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
                {item.tags.map((tag) => (
                  <span key={tag} className="t49-chip t49-chip--static">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <Link
                href={`/top49/compare?items=${item.slug}`}
                className="t49-btn t49-btn--primary"
              >
                Compare this entry
              </Link>
              {best ? (
                <Link
                  href={`/top49/${best.list.categorySlug}/${best.list.slug}#rankings`}
                  className="t49-btn t49-btn--ghost"
                >
                  See the full list
                </Link>
              ) : null}
            </div>
          </div>

          <T49Image
            id={item.image}
            name={item.name}
            alt={item.imageAlt || ''}
            ratio="4-3"
            sizes={sizes.band}
            width={1000}
            rounded
            shadow
            priority
          />
        </div>
      </Band>

      {/* Score breakdown */}
      {best ? (
        <Band tone="dark" aria-labelledby="t49-item-score">
          <div className="t49-split">
            <div>
              <p className="t49-eyebrow">Score breakdown</p>
              <h2 id="t49-item-score" className="t49-display" style={{ marginTop: 14 }}>
                How {item.name} earned {best.ranking.score}
              </h2>
              <p className="t49-lead" style={{ marginTop: 16, color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
                Each criterion is scored independently, then combined using the weights published
                on {best.list.shortTitle}.
              </p>

              <dl style={{ marginTop: 32, display: 'grid', gap: 20 }}>
                {breakdown.map(([name, value]) => {
                  const weight = best.list.criteria.find((c) => c.name === name)?.weight;
                  return (
                    <div key={name}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          gap: 16,
                        }}
                      >
                        <dt className="t49-body-strong">
                          {name}
                          {weight ? (
                            <span className="t49-fine" style={{ color: 'color-mix(in srgb, var(--on-media) 68%, transparent)', marginLeft: 8 }}>
                              weight {Math.round(weight * 100)}%
                            </span>
                          ) : null}
                        </dt>
                        <dd className="t49-body-strong t49-num" style={{ margin: 0 }}>
                          {Number(value).toFixed(1)}
                        </dd>
                      </div>
                      <Meter value={value} label={`${name}: ${Number(value).toFixed(1)} out of 100`} />
                    </div>
                  );
                })}
              </dl>
            </div>

            <aside className="t49-split__aside">
              <div
                style={{
                  border: '1px solid var(--anslation-ds-footer-border)',
                  borderRadius: 'var(--t49-r-lg)',
                  padding: 'var(--t49-lg)',
                  textAlign: 'center',
                }}
              >
                <p className="t49-caption" style={{ color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
                  Top 49 score
                </p>
                <p className="t49-numeral" style={{ marginTop: 8, fontSize: 'clamp(52px, 3rem + 3vw, 84px)' }}>
                  {best.ranking.score.toFixed(1)}
                </p>
                <p className="t49-fine" style={{ color: 'color-mix(in srgb, var(--on-media) 68%, transparent)' }}>
                  out of 100
                </p>
                <hr
                  className="t49-divide"
                  style={{ borderColor: 'var(--anslation-ds-footer-border)', margin: '18px 0' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: 12 }}>
                  <div>
                    <p className="t49-body-strong t49-num">{groupedNumber(best.ranking.votes)}</p>
                    <p className="t49-fine" style={{ color: 'color-mix(in srgb, var(--on-media) 68%, transparent)' }}>
                      votes
                    </p>
                  </div>
                  <div>
                    <p className="t49-body-strong t49-num">#{best.ranking.rank}</p>
                    <p className="t49-fine" style={{ color: 'color-mix(in srgb, var(--on-media) 68%, transparent)' }}>
                      position
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {best.ranking.editorialNote ? (
            <blockquote
              style={{
                margin: '40px 0 0',
                paddingLeft: 20,
                borderLeft: '3px solid var(--primary)',
                maxWidth: '68ch',
              }}
            >
              <p className="t49-lead" style={{ color: 'var(--on-media)' }}>
                “{best.ranking.editorialNote}”
              </p>
              <cite className="t49-fine" style={{ color: 'color-mix(in srgb, var(--on-media) 68%, transparent)', fontStyle: 'normal' }}>
                — Top 49 editorial panel, on {best.list.shortTitle}
              </cite>
            </blockquote>
          ) : null}
        </Band>
      ) : null}

      {/* Specifications + verdict */}
      <Band aria-labelledby="t49-item-specs">
        <div className="t49-split">
          <div>
            <SectionHead id="t49-item-specs" eyebrow="On the record" title="Recorded detail" />
            {item.attributes.length ? (
              <div className="t49-tablewrap">
                <table className="t49-table" style={{ minWidth: 0 }}>
                  <caption className="t49-sr">Attributes recorded for {item.name}</caption>
                  <tbody>
                    {item.attributes.map((attr) => (
                      <tr key={attr.key}>
                        <th scope="row" style={{ position: 'static', width: '42%' }}>
                          {attr.label}
                        </th>
                        <td className="t49-num" data-align="right">
                          {formatValue(attr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="t49-caption t49-faint">No structured attributes recorded.</p>
            )}
          </div>

          <div>
            <SectionHead eyebrow="Panel verdict" title="Strengths and reservations" />
            <div style={{ display: 'grid', gap: 24 }}>
              {item.pros.length ? (
                <div>
                  <p className="t49-caption-strong" style={{ color: 'var(--success-text)' }}>
                    What it gets right
                  </p>
                  <ul style={{ margin: '10px 0 0', paddingLeft: 20, display: 'grid', gap: 8 }}>
                    {item.pros.map((pro) => (
                      <li key={pro} className="t49-body">
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {item.cons.length ? (
                <div>
                  <p className="t49-caption-strong" style={{ color: 'var(--danger-text)' }}>
                    Where it gives ground
                  </p>
                  <ul style={{ margin: '10px 0 0', paddingLeft: 20, display: 'grid', gap: 8 }}>
                    {item.cons.map((con) => (
                      <li key={con} className="t49-body">
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Band>

      {/* Appears in */}
      {rankings.length ? (
        <Band tone="parchment" aria-labelledby="t49-item-lists">
          <SectionHead
            id="t49-item-lists"
            eyebrow={`${rankings.length} ${rankings.length === 1 ? 'appearance' : 'appearances'}`}
            title="Where this entry ranks"
          />
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
            {rankings.map(({ ranking, list }) => (
              <li key={list.slug} className="t49-card">
                <Link
                  href={`/top49/${list.categorySlug}/${list.slug}`}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <RankBadge rank={ranking.rank} />
                  <span style={{ flex: 1, minWidth: 200 }}>
                    <span className="t49-body-strong" style={{ display: 'block' }}>
                      {list.title}
                    </span>
                    <span className="t49-fine t49-faint">
                      {list.itemCount} entries · refreshed {list.updateFrequency}
                    </span>
                  </span>
                  <Score value={ranking.score} />
                  <TrendBadge rank={ranking.rank} previousRank={ranking.previousRank} />
                </Link>
              </li>
            ))}
          </ul>
        </Band>
      ) : null}

      {/* Prev / next */}
      {neighbours.prev || neighbours.next ? (
        <Band size="tight" aria-label="Neighbouring entries">
          <div className="t49-grid t49-grid--2">
            {neighbours.prev ? (
              <Link href={`/top49/item/${neighbours.prev.item.slug}`} className="t49-card">
                <div className="t49-card__body">
                  <p className="t49-eyebrow">← #{neighbours.prev.ranking.rank} · one place higher</p>
                  <p className="t49-tagline" style={{ marginTop: 8 }}>
                    {neighbours.prev.item.name}
                  </p>
                </div>
              </Link>
            ) : (
              <span />
            )}
            {neighbours.next ? (
              <Link
                href={`/top49/item/${neighbours.next.item.slug}`}
                className="t49-card"
                style={{ textAlign: 'right' }}
              >
                <div className="t49-card__body">
                  <p className="t49-eyebrow" style={{ justifyContent: 'flex-end' }}>
                    #{neighbours.next.ranking.rank} · one place lower →
                  </p>
                  <p className="t49-tagline" style={{ marginTop: 8 }}>
                    {neighbours.next.item.name}
                  </p>
                </div>
              </Link>
            ) : null}
          </div>
        </Band>
      ) : null}

      {/* Similar */}
      {similar.length ? (
        <Band tone="parchment" aria-labelledby="t49-item-similar">
          <SectionHead
            id="t49-item-similar"
            eyebrow="From the same list"
            title="Ranked alongside it"
            action={
              best ? (
                <Link
                  href={`/top49/${best.list.categorySlug}/${best.list.slug}`}
                  className="t49-btn t49-btn--ghost t49-btn--sm"
                >
                  Open {best.list.shortTitle}
                </Link>
              ) : null
            }
          />
          <div className="t49-grid t49-grid--4">
            {similar.map(({ item: other, ranking }) => (
              <ItemCard key={other.slug} item={other} ranking={ranking} />
            ))}
          </div>
        </Band>
      ) : null}

      <ExploreMore groups={groupsWithCategories} trending={trending} />
    </main>
  );
}
