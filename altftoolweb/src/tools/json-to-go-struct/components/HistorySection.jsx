import { Clock3 } from "lucide-react";

export default function HistorySection({ history, restoreHistory }) {
  if (!history.length) return null;

  return (
    <div className="pp-glass min-w-0 rounded-3xl p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-blue-400" />
        <h2 className="text-xl font-black">Recent Structs</h2>
      </div>
      <div className="grid min-w-0 gap-3 md:grid-cols-2">
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => restoreHistory(item)}
            className="min-w-0 rounded-2xl border border-(--border) bg-(--muted)/25 p-4 text-left transition hover:border-blue-400/40 hover:bg-blue-400/10"
          >
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="min-w-0 break-words text-sm font-black">{item.rootName}</p>
              <span className="shrink-0 text-xs text-teal-400">{item.packageName || "main"}</span>
            </div>
            <p className="mt-2 text-xs text-(--muted-foreground)">{item.createdAt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
