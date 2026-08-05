"use client";

import { motion } from "framer-motion";
import { EASE } from "./motion";

/**
 * Shared section heading with a premium entrance, used across the home
 * page (Trending / Featured / Popular / …):
 *  - eyebrow line draws in, then the index + label slide up
 *  - the headline reveals word by word out of a mask
 *  - a short gradient underline strokes itself beneath the headline
 *  - the description eases in from the right
 * Layout and typography are unchanged — only the way it arrives.
 */
function MaskedWord({ word, index }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.08em] align-bottom mr-[0.26em] last:mr-0">
      <motion.span
        initial={{ y: "112%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.75, delay: 0.1 + index * 0.06, ease: EASE }}
        className="inline-block"
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function SectionHeading({ index, eyebrow, heading, description }) {
  const words = String(heading).split(" ");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
      <div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex items-center gap-2.5 text-xs font-semibold tracking-widest text-primary-text"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            style={{ transformOrigin: "left" }}
            className="inline-block h-px w-6 bg-primary"
            aria-hidden="true"
          />
          {index} / {eyebrow}
        </motion.p>

        <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
          {words.map((word, wordIndex) => (
            <MaskedWord key={`${word}-${wordIndex}`} word={word} index={wordIndex} />
          ))}
        </h2>

        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.25 + words.length * 0.06, ease: EASE }}
          style={{ transformOrigin: "left" }}
          className="mt-3 block h-[3px] w-16 rounded-full bg-gradient-to-r from-primary to-secondary"
          aria-hidden="true"
        />
      </div>

      {description ? (
        <motion.p
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.65, delay: 0.3, ease: EASE }}
          className="text-sm sm:text-base text-muted-foreground max-w-sm lg:text-right"
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}
