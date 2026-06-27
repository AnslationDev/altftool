"use client";

import { useMemo, useState } from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import { buildPreviewBlogModel } from "./blogPreviewUtils";

const VIEWPORTS = {
  mobile: { label: "Mobile", icon: Smartphone, width: "max-w-[390px]" },
  tablet: { label: "Tablet", icon: Tablet, width: "max-w-[760px]" },
  desktop: { label: "Desktop", icon: Monitor, width: "max-w-5xl" },
};

export default function BlogPreviewModal({ open, formData, imagePreview, imageAlt, onClose }) {
  const [viewport, setViewport] = useState("desktop");
  const blog = useMemo(
    () => buildPreviewBlogModel({ formData, imagePreview, imageAlt }),
    [formData, imageAlt, imagePreview],
  );

  if (!open) return null;

  const active = VIEWPORTS[viewport] || VIEWPORTS.desktop;

  return (
    <div className="fixed inset-0 z-[100] bg-primary/70 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-surface-soft shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-primary">Unsaved preview</p>
            <h2 className="text-base font-bold text-foreground">Blog preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border bg-surface-soft p-1">
              {Object.entries(VIEWPORTS).map(([key, item]) => {
                const Icon = item.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setViewport(key)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      viewport === key ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-surface"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-surface p-2 text-muted transition hover:bg-surface-soft hover:text-foreground"
              aria-label="Close blog preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className={`mx-auto w-full ${active.width}`}>
            <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
              {blog.image ? (
                <img src={blog.image} alt={blog.imageAlt} className="h-56 w-full object-cover sm:h-72" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary to-primary text-sm font-bold text-primary sm:h-56">
                  Featured image placeholder
                </div>
              )}
              <div className="space-y-5 p-5 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <span className="rounded-full bg-primary-soft px-3 py-1">{blog.category}</span>
                  <span className="text-muted">{blog.date}</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">{blog.heading}</h1>
                <p className="text-base leading-7 text-muted">{blog.excerpt}</p>
                <div className="flex flex-wrap gap-2 border-y border-border py-4 text-sm text-muted">
                  <span>By <strong className="text-foreground">{blog.author}</strong></span>
                  {blog.reviewedBy ? <span>Reviewed by <strong className="text-foreground">{blog.reviewedBy}</strong></span> : null}
                </div>
                <div
                  className="ckeditor-content blog-article-content prose max-w-none prose-headings:text-foreground prose-p:text-foreground"
                  dangerouslySetInnerHTML={{ __html: blog.description }}
                />
                <div className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-dashed border-primary bg-primary-soft/60 p-4 text-center text-xs font-bold uppercase tracking-wider text-primary">
                    Ad slot placeholder
                  </div>
                  <div className="rounded-2xl border border-dashed border-primary bg-primary-soft/60 p-4 text-center text-xs font-bold uppercase tracking-wider text-primary">
                    Related content placeholder
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
