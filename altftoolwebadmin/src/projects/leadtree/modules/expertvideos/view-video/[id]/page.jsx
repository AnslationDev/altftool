"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { emitAlert } from "@/lib/alertBus";


import {
  ArrowLeft, Pencil, Calendar, User, Tag,
  BookOpen, Copy, Check, Trash2, MessageSquare,
  ChevronDown, AlertTriangle, Loader2,
} from "lucide-react";
import { fetchVideoById } from "../../expert-video-services/ExpertVideoService";

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
      
      <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition">Cancel</button>
      <button onClick={onConfirm} disabled={loading}
        className="flex items-center gap-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg transition disabled:opacity-50">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}Delete
      </button>
    </div>
  );
}



/* ── Main Page ── */
export default function ExpertVideoView() {
  const { id } = useParams();
  const router  = useRouter();
  const [video, setVideo]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setVideo(await fetchVideoById(id));
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
          <span className="text-sm">Loading Video…</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-3xl">📭</div>
          <p className="font-bold text-gray-800">Video not found</p>
          <button onClick={() => router.push("/leadtree/expert-videos")} className="text-sm text-blue-500 hover:underline">Back to Videos</button>
        </div>
      </div>
    );
  }

  const isPublished = video.status === "published";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-5 py-7">
        {/* ── Top nav ── */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
            >
              {isPublished ? "● Published" : "○ Draft"}
            </span>
            <button
              onClick={() =>
                router.push(`/leadtree/expert-videos/edit-video/${video.id}`)
              }
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-5">
            <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {video.image && (
                <div className="w-full h-64 sm:h-80 bg-gray-100 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500">
                  {video.authorName && (
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {video.authorName}
                    </span>
                  )}
                  {video.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {video.date}
                    </span>
                  )}
                  {video.category && (
                    <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                      <Tag className="w-3 h-3" />
                      {video.category}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {video.title}
                </h1>
                <div className="h-px bg-gray-100" />
                <div
                  className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: video.description }}
                />
              </div>
            </article>
          
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Actions
              </h3>
              <button
                onClick={() =>
                  router.push(`/leadtree/expert-videos/edit-video/${video.id}`)
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition shadow-sm"
              >
                <Pencil className="w-4 h-4" />
                Edit Video
              </button>
              <button
                onClick={() => router.push("/leadtree/expert-videos")}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
              >
                <BookOpen className="w-4 h-4" />
                All Uploaded Videos
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Information
              </h3>
              <InfoRow label="Blog ID" value={video.id} mono />
              <InfoRow label="Author" value={video.authorName} />
              <InfoRow label="Category" value={video.category} />
              <InfoRow label="Date" value={video.date} />
              <InfoRow label="Status" value={video.status} />
              {video.slug && <InfoRow label="Slug" value={video.slug} mono />}
            </div>

            

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Copy
              </h3>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={video.id} label="Copy ID" />
                {video.thumbnailUrl && (
                  <CopyButton text={video.thumbnailUrl} label="Copy Image URL" />
                )}
                {video.slug && <CopyButton text={video.slug} label="Copy Slug" />}
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
}