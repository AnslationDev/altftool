"use client";

import Header from "../components/Header";
import ConversionPanel from "../components/ConversionPanel";

export default function DecimalConverter() {
  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Header />
        <ConversionPanel />
      </div>
    </div>
  );
}
