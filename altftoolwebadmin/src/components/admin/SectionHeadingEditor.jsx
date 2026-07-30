"use client";

import React, { useState, useEffect } from "react";
import { Heading, Pencil, X } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { saveSectionHeading, subscribeSectionHeading } from "@/projects/apexboost/modules/service/apexboost.service";

export default function SectionHeadingEditor({ sectionKey, defaultHeading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    eyebrow: defaultHeading?.eyebrow || "",
    title: defaultHeading?.title || "",
    highlight: defaultHeading?.highlight || "",
    subtitle: defaultHeading?.subtitle || "",
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    let unsubscribe;
    const load = () => {
      setIsLoading(true);
      unsubscribe = subscribeSectionHeading(
        sectionKey,
        (data) => {
          setForm({
            eyebrow: data?.eyebrow ?? defaultHeading?.eyebrow ?? "",
            title: data?.title ?? defaultHeading?.title ?? "",
            highlight: data?.highlight ?? defaultHeading?.highlight ?? "",
            subtitle: data?.subtitle ?? defaultHeading?.subtitle ?? "",
          });
          setIsLoading(false);
        },
        (err) => {
          console.error("Failed to load section heading", err);
          setIsLoading(false);
        },
      );
    };
    load();
    return () => unsubscribe && unsubscribe();
  }, [isOpen, sectionKey, defaultHeading]);

  // Close the modal on Escape while it is open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleSave = async () => {
    if (isSaving) return; // guard against double-submit while the write is in flight
    setIsSaving(true);
    try {
      await saveSectionHeading(sectionKey, form);
      emitAlert({ type: "success", title: "Success", message: "Section heading saved!" });
      setIsOpen(false);
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Error saving section heading." });
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key, label) => {
    const inputId = `section-heading-${sectionKey}-${key}`;
    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--foreground)] mb-1">
          {label}
        </label>
        {key === "subtitle" ? (
          <textarea
            id={inputId}
            rows={3}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />
        ) : (
          <input
            id={inputId}
            type="text"
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 border border-[var(--border)] px-4 py-2 rounded-md text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
      >
        <Heading size={16} />
        Edit Heading
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-heading-editor-title"
            className="w-full max-w-lg rounded-xl bg-[var(--surface)] p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="section-heading-editor-title" className="text-lg font-semibold text-[var(--foreground)]">
                Edit Section Heading
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X size={20} />
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-sm text-[var(--muted)]">Loading heading...</div>
            ) : (
              <div className="space-y-4">
                {field("eyebrow", "Eyebrow")}
                {field("title", "Title")}
                {field("highlight", "Highlight (accent text)")}
                {field("subtitle", "Subtitle")}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="border border-[var(--border)] px-4 py-2 rounded-md text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-md text-sm hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                Save Heading
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
