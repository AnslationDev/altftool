"use client";

import { useState, useEffect } from "react";
import useReducedMotion from "./useReducedMotion.js";

export default function TypewriterHeading({
  phrases = [],
  prefix = null,
  as: Component = "h2",
  className = "t49-hero-heavy",
  style = {},
  id,
  ariaLabel = "",
  cursorColor = null,
  typingSpeedMs = 75,
  deletingSpeedMs = 35,
  pauseMs = 3200,
}) {
  const shouldReduceMotion = useReducedMotion();
  const defaultText = phrases[0] || "";
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(defaultText);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion || !phrases.length) return;

    const currentPhrase = phrases[phraseIndex];
    const speed = isDeleting ? deletingSpeedMs : typingSpeedMs;

    if (!isDeleting && displayedText === currentPhrase) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseMs);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText === "") {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }, deletingSpeedMs);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting
          ? currentPhrase.substring(0, prev.length - 1)
          : currentPhrase.substring(0, prev.length + 1)
      );
    }, speed);

    return () => clearTimeout(timeout);
  }, [
    displayedText,
    isDeleting,
    phraseIndex,
    phrases,
    typingSpeedMs,
    deletingSpeedMs,
    pauseMs,
    shouldReduceMotion,
  ]);

  return (
    <Component
      id={id}
      className={className}
      style={style}
      aria-label={ariaLabel || defaultText}
    >
      {prefix && (
        <>
          {prefix}
          <br />
        </>
      )}
      <span className="t49-typewriter-wrapper">
        <span className="t49-typewriter-text">
          {shouldReduceMotion ? defaultText : displayedText || "\u00A0"}
        </span>
        <span
          className="t49-typewriter-cursor"
          style={
            cursorColor ? { backgroundColor: cursorColor } : undefined
          }
          aria-hidden="true"
        />
      </span>
    </Component>
  );
}
