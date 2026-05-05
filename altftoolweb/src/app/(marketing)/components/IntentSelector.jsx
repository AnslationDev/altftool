"use client";

import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Gamepad2,
  Zap,
  Newspaper,
  Tag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const intents = [
  { icon: Briefcase, title: "Be Productive", description: "Tools to boost your workflow", href: "/tools" },
  { icon: Gamepad2, title: "Have Fun", description: "Games and entertainment", href: "/games" },
  { icon: Zap, title: "Quick Utilities", description: "Fast, simple tools", href: "/tools" },
  { icon: Newspaper, title: "Stay Updated", description: "News and trending content", href: "/news" },
  { icon: Tag, title: "Find Deals", description: "Best offers and discounts", href: "/exclusivedeals" },
];

export default function IntentSelector() {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(null);

  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const pauseRef = useRef(false);

  /* -------------------------------
     Auto slide (mobile only)
  --------------------------------*/
  useEffect(() => {
    const timer = setInterval(() => {
      if (pauseRef.current) return;
      setIndex((p) => (p === intents.length - 1 ? 0 : p + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  /* -------------------------------
     Scroll to active card
  --------------------------------*/
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const child = track.children[index];
    if (!child) return;

    track.scrollTo({
      left: child.offsetLeft - 16,
      behavior: "smooth",
    });
  }, [index]);

  return (
    <section className="section">
      {/* <div className="mx-auto  px-0 space-y-8"> */}

      {/* Header */}
      <div className="section-header mb-12  animate-slide-up">
        <h2 className="section-title">
          What do you want to do{" "}
          <span className="text-[var(--primary)]">right now</span>?
        </h2>

        <p className="section-subtitle">
          Choose your vibe and we’ll guide you to the perfect tools
        </p>
      </div>

      {/* ================= MOBILE SLIDER ================= */}
      <div
        ref={trackRef}
        className="md:hidden flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 pb-2"
        onTouchStart={() => (pauseRef.current = true)}
        onTouchEnd={() => (pauseRef.current = false)}
      >
        {intents.map((intent) => {
          const Icon = intent.icon;

          return (
            <div key={intent.title} className="snap-start shrink-0 w-[85%] ">
              <Link
                href={intent.href}
                className="group block rounded-2xl border border-[var(--card-border)]
                  bg-[var(--card)] p-5 text-center transition duration-300 
                  hover:-translate-y-1 hover:border-[var(--primary)] animate-slide-up"
              >
                <div className="flex flex-col items-center ">

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center  mb-3 transition group-hover:scale-105">
                    <Icon className="w-6 h-6 text-[var(--foreground)]" />
                  </div>

                  <h3 className="font-semibold text-sm mb-1 text-[var(--foreground)]">
                    {intent.title}
                  </h3>

                  <p className="text-xs text-[var(--secondary-foreground)] mb-2">
                    {intent.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs font-medium text-[var(--foreground)] opacity-80 group-hover:opacity-100">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>

                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP GRID ================= */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-10 xl:gap-12">
        {intents.map((intent, i) => {
          const Icon = intent.icon;
          const isHovered = hovered === i;

          return (
            <Link
              key={intent.title}
              href={intent.href}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group relative rounded-2xl border border-[var(--border)]
                bg-[var(--card)] hover:bg-[var(--card-hover)] p-6 lg:p-6 xl:p-6 text-center
                transition duration-300 hover:-translate-y-2 lg:hover:-translate-y-3
                hover:border-[var(--primary)] hover:scale-[1.03] animate-slide-up"
            >

              <div className="flex flex-col items-center">

                {/* Icon */}
                <div
                  className={`rounded-2xl flex items-center justify-center
                    bg-[var(--badge-bg)] mb-4 transition-all duration-300
                    w-14 h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18
                    ${isHovered ? "scale-110" : ""}`}
                >
                  <Icon className={`w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 ${theme === "dark" ? "text-white" : "text-[var(--primary)]"
                    }`} />

                </div>

                {/* Title */}
                <h3 className="font-semibold text-base lg:text-lg xl:text-xl mb-1 text-[var(--foreground)]">
                  {intent.title}
                </h3>

                {/* Description */}
                <p className="text-xs lg:text-sm xl:text-base text-[var(--muted-foreground)] mb-3">
                  {intent.description}
                </p>

                {/* CTA */}
                <div
                  className={`flex items-center gap-1 text-xs lg:text-sm font-medium text-[var(--primary)]
                    transition-all duration-300
                    ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                >
                  Explore <ArrowRight className="w-3 h-3" />
                </div>

              </div>
            </Link>
          );
        })}
      </div>

      {/* </div> */}
    </section>
  );
}