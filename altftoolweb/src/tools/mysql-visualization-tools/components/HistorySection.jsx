import { Clock3 } from "lucide-react";
import Panel from "./Panel";

export default function HistorySection({ history, onRestore }) {
  return (
    <Panel title="History" icon={Clock3}>
      <p className="mb-3 text-sm text-(--muted-foreground)">Saved locally in this browser.</p>

      {history.length ? (
        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRestore(item.sql)}
              className="w-full min-w-0 rounded-xl border border-(--border) bg-(--background) p-3 text-left transition hover:border-(--primary) hover:shadow-md"
            >
              <div className="break-words text-sm font-bold text-(--foreground) [overflow-wrap:anywhere]">
                {item.name}
              </div>
              <div className="mt-1 text-xs text-(--muted-foreground)">
                {item.stats.tables} tables, {item.stats.relationships} links
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-(--border) p-4 text-sm text-(--muted-foreground)">
          Save a parsed schema to build local history.
        </p>
      )}
    </Panel>
  );
}
