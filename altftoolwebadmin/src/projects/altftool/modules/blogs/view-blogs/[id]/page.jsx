"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { emitAlert } from "@/lib/alertBus";
import { getAdminRouteId } from "@/lib/adminRouteParams";
import {
  fetchBlogById,
  subscribeToComments,
  deleteComment,
} from "../../services/blogsService";
import {
  ArrowLeft, Pencil, Calendar, User, Tag,
  BookOpen, Copy, Check, Trash2, MessageSquare,
  ChevronDown, AlertTriangle, Loader2,
} from "lucide-react";

/* ── Copy button ── */
function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${copied ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

/* ── Info row ── */
function InfoRow({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-xs text-gray-700 text-right break-all ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

/* ── Delete confirm inline ── */
function DeleteConfirm({ onConfirm, onCancel, loading }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-2">
      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
      <span className="text-xs text-red-700 font-medium flex-1">Delete this comment?</span>
      <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition">Cancel</button>
      <button onClick={onConfirm} disabled={loading}
        className="flex items-center gap-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg transition disabled:opacity-50">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}Delete
      </button>
    </div>
  );
}

/* ── Comments Section ── */
function CommentsSection({ blogId }) {
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAll, setShowAll]     = useState(false);
  const PREVIEW_COUNT             = 5;

  useEffect(() => {
    if (!blogId) return;
    const unsub = subscribeToComments(
      blogId,
      (data) => { setComments(data); setLoading(false); },
      (err)  => { console.error("Comments subscription error:", err); setLoading(false); }
    );
    return () => unsub();
  }, [blogId]);

  const handleDelete = async (commentId) => {
    setDeletingId(commentId);
    try {
      await deleteComment(blogId, commentId);
      emitAlert({ type: "success", message: "Comment deleted" });
      setConfirmId(null);
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to delete comment" });
    } finally {
      setDeletingId(null);
    }
  };

  const fmtDate = (ts) => {
    if (!ts) return null;
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60)     return "just now";
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  const visible = showAll ? comments : comments.slice(0, PREVIEW_COUNT);
  const hidden  = comments.length - PREVIEW_COUNT;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading comments…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-800">Comments</h3>
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full tabular-nums">{comments.length}</span>
        </div>
        {comments.length > 0 && <span className="text-xs text-gray-400">Most recent first</span>}
      </div>

      {comments.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-2 text-gray-400">
          <MessageSquare className="w-8 h-8 text-gray-200" />
          <span className="text-sm">No comments yet</span>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {visible.map((comment) => (
            <div key={comment.id} className="px-6 py-4 group hover:bg-gray-50/60 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0 mt-0.5">
                    {(comment.userName || comment.name || comment.email || "A")?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{comment.userName || comment.name || "Anonymous"}</span>
                      {comment.email && <span className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">{comment.email}</span>}
                      {comment.createdAt && <span className="text-[10px] text-gray-400">{fmtDate(comment.createdAt)}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed break-words">
                      {comment.text || comment.content || comment.comment || "—"}
                    </p>
                    {confirmId === comment.id && (
                      <DeleteConfirm
                        onConfirm={() => handleDelete(comment.id)}
                        onCancel={() => setConfirmId(null)}
                        loading={deletingId === comment.id}
                      />
                    )}
                  </div>
                </div>
                {confirmId !== comment.id && (
                  <button onClick={() => setConfirmId(comment.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition shrink-0"
                    title="Delete comment">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {comments.length > PREVIEW_COUNT && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <button onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAll ? "rotate-180" : ""}`} />
                {showAll ? "Show less" : `Show ${hidden} more comment${hidden > 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function BlogView() {
  const params = useParams();
  const pathname = usePathname();
  const id = getAdminRouteId(params, pathname);
  const router  = useRouter();
  const [blog, setBlog]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setBlog(await fetchBlogById(id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm">Loading blog…</span>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-3xl">📭</div>
          <p className="font-bold text-gray-800">Blog not found</p>
          <button onClick={() => router.push("/altftool/blogs")} className="text-sm text-blue-500 hover:underline">Back to blogs</button>
        </div>
      </div>
    );
  }

  const isPublished = blog.status === "published";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-5 py-7">

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {isPublished ? "● Published" : "○ Draft"}
            </span>
            <button onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition shadow-sm">
              <Pencil className="w-3.5 h-3.5" />Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-5">
            <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {blog.image && (
                <div className="w-full h-64 sm:h-80 bg-gray-100 overflow-hidden">
                  <img src={blog.image} alt={blog.heading} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500">
                  {blog.author && <span className="flex items-center gap-1 font-semibold text-gray-700"><User className="w-3.5 h-3.5 text-gray-400" />{blog.author}</span>}
                  {blog.date   && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" />{blog.date}</span>}
                  {blog.category && <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full"><Tag className="w-3 h-3" />{blog.category}</span>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{blog.heading}</h1>
                <div className="h-px bg-gray-100" />
                <div className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.description }} />
              </div>
            </article>
            <CommentsSection blogId={id} />
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Actions</h3>
              <button onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition shadow-sm">
                <Pencil className="w-4 h-4" />Edit Blog
              </button>
              <button onClick={() => router.push("/altftool/blogs")}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                <BookOpen className="w-4 h-4" />All Blogs
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Information</h3>
              <InfoRow label="Blog ID"  value={blog.id}       mono />
              <InfoRow label="Author"   value={blog.author}   />
              <InfoRow label="Category" value={blog.category} />
              <InfoRow label="Date"     value={blog.date}     />
              <InfoRow label="Status"   value={blog.status}   />
              {blog.slug && <InfoRow label="Slug" value={blog.slug} mono />}
            </div>

            {(blog.seoTitle || blog.seoDescription) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">SEO</h3>
                {blog.seoTitle && (
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Title</p>
                    <p className="text-xs text-gray-700 font-medium">{blog.seoTitle}</p>
                  </div>
                )}
                {blog.seoDescription && (
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Description</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{blog.seoDescription}</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Copy</h3>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={blog.id} label="Copy ID" />
                {blog.image && <CopyButton text={blog.image} label="Copy Image URL" />}
                {blog.slug  && <CopyButton text={blog.slug}  label="Copy Slug" />}
              </div>
            </div>

            {(blog.likesCount !== undefined || blog.commentsCount !== undefined || blog.views !== undefined) && (
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
    Engagement
  </h3>

  <div className="grid grid-cols-3 gap-3">

    {/* Views */}
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold text-gray-800 tabular-nums">
        {blog.views ?? 0}
      </p>
      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
        Views
      </p>
    </div>

    {/* Likes */}
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold text-gray-800 tabular-nums">
        {blog.likesCount ?? 0}
      </p>
      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
        Likes
      </p>
    </div>

    {/* Comments */}
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold text-gray-800 tabular-nums">
        {blog.commentsCount ?? 0}
      </p>
      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
        Comments
      </p>
    </div>

  </div>
</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
