"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 60;
const DELETE_MS = 32;
const HOLD_MS = 1900;

/**
 * Classic type → hold → delete → next-word cycle, driven by plain setTimeout
 * state (no framer-motion) — this route's showcase hit a real bug where
 * framer-motion's AnimatePresence silently stopped re-rendering swapped
 * children, so headline text-rotation deliberately avoids that machinery.
 */
export default function useTypewriter(words) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    let timeout;

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), HOLD_MS);
    } else if (deleting && text === "") {
      setDeleting(false);
      setWordIndex((index) => index + 1);
    } else {
      const next = deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1);
      timeout = setTimeout(() => setText(next), deleting ? DELETE_MS : TYPE_MS);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words]);

  return text;
}
