"use client";

import { Suspense } from "react";
import RedirectClient from "./RedirectClient";
import { AltftoolLoader } from "@/components/ui/route-loading";

export default function RedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-(--background) px-4 text-(--foreground)">
          <AltftoolLoader
            label="Preparing redirect"
            detail="Checking the destination before opening the offer"
            className="max-w-md"
          />
        </main>
      }
    >
      <RedirectClient />
    </Suspense>
  );
}
