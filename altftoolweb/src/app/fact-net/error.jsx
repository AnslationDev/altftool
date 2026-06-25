"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function FactNetError({ error, reset }) {
  return (
    <main className="fn-page">
      <section className="fn-panel fn-empty">
        <h1 className="fn-title-sm">Fact Hub could not load</h1>
        <p className="fn-subtitle">{error?.message || "The generated facts request failed."}</p>
        <div className="fn-nav">
          <button type="button" onClick={reset} className="fn-button fn-button-primary">
            <RotateCcw className="fn-icon" />
            Retry
          </button>
          <Link href="/fact-net" className="fn-button">
            Fact Hub home
          </Link>
        </div>
      </section>
    </main>
  );
}
