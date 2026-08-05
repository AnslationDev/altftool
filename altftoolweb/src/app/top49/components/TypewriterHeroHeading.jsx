"use client";

import { useState, useEffect } from "react";
import useReducedMotion from "./useReducedMotion.js";

const PHRASES = [
  "everything, ranked.",
  "top products, ranked.",
  "tools & apps, ranked.",
  "tech & gear, ranked.",
];

export default function TypewriterHeroHeading() {
  const shouldReduceMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(PHRASES[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const currentPhrase = PHRASES[phraseIndex];
    const typingSpeed = isDeleting ? 35 : 75;

    if (!isDeleting && displayedText === currentPhrase) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 3200);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText === "") {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }, 35);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting
          ? currentPhrase.substring(0, prev.length - 1)
          : currentPhrase.substring(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, phraseIndex, shouldReduceMotion]);

  return (
    <h1
      className="t49-hero-heavy"
      style={{ marginTop: 18 }}
      aria-label="The best of everything, ranked."
    >
      The best of
      <br />
      <span className="t49-typewriter-wrapper">
        <span className="t49-typewriter-text">
          {shouldReduceMotion ? PHRASES[0] : displayedText || "\u00A0"}
        </span>
        <span className="t49-typewriter-cursor" aria-hidden="true" />
      </span>
    </h1>
  );
}
