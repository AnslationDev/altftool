"use client";

import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";

/*
 * One compliment per click.
 *
 * Written rather than generated, and specific rather than general — "you are
 * great" bounces off, "you noticed something today that other people walked
 * past" lands. Specificity is the entire mechanism.
 *
 * The shuffle avoids immediate repeats by remembering the last index, which
 * matters more than it sounds: a repeat inside two clicks makes the whole thing
 * feel mechanical and breaks the effect.
 */

const COMPLIMENTS = [
  "You noticed something today that other people walked straight past.",
  "The way you explain things to people who are behind you is genuinely kind.",
  "You are much further along than you were a year ago, even if today does not feel like it.",
  "Somebody has repeated something you said as though it were their own idea. That is a compliment.",
  "You ask better questions than most people in the room.",
  "The thing you are worrying about is smaller than it was at 2am. It will be smaller again tomorrow.",
  "You finish things. That is rarer than being clever.",
  "You are the person a friend thinks of when something goes wrong. That was earned.",
  "Your standards are high and you meet them more often than you give yourself credit for.",
  "You changed your mind about something recently. That takes more than people admit.",
  "Someone learned how to do something because you were patient with them.",
  "You are good at the unglamorous part, which is the part that actually matters.",
  "The care you put into things nobody will notice is not wasted. It shows up as quality.",
  "You have got through every difficult day so far. Your record is perfect.",
  "You are funnier than you think and you undersell it.",
  "Somebody felt less alone because you replied.",
  "You do the thing you said you would do. People build their plans around that.",
  "Your taste is better than your confidence in it.",
  "You apologise properly, which almost nobody does.",
  "The version of you from five years ago would be quietly impressed.",
  "You are allowed to be proud of something small you did this week.",
  "You listen to the end of sentences. It is more unusual than it should be.",
  "Something you built or wrote or fixed is still working, unnoticed, right now.",
  "You are not behind. You are on a different timeline to the one you are comparing yourself to.",
];

export default function EmergencyCompliment() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * COMPLIMENTS.length),
  );
  const [key, setKey] = useState(0);

  const next = useCallback(() => {
    setIndex((current) => {
      if (COMPLIMENTS.length < 2) return current;
      let candidate = current;
      while (candidate === current) {
        candidate = Math.floor(Math.random() * COMPLIMENTS.length);
      }
      return candidate;
    });
    setKey((n) => n + 1);
  }, []);

  return (
    <div className="flex min-h-[52vh] flex-col items-center justify-center gap-8 text-center">
      <p
        key={key}
        className="dtr-fade-in max-w-xl text-balance text-2xl font-medium leading-snug sm:text-3xl"
        aria-live="polite"
      >
        {COMPLIMENTS[index]}
      </p>

      <button
        type="button"
        onClick={next}
        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
        style={{ background: "var(--dtr-accent)", color: "var(--dtr-accent-foreground)" }}
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Another one
      </button>

      <p className="text-xs text-muted-foreground">
        Nothing here is generated. A person wrote each of these.
      </p>
    </div>
  );
}
