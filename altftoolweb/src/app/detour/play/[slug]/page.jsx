import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import ToyHost from "../_toys/ToyHost";
import { TOYS, getToy } from "../_toys/registry";

export const revalidate = 86400;

export function generateStaticParams() {
  return TOYS.map((toy) => ({ slug: toy.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const toy = getToy(slug);
  if (!toy) {
    return createPageMetadata({
      title: "Not found",
      path: `/detour/play/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: toy.title,
    description: toy.description,
    path: `/detour/play/${toy.slug}`,
    keywords: toy.keywords,
  });
}

export default async function ToyPage({ params }) {
  const { slug } = await params;
  const toy = getToy(slug);
  if (!toy) notFound();

  const path = `/detour/play/${toy.slug}`;
  const others = TOYS.filter((item) => item.slug !== toy.slug).slice(0, 3);

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "AltF originals", path: "/detour/play" },
    { name: toy.name, path },
  ]);

  const howTo = createHowToJsonLd({
    path,
    name: `How to use ${toy.name}`,
    description: toy.description,
    steps: toy.how,
  });

  // WebApplication rather than VideoGame: these are browser toys with no
  // install, and the free/no-account offer is the part worth declaring.
  const application = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${absoluteUrl(path)}#app`,
    name: toy.name,
    url: absoluteUrl(path),
    description: toy.description,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumb} />
      {howTo ? <JsonLd data={howTo} /> : null}
      <JsonLd data={application} />

      <Link
        href="/detour/play"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All AltF originals
      </Link>

      <header className="mt-5 max-w-2xl">
        <p
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--dtr-accent-text)" }}
        >
          AltF original
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {toy.name}
        </h1>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          {toy.tagline}
        </p>
      </header>

      <section
        className={`mt-8 ${toy.fullWidth ? "" : "rounded-2xl border border-border bg-muted/30 p-4 sm:p-8"}`}
        aria-label={toy.name}
      >
        <ToyHost slug={toy.slug} />
      </section>

      {/* Crawlable prose. The toy itself is client-only, so without this the
          page has no indexable content beyond its heading. */}
      <section className="mt-12 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">How it works</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            {toy.how.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{
                    background: "var(--dtr-accent-soft)",
                    color: "var(--dtr-accent-text)",
                  }}
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold">About this one</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {toy.about}
          </p>
          <p className="mt-4 inline-flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
            <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>
              Built and hosted by AltFTool. Free, no account, no third-party
              trackers, and it runs entirely in your browser.
            </span>
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">More AltF originals</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {others.map((item) => (
            <li
              key={item.slug}
              className="dtr-card relative rounded-xl border border-border bg-card p-4"
            >
              <h3 className="text-sm font-semibold">
                <Link
                  href={`/detour/play/${item.slug}`}
                  className="dtr-card__link outline-none"
                >
                  {item.name}
                </Link>
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {item.tagline}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href="/detour"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
          style={{ color: "var(--dtr-accent-text)" }}
        >
          Take a random detour instead
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
