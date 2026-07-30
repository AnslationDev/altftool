"use client";

import Link from "next/link";

export default function SmartLink() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--background)] px-4 text-center">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">This page has been retired</h1>
      <p className="max-w-md text-[var(--muted-foreground)]">
        Smart Link redirected visitors to a third-party site with no disclosure and has been shut down.
      </p>
      <Link href="/" className="mt-2 font-semibold text-[var(--primary)] hover:underline">
        Back to AltFTool
      </Link>
    </div>
  );
}
