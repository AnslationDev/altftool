"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Button } from "@/shared/ui/Button";
import { Mail } from "lucide-react";

const STORAGE_KEY = "NEWSLETTER_SUBSCRIBE_V1";

export const NewsletterSubscribeDialog = () => {
  const [open, setOpen] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const trigger = () => {
      if (triggered.current) return;
      triggered.current = true;
      setOpen(true);
      cleanup();
    };

    const timeout = setTimeout(trigger, 4000);
    const events = ["scroll", "click", "keydown"];
    events.forEach(e =>
      window.addEventListener(e, trigger, { once: true })
    );

    const cleanup = () => {
      clearTimeout(timeout);
      events.forEach(e =>
        window.removeEventListener(e, trigger)
      );
    };

    return cleanup;
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setOpen(false);
  };

  const subscribe = () => {
    localStorage.setItem(STORAGE_KEY, "subscribed");
    setOpen(false);
    // call API here
  };

  return (
    <Dialog open={open} onOpenChange={dismiss}>
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
          className="w-full mt-3 px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={dismiss}>Not now</Button>
          <Button onClick={subscribe}>Subscribe</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
