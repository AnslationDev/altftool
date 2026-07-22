"use client";

import { useAuth } from "../../providers/auth-provider";
import { AuthDialog } from "./auth-dialog";

/**
 * Single app-wide auth prompt, driven by AuthProvider's requireAuth().
 * Any action that needs a signed-in user (copying a prompt, etc.) calls
 * requireAuth(() => doTheThing()) — if the user isn't signed in, this
 * dialog opens, and doTheThing() runs automatically right after they
 * successfully sign in/up, with no extra wiring at the call site.
 */
export function GlobalAuthDialog() {
  const { authPromptOpen, closeAuthPrompt, resolveAuthPrompt } = useAuth();

  return (
    <AuthDialog
      open={authPromptOpen}
      onOpenChange={() => closeAuthPrompt()}
      defaultMode="signup"
      onSuccess={resolveAuthPrompt}
    />
  );
}
