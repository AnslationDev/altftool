"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { emitAlert } from "@/lib/alertBus";
import {
  fetchCategoryNames,
  createBlog,
  updateBlogImage,
  uploadBlogImage,
} from "../services/blogsService";
import { serverTimestamp } from "firebase/firestore";
import CategorySelector from "../components/CategorySelector";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ArrowLeft, Type, User, Calendar, FileText, Search,
  ImageIcon, UploadCloud, Trash2, Globe, Save,
  AlertCircle, CheckCircle2, Loader2, Info, Clock,
  WifiOff, RefreshCw, AlertTriangle, ALargeSmall,
  Hash, ShieldCheck,
} from "lucide-react";
import CTAButtonPicker from "../components/CtaButtonPicker";
import FAQPicker from "../components/FAQCreator";
import BlogInternalLinkAssistant from "../components/BlogInternalLinkAssistant";
import BlogPublishQualityGate from "../components/BlogPublishQualityGate";
import BlogSeoChecklist, { parseBlogTags } from "../components/BlogSeoChecklist";
import BlogLivePreview from "../components/BlogLivePreview";
import BlogWritingAssistant from "../components/BlogWritingAssistant";
import BlogContentBlocks from "../components/BlogContentBlocks";
import BlogContentTemplates from "../components/BlogContentTemplates";
import BlogRefreshActions from "../components/BlogRefreshActions";
import BlogSourceEditor, { parseSourcesText } from "../components/BlogSourceEditor";

const BlogEditor = dynamic(() => import("../components/BlogEditor"), { ssr: false });

const DRAFT_KEY = "blogDraftData";

/* ── helpers ── */
const generateSlug    = (t) => t.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-");
const stripHtml       = (h) => (h || "").replace(/<[^>]+>/g, "");
const generateExcerpt = (html, len = 160) => stripHtml(html).substring(0, len).trim();

/* ── SEO Title validation ── */
const SEO_TITLE_MIN       = 50;
const SEO_TITLE_IDEAL_MAX = 60;
const SEO_TITLE_HARD_MAX  = 60;

const getSeoTitleStatus = (len) => {
  if (len === 0)                    return { color: "bg-gray-200",  label: "", ok: false };
  if (len < SEO_TITLE_MIN)          return { color: "bg-amber-400", label: `Too short — aim for ${SEO_TITLE_MIN}–${SEO_TITLE_IDEAL_MAX} chars`, ok: false };
  if (len <= SEO_TITLE_IDEAL_MAX)   return { color: "bg-green-400", label: "Perfect length", ok: true };
  return                                   { color: "bg-red-400",   label: `Too long — will be truncated by Google (max ${SEO_TITLE_HARD_MAX})`, ok: false };
};

/* ── Friendly error translator ── */
function getFriendlyError(err, context = "general") {
  if (!navigator.onLine) return "You're offline. Please check your internet connection and try again.";
  const code    = err?.code    || "";
  const message = err?.message || "";
  if (context === "upload") {
    if (code === "storage/canceled")             return "Upload was cancelled. Click Publish again to retry.";
    if (code === "storage/retry-limit-exceeded") return "Upload failed after several attempts — your connection may be too slow. Try again.";
    if (code === "storage/quota-exceeded")       return "Storage quota exceeded. Please contact your administrator.";
    if (code === "storage/unauthenticated" || code === "storage/unauthorized") return "You don't have permission to upload files. Try logging out and back in.";
    if (code === "storage/invalid-checksum")     return "The image file was corrupted during upload. Please select the image again and retry.";
    if (code === "storage/server-file-wrong-size") return "Something went wrong uploading the image. Please try again.";
    if (code === "storage/object-not-found")     return "Upload destination not found. Please contact support.";
    if (message.includes("network") || code === "storage/unknown") return "Upload failed due to a network problem. Check your connection and try again.";
    return "Image upload failed. Please try again.";
  }
  if (context === "firestore") {
    if (code === "permission-denied" || code === "firestore/permission-denied") return "You don't have permission to save this blog. Please contact your administrator.";
    if (code === "unavailable" || code === "firestore/unavailable")             return "The database is temporarily unavailable. Please wait a moment and try again.";
    if (code === "deadline-exceeded" || code === "firestore/deadline-exceeded") return "Saving timed out — your connection might be slow. Please try again.";
    if (code === "resource-exhausted" || code === "firestore/resource-exhausted") return "Too many requests. Please wait a few seconds and try again.";
    if (code === "unauthenticated" || code === "firestore/unauthenticated")     return "Your session has expired. Please log out and log back in, then try again.";
    if (code === "not-found" || code === "firestore/not-found")                 return "The document you're trying to update no longer exists.";
    if (message.includes("network") || message.includes("Failed to fetch"))    return "Network error while saving. Please check your internet and try again.";
    return "Failed to save to the database. Please try again.";
  }
  if (context === "draft") {
    if (code === "permission-denied") return "You don't have permission to save drafts. Contact your admin.";
    if (!navigator.onLine)            return "You're offline. Your draft has been saved locally — it will sync when you're back online.";
    return "Couldn't save your draft to the server. Your work is still saved locally.";
  }
  if (context === "categories") {
    if (!navigator.onLine) return "Can't load categories while offline. Please reconnect and refresh.";
    return "Failed to load categories. Refresh the page to try again.";
  }
  return "Something went wrong. Please try again.";
}

/* ── Validation messages ── */
const VALIDATION_MESSAGES = {
  heading:        "Please enter a heading for your blog post.",
  author:         "Please enter the author's name.",
  date:           "Please choose a publish date.",
  description:    "Please write some content for your blog post.",
  category:       "Please select a valid category from the list.",
  seoDescription: "Please enter an SEO description (helps Google find your post).",
  image:          "Please upload a featured image for your post.",
  imageAlt:       "Please enter alt text for the featured image (required for accessibility and SEO).",
  seoTitleEmpty:  "Please enter a meta title (used as the browser tab title and in Google search results).",
  seoTitleShort:  (len) => `Meta title is too short (${len} chars). Aim for at least ${SEO_TITLE_MIN} characters so Google shows it fully.`,
  seoTitleLong:   (len) => `Meta title is too long (${len} chars). Google will cut it off after ${SEO_TITLE_HARD_MAX} characters.`,
};

const IMAGE_MESSAGES = {
  wrongType: "That file isn't an image. Please select a JPG, PNG, or WebP file.",
  tooLarge:  (size) => `This image is ${size} — it must be under 2MB. Please resize or compress it first.`,
  noFile:    "Please upload a featured image for your post.",
};

/* ── UI primitives ── */
function Field({ label, hint, error, icon, required, children }) {
  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
        {icon && <span className="text-gray-400">{icon}</span>}{label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="flex items-center gap-1 text-xs text-red-500 font-medium"><AlertCircle className="w-3 h-3 shrink-0" />{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${error ? "border-red-300 focus:ring-red-400/30 focus:border-red-400" : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}`} />
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
        {title}<span className="flex-1 h-px bg-gray-100" />
      </h2>
      {children}
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${value}%` }} />
    </div>
  );
}

function BannerAlert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
      <div className="flex-1">{message}</div>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-xs font-bold ml-2">✕</button>
    </div>
  );
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 text-sm text-amber-800">
      <WifiOff className="w-4 h-4 shrink-0 text-amber-500" />
      <span>You're offline. Your draft is being saved locally — publishing requires an internet connection.</span>
    </div>
  );
}

function DraftRestoreBanner({ savedAt, onDismiss }) {
  if (!savedAt) return null;
  const age = savedAt ? Math.round((Date.now() - savedAt.getTime()) / 60000) : 0;
  const ageLabel = age < 1 ? "just now" : age === 1 ? "1 minute ago" : `${age} minutes ago`;
  return (
    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 text-sm text-blue-700">
      <Info className="w-4 h-4 shrink-0 text-blue-500" />
      <span className="flex-1">We found an unsaved draft from <strong>{ageLabel}</strong>. It has been restored automatically.</span>
      <button onClick={onDismiss} className="text-blue-400 hover:text-blue-600 font-bold text-xs">✕ Discard draft</button>
    </div>
  );
}

/* ════════════════════════════════════
   Main Page
════════════════════════════════════ */
export default function AddBlog() {
  const router       = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    heading: "", category: "", author: "", date: "",
    description: "", seoTitle: "", seoDescription: "",
    tags: "", authorRole: "", reviewedBy: "", editorialNote: "",
    reviewedAt: "", sourcesText: "", sourceNotes: "",
  });
  const [seoEdited, setSeoEdited]             = useState({ title: false, description: false });
  const [categories, setCategories]           = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [imageFile, setImageFile]             = useState(null);
  const [imagePreview, setImagePreview]       = useState("");
  const [imageName, setImageName]             = useState("");
  const [imageAlt, setImageAlt]               = useState("");
  const [dragOver, setDragOver]               = useState(false);
  const [errors, setErrors]                   = useState({});
  const [submitting, setSubmitting]           = useState(false);
  const [savingDraft, setSavingDraft]         = useState(false);
  const [uploadProgress, setUploadProgress]   = useState(0);
  const [step, setStep]                       = useState("idle");
  const [draftSavedAt, setDraftSavedAt]       = useState(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [seoExpanded, setSeoExpanded]         = useState(false);
  const [bannerError, setBannerError]         = useState(null);
  const [uploadTask, setUploadTask]           = useState(null);
  const [autoSaveError, setAutoSaveError]     = useState(false);
  const [publishGate, setPublishGate]         = useState(null);

  /* ── Load categories ── */
  useEffect(() => {
    (async () => {
      try {
        const loaded = await fetchCategoryNames();
        if (loaded.length === 0) {
          setCategoriesError("No categories found. Please add categories before creating a post.");
        } else {
          setCategories(loaded);
          setCategoriesError(null);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
        const msg = getFriendlyError(err, "categories");
        setCategoriesError(msg);
        emitAlert({ type: "error", message: msg });
      }
    })();
  }, []);

  /* ── Restore draft ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasContent = parsed.formData && Object.values(parsed.formData).some((v) => v && v.trim && v.trim() !== "");
        if (hasContent) {
          setFormData((prev) => ({ ...prev, ...(parsed.formData || {}), tags: parsed.formData?.tags || "" }));
          setImagePreview(parsed.imagePreview || "");
          setImageName(parsed.imageName || "");
          setImageAlt(parsed.imageAlt || "");
          if (parsed.savedAt) {
            setDraftSavedAt(new Date(parsed.savedAt));
            setShowDraftBanner(true);
          }
        }
      }
    } catch (err) {
      console.warn("Could not restore draft:", err);
      try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
    }
  }, []);

  /* ── Auto-save draft every 2s ── */
  useEffect(() => {
    const id = setInterval(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, imagePreview, imageName, imageAlt, savedAt: new Date().toISOString() }));
        setDraftSavedAt(new Date());
        setAutoSaveError(false);
      } catch (err) {
        setAutoSaveError(true);
        console.warn("Auto-save failed:", err);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [formData, imagePreview, imageName, imageAlt]);

  const clearError  = (name) => setErrors((p) => ({ ...p, [name]: undefined }));

  const handleInsertContentBlock = (html) => {
    setFormData((prev) => ({
      ...prev,
      description: `${prev.description || ""}${prev.description?.trim() ? "\n\n" : ""}${html}`,
    }));
    clearError("description");
  };

  const handleApplyWritingFields = (fields = {}) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(fields).forEach((key) => {
        next[key] = undefined;
      });
      return next;
    });
    if ("seoTitle" in fields) setSeoEdited((prev) => ({ ...prev, title: true }));
    if ("seoDescription" in fields) setSeoEdited((prev) => ({ ...prev, description: true }));
    setBannerError(null);
  };

  const handleApplyTemplate = ({ html = "", fields = {} } = {}) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
      description: `${prev.description || ""}${prev.description?.trim() ? "\n\n" : ""}${html}`,
    }));
    setErrors((prev) => {
      const next = { ...prev, description: undefined };
      Object.keys(fields).forEach((key) => {
        next[key] = undefined;
      });
      return next;
    });
    if ("seoTitle" in fields) setSeoEdited((prev) => ({ ...prev, title: true }));
    if ("seoDescription" in fields) setSeoEdited((prev) => ({ ...prev, description: true }));
    setBannerError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "seoTitle")       setSeoEdited((p) => ({ ...p, title: true }));
    if (name === "seoDescription") setSeoEdited((p) => ({ ...p, description: true }));
    clearError(name);
    setBannerError(null);
  };

  /* ── File handling ── */
  const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      const msg = IMAGE_MESSAGES.wrongType;
      setErrors((p) => ({ ...p, image: msg })); emitAlert({ type: "error", message: msg }); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const msg = IMAGE_MESSAGES.tooLarge(fmtSize(file.size));
      setErrors((p) => ({ ...p, image: msg })); emitAlert({ type: "error", message: msg }); return;
    }
    if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    setImageFile(file); setImageName(file.name); setImagePreview(URL.createObjectURL(file));
    clearError("image");
  }, [imagePreview, imageFile]); // eslint-disable-line

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) { setErrors((p) => ({ ...p, image: "No file was dropped. Please try again." })); return; }
    processFile(file);
  };

  const removeImage = () => {
    if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    setImageFile(null); setImagePreview(""); setImageName(""); setImageAlt("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!formData.heading.trim())       e.heading       = VALIDATION_MESSAGES.heading;
    if (!formData.author.trim())        e.author        = VALIDATION_MESSAGES.author;
    if (!formData.date)                 e.date          = VALIDATION_MESSAGES.date;
    if (!formData.description)          e.description   = VALIDATION_MESSAGES.description;
    if (!formData.seoDescription.trim())e.seoDescription = VALIDATION_MESSAGES.seoDescription;
    if (!imageFile && !imagePreview)    e.image         = VALIDATION_MESSAGES.image;
    if ((imageFile || imagePreview) && !imageAlt.trim()) e.imageAlt = VALIDATION_MESSAGES.imageAlt;

    if (!formData.category.trim()) {
      e.category = VALIDATION_MESSAGES.category;
    } else if (categories.length > 0 && !categories.includes(formData.category.trim())) {
      e.category = "That category doesn't exist. Please choose one from the list.";
    }

    const seoTitleLen = formData.seoTitle.trim().length;
    if (!formData.seoTitle.trim())         e.seoTitle = VALIDATION_MESSAGES.seoTitleEmpty;
    else if (seoTitleLen < SEO_TITLE_MIN)  e.seoTitle = VALIDATION_MESSAGES.seoTitleShort(seoTitleLen);
    else if (seoTitleLen > SEO_TITLE_HARD_MAX) e.seoTitle = VALIDATION_MESSAGES.seoTitleLong(seoTitleLen);

    setErrors(e);
    if (e.seoTitle || e.seoDescription) setSeoExpanded(true);

    const errorCount = Object.keys(e).length;
    if (errorCount > 0) {
      const noun = errorCount === 1 ? "1 field needs" : `${errorCount} fields need`;
      emitAlert({ type: "error", message: `${noun} your attention before publishing. Please scroll up to check the highlighted fields.` });
    }
    return errorCount === 0;
  };

  const ensurePublishGateReady = () => {
    if (!publishGate) {
      const msg = "Publish gate is still checking this post. Please wait a moment and try again.";
      setBannerError(msg);
      emitAlert({ type: "warning", message: msg });
      return false;
    }

    if (!publishGate.canPublish) {
      const firstIssue = publishGate.blockingIssues?.[0]?.label || "Required publish check";
      const count = publishGate.blockingIssues?.length || 1;
      const msg = `${count} publish gate blocker${count === 1 ? "" : "s"} need attention: ${firstIssue}.`;
      setBannerError(msg);
      emitAlert({ type: "error", message: msg });
      return false;
    }

    const warnings = publishGate.warningIssues || [];
    if (warnings.length > 0) {
      const preview = warnings.slice(0, 3).map((item) => `- ${item.label}: ${item.detail}`).join("\n");
      const ok = window.confirm(`Publish with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}?\n\n${preview}\n\nContinue publishing?`);
      if (!ok) {
        const msg = "Publishing paused. Review the publish gate warnings before going live.";
        setBannerError(msg);
        emitAlert({ type: "warning", message: msg });
        return false;
      }
    }

    return true;
  };

  /* ── Publish ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBannerError(null);
    if (submitting || !validate()) return;
    if (!ensurePublishGateReady()) return;

    if (!navigator.onLine) {
      const msg = "You're offline. Please reconnect before publishing.";
      setBannerError(msg); emitAlert({ type: "error", message: msg }); return;
    }

    setSubmitting(true);
    let blogRef = null;

    try {
      const slug    = generateSlug(formData.heading);
      const excerpt = stripHtml(formData.description).slice(0, 160);

      // Step 1: Create Firestore document
      try {
        blogRef = await createBlog({
          heading: formData.heading.trim(), slug,
          category: formData.category, author: formData.author.trim(),
          authorRole: formData.authorRole.trim(),
          reviewedBy: formData.reviewedBy.trim(),
          editorialNote: formData.editorialNote.trim(),
          reviewedAt: formData.reviewedAt || "",
          sources: parseSourcesText(formData.sourcesText),
          sourceNotes: formData.sourceNotes.trim(),
          description: formData.description, excerpt,
          date: formData.date,
          seoTitle: formData.seoTitle.trim(),
          seoDescription: formData.seoDescription || excerpt,
          image: "", imageAlt: imageAlt.trim(),
          views: 0, likesCount: 0, commentsCount: 0, feedbackCount: 0, helpfulCount: 0, notHelpfulCount: 0, status: "published",
          tags: parseBlogTags(formData.tags),
        });
      } catch (err) {
        const msg = getFriendlyError(err, "firestore");
        setBannerError(msg); emitAlert({ type: "error", message: msg });
        setSubmitting(false); setStep("idle"); return;
      }

      // Step 2: Upload image
      let imageUrl;
      setStep("uploading"); setUploadProgress(0);
      try {
        imageUrl = await uploadBlogImage({
          file: imageFile,
          blogId: blogRef.id,
          onProgress: setUploadProgress,
          onTaskReady: setUploadTask,
        });
      } catch (err) {
        const msg = getFriendlyError(err, "upload");
        setBannerError(`Image upload failed: ${msg}`); emitAlert({ type: "error", message: msg });
        setSubmitting(false); setStep("idle"); setUploadProgress(0); return;
      }

      // Step 3: Attach image URL
      setStep("saving");
      try {
        await updateBlogImage(blogRef.id, imageUrl);
      } catch (err) {
        const msg = "Blog was published but the image link failed to save. Please edit the post to re-attach the image.";
        setBannerError(msg); emitAlert({ type: "warning", message: msg });
        console.error("Image URL update failed:", err);
      }

      logAuditEvent({
        module: "blogs", action: "BLOG_CREATE", entityType: "blog", entityId: blogRef.id,
        summary: `Published blog "${formData.heading.trim()}"`,
        changes: { status: "published", category: formData.category, author: formData.author.trim() },
        route: "/altftool/blogs/add-blogs",
      });

      setStep("done");
      localStorage.removeItem(DRAFT_KEY);
      emitAlert({ type: "success", message: "Blog published successfully! Redirecting…" });
      setTimeout(() => router.push("/altftool/blogs"), 700);

    } catch (err) {
      console.error("Unexpected publish error:", err);
      const msg = "Something unexpected went wrong. Your form data is still here — please try again.";
      setBannerError(msg); emitAlert({ type: "error", message: msg });
      setStep("idle"); setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Cancel upload ── */
  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel(); setUploadTask(null);
      setStep("idle"); setUploadProgress(0); setSubmitting(false);
      emitAlert({ type: "info", message: "Upload cancelled. Your form data is still here — you can try again." });
    }
  };

  /* ── Save draft ── */
  const handleSaveDraft = async () => {
    if (savingDraft) return;
    if (!navigator.onLine) {
      emitAlert({ type: "warning", message: "You're offline. Your draft has been saved locally and will sync when you reconnect." });
      return;
    }
    setSavingDraft(true);
    try {
      const slug    = generateSlug(formData.heading || "draft");
      const draftRef = await createBlog({
        heading: formData.heading || "Untitled Draft", slug,
        category: formData.category || "", author: formData.author || "",
        authorRole: formData.authorRole || "",
        reviewedBy: formData.reviewedBy || "",
        editorialNote: formData.editorialNote || "",
        reviewedAt: formData.reviewedAt || "",
        sources: parseSourcesText(formData.sourcesText),
        sourceNotes: formData.sourceNotes.trim(),
        description: formData.description || "",
        excerpt: stripHtml(formData.description || "").slice(0, 160),
        date: formData.date || "",
        seoTitle: formData.seoTitle || "", seoDescription: formData.seoDescription || "",
        image: "", imageAlt: imageAlt.trim(),
        views: 0, likesCount: 0, commentsCount: 0, feedbackCount: 0, helpfulCount: 0, notHelpfulCount: 0, status: "draft",
        tags: parseBlogTags(formData.tags),
      });
      logAuditEvent({
        module: "blogs", action: "BLOG_DRAFT_CREATE", entityType: "blog", entityId: draftRef.id,
        summary: `Saved draft "${formData.heading || "Untitled Draft"}"`,
        changes: { status: "draft", category: formData.category || "" },
        route: "/altftool/blogs/add-blogs",
      });
      localStorage.removeItem(DRAFT_KEY);
      emitAlert({ type: "success", message: "Draft saved successfully!" });
      router.push("/altftool/blogs");
    } catch (err) {
      console.error("Draft save failed:", err);
      emitAlert({ type: "error", message: getFriendlyError(err, "draft") });
    } finally {
      setSavingDraft(false);
    }
  };

  /* ── Discard draft ── */
  const handleDiscardDraft = () => {
    setShowDraftBanner(false);
    setFormData({ heading: "", category: "", author: "", date: "", description: "", seoTitle: "", seoDescription: "", tags: "", authorRole: "", reviewedBy: "", editorialNote: "", reviewedAt: "", sourcesText: "", sourceNotes: "" });
    setImagePreview(""); setImageName(""); setImageFile(null); setImageAlt(""); setDraftSavedAt(null);
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
    emitAlert({ type: "info", message: "Draft discarded. Starting fresh." });
  };

  /* ── SEO & alt health ── */
  const seoTitleLen    = formData.seoTitle.trim().length;
  const descLen        = formData.seoDescription.length;
  const seoTitleStatus = getSeoTitleStatus(seoTitleLen);
  const descOk         = descLen >= 120 && descLen <= 160;
  const altLen         = imageAlt.length;
  const altOk          = altLen >= 5 && altLen <= 125;

  const fmtTime = (d) => d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : null;

  const stepLabel = { idle: "Create Ad", uploading: `Uploading… ${uploadProgress}%`, saving: "Saving…", done: "Done!" }[step] ?? "Publish Blog";

  return (
    <div className="space-y-6">
      <div className=" mx-auto px-5 py-7 space-y-5">

        <OfflineBanner />

        {showDraftBanner && draftSavedAt && (
          <DraftRestoreBanner savedAt={draftSavedAt} onDismiss={handleDiscardDraft} />
        )}

        {autoSaveError && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Auto-save isn't working (your browser storage may be full or restricted). Please save your draft manually using the button below.</span>
          </div>
        )}

        {categoriesError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="flex-1">{categoriesError}</span>
            <button onClick={() => window.location.reload()} className="flex items-center gap-1 text-xs font-semibold text-red-600 underline hover:text-red-800">
              <RefreshCw className="w-3 h-3" />Refresh
            </button>
          </div>
        )}

        <BannerAlert message={bannerError} onDismiss={() => setBannerError(null)} />

        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/altftool/blogs")} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">New Blog Post</h1>
              {draftSavedAt && !autoSaveError && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />Auto-saved at {fmtTime(draftSavedAt)}</p>
              )}
              {autoSaveError && (
                <p className="text-xs text-amber-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />Auto-save paused — save manually</p>
              )}
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500">○ Draft</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Main column ── */}
            <div className="lg:col-span-2 space-y-5">

              <Section title="Post Details">
                <Field label="Heading" icon={<Type className="w-3.5 h-3.5" />} required error={errors.heading}>
                  <Input name="heading" placeholder="Enter a compelling blog heading…" value={formData.heading} onChange={handleChange} error={errors.heading} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Author" icon={<User className="w-3.5 h-3.5" />} required error={errors.author}>
                    <Input name="author" placeholder="Author name" value={formData.author} onChange={handleChange} error={errors.author} />
                  </Field>
                  <Field label="Display Date" icon={<Calendar className="w-3.5 h-3.5" />} required error={errors.date}>
                    <Input type="date" name="date" value={formData.date} onChange={handleChange} error={errors.date} />
                  </Field>
                </div>
                <Field label="Category" icon={<FileText className="w-3.5 h-3.5" />} required error={errors.category}>
                  <CategorySelector value={formData.category} onChange={(v) => { setFormData((p) => ({ ...p, category: v })); clearError("category"); }} />
                  {errors.category && (
                    <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>
                  )}
                </Field>
                <Field label="Tags" icon={<Hash className="w-3.5 h-3.5" />} hint="Comma separated topics. Example: pdf tools, productivity, students">
                  <Input name="tags" placeholder="Add 3-6 search-friendly tags..." value={formData.tags || ""} onChange={handleChange} />
                </Field>
              </Section>

              <Section title="Trust Metadata">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Author Role" icon={<User className="w-3.5 h-3.5" />} hint="Shown under the author name on public blogs.">
                    <Input name="authorRole" placeholder="AltFTool Editorial, Travel Writer..." value={formData.authorRole || ""} onChange={handleChange} />
                  </Field>
                  <Field label="Reviewed By" icon={<ShieldCheck className="w-3.5 h-3.5" />} hint="Shown in the editorial review badge.">
                    <Input name="reviewedBy" placeholder="AltFTool Editorial Team" value={formData.reviewedBy || ""} onChange={handleChange} />
                  </Field>
                </div>
                <Field label="Editorial Note" icon={<Info className="w-3.5 h-3.5" />} hint="Optional trust note shown in the About this guide card.">
                  <textarea
                    name="editorialNote"
                    rows={3}
                    value={formData.editorialNote || ""}
                    onChange={handleChange}
                    placeholder="Reviewed for accuracy, freshness, and practical usefulness..."
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition resize-none"
                  />
                </Field>
              </Section>

              <Section title="Sources & Review">
                <BlogSourceEditor
                  sourcesText={formData.sourcesText || ""}
                  sourceNotes={formData.sourceNotes || ""}
                  onChange={(fields) => handleApplyWritingFields(fields)}
                />
              </Section>

              <Section title="Button Picker"><CTAButtonPicker onInsert={handleInsertContentBlock} /> <FAQPicker onInsert={handleInsertContentBlock} /></Section>

              <Section title="Content Templates">
                <BlogContentTemplates
                  formData={formData}
                  onApplyTemplate={handleApplyTemplate}
                />
              </Section>

              <Section title="Content Blocks">
                <BlogContentBlocks formData={formData} onInsert={handleInsertContentBlock} />
              </Section>

              <Section title="Content">
                {errors.description && (
                  <p className="flex items-center gap-1 text-xs text-red-500 font-medium -mt-2"><AlertCircle className="w-3 h-3" />{errors.description}</p>
                )}
                <BlogEditor value={formData.description} onChange={(data) => {
                  setFormData((prev) => {
                    const updated = { ...prev, description: data };
                    if (!seoEdited.description) updated.seoDescription = generateExcerpt(data);
                    return updated;
                  });
                  clearError("description");
                }} />
              </Section>

              {/* SEO — collapsible */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button type="button" onClick={() => setSeoExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">SEO Settings</span>
                    <div className="flex gap-1 ml-2">
                      <span className={`w-2 h-2 rounded-full ${errors.seoTitle ? "bg-red-400" : seoTitleStatus.ok ? "bg-green-400" : "bg-amber-400"}`} />
                      <span className={`w-2 h-2 rounded-full ${descOk ? "bg-green-400" : errors.seoDescription ? "bg-red-400" : "bg-amber-400"}`} />
                    </div>
                    {(errors.seoTitle || errors.seoDescription) && !seoExpanded && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Fix required — click to expand</span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs">{seoExpanded ? "▲ Hide" : "▼ Show"}</span>
                </button>

                {seoExpanded && (
                  <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                    <Field label="Meta Title" icon={<Type className="w-3.5 h-3.5" />} required error={errors.seoTitle}
                      hint={!errors.seoTitle && seoTitleLen > 0 ? `${seoTitleLen}/${SEO_TITLE_HARD_MAX} chars · ${seoTitleStatus.label}` : `${seoTitleLen}/${SEO_TITLE_HARD_MAX} chars · Ideal: ${SEO_TITLE_MIN}–${SEO_TITLE_IDEAL_MAX}`}>
                      <Input name="seoTitle" placeholder="Enter meta title (50–60 characters ideal)…" value={formData.seoTitle} onChange={handleChange} error={errors.seoTitle} maxLength={SEO_TITLE_HARD_MAX + 10} />
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full transition-all ${seoTitleStatus.color}`} style={{ width: `${Math.min((seoTitleLen / SEO_TITLE_HARD_MAX) * 100, 100)}%` }} />
                      </div>
                      {seoTitleLen > 0 && <p className="text-[10px] text-gray-400 mt-0.5">Google typically shows ~50–60 characters in search results.</p>}
                    </Field>

                    <Field label="SEO Description" icon={<FileText className="w-3.5 h-3.5" />} required error={errors.seoDescription} hint={`${descLen} chars · aim for 120–160`}>
                      <textarea name="seoDescription" rows={3} placeholder="Auto-filled from content — edit as needed"
                        value={formData.seoDescription} onChange={handleChange}
                        className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition resize-none ${errors.seoDescription ? "border-red-300 focus:ring-red-400/30" : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}`} />
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full transition-all ${descOk ? "bg-green-400" : errors.seoDescription ? "bg-red-400" : "bg-amber-400"}`} style={{ width: `${Math.min((descLen / 160) * 100, 100)}%` }} />
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5">

              {/* Publish card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Publish</h2>
                {step === "uploading" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500"><span>Uploading image…</span><span className="font-semibold tabular-nums">{uploadProgress}%</span></div>
                    <ProgressBar value={uploadProgress} />
                    <button type="button" onClick={handleCancelUpload} className="text-xs text-red-500 hover:text-red-700 font-medium underline">Cancel upload</button>
                  </div>
                )}
                {step === "saving" && <div className="flex items-center gap-2 text-xs text-gray-500"><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />Saving to database…</div>}
                {step === "done"  && <div className="flex items-center gap-2 text-xs text-green-600 font-medium"><CheckCircle2 className="w-4 h-4" />Published! Redirecting…</div>}
                <div className="space-y-2">
                  <button type="button" onClick={handleSaveDraft} disabled={savingDraft || submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50">
                    {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingDraft ? "Saving draft…" : "Save Draft"}
                  </button>
                  <button type="submit" disabled={submitting || step === "done"}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition shadow-sm disabled:opacity-50">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    {submitting ? (step === "uploading" ? `Uploading image… ${uploadProgress}%` : step === "saving" ? "Saving to database…" : "Publishing…") : "Publish Blog"}
                  </button>
                </div>
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-600">{autoSaveError ? "⚠ Auto-save unavailable. Use Save Draft to keep your work." : "Draft is auto-saved locally every 2 seconds."}</p>
                </div>
              </div>

              <BlogPublishQualityGate
                formData={formData}
                imageAlt={imageAlt}
                hasImage={Boolean(imageFile || imagePreview)}
                onGateChange={setPublishGate}
              />

              <BlogLivePreview
                formData={formData}
                imagePreview={imagePreview}
                imageAlt={imageAlt}
              />

              <BlogWritingAssistant
                formData={formData}
                onApplyFields={handleApplyWritingFields}
                onInsertBlock={handleInsertContentBlock}
              />

              <BlogRefreshActions
                formData={formData}
                onApplyFields={handleApplyWritingFields}
                onInsertBlock={handleInsertContentBlock}
              />

              {/* Image card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Featured Image <span className="text-red-400">*</span></h2>

                {!imagePreview ? (
                  <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2.5 cursor-pointer transition-all ${dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]" : errors.image ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
                      <UploadCloud className={`w-5 h-5 ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-700">Drop or <span className="text-blue-500">browse</span></p>
                      <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP · Max 2MB</p>
                    </div>
                    {errors.image && <p className="flex items-center gap-1 text-xs text-red-500 font-medium text-center"><AlertCircle className="w-3 h-3 shrink-0" />{errors.image}</p>}
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <div className="relative group">
                      <img src={imagePreview} alt={imageAlt || "Blog featured image"} className="w-full max-h-44 object-cover bg-gray-100" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button type="button" onClick={removeImage}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                          <Trash2 className="w-3 h-3" />Remove
                        </button>
                      </div>
                    </div>
                    {imageFile && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-gray-200">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-700 truncate">{imageFile.name}</p>
                          <p className="text-[10px] text-gray-400">{fmtSize(imageFile.size)}</p>
                        </div>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      </div>
                    )}
                  </div>
                )}

                {/* Alt text */}
                {(imagePreview || imageFile) && (
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <ALargeSmall className="w-3.5 h-3.5 text-gray-400" />Image Alt Text<span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={imageAlt}
                      onChange={(e) => { setImageAlt(e.target.value); clearError("imageAlt"); setBannerError(null); }}
                      placeholder="Describe the image for screen readers and SEO…" maxLength={150}
                      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${errors.imageAlt ? "border-red-300 focus:ring-red-400/30 focus:border-red-400" : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}`} />
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${altOk ? "bg-green-400" : altLen === 0 ? "bg-gray-200" : "bg-amber-400"}`} style={{ width: `${Math.min((altLen / 125) * 100, 100)}%` }} />
                    </div>
                    {errors.imageAlt ? (
                      <p className="flex items-center gap-1 text-xs text-red-500 font-medium"><AlertCircle className="w-3 h-3 shrink-0" />{errors.imageAlt}</p>
                    ) : (
                      <p className="text-[10px] text-gray-400">{altLen}/125 chars · {altOk ? "Good length" : altLen === 0 ? "Required for accessibility & SEO" : altLen < 5 ? "Too short — be more descriptive" : "Aim for under 125 chars"}</p>
                    )}
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => processFile(e.target.files[0])} className="hidden" />
              </div>

              <BlogSeoChecklist
                formData={formData}
                imageAlt={imageAlt}
                hasImage={Boolean(imageFile || imagePreview)}
              />

              <BlogInternalLinkAssistant
                formData={formData}
                onInsertLinks={handleInsertContentBlock}
              />

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
