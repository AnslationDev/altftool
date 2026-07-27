import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import RelatedContentSection from "@/platform/linking/RelatedContentSection";
import { getRelatedContentForPreset } from "@/platform/linking/relatedContent";
import { ALTFTOOL_POSITION, INCUMBENTS } from "../data/incumbents";
import AlternativeToolEmbed from "../components/AlternativeToolEmbed";
import ComparisonTable from "../components/ComparisonTable";

export const dynamic = "force-static";
export const revalidate = 86400;

// Deferred on Amplify like every other family. These pages are only 23 URLs,
// but each prerenders to ~650 KB of .html + .rsc + segments — 15 MiB total,
// which is 7% of the 205 MiB artifact gate. ISR still caches them on first
// request, so deferring costs nothing but the first hit.
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return Object.keys(INCUMBENTS).map((incumbent) => ({ incumbent }));
}

function toolMeta(slug) {
  const meta = toolMetaMap[slug];
  if (!meta) return null;
  return {
    slug,
    name: meta.name || slug.replace(/-/g, " "),
    description: meta.description || "",
    href: `/tools/all/${slug}`,
  };
}

export async function generateMetadata({ params }) {
  const { incumbent } = await params;
  const entry = INCUMBENTS[incumbent];
  if (!entry) return {};

  const path = `/alternatives/${entry.slug}`;
  const short = entry.shortName || entry.name;
  return createPageMetadata({
    title: `Free ${short} Alternative — Runs In Your Browser`,
    description: `A straight comparison of AltFTool and ${entry.name}: free-tier limits, pricing, where files are processed, and what ${short} still does better. Includes a working tool on the page.`,
    path,
    canonical: path,
    keywords: [
      `${short} alternative`,
      `free ${short} alternative`,
      `${short} free tier limits`,
      `${short} vs AltFTool`,
      "browser based tools no upload",
    ],
  });
}

export default async function AlternativePage({ params }) {
  const { incumbent } = await params;
  const entry = INCUMBENTS[incumbent];

  if (!entry) {
    notFound();
  }

  const path = `/alternatives/${entry.slug}`;
  const short = entry.shortName || entry.name;
  const cards = entry.tools.map(toolMeta).filter(Boolean);
  const primary = toolMeta(entry.primaryTool);
  const steps = entry.migrationSteps
    .map((step) => ({ from: step.from, tool: toolMeta(step.to) }))
    .filter((step) => step.tool);
  const faqs = entry.faqs || [];

  const related = getRelatedContentForPreset(
    {
      href: path,
      title: `${short} alternative`,
      description: entry.valueProp,
      tags: [entry.category, short, entry.name, ...entry.tools],
      section: "alternatives",
    },
    "utility",
    { excludeHrefs: cards.map((card) => card.href) },
  );

  return (
    <main className="bg-(--page) text-(--foreground)">
      <JsonLd
        id={`alternative-${entry.slug}-schema`}
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Alternatives", path: "/alternatives" },
            { name: `${short} alternative`, path },
          ]),
          createItemListJsonLd({
            path,
            name: `AltFTool tools that replace ${short}`,
            items: cards.map((card) => ({ name: card.name, path: card.href })),
          }),
          // Hand-written questions only. Templated FAQ copy repeated across a
          // page family is exactly what Google treats as spam, so this emits
          // nothing when an entry has no curated FAQs.
          faqs.length
            ? createFaqJsonLd({
                path,
                questions: faqs.map((faq) => ({
                  question: faq.question,
                  answer: faq.answer,
                })),
              })
            : null,
        ]}
      />

      <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-5 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-(--muted-foreground)">
          <Link href="/alternatives" className="underline underline-offset-2 hover:text-(--primary-text)">
            Alternatives
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{short}</span>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {`A free ${short} alternative that runs in your browser`}
          </h1>
          <p className="mt-4 text-base leading-7 text-(--muted-foreground)">
            {entry.valueProp}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-[8px] border border-(--border) bg-(--surface) px-3 py-2 text-xs font-semibold text-(--primary-text)">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {entry.uploadsFiles
              ? "No upload — files are processed in this tab"
              : "Both tools process locally — see the honest comparison below"}
          </p>
        </header>

        {/* Live tool first: the fastest way to find out whether this actually
            solves your problem is to use it, not to read about it. */}
        {primary ? (
          <section aria-labelledby="try-it-heading" className="mt-10">
            <h2 id="try-it-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
              {`Try it now: ${primary.name}`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
              {primary.description}
            </p>
            <div className="mt-5 overflow-hidden rounded-[12px] border border-(--border) bg-(--card)">
              <AlternativeToolEmbed
                slug={primary.slug}
                toolName={primary.name}
                fallbackHref={primary.href}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
              This is the real tool, not a demo.{" "}
              <Link
                href={primary.href}
                className="font-semibold text-(--primary-text) underline underline-offset-2"
              >
                {`Open ${primary.name} on its own page`}
              </Link>
              .
            </p>
          </section>
        ) : null}

        <section aria-labelledby="comparison-heading" className="mt-12">
          <h2 id="comparison-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {`AltFTool vs ${short}`}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            {entry.summary}
          </p>
          <div className="mt-5">
            <ComparisonTable
              incumbentName={short}
              incumbent={entry.comparison}
              altftool={ALTFTOOL_POSITION}
            />
          </div>

          <h3 className="mt-8 text-base font-semibold tracking-tight">
            {`${short}'s free tier, in their own words`}
          </h3>
          <ul className="mt-3 grid list-none gap-2 p-0">
            {entry.freeTierLimits.map((limit) => (
              <li
                key={limit}
                className="rounded-[8px] border border-(--border) bg-(--surface) px-4 py-3 text-sm leading-6 text-(--muted-foreground)"
              >
                {limit}
              </li>
            ))}
          </ul>
          {entry.paidPrice ? (
            <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
              <span className="font-semibold text-(--foreground)">Paid pricing: </span>
              {entry.paidPrice}
            </p>
          ) : null}
          <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
            {`Checked on ${entry.checkedOn} against `}
            {entry.sourcesChecked.map((source, index) => (
              <span key={source}>
                {index > 0 ? ", " : ""}
                <a
                  href={source}
                  rel="nofollow noopener"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-(--primary-text)"
                >
                  {source.replace(/^https?:\/\//, "")}
                </a>
              </span>
            ))}
            {`. Vendors change their plans — if something here is out of date, trust ${short}'s own page over ours.`}
          </p>
        </section>

        {/* Never omitted. A comparison page that cannot name what the other
            product does better is an advert, not a comparison. */}
        <section aria-labelledby="incumbent-wins-heading" className="mt-12">
          <h2
            id="incumbent-wins-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            {`What ${short} does better`}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            {`Plenty of people should keep paying for ${short}, and these are the reasons why.`}
          </p>
          <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
            {entry.incumbentWins.map((win) => (
              <li
                key={win}
                className="rounded-[12px] border border-(--border) bg-(--surface) p-4 text-sm leading-6 text-(--muted-foreground)"
              >
                {win}
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-base font-semibold tracking-tight">
            And what AltFTool does not do
          </h3>
          <ul className="mt-3 grid list-none gap-2 p-0">
            {entry.altftoolLimits.map((limit) => (
              <li
                key={limit}
                className="rounded-[8px] border border-(--border) bg-(--background) px-4 py-3 text-sm leading-6 text-(--muted-foreground)"
              >
                {limit}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm leading-6 text-(--muted-foreground)">
            <a
              href={entry.homepage}
              rel="nofollow noopener"
              target="_blank"
              className="inline-flex items-center gap-1.5 font-semibold text-(--primary-text) underline underline-offset-2"
            >
              {`Visit ${short}`}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </p>
        </section>

        <section aria-labelledby="migration-heading" className="mt-12">
          <h2 id="migration-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {`Where each ${short} job goes here`}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            {`Left: what you clicked on ${short}. Right: the tool that does the same job here.`}
          </p>
          <ul className="mt-4 grid list-none gap-2 p-0">
            {steps.map((step) => (
              <li
                key={`${step.from}-${step.tool.slug}`}
                className="flex flex-col gap-2 rounded-[8px] border border-(--border) bg-(--surface) px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="text-sm text-(--muted-foreground) sm:w-1/2">
                  {step.from}
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-(--primary)"
                  aria-hidden="true"
                />
                <Link
                  href={step.tool.href}
                  className="text-sm font-semibold text-(--primary-text) underline underline-offset-2"
                >
                  {step.tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tools-heading" className="mt-12">
          <h2 id="tools-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {`The tools that cover ${short} work`}
          </h2>
          <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <li key={card.slug}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-[12px] border border-(--border) bg-(--surface) p-4 transition hover:-translate-y-0.5 hover:border-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) motion-reduce:transform-none"
                >
                  <span className="text-sm font-semibold text-(--foreground)">{card.name}</span>
                  <span className="mt-2 text-xs leading-5 text-(--muted-foreground)">
                    {card.description}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--primary-text)">
                    Open
                    <ArrowRight
                      className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {faqs.length ? (
          <section aria-labelledby="faq-heading" className="mt-12">
            <h2 id="faq-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
              Questions people actually ask
            </h2>
            <dl className="mt-4 grid list-none gap-3 p-0">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-[12px] border border-(--border) bg-(--surface) p-4"
                >
                  <dt className="text-sm font-semibold text-(--foreground)">{faq.question}</dt>
                  <dd className="mt-2 text-sm leading-6 text-(--muted-foreground)">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <RelatedContentSection
        eyebrow="Keep exploring"
        title="Related guides and tools"
        items={related}
        path={path}
        jsonLdName={`Related to the ${short} alternative guide`}
        id={`alternatives-${entry.slug}-related-heading`}
      />
    </main>
  );
}
