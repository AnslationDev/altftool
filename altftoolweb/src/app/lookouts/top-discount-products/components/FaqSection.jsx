"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { FAQS } from "../data/staticContent";
import { baloo2 } from "../lib/fonts";

function FaqItem({ question, answer, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b-2 border-dashed border-[#e2ded0] py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className={`${baloo2.className} text-sm font-bold text-[#171717]`}>{question}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#8a8578] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="mt-2.5 text-sm leading-relaxed text-[#5b5648]">{answer}</p>
      )}
    </div>
  );
}

export default function FaqSection() {
  return (
    <section className="border-t-[3px] border-[#171717] bg-[#FFE566] px-6 py-14">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal className="mb-8 text-center">
          <h2 className={`${baloo2.className} text-2xl font-extrabold text-[#171717] sm:text-3xl`}>
            Frequently asked questions
          </h2>
        </ScrollReveal>
        <ScrollReveal className="tdp-neo-card bg-[#ffffff] px-5">
          {FAQS.map((faq, i) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} defaultOpen={i === 0} />
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
