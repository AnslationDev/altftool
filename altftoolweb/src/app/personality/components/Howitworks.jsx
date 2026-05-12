"use client";

import Image from "next/image";

const steps = [
  {
    num: "01",
    title: "Answer Questions",
    desc: "Respond to carefully designed personality-based scenarios in just a few minutes.",
    imgSrc: "/personality/how-it-works/Answer.png",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="2" width="11" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.87"/>
        <path d="M7 7H11M7 10H9.5" stroke="currentColor" strokeWidth="1.87" strokeLinecap="round"/>
      </svg>
    ),
    cardBg: "from-blue-50 to-indigo-100",
  },
  {
    num: "02",
    title: "AI-Powered Analysis",
    desc: "Our advanced system analyzes your responses, behavioral patterns and emotional traits.",
    imgSrc: "/personality/how-it-works/Ai.png",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C6.13 2 3 5.13 3 9C3 12.87 6.13 16 10 16C13.87 16 17 12.87 17 9C17 5.13 13.87 2 10 2Z" stroke="currentColor" strokeWidth="1.87"/>
        <path d="M10 6V9L12 11" stroke="currentColor" strokeWidth="1.87" strokeLinecap="round"/>
        <path d="M7 17.5C8.27 17.83 9.13 18 10 18C10.87 18 11.73 17.83 13 17.5" stroke="currentColor" strokeWidth="1.87" strokeLinecap="round"/>
      </svg>
    ),
    cardBg: "from-sky-50 to-blue-100",
  },
  {
    num: "03",
    title: "Get Personalized Insights",
    desc: "Receive detailed personality insights, strengths, and growth recommendations instantly.",
    imgSrc: "/personality/how-it-works/Get.png",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.87"/>
        <path d="M6 13L8.5 10L11 12L14 8" stroke="currentColor" strokeWidth="1.87" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    cardBg: "from-indigo-50 to-violet-100",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-14 md:py-20" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1250px] mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="font-['Manrope',sans-serif] font-medium text-[30px] sm:text-[38px] md:text-[44px] leading-[38px] sm:leading-[46px] md:leading-[56px] tracking-[-1px] max-w-[623px] mx-auto mb-4" style={{ color: 'var(--foreground)' }}>
            Discover Your Personality In Just Easy 3 Steps
          </h2>
          <p className="font-['Manrope',sans-serif] font-normal text-[15px] sm:text-[18px] md:text-[20px] leading-[24px] sm:leading-[26px] md:leading-[27px] max-w-[464px] mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Our science-backed assessments and advanced AI deliver deep insights in just a few simple steps.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="card rounded-[30px] overflow-hidden flex flex-col border transition-all"
              style={{ boxShadow: "var(--anslation-ds-shadow-sm)", borderColor: "var(--border)", background: "var(--card)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--anslation-ds-shadow-lg)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--anslation-ds-shadow-sm)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Image area */}
              <div
                className="mx-6 mt-6 h-[200px] sm:h-[220px] rounded-[22px] flex items-center justify-center relative overflow-hidden"
                style={{ background: "var(--muted)" }}
              >
                {/* Step number badge (overlay like design) */}
                <div
                  className="absolute top-4 left-4 w-11 h-11 rounded-full flex items-center justify-center z-20"
                  style={{ background: 'var(--primary)', boxShadow: '0 9px 14px -3px rgba(37, 99, 235, 0.3)' }}
                >
                  <span className="font-['Inter',sans-serif] font-bold text-white text-[18px]">
                    {step.num}
                  </span>
                </div>

                {/* Mobile/tablet: contain so image never crops */}
                <div className="absolute inset-0 p-5 sm:p-6 md:hidden z-10">
                  <div className="relative w-full h-full">
                    <Image
                      src={step.imgSrc}
                      alt={step.title}
                      fill
                      sizes="(max-width: 767px) 90vw, 0px"
                      className="object-contain object-center"
                    />
                  </div>
                </div>

                {/* Desktop+: keep previous look (cover) */}
                <div className="absolute inset-0 hidden md:block z-10">
                  <Image
                    src={step.imgSrc}
                    alt={step.title}
                    fill
                    sizes="(min-width: 1024px) 320px, (min-width: 768px) 260px, 90vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/5 to-transparent" />
              </div>

              {/* Content */}
              <div className="px-7 pt-6 pb-7 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-['Inter',sans-serif] font-bold text-[19px] leading-[27px] mb-1" style={{ color: 'var(--foreground)' }}>
                    {step.title}
                  </h3>
                  <p className="font-['Inter',sans-serif] font-normal text-[14px] leading-[22px]" style={{ color: 'var(--muted-foreground)' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
