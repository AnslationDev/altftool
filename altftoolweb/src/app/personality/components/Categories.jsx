"use client";

import Image from "next/image";
import { Users, ArrowRight, BriefcaseBusiness } from "lucide-react";
import { useRef, useState } from "react";
import PersonalityLoader from "./PersonalityLoader";
import { useRouter } from "next/navigation";

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
    imgSrc: "/personality/categories/Emotion.png",
  },
  {
    title: "Leadership Style",
    desc: "Discover your leadership approach and how you inspire others.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/lead.png",
  },
  {
    title: "Introvert vs Extrovert",
    desc: "Understand your energy style and how you interact with the world.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Intro.png",
  },
  {
    title: "Relationship Personality",
    desc: "Explore your relationship patterns and build stronger connections.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Relation.png",
  },
  {
    title: "Communication Style",
    desc: "Explore your relationship patterns and build stronger connections.",
    people: "1.2k People Took This Test",
    imgSrc: "/personality/categories/Communicate.png",
  },
];

export default function Categories() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? tests : tests.slice(0, 6);
  const [loading, setLoading] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const router = useRouter();

  const scrollRef = useRef(null);
  const handleCardClick = () => {
    setLoading(true);

    setTimeout(() => {
      router.push("/personality/question/1");
    }, 3500);
  };
  if (loading) {
    return <PersonalityLoader />;
  }
  return (
    <section id="personality-tests" className="section">
      <div className="max-w-full mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="section-title max-w-[675px] mx-auto">
            Explore Personality Tests Designed For You
          </h2>
          <p className="section-subtitle max-w-[548px] mx-auto">
            Discover scientifically inspired assessments for career growth,
            relationships, self-awareness, and communication.
          </p>
        </div>


        <div className="relative lg:hidden">

          <div
            ref={scrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;

              const cardWidth = el.scrollWidth / tests.length;

              setMobileIndex(
                Math.min(
                  Math.round(el.scrollLeft / cardWidth),
                  tests.length - 1
                )
              );
            }}
            className="
      flex gap-3
      overflow-x-auto overflow-y-hidden
      no-scrollbar scrollbar-hide
      snap-x snap-mandatory
      scroll-smooth
      pb-4
      px-1
      w-full max-w-full
    "
          >
            {tests.map((test, i) => (
              <div
                key={i}
                className="
          rounded-[28px]
          overflow-hidden
          flex flex-col
          group
          transition-all
          border border-(--border)
          bg-(--card)
          shadow-[0px_8px_30px_0px_rgba(0,0,0,0.04)]
          hover:shadow-[0px_18px_40px_0px_rgba(0,0,0,0.08)]
          hover:-translate-y-1
          cursor-pointer
          flex-shrink-0
          w-[75vw]
          sm:w-[48%]
          snap-center
        "
              >
                {/* Image */}
                <div className="p-2 pb-0">
                  <div className="relative w-full h-[200px] sm:h-[230px] rounded-[20px] overflow-hidden bg-muted">
                    <div className="absolute inset-0 p-2 lg:p-6 z-10">
                      <div className="relative w-full h-full">
                        <Image
                          src={test.imgSrc}
                          alt={test.title}
                          fill
                          priority={i === 0}
                          sizes="75vw"
                          className="object-contain object-center"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 md:pt-5 pb-2 md:pb-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-[18px] leading-[28px] mb-1">
                    {test.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-3">
                    <Users className="text-(--primary) fill-(--primary) h-5 w-5" />

                    <span className="font-semibold text-[12px] text-(--muted-foreground)">
                      {test.people}
                    </span>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-4">
                    <p className="leading-[23px] max-w-xl text-(--muted-foreground)">
                      {test.desc}
                    </p>

                    <button onClick={handleCardClick} className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-(--primary) shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:scale-105 transition-all">
                      <ArrowRight className="text-white h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Live Indicator */}
          <div className="flex justify-center gap-2 mt-2 lg:hidden">
            {tests.map((_, i) => (
              <span
                key={i}
                className={`
                     rounded-full transition-all duration-300
                     ${mobileIndex === i
                    ? "w-6 h-2 bg-(--primary)"
                    : "w-2 h-2 bg-gray-300"
                  }
               `}
              />
            ))}
          </div>

        </div>
      </div>


      {/* ── md+ grid ── */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-5">
        {visible.map((test, i) => (
          <div
            key={i}
            className="rounded-[28px] overflow-hidden flex flex-col group transition-all border border-(--border) bg-(--card) shadow-[0px_8px_30px_0px_rgba(0,0,0,0.04)] hover:shadow-[0px_18px_40px_0px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer"
          >
            {/* Image */}
            <div className="p-5 pb-0">
              <div className="relative w-full h-[200px] md:h-[210px] lg:h-[230px] 2xl:h-[280px] rounded-[20px]  overflow-hidden bg-muted">
                {/* md: contain */}
                <div className="absolute inset-0 p-5 md:block lg:hidden z-10">
                  <div className="relative w-full h-full">
                    <Image
                      src={test.imgSrc}
                      alt={test.title}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 768px) 45vw, 0px"
                      className="object-contain object-center"
                      unoptimized
                    />
                  </div>
                </div>

                {/* lg cover */}
                <div className="absolute inset-0 hidden lg:block z-10">
                  <Image
                    src={test.imgSrc}
                    alt={test.title}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 360px, 300px"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 md:px-5 lg:px-6 pt-5 pb-6 flex-1 flex flex-col">
              <h3 className="font-bold text-[17px] md:text-[17px] lg:text-[20px] leading-[30px] mb-1">
                {test.title}
              </h3>
              <div className="flex items-center gap-1.5 py-3">
                <Users className="text-(--primary) fill-(--primary) h-5 w-5" />
                <span className="font-semibold text-[12px] text-(--muted-foreground)">
                  {test.people}
                </span>
              </div>
              <div className="mt-auto flex items-end justify-between gap-4">
                <p className="leading-[23px] max-w-xl text-(--muted-foreground)">
                  {test.desc}
                </p>
                <button onClick={handleCardClick} className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-(--primary) shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:scale-105 transition-all">
                  <ArrowRight className="text-white h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More — md+ only, only when tests > 6 */}
      {tests.length > 6 && (
        <div className="hidden md:flex justify-center mt-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-8 py-3 rounded-full border border-(--border) bg-(--card) text-(--foreground) font-semibold text-[14px] hover:bg-(--primary) hover:text-white hover:border-(--primary) transition-all shadow-sm"
          >
            {showAll ? "Show Less" : "Load More"}
          </button>
        </div>
      )}

    </section >
  );
}
