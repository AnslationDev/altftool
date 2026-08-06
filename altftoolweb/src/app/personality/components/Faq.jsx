"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
// Same array the page's FAQPage JSON-LD is built from (see ../page.jsx), so
// the markup and the rendered accordion can never disagree.
import { FAQ_ITEMS as faqs } from "../data/pageContent";

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section ">
      {/* Header */}
      <div className="text-center mb-10 md:mb-14 ">
        <h2 className="section-title max-w-[760px] mx-auto mb-4">
          Frequently Asked Questions
        </h2>

        <p className="section-subtitle max-w-[620px] mx-auto">
          What this four-question reflection does, how its scores work, and
          where your answer choices are stored.
        </p>
      </div>

      {/* FAQ List */}
      <div className="flex flex-col gap-4">
        {faqs.map((faq, i) => {
          const isOpen = open === i;

          return (
            <div
              key={i}
              className={`
                rounded-[20px]
                border
                bg-(--card)
                overflow-hidden
                transition-all duration-300
                shadow-[0px_8px_30px_0px_rgba(0,0,0,0.04)]
               
                ${
                  isOpen
                    ? "border-(--primary)"
                    : "border-(--border)"
                }
              `}
             
            >
              {/* Question */}
              <button
                onClick={() =>
                  setOpen(isOpen ? -1 : i)
                }
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  gap-4
                  text-left
                  px-5 sm:px-6 md:px-7
                  py-4 sm:py-5
                  cursor-pointer
                "
              >
                <span
                  className="
                    text-(--foreground)
                    font-semibold
                    text-[16px] sm:text-[18px] md:text-[20px]
                    leading-[26px] sm:leading-[30px]
                  "
                >
                  {faq.q}
                </span>

                <div
                  className={`
                    flex-shrink-0
                    w-9 h-9
                    rounded-full
                    flex items-center justify-center
                    transition-all duration-300
                    ${
                      isOpen
                        ? "bg-(--primary)/10 text-(--primary)"
                        : "bg-(--primary)/5 text-(--muted-foreground)"
                    }
                  `}
                >
                  {isOpen ? (
                    <Minus className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Answer */}
              <div
                className={`
                  grid
                  transition-all duration-300 ease-in-out
                  ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }
                `}
              >
                <div className="overflow-hidden">
                  <div
                    className="
                      px-5 sm:px-6 md:px-7
                      pb-5 sm:pb-6
                    "
                  >
                    <p
                      className="
                        text-(--muted-foreground)
                        text-[14px] sm:text-[15px] md:text-[17px]
                        leading-[24px] sm:leading-[28px]
                        max-w-[95%]
                      "
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
