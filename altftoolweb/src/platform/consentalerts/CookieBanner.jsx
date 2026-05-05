"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { useCookieConsent } from "./CookieConsentContext";
import { CookiePreferencesModal } from "./CookiePreferencesModal";

export const CookieBanner = () => {
  const { consent, saveConsent } = useCookieConsent();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (consent) return;
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, [consent]);

  if (consent || !visible) return null;

  return (
    <>
      <div
  className="
    fixed bottom-4 left-4 z-50
    w-[360px]
    rounded-xl
    bg-(--card)
    border border-border
    shadow-2xl
    backdrop-blur
    text-(--foreground)
  "
>

        <div className="p-4 space-y-4">
          <p className="text-sm ">
            We use cookies to improve experience, analyze traffic, and personalize content.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                saveConsent({
                  necessary: true,
                  analytics: false,
                  marketing: false,
                  preferences: false,
                })
              }
            >
              Reject
            </Button>

            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              Customize
            </Button>

            <Button
              size="sm"
              className="ml-auto"
              onClick={() =>
                saveConsent({
                  necessary: true,
                  analytics: true,
                  marketing: true,
                  preferences: true,
                })
              }
            >
              Accept
            </Button>
          </div>
        </div>
      </div>

      <CookiePreferencesModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};
