"use client";

import { useState, useEffect, useCallback } from "react";
import VideoTopBar from "./components/VideoTopBar";
import TrendingVideosTable from "./components/TrendingVideosTable";
import AddVideoModal from "./components/AddVideoModal";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  getAllVideos,
  deleteVideo,
  deleteVideos,
  toggleVideoPlay,
} from "./service/trendingVideos.service";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [videos, setVideos]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editingVideo, setEditingVideo]   = useState(null);
  const [selected, setSelected]           = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete]           = useState(null); // string | string[]

  /* ─────────────────────────────────────────
     LOAD
  ───────────────────────────────────────── */
  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllVideos();
      // getAllVideos returns { id: firestoreDocId, ...fields }
      // We expose firestoreId explicitly so modal + table always have it
      setVideos(data.map((v) => ({ ...v, firestoreId: v.id })));
    } catch (err) {
      console.error("[Page] loadVideos:", err);
      emitAlert({ type: "error", message: "Failed to load videos" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  /* ─────────────────────────────────────────
     CREATE / UPDATE  (modal callback)
     The modal already writes to Firestore and
     returns the saved payload + firestoreId.
     We just merge it into local state — no
     extra network round-trip needed.
  ───────────────────────────────────────── */
  const handleSave = useCallback((saved) => {
    setVideos((prev) => {
      const idx = prev.findIndex((v) => v.firestoreId === saved.firestoreId);
      if (idx !== -1) {
        // UPDATE — replace existing entry
        const next = [...prev];
        next[idx] = { ...saved, firestoreId: saved.firestoreId };
        return next;
      }
      // CREATE — prepend
      return [{ ...saved, firestoreId: saved.firestoreId }, ...prev];
    });
  }, []);

  /* ─────────────────────────────────────────
     DELETE — opens confirmation modal
  ───────────────────────────────────────── */
  const handleDelete = useCallback((idOrIds) => {
    setToDelete(idOrIds);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!toDelete) return;
    setShowDeleteModal(false);

    const isBulk = Array.isArray(toDelete);
    const ids    = isBulk ? toDelete : [toDelete];

    // Resolve firestoreIds
    const firestoreIds = ids.map((localId) => {
      const v = videos.find((x) => x.id === localId || x.firestoreId === localId);
      return v?.firestoreId ?? localId;
    });

    try {
      if (isBulk || firestoreIds.length > 1) {
        await deleteVideos(firestoreIds);
      } else {
        await deleteVideo(firestoreIds[0]);
      }

      // Remove from local state
      setVideos((prev) =>
        prev.filter((v) => !ids.includes(v.id) && !ids.includes(v.firestoreId))
      );
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));

      emitAlert({
        type: "success",
        message: isBulk
          ? `${ids.length} videos deleted`
          : "Video deleted successfully",
      });
    } catch (err) {
      console.error("[Page] confirmDelete:", err);
      emitAlert({ type: "error", message: "Failed to delete video(s)" });
    } finally {
      setToDelete(null);
    }
  }, [toDelete, videos]);

  /* ─────────────────────────────────────────
     EDIT
  ───────────────────────────────────────── */
  const handleEdit = useCallback((video) => {
    setEditingVideo(video);
    setShowModal(true);
  }, []);

  /* ─────────────────────────────────────────
     TOGGLE PLAY — optimistic + Firestore sync
  ───────────────────────────────────────── */
  const handleTogglePlay = useCallback(async (localId) => {
    // 1. Optimistic UI update immediately
    setVideos((prev) =>
      prev.map((v) =>
        v.id === localId ? { ...v, isPlaying: !v.isPlaying } : v
      )
    );

    // 2. Persist to Firestore
    const video = videos.find((v) => v.id === localId);
    if (!video) return;

    try {
      await toggleVideoPlay(video.firestoreId ?? video.id, !!video.isPlaying);
    } catch (err) {
      console.error("[Page] togglePlay:", err);
      // Revert on failure
      setVideos((prev) =>
        prev.map((v) =>
          v.id === localId ? { ...v, isPlaying: !!video.isPlaying } : v
        )
      );
      emitAlert({ type: "error", message: "Failed to update play state" });
    }
  }, [videos]);

  /* ─────────────────────────────────────────
     SELECTION
  ───────────────────────────────────────── */
  const toggleSelect = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) =>
      prev.length === videos.length ? [] : videos.map((v) => v.id)
    );
  }, [videos]);

  /* ─────────────────────────────────────────
     STATS  (derived — no extra queries)
  ───────────────────────────────────────── */
  const total = videos.length;

  const recentCount = videos.filter((v) => {
    const d = v.date ? new Date(v.date) : v.createdAt?.toDate?.() ?? null;
    if (!d) return false;
    return (Date.now() - d.getTime()) / 86_400_000 <= 7;
  }).length;

  const categories = new Set(videos.map((v) => v.category).filter(Boolean)).size;

  const toSeconds = (dur) => {
    if (!dur) return 0;
    const parts = dur.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  };

  const avgDuration = videos.length
    ? formatTime(Math.floor(videos.reduce((s, v) => s + toSeconds(v.duration), 0) / videos.length))
    : "00:00";

  const shortsCount      = videos.filter((v) => v.type === "shorts").length;
  const shortsPercentage = total ? ((shortsCount / total) * 100).toFixed(0) : "0";

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="m-10">
      <VideoTopBar
        total={total}
        avgDuration={avgDuration}
        recentCount={recentCount}
        categories={categories}
        shortsPercentage={shortsPercentage}
        onCreate={() => { setEditingVideo(null); setShowModal(true); }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-32 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading videos…</span>
        </div>
      ) : (
        <TrendingVideosTable
          videos={videos}
          selected={selected}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePlay={handleTogglePlay}
        />
      )}

      {showModal && (
        <AddVideoModal
          video={editingVideo}
          videos={videos}
          onClose={() => { setShowModal(false); setEditingVideo(null); }}
          onSave={handleSave}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          title={Array.isArray(toDelete) ? `Delete ${toDelete.length} Videos` : "Delete Video"}
          description={
            Array.isArray(toDelete)
              ? `Permanently delete ${toDelete.length} selected videos? This cannot be undone.`
              : "Are you sure you want to delete this video? This action cannot be undone."
          }
          onCancel={() => { setShowDeleteModal(false); setToDelete(null); }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}