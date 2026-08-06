import Link from "next/link";
import { Camera, Video } from "lucide-react";
import { RouteChip } from "./Shell";

/*
 * The shot card.
 *
 * Two facts have to be readable before the title: whether this is a still or a
 * clip, and the weakest production route it will survive on. Those are the two
 * things that decide whether a reader can afford the frame, and "which frames
 * can I afford" is the question a production plan actually turns on.
 */
export default function ShotCard({ shot, href }) {
  const Icon = shot.kind === "video" ? Video : Camera;

  return (
    <Link
      href={href || `/persona/shots/${shot.slug}`}
      prefetch={false}
      className={`psn-card psn-stripe psn-sheet psn-route-${shot.minRoute} group flex flex-col gap-2 rounded-xl p-5 pl-6 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            className={`h-4 w-4 shrink-0 psn-kind-${shot.kind}`}
            aria-hidden="true"
          />
          <h3 className="truncate font-semibold text-foreground">{shot.title}</h3>
        </div>
        <RouteChip route={shot.route_} />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {shot.framing}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{shot.category_.label}</span>
        <span aria-hidden="true">·</span>
        <span>{shot.kind === "video" ? "Video" : "Still"}</span>
        {shot.niches?.length ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{shot.niches.length === 1 ? "Niche-specific" : "Few niches"}</span>
          </>
        ) : (
          <>
            <span aria-hidden="true">·</span>
            <span>Any niche</span>
          </>
        )}
      </div>
    </Link>
  );
}
