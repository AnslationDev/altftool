"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Reveal, staggerContainer, staggerItem, EASE } from "./motion";
import { getAllCountries } from "../data/countries";

export default function CountriesSection() {
  const scrollRef = useRef(null);
  const countries = getAllCountries();

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section id="world-index" className="w-full py-14 sm:py-20 md:py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="WORLD INDEX"
            heading="Explore by country."
            description="Find the local institutions, destinations, companies, and culture with influence far beyond their borders."
          />
        </Reveal>

        <div className="mt-5 sm:mt-6 flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll countries left"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-black/10 text-[#0b1120] hover:bg-[#f3f4f6] transition-colors"
          >
            <ChevronLeft size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll countries right"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-black/10 text-[#0b1120] hover:bg-[#f3f4f6] transition-colors"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        <div className="relative mt-5 sm:mt-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:w-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:w-10" />

          <motion.div
            ref={scrollRef}
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-2 pr-4 sm:pr-6 [&::-webkit-scrollbar]:hidden"
          >
            {countries.map((country) => (
              <motion.div key={country.slug} variants={staggerItem} className="shrink-0">
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
                  <Link
                    href={`/top5/category/${country.slug}`}
                    className="group relative block w-[210px] h-[175px] sm:w-[270px] sm:h-[210px] rounded-2xl bg-[#0b1120] p-4 sm:p-6 flex flex-col justify-between overflow-hidden"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none select-none absolute -right-2 -top-2 text-5xl sm:text-7xl font-black text-white/[0.06]"
                    >
                      {country.code}
                    </span>

                    <div className="flex items-start justify-between relative z-10">
                      <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 text-xs font-semibold text-white">
                        {country.code}
                      </span>
                      <motion.span
                        animate={{ x: [0, 3, 0], y: [0, -3, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowUpRight
                          size={18}
                          className="text-white/60 group-hover:text-white transition-colors"
                        />
                      </motion.span>
                    </div>

                    <div className="relative z-10">
                      <p className="text-lg sm:text-xl font-bold text-white">{country.name}</p>
                      <p className="mt-1 text-xs sm:text-sm text-white/50">
                        {country.count} curated rankings
                      </p>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                        style={{ transformOrigin: "left" }}
                        className="mt-3 sm:mt-4 block h-[3px] w-10 rounded-full bg-[#10b981]"
                      />
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
