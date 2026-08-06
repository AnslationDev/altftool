"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Type anything. It drifts up and dissolves. Nothing is stored or sent.
 *
 * Words are released on space or enter rather than per character, because
 * per-character release turns a sentence into confetti and loses the one thing
 * that makes this work — watching a whole thought leave.
 *
 * Drifting words are absolutely positioned and removed on animation end rather
 * than on a timer, so a backgrounded tab (where animations pause) does not
 * accumulate hundreds of invisible nodes and come back as a stutter.
 */

const MAX_DRIFTING = 60;

export default function TheVoid() {
  const [value, setValue] = useState("");
  const [drifting, setDrifting] = useState([]);
  const [released, setReleased] = useState(0);
  const nextId = useRef(0);
  const inputRef = useRef(null);

  const release = useCallback((text) => {
    const word = text.trim();
    if (!word) return;

    const id = nextId.current++;
    const item = {
      id,
      text: word,
      left: 12 + Math.random() * 76, // vw, kept off the edges
      drift: (Math.random() - 0.5) * 90, // px of horizontal wander
      duration: 5.5 + Math.random() * 3.5,
      scale: 0.85 + Math.random() * 0.5,
    };

    setDrifting((current) => [...current, item].slice(-MAX_DRIFTING));
    setReleased((count) => count + 1);
  }, []);

  const remove = useCallback((id) => {
    setDrifting((current) => current.filter((item) => item.id !== id));
  }, []);

  const onChange = (event) => {
    const text = event.target.value;
    // A trailing space means a word just finished.
    if (/\s$/.test(text)) {
      release(text);
      setValue("");
      return;
    }
    setValue(text);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      release(value);
      setValue("");
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="dtr-void relative flex min-h-[62vh] flex-col items-center justify-end overflow-hidden rounded-2xl border border-border"
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      {drifting.map((item) => (
        <span
          key={item.id}
          className="dtr-void-word"
          style={{
            left: `${item.left}%`,
            "--dtr-void-drift": `${item.drift}px`,
            "--dtr-void-duration": `${item.duration}s`,
            "--dtr-void-scale": item.scale,
          }}
          onAnimationEnd={() => remove(item.id)}
          aria-hidden="true"
        >
          {item.text}
        </span>
      ))}

      <div className="relative z-10 w-full max-w-md p-6 pb-10">
        <label htmlFor="void-input" className="sr-only">
          Type something to release into the void
        </label>
        <input
          id="void-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          placeholder="Type something and press space…"
          className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-center text-base outline-none backdrop-blur placeholder:text-muted-foreground/70 focus-visible:border-[var(--dtr-accent)]"
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {released === 0
            ? "Nothing is stored. Nothing is sent. Nothing can be recovered."
            : `${released} ${released === 1 ? "word" : "words"} released and gone.`}
        </p>
      </div>
    </div>
  );
}
