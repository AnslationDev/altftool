"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { AnimatedCounter, EASE } from "./motion";

// Staggered reveal for the "View full analysis" panel: the panel itself
// expands smoothly, then its three columns cascade in one after another,
// and each column's checklist cascades line by line — so the content
// visibly settles into place instead of popping in all at once the moment
// the height animation finishes.
const panelStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const panelColumn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const listRow = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

function RankedItem({ item, isTop, category, index }) {
  const [open, setOpen] = useState(isTop);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.24), ease: EASE }}
      className="grid lg:grid-cols-[1fr_260px] gap-8 py-12 border-b border-black/10"
    >
      <div>
        <div className="flex items-baseline gap-4 flex-wrap">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`text-5xl sm:text-6xl font-black tracking-tight ${
              isTop ? "text-[#10b981]" : "text-[#d1d5db]"
            }`}
          >
            #{item.rank}
          </motion.span>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0b1120]">
            {item.name}
          </h3>
          <span className="text-[#9ca3af]">by {category}</span>
        </div>

        {item.badge ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-3 inline-block rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#10b981]"
          >
            {item.badge}
          </motion.span>
        ) : null}

        <p className="mt-4 max-w-2xl text-[#4b5563] leading-relaxed">{item.blurb}</p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#10b981] hover:text-[#0b1120] transition-colors"
        >
          {open ? "Hide analysis" : "View full analysis"}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.span>
        </motion.button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="analysis"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.55, ease: EASE },
                opacity: { duration: 0.35, ease: EASE },
              }}
              className="overflow-hidden"
            >
              <motion.div
                variants={panelStagger}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="mt-6 grid sm:grid-cols-[1fr_1fr_1fr] gap-8 border-l-2 border-[#10b981]/30 pl-6"
              >
                <motion.div variants={panelColumn}>
                  <p className="text-xs font-semibold tracking-widest text-[#9ca3af]">
                    WHY IT RANKS HERE
                  </p>
                  <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
                    {item.whyItRanks}
                  </p>
                </motion.div>
                <motion.div variants={panelColumn}>
                  <p className="text-xs font-semibold tracking-widest text-[#10b981]">
                    STRENGTHS
                  </p>
                  <motion.ul variants={listStagger} className="mt-2 space-y-1.5">
                    {item.strengths.map((strength) => (
                      <motion.li
                        key={strength}
                        variants={listRow}
                        className="flex items-start gap-2 text-sm text-[#4b5563]"
                      >
                        <Check size={14} className="mt-0.5 shrink-0 text-[#10b981]" />
                        {strength}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
                <motion.div variants={panelColumn}>
                  <p className="text-xs font-semibold tracking-widest text-[#ef4444]">
                    TRADEOFFS
                  </p>
                  <motion.ul variants={listStagger} className="mt-2 space-y-1.5">
                    {item.tradeoffs.map((tradeoff) => (
                      <motion.li
                        key={tradeoff}
                        variants={listRow}
                        className="flex items-start gap-2 text-sm text-[#4b5563]"
                      >
                        <X size={14} className="mt-0.5 shrink-0 text-[#ef4444]" />
                        {tradeoff}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="h-fit rounded-2xl bg-[#f7f8fa] p-6"
      >
        <p className="text-xs font-semibold tracking-widest text-[#9ca3af]">
          TOP5 SCORE
        </p>
        <p className="mt-1 flex items-baseline gap-1">
          <span className="text-4xl font-black text-[#0b1120]">
            <AnimatedCounter value={item.score} duration={1.2} />
          </span>
          <span className="text-sm text-[#9ca3af]">/10</span>
        </p>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: item.score / 10 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
            style={{ transformOrigin: "left" }}
            className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#5ea8ff]"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-black/10 pt-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#9ca3af]">BEST FOR</p>
            <p className="mt-1 font-semibold text-[#0b1120]">{item.bestFor}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#9ca3af]">
              GLOBAL REACH
            </p>
            <p className="mt-1 font-semibold text-[#0b1120]">
              <AnimatedCounter value={`${item.globalReach}%`} duration={1.2} />
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RankedItemsList({ items, category }) {
  return (
    <div>
      {items.map((item, index) => (
        <RankedItem
          key={item.rank}
          item={item}
          isTop={item.rank === 1}
          category={category}
          index={index}
        />
      ))}
    </div>
  );
}
