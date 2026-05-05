"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQSection({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section w-full flex justify-center animate-slide-up">
      <div className="w-full flex flex-col gap-[20px] sm:gap-[50px] mb-12">

        {/* Heading */}
        <div className="text-center animate-slide-right">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Quick Answers to Common Questions
          </p>
        </div>


        {/* FAQ List */}
        <div className="flex flex-col gap-[14px] sm:gap-[20px]">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                style={{ animationDelay: `${index * 70}ms` }}
                className={`w-full border rounded-[18.84px] overflow-hidden 
                            animate-slide-up
                            ${isOpen ? "border-(--primary)" : "border-(--border)"}`}
              >

                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 gap-3 text-left sm:min-h-[90.18px]"

                >
                  <span className="font-semibold text-[14px] sm:text-[16px] md:text-[18px] lg:text-[21px] leading-[22px] sm:leading-[24px] md:leading-[28px] lg:leading-[31.79px] pr-2">
                    {item.question}
                  </span>

                  {isOpen ? (
                    <Minus className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>


                {isOpen && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-5 text-(--muted-foreground) text-[13px] sm:text-sm md:text-base leading-6">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
