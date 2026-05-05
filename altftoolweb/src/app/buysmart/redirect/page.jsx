"use client";

import { Suspense } from "react";
import RedirectClient from "./RedirectClient";

export default function RedirectPage() {
  return (
    <Suspense fallback={null}>
      <RedirectClient />
    </Suspense>
  );
}
