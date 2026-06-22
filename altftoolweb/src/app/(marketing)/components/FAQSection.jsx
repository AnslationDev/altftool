"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "Is AltF tool free to use?",
    answer:
      "Yes. Core AltFTool workflows are free and designed for quick access without unnecessary friction.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Most tools can be opened and used instantly without creating an account.",
  },
  {
    question: "Is my data safe?",
    answer:
      "AltFTool is built around privacy-conscious workflows and avoids unnecessary data storage wherever possible.",
  },
  {
    question: "Do the tools work on mobile?",
    answer:
      "Yes. The homepage and tools are responsive across desktop, tablet, and mobile browsers.",
  },
];

export default function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState(faqs[0].question);

  return (
    <section className="section">
      <div className="grid items-center gap-9 lg:grid-cols-[0.78fr_1fr]">
        <div className="flex items-center gap-8">
          <div className="min-w-0">
            <p className="home-kicker">Frequently asked questions</p>
            <h2 className="max-w-sm text-[2rem] font-black leading-[1.12] text-[var(--foreground)] md:text-[2.4rem]">
              Got questions?
              <span className="block">We&apos;ve got answers.</span>
            </h2>
          </div>

          <div className="home-faq-art relative hidden h-44 w-48 shrink-0 sm:block" aria-hidden="true">
            <span className="home-faq-art-question">?</span>
            <span className="home-faq-art-chat">
              <MessageCircle className="h-7 w-7" />
            </span>
            <span className="home-faq-art-dot home-faq-art-dot-a" />
            <span className="home-faq-art-dot home-faq-art-dot-b" />
            <span className="home-faq-art-dot home-faq-art-dot-c" />
            <HelpCircle className="home-faq-art-small" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--home-border)] bg-white shadow-[0_18px_42px_rgba(55,49,120,0.08)] dark:bg-[var(--card)]">
          {faqs.map((faq) => {
            const isOpen = openQuestion === faq.question;

            return (
              <div key={faq.question} className="border-b border-[var(--home-border)] last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenQuestion(isOpen ? null : faq.question)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-[0.95rem] text-[var(--foreground)] transition hover:bg-[var(--home-surface)]"
                  aria-expanded={isOpen}
                >
                  <span className="font-extrabold">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[var(--primary)] transition ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-4 text-sm font-semibold leading-6 text-[var(--muted-foreground)]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
