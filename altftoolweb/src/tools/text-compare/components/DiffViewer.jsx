const rowClasses = {
  added: "border-[var(--secondary)] bg-[var(--secondary)]/10",
  removed: "border-[var(--primary)] bg-[var(--primary)]/10",
  modified: "border-[var(--border)] bg-[var(--muted)]",
  unchanged: "border-[var(--border)] bg-[var(--card)]",
};

export default function DiffViewer({ rows, showLineNumbers, isEmpty }) {
  if (isEmpty) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm font-semibold text-[var(--muted-foreground)]">
        Add text on either side to start a live comparison.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="grid grid-cols-2 border-b border-[var(--border)] bg-[var(--muted)] text-xs font-semibold uppercase text-[var(--muted-foreground)]">
        <span className="p-3">Original</span>
        <span className="border-l border-[var(--border)] p-3">Revised</span>
      </div>
      <div className="max-h-[520px] overflow-auto">
        {rows.map((row) => (
          <div key={row.index} className={`grid grid-cols-2 border-b text-sm ${rowClasses[row.type]}`}>
            <pre className="min-h-10 whitespace-pre-wrap p-3 font-mono text-[var(--foreground)]">
              {showLineNumbers && <span className="mr-3 select-none text-[var(--muted-foreground)]">{row.index}</span>}
              {row.left || " "}
            </pre>
            <pre className="min-h-10 whitespace-pre-wrap border-l border-[var(--border)] p-3 font-mono text-[var(--foreground)]">
              {showLineNumbers && <span className="mr-3 select-none text-[var(--muted-foreground)]">{row.index}</span>}
              {row.right || " "}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
