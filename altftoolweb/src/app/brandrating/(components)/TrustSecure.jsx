"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

import t1 from "../(assets)/trusted1.png";
import t2 from "../(assets)/privacy.png";
import t3 from "../(assets)/reviews.png";
import { ShieldCheck, LockKeyhole, BadgeCheck } from "lucide-react";

const cards = [
  {
    title: "Trusted & Secure",
    desc: `Build confidence with every decision. We prioritize your privacy, security, and trust—so you can explore, compare, and choose products with complete peace of mind.`,
    image: t1,
    icon: ShieldCheck,
  },
  {
    title: "Data Privacy First",
    desc: `Build confidence with every decision. We prioritize your privacy, security, and trust—so you can explore, compare, and choose products with complete peace of mind.`,
    image: t2,
    icon: LockKeyhole,
  },
  {
    title: "Honest Reviews",
    desc: `Build confidence with every decision. We prioritize your privacy, security, and trust—so you can explore, compare, and choose products with complete peace of mind.`,
    image: t3,
    icon: BadgeCheck,
  },
];

const translateClass = ["translate-x-0", "-translate-x-full", "-translate-x-[200%]"];

function TrustSecure() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    setActive(idx);
  }, []);

  const next = useCallback(() => {
    goTo((active + 1) % cards.length);
  }, [active, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 3000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 3000);
  };

  return (
    <section className="py-10 md:py-14 section animate-slide-up">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Slider track */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
          <div
            className={`flex transition-transform duration-500 ease-in-out ${translateClass[active]}`}
          >
            {cards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={index}
                  className="
                    min-w-full bg-[var(--search-buysmart,#eef1f8)]
                    flex flex-col md:flex-row items-center justify-between
                    gap-5 sm:gap-6 lg:gap-10
                    px-5 sm:px-10 md:px-10 lg:px-16
                    py-8 sm:py-10 md:py-14
                  "
                >
                  {/* Text */}
                  <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-3 sm:gap-4 sm:gap-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 flex-shrink-0 text-[var(--primary)]" />
                      <h2 className="font-bold text-[20px] sm:text-[26px] md:text-[28px] lg:text-[40px] leading-tight text-[var(--foreground)]">
                        {card.title}
                      </h2>
                    </div>

                    <p className="text-[var(--muted-foreground)] text-[13px] sm:text-[14px] lg:text-[17px] leading-[160%] text-center md:text-left max-w-[360px] sm:max-w-[420px]">
                      {card.desc}
                    </p>
                  </div>

                  {/* Image */}
                  <div className="flex-shrink-0 flex justify-center items-center w-[140px] sm:w-[190px] md:w-[170px] lg:w-[280px]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      className="w-full h-auto object-contain drop-shadow-xl"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-5 sm:mt-6 gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ease-in-out
                ${
                  active === i
                    ? "w-6 bg-[var(--primary)] opacity-100"
                    : "w-2.5 bg-[var(--muted-foreground)] opacity-40 hover:opacity-70"
                }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default TrustSecure;
