"use client";
import { useReveal } from "../hooks/useReveal";

export default function CTABanner() {
  const ref = useReveal();

  return (
    <section id="contact" className="relative py-8 lg:py-10 bg-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className="reveal-scale relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#C5D2E8] via-[#D5DFEF] to-[#A8BCD6] p-12 lg:p-20"
        >
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 float-anim" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1a1a1a]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a]/15 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-[#1a1a1a] pulse-dot" />
              <span className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
                Available 24/7
              </span>
            </div>

            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6 leading-tight">
              Need Emergency HVAC
              <br />
              Repair?
            </h2>

            <p className="text-lg text-[#1a1a1a]/75 leading-relaxed mb-10 max-w-xl mx-auto">
              Don't suffer through extreme temperatures. Book same-day service
              today and get your comfort restored fast.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#contact"
                className="group bg-[#1a1a1a] text-[#F7F3EB] px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-500"
              >
                Book Same-Day Service
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
              <a
                href="tel:8005551234"
                className="px-8 py-4 rounded-full text-[#1a1a1a] font-semibold border border-[#1a1a1a]/40 hover:border-[#1a1a1a] hover:bg-[#1a1a1a]/10 transition-all duration-500 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                (800) 555-1234
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
