"use client";
import { useEffect, useRef } from "react";

export default function Hero() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (parallaxRef.current) {
        const y = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${y * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      {/* Background image with parallax */}
      <div className="absolute inset-0 z-0" ref={parallaxRef}>
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1700124113583-81aa99ea2aa2?auto=format&fit=crop&w=1800&q=82')",
          }}
        />
        {/* Dark overlays for text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        {/* <div className="absolute inset-0 bg-black/15" /> */}
      </div>

      {/* Decorative glow */}
      <div className="absolute top-32 right-0 w-[600px] h-[600px] bg-[#C5D2E8]/20 rounded-full blur-3xl pointer-events-none float-anim" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 lg:pt-32 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5D2E8]/50 bg-[#C5D2E8]/20 mb-8 fade-up">
          <span className="w-2 h-2 rounded-full bg-[#C5D2E8] pulse-dot" />
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
            Premium HVAC Services
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-serif-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium text-white leading-[1.05] mb-6 fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          Reliable Heating{" "}
          <span className="italic text-[#C5D2E8]">&amp;</span> Cooling
          <br />
          Solutions
        </h1>

        {/* Description */}
        <p
          className="max-w-xl text-lg md:text-xl text-white/80 leading-relaxed mb-10 fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Energy-efficient HVAC installation, repair, and maintenance for homes
          and businesses. Experience comfort redefined.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 mb-16 fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="#contact"
            className="btn-primary group px-8 py-4 rounded-full font-semibold flex items-center gap-2"
          >
            Book Inspection
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
          <a
            href="#contact"
            className="px-8 py-4 rounded-full text-white font-semibold border border-white/35 hover:border-[#C5D2E8] hover:bg-white/10 transition-all duration-300"
          >
            Get Free Estimate
          </a>
        </div>

        {/* Trust indicators */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto reveal-stagger"
        >
          {[
            { icon: "clock", label: "24/7 Emergency Service" },
            { icon: "shield", label: "Licensed & Insured" },
            { icon: "users", label: "500+ Happy Clients" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm hover-lift"
            >
              <div className="w-8 h-8 rounded-full bg-[#C5D2E8]/20 flex items-center justify-center flex-shrink-0">
                {item.icon === "clock" && (
                  <svg
                    className="w-4 h-4 text-[#C5D2E8]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {item.icon === "shield" && (
                  <svg
                    className="w-4 h-4 text-[#5a6f8a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                )}
                {item.icon === "users" && (
                  <svg
                    className="w-4 h-4 text-[#5a6f8a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-white/90">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
