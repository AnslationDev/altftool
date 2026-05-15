"use client";

import Image from "next/image";

import { ClipboardList, Brain, ChartNoAxesColumn } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Answer Questions",
    desc: "Respond to carefully designed personality-based scenarios in just a few minutes.",
    imgSrc: "/personality/how-it-works/Answer.png",
    icon: <ClipboardList />,
    cardBg: "from-blue-50 to-indigo-100",
  },
  {
    num: "02",
    title: "AI-Powered Analysis",
    desc: "Our advanced system analyzes your responses, behavioral patterns and emotional traits.",
    imgSrc: "/personality/how-it-works/Ai.png",
    icon: <Brain />,
    cardBg: "from-sky-50 to-blue-100",
  },
  {
    num: "03",
    title: "Get Personalized Insights",
    desc: "Receive detailed personality insights, strengths, and growth recommendations instantly.",
    imgSrc: "/personality/how-it-works/Get.png",
    icon: <ChartNoAxesColumn />,
    cardBg: "from-indigo-50 to-violet-100",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" >
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-4xl mx-auto justify-center items-center mb-10 sm:mb-12 lg:mb-14">
          <h2 className="section-title max-w-2xl mx-auto text-center" >
            Discover Your Personality In Just Easy 3 Steps
          </h2>
          <p className="section-subtitle max-w-xl  text-center" >
            Our science-backed assessments and advanced AI deliver deep insights in just a few simple steps.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-(--card) group rounded-[24px] sm:rounded-[28px] xl:rounded-[30px] overflow-hidden flex flex-col xl:flex-col border transition-all duration-300 ease-out border-(--border) shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] hover:shadow-[0px_10px_30px_rgba(0,0,0,0.08)]"
             
            >
              {/* Image area */}
              <div
                className="mx-4 mt-4 sm:mx-5 sm:mt-5 lg:mx-6 lg:mt-6 h-[190px] xs:h-[220px] sm:h-[230px] md:h-[260px] lg:h-[300px] xl:h-[260px] 2xl:h-[300px] rounded-[18px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden group"

              >
                {/* Step number badge (overlay like design) */}
                <div
                  className="absolute top-4 left-4 w-11 h-11 rounded-full flex items-center justify-center z-20 bg-(--primary)"
                >
                  <span className="px-7 pt-6 pb-7 md:py-6 md:pr-6 md:pl-4 flex items-start gap-4 md:flex-1 font-bold text-white text-[18px]">
                    {step.num}
                  </span>
                </div>

                {/* Mobile/tablet*/}
                <div className="absolute inset-0  p-4 sm:p-5  md:hidden z-10">
                  <div className="relative w-full h-full">
                    <Image
                      src={step.imgSrc}
                      alt={step.title}
                      fill
	                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 320px"
	                      className="object-contain object-center transition-transform duration-500 group-hover:scale-110"
                        unoptimized
	                    />
                  </div>
                </div>

                {/* Desktop+: keep previous look (cover) */}
                <div className="absolute inset-0 hidden md:block z-10">
                  <Image
                    src={step.imgSrc}
                    alt={step.title}
                    fill
	                    sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 90vw"
	                    className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      unoptimized
	                  />
                </div>
                <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/5 to-transparent" />
              </div>

              {/* Content */}
              <div className="px-4 sm:px-5 lg:px-7 pt-4 sm:pt-5 lg:pt-6 pb-5 sm:pb-6 lg:pb-7 flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-(--primary)/10 text-(--primary)" >
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[16px] sm:text-[18px] lg:text-[20px] leading-[23px] sm:leading-[26px] lg:leading-[28px] mb-1 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="font-normal text-[13px] sm:text-[14px] leading-[21px] sm:leading-[22px] text-(--muted-foreground)" >
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
