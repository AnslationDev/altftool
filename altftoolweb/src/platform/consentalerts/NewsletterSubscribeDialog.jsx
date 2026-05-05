"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Button } from "@/shared/ui/Button";
import { Mail } from "lucide-react";

const STORAGE_KEY = "NEWSLETTER_SUBSCRIBE_V1";
const DISMISS_DAYS = 7;
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
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const triggered = useRef(false);

  useEffect(() => {
    if (pathname?.startsWith("/buysmart")) return;
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

  const dismiss = () => {
    remember("dismissed");
    setOpen(false);
  };

  const subscribe = () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setMessage("Enter a valid email address.");
      return;
    }

    remember("subscribed");
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={dismiss}>
      <DialogContent className="sm:max-w-md text-(--foreground)">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            <Mail className="h-5 w-5 text-primary"/>
            Subscribe to Newsletter
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm">
          Get updates when new tools or features are released.
        </p>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (message) setMessage("");
          }}
          className="mt-3 h-10 w-full rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 text-sm focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)"
        />
        {message ? (
          <p className="mt-2 text-xs font-medium text-[var(--anslation-ds-danger)]">
            {message}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={dismiss}>Not now</Button>
          <Button onClick={subscribe}>Subscribe</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
