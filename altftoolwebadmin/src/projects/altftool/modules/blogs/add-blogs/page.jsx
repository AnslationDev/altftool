"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { emitAlert } from "@/lib/alertBus";
import {
  fetchCategoryNames,
  fetchAllBlogs,
  createBlog,
  updateBlog,
  updateBlogImage,
  uploadBlogImage,
  requestBlogRevalidation,
} from "../services/blogsService";
import { serverTimestamp } from "firebase/firestore";
import CategorySelector from "../components/CategorySelector";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ArrowLeft, Type, User, Calendar, FileText, Search,
  ImageIcon, UploadCloud, Trash2, Globe, Save,
  AlertCircle, CheckCircle2, Loader2, Info, Clock,
  WifiOff, RefreshCw, AlertTriangle, ALargeSmall,
  Hash, ShieldCheck, Eye,
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
import BlogEditorHealthPanel from "../components/BlogEditorHealthPanel";
import BlogRefreshActions from "../components/BlogRefreshActions";
import BlogSourceEditor, { parseSourcesText } from "../components/BlogSourceEditor";
import { appendRefreshBlocks } from "../components/blogRefreshKit";
import BlogPublishPreviewModal, {
  buildBlogChangeSummary,
  buildBlogDuplicateIssues,
  normalizeBlogSlug,
} from "../components/BlogPublishPreviewModal";
import BlogPreviewModal from "../components/BlogPreviewModal";
import BlogValidationPanel, {
  jumpToBlogField,
  revealValidationPanel,
} from "../components/BlogValidationPanel";
import { isFeatureEnabled } from "@/lib/featureFlags";
import EditorActionBar from "../components/EditorActionBar";
import KeyboardShortcutsHelp from "../components/KeyboardShortcutsHelp";
import { useUnsavedGuard, useEditorShortcuts } from "../lib/editorHooks";

const BlogEditor = dynamic(() => import("../components/BlogEditor"), { ssr: false });

const DRAFT_KEY = "blogDraftData";

/* ── helpers ── */
const generateSlug    = (t) => t.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-");
const stripHtml       = (h) => (h || "").replace(/<[^>]+>/g, "");
const generateExcerpt = (html, len = 160) => stripHtml(html).substring(0, len).trim();

const SECTION_BY_CONTENT_ISSUE = {
  body: "blog-section-content",
  faq: "blog-section-button-picker",
  freshness: "blog-section-sources-review",
  heading: "blog-section-post-details",
  image: "blog-section-image",
  links: "blog-section-internal-links",
  seoDescription: "blog-section-seo",
  slug: "blog-section-post-details",
  sources: "blog-section-sources-review",
  taxonomy: "blog-section-post-details",
  trust: "blog-section-trust",
};

/* ── SEO Title validation ── */
const SEO_TITLE_MIN       = 50;
const SEO_TITLE_IDEAL_MAX = 60;
const SEO_TITLE_HARD_MAX  = 60;

const getSeoTitleStatus = (len) => {
  if (len === 0)                    return { color: "bg-surface-soft",  label: "", ok: false };
  if (len < SEO_TITLE_MIN)          return { color: "bg-warning", label: `Too short — aim for ${SEO_TITLE_MIN}–${SEO_TITLE_IDEAL_MAX} chars`, ok: false };
  if (len <= SEO_TITLE_IDEAL_MAX)   return { color: "bg-success", label: "Perfect length", ok: true };
  return                                   { color: "bg-danger",   label: `Too long — will be truncated by Google (max ${SEO_TITLE_HARD_MAX})`, ok: false };
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
      <label className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider">
        {icon && <span className="text-muted">{icon}</span>}{label}
        {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="flex items-center gap-1 text-xs text-danger font-medium"><AlertCircle className="w-3 h-3 shrink-0" />{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-surface placeholder:text-muted focus:outline-none focus:ring-2 transition ${error ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border focus:ring-primary/30 focus:border-primary"}`} />
  );
}

function Section({ title, children, highlighted = false, id }) {
  return (
    <div
      id={id}
      className={`scroll-mt-24 rounded-2xl border bg-surface p-6 shadow-sm transition ${
        highlighted ? "border-primary ring-4 ring-primary" : "border-border"
      } space-y-5`}
    >
      <h2 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
        {title}<span className="flex-1 h-px bg-surface-soft" />
      </h2>
      {children}
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-surface-soft rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${value}%` }} />
    </div>
  );
}

function BannerAlert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-danger-soft border border-danger rounded-2xl px-4 py-3 text-sm text-danger">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
      <div className="flex-1">{message}</div>
      <button onClick={onDismiss} className="text-danger hover:text-danger text-xs font-bold ml-2">✕</button>
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
    <div className="flex items-center gap-2 bg-warning-soft border border-warning rounded-2xl px-4 py-2.5 text-sm text-warning">
      <WifiOff className="w-4 h-4 shrink-0 text-warning" />
      <span>You're offline. Your draft is being saved locally — publishing requires an internet connection.</span>
    </div>
  );
}

function DraftRestoreBanner({ savedAt, onDismiss }) {
  if (!savedAt) return null;
  const age = savedAt ? Math.round((Date.now() - savedAt.getTime()) / 60000) : 0;
  const ageLabel = age < 1 ? "just now" : age === 1 ? "1 minute ago" : `${age} minutes ago`;
  return (
    <div className="flex items-center gap-3 bg-primary-soft border border-primary rounded-2xl px-4 py-2.5 text-sm text-primary">
      <Info className="w-4 h-4 shrink-0 text-primary" />
      <span className="flex-1">We found an unsaved draft from <strong>{ageLabel}</strong>. It has been restored automatically.</span>
      <button onClick={onDismiss} className="text-primary hover:text-primary font-bold text-xs">✕ Discard draft</button>
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
  const [validationLive, setValidationLive]   = useState(false);
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
  const [highlightedSection, setHighlightedSection] = useState("");
  const [blogIndex, setBlogIndex]             = useState({ blogs: [], status: "loading", error: "" });
  const [previewRequest, setPreviewRequest]   = useState(null);
  const [blogPreviewOpen, setBlogPreviewOpen] = useState(false);
  const blogPreviewEnabled = isFeatureEnabled("blog_preview");

  const isHighlighted = (sectionId) => highlightedSection === sectionId;

  const handleJumpToContentIssue = (issueKey) => {
    const sectionId = SECTION_BY_CONTENT_ISSUE[issueKey] || "blog-section-content";
    if (sectionId === "blog-section-seo") setSeoExpanded(true);
    setHighlightedSection(sectionId);
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    window.setTimeout(() => setHighlightedSection((current) => (current === sectionId ? "" : current)), 1800);
  };

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const blogs = await fetchAllBlogs();
        if (mounted) setBlogIndex({ blogs, status: "ready", error: "" });
      } catch (err) {
        console.error("Failed to load blogs for duplicate guard", err);
        if (mounted) setBlogIndex({ blogs: [], status: "error", error: "Could not load existing blogs for duplicate guard." });
      }
    })();
    return () => {
      mounted = false;
    };
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

  /* ── Auto-save draft every 2s ──
     The interval reads the latest values from a ref so it is created once —
     typing no longer tears it down and recreates it on every keystroke — and
     the localStorage write (plus the re-render from setDraftSavedAt) is
     skipped entirely when nothing has changed since the last save. */
  const draftSnapshotRef = useRef({ formData, imagePreview, imageName, imageAlt });
  useEffect(() => {
    draftSnapshotRef.current = { formData, imagePreview, imageName, imageAlt };
  }, [formData, imagePreview, imageName, imageAlt]);

  useEffect(() => {
    let lastSerialized = "";
    const id = setInterval(() => {
      try {
        const payload = JSON.stringify(draftSnapshotRef.current);
        if (payload === lastSerialized) return;
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ ...draftSnapshotRef.current, savedAt: new Date().toISOString() })
        );
        lastSerialized = payload;
        setDraftSavedAt(new Date());
        setAutoSaveError(false);
      } catch (err) {
        setAutoSaveError(true);
        console.warn("Auto-save failed:", err);
      }
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const clearError  = (name) => setErrors((p) => ({ ...p, [name]: undefined }));

  /* ── Debounced editor → form sync ──
     CKEditor fires onChange on every keystroke. Pushing each keystroke into
     formData re-renders every heavy panel (publish gate, content health,
     live preview, SEO checklist) per character, which can freeze the tab and
     trip React's nested-update limit. The editor owns the text while focused,
     so syncing the form ~250ms after typing pauses is lossless. */
  const editorSyncTimerRef = useRef(null);
  const seoEditedRef = useRef(seoEdited);
  useEffect(() => {
    seoEditedRef.current = seoEdited;
  }, [seoEdited]);

  const applyEditorData = useCallback((data) => {
    setFormData((prev) => {
      const updated = { ...prev, description: data };
      if (!seoEditedRef.current.description) updated.seoDescription = generateExcerpt(data);
      return updated;
    });
    setErrors((p) => ({ ...p, description: undefined }));
  }, []);

  const pendingEditorDataRef = useRef(null);
  const handleEditorChange = useCallback(
    (data) => {
      pendingEditorDataRef.current = data;
      if (editorSyncTimerRef.current) window.clearTimeout(editorSyncTimerRef.current);
      editorSyncTimerRef.current = window.setTimeout(() => {
        editorSyncTimerRef.current = null;
        pendingEditorDataRef.current = null;
        applyEditorData(data);
      }, 250);
    },
    [applyEditorData]
  );

  /* Flush any editor keystrokes still waiting in the debounce window so that
     saving/publishing right after typing never drops the last edits. */
  const flushEditorSync = useCallback(() => {
    if (editorSyncTimerRef.current) {
      window.clearTimeout(editorSyncTimerRef.current);
      editorSyncTimerRef.current = null;
    }
    if (pendingEditorDataRef.current != null) {
      const data = pendingEditorDataRef.current;
      pendingEditorDataRef.current = null;
      applyEditorData(data);
    }
  }, [applyEditorData]);

  useEffect(
    () => () => {
      if (editorSyncTimerRef.current) window.clearTimeout(editorSyncTimerRef.current);
    },
    []
  );

  const handleInsertContentBlock = (payload) => {
    setFormData((prev) => ({
      ...prev,
      description:
        payload && typeof payload === "object" && "description" in payload
          ? payload.description
          : `${prev.description || ""}${prev.description?.trim() ? "\n\n" : ""}${payload}`,
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

  const handleApplyTemplate = ({ html = "", fields = {}, description } = {}) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
      description:
        typeof description === "string"
          ? description
          : `${prev.description || ""}${prev.description?.trim() ? "\n\n" : ""}${html}`,
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

  const handleApplyQuickFix = (payload = {}, action = {}) => {
    if (!payload.hasWork) {
      emitAlert({ type: "info", message: "No content-health changes were needed for this action." });
      return;
    }

    const blockResult = appendRefreshBlocks(formData.description, payload.blocks || []);

    setFormData((prev) => ({
      ...prev,
      ...payload.fields,
      description: blockResult.description,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(payload.fields || {}).forEach((key) => {
        next[key] = undefined;
      });
      if (blockResult.addedCount > 0) next.description = undefined;
      return next;
    });
    if (payload.expandSeo) setSeoExpanded(true);
    if ("seoTitle" in (payload.fields || {})) setSeoEdited((prev) => ({ ...prev, title: true }));
    if ("seoDescription" in (payload.fields || {})) setSeoEdited((prev) => ({ ...prev, description: true }));
    setBannerError(null);

    const label = payload.label || action.label || "Content health fix";
    const suffix = blockResult.addedCount
      ? ` ${blockResult.addedCount} content block${blockResult.addedCount === 1 ? "" : "s"} added.`
      : blockResult.skippedCount
        ? " Existing content blocks were already present."
        : "";
    emitAlert({ type: "success", message: `${label} applied. Review and publish when ready.${suffix}` });
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
  // Pure rule set — used by validate() on publish AND by the live
  // re-validation effect that keeps the validation panel updated in
  // real time after the first publish attempt.
  const computeValidationErrors = useCallback(() => {
    const e = {};
    if (!formData.heading.trim())       e.heading       = VALIDATION_MESSAGES.heading;
    if (!formData.author.trim())        e.author        = VALIDATION_MESSAGES.author;
    if (!formData.date)                 e.date          = VALIDATION_MESSAGES.date;
    if (!(pendingEditorDataRef.current ?? formData.description)) e.description = VALIDATION_MESSAGES.description;
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

    return e;
  }, [formData, imageFile, imagePreview, imageAlt, categories]);

  const validate = () => {
    const e = computeValidationErrors();
    setErrors(e);
    setValidationLive(true);
    if (e.seoTitle || e.seoDescription) setSeoExpanded(true);

    const errorCount = Object.keys(e).length;
    if (errorCount > 0) {
      const noun = errorCount === 1 ? "1 field needs" : `${errorCount} fields need`;
      emitAlert({ type: "error", message: `${noun} your attention before publishing. Please scroll up to check the highlighted fields.` });
      revealValidationPanel();
    }
    return errorCount === 0;
  };

  /* Live re-validation: after the first publish attempt, the validation
     panel and field errors track every change instantly. Never active
     before the first attempt, so the existing publish workflow and the
     untouched-form experience stay exactly the same. */
  useEffect(() => {
    if (!validationLive) return;
    setErrors(computeValidationErrors());
  }, [validationLive, computeValidationErrors]);

  /* Click-to-fix: scroll to, expand (SEO), highlight, and focus the field —
     including the CKEditor editable (or its raw-HTML fallback). */
  const handleJumpToValidationField = (fieldKey) => {
    jumpToBlogField(fieldKey, {
      onExpandSeo: () => setSeoExpanded(true),
      onHighlightSection: (sectionId) => {
        setHighlightedSection(sectionId);
        window.setTimeout(
          () => setHighlightedSection((current) => (current === sectionId ? "" : current)),
          1800
        );
      },
    });
  };

  const ensurePublishGateReady = ({ confirmWarnings = true } = {}) => {
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
    if (confirmWarnings && warnings.length > 0) {
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

  const openSavePreview = (status = "published") => {
    flushEditorSync();
    setBannerError(null);
    if ((status === "published" && submitting) || (status !== "published" && savingDraft)) return;
    if (status === "published" && !validate()) return;
    if (status === "published" && !ensurePublishGateReady({ confirmWarnings: false })) return;

    if (blogIndex.status === "loading") {
      const msg = "Duplicate guard is still loading existing blogs. Please wait a moment and try again.";
      setBannerError(msg);
      emitAlert({ type: "warning", message: msg });
      return;
    }

    if (blogIndex.status === "error") {
      const msg = blogIndex.error || "Duplicate guard could not load existing blogs. Please refresh and try again.";
      setBannerError(msg);
      emitAlert({ type: "error", message: msg });
      return;
    }

    const finalSlug = normalizeBlogSlug(formData.heading || (status === "published" ? "untitled" : "draft"));
    const duplicateIssues = buildBlogDuplicateIssues({
      blogs: blogIndex.blogs,
      heading: formData.heading || "Untitled Draft",
      slug: finalSlug,
    });

    setPreviewRequest({
      changedFields: buildBlogChangeSummary({
        current: formData,
        imageAlt,
        imageChanged: Boolean(imageFile || imagePreview),
        mode: "create",
      }),
      duplicateIssues,
      finalSlug,
      status,
    });

    if (duplicateIssues.length) {
      emitAlert({ type: "error", message: "Duplicate title or slug found. Review the preview before saving." });
    }
  };

  /* ── Publish ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    openSavePreview("published");
  };

  const executePublish = async () => {
    if (submitting) return;

    if (!navigator.onLine) {
      const msg = "You're offline. Please reconnect before publishing.";
      setBannerError(msg); emitAlert({ type: "error", message: msg }); return;
    }

    setPreviewRequest((current) => (current ? { ...current, pending: true } : current));
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
          // Create as a draft first; we only flip to published AFTER the image
          // uploads and attaches. If the upload fails the post stays a private
          // draft instead of a public, image-less published post.
          views: 0, likesCount: 0, commentsCount: 0, feedbackCount: 0, helpfulCount: 0, notHelpfulCount: 0, status: "draft",
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
        // Attach the image AND go live in one write.
        await updateBlog(blogRef.id, { image: imageUrl, status: "published" });
      } catch (err) {
        const msg = "Image uploaded but publishing failed — the post was saved as a draft. Open it to finish publishing.";
        setBannerError(msg); emitAlert({ type: "warning", message: msg });
        console.error("Publish update failed:", err);
        setSubmitting(false); setStep("idle"); return;
      }

      logAuditEvent({
        module: "blogs", action: "BLOG_CREATE", entityType: "blog", entityId: blogRef.id,
        summary: `Published blog "${formData.heading.trim()}"`,
        changes: { status: "published", category: formData.category, author: formData.author.trim() },
        route: "/altftool/blogs/add-blogs",
      });

      setStep("done");
      localStorage.removeItem(DRAFT_KEY);
      setPreviewRequest(null);
      // Push the new post live immediately (no-op unless revalidation is configured).
      requestBlogRevalidation(slug);
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

  const confirmPreviewSubmit = async () => {
    if (!previewRequest || previewRequest.duplicateIssues?.length) return;
    if (previewRequest.status === "published") {
      await executePublish();
    } else {
      await executeSaveDraft();
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
  const executeSaveDraft = async () => {
    if (savingDraft) return;
    if (!navigator.onLine) {
      emitAlert({ type: "warning", message: "You're offline. Your draft has been saved locally and will sync when you reconnect." });
      return;
    }
    setPreviewRequest((current) => (current ? { ...current, pending: true } : current));
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
      setPreviewRequest(null);
      emitAlert({ type: "success", message: "Draft saved successfully!" });
      router.push("/altftool/blogs");
    } catch (err) {
      console.error("Draft save failed:", err);
      emitAlert({ type: "error", message: getFriendlyError(err, "draft") });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSaveDraft = () => openSavePreview("draft");

  /* ── Editor shell: unsaved guard + keyboard shortcuts ── */
  const [showShortcuts, setShowShortcuts] = useState(false);
  const isDirty = Boolean((formData.heading || "").trim() || (formData.description || "").trim());
  useUnsavedGuard(isDirty && !submitting);

  const addShortcutRef = useRef({});
  addShortcutRef.current = {
    save: () => handleSaveDraft(),
    publish: () => openSavePreview("published"),
    help: () => setShowShortcuts(true),
  };
  const addShortcutMap = useMemo(() => ({
    "mod+s": () => addShortcutRef.current.save(),
    "mod+enter": () => addShortcutRef.current.publish(),
    "mod+/": () => addShortcutRef.current.help(),
  }), []);
  useEditorShortcuts(addShortcutMap);

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
        <BlogPublishPreviewModal
          open={Boolean(previewRequest)}
          mode={previewRequest?.status || "published"}
          formData={formData}
          finalSlug={previewRequest?.finalSlug || normalizeBlogSlug(formData.heading)}
          changedFields={previewRequest?.changedFields || []}
          duplicateIssues={previewRequest?.duplicateIssues || []}
          publishGate={publishGate}
          pending={Boolean(previewRequest?.pending || submitting || savingDraft)}
          onCancel={() => setPreviewRequest(null)}
          onConfirm={confirmPreviewSubmit}
        />
        <BlogPreviewModal
          open={blogPreviewEnabled && blogPreviewOpen}
          formData={formData}
          imagePreview={imagePreview}
          imageAlt={imageAlt}
          onClose={() => setBlogPreviewOpen(false)}
        />

        <OfflineBanner />

        {showDraftBanner && draftSavedAt && (
          <DraftRestoreBanner savedAt={draftSavedAt} onDismiss={handleDiscardDraft} />
        )}

        {autoSaveError && (
          <div className="flex items-center gap-2 bg-warning-soft border border-warning rounded-2xl px-4 py-2.5 text-sm text-warning">
            <AlertCircle className="w-4 h-4 shrink-0 text-warning" />
            <span>Auto-save isn't working (your browser storage may be full or restricted). Please save your draft manually using the button below.</span>
          </div>
        )}

        {categoriesError && (
          <div className="flex items-center gap-2 bg-danger-soft border border-danger rounded-2xl px-4 py-2.5 text-sm text-danger">
            <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
            <span className="flex-1">{categoriesError}</span>
            <button onClick={() => window.location.reload()} className="flex items-center gap-1 text-xs font-semibold text-danger underline hover:text-danger">
              <RefreshCw className="w-3 h-3" />Refresh
            </button>
          </div>
        )}

        <BannerAlert message={bannerError} onDismiss={() => setBannerError(null)} />

        <BlogValidationPanel
          errors={errors}
          attempted={validationLive}
          onJump={handleJumpToValidationField}
        />

        {/* Top bar */}
        <EditorActionBar
          title="New Blog Post"
          onBack={() => router.push("/altftool/blogs")}
          status={autoSaveError ? "error" : draftSavedAt ? "saved" : isDirty ? "dirty" : "idle"}
          savedLabel={autoSaveError ? "Auto-save paused — save manually" : draftSavedAt ? `Auto-saved at ${fmtTime(draftSavedAt)}` : ""}
          onSave={handleSaveDraft}
          onShortcuts={() => setShowShortcuts(true)}
          primaryLabel="Publish"
          onPrimary={() => openSavePreview("published")}
          busy={submitting || savingDraft}
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Main column ── */}
            <div className="lg:col-span-2 space-y-5">

              <Section title="Post Details" id="blog-section-post-details" highlighted={isHighlighted("blog-section-post-details")}>
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
                    <p className="flex items-center gap-1 text-xs text-danger font-medium mt-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>
                  )}
                </Field>
                <Field label="Tags" icon={<Hash className="w-3.5 h-3.5" />} hint="Comma separated topics. Example: pdf tools, productivity, students">
                  <Input name="tags" placeholder="Add 3-6 search-friendly tags..." value={formData.tags || ""} onChange={handleChange} />
                </Field>
              </Section>

              <Section title="Trust Metadata" id="blog-section-trust" highlighted={isHighlighted("blog-section-trust")}>
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
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-surface placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                  />
                </Field>
              </Section>

              <Section title="Sources & Review" id="blog-section-sources-review" highlighted={isHighlighted("blog-section-sources-review")}>
                <BlogSourceEditor
                  sourcesText={formData.sourcesText || ""}
                  sourceNotes={formData.sourceNotes || ""}
                  onChange={(fields) => handleApplyWritingFields(fields)}
                />
              </Section>

              <Section title="Button Picker" id="blog-section-button-picker" highlighted={isHighlighted("blog-section-button-picker")}><CTAButtonPicker onInsert={handleInsertContentBlock} /> <FAQPicker onInsert={handleInsertContentBlock} /></Section>

              <Section title="Content Templates">
                <BlogContentTemplates
                  formData={formData}
                  onApplyTemplate={handleApplyTemplate}
                />
              </Section>

              <Section title="Content Blocks">
                <BlogContentBlocks formData={formData} onInsert={handleInsertContentBlock} />
              </Section>

              <Section title="Content" id="blog-section-content" highlighted={isHighlighted("blog-section-content")}>
                {errors.description && (
                  <p className="flex items-center gap-1 text-xs text-danger font-medium -mt-2"><AlertCircle className="w-3 h-3" />{errors.description}</p>
                )}
                <BlogEditor value={formData.description} onChange={handleEditorChange} draftKey="altftool-blog-new" />
              </Section>

              {/* SEO — collapsible */}
              <div
                id="blog-section-seo"
                className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-surface shadow-sm transition ${
                  isHighlighted("blog-section-seo") ? "border-primary ring-4 ring-primary" : "border-border"
                }`}
              >
                <button type="button" onClick={() => setSeoExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-soft transition">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted" />
                    <span className="text-xs font-black text-muted uppercase tracking-widest">SEO Settings</span>
                    <div className="flex gap-1 ml-2">
                      <span className={`w-2 h-2 rounded-full ${errors.seoTitle ? "bg-danger" : seoTitleStatus.ok ? "bg-success" : "bg-warning"}`} />
                      <span className={`w-2 h-2 rounded-full ${descOk ? "bg-success" : errors.seoDescription ? "bg-danger" : "bg-warning"}`} />
                    </div>
                    {(errors.seoTitle || errors.seoDescription) && !seoExpanded && (
                      <span className="text-[10px] font-bold text-danger bg-danger-soft px-1.5 py-0.5 rounded">Fix required — click to expand</span>
                    )}
                  </div>
                  <span className="text-muted text-xs">{seoExpanded ? "▲ Hide" : "▼ Show"}</span>
                </button>

                {seoExpanded && (
                  <div className="px-6 pb-6 space-y-4 border-t border-border">
                    <Field label="Meta Title" icon={<Type className="w-3.5 h-3.5" />} required error={errors.seoTitle}
                      hint={!errors.seoTitle && seoTitleLen > 0 ? `${seoTitleLen}/${SEO_TITLE_HARD_MAX} chars · ${seoTitleStatus.label}` : `${seoTitleLen}/${SEO_TITLE_HARD_MAX} chars · Ideal: ${SEO_TITLE_MIN}–${SEO_TITLE_IDEAL_MAX}`}>
                      <Input name="seoTitle" placeholder="Enter meta title (50–60 characters ideal)…" value={formData.seoTitle} onChange={handleChange} error={errors.seoTitle} maxLength={SEO_TITLE_HARD_MAX + 10} />
                      <div className="h-1 bg-surface-soft rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full transition-all ${seoTitleStatus.color}`} style={{ width: `${Math.min((seoTitleLen / SEO_TITLE_HARD_MAX) * 100, 100)}%` }} />
                      </div>
                      {seoTitleLen > 0 && <p className="text-[10px] text-muted mt-0.5">Google typically shows ~50–60 characters in search results.</p>}
                    </Field>

                    <Field label="SEO Description" icon={<FileText className="w-3.5 h-3.5" />} required error={errors.seoDescription} hint={`${descLen} chars · aim for 120–160`}>
                      <textarea name="seoDescription" rows={3} placeholder="Auto-filled from content — edit as needed"
                        value={formData.seoDescription} onChange={handleChange}
                        className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-surface placeholder:text-muted focus:outline-none focus:ring-2 transition resize-none ${errors.seoDescription ? "border-danger focus:ring-danger/30" : "border-border focus:ring-primary/30 focus:border-primary"}`} />
                      <div className="h-1 bg-surface-soft rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full transition-all ${descOk ? "bg-success" : errors.seoDescription ? "bg-danger" : "bg-warning"}`} style={{ width: `${Math.min((descLen / 160) * 100, 100)}%` }} />
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5">

              {/* Publish card */}
              <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-4">
                <h2 className="text-xs font-black text-muted uppercase tracking-widest">Publish</h2>
                {step === "uploading" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted"><span>Uploading image…</span><span className="font-semibold tabular-nums">{uploadProgress}%</span></div>
                    <ProgressBar value={uploadProgress} />
                    <button type="button" onClick={handleCancelUpload} className="text-xs text-danger hover:text-danger font-medium underline">Cancel upload</button>
                  </div>
                )}
                {step === "saving" && <div className="flex items-center gap-2 text-xs text-muted"><Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />Saving to database…</div>}
                {step === "done"  && <div className="flex items-center gap-2 text-xs text-success font-medium"><CheckCircle2 className="w-4 h-4" />Published! Redirecting…</div>}
                <div className="space-y-2">
                  <button type="button" onClick={handleSaveDraft} disabled={savingDraft || submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold border border-border rounded-xl text-foreground bg-surface hover:bg-surface-soft transition disabled:opacity-50">
                    {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingDraft ? "Saving draft…" : "Save Draft"}
                  </button>
                  {blogPreviewEnabled && (
                    <button type="button" onClick={() => setBlogPreviewOpen(true)} disabled={submitting || savingDraft}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold border border-primary rounded-xl text-primary bg-primary-soft hover:bg-primary-soft transition disabled:opacity-50">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  )}
                  <button type="submit" disabled={submitting || step === "done"}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-primary hover:bg-primary text-primary-foreground rounded-xl transition shadow-sm disabled:opacity-50">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    {submitting ? (step === "uploading" ? `Uploading image… ${uploadProgress}%` : step === "saving" ? "Saving to database…" : "Publishing…") : "Publish Blog"}
                  </button>
                </div>
                <div className="flex items-start gap-2 bg-primary-soft border border-primary rounded-xl px-3 py-2.5">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-primary">{autoSaveError ? "⚠ Auto-save unavailable. Use Save Draft to keep your work." : "Draft is auto-saved locally every 2 seconds."}</p>
                </div>
              </div>

              <BlogPublishQualityGate
                formData={formData}
                imageAlt={imageAlt}
                hasImage={Boolean(imageFile || imagePreview)}
                onGateChange={setPublishGate}
              />

              <BlogEditorHealthPanel
                formData={formData}
                imageAlt={imageAlt}
                hasImage={Boolean(imageFile || imagePreview)}
                onApplyQuickFix={handleApplyQuickFix}
                onJumpToIssue={handleJumpToContentIssue}
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
              <div
                id="blog-section-image"
                className={`scroll-mt-24 space-y-3 rounded-2xl border bg-surface p-5 shadow-sm transition ${
                  isHighlighted("blog-section-image") ? "border-primary ring-4 ring-primary" : "border-border"
                }`}
              >
                <h2 className="text-xs font-black text-muted uppercase tracking-widest">Featured Image <span className="text-danger">*</span></h2>

                {!imagePreview ? (
                  <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    data-image-dropzone tabIndex={-1} role="button" aria-label="Upload featured image"
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2.5 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-danger ${dragOver ? "border-primary bg-primary-soft scale-[1.01]" : errors.image ? "border-danger bg-danger-soft/30" : "border-border hover:border-primary hover:bg-surface-soft"}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${dragOver ? "bg-primary-soft" : "bg-surface-soft"}`}>
                      <UploadCloud className={`w-5 h-5 ${dragOver ? "text-primary" : "text-muted"}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-foreground">Drop or <span className="text-primary">browse</span></p>
                      <p className="text-[10px] text-muted mt-0.5">JPG, PNG, WebP · Max 2MB</p>
                    </div>
                    {errors.image && <p className="flex items-center gap-1 text-xs text-danger font-medium text-center"><AlertCircle className="w-3 h-3 shrink-0" />{errors.image}</p>}
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-border">
                    <div className="relative group">
                      <img src={imagePreview} alt={imageAlt || "Blog featured image"} className="w-full max-h-44 object-cover bg-surface-soft" />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button type="button" onClick={removeImage}
                          className="flex items-center gap-1 bg-danger hover:bg-danger text-danger-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                          <Trash2 className="w-3 h-3" />Remove
                        </button>
                      </div>
                    </div>
                    {imageFile && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-surface border-t border-border">
                        <ImageIcon className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">{imageFile.name}</p>
                          <p className="text-[10px] text-muted">{fmtSize(imageFile.size)}</p>
                        </div>
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                      </div>
                    )}
                  </div>
                )}

                {/* Alt text */}
                {(imagePreview || imageFile) && (
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider">
                      <ALargeSmall className="w-3.5 h-3.5 text-muted" />Image Alt Text<span className="text-danger">*</span>
                    </label>
                    <input type="text" id="blog-image-alt-input" value={imageAlt}
                      onChange={(e) => { setImageAlt(e.target.value); clearError("imageAlt"); setBannerError(null); }}
                      placeholder="Describe the image for screen readers and SEO…" maxLength={150}
                      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-surface placeholder:text-muted focus:outline-none focus:ring-2 transition ${errors.imageAlt ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border focus:ring-primary/30 focus:border-primary"}`} />
                    <div className="h-1 bg-surface-soft rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${altOk ? "bg-success" : altLen === 0 ? "bg-surface-soft" : "bg-warning"}`} style={{ width: `${Math.min((altLen / 125) * 100, 100)}%` }} />
                    </div>
                    {errors.imageAlt ? (
                      <p className="flex items-center gap-1 text-xs text-danger font-medium"><AlertCircle className="w-3 h-3 shrink-0" />{errors.imageAlt}</p>
                    ) : (
                      <p className="text-[10px] text-muted">{altLen}/125 chars · {altOk ? "Good length" : altLen === 0 ? "Required for accessibility & SEO" : altLen < 5 ? "Too short — be more descriptive" : "Aim for under 125 chars"}</p>
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

              <div
                id="blog-section-internal-links"
                className={`scroll-mt-24 rounded-2xl transition ${
                  isHighlighted("blog-section-internal-links") ? "ring-4 ring-primary" : ""
                }`}
              >
                <BlogInternalLinkAssistant
                  formData={formData}
                  onInsertLinks={handleInsertContentBlock}
                />
              </div>

            </div>
          </div>
        </form>
      </div>

      <KeyboardShortcutsHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
