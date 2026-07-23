"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-reveal wrapper.
 *
 * Deliberately not framer-motion: this module keeps almost every section as a
 * server component, and pulling in a motion library would force them all
 * client-side. IntersectionObserver plus a CSS transition is enough.
 *
 * The shown flag is written straight to the DOM as a data attribute rather
 * than held in React state. Nothing in the tree needs to re-render when an
 * element becomes visible — only a CSS-driven attribute flips — so this
 * avoids a cascading render per revealed element, which on a page with ~25
 * of them is a real cost.
 *
 * Content is visible with no JS at all: `.hn-app.no-js .hn-reveal` and the
 * reduced-motion block both force the shown state, so this can only ever add
 * polish, never hide content.
 */
export default function HnReveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const show = () => node.setAttribute("data-shown", "true");

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      show();
      return undefined;
    }

    // Anything at or near the first screen shows immediately, so the initial
    // paint is never blank. The 1.25 multiplier deliberately covers content
    // just below the fold.
    if (node.getBoundingClientRect().top < window.innerHeight * 1.25) {
      show();
      return undefined;
    }

    // Positive bottom rootMargin extends the root box DOWNWARD, so an element
    // reveals shortly before it scrolls into view. A negative margin here
    // (the more common copy-paste) delays the reveal until the element is
    // well inside the viewport, which reads as blank space while scrolling.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px 25% 0px", threshold: 0 },
    );

    observer.observe(node);

    // Failsafe. An animation must never be able to permanently hide content.
    // IntersectionObserver callbacks are driven by the rendering pipeline, so
    // a throttled, backgrounded or otherwise stalled compositor can mean they
    // simply never dispatch — in which case the element would sit at opacity 0
    // forever. After a short grace period, reveal regardless. By then anything
    // still off-screen is invisible to the user anyway, so the effect is not
    // lost in the normal case.
    const failsafe = window.setTimeout(show, 2500);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`hn-reveal ${className}`.trim()}
      data-shown="false"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
