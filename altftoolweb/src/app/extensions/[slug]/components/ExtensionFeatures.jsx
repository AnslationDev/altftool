"use client";

import { Zap, Check, Sparkles, Layers3 } from "lucide-react";

function getFeatureText(feature) {
  if (!feature) return "";
  if (typeof feature === "string" || typeof feature === "number") return String(feature);
  if (typeof feature === "object" && feature !== null) {
    const val = feature.title || feature.name || feature.label || feature.text;
    if (typeof val === "string" || typeof val === "number") return String(val);
  }
  return "";
}

function getFeatureDesc(feature) {
  if (typeof feature === "object" && feature !== null && feature.description) {
    if (typeof feature.description === "string" || typeof feature.description === "number") {
      return String(feature.description);
    }
  }
  return null;
}

export default function ExtensionFeatures({ features, extensionName }) {
  if (!features || !Array.isArray(features) || features.length === 0) return null;

  return (
    <section id="features" className="space-y-6 scroll-mt-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--foreground)] tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <span>Key Capabilities</span>
        </h2>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] hidden sm:inline-block">
          {features.length} Core Features
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const titleText = getFeatureText(feature);
          const descText = getFeatureDesc(feature);
          if (!titleText) return null;

          return (
            <div
              key={index}
              className="group relative flex items-start gap-4 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs transition-all duration-200 hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shrink-0 group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)] transition-all duration-300">
                <Check className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-base font-semibold text-[var(--foreground)] leading-snug group-hover:text-[var(--primary)] transition-colors">
                  {titleText}
                </h3>
                {descText && (
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {descText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--muted)] border border-[var(--border)] shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <h3 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Layers3 className="w-5 h-5 text-[var(--primary)]" />
            <span>Built for Modern Workflows</span>
          </h3>
          <p className="text-sm md:text-base text-[var(--muted-foreground)] leading-relaxed">
            Experience an instant boost in efficiency with {typeof extensionName === "string" ? extensionName : "this extension"}. Designed with performance and clarity at its core, it seamlessly integrates into your daily browser routine without adding unnecessary bloat.
          </p>
        </div>
      </div>
    </section>
  );
}
