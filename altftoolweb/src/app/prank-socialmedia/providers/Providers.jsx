"use client";

import { Toaster } from "../components/ui/sonner";

export function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-center" />
    </>
  );
}
