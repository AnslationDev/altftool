import dynamic from 'next/dynamic';

const ToolHome = dynamic(() => import('./pages'), { ssr: false });

// Wrapped so the tool's palette can live on this element instead of on body —
// a tool stylesheet stays attached after the visitor navigates away, so a bare
// body rule repainted every later page.
export default function ToolEntry() {
  return (
    <div className="orm-scope">
      <ToolHome />
    </div>
  );
}
