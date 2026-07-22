"use client";

import { memo, useEffect, useRef } from "react";

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-[1em] w-0.5 translate-y-[0.14em] rounded-full bg-primary motion-safe:animate-pulse"
    />
  );
}

const Word = memo(function Word({ target, typed, isActive, isDone, showCaret, wordRef }) {
  const shown = typed ?? "";
  const length = Math.max(target.length, shown.length);
  const nodes = [];

  for (let j = 0; j < length; j += 1) {
    if (isActive && showCaret && j === shown.length) {
      nodes.push(<Caret key="caret" />);
    }
    const targetChar = target[j];
    const typedChar = shown[j];
    let className = "text-muted-foreground/70";
    let char = targetChar ?? typedChar;
    if (typedChar != null) {
      if (targetChar == null) {
        // Extra character typed past the end of the word.
        className = "text-red-600/80 dark:text-red-400/80";
        char = typedChar;
      } else if (typedChar === targetChar) {
        className = "text-emerald-600 dark:text-emerald-400";
      } else {
        className = "text-red-600 dark:text-red-400";
      }
    }
    nodes.push(
      <span key={j} className={className}>
        {char}
      </span>,
    );
  }
  if (isActive && showCaret && shown.length >= length) {
    nodes.push(<Caret key="caret-end" />);
  }

  const wrong = isDone && shown !== target;
  return (
    <span
      ref={wordRef}
      className={`whitespace-nowrap rounded-sm px-0.5 ${isActive ? "bg-primary/10" : ""} ${
        wrong ? "underline decoration-red-600/60 decoration-2 underline-offset-4 dark:decoration-red-400/60" : ""
      }`}
    >
      {nodes}
    </span>
  );
});

/**
 * The scrolling word stream. Shows three lines of words; keeps the active
 * word on the middle line by adjusting scrollTop (instant, no animation).
 * Purely visual — the hidden input in the parent handles all interaction.
 */
export default function WordStream({ words, typedWords, wordIdx, value, showCaret }) {
  const containerRef = useRef(null);
  const activeWordRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const active = activeWordRef.current;
    if (!container || !active) return;
    const first = container.firstElementChild;
    const baseTop = first ? first.offsetTop : 0;
    const rowHeight = active.offsetHeight + 4; // + gap-y-1 (4px)
    container.scrollTop = Math.max(0, active.offsetTop - baseTop - rowHeight);
  }, [wordIdx, value, words]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative flex h-[6.5rem] select-none flex-wrap content-start gap-x-2 gap-y-1 overflow-hidden text-xl font-medium leading-8 sm:h-[7.25rem] sm:text-2xl sm:leading-9"
    >
      {words.map((word, index) => (
        <Word
          key={index}
          target={word}
          typed={index === wordIdx ? value : index < wordIdx ? typedWords[index] : null}
          isActive={index === wordIdx}
          isDone={index < wordIdx}
          showCaret={showCaret}
          wordRef={index === wordIdx ? activeWordRef : null}
        />
      ))}
    </div>
  );
}
