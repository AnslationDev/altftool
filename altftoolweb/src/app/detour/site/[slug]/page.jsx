import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock,
  Minus,
  Shield,
  Smartphone,
  Sparkles,
  Volume2,
} from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  getCategory,
  getFamily,
  getTimeBand,
  getVibe,
} from "@altftool/core/detour/taxonomy";
import { ALL_SITES, getRelatedSites, getSite } from "@altftool/core/detour";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import SiteCard from "../../_components/SiteCard";

export const revalidate = 86400;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return ALL_SITES.map((site) => ({ slug: site.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site) {
    return createPageMetadata({
      title: "Not found",
      path: `/detour/site/${slug}`,
      noindex: true,
    });
  }

  const category = getCategory(site.category);
  const band = getTimeBand(site.timeToJoy);

  return createPageMetadata({
    title: `${site.name} — ${category?.name ?? "Detour"}`,
    description: `${site.blurb} ${band ? `Worth about ${band.label.toLowerCase()}.` : ""} Free, reviewed and catalogued on AltF Detour.`.trim(),
    path: `/detour/site/${site.slug}`,
    keywords: [
      site.name,
      `${site.name} website`,
      category?.name ?? "",
      ...site.vibes.map((vibe) => `${vibe} websites`),
    ].filter(Boolean),
  });
}

/** One practical fact, rendered so the on/off state is never colour-only. */
function Fact({ icon: FactIcon, label, value, positive }) {
  return (
    <div className="flex items-start gap-2.5">
      <FactIcon
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="flex items-center gap-1 text-sm font-medium">
          {positive === true ? (
            <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          ) : positive === false ? (
            <Minus className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          ) : null}
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function SitePage({ params }) {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site) notFound();

  const category = getCategory(site.category);
  const family = category ? getFamily(category.family) : null;
  const band = getTimeBand(site.timeToJoy);
  const related = getRelatedSites(site, 8);
  const isOriginal = site.origin === "altf";
  const path = `/detour/site/${site.slug}`;

  const breadcrumb = createBreadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Detour", path: "/detour" },
      category
        ? { name: category.name, path: `/detour/category/${category.id}` }
        : null,
      { name: site.name, path },
    ].filter(Boolean),
  );

  const relatedList = createItemListJsonLd({
    path,
    name: `Sites like ${site.name}`,
    items: related.map((item) => ({
      name: item.name,
      path: `/detour/site/${item.slug}`,
    })),
  });

  // The page is a review of a thing that lives elsewhere, so the primary entity
  // is the site itself. `sameAs` points at the real URL rather than `url`,
  // which stays on the page describing it — that is the distinction schema.org
  // draws and it keeps the canonical unambiguous.
  const entity = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl(path)}#site`,
    name: site.name,
    url: site.url.startsWith("/") ? absoluteUrl(site.url) : site.url,
    description: site.blurb,
    isAccessibleForFree: site.free,
    ...(category ? { genre: category.name } : {}),
    ...(typeof site.year === "number"
      ? { datePublished: String(site.year) }
      : {}),
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumb} />
      <JsonLd data={entity} />
      {relatedList ? <JsonLd data={relatedList} /> : null}

      <Link
        href={category ? `/detour/category/${category.id}` : "/detour/browse"}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {category ? category.name : "Browse all"}
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <header>
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

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {site.name}
            </h1>

            <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
              {site.blurb}
            </p>
          </header>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={site.url}
              target={isOriginal ? undefined : "_blank"}
              rel={isOriginal ? undefined : "noopener noreferrer"}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
              style={{ background: "var(--dtr-accent)", color: "var(--dtr-accent-foreground)" }}
            >
              {isOriginal ? "Open it" : "Visit site"}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <Link
              href="/detour"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Somewhere else
            </Link>
          </div>

          {!isOriginal ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Opens in a new tab. We do not control this site and it may have
              changed since we catalogued it.
            </p>
          ) : null}

          {/* --------------------------------------------------- context --- */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold">What kind of thing is this?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {site.name} sits in{" "}
              {category ? (
                <Link
                  href={`/detour/category/${category.id}`}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {category.name}
                </Link>
              ) : (
                "the directory"
              )}
              {family ? ` under ${family.name}` : ""}
              {band ? (
                <>
                  , and we have it filed as{" "}
                  <Link
                    href={`/detour/time/${band.id}`}
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    {band.label.toLowerCase()}
                  </Link>{" "}
                  — {band.hint.toLowerCase()}
                </>
              ) : null}
              {site.vibes.length ? (
                <>
                  {" "}
                  It reads as{" "}
                  {site.vibes.map((vibeId, index) => {
                    const vibe = getVibe(vibeId);
                    if (!vibe) return null;
                    return (
                      <span key={vibeId}>
                        {index > 0
                          ? index === site.vibes.length - 1
                            ? " and "
                            : ", "
                          : ""}
                        <Link
                          href={`/detour/vibes/${vibe.id}`}
                          className="font-medium text-foreground underline-offset-2 hover:underline"
                        >
                          {vibe.label.toLowerCase()}
                        </Link>
                      </span>
                    );
                  })}
                  .
                </>
              ) : null}
            </p>

            {category ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {category.intro}
              </p>
            ) : null}
          </section>
        </div>

        {/* ------------------------------------------------------- facts --- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">At a glance</h2>

            <div className="mt-4 space-y-4">
              <Fact
                icon={Clock}
                label="Time to be worth it"
                value={band ? band.label : "—"}
              />
              <Fact
                icon={Shield}
                label="At a desk"
                value={site.sfw ? "Safe for work" : "Not for the office"}
                positive={site.sfw}
              />
              <Fact
                icon={Volume2}
                label="Sound"
                value={site.needsSound ? "Needs sound" : "Works muted"}
                positive={!site.needsSound}
              />
              <Fact
                icon={Smartphone}
                label="Device"
                value={
                  site.bestOn === "both"
                    ? "Phone and desktop"
                    : site.bestOn === "mobile"
                      ? "Best on a phone"
                      : "Desktop only"
                }
                positive={site.bestOn !== "desktop"}
              />
              <Fact
                icon={Check}
                label="Cost"
                value={site.free ? "Free" : "Paid or freemium"}
                positive={site.free}
              />
              <Fact
                icon={Check}
                label="Account"
                value={site.needsAccount ? "Sign-up required" : "No sign-up"}
                positive={!site.needsAccount}
              />
              {typeof site.year === "number" ? (
                <Fact icon={Clock} label="Around since" value={String(site.year)} />
              ) : null}
            </div>

            {site.vibes.length ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Mood</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {site.vibes.map((vibeId) => {
                    const vibe = getVibe(vibeId);
                    if (!vibe) return null;
                    return (
                      <li key={vibeId}>
                        <Link
                          href={`/detour/vibes/${vibe.id}`}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:bg-muted"
                        >
                          <span aria-hidden="true">{vibe.emoji}</span>
                          {vibe.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------- related --- */}
      {related.length ? (
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">
            If you liked that
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <SiteCard key={item.slug} site={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
