import { AlertCircle } from "lucide-react";

/**
 * Honest empty state for the news surfaces.
 *
 * The feed is fetched live from publisher RSS. When it is unavailable we show
 * this instead of placeholder articles — inventing stories, or attributing
 * invented stories to real publications, is never acceptable.
 */
export default function NewsUnavailable({
  title = "News is temporarily unavailable",
  description = "We could not load the live news feed right now. Please try again in a few minutes.",
}) {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-[640px] flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center"
    >
      <AlertCircle
        size={28}
        aria-hidden="true"
        className="text-[var(--muted-foreground)]"
      />
      <p className="text-base font-semibold text-[var(--foreground)]">{title}</p>
      <p className="max-w-[46ch] text-sm leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}
