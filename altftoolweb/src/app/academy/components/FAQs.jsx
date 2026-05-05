"use client";

import { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "Which platform is right for me?",
    answer:
      "We help you filter platforms based on your goal — whether it's cracking an exam, learning a skill, or advancing your career. Just tell us what you're aiming for.",
  },
  {
    id: 2,
    question: "How does altF work?",
    answer:
      "altF curates and compares the best learning platforms so you don't have to. Browse by category, read summaries, and find the right fit in minutes.",
  },
  {
    id: 3,
    question: "Do you provide courses directly?",
    answer:
      "No — we don't host courses ourselves. We help you discover and compare the platforms that do, so you can make an informed choice.",
  },
  {
    id: 4,
    question: "Is it free to use altF?",
    answer:
      "Yes, completely free. You can explore all platform listings and comparisons without any signup or payment.",
  },
  {
    id: 5,
    question: "How are platforms selected?",
    answer:
      "Each platform is manually reviewed based on content quality, user trust, pricing transparency, and learning outcomes before being listed.",
  },
  {
    id: 6,
    question: "Can I compare multiple platforms?",
    answer:
      "Yes — our comparison tools let you put platforms side by side across key criteria like price, course range, certifications, and reviews.",
  },
  {
    id: 7,
    question: "Are these platforms trusted?",
    answer:
      "We only list platforms with a proven track record. Every listing goes through a quality check, and we update them regularly.",
  },
];

export default function FAQ() {
  const title = "Frequently Asked Questions";
  const subtitle =
    "Have questions about choosing the right learning platform? Here are some quick answers to help you get started";

  const [activeIndex, setActiveIndex] = useState(null);


  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section mb-8 animate-slide-up">
      {/* Heading */}
      <div className="mb-8 xl:mb-14 animate-slide-right">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle !mx-0 text-left">{subtitle}</p>
      </div>

      {/* FAQ List */}
      <div className="">
        {faqs.map((item, index) => (
          <div
            key={item.id}
            className={`border rounded-2xl mt-2 transition-all duration-300 animate-slide-up
              ${
                activeIndex === index
                  ? "border-[1.5px] border-(--primary)"
                  : "border-black/10 hover:border-gray-300"
              }`}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            {/* Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center
                         px-4 sm:px-5 md:px-6
                         py-3 sm:py-4 md:py-5
                         text-left gap-3 sm:gap-4 cursor-pointer"
            >
              <span
                className="text-sm sm:text-base md:text-lg
                           font-semibold text-(--foreground)
                           leading-snug pr-2"
              >
                {item.question}
              </span>

              <span
                className={`flex-shrink-0 text-base sm:text-lg md:text-xl
                  font-bold transition-all duration-300
                  ${
                    activeIndex === index
                      ? "text-[#2563eb]"
                      : "text-(--muted-foreground)"
                  }`}
              >
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>

            {/* Answer */}
            <div
              className={`overflow-hidden transition-all duration-300
                ${
                  activeIndex === index
                    ? "max-h-60 sm:max-h-48 md:max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
            >
              <div
                className="px-4 sm:px-5 md:px-6
                            pb-3 sm:pb-4 md:pb-5
                            text-xs sm:text-sm md:text-base
                            text-(--muted-foreground) leading-relaxed"
              >
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
