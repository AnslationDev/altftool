"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import SkeletonHero from "./SkeletonHero";
import {  heroBannerService } from "../service/service";
import useReducedMotion from "@/hooks/useReducedMotion";

export default function HeroSection() {
     const timeoutRef = useRef(null);
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);
  const trackRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const activeIndex = slides.length ? Math.min(current, slides.length - 1) : 0;

  const goTo = useCallback(
    (idx) => {
      if (isAnimating || idx === current) return;
      setIsAnimating(true);
      setCurrent(() => idx);
      if (trackRef.current) {
        trackRef.current.scrollTo({
          left: trackRef.current.offsetWidth * idx,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
  

clearTimeout(timeoutRef.current);
timeoutRef.current = setTimeout(() => {
  setIsAnimating(false);
}, 600);
    },
    [isAnimating, current, reducedMotion]
  );

  const next = useCallback(() => {
  if (!slides.length) return;
  goTo((activeIndex + 1) % slides.length);
}, [activeIndex, goTo, slides]);

useEffect(() => {
  if (reducedMotion || !slides.length) return;

  timerRef.current = setInterval(next, 3500);
  return () => clearInterval(timerRef.current);
}, [next, slides.length, reducedMotion]);

const resetTimer = () => {
  if (reducedMotion || !slides.length) return;
  clearInterval(timerRef.current);
  timerRef.current = setInterval(next, 3500);
};

useEffect(() => {
  return () => clearTimeout(timeoutRef.current);
}, []);
const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);
useEffect(() => {
  const unsub = heroBannerService.subscribeAll((res) => {

    const activeSlides = (res || []).filter(
      (item) => item.status === "active"
    );

    setSlides(activeSlides);  
    setLoading(false);

  });

  return () => unsub();
}, []);

 if (!slides.length) {
  return <SkeletonHero />;
}

  return (
    <section className="section w-full animate-slide-up">
      {/* Slider wrapper */}
      <div
        ref={trackRef}
        className="flex w-full h-[180px] sm:h-[260px] md:h-[320px] lg:h-[420px] xl:h-[550px] rounded-xl sm:rounded-2xl overflow-x-hidden scroll-smooth"
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative flex-shrink-0 w-full h-full"
          >
            <Image
             src={slide.image}
              alt={`Banner ${slide.id}`}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority={slide.id === 1}
              className="object-fill "
            />
         
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-4 mt-6 animate-slide-up" style={{ animationDelay: "160ms" }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => {
              goTo(i);
              resetTimer();
            }}
            className={`h-2 rounded-full cursor-pointer transition-all duration-500 ease-in-out
              ${activeIndex === i
                ? "bg-(--primary) w-8 opacity-100"
                : "bg-[#1e3a8a] w-2 opacity-40"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
