"use client";

import { useState } from "react";

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

export default function FAQ() {
  const [open, setOpen] = useState(1);

  return (
    <section className="w-full py-14 md:py-20" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="font-['Manrope',sans-serif] font-semibold text-[30px] sm:text-[36px] md:text-[40px] leading-[38px] sm:leading-[46px] md:leading-[55px] capitalize mb-3" style={{ color: 'var(--foreground)' }}>
            Frequently Asked Questions
          </h2>

          <p className="font-['Manrope',sans-serif] font-medium text-[15px] sm:text-[18px] md:text-[20px] leading-[22px] sm:leading-[26px] md:leading-[27px] capitalize" style={{ color: 'var(--muted-foreground)' }}>
            Everything You Need To Know About Our Personality Tests
          </p>
        </div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i;

            return (
              <div
                key={i}
                className="rounded-[18px] overflow-hidden transition-all duration-200 card border"
                style={{
                  borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
                  boxShadow: isOpen ? 'var(--anslation-ds-shadow-md)' : 'var(--anslation-ds-shadow-sm)',
                  borderWidth: '1px',
                  background: 'var(--card)',
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-['Manrope',sans-serif] font-medium text-[19.5px] leading-[27px]" style={{ color: 'var(--foreground)' }}>
                    {faq.q}
                  </span>

                  <div className="w-[26px] h-[26px] flex items-center justify-center flex-shrink-0">
                    {isOpen ? (
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 26 26"
                        fill="none"
                      >
                        <path
                          d="M5.42 13H20.58"
                          strokeWidth="2.17"
                          strokeLinecap="round"
                          style={{ stroke: 'var(--primary)' }}
                        />
                      </svg>
                    ) : (
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 26 26"
                        fill="none"
                      >
                        <path
                          d="M13 5.42V20.58M5.42 13H20.58"
                          strokeWidth="2.17"
                          strokeLinecap="round"
                          style={{ stroke: 'var(--muted-foreground)' }}
                        />
                      </svg>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="font-['Manrope',sans-serif] font-normal text-[18.2px] leading-[29px]" style={{ color: 'var(--muted-foreground)' }}>
                      {faq.a}
                    </p>
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
