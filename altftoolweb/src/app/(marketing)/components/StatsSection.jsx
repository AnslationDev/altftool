"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const stats = [
  {
    value: 22,
    suffix: "K",
    highlight: "+",
    desc: "Active users using our tools daily.",
  },
  {
    value: 64,
    suffix: "M",
    highlight: "+",
    desc: "Tasks processed with speed and efficiency.",
  },
  {
    value: 94,
    suffix: "",
    highlight: "%",
    desc: "User satisfaction across all features.",
  },
];

export default function WhyUsersLove() {
  const [visible, setVisible] = useState([]);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [startCount, setStartCount] = useState(false);

  const sectionRef = useRef(null);

  // 👇 Detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCount(true);
          observer.disconnect(); // run only once
        }
      },
      { threshold: 0.4 } // 40% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 👇 One-by-one reveal (after visible)
  useEffect(() => {
    if (!startCount) return;

    stats.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => [...prev, i]);
      }, i * 300);
    });
  }, [startCount]);

  // 👇 Counter animation (after visible)
  useEffect(() => {
    if (!startCount) return;

    const intervals = stats.map((item, i) => {
      let start = 0;
      const end = item.value;
      const duration = 1200;
      const stepTime = Math.max(10, duration / end);

      return setInterval(() => {
        start += 1;

        setCounts((prev) => {
          const updated = [...prev];
          updated[i] = start;
          return updated;
        });

        if (start >= end) clearInterval(intervals[i]);
      }, stepTime);
    });

    return () => intervals.forEach(clearInterval);
  }, [startCount]);

  return (
    <section ref={sectionRef} className=" section bg-[var(--section-highlight)]">
      <div className="container mx-auto  px-0 space-y-8">

        {/* Header */}
        <div className="section-header">
          <h2 className="section-title">
            Why Users <span className="text-[var(--primary)]">Love Us</span>
          </h2>

          <p className="section-subtitle">
            Trusted by thousands of users worldwide for speed, simplicity, and performance.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">

          {stats.map((item, i) => (
            <div
              key={i}
              className={`text-center p-8 rounded-2xl transition duration-500 ${visible.includes(i)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
                } hover:-translate-y-1`}
            >

              {/* Number */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)]">
                {counts[i]}
                {item.suffix}
                <span className="text-[var(--primary)]">
                  {item.highlight}
                </span>
              </h2>

              {/* Description */}
              <p className="mt-4 text-sm md:text-base text-[var(--secondary-foreground)] max-w-xs mx-auto leading-relaxed">
                {item.desc}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}