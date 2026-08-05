'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Top49Error({ error, reset }) {
  useEffect(() => {
    // Surfaced in the browser console and any attached reporter.
    console.error('[top49]', error);
  }, [error]);

  return (
    <main>
      <section className="t49-band">
        <div className="t49-wrap t49-wrap--prose" style={{ textAlign: 'center' }}>
          <p className="t49-eyebrow" style={{ justifyContent: 'center' }}>
            Something broke
          </p>
          <h1 className="t49-display" style={{ marginTop: 16 }}>
            This ranking could not be loaded
          </h1>
          <p className="t49-lead" style={{ marginTop: 16 }}>
            The page hit an unexpected error while assembling its data. Trying again usually
            resolves it — the rankings themselves are unaffected.
          </p>

          {error?.digest ? (
            <p className="t49-fine t49-faint t49-num" style={{ marginTop: 14 }}>
              Reference {error.digest}
            </p>
          ) : null}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              marginTop: 30,
            }}
          >
            <button type="button" onClick={() => reset()} className="t49-btn t49-btn--primary">
              Try again
            </button>
            <Link href="/top49" className="t49-btn t49-btn--ghost">
              Back to Top 49
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
