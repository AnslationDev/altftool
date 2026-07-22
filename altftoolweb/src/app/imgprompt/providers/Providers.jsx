"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";
import { RedirectOverlay } from "../components/shared/redirect-overlay";
import { GlobalAuthDialog } from "../components/shared/global-auth-dialog";
import { useRedirectConfig } from "../store/redirect-config";

export function Providers({ children }) {
  useEffect(() => {
    useRedirectConfig.getState().load();
  }, []);

  return (
    <AuthProvider>
      {children}
      <RedirectOverlay />
      <GlobalAuthDialog />
      <Toaster theme="light" richColors position="top-center" offset={88} />
    </AuthProvider>
  );
}
