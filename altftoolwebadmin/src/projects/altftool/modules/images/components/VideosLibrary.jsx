"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection, getDocs, query, orderBy, limit,
  startAfter, serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from "firebase/storage";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import VideoTable from "./VideoTable";
import {
  UploadCloud, X, VideoIcon, Tag, Folder,
  CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { createVideo, deleteVideo } from "../services/videos.service";

const PAGE_SIZE = 10;
const FOLDERS = ["Marketing", "Tutorials", "Testimonials", "Product", "Social", "Blogs", "Other"];
const TAB_TO_FOLDER = {
  "Marketing": "Marketing", "Tutorials": "Tutorials", "Testimonials": "Testimonials",
  "Product": "Product", "Social": "Social", "Blogs": "Blogs", "Other": "Other",
};

function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const d = video.duration;
      URL.revokeObjectURL(url);
      if (!isFinite(d)) return resolve(null);
      const mins = Math.floor(d / 60);
      const secs = Math.floor(d % 60).toString().padStart(2, "0");
      resolve(`${mins}:${secs}`);
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    video.src = url;
  });
}

function getVideoDimensions(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => { resolve(`${video.videoWidth}×${video.videoHeight}`); URL.revokeObjectURL(url); };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    video.src = url;
  });
}

function generateThumbnail(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);
    video.onloadeddata = () => { video.currentTime = Math.min(1, video.duration * 0.1); };
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    video.src = url;
    video.muted = true;
    video.preload = "metadata";
  });
}

function UploadZone({ onFilesSelected, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("video/"));
    if (files.length) onFilesSelected(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer select-none
        ${dragOver ? "border-violet-400 bg-violet-50 scale-[1.01]" : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-violet-100" : "bg-gray-100"}`}>
        <UploadCloud className={`w-7 h-7 transition-colors ${dragOver ? "text-violet-500" : "text-gray-400"}`} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">Drop videos here or <span className="text-violet-500">browse</span></p>
        <p className="text-xs text-gray-400 mt-1">MP4, MOV, WEBM, AVI, MKV — up to 500MB each</p>
      </div>
      <input ref={inputRef} type="file" accept="video/*" multiple className="hidden"
        onChange={(e) => { const files = Array.from(e.target.files || []); if (files.length) onFilesSelected(files); e.target.value = ""; }} />
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-violet-500 rounded-full transition-all duration-200" style={{ width: `${value}%` }} />
    </div>
  );
}

function QueueItem({ item, onRemove }) {
  const statusIcon = {
    pending: <Loader2 className="w-4 h-4 text-gray-400" />,
    uploading: <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />,
    done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
  }[item.status];

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
        {item.thumbnail
          ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
          : <VideoIcon className="w-5 h-5 text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{item.title || item.file.name}</p>
        <div className="flex items-center gap-2 mt-1">
          {statusIcon}
          <span className="text-xs text-gray-500 capitalize">
            {item.status === "uploading" ? `${item.progress}%` : item.status}
            {item.duration && item.status !== "uploading" ? ` · ${item.duration}` : ""}
          </span>
        </div>
        {item.status === "uploading" && <ProgressBar value={item.progress} />}
        {item.status === "done" && item.url && (
          <p className="text-[10px] text-green-600 font-mono mt-1 truncate">{item.url}</p>
        )}
      </div>
      {["pending", "done", "error"].includes(item.status) && (
        <button onClick={() => onRemove(item.id)} className="p-1 text-gray-400 hover:text-gray-600 transition shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function VideosLibrary() {
  const [queue, setQueue] = useState([]);
  const [formFolder, setFormFolder] = useState("Marketing");
  const [formTags, setFormTags] = useState("");
  const [uploading, setUploading] = useState(false);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [cursorCache, setCursorCache] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleteStoragePath, setDeleteStoragePath] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const addFiles = useCallback(async (files) => {
    const newItems = await Promise.all(files.map(async (file) => {
      const [thumbnail, duration, dimensions] = await Promise.all([
        generateThumbnail(file),
        getVideoDuration(file),
        getVideoDimensions(file),
      ]);
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        title: file.name.replace(/\.[^.]+$/, ""),
        thumbnail, duration, dimensions,
        status: "pending", progress: 0, url: null,
      };
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const removeFromQueue = useCallback((id) => {
    setQueue((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQueueItem = useCallback((id, patch) => {
    setQueue((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
  }, []);

  const uploadAll = async () => {
    const pending = queue.filter((i) => i.status === "pending");
    if (!pending.length) return;
    setUploading(true);

    const tags = formTags.split(",").map((t) => t.trim()).filter(Boolean);

    await Promise.all(pending.map((item) => new Promise((resolve) => {
      updateQueueItem(item.id, { status: "uploading", progress: 0 });

      const ext = item.file.name.split(".").pop();
      const storagePath = `videos/${formFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, item.file);

      uploadTask.on("state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          updateQueueItem(item.id, { progress: pct });
        },
        (err) => { console.error(err); updateQueueItem(item.id, { status: "error" }); resolve(); },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            await createVideo( {
              title: item.title, folder: formFolder, tags, url, storagePath,
              size: item.file.size, duration: item.duration, dimensions: item.dimensions,
              mimeType: item.file.type, uploadedAt: serverTimestamp(),
            });
            logAuditEvent({
              module: "videos",
              action: "VIDEO_UPLOAD",
              entityType: "video",
              entityId: null,
              summary: `Uploaded video "${item.title}"`,
              changes: { folder: formFolder, tags, storagePath, size: item.file.size, mimeType: item.file.type, duration: item.duration, dimensions: item.dimensions },
              route: "/images",
            });
            updateQueueItem(item.id, { status: "done", url });
            setRowCount((c) => c + 1);
          } catch (err) { console.error(err); updateQueueItem(item.id, { status: "error" }); }
          resolve();
        }
      );
    })));

    setUploading(false);
    setCursorCache({});
    fetchPage(0, paginationModel.pageSize, true);
    emitAlert({ type: "success", message: "Upload complete" });
  };

  const fetchRowCount = useCallback(async () => {
    try {
      const snap = await getCountFromServer(collection(db,"projects", "altftool", "videos"));
      setRowCount(snap.data().count);
    } catch (err) { console.error(err); }
  }, []);

  const fetchPage = useCallback(async (page, pageSize, forceFirst = false) => {
    setLoading(true);
    try {
      const constraints = [orderBy("uploadedAt", "desc"), limit(pageSize)];
      const cursor = forceFirst ? null : cursorCache[page];
      if (cursor) constraints.push(startAfter(cursor));
      const q = query(collection(db,"projects", "altftool", "videos"), ...constraints);
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVideos(data);
      const lastVisible = snap.docs[snap.docs.length - 1];
      if (lastVisible) setCursorCache((prev) => ({ ...prev, [page + 1]: lastVisible }));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [cursorCache]);

  useEffect(() => { fetchRowCount(); fetchPage(0, PAGE_SIZE); }, []); // eslint-disable-line

  const handlePaginationModelChange = (newModel) => {
    setPaginationModel(newModel);
    if (newModel.pageSize !== paginationModel.pageSize) {
      setCursorCache({});
      fetchPage(0, newModel.pageSize, true);
      setPaginationModel({ page: 0, pageSize: newModel.pageSize });
      return;
    }
    fetchPage(newModel.page, newModel.pageSize);
  };

  const filteredVideos = videos
    .filter((vid) => activeTab === "All" ? true : vid.folder === TAB_TO_FOLDER[activeTab])
    .filter((vid) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return vid.title?.toLowerCase().includes(q) || (vid.tags || []).some((t) => t.toLowerCase().includes(q));
    });

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      if (deleteStoragePath) { try { await deleteObject(ref(storage, deleteStoragePath)); } catch (_) {} }
      await deleteVideo(deleteId);
      setVideos((prev) => prev.filter((i) => i.id !== deleteId));
      setRowCount((c) => c - 1);
      emitAlert({ type: "success", message: "Video deleted" });
      logAuditEvent({
        module: "videos",
        action: "VIDEO_DELETE",
        entityType: "video",
        entityId: deleteId,
        summary: `Deleted video ${deleteId}`,
        changes: { storagePath: deleteStoragePath ?? null },
        route: "/images",
      });
    } catch (err) { console.error(err); emitAlert({ type: "error", message: "Failed to delete video" }); }
    setDeleteId(null); setDeleteStoragePath(null); setIsDeleteModalOpen(false);
  };

  const confirmBulkDelete = async () => {
    if (!selectedVideos.length) return;
    try {
      await Promise.all(selectedVideos.map(async (id) => {
        const vid = videos.find((i) => i.id === id);
        if (vid?.storagePath) { try { await deleteObject(ref(storage, vid.storagePath)); } catch (_) {} }
        await deleteVideo(id);
      }));
      setVideos((prev) => prev.filter((i) => !selectedVideos.includes(i.id)));
      setRowCount((c) => c - selectedVideos.length);
      setSelectedVideos([]);
      emitAlert({ type: "success", message: "Selected videos deleted" });
      logAuditEvent({
        module: "videos",
        action: "VIDEO_BULK_DELETE",
        entityType: "video",
        entityId: null,
        summary: `Bulk deleted ${selectedVideos.length} videos`,
        changes: { ids: selectedVideos },
        route: "/images",
      });
    } catch (err) { console.error(err); emitAlert({ type: "error", message: "Bulk delete failed" }); }
    setIsBulkDeleteModalOpen(false);
  };

  const pendingCount = queue.filter((i) => i.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Video Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upload, organize, and copy URLs for use across your site</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <span className="font-bold text-gray-800 text-sm">{rowCount}</span> videos stored
        </div>
      </div>

      {/* ── Upload card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Upload Videos</h2>
        <UploadZone onFilesSelected={addFiles} disabled={uploading} />

        {queue.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {queue.map((item) => <QueueItem key={item.id} item={item} onRemove={removeFromQueue} />)}
          </div>
        )}

        {queue.some((i) => i.status === "pending") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <Folder className="w-3.5 h-3.5" />Folder
              </label>
              <select value={formFolder} onChange={(e) => setFormFolder(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400">
                {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />Tags <span className="font-normal normal-case text-gray-400">(comma separated)</span>
              </label>
              <input value={formTags} onChange={(e) => setFormTags(e.target.value)}
                placeholder="promo, hero, homepage"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition" />
            </div>
          </div>
        )}

        {queue.some((i) => i.status === "pending") && (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <VideoIcon className="w-3.5 h-3.5" />Edit titles before uploading
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {queue.filter((i) => i.status === "pending").map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                      : <VideoIcon className="w-4 h-4 text-gray-400" />}
                  </div>
                  <input value={item.title} onChange={(e) => updateQueueItem(item.id, { title: e.target.value })}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                    placeholder="Video title" />
                  {item.duration && (
                    <span className="text-xs text-gray-400 font-mono shrink-0">{item.duration}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingCount > 0 && (
          <div className="flex justify-end pt-1">
            <button onClick={uploadAll} disabled={uploading}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-sm">
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
                : <><UploadCloud className="w-4 h-4" />Upload {pendingCount} video{pendingCount > 1 ? "s" : ""}</>}
            </button>
          </div>
        )}
      </div>

      {/* ── Video table ── */}
      <VideoTable
        videos={filteredVideos}
        setVideos={setVideos}
        setDeleteId={(id) => { setDeleteId(id); const vid = videos.find((i) => i.id === id); setDeleteStoragePath(vid?.storagePath || null); }}
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

      {/* ── Delete modal ── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-2xl">
            <h2 className="text-base font-semibold mb-1 text-gray-800">Delete this video?</h2>
            <p className="text-sm text-gray-500 mb-5">This will permanently remove the file from storage and its record from the database.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk delete modal ── */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl">
            <h2 className="text-base font-semibold mb-1 text-gray-800">Delete {selectedVideos.length} video{selectedVideos.length > 1 ? "s" : ""}?</h2>
            <p className="text-sm text-gray-500 mb-5">Files will be permanently removed from Firebase Storage and Firestore. This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsBulkDeleteModalOpen(false)} className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">Delete All</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}