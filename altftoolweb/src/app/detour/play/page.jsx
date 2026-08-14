import Link from "next/link";
import { ArrowLeft, ArrowRight, Shield, Sparkles, Zap } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { ALTF_ORIGINALS } from "@altftool/core/detour";
import SiteCard from "../_components/SiteCard";
import { TOYS } from "./_toys/registry";

export const revalidate = 86400;

const description =
  "Fun, useless and quietly satisfying web toys built by AltFTool — Perfect Circle, Infinite Bubble Wrap, The Useless Switch, Do Nothing and more. Free, no sign-up, no trackers.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltF originals — web toys we built ourselves",
    description,
    path: "/detour/play",
    keywords: [
      "free web toys",
      "useless websites",
      "fun browser toys",
      "bubble wrap online",
      "perfect circle game",
      "do nothing timer",
    ],
  });
}

export default async function PlayIndexPage() {
  // Everything under /detour/play, plus the AltFTool experiences catalogued as
  // originals. Split visually because the toys are built for Detour and the
  // experiences are full products that happen to also be good detours.
  const experiences = ALTF_ORIGINALS.filter(
    (site) => !site.url.startsWith("/detour/play/"),
  );

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "AltF originals", path: "/detour/play" },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path: "/detour/play",
    name: "AltF originals",
    description,
  });

  const itemList = createItemListJsonLd({
    path: "/detour/play",
    name: "AltF originals",
    items: TOYS.map((toy) => ({
      name: toy.name,
      path: `/detour/play/${toy.slug}`,
    })),
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumb} />
      <JsonLd data={collectionPage} />
      {itemList ? <JsonLd data={itemList} /> : null}

      <Link
        href="/detour"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Detour
      </Link>

      <header className="mt-5 max-w-2xl">
        <p
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--dtr-accent-text)" }}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Built here
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          AltF originals
        </h1>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          Detours that do not leave the building. Every one of these is built and
          hosted by AltFTool, which means no redirect, no third-party trackers,
          and no chance of finding a parked domain where a website used to be.
        </p>
      </header>

      <ul className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <li className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          Loads instantly
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          <Shield className="h-3.5 w-3.5" aria-hidden="true" />
          No account, no trackers
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Runs entirely in your browser
        </li>
      </ul>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">
          Toys built for Detour
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOYS.map((toy) => (
            <li
              key={toy.slug}
              className="dtr-card relative flex flex-col rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-base font-semibold leading-snug">
                <Link
                  href={`/detour/play/${toy.slug}`}
                  className="dtr-card__link outline-none"
                >
                  {toy.name}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {toy.tagline}
              </p>
              <span
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--dtr-accent-text)" }}
              >
                Open
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {experiences.length ? (
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">
            Full AltFTool experiences
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Larger products that happen to also be excellent places to lose
            twenty minutes.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
