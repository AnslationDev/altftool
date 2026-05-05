"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import CTAButton from "@/shared/ui/CTAButton";
import { useRef } from "react";
import {
  PencilRuler,
  Gamepad2,
  DatabaseZap,
  Newspaper,
} from "lucide-react";

/* -----------------------------
  Right side slider images
--------------------------------*/


const heroCards = [
  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773809878759-wqbigakz2lf.jpg?alt=media&token=66ba8c61-7ec4-41d4-8311-2d93e74a9e7f",
  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773810022141-w74vjdr6jm.jpg?alt=media&token=e2b88df8-8c4d-41bc-95e2-71fb8251948d",
  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773810133009-ydtxbulaha.jpg?alt=media&token=431e7441-0509-4e88-9168-5cfb3a58dda2",
  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773810203530-ciog3cj1sxl.jpg?alt=media&token=589fd508-b89c-475b-b7dd-417f89cce7f3",

  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773810469538-8fpilafz0kt.jpg?alt=media&token=eacc5854-9cfb-45f8-bf32-42a27ba261fe",
  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773810686883-3rlexe4pjym.jpg?alt=media&token=970d209f-3f97-4f2b-8f4f-9e28969b6ad2",


  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773811992626-i4wjl158nde.jpg?alt=media&token=dd39f85b-b507-41d1-a994-07288fe89253",
  "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773810895833-sj0uzmld16.jpg?alt=media&token=0a11e77b-8414-4b92-8505-4885bb233e3b",
];

/* -----------------------------
  Vertical column component
--------------------------------*/
function VerticalColumn({ images, reverse = false }) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative h-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex flex-col gap-6"
        animate={{
          y: undefined
            ? undefined
            : reverse
              ? ["-50%", "0%"]
              : ["0%", "-50%"],
        }}
        transition={{
          duration: 18,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[...images, ...images].map((src, i) => (
          <div
            key={i}
            className="relative h-[220px] w-full  overflow-hidden"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-fit p-2"
              priority={i < 2}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* -----------------------------
  Main Hero Section
--------------------------------*/
export default function HeroSection() {
  const { theme } = useTheme();
  const lines = [
    ["Quietly", "Useful"],
    ["Surprisingly", "Fun"],
    ["Actually", "Affordable"],
  ];

  const [displayed, setDisplayed] = useState([
    ["", ""],
    ["", ""],
    ["", ""],
  ]);

  const [lineIndex, setLineIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= lines.length) return;

    const currentWord = lines[lineIndex][wordIndex];

    const timeout = setTimeout(() => {
      setDisplayed((prev) => {
        const updated = [...prev];
        updated[lineIndex][wordIndex] = currentWord.slice(0, charIndex + 1);
        return updated;
      });

      if (charIndex + 1 === currentWord.length) {
        if (wordIndex === 0) {
          setWordIndex(1); // move to second word
          setCharIndex(0);
        } else {
          setLineIndex((prev) => prev + 1);
          setWordIndex(0);
          setCharIndex(0);
        }
      } else {
        setCharIndex((prev) => prev + 1);
      }
    }, 60);

    return () => clearTimeout(timeout);
  }, [charIndex, lineIndex, wordIndex]);

  const features = [
    {
      icon: PencilRuler,
      title: "200+ Tools & Extensions",
      description: "Works for everyone",
      style: "bg-[#FA913C] text-white",
    },
    {
      icon: Gamepad2,
      title: "Online Games",
      description: "Play free online games",
      style: "bg-[#2563eb] text-white",
    },
    {
      icon: Newspaper,
      title: "News",
      description: "Stay updated with latest News",
      style: "bg-[#22C45E] text-white",
    },
    {
      icon: DatabaseZap,
      title: "Powerful",
      description: "Small tools, big impact",
      style: "bg-[#EE4444] text-white",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative z-10 flex justify-center overflow-hidden bg-[var(--background)] section">

      {/* Glow Background */}
      <div className="absolute top-1/4 -left-40 md:-left-64 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[120px] opacity-30 animate-pulse-soft" />
      <div className="absolute bottom-1/4 -right-40 md:-right-64 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[120px] opacity-30 animate-pulse-soft" />

      <div className="w-full">

        <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-2">

          {/* LEFT */}
          <motion.div
            className="w-full text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
          >

            {/* HEADING */}
            <motion.h1
              className="mb-5 font-bold leading-tight tracking-tight
              text-3xl sm:text-3xl md:text-4xl lg:text-[56px] xl:text-[60px]
              text-[var(--foreground)]"
              variants={fadeUp}
            >
              {/* Line 1 */}
              <span>
                {displayed[0][0]}{" "}
                <span className="text-[var(--primary)] font-extrabold">
                  {displayed[0][1]}
                </span>
                {lineIndex === 0 && <span className="animate-pulse">|</span>}
              </span>

              <br />

              {/* Line 2 */}
              <span>
                {displayed[1][0]}{" "}
                <span className="text-[var(--primary)] font-extrabold">
                  {displayed[1][1]}
                </span>
                {lineIndex === 1 && <span className="animate-pulse">|</span>}
              </span>

              <br />

              {/* Line 3 */}
              <span>
                {displayed[2][0]}{" "}
                <span className="text-[var(--primary)] font-extrabold">
                  {displayed[2][1]}
                </span>
                {lineIndex === 2 && <span className="animate-pulse">|</span>}
              </span>
            </motion.h1>

            {/* SUBTEXT */}
            <motion.p
              className="mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl text-[var(--muted-foreground)] max-w-xl mx-auto lg:mx-0"
              variants={fadeUp}
            >
              Smart tools, simple games, and everyday deals — all designed to just work without effort.
            </motion.p>

            {/* BUTTONS */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              variants={fadeUp}
            >
              <CTAButton text="Try Now" href="/tools" />
              <CTAButton text="Explore Tools" href="/tools" variant="outline" className={` ${theme === "dark" ? "text-[var(--secondary-foreground)] hover:text-white" : "text-[var(--primary)]"}`} />
            </motion.div>
          </motion.div>

          {/* RIGHT SLIDER (DESKTOP ONLY) */}
          <div className="relative h-[420px] xl:h-[520px] w-full overflow-hidden hidden lg:block">

            <div className="grid grid-cols-2 gap-4 xl:gap-6 h-full">
              <VerticalColumn images={heroCards.slice(0, 4)} />
              <VerticalColumn images={heroCards.slice(4, 8)} reverse />
            </div>

          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className="mt-12 md:mt-16  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 200 }}
                // className={`flex items-center gap-3 rounded-xl p-3 md:p-4 transition
                // ${theme === "dark"
                //     ? "bg-[#111114]"
                //     : "bg-[#F8F9FA]"
                //   }`}
                className="flex items-center gap-3 rounded-xl p-3 md:p-4 transition bg-[var(--card)]"

                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >

                <div className={`grid place-items-center h-10 w-10 md:h-12 md:w-12 rounded-xl ${feature.style}`}>
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-sm md:text-base text-[var(--foreground)]">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[var(--muted-foreground)]">
                    {feature.description}
                  </p>
                </div>

              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}