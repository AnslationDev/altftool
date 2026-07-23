// "use client";

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// const steps = [
//   {
//     num: "01",
//     title: "Book Service",
//     desc1: "Schedule online or give us a call",
//     desc2: "Pick a time that best fits your day.",
//   },
//   {
//     num: "02",
//     title: "Inspection",
//     desc1: "Our certified tech will arrive and",
//     desc2: "run a full system diagnostic check.",
//   },
//   {
//     num: "03",
//     title: "Installation",
//     desc1: "We use premium parts and advanced",
//     desc2: "tools for precise, lasting results.",
//   },
//   {
//     num: "04",
//     title: "Quality Check",
//     desc1: "Every component is tested to ensure",
//     desc2: "your system runs at peak efficiency.",
//   },
//   {
//     num: "05",
//     title: "Customer Satisfaction",
//     desc1: "We will guide you through the completed project and",
//     desc2: "provide full warranty coverage for your peace of mind.",
//   },
// ];

// export default function Process() {
//   const [isDesktop, setIsDesktop] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [animationKey, setAnimationKey] = useState(0);

//   useEffect(() => {
//     setMounted(true);
//     const media = window.matchMedia("(min-width: 768px)");
//     setIsDesktop(media.matches);
//     const listener = (e) => setIsDesktop(e.matches);
//     media.addEventListener("change", listener);
//     return () => media.removeEventListener("change", listener);
//   }, []);

//   // Loop the animation every 5 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setAnimationKey((prev) => prev + 1);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // Desktop layout: reduced height (80vh) + horizontal
//   if (mounted && isDesktop) {
//     return (
//       <section className="relative h-[70vh] bg-[#F7F3EB] overflow-hidden">
//         <div className="h-full flex flex-col justify-center">
//           <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
//             {/* Header – slightly reduced bottom margin for compactness */}
//             <div className="text-center max-w-3xl mx-auto mb-12">
//               <span className="inline-block text-xl font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
//                 How It Works
//               </span>
//               <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
//                 Our Simple Process
//               </h2>
//               <p className="text-lg text-[#555] leading-relaxed">
//                 From the initial reservation to the final moment of delight, we
//                 orchestrate a flawlessly smooth journey by meticulously managing
//                 every single detail in between.
//               </p>
//             </div>

//             {/* Animated row – same as before but with reduced container height */}
//             <motion.div
//               key={animationKey}
//               className="flex flex-row items-start justify-between gap-0"
//               initial="hidden"
//               animate="visible"
//               variants={{
//                 hidden: { opacity: 0 },
//                 visible: {
//                   opacity: 1,
//                   transition: { staggerChildren: 0.12 },
//                 },
//               }}
//             >
//               {steps.map((step, idx) => (
//                 <div key={step.num} className="flex flex-1 items-center">
//                   <motion.div
//                     className="flex-1 text-center relative z-10"
//                     initial={{ opacity: 0, x: -100, scale: 0.93 }}
//                     animate={{ opacity: 1, x: 0, scale: 1 }}
//                     transition={{ delay: idx * 0.12, duration: 0.6, ease: "easeOut" }}
//                   >
//                     <div className="step-number text-5xl md:text-6xl lg:text-7xl font-serif-display font-bold text-[#5a6f8a] mb-2">
//                       {step.num}
//                     </div>
//                     <h3 className="text-lg md:text-xl font-semibold text-[#1a1a1a] mb-1">
//                       {step.title}
//                     </h3>
//                     <div className="text-sm text-[#555] leading-relaxed max-w-xs mx-auto">
//                       <span className="step-desc">{step.desc1}</span>
//                       <br />
//                       <span className="step-desc">{step.desc2}</span>
//                     </div>
//                   </motion.div>

//                   {idx < steps.length - 1 && (
//                     <div className="flex-shrink-0 w-8 md:w-12 lg:w-16 h-12 md:h-auto self-center flex items-center justify-center">
//                       <motion.div
//                         className="text-[#5a6f8a] text-xl md:text-4xl"
//                         initial={{ opacity: 0, scale: 0.7 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{
//                           delay: idx * 0.12 + 0.08,
//                           duration: 0.4,
//                           ease: "easeOut",
//                         }}
//                       >
//                         <span>→</span>
//                       </motion.div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </motion.div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   // Mobile layout (unchanged, but you can also reduce padding if needed)
//   return (
//     <section className="py-6 lg:py-8 bg-[#F7F3EB]">
//       <div className="max-w-7xl mx-auto px-6 lg:px-8">
//         <div className="text-center max-w-3xl mx-auto mb-16">
//           <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
//             How It Works
//           </span>
//           <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
//             Our Simple Process
//           </h2>
//           <p className="text-lg text-[#555] leading-relaxed">
//             From booking to satisfaction, we make every step seamless.
//           </p>
//         </div>

//         <motion.div
//           key={animationKey}
//           className="flex flex-col md:flex-row items-start justify-between gap-0"
//           initial="hidden"
//           animate="visible"
//           variants={{
//             hidden: { opacity: 0 },
//             visible: {
//               opacity: 1,
//               transition: { staggerChildren: 0.12 },
//             },
//           }}
//         >
//           {steps.map((step, idx) => (
//             <div key={step.num} className="flex flex-1 items-center w-full md:w-auto">
//               <motion.div
//                 className="step-item flex-1 text-center relative z-10"
//                 initial={{ opacity: 0, x: -100, scale: 0.93 }}
//                 animate={{ opacity: 1, x: 0, scale: 1 }}
//                 transition={{ delay: idx * 0.12, duration: 0.6, ease: "easeOut" }}
//               >
//                 <div className="step-number text-5xl md:text-6xl lg:text-7xl font-serif-display font-bold text-[#5a6f8a] mb-2">
//                   {step.num}
//                 </div>
//                 <h3 className="text-lg md:text-xl font-semibold text-[#1a1a1a] mb-1">
//                   {step.title}
//                 </h3>
//                 <div className="text-sm text-[#555] leading-relaxed max-w-xs mx-auto">
//                   <span className="step-desc">{step.desc1}</span>
//                   <br />
//                   <span className="step-desc">{step.desc2}</span>
//                 </div>
//               </motion.div>

//               {idx < steps.length - 1 && (
//                 <div className="flex-shrink-0 w-8 md:w-12 lg:w-16 h-12 md:h-auto self-center flex flex-col md:flex-row items-center justify-center">
//                   <motion.div
//                     className="connector-arrow text-[#5a6f8a] text-xl md:text-4xl"
//                     initial={{ opacity: 0, scale: 0.7 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{
//                       delay: idx * 0.12 + 0.08,
//                       duration: 0.4,
//                       ease: "easeOut",
//                     }}
//                   >
//                     <span className="block transform rotate-90 md:rotate-0">→</span>
//                   </motion.div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Book Service",
    desc1: "Schedule online or give us a call",
    desc2: "Pick a time that best fits your day.",
  },
  {
    num: "02",
    title: "Inspection",
    desc1: "Our certified tech will arrive and",
    desc2: "run a full system diagnostic check.",
  },
  {
    num: "03",
    title: "Installation",
    desc1: "We use premium parts and advanced",
    desc2: "tools for precise, lasting results.",
  },
  {
    num: "04",
    title: "Quality Check",
    desc1: "Every component is tested to ensure",
    desc2: "your system runs at peak efficiency.",
  },
  {
    num: "05",
    title: "Customer Satisfaction",
    desc1: "We will guide you through the completed project and",
    desc2: "provide full warranty coverage for your peace of mind.",
  },
];

export default function Process() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);
    const listener = (e) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Loop the animation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Desktop layout: reduced height (70vh) + horizontal
  if (mounted && isDesktop) {
    return (
      <section className="relative h-[70vh] bg-[#F7F3EB] overflow-hidden">
        <div className="h-full flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-block text-xl font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
                How It Works
              </span>
              <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
                Our Simple Process
              </h2>
              <p className="text-lg text-[#555] leading-relaxed">
                From the initial reservation to the final moment of delight, we
                orchestrate a flawlessly smooth journey by meticulously managing
                every single detail in between.
              </p>
            </div>

            {/* Animated row – desktop horizontal */}
            <motion.div
              key={animationKey}
              className="flex flex-row items-start justify-between gap-0"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12 },
                },
              }}
            >
              {steps.map((step, idx) => (
                <div key={step.num} className="flex flex-1 items-center">
                  <motion.div
                    className="flex-1 text-center relative z-10"
                    initial={{ opacity: 0, x: -100, scale: 0.93 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: idx * 0.12, duration: 0.6, ease: "easeOut" }}
                  >
                    <div className="step-number text-5xl md:text-6xl lg:text-7xl font-serif-display font-bold text-[#5a6f8a] mb-2">
                      {step.num}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-[#1a1a1a] mb-1">
                      {step.title}
                    </h3>
                    <div className="text-sm text-[#555] leading-relaxed max-w-xs mx-auto">
                      <span className="step-desc">{step.desc1}</span>
                      <br />
                      <span className="step-desc">{step.desc2}</span>
                    </div>
                  </motion.div>

                  {idx < steps.length - 1 && (
                    <div className="flex-shrink-0 w-8 md:w-12 lg:w-16 h-12 md:h-auto self-center flex items-center justify-center">
                      <motion.div
                        className="text-[#5a6f8a] text-xl md:text-4xl"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: idx * 0.12 + 0.08,
                          duration: 0.4,
                          ease: "easeOut",
                        }}
                      >
                        <span>→</span>
                      </motion.div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Mobile layout (arrows centered below each step)
  return (
    <section className="py-6 lg:py-8 bg-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
            How It Works
          </span>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
            Our Simple Process
          </h2>
          <p className="text-lg text-[#555] leading-relaxed">
            From booking to satisfaction, we make every step seamless.
          </p>
        </div>

        <motion.div
          key={animationKey}
          className="flex flex-col gap-6 md:gap-0"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12 },
            },
          }}
        >
          {steps.map((step, idx) => (
            <div key={step.num} className="flex flex-col md:flex-row items-center w-full">
              {/* Step Card */}
              <motion.div
                className="step-item flex-1 text-center relative z-10"
                initial={{ opacity: 0, x: -100, scale: 0.93 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: idx * 0.12, duration: 0.6, ease: "easeOut" }}
              >
                <div className="step-number text-5xl md:text-6xl lg:text-7xl font-serif-display font-bold text-[#5a6f8a] mb-2">
                  {step.num}
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#1a1a1a] mb-1">
                  {step.title}
                </h3>
                <div className="text-sm text-[#555] leading-relaxed max-w-xs mx-auto">
                  <span className="step-desc">{step.desc1}</span>
                  <br />
                  <span className="step-desc">{step.desc2}</span>
                </div>
              </motion.div>

              {/* Arrow – centered below on mobile, side on desktop */}
              {idx < steps.length - 1 && (
                <div className="flex-shrink-0 w-full md:w-auto flex justify-center mt-4 md:mt-0">
                  <motion.div
                    className="connector-arrow text-[#5a6f8a] text-xl md:text-4xl"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: idx * 0.12 + 0.08,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  >
                    <span className="block transform rotate-90 md:rotate-0">→</span>
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}