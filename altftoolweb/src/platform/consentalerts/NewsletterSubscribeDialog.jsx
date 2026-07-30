"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/ui/Button";
import { Mail, X } from "lucide-react";
import { isSelfChromePath } from "@/platform/navigation/GlobalChromeGate";

const STORAGE_KEY = "NEWSLETTER_SUBSCRIBE_V1";
const DISMISS_DAYS = 30;
const TRIGGER_DELAY_MS = 45000;
const SCROLL_DEPTH = 0.55;

function shouldSuppressPrompt() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    if (raw === "dismissed" || raw === "subscribed") return true;

    const saved = JSON.parse(raw);
    if (saved?.status === "subscribed") return true;
    if (!saved?.at) return false;

    return Date.now() - Number(saved.at) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function remember(status) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
}

export const NewsletterSubscribeDialog = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      pathname?.startsWith("/buysmart") ||
      pathname?.startsWith("/unsubscribe") ||
      isSelfChromePath(pathname)
    ) {
      setOpen(false);
      return;
    }
    if (shouldSuppressPrompt()) return;

    const trigger = () => {
      if (triggered.current) return;
      triggered.current = true;
      setOpen(true);
      cleanup();
    };

    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      if (window.scrollY / scrollable >= SCROLL_DEPTH) {
        trigger();
      }
    };

    const timeout = setTimeout(trigger, TRIGGER_DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
    };

    return cleanup;
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") dismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const dismiss = () => {
    remember("dismissed");
    setOpen(false);
  };

  const subscribe = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setMessage("Enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      const [{ db }, { addDoc, collection, serverTimestamp }] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/firestore"),
      ]);
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: value,
        source: "site-dialog",
        createdAt: serverTimestamp(),
      });
    } catch {
      // Storage failing shouldn't trap the user in the dialog — treat as done.
    } finally {
      setSaving(false);
    }

    remember("subscribed");
    setOpen(false);
  };

  if (!mounted || !open || isSelfChromePath(pathname)) return null;

  return createPortal(
    <aside
      aria-labelledby="newsletter-prompt-title"
      className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-50 mx-auto max-w-sm sm:bottom-6 rounded-xl border border-border bg-(--card) p-4 text-(--foreground) shadow-lg sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mx-0 sm:w-full"
      data-testid="newsletter-prompt"
    >
      <div className="flex items-start gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
          <Mail aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2
            className="text-base font-semibold text-(--card-foreground)"
            id="newsletter-prompt-title"
          >
            Stay in the loop
          </h2>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Get occasional updates about new tools and features.
          </p>
        </div>
      </div>

      <button
        aria-label="Dismiss newsletter signup"
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-md text-(--muted-foreground) transition hover:bg-muted hover:text-(--foreground) focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={dismiss}
        title="Dismiss"
        type="button"
      >
        <X aria-hidden="true" className="h-5 w-5" />
      </button>

      <form
        className="mt-4 flex items-start gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          subscribe();
        }}
      >
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="newsletter-prompt-email">
            Email address
          </label>
          <input
            aria-describedby={message ? "newsletter-prompt-error" : undefined}
            aria-invalid={Boolean(message)}
            autoComplete="email"
            className="h-10 w-full rounded-md border border-(--border) bg-(--background) px-3 text-sm focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            id="newsletter-prompt-email"
            onChange={(event) => {
              setEmail(event.target.value);
              if (message) setMessage("");
            }}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
          {message ? (
            <p
              className="mt-2 text-xs font-medium text-[var(--anslation-ds-danger)]"
              id="newsletter-prompt-error"
              role="alert"
            >
              {message}
            </p>
          ) : null}
        </div>
        <Button className="h-10 shrink-0 px-4" disabled={saving} type="submit">
          {saving ? "Saving..." : "Subscribe"}
        </Button>
      </form>
    </aside>,
    document.body,
  );
};
