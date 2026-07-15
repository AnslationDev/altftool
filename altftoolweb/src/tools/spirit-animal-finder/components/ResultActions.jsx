import { RotateCcw, Share2 } from "lucide-react";

export default function ResultActions({ onRestart }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Spirit Animal Finder",
          text: "I found my spirit animal! Discover yours at ALTFTool.",
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
      <button
        onClick={onRestart}
        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition"
      >
        <RotateCcw className="h-4 w-4" />
        Take Quiz Again
      </button>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:border-[var(--primary)] transition"
      >
        <Share2 className="h-4 w-4" />
        Share Result
      </button>
    </div>
  );
}
