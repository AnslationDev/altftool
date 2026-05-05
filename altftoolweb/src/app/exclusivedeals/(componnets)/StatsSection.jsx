"use client";

import { useEffect, useRef, useState } from "react";
import data from "../(data)/db.json";

const StatsSection = () => {
  const { title, description, stats } = data.statsSection;
  const sectionRef = useRef(null);
  const [startCount, setStartCount] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCount(true);
          observer.disconnect(); // run only once
        }
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className=" bg-(--background) text-(--foreground) my-12 md:my-20">
      {/* Top Content */}
      <div className="
                      grid grid-cols-1 md:grid-cols-2 
                      gap-6 sm:gap-8 md:gap-10 
                      items-start 
                      mb-10 sm:mb-12 md:mb-14 lg:mb-16
                      px-2 sm:px-0">
        <h2 className="text-2xl md:text-3xl 
                       font-bold text-(--foreground) leading-tight">
          {title}
        </h2>

        <p className="text-sm sm:text-base md:text-lg 
                      text-(--muted-foreground) leading-relaxed">
          {description}
        </p>
      </div>

      {/* Stats Card */}
      <div className="">
        <div className="rounded-2xl sm:rounded-3xl 
                        bg-(--background) md:border border-0 text-(--foreground) 
                        px-4 sm:px-6 md:px-10 lg:px-14 
                        py-8 sm:py-10 md:py-11 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                          gap-8 sm:gap-9 md:gap-10">
            {stats.map((item) => (
              <StatItem
                key={item.id}
                item={item}
                start={startCount}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* Individual Stat */
const StatItem = ({ item, start }) => {
  const numericValue = parseInt(item.value.replace(/\D/g, ""));
  const suffix = item.value.replace(/[0-9]/g, "");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const duration = 1500;
    const increment = numericValue / (duration / 16);

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [start, numericValue]);

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 text-center sm:text-left">
      <p className="text-(--foreground) text-xs sm:text-sm font-medium uppercase tracking-wide">
        {item.label}
      </p>

      <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
        {count}
        {suffix}
      </h3>

      <p className="text-(--foreground) text-xs sm:text-sm leading-relaxed 
                    max-w-full sm:max-w-[220px] mx-auto sm:mx-0">
        {item.description}
      </p>
    </div>
  );
};

export default StatsSection;