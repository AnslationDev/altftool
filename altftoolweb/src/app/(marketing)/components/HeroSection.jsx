"use client";

import { motion } from "framer-motion";
import CTAButton from "@/shared/ui/CTAButton";
import {
  PencilRuler,
  Gamepad2,
  DatabaseZap,
  Newspaper,
} from "lucide-react";

export default function HeroSection() {
  const lines = [
    ["Quietly", "Useful"],
    ["Surprisingly", "Fun"],
    ["Actually", "Affordable"],
  ];

  const heroPreviewCards = [
    {
      icon: PencilRuler,
      title: "Micro tools",
      value: "97 live",
      desc: "Calculators, converters, AI helpers, and makers.",
    },
    {
      icon: Gamepad2,
      title: "Quick fun",
      value: "Games",
      desc: "Lightweight games and playful browser utilities.",
    },
    {
      icon: Newspaper,
      title: "Daily reads",
      value: "News",
      desc: "Fast headlines, guides, blogs, and trend surfaces.",
    },
    {
      icon: DatabaseZap,
      title: "Deals layer",
      value: "BuySmart",
      desc: "Brand discovery and useful shopping signals.",
    },
  ];

  const features = [
    {
      icon: PencilRuler,
      title: "200+ Tools & Extensions",
      description: "Works for everyone",
      tone: "var(--anslation-ds-primary)",
      surface: "var(--anslation-ds-primary-soft)",
    },
    {
      icon: Gamepad2,
      title: "Online Games",
      description: "Play free online games",
      tone: "var(--anslation-ds-accent)",
      surface: "color-mix(in srgb, var(--anslation-ds-accent) 14%, var(--card))",
    },
    {
      icon: Newspaper,
      title: "News",
      description: "Stay updated with latest News",
      tone: "var(--anslation-ds-success)",
      surface: "color-mix(in srgb, var(--anslation-ds-success) 14%, var(--card))",
    },
    {
      icon: DatabaseZap,
      title: "Powerful",
      description: "Small tools, big impact",
      tone: "var(--anslation-ds-danger)",
      surface: "color-mix(in srgb, var(--anslation-ds-danger) 12%, var(--card))",
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
      <div className="w-full">
        <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-2">
          <motion.div
            className="w-full text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
          >
            <motion.h1
              className="mb-5 font-bold leading-tight tracking-tight
              text-3xl sm:text-3xl md:text-4xl lg:text-[56px] xl:text-[60px]
              text-[var(--foreground)]"
              variants={fadeUp}
            >
              {lines.map(([prefix, highlight]) => (
                <span key={`${prefix}-${highlight}`} className="block">
                  {prefix}{" "}
                  <span className="font-extrabold text-[var(--primary)]">
                    {highlight}
                  </span>
                </span>
              ))}
            </motion.h1>

            <motion.p
              className="mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl text-[var(--muted-foreground)] max-w-xl mx-auto lg:mx-0"
              variants={fadeUp}
            >
              Smart tools, simple games, and everyday deals — all designed to just work without effort.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              variants={fadeUp}
            >
              <CTAButton text="Try Now" href="/tools" />
              <CTAButton
                text="Explore Tools"
                href="/tools"
                variant="outline"
                className="text-[var(--primary)]"
              />
            </motion.div>
          </motion.div>

          <div className="hidden h-full w-full lg:grid lg:grid-cols-2 lg:gap-4 xl:gap-5">
            {heroPreviewCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  className="flex min-h-[190px] flex-col justify-between rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.06, duration: 0.45 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--muted)">
                      <Icon className="h-5 w-5 text-(--primary)" />
                    </div>
                    <span className="rounded-full border border-(--border) bg-(--background) px-2.5 py-1 text-xs font-semibold text-(--muted-foreground)">
                      {item.value}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-(--foreground)">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 md:mt-16  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)] transition md:p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="grid h-10 w-10 place-items-center rounded-[var(--anslation-ds-radius)] md:h-12 md:w-12"
                  style={{ background: feature.surface, color: feature.tone }}
                >
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
