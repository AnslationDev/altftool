"use client";

import Image from "next/image";
import { Sparkles, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export default function Hero() {
  const cards = [
    {
      rotate: "md:rotate-[-6deg]",
      zIndex: "md:z-20",
      translate: "md:translate-y-0",
      spread: "-translate-x-[180px] translate-y-0 rotate-0",
      imgSrc: "/personality/hero/Analyst.png",
      alt: "Analyst",
    },
    {
      rotate: "md:rotate-[8deg]",
      zIndex: "md:z-10",
      translate: "md:translate-y-10",
      imgSrc: "/personality/hero/Explorer.png",
      spread: "-translate-x-[60px] translate-y-0 rotate-0",
      alt: "Explorer",
    },
    {
      rotate: "md:rotate-[-3deg]",
      zIndex: "md:z-20",
      translate: "md:translate-y-0",
      imgSrc: "/personality/hero/Analyst2.png",
      spread: "translate-x-[60px] translate-y-0 rotate-0",
      alt: "Analyst 2",
    },
    {
      rotate: "md:rotate-[-8deg]",
      zIndex: "md:z-20",
      translate: "md:translate-y-8",
      imgSrc: "/personality/hero/Creative.png",
      spread: "translate-x-[180px] translate-y-0 rotate-0",
      alt: "Creative",
    },
  ];
  const handleScroll = () => {
  const section = document.getElementById("personality-tests");

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

  return (
    <section
      className="pt-8 sm:pt-10 lg:pt-12"
    >
      <div className=" mx-auto flex flex-col items-center text-center ">
        {/* Badge */}
        <div
          className="
    inline-flex items-center gap-2
   px-3 sm:px-4 py-2
    rounded-full
    mb-6 sm:mb-8
    personality-pill
  "
        >
          <Sparkles className="w-5 h-5 text-[var(--primary)]" />

          <span className="text-[13px] sm:text-[14px] md:text-[15px]">
            Four-Trait Self-Reflection
          </span>
        </div>
        <div className="section-header px-4 sm:px-6 lg:px-0 ">
          <h1 className="section-title font-bold text-[32px] sm:text-[40px] md:text-[52px] lg:text-[60px] leading-[38px] sm:leading-[46px] md:leading-[58px] lg:leading-[66px]">
            {/*
              The {" "} entries are load-bearing. <br /> adds nothing to
              textContent and JSX drops the surrounding newlines, so this H1
              extracted without spaces between its visual lines. Whitespace
              before each line break keeps the rendered heading readable while
              preserving the three-line layout.
            */}
            Understand Your Answers Better{" "}
            <br />
            With a Simple Four-Question{" "}
            <br />
            <span className="personality-gradient-text">Personality Snapshot</span>
          </h1>

          <p className="section-subtitle max-w-[520px] sm:max-w-xl">
            Answer four self-reflection questions and compare your structure,
            leadership, social-energy, and planning preferences.
          </p>
        </div>



        {/* Meta info */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">

            <Clock className="stroke-(--primary) w-5 h-5 " />

            <span
              className="text-(--muted-foreground) font-semibold "
            >
              4 short questions
            </span>
          </div>

          <div className="flex items-center gap-2">

            <ShieldCheck className="stroke-(--primary) w-5 h-5" />

            <span
              className="font-semibold text-[15px] text-(--muted-foreground) "

            >
              No sign-up required
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
         onClick={handleScroll}
          className="personality-primary-action rounded-full flex items-center gap-3 px-3 sm:px-6 py-3 sm:py-3.5 mb-2 sm:mb-0 text-[14px] sm:text-[15px] transition-all"

        >
          Start Free Test

          <ArrowRight className="w-5 h-5" />
        </button>


        {/* Cards */}
        <div className="w-full pb-8">
          {/* Mobile/Tablet Grid — shown below xl */}
          <div className=" md:hidden
    flex
    items-center
    overflow-x-auto
   gap-5
   scroll-smooth
px-[7.5%] sm:px-[15%]
    
    pb-4
    pt-2
    snap-x
    snap-mandatory
    scrollbar-hide
    no-scrollbar
    w-full">
            {cards.map((card, i) => (
              <div
                key={i}
                className="relative min-w-[85%]
  sm:min-w-[70%]
  md:min-w-[45%]
  lg:min-w-[320px] aspect-square rounded-[22px] overflow-hidden border-[6px] personality-visual-tile"
              >
                <div className="absolute inset-0 p-4 sm:p-5 md:p-6">
                  <div className="relative w-full h-full">
                    <Image
                      src={card.imgSrc}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 320px"
	                      className="object-contain object-center"
	                      priority={i < 2}
	                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Flex — shown from xl and above */}
          <div className="group relative hidden md:flex items-center justify-center w-full min-h-[380px] lg:min-h-[460px]
    xl:min-h-[520px]
    2xl:min-h-[620px] overflow-hidden">
            {cards.map((card, i) => (
              <div
                key={i}
                className={`
          relative
          w-[180px]
h-[180px]

md:w-[220px]
md:h-[220px]

lg:w-[250px]
lg:h-[250px]

xl:w-[300px]
xl:h-[300px]

2xl:w-[340px]
2xl:h-[340px]
          rounded-[34px]
          overflow-hidden
          flex-shrink-0
          border-[8px]
          personality-visual-tile
          transition-all
          duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${card.rotate}
          ${i === 0 ? "group-hover:-translate-x-[60px] lg:group-hover:-translate-x-[80px] xl:group-hover:-translate-x-[110px] group-hover:translate-y-0 group-hover:rotate-0" : ""}

${i === 1 ? "group-hover:-translate-x-[20px] lg:group-hover:-translate-x-[28px] xl:group-hover:-translate-x-[35px] group-hover:translate-y-0 group-hover:rotate-0" : ""}

${i === 2 ? "group-hover:translate-x-[20px] lg:group-hover:translate-x-[28px] xl:group-hover:translate-x-[35px] group-hover:translate-y-0 group-hover:rotate-0" : ""}

${i === 3 ? "group-hover:translate-x-[60px] lg:group-hover:translate-x-[80px] xl:group-hover:translate-x-[110px] group-hover:translate-y-0 group-hover:rotate-0" : ""}
          ${card.translate}
          ${card.zIndex}
          ${i !== 0 ? "-ml-12 2xl:-ml-1" : ""}
        `}
              >
                <div className="absolute inset-0 ">
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
