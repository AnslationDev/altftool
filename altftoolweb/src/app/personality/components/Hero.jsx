"use client";

import Image from "next/image";

export default function Hero() {
  const cards = [
    {
      rotate: "md:rotate-[-7deg]",
      zIndex: "md:z-20",
      translate: "md:translate-y-0",
      imgSrc: "/personality/hero/Analyst.png",
      alt: "Analyst",
    },
    {
      rotate: "md:rotate-[7deg]",
      zIndex: "md:z-10",
      translate: "md:translate-y-10",
      imgSrc: "/personality/hero/Explorer.png",
      alt: "Explorer",
    },
    {
      rotate: "md:rotate-[4deg]",
      zIndex: "md:z-20",
      translate: "md:translate-y-0",
      imgSrc: "/personality/hero/Analyst2.png",
      alt: "Analyst 2",
    },
    {
      rotate: "md:rotate-[-7deg]",
      zIndex: "md:z-20",
      translate: "md:translate-y-8",
      imgSrc: "/personality/hero/Creative.png",
      alt: "Creative",
    },
  ];

  return (
    <section
      className="w-full pt-12 sm:pt-14 md:pt-16 pb-0 overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-[1250px] mx-auto px-6 flex flex-col items-center text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 badge rounded-full mb-8"
          style={{
            background: "var(--muted)",
            borderColor: "var(--border)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z"
              strokeWidth="1.33"
              strokeLinejoin="round"
              style={{ stroke: "var(--primary)" }}
            />
          </svg>

          <span
            className="text-[13px] sm:text-[14px] md:text-[15px] font-medium font-['Manrope',sans-serif]"
            style={{ color: "var(--primary)" }}
          >
            Discover Your Real Personality
          </span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1
            className="font-['Manrope',sans-serif] font-medium text-[32px] sm:text-[40px] md:text-[52px] lg:text-[60px] leading-[38px] sm:leading-[46px] md:leading-[58px] lg:leading-[66px]"
            style={{ color: "var(--foreground)" }}
          >
            Understand Yourself Better
          </h1>

          <h1
            className="font-['Manrope',sans-serif] font-medium text-[32px] sm:text-[40px] md:text-[52px] lg:text-[60px] leading-[38px] sm:leading-[46px] md:leading-[58px] lg:leading-[66px]"
            style={{ color: "var(--foreground)" }}
          >
            With Scientifically Inspired
          </h1>

          <h1
            className="font-['Manrope',sans-serif] font-medium text-[32px] sm:text-[40px] md:text-[52px] lg:text-[60px] leading-[38px] sm:leading-[46px] md:leading-[58px] lg:leading-[66px]"
            style={{ color: "var(--primary)" }}
          >
            Personality Tests
          </h1>
        </div>

        {/* Subtext */}
        <p
          className="font-['Manrope',sans-serif] font-normal text-[15px] sm:text-[16px] md:text-[18px] leading-[24px] sm:leading-[26px] md:leading-[28px] max-w-[672px] mb-6"
          style={{ color: "var(--muted-foreground)" }}
        >
          Take insightful personality assessments to uncover your strengths,
          communication style, career fit, and emotional traits.
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8.5"
                strokeWidth="1.67"
                style={{ stroke: "var(--primary)" }}
              />

              <path
                d="M10 6V10L12.5 12.5"
                strokeWidth="1.67"
                strokeLinecap="round"
                style={{ stroke: "var(--primary)" }}
              />
            </svg>

            <span
              className="font-['Manrope',sans-serif] font-semibold text-[15px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Takes - 60 seconds
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 1.67L15.83 4.17V9.17C15.83 12.87 13.33 16.25 10 18.33C6.67 16.25 4.17 12.87 4.17 9.17V4.17L10 1.67Z"
                strokeWidth="1.67"
                strokeLinejoin="round"
                style={{ stroke: "var(--primary)" }}
              />

              <path
                d="M7.5 10L9.17 11.67L12.92 7.92"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: "var(--primary)" }}
              />
            </svg>

            <span
              className="font-['Manrope',sans-serif] font-semibold text-[15px]"
              style={{ color: "var(--muted-foreground)" }}
            >
              No sign-up required
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className="btn-primary !rounded-full flex items-center gap-3 px-7 sm:px-8 py-3.5 font-['Manrope',sans-serif] text-[14px] sm:text-[15px] mb-5"
          style={{
            boxShadow: "0 8px 24px rgba(37, 99, 235, 0.2)",
          }}
        >
          Start Free Test

          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4.17 10H15.83M10.83 5L15.83 10L10.83 15"
              stroke="white"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Cards */}
        <div className="w-full pb-8">
          <div className="grid grid-cols-2 gap-3 place-items-center md:hidden">
            {cards.map((card, i) => (
              <div
                key={i}
                className="relative w-full max-w-[180px] sm:max-w-[220px] aspect-square rounded-[22px] overflow-hidden border-[6px] border-white/95 bg-[#dfe7f6] shadow-[0_18px_44px_rgba(0,0,0,0.08)]"
              >
                <div className="absolute inset-0 p-4 sm:p-5">
                  <div className="relative w-full h-full">
                    <Image
                      src={card.imgSrc}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 640px) 45vw, 220px"
                      className="object-contain object-center"
                      priority={i < 2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative hidden md:flex items-end justify-center w-full h-[420px] pb-8">
            {cards.map((card, i) => (
              <div
                key={i}
                className={`
                  relative
                  w-[300px]
                  h-[300px]
                  rounded-[34px]
                  overflow-hidden
                  flex-shrink-0
                  border-[8px]
                  border-white/95
                  bg-[#dfe7f6]
                  shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  ${card.rotate}
                  ${card.translate}
                  ${card.zIndex}

                  ${i !== 0 ? "-ml-4" : ""}
                `}
              >
                <div className="absolute inset-0 p-6">
                  <div className="relative w-full h-full">
                    <Image
                      src={card.imgSrc}
                      alt={card.alt}
                      fill
                      sizes="300px"
                      className="object-contain object-center"
                      priority={i < 2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
         
      </div>
    </section>
  );
}
