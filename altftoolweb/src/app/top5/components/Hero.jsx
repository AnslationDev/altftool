"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Search, ArrowRight, ChevronDown } from "lucide-react";
import { EASE } from "./motion";
import ManagedImage from "@/components/ui/ManagedImage";

// Editorial, agency-brief-style hero: light canvas, soft color-bloom behind
// the display type, and a fanned row of the site's five flagship rankings
// standing in for the "portfolio strip" moment. Card image/title data
// arrives as a slim `quickRankings` prop from the server page, so the full
// rankings dataset never ships in the client bundle.
const QUICK_LINKS = [
  { label: "AI tools", slug: "ai-tools", rotate: -7 },
  { label: "Universities", slug: "global-universities", rotate: -3 },
  { label: "Footballers", slug: "football-players", rotate: 0 },
  { label: "EVs", slug: "electric-cars", rotate: 4 },
  { label: "Cities after dark", slug: "cities-after-dark", rotate: 8 },
].map((link, i, arr) => ({
  ...link,
  lift: i === Math.floor((arr.length - 1) / 2) ? -18 : Math.abs(i - (arr.length - 1) / 2) * 6,
}));

const headingLineOne = ["Discover", "the", "world's"];

const wordVariants = {
  hidden: { opacity: 0, y: 34, rotateX: -35 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.75, delay: 0.12 + i * 0.08, ease: EASE },
  }),
};

export default function Hero({ quickRankings = {} }) {
  const sectionRef = useRef(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim().slice(0, 80);
    router.push(query ? `/top5/categories?q=${encodeURIComponent(query)}` : "/top5/categories");
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#fbfaf7]"
      style={{ perspective: 900 }}
    >
      {/* Soft color-bloom behind the headline, standing in for the video's
          gradient-orb treatment. Pure CSS radial blobs, no new assets. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], x: [0, 24, 0], y: [0, 14, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-[6%] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(103,232,184,0.35),rgba(94,168,255,0.22)_45%,transparent_72%)] blur-[70px]"
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], x: [0, -18, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute right-[8%] top-[2%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.28),transparent_70%)] blur-[60px]"
        />
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
        className="pointer-events-none select-none absolute top-6 right-0 text-[16rem] font-black tracking-tighter text-black/[0.03] leading-none z-[1]"
      >
        TOP5
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 pt-20 sm:pt-28"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#10b981]"
        >
          <motion.span
            animate={{ scaleX: [0, 1] }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            style={{ transformOrigin: "left" }}
            className="inline-block h-px w-6 bg-[#10b981]"
          />
          THE GLOBAL RANKING INDEX
        </motion.div>

        <h1 className="mt-6 max-w-4xl text-[2.75rem] leading-[1.05] tracking-tight text-[#0b1120] sm:text-6xl md:text-[5.25rem]">
          <span className="block font-medium" style={{ transformStyle: "preserve-3d" }}>
            {headingLineOne.map((word, i) => (
              <motion.span
                key={word}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="show"
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <motion.span
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.46, ease: EASE }}
            className="block font-[family-name:var(--font-top5-display)] italic"
          >
            <motion.span
              className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_100%]"
              animate={reduceMotion ? undefined : { backgroundPosition: ["0% 50%", "200% 50%"] }}
              transition={reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "linear" }}
            >
              Top 5
            </motion.span>{" "}
            rankings.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          className="mt-6 max-w-xl text-base leading-relaxed text-[#4b5563] sm:text-lg"
        >
          A more considered way to find the people, places, products, and
          ideas that define what is exceptional — five at a time.
        </motion.p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <motion.form
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.72, ease: EASE }}
            onSubmit={handleSearch}
            className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-surface p-2 pl-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Search size={18} className="shrink-0 text-primary-text" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              maxLength={80}
              aria-label="Search Top5 categories"
              placeholder="Search categories..."
              className="min-w-0 flex-1 bg-transparent py-2.5 text-foreground outline-none placeholder:text-muted-foreground"
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              aria-label="Explore Top5 categories"
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground sm:px-5"
            >
              <span className="hidden sm:inline">EXPLORE</span>
              <motion.span
                animate={reduceMotion ? undefined : { x: [0, 3, 0] }}
                transition={reduceMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-on-media/10"
              >
                <ArrowRight size={14} />
              </motion.span>
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.8, ease: EASE }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              href="/top5/categories"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-hover"
            >
              Browse every list
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.95 } } }}
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
        >
          <span className="text-[#9ca3af]">Try</span>
          {QUICK_LINKS.map((item) => (
            <motion.span
              key={item.slug}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Link
                href={`/top5/item/${item.slug}`}
                className="text-[#4b5563] underline decoration-black/15 underline-offset-4 hover:text-[#0b1120] hover:decoration-black/40 transition-colors"
              >
                {item.label}
              </Link>
            </motion.span>
          ))}
        </motion.div>

        {/* Fanned strip of the five flagship rankings — the "top 5" the
            hero promises, previewed as a curved row of tilted cards. */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 1.05 } } }}
          initial="hidden"
          animate="show"
          className="relative mt-16 flex items-end justify-center gap-3 pb-6 sm:gap-4 md:gap-5"
        >
          {QUICK_LINKS.map((item, index) => (
            <motion.div
              key={item.slug}
              variants={{
                hidden: { opacity: 0, y: 60, rotate: 0 },
                show: {
                  opacity: 1,
                  y: item.lift,
                  rotate: item.rotate,
                  transition: { duration: 0.8, ease: EASE },
                },
              }}
              whileHover={{ rotate: 0, y: item.lift - 14, scale: 1.06, zIndex: 20 }}
              style={{ transformOrigin: "bottom center" }}
              className="relative w-[19%] min-w-[110px] shrink-0"
            >
              <Link href={`/top5/item/${item.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(11,17,32,0.35)] ring-1 ring-black/5">
                  <ManagedImage
                    src={quickRankings[item.slug]?.cardImage}
                    alt={quickRankings[item.slug]?.title || item.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                  <span className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#0b1120] sm:h-7 sm:w-7 sm:text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 right-2.5 text-[11px] font-semibold leading-tight text-white sm:text-xs">
                    {item.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="hidden items-center justify-center gap-2 pb-10 pt-2 text-xs font-semibold tracking-widest text-[#9ca3af] sm:flex"
        >
          SCROLL TO DISCOVER
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={14} />
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}
