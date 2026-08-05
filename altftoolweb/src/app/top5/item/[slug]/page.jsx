import { notFound } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { getRanking, getAllRankingSlugs } from "../../data/rankings";
import RankedItemsList from "../../components/RankedItemsList";
import RankingHeader from "../../components/RankingHeader";
import HeadToHead from "../../components/HeadToHead";
import CompareTable from "../../components/CompareTable";
import HeroParallaxImage from "../../components/HeroParallaxImage";
import TabsBar from "../../components/TabsBar";
import { Reveal } from "../../components/motion";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateStaticParams() {
  return getAllRankingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const ranking = getRanking(slug);
  const path = `/top5/item/${encodeURIComponent(String(slug || ""))}`;

  return createPageMetadata({
    title: ranking?.title || "Top5 ranking not found",
    description: ranking?.description || "This Top5 ranking is not available.",
    path,
    noindex: true,
    follow: true,
  });
}

export default async function Top5ItemPage({ params }) {
  const { slug } = await params;
  const ranking = getRanking(slug);
  if (!ranking) notFound();

  return (
    <article>
      {/* Header */}
      <RankingHeader
        ranking={{
          slug: ranking.slug,
          category: ranking.category,
          title: ranking.title,
          description: ranking.description,
          updated: ranking.updated,
          reviewedBy: ranking.reviewedBy,
          readTime: ranking.readTime,
          entriesCount: ranking.items.length,
        }}
      />

      {/* Hero image with scroll parallax */}
      <HeroParallaxImage
        src={ranking.heroImage}
        alt={ranking.title}
        category={ranking.category}
        entries={ranking.items.length}
        readTime={ranking.readTime}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Intro / methodology teaser */}
        <div
          id="methodology"
          className="grid scroll-mt-20 gap-10 border-b border-border py-14 lg:grid-cols-[1fr_340px]"
        >
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-[#10b981]">
              {ranking.intro.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-[#0b1120] max-w-2xl">
              {ranking.intro.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-[#4b5563] leading-relaxed">
              {ranking.intro.paragraph}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="space-y-3 lg:pt-2">
              {ranking.intro.checklist.map((point) => (
                <li key={point} className="flex items-start gap-2 text-[#0b1120]">
                  <Check size={16} className="mt-1 shrink-0 text-[#10b981]" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Tabs */}
        <TabsBar />

        {/* Ranking */}
        <div id="ranking" className="pt-14 scroll-mt-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-[#10b981]">
              THE TOP5 INDEX
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0b1120]">
                The complete ranking.
              </h2>
              <p className="hidden sm:block text-sm text-[#9ca3af]">Scored out of 10</p>
            </div>
          </Reveal>
        </div>

        <RankedItemsList items={ranking.items} category={ranking.category} />

        {/* Compare */}
        <div id="compare" className="py-16 border-b border-black/10 scroll-mt-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-[#10b981]">
              COMPARE / AT A GLANCE
            </p>
            <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0b1120]">
                Five {ranking.category === "Education" ? "institutions" : "entries"}, side by side.
              </h2>
              <p className="text-[#6b7280] max-w-sm lg:text-right">
                Use this compact view to find the strongest fit for your
                priorities. Scores are based on our editorial testing
                framework.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <HeadToHead items={ranking.items} />
          </Reveal>
          <Reveal delay={0.15}>
            <CompareTable items={ranking.items} />
          </Reveal>
        </div>

        {/* Related */}
        <div id="related" className="py-16 scroll-mt-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-[#10b981]">RELATED</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-[#0b1120]">
              Keep exploring Top5.
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/top5/categories"
                className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-[#0b1120] hover:bg-[#f3f4f6] transition-colors"
              >
                Browse all categories
              </Link>
              <Link
                href="/top5"
                className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-[#0b1120] hover:bg-[#f3f4f6] transition-colors"
              >
                Back to Top5 home
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
