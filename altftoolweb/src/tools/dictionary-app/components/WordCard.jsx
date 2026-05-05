import { Trash2, RotateCcw, CheckCheck, BookOpen } from "lucide-react";

export default function WordCard({ entry, onRemove, onStatusChange, onSearch }) {
  const statusConfig = {
    new:      { label: "New",      bg: "bg-blue-100 text-blue-700",   next: "learning" },
    learning: { label: "Learning", bg: "bg-yellow-100 text-yellow-700", next: "learned"  },
    learned:  { label: "Learned",  bg: "bg-green-100 text-green-700",  next: null        },
  };

  const current = statusConfig[entry.status];

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border border-(--border) rounded-lg bg-(--background) mb-2 w-full">
      
      {/* Left — word info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <button
          onClick={() => onSearch(entry.word)}
          className="font-semibold text-sm sm:text-base text-(--primary) hover:underline cursor-pointer"
        >
          {entry.word}
        </button>
        <span className="text-xs text-(--muted-foreground)">{entry.savedOn}</span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        
        {/* Status badge */}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${current.bg}`}>
          {current.label}
        </span>

        {/* Move to next status — only if not learned yet */}
        {current.next && (
          <button
            onClick={() => onStatusChange(entry.word, current.next)}
            className="text-(--muted-foreground) hover:text-(--primary) cursor-pointer transition"
            title={`Mark as ${current.next}`}
          >
            {current.next === "learning" ? (
              <RotateCcw size={16} />
            ) : (
              <CheckCheck size={16} />
            )}
          </button>
        )}

        {/* Re-search */}
        <button
          onClick={() => onSearch(entry.word)}
          className="text-(--muted-foreground) hover:text-(--primary) cursor-pointer transition"
          title="Search again"
        >
          <BookOpen size={16} />
        </button>

        {/* Delete */}
        <button
          onClick={() => onRemove(entry.word)}
          className="text-(--muted-foreground) hover:text-red-500 cursor-pointer transition"
          title="Remove word"
        >
          <Trash2 size={16} />
        </button>

      </div>
      
    </div>
  );
}