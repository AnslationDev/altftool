"use client";

import { Check, ChevronRight, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { rankings } from "../../data/mock-data";
import ImageWithFallback from "../ui/ImageWithFallback";
import SaveButton from "../ui/SaveButton";
import SectionHeading from "../ui/SectionHeading";
import TrendingCard from "../TrendingCard";
import RankingEntry from "./RankingEntry";

const METHOD_POINTS = [
  "Product capability and reliability",
  "Ease of use and interaction quality",
  "Value across real workflows",
  "Momentum and responsible development",
];

const TIMELINE = [
  ["Jan 2026", "Category scan", "We mapped 86 products across the global landscape."],
  ["Feb 2026", "Hands-on testing", "Editors tested core workflows with a common evaluation set."],
  ["Mar 2026", "Expert review", "Independent practitioners challenged our early conclusions."],
  ["Mar 18", "Publication", "Scores and analysis were finalized for this edition."],
];

const TABS = ["Ranking", "Compare", "Methodology", "Related"];

export default function RankingDetailPage({ ranking, entries, subjectLabel, categorySlug }) {
  const [tab, setTab] = useState("Ranking");
  const [notice, setNotice] = useState("");
  const related = rankings.filter((item) => item.slug !== ranking.slug).slice(0, 3);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("Link copied");
    } catch {
      setNotice("Copy failed");
    }
    window.setTimeout(() => setNotice(""), 1800);
  };

  return (
    <main className="pb-24">
      {/* Breadcrumbs */}
      <div className="px-5 pt-8 md:px-10 xl:px-16">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-[1536px] items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/top11" className="hover:text-slate-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/top11/category/${categorySlug}`} className="hover:text-slate-900">{ranking.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700">2026 ranking</span>
        </nav>
      </div>

      {/* ─── Hero ─── */}
      <section className="px-5 pb-12 pt-14 md:px-10 md:pb-16 md:pt-20 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <div className="grid gap-10 lg:grid-cols-[1fr_430px] lg:items-end">
            <div>
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                {ranking.category} / Definitive ranking
              </p>
              <h1 className="max-w-5xl text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.065em] text-slate-950 md:text-8xl">
                {ranking.title}
              </h1>
            </div>
            <div>
              <p className="text-base leading-7 text-slate-600">
                {ranking.description} Every entry is independently evaluated for capability, experience, accessibility, and lasting relevance.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <SaveButton label="Save ranking" />
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold hover:border-slate-400"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 border-y border-slate-200 py-5 text-xs text-slate-500 sm:grid-cols-4">
            <span><strong className="block text-slate-900">Updated</strong>March 18, 2026</span>
            <span><strong className="block text-slate-900">Reviewed by</strong>Top11 Research</span>
            <span><strong className="block text-slate-900">Read time</strong>18 minutes</span>
            <span><strong className="block text-slate-900">Entries</strong>{entries.length}</span>
          </div>
        </div>
      </section>

      {/* Hero image */}
      <div className="mx-auto max-w-[1800px]">
        <ImageWithFallback src={ranking.image} alt={ranking.title} eager className="h-[420px] md:h-[620px]" />
      </div>

      {/* ─── Summary ─── */}
      <section className="px-5 py-14 md:px-10 md:py-20 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">The short answer</p>
              <h2 className="max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
                The best {subjectLabel} combine measurable excellence with lasting influence.
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
                Our 2026 list favors category leaders that pair outstanding performance with consistency. Raw numbers matter, but trust, experience, accessibility, and real-world relevance matter just as much.
              </p>
            </div>
            <aside className="border-l border-slate-200 pl-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">How we ranked</p>
              <ul className="mt-5 space-y-4 text-sm text-slate-600">
                {METHOD_POINTS.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── Sticky tabs ─── */}
      <div className="sticky top-0 z-30 border-y border-slate-200 bg-white/95 px-5 backdrop-blur md:px-10 xl:px-16">
        <div className="mx-auto flex min-h-16 max-w-[1536px] items-center gap-8 overflow-auto [scrollbar-width:none]">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`min-h-16 shrink-0 border-b-2 text-sm font-semibold transition ${tab === item ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* ─── The Ranking ─── */}
      <section id="ranking" className="scroll-mt-20 px-5 py-20 md:px-10 md:py-28 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <div className="mb-16 flex items-end justify-between gap-6">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">The Top11 index</p>
              <h2 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl">The complete ranking.</h2>
            </div>
            <span className="hidden text-sm text-slate-400 md:block">Scored out of 10</span>
          </div>
          {/* role="list" is required: Safari/VoiceOver drops list semantics
              from any list styled `list-style: none`. */}
          <ol role="list" className="list-none p-0 m-0">
            {entries.map((entry, index) => (
              <li key={entry.name}>
                <RankingEntry entry={entry} index={index} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Compare ─── */}
      <section id="compare" className="scroll-mt-20 bg-slate-50 px-5 py-20 md:px-10 md:py-28 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading
            eyebrow="Compare / At a glance"
            title={`Eleven ${subjectLabel}, side by side.`}
            copy="Use this compact view to find the strongest fit for your priorities. Scores are based on our editorial testing framework."
          />
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th scope="col" className="p-5">Rank</th>
                  <th scope="col" className="p-5">Name</th>
                  <th scope="col" className="p-5">Best for</th>
                  <th scope="col" className="p-5">Score</th>
                  <th scope="col" className="p-5">Reach</th>
                  <th scope="col" className="p-5">Editorial view</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item, index) => (
                  <tr key={item.name} className="border-b border-slate-100 text-sm last:border-0 hover:bg-blue-50/40">
                    <td className="p-5 font-bold text-blue-600">#{index + 1}</td>
                    <td className="p-5">
                      <strong className="block text-slate-900">{item.name}</strong>
                      <span className="text-xs text-slate-400">{item.company}</span>
                    </td>
                    <td className="p-5 text-slate-600">{item.best}</td>
                    <td className="p-5 font-semibold">{item.score}</td>
                    <td className="p-5 text-slate-600">{94 - index * 2}%</td>
                    <td className="p-5">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Recommended</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Methodology ─── */}
      <section id="methodology" className="scroll-mt-20 px-5 py-20 md:px-10 md:py-28 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading eyebrow="Methodology / Timeline" title="How this ranking evolved." />
          <div className="grid gap-8 md:grid-cols-4">
            {TIMELINE.map(([date, titleText, body], index) => (
              <div key={date} className="relative border-t border-slate-300 pt-6">
                <span className="absolute -top-1.5 left-0 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">{date}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{titleText}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
                <span aria-hidden="true" className="absolute right-0 top-4 text-5xl font-semibold text-slate-100">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Related ─── */}
      <section id="related" className="scroll-mt-20 border-t border-slate-200 px-5 py-20 md:px-10 md:py-28 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading eyebrow="Keep exploring" title="Related rankings." />
          <div className="grid gap-8 md:grid-cols-3">
            {related.map((item, index) => (
              <TrendingCard key={item.slug} ranking={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Toast notification */}
      <AnimatePresence>
        {notice && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
