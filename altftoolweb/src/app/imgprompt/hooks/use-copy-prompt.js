"use client";

import * as React from "react";
import { toast } from "sonner";
import { copyToClipboard } from "../lib/utils";
import { useRedirect } from "../store/redirect";
import { useRedirectConfig } from "../store/redirect-config";
import { useAuth } from "../providers/auth-provider";
import { REDIRECT_DELAY_SECONDS } from "../lib/site";

/**
 * Requires the user to be signed in, copies a prompt to the clipboard,
 * shows a 3-second countdown, then navigates this same tab to the
 * destination. No new tab is opened, so there's nothing for a popup
 * blocker to ever step in and block.
 */
export function useCopyPrompt() {
  const start = useRedirect((s) => s.start);
  const destinationUrl = useRedirectConfig((s) => s.redirectUrl);
  const { requireAuth } = useAuth();

  return React.useCallback(
    (text, label = "your prompt", redirect = true) => {
      requireAuth(async () => {
        const ok = await copyToClipboard(text);
        if (!ok) {
          toast.error("Couldn't copy automatically", {
            description: "Select the prompt text and copy it manually.",
          });
          return;
        }
        if (!redirect) return;

        const timerId = window.setTimeout(() => {
          window.location.href = destinationUrl;
        }, REDIRECT_DELAY_SECONDS * 1000);
        start(label, timerId);
      });
    },
    [start, destinationUrl, requireAuth]
  );
}
