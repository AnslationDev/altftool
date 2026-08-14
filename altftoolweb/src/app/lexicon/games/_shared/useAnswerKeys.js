"use client";

import { useEffect } from "react";

/*
 * Number keys answer the current round.
 *
 * Listens on the window rather than on the options list. A handler bound to the
 * buttons only fires once focus is already inside them, which means the reader
 * has to click a button before the keyboard works — and once they have clicked
 * a button they have already answered. The shortcut only helps if it works from
 * the moment the page loads.
 *
 * Three guards make a window-level listener safe here:
 *
 *   - modifier chords are left alone, so Cmd-1 still switches browser tabs
 *   - typing targets are left alone, so a digit typed into the scramble game's
 *     answer box is a digit and not an answer
 *   - keys outside 1..count are ignored, so nothing is swallowed silently
 *
 * `answer` receives the 1-based number the reader pressed. Games whose options
 * are a list convert it to an index themselves; a shared hook that assumed one
 * or the other would be wrong for half its callers.
 */
export function useAnswerKeys(answer, count, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || !Number.isInteger(count) || count < 1) return undefined;

    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
      ) {
        return;
      }

      const pressed = Number(event.key);
      if (!Number.isInteger(pressed) || pressed < 1 || pressed > count) return;

      event.preventDefault();
      answer(pressed);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [answer, count, enabled]);
}
