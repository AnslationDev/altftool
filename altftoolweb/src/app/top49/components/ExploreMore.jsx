import Link from 'next/link';
import { Band } from './primitives.jsx';

/**
 * Dense navigational band that closes every page. Follows the parchment footer
 * pattern from the design system: relaxed leading, columns of quiet links, a
 * legal line at the bottom.
 */
export default function ExploreMore({ groups = [], trending = [] }) {
  return (
    <Band tone="parchment" as="section" aria-labelledby="t49-explore-heading">
      <h2 id="t49-explore-heading" className="t49-sr">
        Explore more of Top 49
      </h2>

      <div
        style={{
          display: 'grid',
          gap: 32,
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        }}
      >
        {groups.slice(0, 4).map(({ group, categories }) => (
          <nav key={group.slug} aria-label={group.name}>
            <p className="t49-caption-strong" style={{ marginBottom: 10 }}>
              {group.name}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {categories.slice(0, 6).map((category) => (
                <li key={category.slug} style={{ lineHeight: 2.1 }}>
                  <Link href={`/top49/${category.slug}`} className="t49-caption t49-muted" style={{ textDecoration: 'none' }}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {trending.length ? (
          <nav aria-label="Trending lists">
            <p className="t49-caption-strong" style={{ marginBottom: 10 }}>
              Trending now
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {trending.slice(0, 6).map((list) => (
                <li key={list.slug} style={{ lineHeight: 2.1 }}>
                  <Link
                    href={`/top49/${list.categorySlug}/${list.slug}`}
                    className="t49-caption t49-muted"
                    style={{ textDecoration: 'none' }}
                  >
                    {list.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      <hr className="t49-divide" style={{ margin: '32px 0 18px' }} />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <p className="t49-fine t49-faint" style={{ maxWidth: '68ch' }}>
          Top 49 rankings are editorial. Scores are produced from the published criteria on each
          list and are refreshed on the cadence stated there. Figures shown across this section are
          curated demonstration data.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/top49/how-we-rank" className="t49-fine t49-link">
            How we rank
          </Link>
          <Link href="/top49/categories" className="t49-fine t49-link">
            All categories
          </Link>
          <Link href="/top49/compare" className="t49-fine t49-link">
            Compare
          </Link>
        </div>
      </div>
    </Band>
  );
}
