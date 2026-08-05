import { Band } from '../components/primitives.jsx';
import { SkeletonGrid } from '../components/skeletons.jsx';

export default function SearchLoading() {
  return (
    <main aria-busy="true">
      <span className="t49-sr">Searching…</span>

      <Band size="tight">
        <div className="t49-skel t49-skel--text" style={{ width: 160, height: 12 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(420px, 78%)', height: 48, marginTop: 20 }} />
        <div className="t49-skel t49-skel--text" style={{ width: 'min(560px, 90%)', height: 18, marginTop: 18 }} />
        <div className="t49-skel" style={{ width: 'min(620px, 100%)', height: 48, borderRadius: 999, marginTop: 26 }} />
      </Band>

      <Band tone="parchment">
        <SkeletonGrid count={8} ratio="4-3" cols={4} />
      </Band>
    </main>
  );
}
