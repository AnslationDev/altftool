"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Alt F Tools?",
    answer:
      "Alt F Tools is an all-in-one productivity platform offering 100+ fast, lightweight micro tools to help you convert, calculate, analyze, and create — all from one place.",
  },
  {
    question: "Do I need to sign up to use the tools?",
    answer:
      "No. Most Alt F tools are available instantly without any signup. Just open a tool and start using it.",
  },
  {
    question: "Is Alt F Tools really free?",
    answer:
      "Yes. Alt F Tools offers a wide range of free, ad-free tools. Some advanced tools may be added later, but core features will always remain free.",
  },
  {
    question: "Are my files and data safe?",
    answer: (
      <div className="space-y-1">
        <p>Absolutely. Your privacy is our priority.</p>
        <ul className="list-disc list-inside ml-4">
          <li>Files are processed locally in your browser</li>
          <li>No data is stored on our servers</li>
          <li>No tracking or hidden data collection</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Can I use Alt F Tools on mobile devices?",
    answer:
      "Yes. Alt F Tools is fully responsive and works smoothly on mobile, tablet, and desktop devices.",
  },
  {
    question: "Are the tools secure for sensitive data?",
    answer:
      "Yes. Since most tools run client-side, your sensitive data never leaves your device.",
  },
  // {
  //   question: "How fast are the tools?",
  //   answer:
  //     "All tools are optimized for speed and performance, delivering instant results with minimal loading time.",
  // },
  // {
  //   question: "Can I suggest a new tool?",
  //   answer:
  //     "Yes! We love feedback. You can suggest new tools through the Contact or Feedback section.",
  // },
  // {
  //   question: "Are AI tools included in Alt F?",
  //   answer:
  //     "Yes. Alt F includes an AI Tools Hub with smart utilities designed to improve productivity while respecting user privacy.",
  // },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section w-full bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center">
          Frequently <span className="text-[var(--primary)]">Asked Questions</span>
        </h2>

        <p className="text-center mt-2 text-[var(--muted-foreground)] text-sm sm:text-base">
          Find answers to common questions about Alt F Tools.
        </p>

        <div className="mt-10 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border border-[var(--border)] rounded-xl bg-[var(--card)] transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 text-left"
                >
                  <span className="font-medium text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="px-5 pb-5 text-[var(--muted-foreground)] text-sm sm:text-base">
                    {faq.answer}
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
