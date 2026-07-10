"use client";

import { AlertCircle, CheckCircle2, ChevronRight, ShieldAlert } from "lucide-react";

/* ── Field registry ──────────────────────────────────────────────────────
   Single source of truth mapping every validated field to its section,
   focus target, and any UI state that must be opened first. Used by the
   validation panel (labels/order) and by jumpToBlogField (navigation). */
export const BLOG_FIELD_TARGETS = {
  heading: {
    label: "Heading",
    sectionId: "blog-section-post-details",
    focus: 'input[name="heading"]',
  },
  author: {
    label: "Author",
    sectionId: "blog-section-post-details",
    focus: 'input[name="author"]',
  },
  date: {
    label: "Display Date",
    sectionId: "blog-section-post-details",
    focus: 'input[name="date"]',
  },
  category: {
    label: "Category",
    sectionId: "blog-section-post-details",
    focus: '#blog-section-post-details input[placeholder="Select category"]',
  },
  description: {
    label: "Blog Content",
    sectionId: "blog-section-content",
    // Rich editor when CKEditor is active, textarea when the raw-HTML
    // fallback editor is rendered instead.
    focus: "#blog-section-content .ck-editor__editable, #blog-section-content textarea",
  },
  seoTitle: {
    label: "Meta Title",
    sectionId: "blog-section-seo",
    focus: 'input[name="seoTitle"]',
    expandSeo: true,
  },
  seoDescription: {
    label: "SEO Description",
    sectionId: "blog-section-seo",
    focus: 'textarea[name="seoDescription"]',
    expandSeo: true,
  },
  image: {
    label: "Featured Image",
    sectionId: "blog-section-image",
    focus: "#blog-section-image [data-image-dropzone]",
  },
  imageAlt: {
    label: "Image Alt Text",
    sectionId: "blog-section-image",
    focus: "#blog-image-alt-input",
  },
};

const PANEL_ID = "blog-validation-panel";

/* ── Navigation: scroll → expand → highlight → focus ────────────────────
   Reuses the page's existing section-highlight mechanism (onHighlightSection
   drives the same ring/border treatment as the content-health jumps). */
export function jumpToBlogField(fieldKey, { onExpandSeo, onHighlightSection } = {}) {
  const target = BLOG_FIELD_TARGETS[fieldKey];
  if (!target) return;

  if (target.expandSeo) onExpandSeo?.();
  onHighlightSection?.(target.sectionId);

  window.requestAnimationFrame(() => {
    document.getElementById(target.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Focus after the section has expanded and the smooth scroll has begun.
    window.setTimeout(() => {
      const el = document.querySelector(target.focus);
      if (el && typeof el.focus === "function") {
        el.focus({ preventScroll: true });
      }
    }, 380);
  });
}

/* Scrolls the panel itself into view (used right after a failed publish). */
export function revealValidationPanel() {
  window.requestAnimationFrame(() => {
    document.getElementById(PANEL_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ── Panel ── */
export default function BlogValidationPanel({ errors = {}, attempted = false, onJump }) {
  const knownKeys = Object.keys(BLOG_FIELD_TARGETS);
  const items = [
    // Known fields first, in on-page order…
    ...knownKeys.filter((key) => errors[key]),
    // …then any unexpected keys so nothing is ever silently hidden.
    ...Object.keys(errors).filter((key) => errors[key] && !knownKeys.includes(key)),
  ].map((key) => ({
    key,
    label: BLOG_FIELD_TARGETS[key]?.label || key,
    message: errors[key],
  }));

  if (!items.length) {
    // Positive confirmation only after a publish attempt surfaced problems.
    if (!attempted) return null;
    return (
      <div
        id={PANEL_ID}
        role="status"
        className="scroll-mt-24 flex items-center gap-2.5 rounded-2xl border border-success bg-success-soft px-4 py-3 shadow-sm transition"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        <p className="text-sm font-semibold text-success">
          All publish checks passed — this post is ready to publish.
        </p>
      </div>
    );
  }

  return (
    <div
      id={PANEL_ID}
      role="alert"
      aria-live="polite"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-danger bg-surface shadow-sm transition"
    >
      <div className="flex items-center gap-2.5 border-b border-danger/40 bg-danger-soft px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-danger text-white">
          <ShieldAlert className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-danger">
            {items.length === 1
              ? "1 issue needs attention before publishing"
              : `${items.length} issues need attention before publishing`}
          </p>
          <p className="text-xs text-muted">Click an issue to jump straight to the field and fix it.</p>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onJump?.(item.key)}
              aria-label={`Fix ${item.label}: ${item.message}`}
              className="group flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-danger-soft/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-inset"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-wider text-danger">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-foreground">{item.message}</span>
              </span>
              <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-danger" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
