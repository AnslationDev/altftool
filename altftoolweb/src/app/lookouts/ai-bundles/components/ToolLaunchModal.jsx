"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, UserPlus, X } from "lucide-react";
import ToolLogo from "./ToolLogo";

const REDIRECT_SECONDS = 3;

/**
 * Interstitial shown before any outbound tool link opens: surfaces Log in /
 * Sign up, then auto-redirects to the tool's site after REDIRECT_SECONDS
 * regardless of whether the visitor acts on either button.
 */
export default function ToolLaunchModal({ tool, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!tool) return undefined;
    redirectedRef.current = false;
    setSecondsLeft(REDIRECT_SECONDS);

    const redirectNow = () => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      window.open(tool.url, "_blank", "noopener,noreferrer");
      onClose();
    };

    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          redirectNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      clearInterval(tick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [tool, onClose]);

  const handleContinueNow = () => {
    if (!tool || redirectedRef.current) return;
    redirectedRef.current = true;
    window.open(tool.url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <AnimatePresence>
      {tool ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`Continue to ${tool.name}`}
            onClick={(event) => event.stopPropagation()}
            className="aib-card relative w-full max-w-sm overflow-hidden rounded-3xl bg-[var(--aib-surface)] p-6 text-center sm:p-7"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel and stay on this page"
              className="absolute right-3 top-3 rounded-full p-2 text-[var(--aib-muted-fg)] transition-colors hover:bg-[var(--aib-muted)] hover:text-[var(--aib-fg)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5">
              <ToolLogo name={tool.name} domain={tool.domain} hue={tool.hue} size={40} />
            </span>

            <h2 className="mt-4 text-lg font-extrabold text-[var(--aib-fg)]">Continue to {tool.name}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--aib-muted-fg)]">
              Log in or sign up to save favorites and track deals — or just continue as a guest.
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <a
                href="/account/login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--aib-border)] px-4 py-2.5 text-sm font-semibold text-[var(--aib-fg)] transition-colors hover:border-[var(--aib-primary)] hover:text-[var(--aib-primary)]"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Log in
              </a>
              <a
                href="/account/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="aib-sheen inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--aib-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--aib-primary-fg)] shadow-lg shadow-[var(--aib-primary)]/20"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Sign up
              </a>
            </div>

            <div className="mt-6">
              <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--aib-muted)]">
                <motion.div
                  key={`${tool.name}-${tool.domain}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: REDIRECT_SECONDS, ease: "linear" }}
                  className="h-full rounded-full bg-[var(--aib-primary)]"
                />
              </div>
              <p className="mt-2.5 text-xs font-semibold text-[var(--aib-muted-fg)]">
                Continuing to {tool.name} in {secondsLeft}s ·{" "}
                <button
                  type="button"
                  onClick={handleContinueNow}
                  className="font-bold text-[var(--aib-primary)] underline underline-offset-2"
                >
                  Go now
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
