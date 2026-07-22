"use client";

import { WORD_COLORS } from "./Board";

/**
 * The list of hidden words. Found words get a strikethrough plus the same
 * tint that highlights them on the board.
 */
export default function WordList({ words, foundMap }) {
  return (
    <ul className="flex flex-wrap content-start gap-1.5" aria-label="Words to find">
      {words.map(({ word }) => {
        const colorIndex = foundMap.get(word);
        const found = colorIndex !== undefined;
        return (
          <li key={word}>
            <span
              className={
                found
                  ? "inline-flex rounded-md px-2 py-1 text-xs font-medium text-foreground line-through decoration-2"
                  : "inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground"
              }
              style={
                found
                  ? { backgroundColor: WORD_COLORS[colorIndex % WORD_COLORS.length].chip }
                  : undefined
              }
            >
              {word}
              {found ? <span className="sr-only"> (found)</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
