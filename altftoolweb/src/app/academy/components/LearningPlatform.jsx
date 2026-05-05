"use client";

import Image from "next/image";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { LearningPlatformSkeleton } from "@/components/ui/skeleton";

export default function LearningPlatform({ loading = false }) {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode =
        document.documentElement.getAttribute("data-theme") === "dark";
      setIsDark(isDarkMode);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return <LearningPlatformSkeleton />;
  }
  return (
    <section className="section animate-slide-up">

      <div className=" grid lg:grid-cols-2  gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-28 items-center">
        <div className="animate-slide-right">
          <h1 className="section-title ">
            {/* <span className="flex flex-wrap items-center  gap-x-[0.5em]"> */}

            Find The Best Learning
            <br />
            Platforms All In One Place
          </h1>


          {/* <p className="academy-subheading max-w-[620px] "> */}
          <p className="section-subtitle">
            Access the best platforms for exams, skills, and career growth without the need to compare countless option
          </p>


          <div className="mt-[clamp(1.25rem,3vw,2rem)] space-y-[clamp(0.5rem,1.5vw,1.25rem)]">

            {[
              "Discover platforms tailored to your goals",
              "Compare top options in seconds",
              "Start learning directly from trusted sources",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-slide-right"
                style={{ animationDelay: `${120 + i * 100}ms` }}
              >


                <div className="w-[clamp(2rem,3vw,2.5rem)] h-[clamp(2rem,3vw,2.5rem)] flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white">
                  <ChevronRight className="w-[clamp(0.875rem,1.25vw,1.25rem)] h-[clamp(0.875rem,1.25vw,1.25rem)]" />
                </div>

                <p className="text-(--foreground) font-bold  text-[clamp(0.9rem,1.4vw,1.25rem)] leading-snug sm:leading-relaxed md:leading-[1.7]">
                  {item}
                </p>
              </div>
            ))}

          </div>


          <button
            onClick={() => document.getElementById("academy-card")?.scrollIntoView({ behavior: "smooth" })}
            className="academy-btn mt-5 sm:mt-7" >
            <span >Browse Platforms </span>
            <span className="academy-btn-icon">
              <ArrowUpRight className="icon-out" />
              <ArrowUpRight className="icon-in" />
            </span>
          </button>

        </div>


        <div className="relative flex justify-center animate-slide-left" style={{ animationDelay: "180ms" }}>
          <Image
            src={isDark
              ? "/academy/learning-platform/about-dark.png"
              : "/academy/learning-platform/about.png"}
            alt="student"
            width={500}
            height={700}
            className="object-contain w-full max-w-[clamp(200px,40vw,500px)] h-auto h-auto lg:max-h-[clamp(300px,55vh,650px)] lg:w-auto lg:max-w-full"
          />



        </div>
      </div>
    </section>
  );
}
