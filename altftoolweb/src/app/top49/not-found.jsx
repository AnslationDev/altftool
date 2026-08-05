import Link from 'next/link';
import { getTrendingLists } from './lib/data.js';

export default async function Top49NotFound() {
  const suggestions = await getTrendingLists(5);

  return (
    <main>
      <section className="t49-band">
        <div className="t49-wrap t49-wrap--prose">
          <p className="t49-eyebrow">404</p>
          <h1 className="t49-hero-heavy" style={{ marginTop: 16, fontSize: 'clamp(36px, 2rem + 4vw, 72px)' }}>
            No list here
          </h1>
          <p className="t49-lead" style={{ marginTop: 18 }}>
            That category, list or entry does not exist — it may have been renamed when the index
            was reorganised. These are the lists people are reading most right now.
          </p>

          <ul style={{ listStyle: 'none', margin: '28px 0 0', padding: 0 }}>
            {suggestions.map((list) => (
              <li key={list.slug} style={{ borderTop: '1px solid var(--border)' }}>
                <Link
                  href={`/top49/${list.categorySlug}/${list.slug}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 0',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span className="t49-body-strong">{list.title}</span>
                  <span className="t49-fine t49-faint t49-num">{list.itemCount} ranked</span>
                </Link>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <Link href="/top49" className="t49-btn t49-btn--primary">
              Back to Top 49
            </Link>
            <Link href="/top49/search" className="t49-btn t49-btn--ghost">
              Search everything
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
