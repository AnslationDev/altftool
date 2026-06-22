"use client";

import Link from "next/link";
import { primaryButton } from "./uiClasses";

export default function NotFoundPrank({ slug }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center text-white">
      <h1 className="text-4xl font-black">Prank route not found</h1>
      <p className="mt-3 text-slate-300">`/pranx/{slug}` is not in this local prank set yet.</p>
      <Link href="/pranx" className={`${primaryButton} mt-6`}>Back to Pranx</Link>
    </main>
  );
}
