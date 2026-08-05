"use client";

/**
 * The compare tray — a sticky bottom strip listing everything queued for
 * comparison, mounted once for the whole vertical from `BazaarShell`.
 *
 * Notes on the choices here:
 *
 * - **Nothing renders before hydration or when the tray is empty.** The tray is
 *   per-visitor state; the prerendered HTML must not contain it, or the first
 *   client render disagrees with the server.
 * - **An in-flow spacer accompanies the fixed bar.** A `position: fixed` strip
 *   with no spacer eats the last ~4rem of every page, which at 360px means it
 *   sits on top of pagination and the last row of cards. The spacer is
 *   rendered by this component so the height can never drift from the bar's.
 * - **It hides itself on `/bazaar/compare`.** Repeating the selection directly
 *   under the comparison it produced is noise, and there the page itself owns
 *   removal.
 * - **`getListingById` is imported statically.** `AdCard` already pulls
 *   `data/listings` into the client bundle on every page that renders a card,
 *   so a dynamic import here would buy nothing on the pages that matter while
 *   adding an async flash to the tray.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, X } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import { getListingById } from "../data/listings";
import { useCompareHydrated, useCompareStore } from "../hooks/useCompareStore";

export default function CompareBar() {
  const hydrated = useCompareHydrated();
  const ids = useCompareStore((s) => s.ids);
  const removeCompare = useCompareStore((s) => s.removeCompare);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const pathname = usePathname();

  if (!hydrated) return null;
  if (pathname === "/bazaar/compare") return null;

  // Ids that no longer resolve are dropped rather than rendered as a blank
  // chip — a stale id is not an ad with no data.
  const items = ids.map((id) => getListingById(id)).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <>
      {/* Keeps the fixed strip from covering the bottom of the page. */}
      <div aria-hidden="true" className="h-20" />

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-(--border) bg-(--background)/95 backdrop-blur supports-[backdrop-filter]:bg-(--background)/85"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <section aria-label="Ads selected for comparison" className="section-container py-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5">
              {items.map((listing) => {
                const cover = listing.images?.[0];
                return (
                  <li
                    key={listing.id}
                    className="relative flex shrink-0 items-center gap-2 rounded-lg border border-(--border) bg-(--card) py-1 pe-7 ps-1"
                  >
                    {cover ? (
                      <ManagedImage
                        src={cover.src}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-md object-cover"
                      />
                    ) : (
                      <span className="h-9 w-9 rounded-md bg-(--muted)" />
                    )}

                    <span className="flex min-w-0 flex-col">
                      <span className="max-w-[8rem] truncate text-xs font-semibold text-(--foreground)">
                        {listing.title}
                      </span>
                      <span className="text-[11px] text-(--muted-foreground)">
                        {listing.priceLabel}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => removeCompare(listing.id)}
                      aria-label={`Remove ${listing.title} from compare`}
                      className="absolute top-1/2 end-0.5 -translate-y-1/2 rounded-full p-1 text-(--muted-foreground) hover:text-(--destructive) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex shrink-0 flex-col items-stretch gap-1">
              <Link
                href="/bazaar/compare"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-(--primary) px-3 py-1.5 text-xs font-bold text-(--primary-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
              >
                <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                Compare ({items.length})
              </Link>
              <button
                type="button"
                onClick={clearCompare}
                className="text-[11px] font-medium text-(--muted-foreground) underline underline-offset-2 hover:text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
              >
                Clear all
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
