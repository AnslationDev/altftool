import React from "react";
import { notFound } from "next/navigation";
import categoryData from "@/app/top11/data/categoryData";
import { isTop11Indexable } from "@/app/top11/data/indexPolicy";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import ManagedImage from "@/components/ui/ManagedImage";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return Object.keys(categoryData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = categoryData[slug];

  if (!data) {
    return {
      title: "Top11 Category Not Found",
      robots: { index: false, follow: true },
    };
  }

  // Count comes from the data. The old copy promised "the complete ranked
  // list" on pages that carry one or two entries.
  return createPageMetadata({
    title: data.title,
    description: `${data.description} ${data.tools.length} ${
      data.tools.length === 1 ? "option" : "options"
    } listed on AltFTool.`,
    path: `/top11/${slug}`,
    image: data.banner,
    // See data/indexPolicy.js: the category pages carry too little of their own
    // to rank against the vendors and review platforms on these queries, so
    // they are out of the index. They stay live, stay linked and stay followed.
    noindex: !isTop11Indexable(slug),
    follow: true,
  });
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const data = categoryData[slug];

  if (!data) notFound();

  const indexable = isTop11Indexable(slug);
  const relatedItems = getRelatedContentForPreset(
    {
      href: `/top11/${slug}`,
      title: data.title,
      description: data.description,
      tags: [
        ...slug.split("-"),
        ...data.tools.slice(0, 5).map((tool) => tool.name),
      ],
      section: "top11",
    },
    "editorial"
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <JsonLd
        id={`top11-schema-${slug}`}
        data={[
          // The ItemList mirrors the rendered <ol> exactly, and is emitted only
          // while the page is in the index. No Review or AggregateRating is
          // emitted at all: there is no rating data behind this page.
          indexable
            ? {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: data.title,
                description: data.description,
                numberOfItems: data.tools.length,
                itemListOrder: "https://schema.org/ItemListOrderDescending",
                itemListElement: data.tools.map((tool, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: tool.name,
                })),
              }
            : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top11", path: "/top11" },
            { name: data.title, path: `/top11/${slug}` },
          ]),
        ]}
      />

      {/* HERO BANNER */}
      <div className="relative w-full h-[260px] md:h-[360px] overflow-hidden">

        <ManagedImage
          src={data.banner || "/dealImg/deal1.png"}
          alt={data.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-center text-white">
          {/*
            A hardcoded "Last Updated: May 2026" used to sit here on all ten
            category pages. Nothing in categoryData carries a real review or
            update date, so no date is claimed.
          */}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {data.title}
          </h1>

          <p className="mt-4 text-lg opacity-90 max-w-2xl">
            {data.description}
          </p>

          <p className="mt-3 text-sm opacity-90 max-w-2xl">
            {data.tools.length}{" "}
            {data.tools.length === 1 ? "option is" : "options are"} listed on
            this page, in order.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 mt-10 grid md:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-6">

          {/*
            Real ordered-list markup, and no scores. Every tool used to render
            an invented 0-10 rating labelled "Excellent" plus an invented review
            count ("3,399 reviews"); none of those figures came from a source.
            They are removed rather than replaced.
          */}
          {/* role="list" is required: Safari/VoiceOver drops list semantics
              from any list styled `list-style: none`. */}
          <ol role="list" className="space-y-6 list-none p-0 m-0">
            {data.tools.map((tool, index) => (
              <li
                key={tool.name}
                className="bg-[var(--card)] text-[var(--card-foreground)] p-6 rounded-2xl shadow hover:shadow-md transition border border-[var(--border)]"
              >

                {/* TOP */}
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="w-9 h-9 shrink-0 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold"
                  >
                    {index + 1}
                  </span>

                  <h2 className="text-xl font-bold">{tool.name}</h2>
                </div>

                {/* FEATURES */}
                <ul className="mt-5 space-y-2">
                  {tool.features.map((f, i) => (
                    <li
                      key={i}
                      className="text-[var(--muted-foreground)] flex items-center gap-2"
                    >
                      <span aria-hidden="true" className="text-[var(--primary)]">
                        ✔
                      </span>{" "}
                      {f}
                    </li>
                  ))}
                </ul>

              </li>
            ))}
          </ol>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5">

          {/*
            This block previously carried a "Top10 Score" panel describing a
            scoring methodology that does not exist, and a "Secure Connection"
            panel asserting that every listed provider uses SSL to keep your
            data safe — a blanket security claim about third parties that
            AltFTool has not verified. Both are removed. What remains is the
            one thing this page can actually stand behind.
          */}
          <div className="bg-[var(--card)] text-[var(--card-foreground)] p-5 rounded-2xl shadow border border-[var(--border)]">
            <h2 className="font-bold text-lg mb-2">
              How is this list ordered?
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              These {data.tools.length}{" "}
              {data.tools.length === 1 ? "entry is" : "entries are"} listed in a
              fixed editorial order. AltFTool does not score, test or rate them,
              and no ranking signal is derived from user reviews.
            </p>
          </div>

        </div>

      </div>

      {/*
        The related band always renders: a noindexed page keeps its human
        navigation and keeps passing link equity to the routes that can rank.
        Only its ItemList markup drops away with the rest of the rich schema.
      */}
      <RelatedContentSection
        className="mt-12"
        title="Keep exploring AltFTool"
        items={relatedItems}
        path={`/top11/${slug}`}
        jsonLdName={indexable ? `Related to ${data.title}` : undefined}
      />
    </div>
  );
}
