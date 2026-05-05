import { useState } from "react";
import { Volume2, BookmarkPlus, BookmarkCheck, Gauge } from "lucide-react";

function getDifficulty(word) {
  const syllables =
    word
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .replace(/[aeiou]{2,}/g, "a")
      .split("")
      .filter((c) => "aeiou".includes(c)).length || 1;

  if (syllables <= 2) return { label: "Easy",   color: "bg-green-100 text-green-700",   dot: "🟢" };
  if (syllables <= 4) return { label: "Medium", color: "bg-yellow-100 text-yellow-700", dot: "🟡" };
  return                     { label: "Hard",   color: "bg-red-100 text-red-700",       dot: "🔴" };
}

export default function ResultHeader({ word, onSpeak, onLearn, isWordSaved, phonetic }) {
  const [accent, setAccent] = useState("us"); // "us" | "uk"
  const [slow, setSlow] = useState(false);

  const difficulty = getDifficulty(word);

  const handleSpeak = () => {
    onSpeak(word, { accent, slow });
  };

  return (
    <div className="mb-4 p-4 sm:p-6">

      {/* Row 1 — word + difficulty + save button */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <h2 className="text-sm sm:text-2xl lg:text-3xl font-bold break-all">
          {word}
        </h2>

        {/* Difficulty badge */}
        <span className={`text-xs sm:text-sm px-1 sm:px-2 py-0.5 sm:py-1.5 rounded-full font-medium ${difficulty.color}`}>
          {difficulty.dot} {difficulty.label}
        </span>

        {/* Phonetic */}
        {phonetic && (
          <span className="text-xs sm:text-sm text-(--muted-foreground) font-mono">
            {phonetic}
          </span>
        )}

        {/* Learn button */}
        <button
          onClick={() => onLearn(word)}
          disabled={isWordSaved}
          className={`ml-auto flex items-center justify-center gap-2 px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition cursor-pointer
            ${isWordSaved
              ? "bg-green-100 text-green-700 cursor-not-allowed"
              : "bg-(--primary) text-white hover:opacity-80"
            }`}
        >
          {isWordSaved ? (
            <><BookmarkCheck size={16} /><span className="hidden sm:inline">Saved!</span></>
          ) : (
            <><BookmarkPlus size={16} /><span className="hidden sm:inline">Learn this word</span></>
          )}
        </button>
      </div>

      {/* Row 2 — pronunciation controls */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* US accent button */}
        <button
          onClick={() => setAccent("us")}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer border
            ${accent === "us"
              ? "bg-(--primary) text-white border-(--primary)"
              : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
            }`}
        >
          🇺🇸 US
        </button>

        {/* UK accent button */}
        <button
          onClick={() => setAccent("uk")}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer border
            ${accent === "uk"
              ? "bg-(--primary) text-white border-(--primary)"
              : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
            }`}
        >
          🇬🇧 UK
        </button>

        {/* Slow toggle */}
        <button
          onClick={() => setSlow((prev) => !prev)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer border
            ${slow
              ? "bg-(--primary) text-white border-(--primary)"
              : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
            }`}
        >
          <Gauge size={13} />
          Slow
        </button>

        {/* Listen button */}
        <button
          onClick={handleSpeak}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition cursor-pointer"
        >
          <Volume2 size={13} />
          <span className="hidden sm:inline">Listen</span>
        </button>

      </div>
    </div>
  );
}