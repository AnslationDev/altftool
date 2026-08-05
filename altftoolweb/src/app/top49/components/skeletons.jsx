/**
 * Loading placeholders. Shapes deliberately match the real components they
 * stand in for, so the layout does not shift when content arrives.
 */

export function SkeletonCard({ ratio = '4-3' }) {
  return (
    <div className="t49-card" aria-hidden="true">
      <div className={`t49-skel t49-media--${ratio}`} />
      <div className="t49-card__body t49-card__body--tight">
        <div className="t49-skel t49-skel--text" style={{ width: '70%' }} />
        <div className="t49-skel t49-skel--text" style={{ width: '45%' }} />
        <div className="t49-skel t49-skel--text" style={{ width: '90%', height: 10 }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8, ratio = '4-3', cols = 4 }) {
  return (
    <div className={`t49-grid t49-grid--${cols}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} ratio={ratio} />
      ))}
    </div>
  );
}

/** Mirrors the four-rail geometry of a real ranked row. */
export function SkeletonRow() {
  return (
    <li className="t49-rankrow" aria-hidden="true">
      <div className="t49-rankrow__rank">
        <div className="t49-skel t49-skel--text" style={{ width: 34, height: 28 }} />
        <div className="t49-skel" style={{ width: 40, height: 18, borderRadius: 999 }} />
      </div>
      <div className="t49-rankrow__media">
        <div className="t49-skel t49-skel--media t49-media--4-3" />
      </div>
      <div className="t49-rankrow__main">
        <div className="t49-skel t49-skel--text" style={{ width: '46%', height: 18 }} />
        <div className="t49-skel t49-skel--text" style={{ width: '26%', height: 10 }} />
        <div className="t49-skel t49-skel--text" style={{ width: '94%' }} />
        <div className="t49-skel t49-skel--text" style={{ width: '72%' }} />
      </div>
      <div className="t49-rankrow__score">
        <div className="t49-skel t49-skel--text" style={{ width: 74, height: 24 }} />
        <div className="t49-skel" style={{ width: '100%', height: 6, borderRadius: 999 }} />
      </div>
    </li>
  );
}

export function SkeletonRows({ count = 6 }) {
  return (
    <ul className="t49-ranklist" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </ul>
  );
}

export function SkeletonHero() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      <div className="t49-skel t49-skel--text" style={{ width: 140, height: 12 }} />
      <div className="t49-skel t49-skel--text" style={{ width: '92%', height: 44 }} />
      <div className="t49-skel t49-skel--text" style={{ width: '70%', height: 44 }} />
      <div className="t49-skel t49-skel--text" style={{ width: '84%', height: 18, marginTop: 8 }} />
      <div className="t49-skel" style={{ width: 260, height: 48, borderRadius: 999, marginTop: 8 }} />
    </div>
  );
}
