import { Sparkles } from "lucide-react";

export default function Header({ analysis }) {
  return (
    <header className="max-w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-4 text-center shadow-lg backdrop-blur-xl sm:p-5">
      <div className="flex min-w-0 flex-col items-center gap-4">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)]/70 px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
            <span className="min-w-0 truncate">Live browser NLP lab</span>
          </div>
          <h1 className="max-w-full break-words text-3xl font-bold leading-tight text-[var(--primary)] sm:text-4xl">
            Chinese Word Segmentation & Multi-Language Split Tool
          </h1>
          <p className="mx-auto max-w-3xl break-words text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Segment Chinese, split English and Hindi, inspect mixed-language tokens, and export learning-ready results instantly.
          </p>
        </div>

        <div className="grid w-full min-w-0 max-w-3xl grid-cols-1 gap-3 text-center sm:grid-cols-3">
          {[
            ["Language", analysis.language.label],
            ["Tokens", analysis.wordCount],
            ["Chars", analysis.charCount],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 px-3 py-2">
              <p className="truncate text-[11px] uppercase text-[var(--muted-foreground)]">{label}</p>
              <p className="mt-1 min-w-0 break-words text-base font-black leading-tight text-[var(--foreground)] sm:text-lg">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
