"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import banner from "../(assets)/ dealapge.png";
import { subscribeAllHeroes } from "../service/firebaseherosection";
import { HeroSkeleton } from "../DealsPageSkeleton";
import Link from "next/link";

function HeroSection() {
  // const slides = [
  //   { id: 1, name: "Travel", img: banner },
  //   { id: 2, name: "Travel 2", img: banner },
  //   { id: 3, name: "Health", img: banner },
  // ];

  const [current, setCurrent] = useState(0);
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAllHeroes((data) => {
      setHeroes(data);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  // autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroes.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [heroes.length]);

  if (loading) return <HeroSkeleton />;
  
  return (
    <div className="cursor-pointer section animate-slide-up">
      {/* Slider */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {heroes.map((item) => (
            <div key={item.id} className="min-w-full px-1">
              {/* h-45 sm:h-75 md:h-100 lg:h-[450px] xl:h-[500px] 2xl:h-[600px]  rounded-xl */}
              <Link href={item.link}>
                          <div className="relative w-full h-[180px] sm:h-[260px] md:h-[320px] lg:h-[420px] xl:h-[550px] rounded-xl sm:rounded-2xl overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority={item.id === 1}
                  className="rounded-xl object-cover"
                />
              </div></Link>
  
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-4 mt-6">
        {heroes.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full cursor-pointer
  transition-all duration-500 ease-in-out
  ${
    current === i
      ? "bg-(--primary) w-8 opacity-100"
      : "bg-[#1e3a8a] w-2 opacity-40"
  }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSection;
