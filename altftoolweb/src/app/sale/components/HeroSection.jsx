"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const headingStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/**
 * Static device composition (laptop + headphones + watch + phone) built
 * from stored image assets in /public — not real-time/API data.
 *
 * No card frame at all: no border, no rounded corners, no background
 * fill on the image wrappers — just the raw PNG/JPG content. Each photo's
 * own light backdrop is blended away with mix-blend-mode so only the
 * product silhouette reads against the hero background, and each device
 * floats with its own slow, continuous animation loop.
 */
function DeviceComposition() {
  const blend = "[mix-blend-mode:multiply] dark:[mix-blend-mode:normal]";

  return (
    <div className="relative h-full w-full max-w-[40rem]">
      {/* Laptop — large, anchored left-of-center */}
      <motion.div
        className="absolute left-0 top-0 h-[78%] w-[76%]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.7,},
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
        }}
      >
        <Image
          src="/sale-locator/hero-section-2/fm.png"
          alt="Laptop"
          fill
          priority
          sizes="(max-width: 1024px) 70vw, 520px"
          className={`object-contain ${blend}`}
        />
      </motion.div>

      {/* Headphones — top right, overlapping the laptop corner */}
      <motion.div
        className="absolute right-[-4%] top-[-4%] h-[52%] w-[44%]"
        initial={{ opacity: 0, x: 24, y: -16 }}
        // animate={{ opacity: 1, x: 0, y:0}}
        transition={{
          opacity: { duration: 0.7, delay: 0.2,  },
          x: { duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
        }}
      >
        {/* <Image
          src="/sale-locator/hero-section-2/hero-device-headphones.jpg"
          alt="Headphones"
          fill
          sizes="(max-width: 1024px) 34vw, 260px"
          className={`object-contain ${blend}`}
        /> */}
      </motion.div>

      {/* Watch — bottom right */}
      <motion.div
        className="absolute bottom-20 right-0 h-[30%] w-[30%]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.7, delay: 0.35,  },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.6 },
        }}
      >
        <Image
          src="/sale-locator/hero-section-2/shopping.webp"
          alt="Smartwatch"
          fill
          sizes="(max-width: 1024px) 24vw, 180px"
          className={`object-contain ${blend}`}
        />
      </motion.div>

      {/* Phone — bottom right, slightly behind the watch */}
      <motion.div
        className="absolute bottom-[-2%] right-[24%] h-[46%] w-[28%]"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0}}
        transition={{
          opacity: { duration: 0.7, delay: 0.45, },
           y: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2 },
        }}
      >
        {/* <Image
          src="https://img.magnific.com/free-psd/colorful-shopping-bags-held-by-hand_191095-83728.jpg?semt=ais_hybrid&w=740&q=80"
          alt="Smartphone"
          fill
          unoptimized
          sizes="(max-width: 1024px) 20vw, 160px"
          className={`object-contain ${blend}`}
        /> */}
      </motion.div>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <>
      {/* dotted pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(color-mix(in srgb, var(--border) 90%, transparent) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* soft radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 20% 10%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%)",
        }}
      />

      {/* blurred accent blobs */}
      <motion.div
        className="pointer-events-none absolute -left-28 -top-24 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
        animate={{ x: [0, 24, 0], y: [0, 16, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 top-4 h-[22rem] w-[22rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--secondary) 18%, transparent)" }}
        animate={{ x: [0, -18, 0], y: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-[18rem] w-[18rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        animate={{ x: [0, 14, 0], y: [0, -14, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </>
  );
}

export default function HeroSection({
  hero = {},
  locationName = "Your Location",
  locationStatus = "idle",
  onDetectLocation = () => {},
}) {
  // Location shows inline in the badge only once it's actually resolved —
  // never guessed/shown while denied, detecting, or idle.
  const baseBadge = hero.badge || "Nearby Shopping Deals";
  const badgeText =
    locationStatus === "resolved" && locationName ? `${baseBadge} in ${locationName}` : baseBadge;
  const headingLine1 = hero.headingLine1 || "DISCOVER";
  const headingAccent = hero.headingAccent || "LATEST OFFERS";
  const headingLine3 = hero.headingLine3 || "NEAR YOU";
  const description =
    hero.subtext ||
    "Discover real-time shopping offers, nearby sales, exclusive discounts, seasonal campaigns, and trending deals from top brands around your location.";

  const scrollToDeals = () => {
    document.getElementById("sales-near-you")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="section relative">
      {/* ════════════════════════════════════════════════════════════
          PREMIUM HERO — 40/60 split, ~90vh, gradient heading, live
          location-based offer image. No wrapper box/border/frame —
          background decor and content sit directly in the section so
          the hero reads as open/free, not boxed into a container.
          ════════════════════════════════════════════════════════════ */}
      {/* <BackgroundDecor /> */}

      <div className="relative z-10 py-12 lg:flex  lg:items-center lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-8 w-full">
          {/* ── LEFT CONTENT (~40%) ── */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--muted) px-4 py-1.5 text-xs font-semibold text-(--primary) font-secondary"
            >
              <MapPin className="h-3.5 w-3.5" />
              {badgeText}
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={headingStagger}
              className="font-primary font-extrabold tracking-tight leading-[1.05] text-[2.5rem] sm:text-6xl lg:text-[3.4rem]"
            >
              <motion.span variants={fadeUp} className="block text-(--foreground)">
                {headingLine1}
              </motion.span>
              <motion.span
                variants={fadeUp}
                className="block"
                style={{
                  backgroundImage: "var(--anslation-ds-cta-gradient)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {headingAccent}
              </motion.span>
              <motion.span variants={fadeUp} className="block text-(--foreground)">
                {headingLine3}
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-6 max-w-md text-sm sm:text-base leading-relaxed text-(--muted-foreground) font-secondary"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                type="button"
                onClick={scrollToDeals}
                whileHover={{ y: -3, boxShadow: "0 16px 36px color-mix(in srgb, var(--primary) 38%, transparent)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white font-secondary shadow-[0_10px_28px_color-mix(in_srgb,var(--primary)_25%,transparent)] cursor-pointer"
                style={{ backgroundImage: "var(--anslation-ds-cta-gradient)" }}
              >
                Explore Offers
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                type="button"
                onClick={onDetectLocation}
                whileHover={{ y: -3, borderColor: "var(--primary)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--card) px-7 py-3.5 text-sm font-semibold text-(--foreground) font-secondary transition-colors hover:text-(--primary) cursor-pointer"
              >
                {locationStatus === "detecting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                Nearby Stores
              </motion.button>
            </motion.div>
          </div>

          {/* ── RIGHT VISUAL (~60%) — static device composition, no card frame ── */}
          <div className="lg:col-span-7">
            <div className="relative mx-auto flex h-[26rem] max-w-2xl items-center justify-center sm:h-[34rem] lg:h-[40rem] lg:max-w-none">
              {/* soft glow circle behind the floating image, like the reference */}
              <div
                className="pointer-events-none absolute h-[70%] w-[70%] rounded-full blur-2xl"
                style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)" }}
              />

              <DeviceComposition />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
