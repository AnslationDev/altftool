import { BookMarked, BookX } from "lucide-react";
import WordCard from "./WordCard.jsx";

export default function VocabList({ savedWords, onRemove, onStatusChange, onSearch }) {

  // counts for each status
  const total    = savedWords.length;
  const newCount      = savedWords.filter((w) => w.status === "new").length;
  const learningCount = savedWords.filter((w) => w.status === "learning").length;
  const learnedCount  = savedWords.filter((w) => w.status === "learned").length;

  return (
    <div className="px-4 sm:px-6 mt-6">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookMarked size={20} className="text-(--primary)" />
        <h2 className="font-semibold text-base sm:text-lg text-(--foreground)">
          My Vocabulary
        </h2>
        <span className="ml-auto text-xs text-(--muted-foreground)">
          {total} {total === 1 ? "word" : "words"} saved
        </span>
      </div>

      {/* Stats row */}
      {total > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            🔵 New: {newCount}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
            🟡 Learning: {learningCount}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
            🟢 Learned: {learnedCount}
          </span>
        </div>
      )}

      {/* Empty state */}
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-(--muted-foreground)">
          <BookX size={36} />
          <p className="text-sm">There is no word saved yet!</p>
          <p className="text-xs">Search for words and click &quot;Learn this word&quot;</p>
        </div>
      ) : (
        // Word cards list
        <div>
          {savedWords.map((entry) => (
            <WordCard
              key={entry.word}
              entry={entry}
              onRemove={onRemove}
              onStatusChange={onStatusChange}
              onSearch={onSearch}
            />
          ))}
        </div>
      )}

    </div>
  );
}