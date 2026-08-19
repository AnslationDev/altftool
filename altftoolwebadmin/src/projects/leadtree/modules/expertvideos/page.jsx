"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import ExpertVideoTable from "./components/ExpertVideoTable";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";

import {
  deleteVideo,
  bulkDeleteVideos,
  fetchVideoCount,
  fetchVideosPage,
} from "./expert-video-services/ExpertVideoService";

const PAGE_SIZE = 10;

export default function ExpertVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [rowCount, setRowCount] = useState(0);
  const [cursorCache, setCursorCache] = useState({});

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Uploaded Videos");

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  /* =============================================================
     Fetch total count
  ============================================================= */
  const loadRowCount = useCallback(async () => {
    try {
      const count = await fetchVideoCount();
      setRowCount(count);
    } catch (err) {
      console.error("Count fetch failed", err);
    }
  }, []);

  /* =============================================================
     Fetch one page — delegates entirely to the service
  ============================================================= */
  const fetchPage = useCallback(
    async (page, pageSize) => {
      setLoading(true);
      try {
        const cursor = cursorCache[page] ?? null;
        const { videos: data, lastDoc } = await fetchVideosPage({ pageSize, cursor });

        setVideos(data);

        if (lastDoc) {
          setCursorCache((prev) => ({ ...prev, [page + 1]: lastDoc }));
        }
      } catch (err) {
        console.error("Failed to fetch page", err);
        emitAlert({ type: "error", message: "Failed to load videos" });
      } finally {
        setLoading(false);
      }
    },
    [cursorCache]
  );

  /* On mount */
  useEffect(() => {
    loadRowCount();
    fetchPage(0, PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Pagination changes */
  const handlePaginationModelChange = (newModel) => {
    if (newModel.pageSize !== paginationModel.pageSize) {
      setCursorCache({});
      setPaginationModel({ page: 0, pageSize: newModel.pageSize });
      fetchPage(0, newModel.pageSize);
      return;
    }
    setPaginationModel(newModel);
    fetchPage(newModel.page, newModel.pageSize);
  };

  /* =============================================================
     Single Delete
  ============================================================= */
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVideo(deleteId);
      setVideos((prev) => prev.filter((v) => v.id !== deleteId));
      setRowCount((c) => c - 1);
      emitAlert({ type: "success", message: "Video deleted successfully" });
      logAuditEvent({
        module: "expertvideos",
        action: "EXPERT_VIDEO_DELETE",
        entityType: "expertvideos",
        entityId: deleteId,
        summary: `Deleted video ${deleteId}`,
        changes: { id: deleteId },
        route: "/leadtree/expert-videos",
      });
    } catch (err) {
      console.error("Delete failed", err);
      emitAlert({ type: "error", message: "Failed to delete video" });
    }
    setDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  /* =============================================================
     Bulk Delete — uses the service function directly
  ============================================================= */
  const confirmBulkDelete = async () => {
    if (selectedVideos.length === 0) return;
    try {
      await bulkDeleteVideos(selectedVideos);
      const deletedCount = selectedVideos.length;
      setVideos((prev) => prev.filter((v) => !selectedVideos.includes(v.id)));
      setRowCount((c) => c - deletedCount);
      setSelectedVideos([]);
      emitAlert({ type: "success", message: "Selected videos deleted" });
      logAuditEvent({
        module: "expertvideos",
        action: "EXPERT_VIDEO_BULK_DELETE",
        entityType: "expertvideos",
        entityId: null,
        summary: `Bulk deleted ${deletedCount} videos`,
        changes: { ids: selectedVideos },
        route: "/leadtree/expert-videos",
      });
    } catch (err) {
      console.error("Bulk delete failed", err);
      emitAlert({ type: "error", message: "Bulk delete failed" });
    }
    setIsBulkDeleteModalOpen(false);
  };

  /* =============================================================
     Client-side filter (on top of paginated server data)
  ============================================================= */
  const filteredVideos = videos
    .filter((video) => {
      if (activeTab === "Drafts") return video.status === "draft";
      if (activeTab === "Published") return video.status === "published";
      return true;
    })
    .filter((video) => {
      if (!search) return true;
      return (
        video.title?.toLowerCase().includes(search.toLowerCase()) ||
        video.authorName?.toLowerCase().includes(search.toLowerCase())
      );
    });

  return (
    <div className="space-y-6">
      <div className="mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Manage your Expert Videos
          </h1>
          <Link
            href="/leadtree/expert-videos/add-video"
            className="bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
          >
            Add New Video
          </Link>
        </div>

        <ExpertVideoTable
          videos={filteredVideos}
          setVideos={setVideos}
          setDeleteId={setDeleteId}
          openDeleteModal={() => setIsDeleteModalOpen(true)}
          selectedVideos={selectedVideos}
          setSelectedVideos={setSelectedVideos}
          openBulkDeleteModal={() => setIsBulkDeleteModalOpen(true)}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          loading={loading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearch={setSearch}
        />
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this video?
            </h2>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="border px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Delete {selectedVideos.length} selected video
              {selectedVideos.length > 1 ? "s" : ""}?
            </h2>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsBulkDeleteModalOpen(false)} className="border px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={confirmBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
