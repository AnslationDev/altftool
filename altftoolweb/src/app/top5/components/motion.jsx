"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Shared animation primitives for the Top5 microsite. Kept local to this
 * section — nothing here is imported by /top9 or /top11.
 */

export const EASE = [0.16, 1, 0.3, 1];

export function Reveal({
  children,
  delay = 0,
  y = 28,
  duration = 0.7,
  className,
  as = "div",
  once = true,
  amount = 0.2,
}) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Component>
  );
}

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function StaggerGroup({ children, className, once = true, amount = 0.15 }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, as = "div" }) {
  const Component = motion[as] || motion.div;
  return (
    <Component variants={staggerItem} className={className}>
      {children}
    </Component>
  );
}

export const hoverLift = {
  whileHover: { y: -6, transition: { duration: 0.3, ease: EASE } },
  whileTap: { scale: 0.98 },
};

export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.3, ease: EASE } },
  whileTap: { scale: 0.97 },
};

/**
 * Animated number counter. Counts up from 0 to `value` once it scrolls into
 * view. `value` may include non-numeric characters (e.g. "184K", "2,400+");
 * everything except the leading numeric run is preserved as a suffix and the
 * separators (",") are restored on render.
 */
/**
 * Slow-spinning 8-petal flower/asterisk, the small decorative motif the
 * reference brief reuses beside its "what we do" copy and its closing CTA.
 * Pure SVG + trig, no image asset.
 */
export function PetalBurst({ className, color = "currentColor", petals = 8 }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="26"
          rx="7"
          ry="20"
          fill={color}
          transform={`rotate(${(360 / petals) * i} 50 50)`}
        />
      ))}
    </motion.svg>
  );
}

export function AnimatedCounter({ value, className, duration = 1.6 }) {
  const ref = useRef(null);
  const match = String(value).match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  const numeric = match ? parseFloat(match[1].replace(/,/g, "")) : 0;
  const suffix = match ? match[2] : "";
  const hasComma = match ? match[1].includes(",") : false;
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;

  const [display, setDisplay] = useState(
    decimals ? (0).toFixed(decimals) : "0",
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let stopAnimation = () => {};
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          const controls = animate(0, numeric, {
            duration,
            ease: EASE,
            onUpdate: (latest) => {
              const fixed = decimals ? latest.toFixed(decimals) : Math.round(latest).toString();
              setDisplay(hasComma ? Number(fixed).toLocaleString("en-US") : fixed);
            },
          });
          stopAnimation = controls.stop;
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeric, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
