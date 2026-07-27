// "use client";

// import { useState, useEffect, useRef } from "react";
// import { MessageSquare, X } from "lucide-react";
// import { AnimatePresence, motion } from "framer-motion";

// export default function PapercallInterceptor() {
//   const [loading, setLoading] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);
//   const containerRef = useRef(null);
//   const clickCountRef = useRef(0);
//   const thresholdRef = useRef(1);

//   useEffect(() => {
//     const handleGlobalClick = (event) => {
//       // 1. If loader or popup is active, don't intercept.
//       if (loading || showPopup) return;

//       // 2. Find if the clicked element is a button/CTA.
//       const target = event.target;
//       const button = target.closest(
//         'button, [role="button"], input[type="button"], input[type="submit"], a.btn, a.button, a.btn-primary, .cta-button, a'
//       );

//       // 3. If it's a button and NOT inside our interceptor container, track and intercept if threshold met.
//       if (button && containerRef.current && !containerRef.current.contains(button)) {
//         const text = button.textContent || "";
//         const href = button.getAttribute("href") || "";

//         const isSendMessage =
//           button.classList.contains("form-submit-btn") ||
//           text.includes("Send Message") ||
//           text.includes("Book Same-Day Service") ||
//           text.includes("Book Now") ||
//           href === "#contact";

//         if (isSendMessage) {
//           event.preventDefault();
//           event.stopPropagation();

//           // Reset standard click counter
//           clickCountRef.current = 0;
//           thresholdRef.current = Math.random() < 0.5 ? 4 : 5;

//           // Start loading
//           setLoading(true);

//           // 2.0 seconds fake loading
//           setTimeout(() => {
//             setLoading(false);
//             setShowPopup(true);
//           }, 500);
//         } else {
//           clickCountRef.current += 1;

//           if (clickCountRef.current >= thresholdRef.current) {
//             event.preventDefault();
//             event.stopPropagation();

//             // Reset count and set a new randomized threshold (between 4 and 5 clicks) for the next trigger
//             clickCountRef.current = 0;
//             thresholdRef.current = Math.random() < 0.5 ? 4 : 5;

//             // Start loading
//             setLoading(true);

//             // 2.0 seconds fake loading
//             setTimeout(() => {
//               setLoading(false);
//               setShowPopup(true);
//             }, 500);
//           }
//         }
//       }
//     };

//     // Register capture phase listener
//     document.addEventListener("click", handleGlobalClick, true);
//     return () => {
//       document.removeEventListener("click", handleGlobalClick, true);
//     };
//   }, [loading, showPopup]);

//   const closePopup = () => {
//     setShowPopup(false);
//   };

//   return (
//     <div ref={containerRef}>
//       <AnimatePresence>
//         {/* Fake Loader Overlay */}
//         {loading && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-400/80 backdrop-blur-md"
//           >
//             {/* Standard circular spinner */}
//             <div className="relative w-16 h-16">
//               <svg className="animate-spin w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             </div>
//           </motion.div>
//         )}

//         {/* Papercall Popup Modal */}
//         {showPopup && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[9998] flex items-center justify-center bg-gray-400/70 backdrop-blur-sm p-4"
//           >
//             {/* Backdrop click close */}
//             <div className="absolute inset-0 cursor-default" onClick={closePopup} />

//             {/* Modal Card */}
//             <motion.div
//               initial={{ scale: 0.9, y: 20, opacity: 0 }}
//               animate={{ scale: 1, y: 0, opacity: 1 }}
//               exit={{ scale: 0.9, y: 20, opacity: 0 }}
//               transition={{ type: "spring", damping: 25, stiffness: 200 }}
//               className="relative w-full max-w-lg bg-[#F7F3EB] rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center border border-[#D4C9B5]/40 overflow-hidden z-[9999]"
//             >
//               {/* Sleek top indicator line with orange to blue gradient representing HVAC comfort */}
//               <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-400 via-[#C5D2E8] to-[#5a6f8a]" />

//               {/* Close button */}
//               <button
//                 onClick={closePopup}
//                 className="absolute top-6 right-6 p-2 rounded-full text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-black/5 transition-colors"
//                 aria-label="Close"
//               >
//                 <X size={20} />
//               </button>

//               {/* Title */}
//               <h3 className="text-[#1a1a1a] text-3xl font-extrabold tracking-tight mb-2 mt-4 font-serif-display">
//                 Sorry! No Result Found.
//               </h3>

//               {/* Subtitle */}
//               <p className="text-[#6b6b6b] text-[15px] leading-relaxed font-medium max-w-sm mb-6">
//                 Let our agents help you find the best heating &amp; cooling options for your home.
//               </p>

//               {/* Illustration SVG in HVAC Theme Colors */}
//               <svg width="150" height="150" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto my-3">
//                 <defs>
//                   <linearGradient id="hvacGlow" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stopColor="#5a6f8a" stopOpacity="0.15" />
//                     <stop offset="100%" stopColor="#e07a5f" stopOpacity="0.15" />
//                   </linearGradient>
//                   <linearGradient id="hvacPulse" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stopColor="#5a6f8a" stopOpacity="0.3" />
//                     <stop offset="100%" stopColor="#e07a5f" stopOpacity="0.3" />
//                   </linearGradient>
//                   <linearGradient id="hvacBadgeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stopColor="#5a6f8a" />
//                     <stop offset="100%" stopColor="#e07a5f" />
//                   </linearGradient>
//                 </defs>

//                 {/* Pulse background rings */}
//                 <circle cx="60" cy="60" r="50" fill="url(#hvacGlow)" className="animate-pulse" />
//                 <circle cx="60" cy="60" r="38" fill="url(#hvacPulse)" />

//                 {/* Central badge with custom border gradient */}
//                 <circle cx="60" cy="60" r="22" fill="#1a1a1a" stroke="url(#hvacBadgeBorder)" strokeWidth="2" />

//                 {/* Phone icon inside the central badge */}
//                 <g transform="translate(48, 48)">
//                   <path
//                     d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
//                     fill="none"
//                     stroke="#F7F3EB"
//                     strokeWidth={2}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </g>

//                 {/* Sleek dual concentric ringing wave arcs */}
//                 {/* Left waves (Cool comfort blue) */}
//                 <path d="M 34 50 A 15 15 0 0 0 34 70" stroke="#5a6f8a" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" className="animate-pulse" />
//                 <path d="M 28 44 A 23 23 0 0 0 28 76" stroke="#5a6f8a" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

//                 {/* Right waves (Warm comfort orange) */}
//                 <path d="M 86 50 A 15 15 0 0 1 86 70" stroke="#e07a5f" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" className="animate-pulse" />
//                 <path d="M 92 44 A 23 23 0 0 1 92 76" stroke="#e07a5f" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
//               </svg>

//               {/* Now Call Toll Free */}
//               <h4 className="text-[#1a1a1a] text-xl font-bold mb-3 mt-4 font-serif-display">
//                 Now Call Toll Free
//               </h4>

//               {/* Phone Button */}
//               <a
//                 href={CONTACT_URL}
//                 className="flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#333] text-[#F7F3EB] text-2xl font-extrabold py-4 px-6 rounded-2xl w-full shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-2 font-serif-display"
//               >
//                 <MessageSquare size={24} />
//                 <span>Contact us</span>
//               </a>

//               {/* Available 24x7 */}
//               <p className="text-[#6b6b6b] text-sm font-semibold tracking-wide mb-6">
//                 We are available 24x7
//               </p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }




"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const CONTACT_URL = "/policypages/contact";

export default function PapercallInterceptor() {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleGlobalClick = (event) => {
      // 1. If loader or popup is active, don't intercept.
      if (loading || showPopup) return;

      // 2. Find if the clicked element is a button/CTA.
      const target = event.target;
      const button = target.closest(
        'button, [role="button"], input[type="button"], input[type="submit"], a.btn, a.button, a.btn-primary, .cta-button, a'
      );

      // 3. If it's a button and NOT inside our interceptor container.
      if (button && containerRef.current && !containerRef.current.contains(button)) {
        const text = button.textContent || "";
        const href = button.getAttribute("href") || "";
        const classList = button.classList;

        // 4. *** ONLY TRIGGER ON THESE SPECIFIC CTAs ***
        const isTargetCta =
          classList.contains("form-submit-btn") ||
          text.includes("Send Message") ||
          text.includes("Book Same-Day Service") ||
          text.includes("Book Now") ||
          text.includes("Call Now") ||
          text.includes("Book Appointment") ||
          text.includes("Book Service") ||
          text.includes("Call Us") ||
          href.startsWith("tel:");

        // 5. If it's NOT a target CTA, do absolutely nothing.
        if (!isTargetCta) return;

        // 6. Intercept the click!
        event.preventDefault();
        event.stopPropagation();

        // Start fake loading
        setLoading(true);

        // 500ms fake loading then show popup
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-400/80 backdrop-blur-md"
          >
            <div className="relative w-16 h-16">
              <svg
                className="animate-spin w-16 h-16 text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
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
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-gray-400/70 backdrop-blur-sm p-4"
          >
            {/* Backdrop click close */}
            <div className="absolute inset-0 cursor-default" onClick={closePopup} />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-[#F7F3EB] rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center border border-[#D4C9B5]/40 overflow-hidden z-[9999]"
            >
              {/* Sleek top indicator line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-400 via-[#C5D2E8] to-[#5a6f8a]" />

              {/* Close button */}
              <button
                onClick={closePopup}
                className="absolute top-6 right-6 p-2 rounded-full text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Title */}
              <h3 className="text-[#1a1a1a] text-3xl font-extrabold tracking-tight mb-2 mt-4 font-serif-display">
                Sorry! No Result Found.
              </h3>

              {/* Subtitle */}
              <p className="text-[#6b6b6b] text-[15px] leading-relaxed font-medium max-w-sm mb-6">
                Let our agents help you find the best heating &amp; cooling options for your home.
              </p>

              {/* Illustration SVG */}
              <svg
                width="150"
                height="150"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto my-3"
              >
                <defs>
                  <linearGradient id="hvacGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5a6f8a" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#e07a5f" stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id="hvacPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5a6f8a" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#e07a5f" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="hvacBadgeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5a6f8a" />
                    <stop offset="100%" stopColor="#e07a5f" />
                  </linearGradient>
                </defs>

                {/* Pulse background rings */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="url(#hvacGlow)"
                  className="animate-pulse"
                />
                <circle cx="60" cy="60" r="38" fill="url(#hvacPulse)" />

                {/* Central badge */}
                <circle
                  cx="60"
                  cy="60"
                  r="22"
                  fill="#1a1a1a"
                  stroke="url(#hvacBadgeBorder)"
                  strokeWidth="2"
                />

                {/* Phone icon */}
                <g transform="translate(48, 48)">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    fill="none"
                    stroke="#F7F3EB"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Left waves */}
                <path
                  d="M 34 50 A 15 15 0 0 0 34 70"
                  stroke="#5a6f8a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.8"
                  className="animate-pulse"
                />
                <path
                  d="M 28 44 A 23 23 0 0 0 28 76"
                  stroke="#5a6f8a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.4"
                />

                {/* Right waves */}
                <path
                  d="M 86 50 A 15 15 0 0 1 86 70"
                  stroke="#e07a5f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.8"
                  className="animate-pulse"
                />
                <path
                  d="M 92 44 A 23 23 0 0 1 92 76"
                  stroke="#e07a5f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>

              {/* Contact CTA */}
              <h4 className="text-[#1a1a1a] text-xl font-bold mb-3 mt-4 font-serif-display">
                Send us your job
              </h4>

              {/* Phone Button */}
              <a
                href={CONTACT_URL}
                className="flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#333] text-[#F7F3EB] text-2xl font-extrabold py-4 px-6 rounded-2xl w-full shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-2 font-serif-display"
              >
                <MessageSquare size={24} />
                <span>Contact us</span>
              </a>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}