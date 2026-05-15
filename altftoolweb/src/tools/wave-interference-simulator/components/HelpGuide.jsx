export default function HelpGuide({ onClose }) {
  return (
    <div className="absolute right-0 top-0 z-20 mr-2 mt-2 w-80 max-w-[90vw] space-y-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--foreground)] shadow-[var(--anslation-ds-shadow-md)]">
      <div className="flex justify-between items-center">
        <h4 className="subheading text-[var(--primary)]">Quick Guide</h4>
        <button onClick={onClose} className="text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">✕</button>
      </div>
      <div className="space-y-2">
        <p><span className="text-[#ff44aa] font-bold">●</span> <strong>Pink line</strong> = Wave 1</p>
        <p><span className="text-[#00e5ff] font-bold">●</span> <strong>Cyan line</strong> = Wave 2</p>
        <p><span className="text-[#ffe066] font-bold">●</span> <strong>Yellow line</strong> = Combined result</p>
      </div>
      <div className="space-y-2">
        <p><strong>Hover over the canvas</strong> to see path difference and interference type.</p>
        <p><strong>Adjust sliders</strong> to change amplitude, frequency, phase, etc.</p>
        <p><strong>Take a Snapshot</strong> to freeze the pattern and compare changes.</p>
      </div>
      <div className="text-xs text-[var(--muted-foreground)]">
        <p><strong>Constructive:</strong> Waves add up → bright yellow crests</p>
        <p><strong>Destructive:</strong> Waves cancel → flattened line</p>
      </div>
    </div>
  );
}
