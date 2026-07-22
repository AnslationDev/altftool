"use client";
import { useEffect, useRef } from "react";

export function useReveal(options = {}) {
  const ref = useRef(null);
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -60px 0px",
    once = true,
    className = "reveal",
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already visible (e.g. hero), mark visible immediately
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add("visible");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

export function useRevealMultiple(options = {}) {
  const refs = useRef([]);
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -60px 0px",
    once = true,
    className = "reveal",
    staggerDelay = 80,
  } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, idx * staggerDelay);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold, rootMargin }
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [threshold, rootMargin, once, staggerDelay]);

  return refs;
}
