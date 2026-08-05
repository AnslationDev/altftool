import Link from 'next/link';
import JsonLd from '@/platform/seo/JsonLd';
import { createPageMetadata, createBreadcrumbJsonLd } from '@/platform/seo/generateMetadata';

import {
  getComparison,
  getCompareCandidates,
  getGroupsWithCategories,
  getTrendingLists,
} from '../lib/data.js';
import {
  Band,
  SectionHead,
  Breadcrumbs,
  EmptyState,
  RankBadge,
  Score,
  Meter,
  TrendBadge,
} from '../components/primitives.jsx';
import ComparePicker from '../components/ComparePicker.jsx';
import T49Image from '../components/T49Image.jsx';
import ExploreMore from '../components/ExploreMore.jsx';
import { sizes } from '../lib/images.js';
import { formatValue, groupedNumber } from '../lib/format.js';

export const dynamic = 'auto';

const MAX = 4;

export async function generateMetadata() {
  return createPageMetadata({
    title: 'Compare ranked entries',
    description:
      'Put up to four Top 49 entries side by side and compare scores, criteria breakdowns and recorded attributes.',
    path: '/top49/compare',
    noindex: true,
    follow: true,
  });
}

/** Build the compare URL for a given set of slugs. */
function compareHref(slugs) {
  return slugs.length ? `/top49/compare?items=${slugs.join(',')}` : '/top49/compare';
}

export default async function ComparePage({ searchParams }) {
  const params = (await searchParams) || {};
  const raw = typeof params.items === 'string' ? params.items : '';
  const requested = raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, MAX);

  const [comparison, candidates, groupsWithCategories, trending] = await Promise.all([
    getComparison(requested),
    getCompareCandidates(80),
    getGroupsWithCategories(),
    getTrendingLists(6),
  ]);

  const entries = comparison.items; // [{ item, ranking, list }]
  const slugs = entries.map((e) => e.item.slug);
  const missing = requested.filter((s) => !slugs.includes(s));
  const emptySlots = Math.max(0, MAX - entries.length);
  const hasAny = entries.length > 0;
  const canCompare = entries.length > 1;

  // Union of criteria names, in first-seen order.
  const criteria = [];
  entries.forEach(({ ranking }) => {
    if (!ranking) return;
    Object.keys(ranking.scoreBreakdown).forEach((n) => {
      if (!criteria.includes(n)) criteria.push(n);
    });
  });

  /** Highest value across the row — only meaningful where higher is better. */
  const leaderOf = (values) => {
    const nums = values.filter((v) => typeof v === 'number');
    return nums.length > 1 ? Math.max(...nums) : null;
  };

  return (
    <main>
      <JsonLd
        id="top49-compare-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: 'Top 49', path: '/top49' },
            { name: 'Compare', path: '/top49/compare' },
          ]),
        ].filter(Boolean)}
      />

      {/* ── 1. Header ───────────────────────────────────────────────────── */}
      <Band as="header" size="tight">
        <Breadcrumbs trail={[{ label: 'Top 49', href: '/top49' }, { label: 'Compare' }]} />
        <p className="t49-eyebrow" style={{ marginTop: 22 }}>
          Side by side
        </p>
        <h1 className="t49-hero-display" style={{ marginTop: 14, maxWidth: '15ch' }}>
          Compare up to four
        </h1>
        <p className="t49-lead" style={{ marginTop: 18, maxWidth: '56ch' }}>
          Scores, criteria breakdowns and recorded attributes lined up in one matrix — across any
          category, from any list. The URL carries your selection, so a comparison is a link.
        </p>
        {missing.length ? (
          <p className="t49-caption" style={{ marginTop: 20, color: 'var(--danger-text)' }}>
            Skipped {missing.map((s) => `“${s}”`).join(', ')} — no ranked entry with that slug.
          </p>
        ) : null}
      </Band>

      {/* ── 2. Slots + picker ───────────────────────────────────────────── */}
      <Band tone="parchment" id="picker" className="t49-anchor" aria-labelledby="t49-cmp-select">
        <SectionHead
          id="t49-cmp-select"
          eyebrow={`${entries.length} of ${MAX} selected`}
          title="Your selection"
          action={
            hasAny ? (
              <Link href="/top49/compare" className="t49-btn t49-btn--ghost t49-btn--sm">
                Clear all
              </Link>
            ) : null
          }
        />

        <ul className="t49-cmp-slots">
          {entries.map(({ item, ranking, list }) => (
            <li key={item.slug} className="t49-cmp-slot">
              <div className="t49-cmp-slot__figure">
                <T49Image
                  id={item.image}
                  name={item.name}
                  alt={item.imageAlt || ''}
                  ratio="4-3"
                  sizes={sizes.card4}
                  width={520}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {ranking ? <RankBadge rank={ranking.rank} /> : null}
                {ranking ? (
                  <TrendBadge rank={ranking.rank} previousRank={ranking.previousRank} />
                ) : null}
              </div>

              <div>
                <Link href={`/top49/item/${item.slug}`} className="t49-cmp-slot__name">
                  {item.name}
                </Link>
                {list ? (
                  <p className="t49-fine t49-faint" style={{ marginTop: 4 }}>
                    {list.shortTitle}
                  </p>
                ) : null}
              </div>

              <Link
                href={compareHref(slugs.filter((s) => s !== item.slug))}
                className="t49-cmp-slot__remove"
                scroll={false}
              >
                Remove
              </Link>

              <div className="t49-cmp-slot__meta">
                {ranking ? <Score value={ranking.score} /> : <span className="t49-cmp-null">—</span>}
                {ranking ? (
                  <span className="t49-fine t49-faint t49-num">
                    {groupedNumber(ranking.votes)} votes
                  </span>
                ) : null}
              </div>
            </li>
          ))}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <li key={`empty-${i}`} style={{ display: 'flex' }}>
              <a href="#picker" className="t49-cmp-slot t49-cmp-slot--empty" style={{ width: '100%' }}>
                <span className="t49-cmp-slot__plus" aria-hidden="true">
                  ＋
                </span>
                <span className="t49-caption-strong">Add an entry</span>
                <span className="t49-fine">Slot {entries.length + i + 1} of {MAX}</span>
              </a>
            </li>
          ))}
        </ul>

        <hr className="t49-divide" style={{ margin: '36px 0 28px' }} />

        <p className="t49-caption-strong" style={{ marginBottom: 6 }}>
          {hasAny ? 'Add another' : 'Pick your first entry'}
        </p>
        <p className="t49-caption t49-muted" style={{ marginBottom: 18, maxWidth: '54ch' }}>
          Search the full index, or choose from the highest-ranked entries across the most-read
          lists.
        </p>
        <ComparePicker candidates={candidates} selectedSlugs={slugs} />
      </Band>

      {/* ── 3. The matrix ───────────────────────────────────────────────── */}
      {!hasAny ? (
        <Band aria-label="Comparison">
          <EmptyState
            icon="⇄"
            title="Nothing selected yet"
            body="Add two or more entries above. Anything ranked on Top 49 can be compared against anything else, even across categories."
            actions={
              <>
                <Link href="#picker" className="t49-btn t49-btn--primary">
                  Choose entries
                </Link>
                <Link href="/top49/categories" className="t49-btn t49-btn--ghost">
                  Browse categories
                </Link>
              </>
            }
          />
        </Band>
      ) : (
        <Band aria-labelledby="t49-cmp-matrix-heading">
          <SectionHead
            id="t49-cmp-matrix-heading"
            eyebrow="The matrix"
            title={canCompare ? 'Every value, aligned' : 'One entry so far'}
            lead={
              canCompare
                ? 'Criteria differ between lists, so an empty cell means that entry’s list does not score that criterion — it is not a zero.'
                : 'Add at least one more entry and the columns below fill out into a true side-by-side.'
            }
          />

          <div className="t49-cmp-matrix">
            <table>
              <caption className="t49-sr">
                Comparing {entries.map((e) => e.item.name).join(', ')}
              </caption>

              <thead>
                <tr>
                  <th scope="row">Entry</th>
                  {entries.map(({ item, ranking, list }) => (
                    <td key={item.slug}>
                      <Link
                        href={`/top49/item/${item.slug}`}
                        className="t49-cmp-slot__name"
                        style={{ display: 'block' }}
                      >
                        {item.name}
                      </Link>
                      {list && ranking ? (
                        <span className="t49-fine t49-faint" style={{ display: 'block', marginTop: 4 }}>
                          #{ranking.rank} in {list.shortTitle}
                        </span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              </thead>

              {/* Overall score */}
              <tbody>
                <tr className="t49-cmp-group">
                  <th scope="row" colSpan={entries.length + 1}>
                    Top 49 score
                  </th>
                </tr>
                <tr>
                  <th scope="row">Score out of 100</th>
                  {(() => {
                    const values = entries.map((e) => e.ranking?.score ?? null);
                    const best = leaderOf(values);
                    return entries.map(({ item, ranking }, i) => (
                      <td key={item.slug}>
                        {ranking ? (
                          <>
                            <span className={values[i] === best ? 't49-cmp-best' : undefined}>
                              <Score value={ranking.score} />
                            </span>
                            <span style={{ display: 'block', marginTop: 8 }}>
                              <Meter
                                value={ranking.score}
                                label={`${item.name} scores ${ranking.score} out of 100`}
                              />
                            </span>
                          </>
                        ) : (
                          <span className="t49-cmp-null">—</span>
                        )}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  <th scope="row">Reader votes</th>
                  {(() => {
                    const values = entries.map((e) => e.ranking?.votes ?? null);
                    const best = leaderOf(values);
                    return entries.map(({ item, ranking }, i) => (
                      <td key={item.slug} className="t49-num">
                        {ranking ? (
                          <span className={values[i] === best ? 't49-cmp-best' : undefined}>
                            {groupedNumber(ranking.votes)}
                          </span>
                        ) : (
                          <span className="t49-cmp-null">—</span>
                        )}
                      </td>
                    ));
                  })()}
                </tr>
              </tbody>

              {/* Criteria breakdown */}
              {criteria.length ? (
                <tbody>
                  <tr className="t49-cmp-group">
                    <th scope="row" colSpan={entries.length + 1}>
                      Criteria breakdown
                    </th>
                  </tr>
                  {criteria.map((name) => {
                    const values = entries.map((e) => e.ranking?.scoreBreakdown?.[name] ?? null);
                    const best = leaderOf(values);
                    return (
                      <tr key={name}>
                        <th scope="row">{name}</th>
                        {entries.map(({ item }, i) => (
                          <td key={item.slug} className="t49-num">
                            {values[i] === null || values[i] === undefined ? (
                              <span className="t49-cmp-null">not scored</span>
                            ) : (
                              <span className={values[i] === best ? 't49-cmp-best' : undefined}>
                                {Number(values[i]).toFixed(1)}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              ) : null}

              {/* Recorded attributes */}
              {comparison.rows.length ? (
                <tbody>
                  <tr className="t49-cmp-group">
                    <th scope="row" colSpan={entries.length + 1}>
                      Recorded detail
                    </th>
                  </tr>
                  {comparison.rows.map((row) => (
                    <tr key={row.key}>
                      <th scope="row">{row.label}</th>
                      {row.values.map((attr, i) => (
                        <td key={`${row.key}-${i}`} className="t49-num">
                          {attr ? formatValue(attr) : <span className="t49-cmp-null">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ) : null}
            </table>
          </div>

          <div className="t49-cmp-bar">
            <span className="t49-body">
              <strong className="t49-num">{entries.length}</strong> of {MAX} selected
              {canCompare ? null : ' — add one more to compare'}
            </span>
            <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="#picker" className="t49-btn t49-btn--ghost t49-btn--sm">
                Add entry
              </Link>
              <Link href="/top49/compare" className="t49-btn t49-btn--primary t49-btn--sm">
                Start over
              </Link>
            </span>
          </div>
        </Band>
      )}

      {/* ── 4. Verdict ──────────────────────────────────────────────────── */}
      {hasAny ? (
        <Band tone="parchment" aria-labelledby="t49-cmp-verdict">
          <SectionHead
            id="t49-cmp-verdict"
            eyebrow="Panel verdict"
            title="Strengths and reservations"
            lead="Every ranked entry carries at least one reservation — if the panel cannot name a trade-off, it has not looked closely enough."
          />
          <div className="t49-cmp-slots">
            {entries.map(({ item }) => (
              <div key={item.slug} className="t49-cmp-slot">
                <p className="t49-cmp-slot__name">{item.name}</p>

                {item.pros.length ? (
                  <div>
                    <p className="t49-caption-strong" style={{ color: 'var(--success-text)' }}>
                      Gets right
                    </p>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6 }}>
                      {item.pros.map((p) => (
                        <li key={p} className="t49-caption t49-muted">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {item.cons.length ? (
                  <div>
                    <p className="t49-caption-strong" style={{ color: 'var(--danger-text)' }}>
                      Gives ground
                    </p>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 6 }}>
                      {item.cons.map((c) => (
                        <li key={c} className="t49-caption t49-muted">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="t49-cmp-slot__meta">
                  <Link href={`/top49/item/${item.slug}`} className="t49-caption t49-link">
                    Full entry →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Band>
      ) : null}

      {/* ── 5. How to read it ───────────────────────────────────────────── */}
      <Band tone="dark" aria-labelledby="t49-cmp-read">
        <div style={{ maxWidth: 720 }}>
          <p className="t49-eyebrow">Reading the matrix</p>
          <h2 id="t49-cmp-read" className="t49-display" style={{ marginTop: 14 }}>
            Scores compare inside a list, not across them
          </h2>
          <p className="t49-lead" style={{ marginTop: 18, color: 'color-mix(in srgb, var(--on-media) 82%, transparent)' }}>
            Two entries judged on different criteria can both be scored correctly and still not be
            directly comparable. Where the lists differ, treat the criteria breakdown as the honest
            comparison and the headline score as context.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
            <Link href="/top49/how-we-rank" className="t49-btn t49-btn--primary">
              Read the methodology
            </Link>
            <Link href="/top49/categories" className="t49-btn t49-btn--ghost">
              Browse categories
            </Link>
          </div>
        </div>
      </Band>

      <ExploreMore groups={groupsWithCategories} trending={trending} />
    </main>
  );
}
