"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { animations } from "@/platform/registry/animationRegistry";

// ─── Inject a global <style> that hides every animated element before first paint.
const STYLE_ID = "gap-animation-hide";

function injectHideStyles(classes) {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const selector = classes.map((cls) => `.${cls}`).join(", ");
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `@media (prefers-reduced-motion: no-preference) { ${selector} { opacity: 0; } }`;
  document.head.appendChild(style);
}

// ─── Context ───────────────────────────────────────────────────────────────

const AnimationContext = createContext(null);

export function useAnimation() {
  const ctx = useContext(AnimationContext);
  if (!ctx) throw new Error("useAnimation must be used inside GlobalAnimationProvider");
  return ctx;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const ANIMATED_CLASSES = Object.keys(animations);
const ANIMATION_SELECTOR = ANIMATED_CLASSES.map((cls) => `.${cls}`).join(", ");

function getAnimationClass(el) {
  return ANIMATED_CLASSES.find((cls) => el.classList.contains(cls)) ?? null;
}

function prepareElement(el) {
  // The injected stylesheet handles pre-reveal opacity without mutating
  // server-rendered DOM attributes during hydration.
}

function runAnimation(el, observer) {
  const animationClass = getAnimationClass(el);
  if (!animationClass) return;

  const { keyframes, options } = animations[animationClass];
  const resolvedOptions = typeof options === "function" ? options(el) : options;

  el.animate(keyframes, resolvedOptions);

  if (!("animateRepeat" in el.dataset)) {
    observer?.unobserve(el);
  }
}

/** Returns true if the element is fully or partially within the current viewport. */
function isInViewport(el) {
  const { top, bottom } = el.getBoundingClientRect();
  return top < window.innerHeight && bottom > 0;
}

function observeElements(observer, root = document) {
  (root.querySelectorAll?.(ANIMATION_SELECTOR) ?? []).forEach((el) => {
    if (el.dataset.animateOnce === "false") return;
    prepareElement(el);
    observer.observe(el);
  });
}

// ─── Provider ──────────────────────────────────────────────────────────────

export default function GlobalAnimationProvider({ children }) {
  const observerRef = useRef(null);

  injectHideStyles(ANIMATED_CLASSES);

  const animate = useCallback((el, className) => {
    if (!el || !animations[className]) return;
    const { keyframes, options } = animations[className];
    const resolvedOptions = typeof options === "function" ? options(el) : options;
    el.animate(keyframes, resolvedOptions);
  }, []);

  const observeRef = useCallback((ref) => {
    if (!observerRef.current || !ref?.current) return;
    observeElements(observerRef.current, ref.current);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const allElements = Array.from(document.querySelectorAll(ANIMATION_SELECTOR));
    const timeouts = [];

    // ── Split elements into two buckets on page load ──────────────────────
    const aboveFold = [];
    const belowFold = [];

    allElements.forEach((el) => {
      if (el.dataset.animateOnce === "false") return;
      prepareElement(el);
      isInViewport(el) ? aboveFold.push(el) : belowFold.push(el);
    });

    // ── Above-fold: fire immediately, staggered by DOM order ──────────────
    aboveFold.forEach((el, i) => {
      const baseDelay = Number(el.dataset.delay) || 0;
      const staggerDelay = i * 60; // 60ms between each above-fold element
      timeouts.push(setTimeout(() => runAnimation(el, null), baseDelay + staggerDelay));
    });

    // ── Below-fold: trigger when element reaches center of viewport ────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) runAnimation(entry.target, observer);
        });
      },
      {
        rootMargin: "-25% 0px -25% 0px",
        threshold: 0,
      }
    );

    observerRef.current = observer;
    belowFold.forEach((el) => observer.observe(el));

    // ── MutationObserver: handle dynamically added nodes ───────────────────
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          const handle = (el) => {
            if (!getAnimationClass(el) || el.dataset.animateOnce === "false") return;
            prepareElement(el);
            // Newly mounted nodes: same rule — in viewport now → immediate, else observe.
            if (isInViewport(el)) {
              runAnimation(el, null);
            } else {
              observer.observe(el);
            }
          };

          handle(node);
          (node.querySelectorAll?.(ANIMATION_SELECTOR) ?? []).forEach(handle);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      timeouts.forEach(clearTimeout);
      observer.disconnect();
      mutationObserver.disconnect();
      observerRef.current = null;
    };
  }, []);

  return (
    <AnimationContext.Provider value={{ animate, observeRef }}>
      {children}
    </AnimationContext.Provider>
  );
}
