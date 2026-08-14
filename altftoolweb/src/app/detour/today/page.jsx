import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, Shield, Smartphone, Sparkles, Volume2 } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { ALL_SITES, getRelatedSites } from "@altftool/core/detour";
import {
  getCategory,
  getTimeBand,
  getVibe,
} from "@altftool/core/detour/taxonomy";
import { dateKey, pickForDate, recentPicks } from "@altftool/core/detour/daily";
import SiteCard from "../_components/SiteCard";

/*
 * One deliberate pick per day.
 *
 * Regenerated hourly rather than daily so the page turns over shortly after
 * midnight UTC without needing a scheduled job. The pick itself is a pure
 * function of the date, so a stale cache shows yesterday's answer for at most
 * an hour and never shows two people different things on the same day.
 */
export const revalidate = 3600;

function formatDate(key) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00Z`));
}

export async function generateMetadata() {
  const key = dateKey();
  const site = pickForDate(ALL_SITES, key);

  return createPageMetadata({
    title: site
      ? `Detour of the day: ${site.name}`
      : "Detour of the day — AltF Detour",
    description: site
      ? `${site.blurb} A new website worth your time, every day, chosen from ${ALL_SITES.length.toLocaleString("en-GB")} hand-sorted entries.`
      : "A new website worth your time, every day.",
    path: "/detour/today",
    keywords: [
      "website of the day",
      "detour of the day",
      "interesting website daily",
      "random website of the day",
    ],
  });
}

export default async function TodayPage() {
  const key = dateKey();
  const site = pickForDate(ALL_SITES, key);

  if (!site) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground">No pick available today.</p>
      </main>
    );
  }

  const category = getCategory(site.category);
  const band = getTimeBand(site.timeToJoy);
  const related = getRelatedSites(site, 4);
  const previous = recentPicks(ALL_SITES, 8).slice(1);
  const isOriginal = site.origin === "altf";

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "Detour of the day", path: "/detour/today" },
  ]);

  const facts = [
    { icon: Clock, label: band?.label ?? "—" },
    { icon: Shield, label: site.sfw ? "Safe for work" : "Not for the office" },
    { icon: Volume2, label: site.needsSound ? "Sound on" : "Works muted" },
    {
      icon: Smartphone,
      label: site.bestOn === "desktop" ? "Desktop only" : "Works on a phone",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumb} />

      <header className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(key)}
        </p>
        <h1
          className="mt-4 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--dtr-accent-text)" }}
        >
          Detour of the day
        </h1>
      </header>

      <section className="dtr-card relative mt-6 rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
        {isOriginal ? (
          <p
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{
              background: "var(--dtr-accent-soft)",
              color: "var(--dtr-accent-text)",
            }}
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            AltF original
          </p>
        ) : null}

        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
          {site.name}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {site.blurb}
        </p>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {facts.map((fact) => (
            <li
              key={fact.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
            >
              <fact.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {fact.label}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href={site.url}
            target={isOriginal ? undefined : "_blank"}
            rel={isOriginal ? undefined : "noopener noreferrer"}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
            style={{ background: "var(--dtr-accent)", color: "var(--dtr-accent-foreground)" }}
          >
            {isOriginal ? "Open it" : "Visit site"}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>

          <Link
            href={`/detour/site/${site.slug}`}
            className="inline-flex items-center rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            What is it?
          </Link>

          <Link
            href="/detour"
            className="inline-flex items-center rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Somewhere else
          </Link>
        </div>

        {category ? (
          <p className="mt-5 text-xs text-muted-foreground">
            Filed under{" "}
            <Link
              href={`/detour/category/${category.id}`}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              {category.name}
            </Link>
            {site.vibes.length ? (
              <>
                {" · "}
                {site.vibes
                  .map((id) => getVibe(id)?.label)
                  .filter(Boolean)
                  .join(", ")}
              </>
            ) : null}
          </p>
        ) : null}
      </section>

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-lg font-bold tracking-tight">
            If today&apos;s is not for you
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <SiteCard key={item.slug} site={item} />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-lg font-bold tracking-tight">Previously</h2>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {previous.map((entry) => (
            <li
              key={entry.key}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/detour/site/${entry.site.slug}`}
                  className="truncate text-sm font-medium underline-offset-2 hover:underline"
                >
                  {entry.site.name}
                </Link>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {entry.site.blurb}
                </p>
              </div>
              <time
                dateTime={entry.key}
                className="flex-shrink-0 font-mono text-[11px] text-muted-foreground"
              >
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  timeZone: "UTC",
                }).format(new Date(`${entry.key}T00:00:00Z`))}
              </time>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          The pick is derived from the date itself, so everybody sees the same
          site on the same day and yesterday&apos;s is always recoverable.
        </p>
      </section>
    </main>
  );
}
