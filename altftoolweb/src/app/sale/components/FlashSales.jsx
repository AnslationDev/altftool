"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SaleCard from "./SaleCard";

export default function FlashSales({ flashSales }) {
  const scrollRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);

    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;

    setCanScrollRight(!end);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);

    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };


  const [time, setTime] = useState({
  hours: "00",
  minutes: "00",
  seconds: "00",
});

useEffect(() => {
  const target = new Date().getTime() + 1000 * 60 * 60 * 24; // 24 hrs

  const interval = setInterval(() => {
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      clearInterval(interval);
      return;
    }

    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    setTime({
      hours: String(hrs).padStart(2, "0"),
      minutes: String(mins).padStart(2, "0"),
      seconds: String(secs).padStart(2, "0"),
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);

  return (
    <section className="section bg-(--background)">
      {/* Heading */}
      <div className="mb-6 md:mb-8">
        <h2 className="section-title text-left! mb-2">Flash Sales</h2>

        <p className="text-(--muted-foreground) text-sm md:text-lg font-secondary">
          Limited-Time Deals On Top Picks. Grab Them Before They’re Gone.
        </p>
      </div>

      {/* Wrapper */}
      <div
        className="relative bg-(--flashsale-salelocator) rounded-3xl p-5 md:p-6"
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-5 md:gap-6">

          {/*        LEFT BIG IMAGE     */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block shrink-0 w-60 lg:w-69"
          >
            <div className="relative h-90 rounded-[18px] overflow-hidden">
              <Image
                src={flashSales.banner.image}
                alt="Flash Banner"
                fill
                sizes="(max-width: 1024px) 240px, 276px"
                className="object-cover"
              />

              
             {/* timer overlay */}
             <div className="absolute bottom-7 left-4 right-4">
               <div className=" bg-[#0239be] dark:bg-[#162342] border border-[#42affe] rounded-xl px-3 py-3">
                 
                 <div className="flex items-center justify-center gap-3">
      
                   {/* HOURS */}
                   <div className="bg-[#032170] text-white rounded-lg w-15 h-15 flex flex-col items-center justify-center">
                     <span className="text-2xl font-bold">{time.hours}</span>
                     <span className="text-[11px] opacity-70">HRS</span>
                   </div>

                   <span className="text-white font-bold text-2xl">:</span>

                   {/* MINUTES */}
                   <div className="bg-[#022272] text-white rounded-lg w-15 h-15 flex flex-col items-center justify-center">
                     <span className="text-2xl font-bold">{time.minutes}</span>
                     <span className="text-[11px] opacity-70">MINS</span>
                   </div>

                   <span className="text-white font-bold text-2xl">:</span>
             
                   {/* SECONDS */}
                   <div className="bg-[#022272] text-white rounded-lg w-15 h-15 flex flex-col items-center justify-center">
                     <span className="text-2xl font-bold">{time.seconds}</span>
                     <span className="text-[11px] opacity-70">SECS</span>
                   </div>

                 </div>
               </div>
             </div>
            </div>
          </motion.div>

          {/*         RIGHT PRODUCTS    */}
          <div className="relative flex-1 overflow-hidden">
            {/* LEFT SCROLL BTN */}
            {isHovered && canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="
            hidden lg:flex cursor-pointer
            absolute left-2 top-1/2 -translate-y-1/2 z-20
            h-10 w-10 rounded-full bg-white shadow-lg text-gray-800
            items-center justify-center group
          "
              >
                <ChevronLeft className="h-5 w-5 group-hover:scale-115" />
              </button>
            )}

            {/* RIGHT SCROLL BTN */}
            {isHovered && canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="
            hidden lg:flex cursor-pointer
            absolute right-2 top-1/2 -translate-y-1/2 z-20
            h-10 w-10 rounded-full bg-white shadow-lg text-gray-800
            items-center justify-center group
          "
              >
                <ChevronRight className="h-5 w-5 group-hover:scale-115" />
              </button>
            )}

            {/* Cards */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
            >
              {flashSales.products.map((item, index) => (
                <SaleCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
