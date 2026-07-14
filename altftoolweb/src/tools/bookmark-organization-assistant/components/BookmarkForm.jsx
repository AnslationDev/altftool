/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Star, Folder as FolderIcon, Tag as TagIcon } from "lucide-react";
import { isValidUrl, getFaviconUrl, getDomain } from "../utils/validation";

export function BookmarkForm({ open, initial, folders, onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState("default");
  const [tagsText, setTagsText] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title || "");
      setUrl(initial.url || "");
      setDescription(initial.description || "");
      setFolderId(initial.folderId || "default");
      setTagsText((initial.tags || []).join(", "));
      setFavorite(Boolean(initial.favorite));
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setFolderId("default");
      setTagsText("");
      setFavorite(false);
    }
    setError("");
  }, [open, initial]);

  const parseTags = (text) =>
    text
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValidUrl(url)) {
      setError("Please enter a valid http(s) URL.");
      return;
    }
    onSubmit({
      title,
      url,
      description,
      folderId,
      tags: parseTags(tagsText),
      favorite,
    });
  };

  const previewFavicon = url && isValidUrl(url) ? getFaviconUrl(url) : "";
  const previewDomain = url && isValidUrl(url) ? getDomain(url) : "";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-label={initial ? "Edit bookmark" : "Add bookmark"}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-(--border) bg-(--card) p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--foreground)">
                {initial ? "Edit bookmark" : "Add bookmark"}
              </h3>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Close"
                className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--muted)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--muted) p-3">
                {previewFavicon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewFavicon}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-md border border-(--border) bg-white"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-(--border) bg-(--background)">
                    <Link2 className="h-4 w-4 text-(--muted-foreground)" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-(--foreground)">
                    {title || "New bookmark"}
                  </p>
                  <p className="truncate text-xs text-(--muted-foreground)">
                    {previewDomain || "domain will appear here"}
                  </p>
                </div>
              </div>

              <Field label="Title" htmlFor="bm-title">
                <input
                  id="bm-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. ALTFTool Documentation"
                  className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                />
              </Field>

              <Field label="URL" htmlFor="bm-url" required>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
                  <input
                    id="bm-url"
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="https://example.com"
                    aria-invalid={Boolean(error)}
                    className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-10 pr-3 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                  />
                </div>
                {error ? (
                  <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>
                ) : null}
              </Field>

              <Field label="Description" htmlFor="bm-desc">
                <textarea
                  id="bm-desc"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional notes about this bookmark"
                  rows={3}
                  className="w-full resize-y rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Folder" htmlFor="bm-folder">
                  <div className="relative">
                    <FolderIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
                    <select
                      id="bm-folder"
                      value={folderId}
                      onChange={(event) => setFolderId(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-(--border) bg-(--background) py-2.5 pl-10 pr-3 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                    >
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>

                <Field label="Tags" htmlFor="bm-tags">
                  <div className="relative">
                    <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
                    <input
                      id="bm-tags"
                      value={tagsText}
                      onChange={(event) => setTagsText(event.target.value)}
                      placeholder="design, tools, react"
                      className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-10 pr-3 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                    />
                  </div>
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-(--foreground)">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(event) => setFavorite(event.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-(--primary)"
                />
                <Star className={`h-4 w-4 ${favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                Mark as favorite
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--foreground) hover:bg-(--muted)"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) hover:opacity-90"
              >
                {initial ? "Save changes" : "Add bookmark"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({ label, htmlFor, required, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)"
      >
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}
