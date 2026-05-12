"use client";

import { useState } from "react";
import Image from "next/image";

const testimonials = [
  [
    {
      name: "Sarah Mitchell",
      handle: "@sarahmitch",
      text: "Donec auctor ligula sit amet mauris tincidunt, et viverra libero congue. Morbi vehicula interdum felis, non euismod felis auctor non. Phasellus facilisis urna ut metus mollis, a sollicitudin libero suscipit.",
      avatarSrc: "/personality/testimonials/image1.jpg",
    },
    {
      name: "James Torres",
      handle: "@jamestorres",
      text: "Donec auctor ligula sit amet mauris tincidunt, et viverra libero congue. Morbi vehicula interdum felis, non euismod felis auctor non. Phasellus facilisis urna ut metus mollis, a sollicitudin libero suscipit.",
      avatarSrc: "/personality/testimonials/image2.jpg",
    },
    {
      name: "Priya Sharma",
      handle: "@priyasharma",
      text: "Donec auctor ligula sit amet mauris tincidunt, et viverra libero congue. Morbi vehicula interdum felis, non euismod felis auctor non. Phasellus facilisis urna ut metus mollis, a sollicitudin libero suscipit.",
      avatarSrc: "/personality/testimonials/image3.jpg",
    },
  ],
  [
    {
      name: "Alex Johnson",
      handle: "@alexj",
      text: "This personality test gave me clarity about my career path that I'd been searching for years. The AI analysis was incredibly accurate and insightful.",
      avatarSrc: "/personality/testimonials/image2.jpg",
    },
    {
      name: "Maria Garcia",
      handle: "@mariagarcia",
      text: "I've taken many personality tests before but this one truly stood out. The depth of insights I received helped me understand my communication style better.",
      avatarSrc: "/personality/testimonials/image3.jpg",
    },
    {
      name: "David Kim",
      handle: "@davidkim",
      text: "Absolutely loved the experience. Quick, accurate, and deeply insightful. I shared it with my entire team and everyone found value in their results.",
      avatarSrc: "/personality/testimonials/image1.jpg",
    },
  ],
];

const StarRow = () => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        width="19"
        height="19"
        viewBox="0 0 19 19"
        fill="var(--primary)"
      >
        <path d="M9.5 1.5L11.5 7H17.5L12.5 10.5L14.5 16.5L9.5 13L4.5 16.5L6.5 10.5L1.5 7H7.5L9.5 1.5Z" />
      </svg>
    ))}
  </div>
);

export default function Testimonials() {
  const [page, setPage] = useState(0);
  const current = testimonials[page];

  return (
    <section
      className="w-full py-14 md:py-20"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-[1250px] mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2
            className="font-['Manrope',sans-serif] font-medium text-[30px] sm:text-[38px] md:text-[46px] leading-[38px] sm:leading-[46px] md:leading-[56px] mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Real Stories. Real Self-Discovery.
          </h2>

          <p
            className="font-['Manrope',sans-serif] font-normal text-[15px] sm:text-[18px] md:text-[20px] leading-[24px] sm:leading-[26px] md:leading-[27px] max-w-[548px] mx-auto"
            style={{ color: "var(--muted-foreground)" }}
          >
            Thousands of users have uncovered strengths, communication styles,
            and career insights through our personality tests.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {current.map((t, i) => (
            <div
              key={i}
              className="rounded-[30px] overflow-visible relative pt-16 border transition-all duration-300"
              style={{
                borderColor: "rgba(0,0,0,0.06)",
                borderWidth: "1px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
                background: "var(--card)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 18px 40px rgba(15,23,42,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(0,0,0,0.04)";
              }}
            >
              {/* Avatar */}
              <div className="absolute -top-9 left-7">
                <div
                  className="relative w-[78px] h-[78px] rounded-full border-[4px] overflow-hidden"
                  style={{
                    borderColor: "rgba(255,255,255,0.92)",
                    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.10)",
                    background: "rgba(255,255,255,0.9)",
                  }}
                >
                  <Image
                    src={t.avatarSrc}
                    alt={t.name}
                    fill
                    sizes="78px"
                    className="object-cover object-center"
                    priority={page === 0 && i === 1}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="px-7 pb-7">
                <p
                  className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[24px] mb-5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {t.text}
                </p>

                <hr
                  className="mb-4"
                  style={{ borderColor: "var(--border)" }}
                />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="font-['Manrope',sans-serif] font-semibold text-[18px] leading-[25px]"
                      style={{ color: "var(--foreground)" }}
                    >
                      {t.name}
                    </p>

                    <p
                      className="font-['Manrope',sans-serif] font-normal text-[12px] leading-[16px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {t.handle}
                    </p>
                  </div>

                  <StarRow />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-3.5 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="h-[7px] rounded-full transition-all duration-300"
              style={{
                width: i === page ? "2.25rem" : "0.4375rem",
                background:
                  i === page
                    ? "var(--primary)"
                    : "var(--muted-foreground)",
                opacity: i === page ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
