import { POS_LABELS } from "../constants";

export default function SynonymResults({ wordDetail, hasSearched }) {
  if (!hasSearched) return null;
  if (!wordDetail) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
        <p className="text-sm text-[var(--muted-foreground)]">No results found. Try a different word.</p>
      </div>
    );
  }

  const { word, pos, syn, ant } = wordDetail;

  return (
    <div className="space-y-4">
      {/* Word Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-6 shadow-sm">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-extrabold text-[var(--foreground)]">{word}</h2>
          <span className="rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
            {POS_LABELS[pos] || pos}
          </span>
        </div>
      </div>

      {/* Synonyms */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Synonyms ({syn.length})
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 p-5">
          {syn.map((s, i) => (
            <span key={i} className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-500/20">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Antonyms */}
      {ant && ant.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Antonyms ({ant.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 p-5">
            {ant.map((a, i) => (
              <span key={i} className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-sm font-bold text-rose-600 transition-all hover:bg-rose-500/20">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
