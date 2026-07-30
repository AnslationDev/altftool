"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRedirect } from "../../store/redirect";
import { useRedirectConfig } from "../../store/redirect-config";
import { REDIRECT_DELAY_SECONDS } from "../../lib/site";
import { Button } from "../ui/button";

/**
 * Countdown shown while useCopyPrompt waits out the same
 * REDIRECT_DELAY_SECONDS before navigating this tab to the configured
 * destination. This overlay is just the visual countdown — the actual
 * navigation timer lives in useCopyPrompt and the two are kept in sync via
 * the shared REDIRECT_DELAY_SECONDS constant.
 */
export function RedirectOverlay() {
  const { active, label, stop } = useRedirect();
  const destinationLabel = useRedirectConfig((s) => s.redirectLabel);
  const [seconds, setSeconds] = React.useState(REDIRECT_DELAY_SECONDS);

  React.useEffect(() => {
    if (!active) {
      setSeconds(REDIRECT_DELAY_SECONDS);
      return;
    }
    setSeconds(REDIRECT_DELAY_SECONDS);
    const started = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      const remaining = Math.max(0, REDIRECT_DELAY_SECONDS - elapsed);
      setSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        stop();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const pct = 1 - seconds / REDIRECT_DELAY_SECONDS;
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-6 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card/80 p-8 text-center shadow-glow-lg"
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
            <button
              onClick={stop}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative mx-auto mb-6 grid h-32 w-32 place-items-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                <circle
                  cx="60" cy="60" r={R} fill="none"
                  stroke="url(#grad)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct)}
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-display text-4xl font-bold text-gradient-brand tabular-nums">
                {Math.ceil(seconds)}
              </span>
            </div>

            <h3 className="font-display text-xl font-semibold">Prompt copied — redirecting to {destinationLabel}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
              Paste <span className="text-foreground">{label}</span> into {destinationLabel} and hit generate.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button size="sm" onClick={stop}>
                Got it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
