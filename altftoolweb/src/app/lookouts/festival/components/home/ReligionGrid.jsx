"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { RELIGIONS } from "../../data/religions";
import { getFestivalsByReligion } from "../../lib/getFestivals";
import { getIcon } from "../shared/iconMap";

// Cards land one after another as the grid scrolls into view, then each
// card's festival list types itself in underneath. delayChildren on the list
// holds it until the card itself has finished arriving.
const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};
const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } };
const itemVariants = { hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } };

export default function ReligionGrid() {
  return (
    <section className="festival-section" id="religions">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">By Faith</p>
            <h2>Religion-Based Festivals</h2>
          </div>
          <Link href="/lookouts/festival/calendar" className="see-all">
            Explore all religions <ArrowRight size={14} />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {RELIGIONS.map((religion) => {
            const Icon = getIcon(religion.icon);
            const festivals = getFestivalsByReligion(religion.slug);
            const countryCount = new Set(festivals.flatMap((f) => f.countryCodes)).size;

            return (
              <motion.div key={religion.slug} variants={cardVariants}>
                <Link
                  href={`/lookouts/festival/religion/${religion.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-primary-soft text-primary-text"
                    >
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="text-sm text-muted-foreground">{festivals.length}</span>
                  </div>

                  <h3 className="mb-2 text-xl font-extrabold text-foreground">{religion.name}</h3>
                  <p className="mb-4 text-sm font-semibold text-primary-text">
                    {countryCount} {countryCount === 1 ? "country" : "countries"} celebrating
                  </p>

                  {/* No `mt-auto` here: the grid stretches every card to the
                      tallest in its row, and pushing a short list to the
                      bottom opens a gap under the subtitle that reads as a
                      missing festival. Letting the slack fall below the list
                      instead makes it read as padding. */}
                  <motion.ul
                    className="space-y-1.5"
                    variants={listVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    {festivals.slice(0, 3).map((festival) => (
                      <motion.li
                        key={festival.slug}
                        variants={itemVariants}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                        />
                        {festival.name}
                      </motion.li>
                    ))}
                  </motion.ul>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
