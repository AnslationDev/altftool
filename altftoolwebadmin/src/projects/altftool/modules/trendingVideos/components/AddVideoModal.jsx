"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { emitAlert } from "@/lib/alertBus";
import { createVideo, updateVideo } from "../service/trendingVideos.service";
import {
  X, Type, Hash, Tag, AlignLeft,
  UploadCloud, AlertCircle, CheckCircle2,
  Loader2, Lock,
  ChevronDown, Image as ImageIcon, Tv2,
} from "lucide-react";

/* ── Field wrapper ── */
function Field({ label, hint, error, icon, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
        {required && <span className="text-red-400 font-bold">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

/* ── Text input ── */
function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}
        ${props.readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
        ${className}`}
    />
  );
}

/* ── Textarea ── */
function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition resize-none
        ${error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}`}
    />
  );
}


/* ── Progress bar ── */
function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${value}%` }} />
    </div>
  );
}

/* ── Section divider ── */
function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

/* ── ComboBox: typeable + dropdown ── */
function ComboBox({ value, onChange, options = [], placeholder, disabled, error, hint }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleInput = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (opt) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full text-sm px-3 py-2.5 pr-8 rounded-xl border bg-white placeholder:text-gray-400
            focus:outline-none focus:ring-2 transition
            ${error ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                    : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}
            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "cursor-text"}`}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setOpen((p) => !p)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-40 transition"
        >
          <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-xs text-gray-400 italic">
              {query ? `Press Enter to add "${query}"` : "No options"}
            </div>
          ) : (
            <>
              {options.length > 0 && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions
                </div>
              )}
              {filtered.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                  className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2
                    hover:bg-blue-50 hover:text-blue-700
                    ${value === opt ? "text-blue-600 font-semibold bg-blue-50/60" : "text-gray-700"}`}
                >
                  {value === opt && (
                    <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  <span>{opt}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Thumbnail Uploader ── */
function ThumbnailUploader({ thumbnailType, setThumbnailType, thumbnailUrl, setThumbnailUrl,
  thumbnailFile, setThumbnailFile, thumbnailPreview, setThumbnailPreview,
  errors, setErrors, loading }) {

  const thumbInputRef = useRef(null);

  const processThumbFile = useCallback((selected) => {
    if (!selected) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(selected.type)) {
      setErrors((p) => ({ ...p, thumbnail: "Only JPG or PNG files are allowed" }));
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, thumbnail: "File size must be under 2MB" }));
      return;
    }
    if (thumbnailPreview && thumbnailFile) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(selected);
    setThumbnailPreview(URL.createObjectURL(selected));
    setErrors((p) => ({ ...p, thumbnail: undefined }));
  }, [thumbnailPreview, thumbnailFile, setErrors, setThumbnailFile, setThumbnailPreview]);

  const removeThumb = () => {
    if (thumbnailPreview && thumbnailFile) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setThumbnailType("url"); removeThumb(); }}
          className={`px-3 py-1 rounded-lg text-xs transition ${thumbnailType === "url" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => { setThumbnailType("upload"); setThumbnailUrl(""); }}
          className={`px-3 py-1 rounded-lg text-xs transition ${thumbnailType === "upload" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Upload
        </button>
      </div>

      {thumbnailType === "url" ? (
        <div className="space-y-3">
          <Input
            placeholder="https://example.com/thumbnail.jpg"
            value={thumbnailUrl}
            onChange={(e) => {
              setThumbnailUrl(e.target.value);
              setThumbnailPreview(e.target.value || null);
              setErrors((p) => ({ ...p, thumbnail: undefined }));
            }}
            disabled={loading}
            error={errors.thumbnail}
          />
          {/* Live URL preview */}
          {thumbnailUrl && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video w-full max-w-xs">
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                onError={() => setErrors((p) => ({ ...p, thumbnail: "Could not load image from URL" }))}
                onLoad={() => setErrors((p) => ({ ...p, thumbnail: undefined }))}
              />
              <button
                type="button"
                onClick={() => { setThumbnailUrl(""); setThumbnailPreview(null); }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {!thumbnailPreview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); processThumbFile(e.dataTransfer.files[0]); }}
              onClick={() => thumbInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition
                ${errors.thumbnail ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-blue-300 bg-gray-50/50 hover:bg-blue-50/20"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${errors.thumbnail ? "bg-red-100" : "bg-gray-100"}`}>
                <ImageIcon className={`w-5 h-5 ${errors.thumbnail ? "text-red-400" : "text-gray-400"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Drop image here or <span className="text-blue-500 font-medium">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG · Max 2MB</p>
              </div>
              {errors.thumbnail && (
                <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />{errors.thumbnail}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
              <div className="relative group aspect-video w-full max-w-xs">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={removeThumb}
                    className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {thumbnailFile && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t bg-white">
                  <div>
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{thumbnailFile.name}</p>
                    <p className="text-[10px] text-gray-400">
                      {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                </div>
              )}
            </div>
          )}

          <input
            ref={thumbInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => processThumbFile(e.target.files[0])}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}

/* ── YouTube utilities ── */

/**
 * Extracts a YouTube video ID from common URL formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 * Returns the video ID string, or null if not a YouTube URL.
 */
function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // youtu.be short links
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id || null;
    }
    // youtube.com variants
    if (u.hostname.replace("www.", "") === "youtube.com") {
      if (u.pathname.startsWith("/watch")) {
        return u.searchParams.get("v") || null;
      }
      if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] || null;
      }
    }
  } catch {
    // not a valid URL
  }
  return null;
}

/**
 * Fetches YouTube video metadata via a backend proxy route.
 * Expects your backend to expose: GET /api/youtube/meta?videoId=VIDEO_ID
 * and return: { title, description, channelName }
 *
 * Returns null silently on any error.
 */
async function fetchYouTubeMeta(videoId) {
  try {
    const res = await fetch(`/api/youtube/meta?videoId=${encodeURIComponent(videoId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data ?? null;
  } catch {
    return null;
  }
}

/* ════════════════════════════════════
   Main Modal
════════════════════════════════════ */
export default function VideoModal({ video, videos = [], onClose, onSave }) {
  const isEdit = !!video;

  const [name, setName] = useState(video?.name || "");
  const [description, setDescription] = useState(video?.description || "");
  const [videoUrl, setVideoUrl] = useState(video?.videoUrl || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(video?.image || null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState("idle");
  const [subCategory, setSubCategory] = useState(video?.subCategory || "");
  const [price, setPrice] = useState(video?.price || "");
  const [duration, setDuration] = useState(video?.duration || "");
  const [category, setCategory] = useState(video?.category || "");
  const [rating, setRating] = useState(video?.rating || "");
  const [date, setDate] = useState(video?.date || "");
  const [videoType, setVideoType] = useState("url");
  const [videoFile, setVideoFile] = useState(null);
  const [type, setType] = useState(video?.type || "video");
  const [videoPreview, setVideoPreview] = useState(video?.videoUrl || null);
  const [storedCategories, setStoredCategories] = useState([]);

  // ── Channel Name (new field) ──
  const [channelName, setChannelName] = useState(video?.channelName || "");

  // ── YouTube autofill state ──
  const ytFetchRef = useRef(null); // tracks the last fetched video ID to avoid duplicate calls
  const [ytFetching, setYtFetching] = useState(false);

  // ── Thumbnail state ──
  const [thumbnailType, setThumbnailType] = useState("url");
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnail || "");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(video?.thumbnail || null);

  useEffect(() => {
    setStoredCategories(getStoredCategories());
  }, []);

  const CATEGORY_KEY = "video_categories";

  const normalize = (str) =>
    str.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "").trim();

  const getStoredCategories = () =>
    JSON.parse(localStorage.getItem(CATEGORY_KEY)) || [];

  const saveCategory = (cat) => {
    const list = Array.isArray(cat) ? cat : [cat];
    const stored = getStoredCategories();
    const updated = [...stored];
    list.forEach((item) => {
      if (typeof item !== "string") return;
      const trimmed = item.trim();
      if (!trimmed) return;
      const normalized = normalize(trimmed);
      const exists = updated.some((c) => normalize(c) === normalized);
      if (!exists) updated.push(trimmed);
    });
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(updated));
    setStoredCategories(updated);
  };

  const newCategories = useMemo(() => {
    const combined = [
      ...videos.map((v) => v.category),
      ...storedCategories,
      category,
    ].filter(Boolean);
    const map = new Map();
    combined.forEach((c) => {
      const key = normalize(c);
      if (!map.has(key)) map.set(key, c.trim());
    });
    return Array.from(map.values());
  }, [videos, storedCategories, category]);

  const fileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview && file) URL.revokeObjectURL(preview);
      if (thumbnailPreview && thumbnailFile) URL.revokeObjectURL(thumbnailPreview);
    };
  }, []);

  /* ── YouTube autofill effect ──
     Fires whenever videoUrl changes (in URL mode).
     Only fetches if a valid YouTube ID is detected and hasn't been fetched yet.
     Only fills fields that are currently empty. */
  useEffect(() => {
    if (videoType !== "url") return;

    const videoId = extractYouTubeId(videoUrl);

    // Nothing to do — clear tracker if URL is no longer a YT link
    if (!videoId) {
      ytFetchRef.current = null;
      return;
    }

    // Already fetched for this exact video ID — skip
    if (ytFetchRef.current === videoId) return;

    // Debounce: wait 600 ms after the user stops typing before fetching
    const timer = setTimeout(async () => {
      ytFetchRef.current = videoId;
      setYtFetching(true);
      try {
        const meta = await fetchYouTubeMeta(videoId);
        if (!meta) return;

        // Only autofill fields that are still empty (don't override user input)
        if (meta.duration && !duration.trim()) setDuration(meta.duration);
        if (meta.title && !name.trim()) setName(meta.title);
        if (meta.description && !description.trim()) setDescription(meta.description);
        if (meta.channelName) setChannelName((prev) => prev.trim() ? prev : meta.channelName);
        // Autofill thumbnail (URL mode only, only if currently empty)
        if (meta.thumbnailUrl && thumbnailType === "url" && !thumbnailUrl.trim()) {
          setThumbnailUrl(meta.thumbnailUrl);
          setThumbnailPreview(meta.thumbnailUrl);
          setErrors((p) => ({ ...p, thumbnail: undefined }));
        }
      } finally {
        setYtFetching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, videoType]);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Video name is required";
    if (!category.trim()) e.category = "Category is required";
    if (!duration || !/^(\d{1,2}:)?[0-5]\d:[0-5]\d$/.test(duration))
      e.duration = "Format must be mm:ss or hh:mm:ss";
    if (!description.trim()) e.description = "Description is required";
    if (!date) e.date = "Date is required";
    if (rating !== "" && (parseFloat(rating) < 0 || parseFloat(rating) > 5))
      e.rating = "Rating must be between 0 and 5";
    if (!category.trim()) e.category = "Category is required";
    if (videoUrl) {
      try { new URL(videoUrl); } catch { e.videoUrl = "Enter a valid URL (include https://)"; }
    }
    // thumbnail URL validation
    if (thumbnailType === "url" && thumbnailUrl) {
      try { new URL(thumbnailUrl); } catch { e.thumbnail = "Enter a valid thumbnail URL (include https://)"; }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveVideo = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      let uploadedVideoUrl = "";
      let finalThumbnailUrl = thumbnailType === "url" ? thumbnailUrl : "";

      /* ── 1. Upload thumbnail (file mode) ── */
      if (thumbnailType === "upload" && thumbnailFile) {
        setStep("uploading");
        const thumbStorageRef = ref(
          storage,
          `projects/altftool/thumbnails/${Date.now()}_${thumbnailFile.name}`
        );
        const thumbTask = uploadBytesResumable(thumbStorageRef, thumbnailFile);
        await new Promise((resolve, reject) => {
          thumbTask.on(
            "state_changed",
            (snapshot) => {
              const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(pct));
            },
            reject,
            async () => {
              finalThumbnailUrl = await getDownloadURL(thumbTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      /* ── 2. Upload video file (file mode) ── */
      if (videoType === "upload" && videoFile) {
        setStep("uploading");
        const videoStorageRef = ref(
          storage,
          `projects/altftool/videos/${Date.now()}_${videoFile.name}`
        );
        const videoTask = uploadBytesResumable(videoStorageRef, videoFile);
        await new Promise((resolve, reject) => {
          videoTask.on(
            "state_changed",
            (snapshot) => {
              const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(pct));
            },
            reject,
            async () => {
              uploadedVideoUrl = await getDownloadURL(videoTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      /* ── 3. Build payload (no `id` — service handles that) ── */
      setStep("saving");
      saveCategory(newCategories);

      const payload = {
        name:        name.trim(),
        category:    category.trim(),
        subCategory: subCategory.trim(),
        duration:    duration.trim(),
        description: description.trim(),
        rating:      Number(rating) || 0,
        thumbnail:   finalThumbnailUrl,
        videoUrl:    videoType === "url" ? videoUrl : uploadedVideoUrl,
        channelName: channelName.trim(),
        date,
        type,
      };

      /* ── 4. Write to Firestore ── */
      let firestoreId;
      if (isEdit) {
        await updateVideo(video.firestoreId, payload);
        firestoreId = video.firestoreId;
      } else {
        firestoreId = await createVideo(payload);
      }

      /* ── 5. Notify parent so local state refreshes immediately ── */
      onSave({ ...payload, id: firestoreId, firestoreId });

      setStep("done");
      emitAlert({
        type: "success",
        message: isEdit ? "Video updated successfully" : "Video created successfully",
      });
      setTimeout(onClose, 600);

    } catch (err) {
      console.error("[VideoModal] saveVideo error:", err);
      emitAlert({ type: "error", message: "Failed to save video. Please try again." });
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setErrors((p) => ({ ...p, video: "Only video files allowed" }));
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setErrors((p) => ({ ...p, video: "Max size 500MB" }));
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, video: undefined }));
  };

  const stepLabel = {
    idle: isEdit ? "Update Video" : "Create Video",
    uploading: `Uploading… ${uploadProgress}%`,
    saving: "Saving…",
    done: "Done!",
  }[step];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Video" : "New Video"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit
                ? <></>
                : "Configure video details, thumbnail and source."}
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          <Field label="Type">
            <div className="flex gap-2">
              {["video", "shorts"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize ${type === t ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          {/* BASIC INFO */}
          <Section title="Basic Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Video Name" icon={<Type className="w-3.5 h-3.5" />} required error={errors.name}
                hint="The public-facing name of the video.">
                <div className="relative">
                  <Input placeholder="e.g. Tips to ace next interview" value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                    error={errors.name} disabled={loading} />
                  {ytFetching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-blue-400" />
                  )}
                </div>
              </Field>
              <Field label="Category" icon={<Tag className="w-3.5 h-3.5" />} required error={errors.category}>
                <ComboBox
                  value={category}
                  onChange={(val) => { setCategory(val); setErrors((p) => ({ ...p, category: undefined })); }}
                  options={newCategories}
                  placeholder="Select or type category"
                  error={errors.category}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Duration" icon={<Hash className="w-3.5 h-3.5" />} required error={errors.duration}
                hint="Format: mm:ss or hh:mm:ss">
                <div className="relative">
                  <Input
                    value={duration}
                    onChange={(e) => { setDuration(e.target.value); setErrors((p) => ({ ...p, duration: undefined })); }}
                    error={errors.duration}
                    disabled={loading}
                  />
                  {isEdit && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />}
                </div>
              </Field>
              <Field label="Date" required error={errors.date}>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
                  error={errors.date}
                />
              </Field>
            </div>

            {/* ── Channel Name (new field) ── */}
            <Field label="Channel Name" icon={<Tv2 className="w-3.5 h-3.5" />}
              hint="Auto-filled when a YouTube URL is entered above.">
              <Input
                placeholder="e.g. Fireship"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                disabled={loading}
              />
            </Field>

            <Field label="Description" icon={<AlignLeft className="w-3.5 h-3.5" />} required error={errors.description}>
              <Textarea rows={3} placeholder="Describe what this video does…"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
                error={errors.description} disabled={loading} />
            </Field>
          </Section>

          {/* ── THUMBNAIL ── */}
          <Section title="Thumbnail">
            <Field
              label="Thumbnail Image"
              icon={<ImageIcon className="w-3.5 h-3.5" />}
              error={errors.thumbnail}
              hint="JPG or PNG only · Max 2MB · Recommended 16:9 ratio"
            >
              <ThumbnailUploader
                thumbnailType={thumbnailType}
                setThumbnailType={setThumbnailType}
                thumbnailUrl={thumbnailUrl}
                setThumbnailUrl={setThumbnailUrl}
                thumbnailFile={thumbnailFile}
                setThumbnailFile={setThumbnailFile}
                thumbnailPreview={thumbnailPreview}
                setThumbnailPreview={setThumbnailPreview}
                errors={errors}
                setErrors={setErrors}
                loading={loading}
              />
            </Field>
          </Section>

          {/* ── VIDEO SOURCE ── */}
          <Section title="Video Source">
            <Field label="Video Source" required>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setVideoType("url")}
                  className={`px-3 py-1 rounded-lg text-xs ${videoType === "url" ? "bg-black text-white" : "bg-gray-100"}`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setVideoType("upload")}
                  className={`px-3 py-1 rounded-lg text-xs ${videoType === "upload" ? "bg-black text-white" : "bg-gray-100"}`}
                >
                  Upload
                </button>
              </div>
            </Field>

            {videoType === "url" ? (
              <div className="relative">
                <Input
                  placeholder="https://..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                {ytFetching && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span className="text-[11px] text-blue-400">Fetching YouTube metadata…</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {!videoPreview ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleVideoFile(e.dataTransfer.files[0]); }}
                    onClick={() => videoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition"
                  >
                    <UploadCloud className="w-6 h-6 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drop video here or <span className="text-blue-500">browse</span>
                    </p>
                    <p className="text-xs text-gray-400">MP4, WebM · Max 500MB</p>
                    {errors.video && <p className="text-xs text-red-500">{errors.video}</p>}
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-hidden bg-gray-50">
                    <div className="relative group">
                      <video src={videoPreview} controls className="w-full max-h-52 object-contain bg-black" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                          className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {videoFile && (
                      <div className="flex justify-between px-4 py-2 border-t bg-white">
                        <div>
                          <p className="text-xs font-medium truncate">{videoFile.name}</p>
                          <p className="text-[10px] text-gray-400">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoFile(e.target.files[0])}
                  className="hidden"
                />
              </>
            )}
          </Section>

          {/* Upload progress */}
          {step === "uploading" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading…</span>
                <span className="font-semibold tabular-nums">{uploadProgress}%</span>
              </div>
              <ProgressBar value={uploadProgress} />
            </div>
          )}
          {step === "saving" && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />Saving to database…
            </div>
          )}
          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />{isEdit ? "Video updated!" : "Video created!"}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">
            {isEdit
              ? "Changes will update the video immediately."
              : <><span className="font-semibold text-gray-600">Add</span> your video and benefit millions</>}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40">
              Cancel
            </button>
            <button onClick={saveVideo} disabled={loading || step === "done"}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-sm">
              {loading && step !== "done" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {step === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {stepLabel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}