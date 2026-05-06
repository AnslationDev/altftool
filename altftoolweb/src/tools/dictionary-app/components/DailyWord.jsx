import { Sparkles, Volume2, BookOpen } from "lucide-react";
import { useDailyWord } from "../hooks/useDailyWord.js";
import { speakWord } from "../utils/speech.js";

export default function DailyWord({ onSearch }) {
  const { dailyWord, loading, error } = useDailyWord();

  if (loading) {
    return (
      <div className="mx-4 sm:mx-6 mt-6 p-4 border border-(--border) rounded-xl bg-(--background) text-center">
        <p className="text-sm text-(--muted-foreground) animate-pulse">
          Loading word of the day...
        </p>
      </div>
    );
  }

  if (error || !dailyWord) return null;

  return (
    <div className="mx-4 sm:mx-6 mt-6 p-4 sm:p-5 border border-(--border) rounded-xl bg-(--background) shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-(--primary)" />
        <span className="text-xs font-semibold text-(--primary) uppercase tracking-wide">
          Word of the Day
        </span>
        <span className="ml-auto text-xs text-(--muted-foreground)">
          {dailyWord.date}
        </span>
      </div>

      {/* Word + phonetic */}
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <h3 className="text-2xl sm:text-3xl font-bold text-(--foreground) capitalize">
          {dailyWord.word}
        </h3>
        {dailyWord.phonetic && (
          <span className="text-sm text-(--muted-foreground) font-mono">
            {dailyWord.phonetic}
          </span>
        )}
        {/* Speak button */}
        <button
          onClick={() => speakWord(dailyWord.word)}
          className="flex items-center gap-1 text-xs text-(--muted-foreground) hover:text-(--primary) transition cursor-pointer"
        >
          <Volume2 size={14} />
          Listen
        </button>
      </div>

      {/* Meaning */}
      {dailyWord.meaning && (
        <p className="text-sm text-(--foreground) leading-relaxed mb-2">
          {dailyWord.meaning}
        </p>
      )}

      {/* Example */}
      {dailyWord.example && (
        <p className="text-sm text-(--muted-foreground) italic leading-relaxed mb-3">
          &quot;{dailyWord.example}&quot;
        </p>
      )}

      {/* Search button */}
      <button
        onClick={() => onSearch(dailyWord.word)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-(--primary) text-white hover:opacity-80 transition cursor-pointer font-medium"
      >
        <BookOpen size={13} />
        Explore this word
      </button>

    </div>
  );
}