import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, Shuffle, Sparkles } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  BRAND,
  CATEGORIES_BY_FAMILY,
  COLLECTIONS,
  TIME_BANDS,
  VIBES,
} from "@altftool/core/detour/taxonomy";
import {
  ACCLAIMED,
  ALTF_ORIGINALS,
  FACETS,
  STATS,
} from "@altftool/core/detour";
import DetourHero from "./_components/DetourHero";
import SiteCard from "./_components/SiteCard";
import Icon from "./_components/Icon";
import SearchBox from "./_components/SearchBox";
import VisitTrail from "./_components/VisitTrail";

export const revalidate = 86400;

const description =
  "One button, one random website worth your time. Plus a hand-sorted directory of the internet's best strange, beautiful and genuinely useful corners — filtered by how long you have got.";

/*
 * FAQ copy doubles as the answer surface for generative engines. Each answer is
 * written to stand alone if it is lifted out of the page, which is the only
 * form an AI answer will ever quote it in.
 */
const FAQS = [
  {
    question: "What is AltF Detour?",
    answer:
      "AltF Detour is a directory of websites worth taking a wrong turn for, with a button that picks one at random. It catalogues thousands of hand-sorted sites across 91 categories — games, generative toys, live maps, archives, explainers and the gloriously pointless — and sorts them by how long each one takes to be worth it. It is free, needs no account, and is built by AltFTool.",
  },
  {
    question: "How is this different from The Useless Web or bored.com?",
    answer:
      "The Useless Web is one button with no way to steer it, and bored.com is a long list with no way to tell what a link will cost you. Detour does both and adds the missing information: every entry says how long it takes to pay off, whether it is safe to open at a desk, whether it needs sound, and whether it works on a phone. You can press the button blind or filter first.",
  },
  {
    question: "Is AltF Detour free?",
    answer:
      "Yes. Every page, the full directory and all of the AltF originals are free with no account and no email address. There is nothing behind a sign-up.",
  },
  {
    question: "What are AltF originals?",
    answer:
      "AltF originals are the detours we built ourselves, hosted on AltFTool — things like Perfect Circle, Infinite Bubble Wrap, The Useless Switch and Do Nothing. They load fast, carry no third-party trackers, and are the only entries in the catalog we can promise are still online, so the random button reaches for them slightly more often than their share of the directory.",
  },
  {
    question: "How are the sites chosen and sorted?",
    answer:
      "Every entry is placed by hand into one of 91 categories, tagged with up to three moods, and given a time band: instant, a minute, a coffee break, or a rabbit hole. It also records whether the site is safe for work, needs sound, needs an account and works on mobile. Nothing is ranked by popularity, because popularity is how the interesting parts of the web got buried in the first place.",
  },
  {
    question: "Can I suggest a website?",
    answer:
      "Yes — the submit page takes suggestions. The bar is simple: it has to be worth somebody's time and it has to still be online. Personal projects and one-page oddities are especially welcome.",
  },
  {
    question: "Will the button open the site in a new tab?",
    answer:
      "External sites open in a new tab so Detour stays where it is and you can press the button again straight away. AltF originals open in the same tab, because they are part of the same site.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltF Detour — take me to a website worth my time",
    description,
    path: "/detour",
    keywords: [
      "useless websites",
      "random website generator",
      "things to do when bored",
      "interesting websites",
      "cool websites",
      "fun websites",
      "best websites on the internet",
      "random website button",
    ],
  });
}

function SectionHeading({ eyebrow, title, href, linkLabel }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--dtr-accent-text)" }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
          style={{ color: "var(--dtr-accent-text)" }}
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export default async function DetourHomePage() {
  const originals = ALTF_ORIGINALS.slice(0, 8);
  const famous = ACCLAIMED.slice(0, 8);

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path: "/detour",
    name: BRAND.name,
    description: BRAND.elevator,
  });

  const categoryList = createItemListJsonLd({
    path: "/detour",
    name: "Detour categories",
    items: CATEGORIES_BY_FAMILY.flatMap((family) =>
      family.categories.map((category) => ({
        name: category.name,
        path: `/detour/category/${category.id}`,
      })),
    ),
  });

  const faq = createFaqJsonLd({ path: "/detour", questions: FAQS });

  const stats = [
    { value: STATS.sites.toLocaleString("en-GB"), label: "Sites catalogued" },
    { value: String(STATS.categories), label: "Categories" },
    { value: String(STATS.originals), label: "AltF originals" },
    { value: String(STATS.collections), label: "Curated collections" },
  ];

  return (
    <main>
      <JsonLd data={breadcrumb} />
      <JsonLd data={collectionPage} />
      {categoryList ? <JsonLd data={categoryList} /> : null}
      {faq ? <JsonLd data={faq} /> : null}

      {/* ---------------------------------------------------------- hero --- */}
      <section className="dtr-dots border-b border-border">
        <div className="mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              {BRAND.tagline}
            </p>
            <Link
              href="/detour/today"
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
              style={{
                borderColor: "var(--dtr-accent)",
                color: "var(--dtr-accent-text)",
              }}
            >
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Today&apos;s pick
            </Link>
          </div>

          <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
            The good internet is
            <br className="hidden sm:block" /> still out there.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            {STATS.sites.toLocaleString("en-GB")} websites worth a wrong turn,
            sorted by how long each one takes to be worth it. Press the button,
            or steer it first.
          </p>

          <div className="mt-10">
            <Suspense fallback={<div className="h-56" aria-hidden="true" />}>
              <DetourHero />
            </Suspense>
          </div>

          {/* The button is for people with no particular destination in mind.
              Plenty of visitors arrive knowing exactly what they want, and
              making them find the browse page first would be rude. */}
          <div className="mx-auto mt-10 max-w-md">
            <Suspense
              fallback={
                <div
                  className="h-12 rounded-xl border border-border bg-card"
                  aria-hidden="true"
                />
              }
            >
              <SearchBox placeholder={`Search ${STATS.sites.toLocaleString("en-GB")} sites…`} />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <VisitTrail />
          </Suspense>

          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-3"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-mono text-xl font-bold sm:text-2xl">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-14 sm:px-6 sm:py-16">
        {/* ------------------------------------------------------- moods --- */}
        <section>
          <SectionHeading
            eyebrow="Start with a feeling"
            title="What are you in the mood for?"
            href="/detour/browse"
            linkLabel="Browse everything"
          />

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {VIBES.map((vibe, index) => (
              <li key={vibe.id}>
                <Link
                  href={`/detour/vibes/${vibe.id}`}
                  className="dtr-tile flex h-full flex-col justify-between rounded-xl p-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--dtr-accent)]"
                  style={{
                    background: `var(--dtr-tile-${(index % 6) + 1})`,
                  }}
                >
                  <span className="dtr-tile__emoji" aria-hidden="true">
                    {vibe.emoji}
                  </span>
                  <span className="mt-2 block text-sm font-semibold">
                    {vibe.label}
                  </span>
                  <span className="text-[11px] opacity-70">
                    {FACETS.vibe[vibe.id]} sites
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* -------------------------------------------------------- time --- */}
        <section>
          <SectionHeading
            eyebrow="Start with a clock"
            title="How much time do you actually have?"
          />

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TIME_BANDS.map((band) => (
              <li
                key={band.id}
                className="dtr-card relative rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-base font-semibold">
                  <Link
                    href={`/detour/time/${band.id}`}
                    className="dtr-card__link outline-none"
                  >
                    {band.label}
                  </Link>
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {band.hint}
                </p>
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  {FACETS.timeToJoy[band.id]} sites
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------------------------------------- originals --- */}
        <section>
          <SectionHeading
            eyebrow="Built here"
            title="AltF originals"
            href="/detour/play"
            linkLabel={`All ${STATS.originals}`}
          />
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Detours that do not leave the building. No redirect, no third party,
            no tracking you off-site — and they are still online, which is more
            than the rest of this list can promise.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {originals.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </ul>
        </section>

        {/* -------------------------------------------------- categories --- */}
        <section>
          <SectionHeading
            eyebrow={`${STATS.categories} topics`}
            title="Everything, by subject"
            href="/detour/categories"
            linkLabel="All categories"
          />

          <div className="mt-6 space-y-6">
            {CATEGORIES_BY_FAMILY.map((family) => (
              <div key={family.id}>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name={family.icon} className="h-4 w-4" />
                  {family.name}
                  <span className="font-mono text-xs font-normal text-muted-foreground">
                    {FACETS.family[family.id]}
                  </span>
                </h3>

                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {family.categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/detour/category/${category.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs transition-colors hover:border-[var(--dtr-accent)] hover:bg-muted"
                      >
                        {category.name}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {FACETS.category[category.id]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------- collections --- */}
        <section>
          <SectionHeading
            eyebrow="Cut a different way"
            title="Collections"
            href="/detour/collections"
            linkLabel="All collections"
          />

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((collection) => (
              <li
                key={collection.id}
                className="dtr-card relative rounded-xl border border-border bg-card p-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Icon
                    name={collection.icon}
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: "var(--dtr-accent)" }}
                  />
                  <Link
                    href={`/detour/collections/${collection.id}`}
                    className="dtr-card__link outline-none"
                  >
                    {collection.name}
                  </Link>
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {collection.blurb}
                </p>
                <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                  {FACETS.collection[collection.id]} sites
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ----------------------------------------------------- famous --- */}
        {famous.length ? (
          <section>
            <SectionHeading
              eyebrow="If you only open ten"
              title="Hall of fame"
              href="/detour/collections/hall-of-fame"
              linkLabel="See all"
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {famous.map((site) => (
                <SiteCard key={site.slug} site={site} />
              ))}
            </ul>
          </section>
        ) : null}

        {/* -------------------------------------------------------- FAQ --- */}
        <section>
          <SectionHeading eyebrow="Questions" title="About Detour" />

          <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
            {FAQS.map((faqItem) => (
              <div key={faqItem.question} className="p-5">
                <dt className="text-sm font-semibold">{faqItem.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faqItem.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ------------------------------------------------------ outro --- */}
        <section className="rounded-2xl border border-border bg-muted/40 p-6 text-center sm:p-10">
          <Sparkles
            className="mx-auto h-6 w-6"
            style={{ color: "var(--dtr-accent)" }}
            aria-hidden="true"
          />
          <h2 className="mt-3 text-xl font-bold sm:text-2xl">
            Know somewhere that belongs here?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The bar is simple: it has to be worth somebody&apos;s time, and it has
            to still be online.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/detour/submit"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: "var(--dtr-accent)", color: "var(--dtr-accent-foreground)" }}
            >
              Suggest a site
            </Link>
            <Link
              href="/detour/about"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-card"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              How Detour works
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
