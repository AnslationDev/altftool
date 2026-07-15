import { Binary, FileCode, Sparkles } from "lucide-react";

export default function Header({ activeFile, convertedCount, historyCount }) {
  return (
    <header className="animate-fade-up max-w-full overflow-visible rounded-xl border border-[var(--border)] bg-[var(--card)]/90 p-3 text-center shadow-md backdrop-blur-xl sm:p-4">
      <div className="flex min-w-0 flex-col items-center gap-3">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)]/70 px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
            <span className="min-w-0 truncate">Browser-native encoding lab</span>
          </div>
          <h1 className="max-w-full break-words text-2xl font-bold leading-tight text-[var(--primary)] sm:text-3xl">
            File Encoding Conversion Studio
          </h1>
          <p className="mx-auto max-w-3xl break-words text-sm leading-5 text-[var(--muted-foreground)]">
            Detect byte order marks, decode source files, convert target encodings, repair mojibake, compare previews, and export real converted bytes.
          </p>
        </div>

        <div className="grid w-full min-w-0 max-w-3xl grid-cols-1 gap-2 text-center sm:grid-cols-3">
          {[
            ["Active", activeFile || "Waiting"],
            ["Converted", convertedCount],
            ["History", historyCount],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)]/70 px-3 py-2">
              <p className="truncate text-[11px] uppercase text-[var(--muted-foreground)]">{label}</p>
              <p className="mt-1 min-w-0 break-words text-sm font-black leading-tight text-[var(--foreground)] sm:text-base">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
          <FileCode className="h-5 w-5 text-cyan-500" />
          <Binary className="-ml-2 mt-5 h-4 w-4 text-fuchsia-500" />
        </div>
      </div>
    </header>
  );
}
