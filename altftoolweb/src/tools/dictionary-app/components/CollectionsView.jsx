import { useState } from "react";
import { FolderOpen, Folder, Trash2, BookOpen, ChevronDown, ChevronUp, FolderX } from "lucide-react";

export default function CollectionsView({
  collections,
  wordMap,
  onRemoveFromCollection,
  onDeleteCollection,
  onSearch,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const totalWords = Object.values(wordMap).flat().length;

  return (
    <div className="px-4 sm:px-6 mt-6">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen size={20} className="text-(--primary)" />
        <h2 className="font-semibold text-base sm:text-lg text-(--foreground)">
          My Collections
        </h2>
        <span className="ml-auto text-xs text-(--muted-foreground)">
          {collections.length} folders · {totalWords} words
        </span>
      </div>

      {/* No collections */}
      {collections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-(--muted-foreground)">
          <FolderX size={36} />
          <p className="text-sm">No collections yet!</p>
          <p className="text-xs">Search a word and add it to a collection</p>
        </div>
      )}

      {/* Collections list */}
      <div className="flex flex-col gap-2">
        {collections.map((col) => {
          const words = wordMap[col.id] || [];
          const isExpanded = expandedId === col.id;

          return (
            <div
              key={col.id}
              className="border border-(--border) rounded-xl overflow-hidden bg-(--background)"
            >
              {/* Folder header */}
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : col.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer text-left"
                >
                  <span className="text-xl">{col.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">{col.name}</p>
                    <p className="text-xs text-(--muted-foreground)">
                      {words.length} {words.length === 1 ? "word" : "words"}
                    </p>
                  </div>
                  <span className="ml-2 text-(--muted-foreground)">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {/* Delete collection */}
                <button
                  onClick={() => onDeleteCollection(col.id)}
                  className="text-(--muted-foreground) hover:text-red-500 transition cursor-pointer ml-2"
                  title="Delete collection"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Words inside folder */}
              {isExpanded && (
                <div className="border-t border-(--border) px-4 py-3">
                  {words.length === 0 ? (
                    <p className="text-xs text-(--muted-foreground) italic text-center py-4">
                      No words in this collection yet
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {words.map((w) => (
                        <div
                          key={w}
                          className="flex items-center justify-between py-1.5"
                        >
                          <button
                            onClick={() => onSearch(w)}
                            className="text-sm font-medium text-(--primary) hover:underline cursor-pointer"
                          >
                            {w}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSearch(w)}
                              className="text-(--muted-foreground) hover:text-(--primary) transition cursor-pointer"
                              title="Search word"
                            >
                              <BookOpen size={14} />
                            </button>
                            <button
                              onClick={() => onRemoveFromCollection(col.id, w)}
                              className="text-(--muted-foreground) hover:text-red-500 transition cursor-pointer"
                              title="Remove from collection"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}