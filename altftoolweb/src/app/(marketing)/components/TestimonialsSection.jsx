"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "AltF has become my go-to place before starting any project. It saves me hours of searching and helps me discover tools I never knew existed.",
    name: "Sarah J.",
    role: "Marketing Manager",
    brand: "Notion",
    avatar: "https://i.pravatar.cc/96?img=47",
  },
  {
    quote:
      "The extensions section is a game-changer. My browser is now supercharged with the best tools for research and productivity.",
    name: "David K.",
    role: "Product Designer",
    brand: "Canva",
    avatar: "https://i.pravatar.cc/96?img=14",
  },
  {
    quote:
      "Clean design, great recommendations, and real deals. AltF is the only platform I trust for finding the right tools.",
    name: "Priya M.",
    role: "Freelance Writer",
    brand: "Grammarly",
    avatar: "https://i.pravatar.cc/96?img=49",
  },
];

export default function TestimonialsSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderItems = useMemo(() => [...testimonials, ...testimonials], []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % testimonials.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="section">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="home-kicker">Loved by thousands</p>
          <h2 className="section-title">What our users are saying</h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--card)] px-4 py-3 shadow-[var(--home-shadow-sm)]">
          <span className="flex text-[#f5b301]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-current" />
            ))}
          </span>
          <span className="text-base font-semibold text-[var(--foreground)]">4.9/5</span>
          <span className="text-xs font-bold text-[var(--muted-foreground)]">
            from 50K+ reviews
          </span>
        </div>
      </div>

      <div className="home-testimonial-slider overflow-hidden">
        <div
          className="home-testimonial-track"
          style={{
            "--testimonial-count": sliderItems.length,
            "--testimonial-offset": `${activeSlide * (-100 / sliderItems.length)}%`,
          }}
        >
          {sliderItems.map((item, index) => (
            <div key={`${item.name}-${index}`} className="home-testimonial-slide">
              <article className="home-testimonial-card h-full rounded-[1.35rem] bg-[var(--card)] p-7">
                <Image
                  src="/assets/home-icons/testimonial-quote.svg"
                  alt=""
                  aria-hidden
                  width={72}
                  height={72}
                  className="h-11 w-11"
                  unoptimized
                />
                <div className="mt-3 flex text-[#f5b301]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 min-h-[7.2rem] text-[0.94rem] font-semibold leading-7 text-[var(--foreground)]">
                  “{item.quote}”
                </p>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.avatar}
                      alt={`${item.name} profile`}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[var(--foreground)]">
                        {item.name}
                      </span>
                      <span className="block text-xs font-semibold text-[var(--muted-foreground)]">
                        {item.role}
                      </span>
                    </span>
                  </div>
                  <span className="grid h-10 min-w-10 place-items-center rounded-xl bg-[var(--home-primary-soft)] px-3 text-xs font-semibold text-[var(--primary)]">
                    {item.brand}
                  </span>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 flex justify-center gap-2">
        {testimonials.map((item, dot) => (
          <button
            key={dot}
            type="button"
            aria-label={`Show testimonial from ${item.name}`}
            aria-current={dot === activeSlide ? "true" : undefined}
            onClick={() => setActiveSlide(dot)}
            className={`h-2 rounded-full transition-all ${
              dot === activeSlide ? "w-6 bg-[var(--primary)]" : "w-2 bg-[color-mix(in_srgb,var(--primary)_24%,var(--home-border))]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
