"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function HeroSection() {
  const scrollRef = useRef(null);

  const intervalRef = useRef(null);

const startAutoScroll = () => {
  const container = scrollRef.current;
  if (!container) return;

  // don't run on desktop
  if (window.innerWidth >= 768) return;

   // clear existing interval first
  if (intervalRef.current) clearInterval(intervalRef.current);

  let scrollAmount = container.scrollLeft;

  intervalRef.current = setInterval(() => {
    scrollAmount += container.offsetWidth * 0.5;

    if (scrollAmount >= container.scrollWidth - container.offsetWidth) {
      scrollAmount = 0;
    }

    container.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  }, 2500);
};

const stopAutoScroll = () => {
  if (intervalRef.current) clearInterval(intervalRef.current);
};

useEffect(() => {
  startAutoScroll();
  return () => stopAutoScroll();
}, []);

const handleTouchEnd = () => {
  setTimeout(() => {
    startAutoScroll();
  }, 1500); // wait before restarting
};

  const features = [
    {
      image: "/sale-locator/hero-section-2/hero-icon1.png",
      title: "Nearby Stores",
      description: "Find deals in your area",
    },
    {
      image: "/sale-locator/hero-section-2/hero-icon2.png",
      title: "Best Prices",
      description: "Unbeatable discounts",
    },
    {
      image: "/sale-locator/hero-section-2/hero-icon3.png",
      title: "100% Genuine",
      description: "Verified local sellers",
    },
    {
      image: "/sale-locator/hero-section-2/hero-icon4.png",
      title: "Easy & Secure",
      description: "Seamless checkout",
    },
  ];
  return (
    <section className="section ">
      {/*      DESKTOP HERO     */}
      <div className="hidden md:grid grid-cols-12 gap-3 lg:gap-3">
        {/* LEFT LARGE */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="col-span-7 rounded-[28px] overflow-hidden"
        >
          <Image
            src="/sale-locator/hero-section-2/hero-img1.png"
            alt="Big Savings"
            width={900}
            height={620}
            priority
            className="w-full h-full object-fill"
          />
        </motion.div>

        {/* RIGHT STACK */}
        <div className="col-span-5 flex flex-col gap-3 lg:gap-3">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="rounded-[28px] overflow-hidden"
          >
            <Image
              src="/sale-locator/hero-section-2/hero-img2.png"
              alt="Under 99"
              width={700}
              height={300}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="rounded-[28px] overflow-hidden"
          >
            <Image
              src="/sale-locator/hero-section-2/hero-img3.png"
              alt="Deals ending soon"
              width={700}
              height={300}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>


      {/* MOBILE HERO STACK */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="rounded-3xl overflow-hidden">
          <Image
            src="/sale-locator/hero-section-2/hero-img1.png"
            alt="Big Savings"
            width={700}
            height={420}
            priority
          // className="w-full h-[180px] xs:h-[300px] sm:h-[330px] object-fill"
          />
        </div>

        <div className="rounded-3xl overflow-hidden">
          <Image
            src="/sale-locator/hero-section-2/hero-img2.png"
            alt="Under 99"
            width={700}
            height={420}
          // className="w-full h-[180px] xs:h-[200px] sm:h-[230px] object-fill"
          />
        </div>

        <div className="rounded-3xl overflow-hidden">
          <Image
            src="/sale-locator/hero-section-2/hero-img3.png"
            alt="Deals Ending"
            width={700}
            height={420}
          // className="w-full h-[180px] xs:h-[200px] sm:h-[230px] object-fill"
          />
        </div>
      </div>

      {/*        FEATURE CARDS       */}
      <div ref={scrollRef}
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
      onTouchStart={stopAutoScroll}
      onTouchEnd={handleTouchEnd}
      className="mt-6 md:mt-8 flex md:grid md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory overflow-y-hidden">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 220 }}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
            min-w-[48%] sm:min-w-[48%] md:min-w-0 snap-start
        sm:bg-(--background)
        md:border border-(--border)
        md:rounded-2xl
        px-4 py-4 md:px-5 md:py-5
        md:shadow-[0_8px_24px_rgba(0,0,0,0.05)]
        flex flex-col text-center  md:text-left gap-3
        md:flex-row items-center md:gap-4
      "
          >
            {/* image icon */}
            <div className="h-20 w-20 md:h-14 md:w-14 shrink-0 rounded-full overflow-hidden bg-[#EAF1FF] flex items-center justify-center">
              <Image
                src={feature.image}
                alt={feature.title}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>

            <div className="min-w-0 space-y-1 w-full">
              <h3 className="text-sm md:text-base font-semibold text-(--foreground) font-primary">
                {feature.title}
              </h3>

              <p className="hidden md:block text-xs md:text-sm text-(--muted-foreground) font-secondary">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}