"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileDiff, History, RefreshCw, RotateCcw, ShieldCheck, X } from "lucide-react";

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "Just now";
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

function modeLabel(mode = "") {
  if (mode === "combined") return "Combined fixes";
  if (mode === "internal-link-plan") return "Internal link plan";
  if (mode === "weak") return "Anchor text";
  if (mode === "safe") return "Safe cleanup";
  return "Link cleanup";
}

function cleanHtmlText(value = "") {
  return String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function clipAround(value = "", start = 0, end = 0, radius = 180) {
  const text = String(value || "");
  const safeStart = Math.max(0, start - radius);
  const safeEnd = Math.min(text.length, end + radius);
  return {
    prefix: safeStart > 0 ? `...${text.slice(safeStart, start)}` : text.slice(safeStart, start),
    change: text.slice(start, end) || "(no unique changed text)",
    suffix: safeEnd < text.length ? `${text.slice(end, safeEnd)}...` : text.slice(end, safeEnd),
  };
}

function buildTextDiff(previous = "", current = "") {
  const before = cleanHtmlText(previous);
  const after = cleanHtmlText(current);

  if (before === after) {
    return {
      after: { change: "No text difference found.", prefix: "", suffix: "" },
      before: { change: "No text difference found.", prefix: "", suffix: "" },
      currentChars: String(current || "").length,
      previousChars: String(previous || "").length,
      same: true,
    };
  }

  let start = 0;
  const minLength = Math.min(before.length, after.length);
  while (start < minLength && before[start] === after[start]) start += 1;

  let beforeEnd = before.length;
  let afterEnd = after.length;
  while (beforeEnd > start && afterEnd > start && before[beforeEnd - 1] === after[afterEnd - 1]) {
    beforeEnd -= 1;
    afterEnd -= 1;
  }

  return {
    after: clipAround(after, start, afterEnd),
    before: clipAround(before, start, beforeEnd),
    currentChars: String(current || "").length,
    previousChars: String(previous || "").length,
    same: false,
  };
}

function DiffText({ diff, tone = "red" }) {
  const toneClass = tone === "green" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700";

  return (
    <p className="break-words text-xs leading-6 text-gray-600">
      {diff.prefix}
      <span className={`rounded-md px-1 py-0.5 font-semibold ${toneClass}`}>{diff.change}</span>
      {diff.suffix}
    </p>
  );
}

function RollbackDiffModal({ blog, item, onClose, onRestore, restoring = false }) {
  const currentDescription = blog?.description || blog?.content || blog?.body || item?.nextDescription || "";
  const diff = useMemo(
    () => buildTextDiff(item?.previousDescription || "", currentDescription),
    [currentDescription, item?.previousDescription],
  );

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/45 px-4 py-4 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rollback-diff-title"
        className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-green-700">Rollback diff</p>
            <h2 id="rollback-diff-title" className="mt-1 text-xl font-black text-gray-900">
              {item.blogTitle || "Untitled blog"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Compare the saved pre-fix snapshot against the current blog description before restoring.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={restoring}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close rollback diff"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[56vh] overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-gray-50 px-3 py-3 text-gray-700">
              <p className="text-lg font-black">{item.fixCount || 0}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Fixes</p>
            </div>
            <div className="rounded-xl bg-red-50 px-3 py-3 text-red-700">
              <p className="text-lg font-black">{diff.previousChars.toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Snapshot chars</p>
            </div>
            <div className="rounded-xl bg-green-50 px-3 py-3 text-green-700">
              <p className="text-lg font-black">{diff.currentChars.toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Current chars</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-red-100 bg-red-50/50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-700">Saved rollback snapshot</p>
              <div className="mt-2 rounded-lg bg-white p-3">
                <DiffText diff={diff.before} tone="red" />
              </div>
            </article>
            <article className="rounded-xl border border-green-100 bg-green-50/50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-700">Current description</p>
              <div className="mt-2 rounded-lg bg-white p-3">
                <DiffText diff={diff.after} tone="green" />
              </div>
            </article>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          <p className="text-xs leading-5 text-gray-500">
            Restore will replace only the blog description with the saved rollback snapshot.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={restoring}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onRestore?.(item)}
              disabled={restoring || Boolean(item.restoredAt)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {restoring ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              {restoring ? "Restoring..." : "Restore snapshot"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BlogLinkRollbackPanel({
  blogs = [],
  items = [],
  loading = false,
  onEdit,
  onRestore,
  restoringId = "",
}) {
  const [diffItem, setDiffItem] = useState(null);
  const activeItems = items.filter((item) => !item.restoredAt);
  const restoredItems = items.length - activeItems.length;
  const diffBlog = diffItem ? blogs.find((blog) => blog.id === diffItem.blogId) : null;

  return (
    <>
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-gray-500">Rollback safety</p>
            <h2 className="mt-1 text-xl font-black text-gray-900">{activeItems.length} restorable</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Recent link and internal-plan snapshots include a diff viewer so accidental description changes can be restored fast.
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-green-50 px-3 py-2 text-green-700">
            <p className="text-lg font-black">{activeItems.length}</p>
            <p className="text-[10px] font-black uppercase tracking-wider">Available</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-3 py-2 text-gray-600">
            <p className="text-lg font-black">{restoredItems}</p>
            <p className="text-[10px] font-black uppercase tracking-wider">Restored</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Recent description changes</p>
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-gray-400" /> : <History className="h-3.5 w-3.5 text-gray-400" />}
          </div>

          {items.length ? (
            items.slice(0, 5).map((item) => {
              const restoring = restoringId === item.id;
              const restored = Boolean(item.restoredAt);
              return (
                <article key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-black leading-5 text-gray-900">{item.blogTitle || "Untitled blog"}</p>
                      <p className="mt-1 text-[11px] font-semibold text-gray-500">
                        {modeLabel(item.mode)} - {item.fixCount || 0} fix{item.fixCount === 1 ? "" : "es"} - {formatDate(item.createdAt)}
                      </p>
                    </div>
                    {restored ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Restored
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDiffItem(item)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-bold text-green-700 shadow-sm transition hover:bg-green-50"
                    >
                      <FileDiff className="h-3.5 w-3.5" />
                      View diff
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestore?.(item)}
                      disabled={restoring || restored}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gray-900 px-2.5 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {restoring ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      {restoring ? "Restoring..." : "Restore snapshot"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit?.({ id: item.blogId, heading: item.blogTitle, title: item.blogTitle }, "links")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
                    >
                      Edit blog
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-xl bg-gray-50 px-3 py-4 text-sm font-semibold leading-6 text-gray-600">
              No rollback snapshots yet. The next confirmed link cleanup or internal-link plan will create a diff-ready restore point automatically.
            </div>
          )}
        </div>
      </section>

      <RollbackDiffModal
        blog={diffBlog}
        item={diffItem}
        onClose={() => setDiffItem(null)}
        onRestore={(item) => {
          onRestore?.(item);
          setDiffItem(null);
        }}
        restoring={Boolean(diffItem && restoringId === diffItem.id)}
      />
    </>
  );
}
