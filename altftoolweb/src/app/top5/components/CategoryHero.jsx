"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, Layers, RefreshCw, Globe2 } from "lucide-react";
import CategorySearchForm from "./CategorySearchForm";
import { EASE, AnimatedCounter } from "./motion";

/**
 * Premium hero for the category index page: soft breathing aurora over the
 * light canvas, word-by-word masked headline with the topic name in the
 * serif-italic gradient accent, and a staggered stats strip with icons.
 */
function MaskedWord({ word, index, accent, reduceMotion = false }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.1em] align-bottom mr-[0.26em] last:mr-0">
      <motion.span
        initial={reduceMotion ? false : { y: "112%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, delay: 0.12 + index * 0.07, ease: EASE }}
        className={
          accent
            ? "inline-block italic text-transparent bg-clip-text bg-gradient-to-r from-primary-hover via-primary to-secondary pr-[0.05em]"
            : "inline-block"
        }
        style={accent ? { fontFamily: "var(--font-top5-display, serif)" } : undefined}
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function CategoryHero({ entity }) {
  const reduceMotion = useReducedMotion();
  const prefixWords = ["The", "best", "of"];
  const nameWords = `${entity.name.toLowerCase()}.`.split(" ");

  const stats = [
    { icon: Layers, value: entity.countLabel, label: entity.kind === "country" ? "curated rankings" : "rankings" },
    { icon: RefreshCw, value: null, label: "Illustrative dataset" },
    { icon: Globe2, value: null, label: "Global coverage" },
  ];

  return (
    <section className="relative overflow-hidden bg-page">
      {/* Soft breathing aurora on the light canvas. */}
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: [0, 50, -20, 0], y: [0, 25, 45, 0], scale: [1, 1.12, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-primary/[0.10] blur-[100px]"
      />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: [0, -60, 25, 0], y: [0, 40, -15, 0], scale: [1, 0.92, 1.15, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-0 right-[-100px] h-[380px] w-[380px] rounded-full bg-secondary/[0.10] blur-[100px]"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex items-center gap-2.5 text-xs font-semibold tracking-widest text-primary-text"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            style={{ transformOrigin: "left" }}
            className="inline-block h-px w-6 bg-primary"
            aria-hidden="true"
          />
          <motion.span
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={reduceMotion ? undefined : { duration: 14, repeat: Infinity, ease: "linear" }}
            className="inline-flex"
            aria-hidden="true"
          >
            <Compass size={14} />
          </motion.span>
          TOP5 {entity.kind === "country" ? "COUNTRY" : "CATEGORY"} INDEX
        </motion.p>

        <div className="mt-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.04] max-w-3xl">
            {prefixWords.map((word, index) => (
              <MaskedWord
                key={`${word}-${index}`}
                word={word}
                index={index}
                reduceMotion={reduceMotion}
              />
            ))}
            <span className="block sm:inline">
              {nameWords.map((word, index) => (
                <MaskedWord
                  key={`${word}-${index}`}
                  word={word}
                  index={prefixWords.length + index}
                  accent
                  reduceMotion={reduceMotion}
                />
              ))}
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="lg:w-[420px] shrink-0"
          >
            <p className="text-foreground-soft leading-relaxed">
              Independent rankings for the products, people, companies, and
              ideas moving this field forward.
            </p>
            <CategorySearchForm entityName={entity.name} />
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.55 } } }}
          className="mt-10 flex flex-wrap items-center gap-x-9 gap-y-3 border-t border-border pt-6 text-sm text-foreground-soft"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.span
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                }}
                className="inline-flex items-center gap-2"
              >
                <Icon size={14} className="text-primary-text" />
                {stat.value ? (
                  <span>
                    <strong className="text-foreground">
                      <AnimatedCounter value={stat.value} />
                    </strong>{" "}
                    {stat.label}
                  </span>
                ) : (
                  stat.label
                )}
              </motion.span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
