import Link from "next/link";
import { cn } from "../../lib/utils";
import { SITE } from "../../lib/site";

export function Logo({ className, showText = true, href = "/imgprompt/studio" }) {
  const mark = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
          <path d="M12 2l2.4 6.2L21 10.5l-5.2 4 1.7 6.5L12 17.6 6.5 21l1.7-6.5-5.2-4 6.6-2.3L12 2z" fill="currentColor" opacity="0.95" />
        </svg>
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </span>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight">
          {SITE.name}
          <span className="text-primary">.</span>
        </span>
      )}
    </span>
  );

  if (href === null) return mark;
  return (
    <Link href={href} className="transition-opacity hover:opacity-90">
      {mark}
    </Link>
  );
}
