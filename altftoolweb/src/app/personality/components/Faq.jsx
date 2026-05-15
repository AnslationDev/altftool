"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How long does the personality test take?",
    a: "Our personality tests are designed to be quick yet thorough. Most assessments take between 3–7 minutes to complete, depending on the specific test you choose.",
  },
  {
    q: "Are the personality tests scientifically inspired?",
    a: "Yes, our assessments are designed using proven psychological concepts, behavioral analysis, and AI-powered insights.",
  },
  {
    q: "Do I need to sign up to take the test?",
    a: "No sign-up is required! You can take any of our personality tests immediately without creating an account. Your results are displayed instantly.",
  },
  {
    q: "What kind of insights will I receive?",
    a: "You'll receive a comprehensive personality profile including your core traits, strengths, communication style, career alignment, and personalized growth recommendations.",
  },
  {
    q: "Is my personal data secure?",
    a: "Absolutely. We take data privacy seriously and never share your personal information with third parties. All data is encrypted and stored securely.",
  },
  {
    q: "Are the results accurate?",
    a: "Our assessments are built on validated psychological frameworks combined with advanced AI analysis. While no test is perfect, users consistently report high accuracy in their results.",
  },
];

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
          Everything you need to know about our
          personality tests and how they help you
          better understand yourself.
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
                bg-(--background)
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
                        : "bg-(--muted) text-(--muted-foreground)"
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