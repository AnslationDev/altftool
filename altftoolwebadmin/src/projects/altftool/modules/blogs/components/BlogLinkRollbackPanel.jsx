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
  const toneClass = tone === "green" ? "bg-success-soft text-success" : "bg-danger-soft text-danger";

  return (
    <p className="break-words text-xs leading-6 text-muted">
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/45 px-4 py-4 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rollback-diff-title"
        className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-success">Rollback diff</p>
            <h2 id="rollback-diff-title" className="mt-1 text-xl font-black text-foreground">
              {item.blogTitle || "Untitled blog"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Compare the saved pre-fix snapshot against the current blog description before restoring.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={restoring}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close rollback diff"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[56vh] overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface-soft px-3 py-3 text-foreground">
              <p className="text-lg font-black">{item.fixCount || 0}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Fixes</p>
            </div>
            <div className="rounded-xl bg-danger-soft px-3 py-3 text-danger">
              <p className="text-lg font-black">{diff.previousChars.toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Snapshot chars</p>
            </div>
            <div className="rounded-xl bg-success-soft px-3 py-3 text-success">
              <p className="text-lg font-black">{diff.currentChars.toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Current chars</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-danger bg-danger-soft/50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-danger">Saved rollback snapshot</p>
              <div className="mt-2 rounded-lg bg-surface p-3">
                <DiffText diff={diff.before} tone="red" />
              </div>
            </article>
            <article className="rounded-xl border border-success bg-success-soft/50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-success">Current description</p>
              <div className="mt-2 rounded-lg bg-surface p-3">
                <DiffText diff={diff.after} tone="green" />
              </div>
            </article>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <p className="text-xs leading-5 text-muted">
            Restore will replace only the blog description with the saved rollback snapshot.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={restoring}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onRestore?.(item)}
              disabled={restoring || Boolean(item.restoredAt)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-surface-soft"
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
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-muted">Rollback safety</p>
            <h2 className="mt-1 text-xl font-black text-foreground">{activeItems.length} restorable</h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Recent link and internal-plan snapshots include a diff viewer so accidental description changes can be restored fast.
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-success-soft text-success">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-success-soft px-3 py-2 text-success">
            <p className="text-lg font-black">{activeItems.length}</p>
            <p className="text-[10px] font-black uppercase tracking-wider">Available</p>
          </div>
          <div className="rounded-xl bg-surface-soft px-3 py-2 text-muted">
            <p className="text-lg font-black">{restoredItems}</p>
            <p className="text-[10px] font-black uppercase tracking-wider">Restored</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted">Recent description changes</p>
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted" /> : <History className="h-3.5 w-3.5 text-muted" />}
          </div>

          {items.length ? (
            items.slice(0, 5).map((item) => {
              const restoring = restoringId === item.id;
              const restored = Boolean(item.restoredAt);
              return (
                <article key={item.id} className="rounded-xl border border-border bg-surface-soft px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-black leading-5 text-foreground">{item.blogTitle || "Untitled blog"}</p>
                      <p className="mt-1 text-[11px] font-semibold text-muted">
                        {modeLabel(item.mode)} - {item.fixCount || 0} fix{item.fixCount === 1 ? "" : "es"} - {formatDate(item.createdAt)}
                      </p>
                    </div>
                    {restored ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-success-soft px-2 py-1 text-[10px] font-black uppercase tracking-wide text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Restored
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDiffItem(item)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-xs font-bold text-success shadow-sm transition hover:bg-success-soft"
                    >
                      <FileDiff className="h-3.5 w-3.5" />
                      View diff
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestore?.(item)}
                      disabled={restoring || restored}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-surface-soft"
                    >
                      {restoring ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      {restoring ? "Restoring..." : "Restore snapshot"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit?.({ id: item.blogId, heading: item.blogTitle, title: item.blogTitle }, "links")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-xs font-bold text-primary shadow-sm transition hover:bg-primary-soft"
                    >
                      Edit blog
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-xl bg-surface-soft px-3 py-4 text-sm font-semibold leading-6 text-muted">
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
