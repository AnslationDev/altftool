import { Band } from '../components/primitives.jsx';

export default function HowWeRankLoading() {
  return (
    <main aria-busy="true">
      <span className="t49-sr">Loading methodology…</span>

      <Band size="tight">
        <div className="t49-skel t49-skel--text" style={{ width: 140, height: 12 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(380px, 72%)', height: 62, marginTop: 20 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(640px, 94%)', height: 18, marginTop: 22 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(520px, 84%)', height: 18, marginTop: 10 }} />
      </Band>

      <Band tone="parchment">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 32,
              padding: '28px 0',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div className="t49-skel t49-skel--text" style={{ width: 84, height: 48, flex: 'none' }} />
            <div style={{ flex: 1, display: 'grid', gap: 10 }}>
              <div className="t49-skel t49-skel--text" style={{ width: '38%', height: 22 }} />
              <div className="t49-skel t49-skel--text" style={{ width: '92%' }} />
              <div className="t49-skel t49-skel--text" style={{ width: '76%' }} />
            </div>
          </div>
        ))}
      </Band>
    </main>
  );
}
