import { DatabaseZap, Sparkles } from "lucide-react";

export default function Header({ stats }) {
  return (
    <header className="mb-5 bg-(--background) text-center text-(--foreground)">
      <div className="flex min-w-0 flex-col items-center gap-4">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs font-semibold text-(--muted-foreground)">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
            <span className="min-w-0 truncate">Live browser MySQL lab</span>
          </div>
          <h1 className="heading flex justify-center gap-2 break-words text-(--primary)">
            MySQL Visualization Tools
          </h1>
          <p className="description mx-auto mb-6 mt-1 max-w-3xl break-words text-(--secondary-foreground) opacity-90">
            Paste real CREATE TABLE SQL and watch the schema, ER diagram,
            relationships, query references, history, and exports update live in
            your browser.
          </p>
        </div>

        <div className="grid w-full min-w-0 max-w-4xl grid-cols-2 gap-3 px-2 text-center sm:grid-cols-4">
          {[
            ["Tables", stats.tables],
            ["Columns", stats.columns],
            ["Links", stats.relationships],
            ["PKs", stats.primaryKeys],
          ].map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-lg border border-(--border) bg-(--card) px-3 py-2"
            >
              <div className="mt-1 min-w-0 break-words text-base font-black leading-tight text-(--foreground) sm:text-lg">
                {value}
              </div>
              <div className="truncate text-[11px] uppercase text-(--muted-foreground)">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
          <DatabaseZap className="h-6 w-6 text-cyan-500" />
        </div>
      </div>
    </header>
  );
}
