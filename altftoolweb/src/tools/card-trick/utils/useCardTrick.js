"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useHydrated from "@/hooks/useHydrated";
import { buildDeck, shuffle, drawCards } from "./deck";
import { playSound } from "./sound";

const LS_SOUND = "cardtrick.sound";
const LS_THEME = "cardtrick.theme";
const LS_HIGH = "cardtrick.highscore";

// Central state hook: persisted prefs + deck + free-play draw, plus a sound
// helper that respects the mute toggle. Trick stages live in the page so the
// phase machines stay readable.
export function useCardTrick() {
  const hydrated = useHydrated();

  const [deck, setDeck] = useState([]);
  const [drawn, setDrawn] = useState([]);

  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState("classic");
  const [highScore, setHighScore] = useState(0);

  // Load persisted prefs (client only) to avoid SSR/CSR mismatch.
  useEffect(() => {
    if (!hydrated) return;
    const apply = () => {
      try {
        const s = localStorage.getItem(LS_SOUND);
        if (s !== null) setSoundOn(s === "1");
        const t = localStorage.getItem(LS_THEME);
        if (t) setTheme(t);
        const h = localStorage.getItem(LS_HIGH);
        if (h) setHighScore(Number(h) || 0);
      } catch {
        /* ignore */
      }
    };
    apply();
  }, [hydrated]);

  // Build + shuffle a fresh deck once on mount.
  useEffect(() => {
    const init = () => setDeck(shuffle(buildDeck()));
    init();
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LS_SOUND, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const changeTheme = useCallback((id) => {
    setTheme(id);
    try {
      localStorage.setItem(LS_THEME, id);
    } catch {
      /* ignore */
    }
  }, []);

  const recordScore = useCallback(
    (score) => {
      setHighScore((prev) => {
        const next = Math.max(prev, score);
        try {
          localStorage.setItem(LS_HIGH, String(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    []
  );

  const sfx = useCallback(
    (kind) => {
      if (soundOn) playSound(kind);
    },
    [soundOn]
  );

  const shuffleDeck = useCallback(() => {
    setDeck((d) => shuffle(d.length ? d : buildDeck()));
    sfx("shuffle");
  }, [sfx]);

  const draw = useCallback(
    (n) => {
      setDeck((d) => {
        const { remaining, drawn: got } = drawCards(d, n);
        setDrawn((prev) => [...prev, ...got]);
        sfx("draw");
        return remaining;
      });
    },
    [sfx]
  );

  const resetDeck = useCallback(() => {
    setDrawn([]);
    setDeck(shuffle(buildDeck()));
    sfx("shuffle");
  }, [sfx]);

  const remaining = useMemo(() => deck.length, [deck]);

  return {
    hydrated,
    deck,
    drawn,
    remaining,
    soundOn,
    toggleSound,
    theme,
    changeTheme,
    highScore,
    recordScore,
    sfx,
    shuffleDeck,
    draw,
    resetDeck,
  };
}
