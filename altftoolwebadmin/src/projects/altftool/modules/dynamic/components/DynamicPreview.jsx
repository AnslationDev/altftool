"use client";

import { Eye, Layout, Image as ImageIcon, Type } from "lucide-react";

function PlaceholderBanner() {
  return (
    <div className="w-full h-52 bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 flex flex-col items-center justify-center gap-2 border-b border-slate-100">
      <div className="w-10 h-10 rounded-2xl bg-slate-200/80 flex items-center justify-center">
        <ImageIcon className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-xs text-slate-400 font-medium">Hero banner not set</p>
    </div>
  );
}

function PlaceholderSectionImage() {
  return (
    <div className="w-full h-36 bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col items-center justify-center gap-1.5">
      <div className="w-8 h-8 rounded-xl bg-slate-200/80 flex items-center justify-center">
        <ImageIcon className="w-4 h-4 text-slate-300" />
      </div>
      <p className="text-[10px] text-slate-300 font-medium tracking-wide uppercase">No image</p>
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
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <Eye className="w-3.5 h-3.5" />
          Live Preview
        </div>
        <div className="flex-1 h-px bg-slate-200" />
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          hasAnyContent
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-100 text-slate-400"
        }`}>
          {hasAnyContent ? "Has content" : "Empty"}
        </span>
      </div>

      {/* Device frame */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-[0_2px_20px_rgba(0,0,0,0.06)] bg-white">

        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex-1 mx-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1 max-w-[200px] mx-auto">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[10px] text-slate-400 truncate font-mono">
                altftool.com/{hero?.slug || "page"}
              </span>
            </div>
          </div>
          <Layout className="w-3 h-3 text-slate-300" />
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
            <div className="px-5 py-3 border-b border-slate-100">
              <h1 className="text-slate-800 text-base font-bold">{hero.title}</h1>
            </div>
          )}
        </div>

        {/* SECTIONS */}
        <div className="divide-y divide-slate-50">
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
                <div className="flex-1 p-4 flex flex-col justify-center gap-1.5 bg-white">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Section {i + 1}
                    </span>
                    {sec.title && (
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                    )}
                  </div>

                  {sec.title ? (
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">
                      {sec.title}
                    </h3>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 bg-slate-100 rounded w-24" />
                    </div>
                  )}

                  {sec.tagline ? (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {sec.tagline}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-slate-50 rounded w-full" />
                      <div className="h-2.5 bg-slate-50 rounded w-3/4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!hasAnyContent && (
          <div className="py-8 px-5 text-center space-y-2 border-t border-slate-50">
            <p className="text-xs text-slate-400">Fill in the form to see a live preview</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-slate-200" />
          <span className="text-[10px] text-slate-400">Placeholder</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-emerald-400" />
          <span className="text-[10px] text-slate-400">Live content</span>
        </div>
      </div>
    </div>
  );
}