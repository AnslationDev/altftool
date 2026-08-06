import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import {
  SITES,
  getRelatedSites,
  getSite,
} from "@altftool/core/rabbithole";
import {
  COLLECTIONS,
  REVIEWED_ON,
  getCategory,
  getTimeBand,
} from "@altftool/core/rabbithole/taxonomy";
import SiteCard from "../../_components/SiteCard";
import SiteMark from "../../_components/SiteMark";
import PageHeader from "../../_components/PageHeader";
import SectionHeading from "../../_components/SectionHeading";
import {
  accessLabel,
  categoryStyle,
  deviceLabel,
  timeLabel,
  vibeLabel,
} from "../../_lib/presentation";

export const dynamicParams = false;

export function generateStaticParams() {
  return SITES.map((site) => ({ slug: site.slug }));
}

/** Written from the record, so the answers can never contradict the filters. */
function buildFaqs(site, category) {
  const band = getTimeBand(site.timeToJoy);

  return [
    {
      question: `Is ${site.name} free?`,
      answer: site.free
        ? site.needsAccount
          ? `${site.name} is free to use, but you need to create an account before you can do much with it.`
          : `Yes. ${site.name} is free and does not ask you to register or hand over an email address before you can use it.`
        : `${site.name} is a paid product, though there is usually enough available without paying to see whether it suits you.`,
    },
    {
      question: `How long does ${site.name} take?`,
      answer: `${band?.hint || "It varies."} We file it under "${band?.label || site.timeToJoy}" — ${site.blurb.charAt(0).toLowerCase()}${site.blurb.slice(1)}.`,
    },
    {
      question: `Does ${site.name} work on a phone?`,
      answer:
        site.bestOn === "desktop"
          ? `${site.name} really wants a mouse and a wide window. It will load on a phone, but the experience is built for desktop.`
          : site.bestOn === "mobile"
            ? `${site.name} is designed for a touchscreen and is best opened on a phone.`
            : `Yes. ${site.name} works on a phone as well as it does on a laptop.`,
    },
    {
      question: `What kind of site is ${site.name}?`,
      answer: `We list it under ${category.name} — ${category.blurb.toLowerCase().replace(/\.$/, "")}. ${site.whyItsGood}`,
    },
  ];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site) {
    return createPageMetadata({
      title: "Site not found",
      path: `/rabbithole/site/${slug}`,
      noindex: true,
    });
  }

  const category = getCategory(site.category);

  return createPageMetadata({
    title: `${site.name} — ${site.blurb}`,
    description: `${site.blurb}. ${site.description.slice(0, 150)}`,
    path: `/rabbithole/site/${site.slug}`,
    keywords: [
      site.name,
      `${site.name} review`,
      `what is ${site.name}`,
      `sites like ${site.name}`,
      category?.name,
      "interesting websites",
    ].filter(Boolean),
  });
}

export default async function SiteDetailPage({ params }) {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site) notFound();

  const category = getCategory(site.category);
  const band = getTimeBand(site.timeToJoy);
  const related = getRelatedSites(site, 6);
  const faqs = buildFaqs(site, category);
  const path = `/rabbithole/site/${site.slug}`;

  const altf = site.altfAlternative
    ? EXPERIENCE_CATALOG.find((item) => item.slug === site.altfAlternative)
    : null;

  const memberOf = COLLECTIONS.filter((collection) => collection.rule(site));

  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: category.name, path: `/rabbithole/category/${category.id}` },
    { name: site.name, path },
  ];

  // WebPage about a third-party WebSite. Deliberately not Review/AggregateRating:
  // there are no ratings behind this, and inventing them to chase a rich result
  // is the exact thing that gets structured data ignored.
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: `${site.name} — ${site.blurb}`,
    description: site.description,
    // The date the link was last verified. Worth emitting: a visible, machine-
    // readable freshness signal is one of the few things that measurably moves
    // how a page is ranked by retrieval systems.
    dateModified: REVIEWED_ON.iso,
    isPartOf: { "@type": "CollectionPage", "@id": `${absoluteUrl("/rabbithole")}#collection` },
    about: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
      description: site.description,
      ...(site.year ? { dateCreated: String(site.year) } : {}),
      ...(site.free
        ? { isAccessibleForFree: true }
        : { isAccessibleForFree: false }),
    },
    significantLink: related.map((item) =>
      absoluteUrl(`/rabbithole/site/${item.slug}`),
    ),
  };

  return (
    <div className="rh-toned bg-background" style={categoryStyle(site.category)}>
      <JsonLd
        id={`rabbithole-site-${site.slug}`}
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          pageJsonLd,
          createFaqJsonLd({ path, questions: faqs }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow={category.name}
        toned
        title={site.name}
        lede={site.blurb}
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={site.url}
            target="_blank"
            rel="noopener"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--anslation-ds-radius-pill)] bg-[var(--rh-hue)] px-5 text-sm font-semibold text-[var(--rh-mark-ink)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rh-hue)]"
          >
            Visit {site.host}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href={`/rabbithole/category/${category.id}`}
            className="inline-flex h-11 items-center rounded-[var(--anslation-ds-radius-pill)] border border-border px-5 text-sm font-medium text-foreground transition hover:border-[var(--rh-hue)]"
          >
            More {category.name}
          </Link>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <div className="rh-detail-head flex flex-wrap items-center gap-4 p-5 sm:p-6">
              <SiteMark site={site} size="xl" />
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{site.host}</p>
                <p className="mt-1 text-lg font-medium text-foreground">
                  {band?.label} · {deviceLabel(site.bestOn)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {accessLabel(site)}
                  {site.year ? ` · online since ${site.year}` : ""}
                </p>
              </div>
            </div>

            <section className="mt-9">
              <h2 className="text-lg font-semibold text-foreground">
                What {site.name} actually is
              </h2>
              <p className="mt-2.5 text-pretty leading-relaxed text-muted-foreground">
                {site.description}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">
                Why it is worth your time
              </h2>
              <blockquote
                className="mt-2.5 border-l-2 pl-4 text-pretty leading-relaxed text-foreground"
                style={{ borderColor: "var(--rh-hue)" }}
              >
                {site.whyItsGood}
              </blockquote>
            </section>

            {altf ? (
              <section className="mt-8">
                <div
                  className="rounded-[var(--anslation-ds-radius-xl)] border p-5"
                  style={{
                    borderColor: "var(--rh-hue-ring)",
                    background: "var(--rh-hue-soft)",
                  }}
                >
                  <p className="rh-eyebrow flex items-center gap-1.5" style={{ color: "var(--rh-hue)" }}>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    We built one too
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">
                    {altf.name}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {altf.tagline || altf.description}
                  </p>
                  <Link
                    href={altf.href}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--rh-hue)] underline-offset-4 hover:underline"
                  >
                    {altf.cta || `Open ${altf.name}`}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </section>
            ) : null}

            <section className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">
                Common questions
              </h2>
              <dl className="mt-3 divide-y divide-border border-y border-border">
                {faqs.map((faq) => (
                  <div key={faq.question} className="py-4">
                    <dt className="text-sm font-semibold text-foreground">
                      {faq.question}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <aside aria-label="At a glance" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
            <h2 className="rh-eyebrow mb-3">At a glance</h2>
            <dl className="rh-meta rounded-[var(--anslation-ds-radius-xl)] border border-border px-4">
              <div className="rh-meta__row">
                <dt className="rh-meta__key">Category</dt>
                <dd>
                  <Link
                    href={`/rabbithole/category/${category.id}`}
                    className="text-[var(--rh-hue)] underline-offset-4 hover:underline"
                  >
                    {category.name}
                  </Link>
                </dd>
              </div>
              <div className="rh-meta__row">
                <dt className="rh-meta__key">Time</dt>
                <dd className="text-foreground">{timeLabel(site.timeToJoy)}</dd>
              </div>
              <div className="rh-meta__row">
                <dt className="rh-meta__key">Vibe</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {/* Links, not labels — the vibe pages are a real surface and
                      this is their main route in from a detail page. */}
                  {site.vibes.map((vibe) => (
                    <Link
                      key={vibe}
                      href={`/rabbithole/vibe/${vibe}`}
                      className="rh-chip rh-chip--toned transition hover:opacity-80"
                    >
                      {vibeLabel(vibe)}
                    </Link>
                  ))}
                </dd>
              </div>
              <div className="rh-meta__row">
                <dt className="rh-meta__key">Device</dt>
                <dd className="text-foreground">{deviceLabel(site.bestOn)}</dd>
              </div>
              <div className="rh-meta__row">
                <dt className="rh-meta__key">Access</dt>
                <dd className="text-foreground">{accessLabel(site)}</dd>
              </div>
              {site.year ? (
                <div className="rh-meta__row">
                  <dt className="rh-meta__key">Since</dt>
                  <dd className="text-foreground">{site.year}</dd>
                </div>
              ) : null}
              <div className="rh-meta__row">
                <dt className="rh-meta__key">Checked</dt>
                <dd className="text-foreground">
                  <time dateTime={REVIEWED_ON.iso}>{REVIEWED_ON.label}</time>
                </dd>
              </div>
            </dl>

            {memberOf.length ? (
              <div className="mt-6">
                <h2 className="rh-eyebrow mb-3">Appears in</h2>
                <ul className="flex flex-wrap gap-1.5">
                  {memberOf.map((collection) => (
                    <li key={collection.id}>
                      <Link
                        href={`/rabbithole/collections/${collection.id}`}
                        className="rh-chip transition hover:border-[var(--rh-hue)] hover:text-foreground"
                      >
                        {collection.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        {related.length ? (
          <section className="mt-14 border-t border-border pt-10">
            <SectionHeading
              eyebrow="Keep going"
              title={`If you liked ${site.name}`}
              description="Picked for a shared category and overlapping vibe, not for popularity."
              href="/rabbithole/browse"
              linkLabel="Browse everything"
            />
            <div className="rh-grid">
              {related.map((item) => (
                <SiteCard key={item.slug} site={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
