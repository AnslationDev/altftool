"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-reveal wrapper for Animal Hub sections.
 *
 * Follows the pattern already established by HnReveal in the housingneeds
 * module rather than introducing a second approach. Deliberately NOT
 * framer-motion: Animal Hub keeps almost every section a server component, and
 * a motion library would force the whole tree client-side. IntersectionObserver
 * plus a CSS transition does the job.
 *
 * `children` stay server-rendered — a client component can render server
 * children passed down from a server parent — so wrapping a section costs
 * nothing in bundle size beyond this file.
 *
 * The shown flag is written straight to the DOM as a data attribute instead of
 * held in React state. Nothing in the tree needs to re-render when a section
 * becomes visible, only a CSS-driven attribute flips, which avoids a render per
 * revealed element.
 *
 * SAFETY — this is an encyclopedia, so an animation must never be able to hide
 * content. Three independent guards, any one of which is sufficient:
 *   1. The hidden state is applied inside `@media (scripting: enabled)`. With
 *      JavaScript disabled, or in a browser that does not support the query,
 *      the rule never matches and everything renders fully visible.
 *   2. `prefers-reduced-motion` forces the shown state.
 *   3. A failsafe timer reveals regardless if the observer never fires.
 */
export default function AhReveal({
  children,
  delay = 0,
  // "" | "scale" | "left" | "right" | "blur" — mirrors the reveal variants in
  // the climatech stylesheet this module's motion is ported from.
  variant = "",
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
    // paint is never blank. The 1.25 multiplier covers content just below the
    // fold, which would otherwise flash in as soon as the user nudged down.
    if (node.getBoundingClientRect().top < window.innerHeight * 1.25) {
      show();
      return undefined;
    }

    // A POSITIVE bottom rootMargin extends the root box downward, so a section
    // reveals shortly before it scrolls into view. A negative value here (the
    // more common copy-paste) delays the reveal until the element is well
    // inside the viewport, which reads as blank space while scrolling.
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

    // IntersectionObserver callbacks are driven by the rendering pipeline, so a
    // throttled, backgrounded or stalled compositor can mean they never
    // dispatch — leaving a section at opacity 0 indefinitely. Reveal anyway
    // after a grace period.
    //
    // Six seconds, not the ~2.5 used elsewhere in the codebase: this page is
    // long and read slowly, and a short timer fires before an unhurried reader
    // has scrolled far enough to trigger the observer. The sections then get
    // marked shown while still off-screen, so nothing animates when they are
    // finally reached — the timer quietly defeats the effect it is protecting.
    // A stalled compositor is rare; being generous here costs nothing.
    const failsafe = window.setTimeout(show, 6000);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`ah-reveal${variant ? ` ah-reveal--${variant}` : ""} ${className}`.trim()}
      data-shown="false"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
