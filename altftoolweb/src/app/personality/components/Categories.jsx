"use client";

import Image from "next/image";

const tests = [
  {
    title: "Career Personality Test",
    desc: "Discover careers aligned with your strengths and working style.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Career.png",
  },
  {
    title: "Emotional Intelligence",
    desc: "Discover careers aligned with your strengths and working style.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Emotional.png",
  },
  {
    title: "Leadership Style",
    desc: "Discover your leadership approach and how you inspire others.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Leadership.png",
  },
  {
    title: "Introvert vs Extrovert",
    desc: "Understand your energy style and how you interact with the world.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Introvert.png",
  },
  {
    title: "Relationship Personality",
    desc: "Explore your relationship patterns and build stronger connections.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Relationship.png",
  },
  {
    title: "Communication Style",
    desc: "Explore your relationship patterns and build stronger connections.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Communication.png",
  },
];

export default function Categories() {
  return (
    <section
      className="w-full py-14 md:py-10"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-[1250px] mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2
            className="font-['Manrope',sans-serif] font-medium text-[30px] sm:text-[38px] md:text-[46px] leading-[38px] sm:leading-[46px] md:leading-[56px] max-w-[675px] mx-auto mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Explore Personality Tests Designed For You
          </h2>

          <p
            className="font-['Manrope',sans-serif] font-normal text-[15px] sm:text-[18px] md:text-[20px] leading-[24px] sm:leading-[26px] md:leading-[27px] max-w-[548px] mx-auto"
            style={{ color: "var(--muted-foreground)" }}
          >
            Discover scientifically inspired assessments for career growth,
            relationships, self-awareness, and communication.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tests.map((test, i) => (
            <div
              key={i}
              className="rounded-[28px] overflow-hidden flex flex-col group transition-all border"
              style={{
                borderColor: "rgba(0,0,0,0.06)", // thinner/lighter border
                borderWidth: "1px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
                background: "var(--card)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 18px 40px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(0,0,0,0.04)";
              }}
            >
              {/* Image */}
              <div className="p-5 pb-0">
                <div
                  className="relative w-full h-[200px] sm:h-[230px] rounded-[20px] overflow-hidden"
                  style={{ background: "var(--muted)" }}
                >
                  {/* Mobile/tablet: contain so image never crops */}
                  <div className="absolute inset-0 p-5 sm:p-6 md:hidden">
                    <div className="relative w-full h-full">
                      <Image
                        src={test.imgSrc}
                        alt={test.title}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 767px) 90vw, 0px"
                        className="object-contain object-center"
                      />
                    </div>
                  </div>

                  {/* Desktop+: keep previous look (cover) */}
                  <div className="absolute inset-0 hidden md:block">
                    <Image
                      src={test.imgSrc}
                      alt={test.title}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1024px) 360px, (min-width: 768px) 300px, 90vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pt-5 pb-6 flex-1 flex flex-col">
                <h3
                  className="font-['Inter',sans-serif] font-bold text-[20px] leading-[30px] mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {test.title}
                </h3>

                {/* People */}
                <div className="flex items-center gap-1.5 mb-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M2.5 13C2.5 10.79 4.24 9 6.5 9C7.5 9 8.41 9.38 9.09 10M9.5 5.5C9.5 6.88 8.38 8 7 8C5.62 8 4.5 6.88 4.5 5.5C4.5 4.12 5.62 3 7 3C8.38 3 9.5 4.12 9.5 5.5Z"
                      stroke="var(--primary)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 13C14 10.79 12.26 9 10 9"
                      stroke="var(--primary)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 5C12 6.38 10.88 7.5 9.5 7.5"
                      stroke="var(--primary)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>

                  <span
                    className="font-['Manrope',sans-serif] font-semibold text-[12px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {test.people}
                  </span>
                </div>

                {/* Bottom */}
                <div className="mt-auto flex items-end justify-between gap-4">
                  <p
                    className="font-['Inter',sans-serif] font-normal text-[14px] leading-[23px] max-w-[220px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {test.desc}
                  </p>

                  <button
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: "var(--primary)",
                      boxShadow:
                        "0 10px 20px rgba(37, 99, 235, 0.18)",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M3.75 9H14.25M9.75 4.5L14.25 9L9.75 13.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
