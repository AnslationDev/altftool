"use client";

import { Eye, Layout, Image as ImageIcon, Type } from "lucide-react";

function PlaceholderBanner() {
  return (
    <div className="w-full h-52 bg-[var(--surface-soft)] flex flex-col items-center justify-center gap-2 border-b border-[var(--border)]">
      <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
        <ImageIcon className="w-5 h-5 text-[var(--muted)]" />
      </div>
      <p className="text-xs text-[var(--muted)] font-medium">Hero banner not set</p>
    </div>
  );
}

function PlaceholderSectionImage() {
  return (
    <div className="w-full h-36 bg-[var(--surface-soft)] flex flex-col items-center justify-center gap-1.5">
      <div className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
        <ImageIcon className="w-4 h-4 text-[var(--muted-soft)]" />
      </div>
      <p className="text-[10px] text-[var(--muted-soft)] font-medium tracking-wide uppercase">No image</p>
    </div>
  );
}

export default function DynamicPreview({ hero, sections }) {
  const hasAnyContent =
    hero?.title || hero?.banner || sections?.some((s) => s.title || s.tagline || s.image);

  return (
    <div className="space-y-3">
      {/* Preview label */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] uppercase tracking-widest">
          <Eye className="w-3.5 h-3.5" />
          Live Preview
        </div>
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          hasAnyContent
            ? "bg-[var(--success-soft)] text-[var(--success-text)]"
            : "bg-[var(--surface-soft)] text-[var(--muted)]"
        }`}>
          {hasAnyContent ? "Has content" : "Empty"}
        </span>
      </div>

      {/* Device frame */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm bg-[var(--surface)]">

        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--surface-soft)] border-b border-[var(--border)]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--danger)]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/70" />
          </div>
          <div className="flex-1 mx-2">
            <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md px-2 py-1 max-w-[200px] mx-auto">
              <div className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0" />
              <span className="text-[10px] text-[var(--muted)] truncate font-mono">
                altftool.com/{hero?.slug || "page"}
              </span>
            </div>
          </div>
          <Layout className="w-3 h-3 text-[var(--muted-soft)]" />
        </div>

        {/* HERO */}
        <div className="relative overflow-hidden">
          {hero?.banner ? (
            <img src={hero.banner} className="w-full h-52 object-cover" alt="Hero banner" />
          ) : (
            <PlaceholderBanner />
          )}

          {/* Overlay */}
          {hero?.banner && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          )}

          {/* Hero title */}
          <div className={`absolute inset-0 flex items-end p-5 ${!hero?.banner ? "relative inset-auto" : ""}`}>
            {hero?.banner ? (
              <div className="space-y-1">
                {hero?.title ? (
                  <h1 className="text-white text-lg font-bold leading-tight drop-shadow-sm">
                    {hero.title}
                  </h1>
                ) : (
                  <div className="flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-white/50 text-sm italic">Hero title not set</span>
                  </div>
                )}
                <div className="flex gap-1">
                  <span className="inline-block w-8 h-0.5 rounded-full bg-white/60" />
                  <span className="inline-block w-3 h-0.5 rounded-full bg-white/30" />
                </div>
              </div>
            ) : null}
          </div>

          {/* If no banner, show title below */}
          {!hero?.banner && hero?.title && (
            <div className="px-5 py-3 border-b border-[var(--border)]">
              <h1 className="text-[var(--foreground)] text-base font-bold">{hero.title}</h1>
            </div>
          )}
        </div>

        {/* SECTIONS */}
        <div className="divide-y divide-[var(--border)]">
          {sections?.map((sec, i) => (
            <div key={i} className="group">
              <div className="flex gap-0 overflow-hidden">
                {/* Image column */}
                <div className="w-2/5 shrink-0 overflow-hidden">
                  {sec.image ? (
                    <img
                      src={sec.image}
                      className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={sec.title || `Section ${i + 1}`}
                    />
                  ) : (
                    <PlaceholderSectionImage />
                  )}
                </div>

                {/* Content column */}
                <div className="flex-1 p-4 flex flex-col justify-center gap-1.5 bg-[var(--surface)]">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black text-[var(--muted-soft)] uppercase tracking-widest">
                      Section {i + 1}
                    </span>
                    {sec.title && (
                      <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                    )}
                  </div>

                  {sec.title ? (
                    <h3 className="text-sm font-bold text-[var(--foreground)] leading-snug">
                      {sec.title}
                    </h3>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 bg-[var(--surface-soft)] rounded w-24" />
                    </div>
                  )}

                  {sec.tagline ? (
                    <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                      {sec.tagline}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-[var(--surface-soft)] rounded w-full" />
                      <div className="h-2.5 bg-[var(--surface-soft)] rounded w-3/4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!hasAnyContent && (
          <div className="py-8 px-5 text-center space-y-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)]">Fill in the form to see a live preview</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-[var(--border-strong)]" />
          <span className="text-[10px] text-[var(--muted)]">Placeholder</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-[var(--success)]" />
          <span className="text-[10px] text-[var(--muted)]">Live content</span>
        </div>
      </div>
    </div>
  );
}