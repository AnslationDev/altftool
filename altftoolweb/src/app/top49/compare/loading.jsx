import { Band } from '../components/primitives.jsx';

export default function CompareLoading() {
  return (
    <main aria-busy="true">
      <span className="t49-sr">Loading comparison…</span>

      <Band size="tight">
        <div className="t49-skel t49-skel--text" style={{ width: 150, height: 12 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(440px, 80%)', height: 48, marginTop: 20 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(580px, 92%)', height: 18, marginTop: 18 }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 30 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="t49-skel" style={{ width: 150, height: 40, borderRadius: 999 }} />
          ))}
        </div>
      </Band>

      <Band tone="parchment">
        <div className="t49-skel" style={{ height: 420, borderRadius: 'var(--t49-r-lg)' }} />
      </Band>
    </main>
  );
}
