"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useFakeTyping(speed = 30) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const queueRef = useRef([]);
  const timeoutRef = useRef(null);

  const typeNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      setIsTyping(false);
      return;
    }

    const item = queueRef.current.shift();
    let index = 0;
    setIsTyping(true);
    setDisplayedText("");

    const type = () => {
      if (index < item.length) {
        setDisplayedText((prev) => prev + item[index]);
        index++;
        timeoutRef.current = setTimeout(type, speed);
      } else {
        setDisplayedText((prev) => prev + "\n");
        timeoutRef.current = setTimeout(typeNext, 200);
      }
    };

    type();
  }, [speed]);

  const addText = useCallback(
    (text) => {
      queueRef.current.push(text);
      if (!isTyping) typeNext();
    },
    [isTyping, typeNext],
  );

  const clear = useCallback(() => {
    queueRef.current = [];
    setIsTyping(false);
    setDisplayedText("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { displayedText, isTyping, addText, clear, setDisplayedText };
}
