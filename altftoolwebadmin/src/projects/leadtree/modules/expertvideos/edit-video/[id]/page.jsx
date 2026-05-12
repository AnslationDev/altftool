"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { emitAlert } from "@/lib/alertBus";
import { serverTimestamp } from "firebase/firestore";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ArrowLeft,
  Save,
  Globe,
  Type,
  User,
  Calendar,
  FileText,
  ImageIcon,
  UploadCloud,
  UploadIcon,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  Info,
  WifiOff,
  AlertTriangle,
  Film,
  Clapperboard,
  List,
  Video,
  UserCheck,
} from "lucide-react";
import {
  fetchVideoById,
  updateVideo,
  uploadThumbnailImage,
  uploadauthorImage,
  uploadVideoFile,
} from "../../expert-video-services/ExpertVideoService";
import UploadZone from "../../add-video/utils/UploadZone";
import VideoModal from "../../components/VideoModal";

/* ── Friendly error translator ── */
function getFriendlyError(err, context = "general") {
  if (typeof window !== "undefined" && !navigator.onLine)
    return "You're offline. Please check your internet connection and try again.";
  const code = err?.code || "";
  const message = err?.message || "";
  if (context === "upload") {
    if (code === "storage/canceled")
      return "Upload was cancelled. Try saving again.";
    if (code === "storage/retry-limit-exceeded")
      return "Upload failed after several attempts — your connection may be too slow. Try again.";
    if (code === "storage/quota-exceeded")
      return "Storage quota exceeded. Please contact your administrator.";
    if (code === "storage/unauthenticated" || code === "storage/unauthorized")
      return "You don't have permission to upload files. Try logging out and back in.";
    if (code === "storage/invalid-checksum")
      return "The file was corrupted during upload. Please select it again and retry.";
    if (message.includes("network") || code === "storage/unknown")
      return "Upload failed due to a network problem. Check your connection and try again.";
    return "Upload failed. Please try again.";
  }
  if (context === "firestore") {
    if (code === "permission-denied" || code === "firestore/permission-denied")
      return "You don't have permission to update this video. Please contact your administrator.";
    if (code === "unavailable" || code === "firestore/unavailable")
      return "The database is temporarily unavailable. Please wait a moment and try again.";
    if (code === "not-found" || code === "firestore/not-found")
      return "This video no longer exists — it may have been deleted.";
    if (message.includes("network") || message.includes("Failed to fetch"))
      return "Network error while saving. Please check your internet and try again.";
    return "Failed to save to the database. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

/* ── Validation messages ── */
const VALIDATION_MESSAGES = {
  title: "Please enter a title for the video.",
  subTitle: "Please enter a sub title for the video.",
  category: "Please select a category for the video.",
  description: "Please write a description for the video.",
  authorName: "Please enter the author's name.",
};

/* ── UI primitives ── */
function Field({ label, hint, error, icon, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${
        error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
      }`}
    />
  );
}

function Section({ icon, title, subtitle, children }) {
  return (
    <div className="flex flex-col border border-gray-200 shadow-2xs rounded-md p-2">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
        <div className="h-10 w-10 border border-gray-200 flex items-center justify-center rounded-md">
          {icon}
        </div>
        <div className="flex flex-col mt-2">
          <h1 className="font-bold text-[17px]">{title}</h1>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-5 p-5">{children}</div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-200"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function BannerAlert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
      <div className="flex-1">{message}</div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 text-xs font-bold ml-2"
      >
        ✕
      </button>
    </div>
  );
}

function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 text-sm text-amber-800">
      <WifiOff className="w-4 h-4 shrink-0 text-amber-500" />
      <span>
        You're offline. Changes cannot be saved — please reconnect before
        publishing or saving.
      </span>
    </div>
  );
}

/* ════════════════════════════════════
   Main Page
════════════════════════════════════ */
export default function EditVideo() {
  const router = useRouter();
  const { id } = useParams();

  /* ── Form state ── */
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    category: "",
    authorName: "",
    date: "",
    description: "",
    videoType: "long",
    status: "draft",
  });

  /* ── Thumbnail state ── */
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailError, setThumbnailError] = useState("");
  const [thumbnailUploadingMethod, setThumbnailUploadingMethod] =
    useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState(""); // for URL-based

  /* ── Video state ── */
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoError, setVideoError] = useState("");
  const [videoUploadingMethod, setVideoUploadingMethod] = useState(true);
  const [videoUrl, setVideoUrl] = useState(""); // for URL-based

  /* ── Author image state ── */
  const [authorPreview, setAuthorPreview] = useState(null);
  const [authorFile, setAuthorFile] = useState(null);
  const [authorError, setAuthorError] = useState("");
  const [authorUploadingMethod, setAuthorUploadingMethod] = useState(true);
  const [authorImgUrl, setAuthorImgUrl] = useState(""); // for URL-based

  /* ── UI state ── */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [bannerError, setBannerError] = useState(null);

  /* ── Progress state ── */
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [authorProgress, setAuthorProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState("idle"); // idle | uploading | saving | done
  const [uploadTask, setUploadTask] = useState(null);

  /* ── Load video ── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchVideoById(id);
        if (!data) {
          emitAlert({ type: "error", message: "Video not found." });
          router.push("/leadtree/expert-videos");
          return;
        }
        setFormData({
          title: data.title || "",
          subTitle: data.subTitle || "",
          category: data.category || "",
          authorName: data.authorName || "",
          date: data.date || "",
          description: data.description || "",
          videoType: data.videoType || "long",
          status: data.status || "draft",
        });

        // Pre-fill existing URLs
        if (data.thumbnailUrl) {
          setThumbnailPreview(data.thumbnailUrl);
          setThumbnailUrl(data.thumbnailUrl);
        }
        if (data.videoUrl) {
          setVideoPreview(data.videoUrl);
          setVideoUrl(data.videoUrl);
        }
        if (data.authorImgUrl) {
          setAuthorPreview(data.authorImgUrl);
          setAuthorImgUrl(data.authorImgUrl);
        }
      } catch (err) {
        console.error(err);
        const msg = getFriendlyError(err, "firestore");
        emitAlert({ type: "error", message: msg });
        setBannerError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]); // eslint-disable-line

  /* ── Thumbnail handlers ── */
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailError("");
    if (!file.type.startsWith("image/")) {
      setThumbnailError("Please select a JPG, PNG, or WebP file.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setThumbnailError("Image must be under 2MB.");
      e.target.value = "";
      return;
    }
    if (thumbnailPreview && thumbnailFile)
      URL.revokeObjectURL(thumbnailPreview);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
    setThumbnailFile(file);
  };

  const handleDeleteThumbnail = () => {
    if (thumbnailPreview && thumbnailFile)
      URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setThumbnailError("");
    setThumbnailUrl("");
  };

  /* ── Video handlers ── */
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError("");
    const validTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!validTypes.includes(file.type)) {
      setVideoError("Please select a valid video file (MP4, MOV, WEBM).");
      e.target.value = "";
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setVideoError("Video file must be under 500MB.");
      e.target.value = "";
      return;
    }
    if (videoPreview && videoFile) URL.revokeObjectURL(videoPreview);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    setVideoFile(file);
  };

  const handleDeleteVideo = () => {
    if (videoPreview && videoFile) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setVideoFile(null);
    setVideoError("");
    setVideoUrl("");
  };

  /* ── Author image handlers ── */
  const handleAuthorImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuthorError("");
    if (!file.type.startsWith("image/")) {
      setAuthorError("Please select a JPG or PNG file.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAuthorError("Author image must be under 2MB.");
      e.target.value = "";
      return;
    }
    if (authorPreview && authorFile) URL.revokeObjectURL(authorPreview);
    const url = URL.createObjectURL(file);
    setAuthorPreview(url);
    setAuthorFile(file);
  };

  const handleDeleteAuthor = () => {
    if (authorPreview && authorFile) URL.revokeObjectURL(authorPreview);
    setAuthorPreview(null);
    setAuthorFile(null);
    setAuthorError("");
    setAuthorImgUrl("");
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = VALIDATION_MESSAGES.title;
    if (!formData.subTitle.trim()) e.subTitle = VALIDATION_MESSAGES.subTitle;
    if (!formData.description.trim())
      e.description = VALIDATION_MESSAGES.description;
    if (!formData.category) e.category = VALIDATION_MESSAGES.category;
    if (!formData.authorName.trim())
      e.authorName = VALIDATION_MESSAGES.authorName;
    setErrors(e);
    const errorCount = Object.keys(e).length;
    if (errorCount > 0) {
      const noun =
        errorCount === 1 ? "1 field needs" : `${errorCount} fields need`;
      emitAlert({
        type: "error",
        message: `${noun} your attention before saving. Please check the highlighted fields.`,
      });
    }
    return errorCount === 0;
  };

  /* ── Cancel upload ── */
  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploadTask(null);
      setUploadStep("idle");
      setThumbnailProgress(0);
      setVideoProgress(0);
      setAuthorProgress(0);
      setSaving(false);
      emitAlert({
        type: "info",
        message:
          "Upload cancelled. Your changes are still here — you can try again.",
      });
    }
  };

  /* ── Save ── */
  const handleSave = async (status) => {
    if (saving || !validate()) return;
    setBannerError(null);

    if (!navigator.onLine) {
      const msg = "You're offline. Please reconnect before saving.";
      setBannerError(msg);
      emitAlert({ type: "error", message: msg });
      return;
    }

    setSaving(true);
    try {
      let finalThumbnailUrl = thumbnailUrl;
      let finalAuthorImgUrl = authorImgUrl;
      let finalVideoUrl = videoUrl;

      // Upload thumbnail if new file selected
      if (thumbnailUploadingMethod && thumbnailFile) {
        setUploadStep("uploading");
        setThumbnailProgress(0);
        try {
          finalThumbnailUrl = await uploadThumbnailImage({
            file: thumbnailFile,
            thumbnailImgId: id, // reuse the same video id
            onProgress: setThumbnailProgress,
            onTaskReady: setUploadTask,
          });
        } catch (err) {
          const msg = getFriendlyError(err, "upload");
          setBannerError(`Thumbnail upload failed: ${msg}`);
          emitAlert({ type: "error", message: msg });
          setUploadStep("idle");
          setSaving(false);
          return;
        }
      }

      // Upload author image if new file selected
      if (authorUploadingMethod && authorFile) {
        setUploadStep("uploading");
        setAuthorProgress(0);
        try {
          finalAuthorImgUrl = await uploadauthorImage({
            file: authorFile,
            authorImgId: id,
            onProgress: setAuthorProgress,
            onTaskReady: setUploadTask,
          });
        } catch (err) {
          const msg = getFriendlyError(err, "upload");
          setBannerError(`Author image upload failed: ${msg}`);
          emitAlert({ type: "error", message: msg });
          setUploadStep("idle");
          setSaving(false);
          return;
        }
      }

      // Upload video if new file selected
      if (videoUploadingMethod && videoFile) {
        setUploadStep("uploading");
        setVideoProgress(0);
        try {
          finalVideoUrl = await uploadVideoFile({
            file: videoFile,
            videoId: id,
            onProgress: setVideoProgress,
            onTaskReady: setUploadTask,
          });
        } catch (err) {
          const msg = getFriendlyError(err, "upload");
          setBannerError(`Video upload failed: ${msg}`);
          emitAlert({ type: "error", message: msg });
          setUploadStep("idle");
          setSaving(false);
          return;
        }
      }

      setUploadStep("saving");

      try {
        await updateVideo(id, {
          title: formData.title.trim(),
          subTitle: formData.subTitle.trim(),
          category: formData.category,
          authorName: formData.authorName.trim(),
          description: formData.description,
          date: formData.date,
          videoType: formData.videoType,
          thumbnailUrl: finalThumbnailUrl,
          videoUrl: finalVideoUrl,
          authorImgUrl: finalAuthorImgUrl,
          status,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        const msg = getFriendlyError(err, "firestore");
        setBannerError(msg);
        emitAlert({ type: "error", message: msg });
        setUploadStep("idle");
        setSaving(false);
        return;
      }

      logAuditEvent({
        module: "expertvideos",
        action: "EXPERT_VIDEO_UPDATE",
        entityType: "video",
        entityId: id,
        summary: `${status === "published" ? "Published" : "Saved draft"} video "${formData.title.trim()}"`,
        changes: {
          status,
          category: formData.category,
          authorName: formData.authorName ?? "",
        },
        route: `/leadtree/expert-videos/edit-video/${id}`,
      });

      setUploadStep("done");
      emitAlert({
        type: "success",
        message: status === "published" ? "Video published!" : "Draft saved.",
      });
      setTimeout(() => router.push("/leadtree/expert-videos"), 600);
    } catch (err) {
      console.error("Unexpected save error:", err);
      const msg = "Something unexpected went wrong. Please try again.";
      setBannerError(msg);
      emitAlert({ type: "error", message: msg });
      setUploadStep("idle");
      setThumbnailProgress(0);
      setVideoProgress(0);
      setAuthorProgress(0);
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm">Loading video…</span>
        </div>
      </div>
    );
  }

  /* ── Combined upload progress for display ── */
  const activeProgress = videoFile
    ? videoProgress
    : thumbnailFile
      ? thumbnailProgress
      : authorProgress;

  return (
    <div className="p-5 border border-gray-200 rounded-lg shadow-2xs bg-white">
      {/* Banners */}
      <div className="space-y-3 mb-4">
        <OfflineBanner />
        <BannerAlert
          message={bannerError}
          onDismiss={() => setBannerError(null)}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/leadtree/expert-videos")}
            className="bg-gray-200 rounded-md shadow-2xs border border-gray-300 h-8 w-8 flex items-center justify-center transition-all duration-300 cursor-pointer hover:-translate-x-1"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-[20px] font-bold">Edit Expert Video</h1>
            <p className="text-gray-500 text-sm">
              Update the video details below.
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            formData.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {formData.status === "published" ? "● Published" : "○ Draft"}
        </span>
      </div>

      <div className="relative py-6">
        {/* Video type toggle */}
        <div className="flex justify-between items-center w-[420px] px-3 py-3 border border-gray-300 shadow-sm rounded-lg gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, videoType: "long" }))}
            className={`flex items-center justify-center gap-2 font-medium w-50 rounded-lg p-2.5 transition-colors duration-200 cursor-pointer ${
              formData.videoType === "long"
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Film className="h-5 w-5" /> Long Video
          </button>
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, videoType: "short" }))}
            className={`flex items-center justify-center gap-2 font-medium w-50 rounded-lg p-2.5 transition-colors duration-200 cursor-pointer ${
              formData.videoType === "short"
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Clapperboard className="h-5 w-5" /> Short Video
          </button>
        </div>

        <div className="grid gap-5 grid-cols-2">
          {/* ── Basic Info ── */}
          <Section
            icon={<List />}
            title="Basic Info"
            subtitle="Title, category, description and publish date."
          >
            <Field
              label="Title"
              icon={<Type className="w-3.5 h-3.5" />}
              required
              error={errors.title}
            >
              <Input
                placeholder="Enter video title…"
                value={formData.title}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, title: e.target.value }));
                  setErrors((p) => ({ ...p, title: undefined }));
                  setBannerError(null);
                }}
                error={errors.title}
              />
            </Field>

            <Field
              label="Sub Title"
              icon={<Type className="w-3.5 h-3.5" />}
              required
              error={errors.subTitle}
            >
              <Input
                placeholder="Enter video sub title…"
                value={formData.subTitle}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, subTitle: e.target.value }));
                  setErrors((p) => ({ ...p, subTitle: undefined }));
                  setBannerError(null);
                }}
                error={errors.subTitle}
              />
            </Field>

            <Field
              label="Category"
              icon={<FileText className="w-3.5 h-3.5" />}
              required
              error={errors.category}
            >
              <VideoModal
                value={formData.category}
                onChange={(v) => {
                  setFormData((p) => ({ ...p, category: v }));
                  setErrors((p) => ({ ...p, category: undefined }));
                }}
              />
              {errors.category && (
                <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.category}
                </p>
              )}
            </Field>

            <Field
              label="Display Date"
              icon={<Calendar className="w-3.5 h-3.5" />}
            >
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, date: e.target.value }))
                }
              />
            </Field>

            <Field
              label="Description"
              icon={<FileText className="w-3.5 h-3.5" />}
              required
              error={errors.description}
            >
              <textarea
                rows={4}
                placeholder="Enter video description…"
                value={formData.description}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, description: e.target.value }));
                  setErrors((p) => ({ ...p, description: undefined }));
                }}
                className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition resize-none ${
                  errors.description
                    ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                    : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
                }`}
              />
            </Field>
          </Section>

          {/* ── Thumbnail ── */}
          <Section
            icon={<ImageIcon />}
            title="Thumbnail Info"
            subtitle="Upload a cover image or provide a URL."
          >
            {/* Toggle */}
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => {
                  setThumbnailUploadingMethod(true);
                  setThumbnailUrl("");
                  setThumbnailError("");
                }}
                className={`px-8 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-200 ${
                  thumbnailUploadingMethod
                    ? "bg-black text-white border-0"
                    : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                }`}
              >
                Local System Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setThumbnailUploadingMethod(false);
                  handleDeleteThumbnail();
                }}
                className={`px-8 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-200 ${
                  !thumbnailUploadingMethod
                    ? "bg-black text-white border-0"
                    : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                }`}
              >
                URL Based
              </button>
            </div>

            {thumbnailUploadingMethod ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center">
                  <UploadZone
                    accept="image/*"
                    preview={thumbnailPreview}
                    onFileChange={handleThumbnailChange}
                    onDelete={handleDeleteThumbnail}
                    placeholder="Drop thumbnail or click to upload"
                    hint="JPG/PNG format, under 2MB"
                    icon={UploadCloud}
                    error={thumbnailError}
                  />
                </div>
                {thumbnailProgress > 0 && thumbnailProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Uploading thumbnail…</span>
                      <span className="font-semibold tabular-nums">
                        {thumbnailProgress}%
                      </span>
                    </div>
                    <ProgressBar value={thumbnailProgress} />
                  </div>
                )}
              </div>
            ) : (
              <Field
                label="Thumbnail URL"
                icon={<UploadCloud className="w-3.5 h-3.5" />}
              >
                <Input
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={thumbnailUrl}
                  onChange={(e) => {
                    setThumbnailUrl(e.target.value);
                    setThumbnailPreview(e.target.value);
                  }}
                />
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="mt-2 rounded-lg w-full max-h-36 object-cover border border-gray-200"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
              </Field>
            )}
          </Section>

          {/* ── Video ── */}
          <Section
            icon={<Video />}
            title="Video Info"
            subtitle="Upload the video file or paste a hosted URL."
          >
            {/* Toggle */}
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => {
                  setVideoUploadingMethod(true);
                  setVideoUrl("");
                  setVideoError("");
                }}
                className={`px-8 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-200 ${
                  videoUploadingMethod
                    ? "bg-black text-white border-0"
                    : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                }`}
              >
                Local System Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoUploadingMethod(false);
                  handleDeleteVideo();
                }}
                className={`px-8 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-200 ${
                  !videoUploadingMethod
                    ? "bg-black text-white border-0"
                    : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                }`}
              >
                URL Based
              </button>
            </div>

            {videoUploadingMethod ? (
              <div className="flex flex-col items-center justify-center gap-3 px-3">
                <UploadZone
                  accept="video/mp4,video/webm,video/quicktime"
                  preview={videoPreview}
                  onFileChange={handleVideoChange}
                  onDelete={handleDeleteVideo}
                  placeholder="Drop your video or click to upload"
                  hint="MP4, MOV, WEBM (max 500MB)"
                  icon={UploadIcon}
                  error={videoError}
                />
                {videoProgress > 0 && videoProgress < 100 && (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Uploading video…</span>
                      <span className="font-semibold tabular-nums">
                        {videoProgress}%
                      </span>
                    </div>
                    <ProgressBar value={videoProgress} />
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                    >
                      Cancel upload
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Field label="Video URL" icon={<Video className="w-3.5 h-3.5" />}>
                <Input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoPreview(e.target.value);
                  }}
                />
              </Field>
            )}
          </Section>

          {/* ── Author ── */}
          <Section
            icon={<UserCheck />}
            title="Author Info"
            subtitle="Expert behind the video."
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Author image upload */}
              <div className="flex flex-col gap-3">
                {/* Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthorUploadingMethod(true);
                      setAuthorImgUrl("");
                      setAuthorError("");
                    }}
                    className={`flex-1 py-1.5 rounded-md text-[12px] font-medium cursor-pointer transition-colors duration-200 ${
                      authorUploadingMethod
                        ? "bg-black text-white border-0"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthorUploadingMethod(false);
                      handleDeleteAuthor();
                    }}
                    className={`flex-1 py-1.5 rounded-md text-[12px] font-medium cursor-pointer transition-colors duration-200 ${
                      !authorUploadingMethod
                        ? "bg-black text-white border-0"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    URL
                  </button>
                </div>

                {authorUploadingMethod ? (
                  <UploadZone
                    accept="image/*"
                    preview={authorPreview}
                    onFileChange={handleAuthorImageChange}
                    onDelete={handleDeleteAuthor}
                    placeholder="Drop author image or click to upload"
                    hint="JPG, PNG (max 2MB)"
                    shape="circle"
                    error={authorError}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/author.jpg"
                      value={authorImgUrl}
                      onChange={(e) => {
                        setAuthorImgUrl(e.target.value);
                        setAuthorPreview(e.target.value);
                      }}
                    />
                    {authorImgUrl && (
                      <img
                        src={authorImgUrl}
                        alt="Author preview"
                        className="rounded-full w-16 h-16 object-cover border border-gray-200"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}
                  </div>
                )}

                {authorProgress > 0 && authorProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Uploading author image…</span>
                      <span className="font-semibold tabular-nums">
                        {authorProgress}%
                      </span>
                    </div>
                    <ProgressBar value={authorProgress} />
                  </div>
                )}
              </div>

              {/* Author name */}
              <div className="flex flex-col gap-5">
                <Field
                  label="Author Name"
                  icon={<User className="w-3.5 h-3.5" />}
                  required
                  error={errors.authorName}
                >
                  <Input
                    placeholder="Expert's name"
                    value={formData.authorName}
                    onChange={(e) => {
                      setFormData((p) => ({
                        ...p,
                        authorName: e.target.value,
                      }));
                      setErrors((p) => ({ ...p, authorName: undefined }));
                    }}
                    error={errors.authorName}
                  />
                </Field>
              </div>
            </div>
          </Section>
        </div>

        {/* ── Upload progress banner (when actively uploading) ── */}
        {uploadStep === "uploading" && (
          <div className="mt-5 space-y-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Uploading files…</span>
              <span className="font-semibold tabular-nums">
                {activeProgress}%
              </span>
            </div>
            <ProgressBar value={activeProgress} />
            <button
              type="button"
              onClick={handleCancelUpload}
              className="text-xs text-red-500 hover:text-red-700 font-medium underline"
            >
              Cancel upload
            </button>
          </div>
        )}

        {uploadStep === "saving" && (
          <div className="mt-5 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            Saving to database…
          </div>
        )}

        {uploadStep === "done" && (
          <div className="mt-5 flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4" />
            Saved! Redirecting…
          </div>
        )}

        {/* ── Submit buttons ── */}
        <div className="flex py-5 mt-3 justify-end">
          <div className="flex flex-row gap-3 items-center">
            {/* View live (if published) */}
            {formData.status === "published" && (
              <button
                type="button"
                onClick={() => router.push(`/leadtree/expert-videos/view/${id}`)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition cursor-pointer"
              >
                <Eye className="h-5 w-5" />
                View Live
              </button>
            )}

            {/* Save as Draft */}
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && uploadStep !== "done" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Save Draft
            </button>

            {/* Publish */}
            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving || uploadStep === "done"}
              className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Globe className="h-5 w-5" />
              )}
              {saving
                ? uploadStep === "uploading"
                  ? `Uploading… ${activeProgress}%`
                  : "Saving…"
                : "Publish Video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
