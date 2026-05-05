"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useState, forwardRef, useRef, useEffect } from "react";
import { AlphabetFilterSkeleton } from "@/components/ui/skeleton";

const alphabets = ["All", "0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const HEADER_HEIGHT = 65;

const AlphabetFilter = forwardRef(function AlphabetFilter(
  { onSelect, headerVisible, selectedLetter, loading = false },
  ref
) {
  const [active, setActive] = useState("All");
  const [hideHeader, setHideHeader] = useState(false);
  const autoHiddenRef = useRef(false);

  const scrollLeft = () => stripRef.current?.scrollBy({ left: -120, behavior: "smooth" });
  const scrollRight = () => stripRef.current?.scrollBy({ left: 120, behavior: "smooth" });


  const stripRef = useRef(null);

  // 🔹 flag to know heading was hidden by timer
  const { scrollY } = useScroll();


  // useEffect(() => {
  //   const t = setTimeout(() => {
  //     autoHiddenRef.current = true;
  //     setHideHeader(true);
  //   }, 2000);

  //   return () => clearTimeout(t);
  // }, []);

  const activeValue = selectedLetter || active;

  // ---------------------------------------
  // Hide alphabet heading on scroll
  // (only if not auto-hidden)
  // ---------------------------------------
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (autoHiddenRef.current) return;

    setHideHeader((prev) => {
      if (!prev && latest > 4) return true;
      if (prev && latest < 8) return false;
      return prev;
    });
  });

 
  if (loading) {
    return <AlphabetFilterSkeleton />;
  }

  return (
    <motion.div
      ref={ref}
      // layout
      className="
        relative
       flex flex-col lg:flex-col
       items-start lg:items-center
       justify-between
      z-20
      mx-auto
      rounded-lg
      lg:overflow-visible animate-slide-right 
      "
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--background)" }}
    >
      {/* ---------- Heading (auto hide after 3s + hide on scroll) ---------- */}
      <motion.div
        className="section-header w-full"
      >
        <h2 className="section-title ">
          Choose Your Brand A-Z 
        </h2>

        <p className="section-subtitle ">
          Explore all shopping categories alphabetically
        </p>
      </motion.div>


      <div className="w-full overflow-x-auto scroll-smooth no-scrollbar">

        {/* ------- Alphabet strip------- */}
        <motion.div
          ref={stripRef}
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              // transition: { staggerChildren: 0.02 },
            },
          }}
          className="
         flex flex-nowrap w-max min-w-full gap-1 sm:gap-1.25 md:gap-1.5
         py-3 sm:py-4
          w-full
         overflow-x-auto
           scroll-smooth
          no-scrollbar 
        "
        >
          {alphabets.map((char) => {
            const isActive = activeValue === char;

            return (
              <motion.button
                data-alpha={char}
                key={char}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActive(char);
                  onSelect?.(char);
                }}
                className={`
               relative shrink-0
               flex items-center justify-center
                rounded-md
               border border-[var(--border)]
               hover:border-[var(--primary)]
               
               font-secondary font-medium
               w-[30px] h-[28px]
               text-[12px]

               sm:w-[34px] sm:h-[32px] sm:text-[13px]
                md:w-[38px] md:h-[36px] md:text-[14px]
               lg:w-[42px] lg:h-[40px] lg:text-[15px]
               xl:w-[44px] xl:h-[42px] xl:text-[16px]
               transition-all duration-200
              ${isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                    : "bg-[var(--background)] text-[var(--muted-foreground)]"
                  }
              `}
                style={{
                  background: isActive ? "var(--primary)" : undefined,
                }}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      layoutId="activeGlow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.25 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--primary), transparent)",
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* {!isActive && (
                  <span
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--primary), transparent)",
                    }}
                  />
                )} */}

                <span className="relative z-10">{char}</span>

                {isActive && (
                  <motion.span
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 rounded-md"
                    style={{
                      border: "1px solid var(--primary)",
                    }}
                  />
                )}
              </motion.button>
            );

          })}
        </motion.div>
      </div>

    </motion.div>
  );
});

export default AlphabetFilter;
