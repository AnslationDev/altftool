import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { faqs } from "../../data/faq";

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="sec">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="Answers to your"
          highlight="growth questions"
          subtitle="Everything you need to know about working with us across Digital, Affiliate and Advertising marketing."
        />

        <div className="mx-auto mt-14 max-w-3xl space-y-4">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 0.05}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-colors ${
                    isOpen
                      ? "border-brand/30 bg-brand/[0.03] dark:bg-white/5"
                      : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-ink dark:text-white">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        isOpen
                          ? "bg-brand text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-white/10"
                      }`}
                    >
                      <Plus size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
