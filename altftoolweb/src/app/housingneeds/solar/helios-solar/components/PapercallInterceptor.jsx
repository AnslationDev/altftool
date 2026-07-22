"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function PapercallInterceptor() {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef(null);


  useEffect(() => {
    const handleGlobalClick = (event) => {
      // 1. If loader or popup is active, don't intercept.
      if (loading || showPopup) return;

      const target = event.target;

      // Do not intercept close buttons/controls
      if (
        target.closest('[class*="close"]') ||
        target.closest('[aria-label*="close"]') ||
        target.closest('[aria-label*="Close"]')
      ) {
        return;
      }

      // Do not intercept if inside navbar/header, FAQ dropdowns, or is a heading
      // EXCEPT if clicking a phone/email link or a header call CTA button
      if (
        (target.closest("header") ||
          target.closest("nav") ||
          target.closest(".navbar") ||
          target.closest(".mobile-menu") ||
          target.closest(".faq-section") ||
          target.closest(".faq") ||
          target.closest('[class*="faq"]') ||
          target.closest("h1, h2, h3, h4, h5, h6")) &&
        !target.closest('a[href^="tel:"], a[href^="mailto:"], .navbar-cta, .contact-card')
      ) {
        return;
      }

      const button = target.closest(
        'button, [role="button"], input[type="button"], input[type="submit"], a.btn, a.button, .cta-button, .navbar-cta, .contact-card, a[href^="tel:"], a[href^="mailto:"]'
      );

      // 3. If it's a button and NOT inside our interceptor container, track and intercept if threshold met.
      if (button && containerRef.current && !containerRef.current.contains(button)) {
        event.preventDefault();
        event.stopPropagation();

        // Start loading
        setLoading(true);

        // 500 ms fake loading
        setTimeout(() => {
          setLoading(false);
          setShowPopup(true);
        }, 500);
      }
    };

    // Register capture phase listener
    document.addEventListener("click", handleGlobalClick, true);
    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
    };
  }, [loading, showPopup]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div ref={containerRef}>
      <AnimatePresence>
        {/* Fake Loader Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
          >
            {/* Standard circular spinner */}
            <div className="relative w-16 h-16">
              <svg className="animate-spin w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </motion.div>
        )}

        {/* Papercall Popup Modal */}
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            {/* Backdrop click close */}
            <div className="absolute inset-0 cursor-default" onClick={closePopup} />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center overflow-hidden z-[9999]"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#f5f5f5",
                borderWidth: "1px",
                borderStyle: "solid",
                color: "#000000"
              }}
            >
              {/* Sleek top indicator line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neutral-200 via-neutral-800 to-neutral-200" />

              {/* Close button */}
              <button
                onClick={closePopup}
                className="absolute top-6 right-6 p-2 rounded-full transition-colors"
                style={{ color: "#a3a3a3", backgroundColor: "transparent" }}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Title */}
              <h3 className="text-3xl font-extrabold tracking-tight mb-2 mt-4" style={{ color: "#000000" }}>
                Sorry! No Result Found.
              </h3>

              {/* Subtitle */}
              <p className="text-[15px] leading-relaxed font-medium max-w-sm mb-6" style={{ color: "#737373" }}>
                Let our agents help you find the best solar option for your home.
              </p>

              {/* Phone Call Illustration SVG instead of Agent */}
              <svg width="150" height="150" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto my-3">
                <defs>
                  <linearGradient id="solarGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="solarPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.03" />
                  </linearGradient>
                  <linearGradient id="solarBadge" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#000000" />
                    <stop offset="100%" stopColor="#262626" />
                  </linearGradient>
                </defs>

                {/* Pulse background rings */}
                <circle cx="60" cy="60" r="50" fill="url(#solarGlow)" className="animate-pulse" />
                <circle cx="60" cy="60" r="38" fill="url(#solarPulse)" />

                {/* Central badge with solar gradient */}
                <circle cx="60" cy="60" r="22" fill="url(#solarBadge)" />

                {/* Phone icon inside the central badge */}
                <g transform="translate(48, 48)">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Sleek dual concentric ringing wave arcs */}
                {/* Left waves */}
                <path d="M 34 50 A 15 15 0 0 0 34 70" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" className="animate-pulse" />
                <path d="M 28 44 A 23 23 0 0 0 28 76" stroke="#000000" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

                {/* Right waves */}
                <path d="M 86 50 A 15 15 0 0 1 86 70" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" className="animate-pulse" />
                <path d="M 92 44 A 23 23 0 0 1 92 76" stroke="#000000" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              </svg>

              {/* Now Call Toll Free */}
              <h4 className="text-xl font-bold mb-3 mt-4" style={{ color: "#000000" }}>
                Now Call Toll Free
              </h4>

              {/* Phone Button */}
              <a
                href="tel:+18005550192"
                className="flex items-center justify-center gap-3 text-2xl font-extrabold py-4 px-6 rounded-2xl w-full shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-2"
                style={{ backgroundColor: "#000000", color: "#ffffff" }}
              >
                <Phone size={24} fill="none" stroke="currentColor" strokeWidth={2.5} />
                <span>+1-800-555-0192</span>
              </a>

              {/* Available 24x7 */}
              <p className="text-sm font-semibold tracking-wide mb-6" style={{ color: "#737373" }}>
                We are available 24x7
              </p>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
