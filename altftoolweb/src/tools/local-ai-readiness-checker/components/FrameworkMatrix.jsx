"use client";

import { ExternalLink, Layers, Terminal, Zap } from "lucide-react";
import { FRAMEWORK_CATALOG } from "../lib/assessReadiness.mjs";

export default function FrameworkMatrix() {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Layers className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
              Local AI Framework &amp; Runtime Ecosystem
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Supported open-source local inference engines, GUIs, and in-browser runtimes
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FRAMEWORK_CATALOG.map((fw) => (
          <div
            key={fw.id}
            className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 shadow-2xs transition-all hover:border-[var(--border-strong)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  {fw.name}
                </h3>
                <span className="rounded-md bg-[var(--surface)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--primary)] border border-[var(--border)]">
                  {fw.type}
                </span>
              </div>

              <p className="mt-2 text-xs font-medium leading-relaxed text-[var(--muted-foreground)]">
                {fw.tagline}
              </p>
            </div>

            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted-foreground)]">
                <span>Min. RAM: {fw.minRamGb} GB</span>
                <a
                  href={fw.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[var(--primary)] hover:underline"
                >
                  Official Site <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
