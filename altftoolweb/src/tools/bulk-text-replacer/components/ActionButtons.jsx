export default function ActionButtons({ onReplace, onCopy }) {
  return (
    <div className="flex flex-wrap gap-3">
      
      {/* Primary Button */}
      <button
        onClick={onReplace}
        className="
          px-6 py-2.5 rounded-xl
          bg-(--primary)
          text-(--primary-foreground)
          font-medium
          hover:opacity-90
          active:scale-[0.98]
          transition-all cursor-pointer
        "
      >
        Replace Text
      </button>

      {/* Secondary Button */}
      <button
        onClick={onCopy}
        className="
          px-6 py-2.5 rounded-xl
          border border-(--border)
          bg-(--card)
          text-(--foreground)
          hover:bg-(--muted)
          active:scale-[0.98]
          transition-all cursor-pointer
        "
      >
        Copy Output
      </button>

    </div>
  );
}
