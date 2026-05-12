import Link from "next/link";
import { Compass, Home, Search, ShoppingBag, Wrench } from "lucide-react";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";

const routeSuggestions = [
  { ...SITE_ROUTES.tools, icon: Wrench, description: "Browse all online tools" },
  { ...SITE_ROUTES.buySmart, icon: ShoppingBag, description: "Find stores and savings" },
  { ...SITE_ROUTES.blogs, icon: Compass, description: "Read guides and updates" },
  { label: "Search", href: "/search", icon: Search, description: "Search across AltFTool" },
];

export default function NotFound() {
  return (
    <div className="section flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-3xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) text-(--primary)">
          <Compass className="h-6 w-6" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-(--muted-foreground)">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-(--foreground) sm:text-4xl">
          This route does not exist
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
          The link may be old, moved, or typed incorrectly. Use one of the main paths below to continue.
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          {routeSuggestions.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 transition hover:border-(--primary) hover:bg-(--muted)"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-(--foreground)">
                  {label}
                </span>
                <span className="mt-1 block text-xs text-(--muted-foreground)">
                  {description}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-active)"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
