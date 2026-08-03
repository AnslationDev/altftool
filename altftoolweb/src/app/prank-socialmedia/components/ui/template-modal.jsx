"use client";
import React from "react";
import Link from "next/link";

export default function TemplateModal({ template, onClose }) {
  if (!template) return null;

  const { name, short, slug, accent, ready, icon: Icon } = template;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 max-w-xl w-full rounded-xl bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${accent} text-white grid place-items-center`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{short}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ready ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{ready ? "Ready" : "Polishing"}</span>
              <div className="flex gap-2">
                <Link href={`/prank-socialmedia/editor/${slug}`} className="rounded-xl bg-gradient-primary px-3 py-2 text-sm text-white">Open editor</Link>
                <button onClick={onClose} className="rounded-xl border px-3 py-2 text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
