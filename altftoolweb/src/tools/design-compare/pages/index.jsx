"use client";

import { Columns3 } from "lucide-react";
import CompareControls from "../components/CompareControls";
import ComparePreview from "../components/ComparePreview";
import ImageDetails from "../components/ImageDetails";
import ImageDropzone from "../components/ImageDropzone";
import { useDesignCompare } from "../hooks/useDesignCompare";

export default function ToolHome() {
  const state = useDesignCompare();

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Columns3 className="h-4 w-4" />
            Design review
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Design Compare</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Compare two UI screenshots with side-by-side, overlay, and before-after slider views.
          </p>
        </section>

        {(state.error || state.message) && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-semibold">
            <span className={state.error ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}>{state.error || state.message}</span>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <ImageDropzone slot="a" label="Design A" image={state.imageA} onImage={state.setImage} />
          <ImageDropzone slot="b" label="Design B" image={state.imageB} onImage={state.setImage} />
        </section>

        <ImageDetails imageA={state.imageA} imageB={state.imageB} />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ComparePreview {...state} />
          <CompareControls state={state} />
        </section>
      </div>
    </main>
  );
}
