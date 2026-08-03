"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { categoryItems, countries, images, rankings } from "../../data/mock-data";
import AnimatedStat from "../ui/AnimatedStat";
import Button from "../ui/Button";
import ImageWithFallback from "../ui/ImageWithFallback";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import TrendingCard from "../TrendingCard";
import { useTop11Search } from "../SearchContext";

const toSlug = (value) => value.toLowerCase().replace(/ /g, "-");

export default function HomePage() {
  const { openSearch } = useTop11Search();
  const [newsletter, setNewsletter] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const railRef = useRef(null);
  const featured = rankings.slice(1, 5);

  // Native scrollBy on a ref, rather than a transform computed from
  // window.innerWidth: reading the viewport during render has no server
  // equivalent, and the arrows now stay in sync with a manual swipe too.
  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const amount = Math.min(rail.clientWidth * 0.8, 374);
    rail.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <main>
      {/* ─── Section 1 — Hero ─── */}
      <section className="relative flex min-h-[850px] items-end overflow-hidden bg-slate-950 text-white lg:min-h-screen">
        <ImageWithFallback
          src={images.world}
          alt="Clouds and continents seen from above"
          eager
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.2)_0%,rgba(3,7,18,0.35)_35%,rgba(3,7,18,0.94)_100%)]" />
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 text-[clamp(7rem,25vw,25rem)] font-black leading-none tracking-[-0.09em] text-white/10"
        >
          TOP11
        </motion.div>
        <div className="relative mx-auto w-full max-w-[1536px] px-5 pb-14 pt-32 md:px-10 md:pb-20 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl"
          >
            <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              <span className="h-px w-8 bg-blue-300" /> The global ranking index
            </p>
            <h1 className="text-balance text-[clamp(3.4rem,7.2vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              Discover the world&rsquo;s <span className="text-blue-300">Top 11</span> rankings.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-200 md:text-xl md:leading-8">
              A more considered way to find the people, places, products, and ideas that define what is exceptional.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-9 max-w-4xl"
          >
            <button
              type="button"
              onClick={openSearch}
              className="group flex min-h-18 w-full items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left text-slate-950 shadow-2xl shadow-black/20 transition hover:-translate-y-0.5 md:min-h-20 md:px-7"
            >
              <Search className="h-5 w-5 text-blue-600 md:h-6 md:w-6" />
              <span className="flex-1 text-base text-slate-400 md:text-lg">Search anything...</span>
              <span className="hidden text-xs font-bold uppercase tracking-[0.12em] text-slate-400 sm:inline">Explore</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:bg-blue-600">
                <ArrowRight className="h-5 w-5" />
              </span>
            </button>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
              <span className="font-semibold text-white/90">Try</span>
              {["AI tools", "universities", "CEOs", "football players", "companies"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={openSearch}
                  className="border-b border-white/20 pb-0.5 transition hover:border-white hover:text-white"
                >
                  Top 11 {item}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-9 right-10 hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50 xl:flex">
          <span>Scroll to discover</span><ArrowDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ─── Section 2 — Trending ─── */}
      <section id="trending" className="scroll-mt-24 px-5 py-24 md:px-10 md:py-32 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading
            eyebrow="01 / Trending now"
            title="What the world is exploring."
            copy="The rankings attracting the most attention, recalculated from editorial updates and community activity."
          />
          <div className="grid gap-10 md:grid-cols-3 md:gap-6 xl:gap-9">
            {rankings.slice(0, 3).map((ranking, index) => (
              <Reveal key={ranking.slug} delay={index * 0.1}>
                <TrendingCard ranking={ranking} index={index} />
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button as={Link} href="/top11/category/trending" variant="outline">
              See all trending <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Section 3 — Categories ─── */}
      <section id="categories" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 px-5 py-24 md:px-10 md:py-32 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading
            eyebrow="02 / Categories"
            title="Every field. One standard."
            copy="Move across disciplines without losing context. Each field is reviewed through its own editorial lens."
          />
          <div className="grid border-l border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {categoryItems.map(({ name, icon: Icon, count }, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.025, 0.3) }}
              >
                <Link
                  href={`/top11/category/${toSlug(name)}`}
                  className="group flex min-h-40 flex-col items-start justify-between border-b border-r border-slate-200 bg-slate-50 p-5 text-left transition duration-300 hover:bg-white sm:min-h-44 md:p-6"
                >
                  <Icon className="h-5 w-5 text-slate-400 transition duration-300 group-hover:scale-110 group-hover:text-blue-600" />
                  <span className="w-full">
                    <span className="flex items-center justify-between gap-2 text-base font-semibold tracking-tight text-slate-900">
                      <span>{name}</span>
                      <ArrowUpRight className="h-4 w-4 -translate-x-1 translate-y-1 text-blue-600 opacity-0 transition group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">{count} rankings</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 4 — Countries ─── */}
      <section id="countries" className="scroll-mt-24 overflow-hidden px-5 py-24 md:px-10 md:py-32 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading
            eyebrow="03 / World index"
            title="Explore by country."
            copy="Find the local institutions, destinations, companies, and culture with influence far beyond their borders."
          />
          <div className="mb-7 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => scrollRail("left")}
              aria-label="Previous countries"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 transition hover:border-slate-950"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail("right")}
              aria-label="Next countries"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 transition hover:border-slate-950"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div
            ref={railRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {countries.map(([code, name, count], index) => (
              <Link
                key={code}
                href={`/top11/category/${toSlug(name)}`}
                className="group relative flex h-72 w-[min(78vw,350px)] shrink-0 flex-col justify-between overflow-hidden rounded-[1.75rem] bg-slate-950 p-7 text-left text-white"
              >
                <span aria-hidden="true" className="absolute -right-5 -top-12 text-[10rem] font-black tracking-[-0.1em] text-white/[0.055] transition duration-500 group-hover:-translate-x-3 group-hover:text-blue-400/10">
                  {code}
                </span>
                <span className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-xs font-bold tracking-[0.18em]">
                    {code}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-white/40 transition group-hover:text-white" />
                </span>
                <span>
                  <span className="block text-3xl font-semibold tracking-[-0.04em]">{name}</span>
                  <span className="mt-2 block text-sm text-white/50">{count} curated rankings</span>
                </span>
                <span className="h-1 w-12 rounded-full bg-blue-500 transition-all duration-500 group-hover:w-full" style={{ opacity: 0.72 + index * 0.015 }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 5 — Featured Collections ─── */}
      <section className="bg-[#eef3fb] px-5 py-24 md:px-10 md:py-32 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading
            eyebrow="04 / Featured collections"
            title="Curated for a wider view."
            copy="The definitive starting points for subjects changing how we live, work, and understand the world."
          />
          <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
            {featured.map((item, index) => (
              <motion.article
                key={item.slug}
                whileHover={{ y: -4 }}
                className={`group relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-slate-900 ${index === 0 ? "lg:col-span-7 lg:row-span-2 lg:min-h-[740px]" : "lg:col-span-5 lg:min-h-[360px]"}`}
              >
                <Link href={`/top11/item/${item.slug}`} className="block h-full">
                  <ImageWithFallback src={item.image} alt={item.title} className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-9">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300">Featured / {item.category}</p>
                    <h3 className={`${index === 0 ? "max-w-2xl text-4xl md:text-6xl" : "max-w-md text-2xl md:text-3xl"} font-semibold leading-[1.02] tracking-[-0.045em]`}>
                      {item.title}
                    </h3>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 6 — Popular This Week ─── */}
      <section className="px-5 py-24 md:px-10 md:py-32 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading eyebrow="05 / Popular this week" title="The conversation, ranked." />
          <div className="border-t border-slate-300">
            {rankings.slice(0, 5).map((item, index) => (
              <Link
                key={item.slug}
                href={`/top11/item/${item.slug}`}
                className="group grid w-full grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-slate-200 py-5 text-left md:grid-cols-[80px_110px_1fr_150px_40px] md:gap-6 md:py-6"
              >
                <span className="text-sm font-bold text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                <ImageWithFallback src={item.image} alt="" className="hidden aspect-[4/3] rounded-xl md:block" />
                <span>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">{item.category}</span>
                  <span className="block text-lg font-semibold tracking-[-0.025em] text-slate-900 transition group-hover:text-blue-600 md:text-2xl">{item.title}</span>
                </span>
                <span className="hidden text-right text-sm text-slate-400 md:block">{item.views}<span className="block text-xs">views</span></span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 7 — Editor's Pick ─── */}
      <section className="bg-slate-950 px-5 py-24 md:px-10 md:py-32 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <SectionHeading
            inverse
            eyebrow="06 / Editors' pick"
            title="Perspective, not just popularity."
            copy="A weekly selection of rankings that surprised us, taught us something, or changed our point of view."
          />
          <div className="grid items-stretch overflow-hidden rounded-[2rem] bg-white lg:grid-cols-2">
            <ImageWithFallback src={images.moon} alt="The moon against a dark sky" className="min-h-[420px] lg:min-h-[620px]" />
            <div className="flex flex-col justify-between p-8 md:p-12 lg:p-16">
              <div>
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Science / Editor&rsquo;s note 24</p>
                <h3 className="text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 md:text-6xl">The missions making deep space feel close.</h3>
                <p className="mt-7 max-w-lg text-base leading-7 text-slate-500">Beyond budgets and headlines, these eleven programs are building the instruments, partnerships, and ideas that will define the next era of exploration.</p>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-between gap-5">
                <Button as={Link} href="/top11/item/space-agencies">
                  Read the ranking <ArrowRight className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium text-slate-400">12 min read / Updated Friday</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 8 — Recently Updated + Community Favorites ─── */}
      <section className="px-5 py-24 md:px-10 md:py-32 xl:px-16">
        <div className="mx-auto grid max-w-[1536px] gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="07 / Recently updated" title="Fresh context, clearly marked." />
            <div className="relative border-l border-slate-200 pl-8">
              {[
                ["12 min", "Top 11 Global Universities", "Methodology and 2026 research output updated"],
                ["2 hrs", "Top 11 AI Tools", "New capability testing and pricing review"],
                ["Today", "Top 11 Electric Cars", "Range, availability, and owner scores refreshed"],
                ["Yesterday", "Top 11 Football Players", "Latest match data and form index added"],
              ].map(([time, title, note], index) => (
                <div key={title} className={`relative pb-8 ${index === 3 ? "pb-0" : ""}`}>
                  <span className="absolute -left-[37px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">{time} ago</p>
                  <p className="mt-1.5 font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-500">{note}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="08 / Community favorites" title="Saved by people with taste." />
            <div className="space-y-1">
              {[
                ["01", "Design studios defining a new visual culture", "32.8K saves"],
                ["02", "Independent hotels worth planning a trip around", "27.1K saves"],
                ["03", "Books every product leader should revisit", "22.6K saves"],
                ["04", "The most liveable small cities in Europe", "19.4K saves"],
              ].map(([number, title, saves]) => (
                <div key={number} className="group flex w-full items-start gap-5 border-b border-slate-200 py-5 text-left">
                  <span className="pt-1 text-xs font-bold text-slate-400">{number}</span>
                  <span className="flex-1">
                    <span className="block text-lg font-semibold leading-snug tracking-tight text-slate-900">{title}</span>
                    <span className="mt-1.5 block text-xs text-slate-400">{saves}</span>
                  </span>
                  <Bookmark className="mt-1 h-4 w-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 9 — Statistics ─── */}
      <section className="bg-blue-600 px-5 py-24 md:px-10 xl:px-16">
        <div className="mx-auto max-w-[1536px]">
          <p className="mb-14 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
            One global index, built to make better discovery possible.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <AnimatedStat value={195} label="Countries indexed" />
            <AnimatedStat value={2400} label="Categories" suffix="+" />
            <AnimatedStat value={184} label="Published rankings" suffix="K" />
            <AnimatedStat value={28} label="Monthly readers" suffix="M" />
            <AnimatedStat value={94} label="Community signals" suffix="M" />
          </div>
        </div>
      </section>

      {/* ─── Section 10 — Newsletter ─── */}
      <section className="px-5 py-24 md:px-10 md:py-32 xl:px-16">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">The Top11 briefing</p>
          <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl">Eleven excellent things, every Sunday.</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500">A concise edit of remarkable people, products, places, and ideas. No noise, and no daily inbox clutter.</p>
          {subscribed ? (
            <div className="mx-auto mt-9 flex max-w-md items-center justify-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 font-semibold text-emerald-800">
              <Check className="h-5 w-5" /> You&rsquo;re on the Sunday list.
            </div>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); if (newsletter) setSubscribed(true); }} className="mx-auto mt-9 flex max-w-xl flex-col gap-3 rounded-2xl bg-slate-100 p-2 sm:flex-row">
              <label htmlFor="top11-newsletter" className="sr-only">Email address</label>
              <input id="top11-newsletter" type="email" required value={newsletter} onChange={(event) => setNewsletter(event.target.value)} placeholder="Email address" className="min-h-13 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-slate-400" />
              <Button type="submit" className="sm:min-w-32">Join free</Button>
            </form>
          )}
          <p className="mt-3 text-[11px] text-slate-400">Free forever. Unsubscribe whenever you like.</p>
        </Reveal>
      </section>
    </main>
  );
}
