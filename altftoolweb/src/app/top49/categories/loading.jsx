import { Band } from '../components/primitives.jsx';
import { SkeletonGrid } from '../components/skeletons.jsx';

export default function CategoriesLoading() {
  return (
    <main aria-busy="true">
      <span className="t49-sr">Loading categories…</span>

      <Band size="tight">
        <div className="t49-skel t49-skel--text" style={{ width: 180, height: 12 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(460px, 80%)', height: 48, marginTop: 20 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(620px, 92%)', height: 18, marginTop: 18 }} />
        <div style={{ display: 'flex', gap: 40, marginTop: 32 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: 'grid', gap: 8 }}>
              <div className="t49-skel t49-skel--text" style={{ width: 68, height: 34 }} />
              <div className="t49-skel t49-skel--text" style={{ width: 92 }} />
            </div>
          ))}
        </div>
      </Band>

      <Band tone="parchment" size="tight">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="t49-skel" style={{ width: 108, height: 36, borderRadius: 999 }} />
          ))}
        </div>
      </Band>

      <Band>
        <SkeletonGrid count={8} ratio="16-10" cols={4} />
      </Band>
    </main>
  );
}
