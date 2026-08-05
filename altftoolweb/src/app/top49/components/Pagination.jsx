import Link from 'next/link';

/**
 * Server-rendered pagination. Emits real links so pages are crawlable and work
 * without JavaScript.
 */
export default function Pagination({ page, pageCount, baseParams = {}, pathname }) {
  if (pageCount <= 1) return null;

  const href = (n) => {
    const params = new URLSearchParams();
    Object.entries(baseParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    if (n > 1) params.set('page', String(n));
    else params.delete('page');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const windowed = [];
  const push = (n) => {
    if (n >= 1 && n <= pageCount && !windowed.includes(n)) windowed.push(n);
  };
  push(1);
  for (let n = page - 1; n <= page + 1; n += 1) push(n);
  push(pageCount);
  windowed.sort((a, b) => a - b);

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
      }}
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="t49-btn t49-btn--pearl" rel="prev">
          ← Previous
        </Link>
      ) : (
        <span className="t49-btn t49-btn--pearl" aria-disabled="true">
          ← Previous
        </span>
      )}

      <ol style={{ display: 'flex', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
        {windowed.map((n, i) => {
          const gap = i > 0 && n - windowed[i - 1] > 1;
          return (
            <li key={n} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {gap ? (
                <span className="t49-caption t49-faint" aria-hidden="true">
                  …
                </span>
              ) : null}
              {n === page ? (
                <span className="t49-chip t49-chip--active t49-num" aria-current="page">
                  {n}
                </span>
              ) : (
                <Link href={href(n)} className="t49-chip t49-num">
                  {n}
                  <span className="t49-sr"> page</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {page < pageCount ? (
        <Link href={href(page + 1)} className="t49-btn t49-btn--pearl" rel="next">
          Next →
        </Link>
      ) : (
        <span className="t49-btn t49-btn--pearl" aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  );
}
