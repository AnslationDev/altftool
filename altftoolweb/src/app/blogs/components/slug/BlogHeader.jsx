"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function BlogHeader({ blog }) {
  const headingRef = useRef(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.classList.add("opacity-0", "translate-y-4");
    const timer = setTimeout(() => {
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      el.classList.remove("opacity-0", "translate-y-4");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full mb-12">
      {/* Hero Image */}
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] overflow-hidden rounded-2xl">
        <Image
          src={blog.image}
          alt={blog.imageAlt || blog.heading}
          fill
          className="object-cover rounded-2xl scale-100 hover:scale-105 transition-transform duration-700 ease-in-out"
          priority
        />

        {/* Gradient overlay — bottom-heavy */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl" />

        {/* Category badge */}
        <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
          <span className="inline-block bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold px-3 py-1 rounded tracking-wide uppercase shadow-md">
            {blog.category}
          </span>
        </div>
      </div>

      {/* Heading */}
      <h1
        ref={headingRef}
        className="mt-8 w-full text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-[var(--primary)] drop-shadow-lg text-center px-2 sm:px-0"
      >
        {blog.heading}
      </h1>
    </div>
  );
}