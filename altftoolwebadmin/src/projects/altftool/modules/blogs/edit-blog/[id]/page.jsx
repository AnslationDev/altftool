"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { emitAlert } from "@/lib/alertBus";
import { getAdminRouteId } from "@/lib/adminRouteParams";
import {
  fetchAllBlogs,
  fetchBlogById,
  updateBlog,
  updateBlogWorkflow,
  saveBlogRevision,
  requestBlogRevalidation,
  uploadBlogImage,
} from "../../services/blogsService";
import { WORKFLOW, statusForWorkflow } from "../../lib/workflow";
import { useAutosave, useUnsavedGuard, useEditorShortcuts, formatSavedLabel } from "../../lib/editorHooks";
import EditorActionBar from "../../components/EditorActionBar";
import WorkflowStatusControl from "../../components/WorkflowStatusControl";
import BlogHistoryDrawer from "../../components/BlogHistoryDrawer";
import KeyboardShortcutsHelp from "../../components/KeyboardShortcutsHelp";
import { serverTimestamp } from "firebase/firestore";
import CategorySelector from "../../components/CategorySelector";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ArrowLeft, Save, Globe, Type, User, Calendar,
  Search, FileText, ImageIcon, UploadCloud, Trash2,
  CheckCircle2, Loader2, AlertCircle, Eye,
  Info, WifiOff, AlertTriangle, ALargeSmall,
  Hash,
  ShieldCheck,
} from "lucide-react";
import CTAButtonPicker from "../../components/CtaButtonPicker";
import FAQPicker from "../../components/FAQCreator";
import BlogInternalLinkAssistant from "../../components/BlogInternalLinkAssistant";
import BlogPublishQualityGate from "../../components/BlogPublishQualityGate";
import BlogSeoChecklist, { parseBlogTags } from "../../components/BlogSeoChecklist";
import BlogLivePreview from "../../components/BlogLivePreview";
import BlogWritingAssistant from "../../components/BlogWritingAssistant";
import BlogContentBlocks from "../../components/BlogContentBlocks";
import BlogContentTemplates from "../../components/BlogContentTemplates";
import BlogEditorHealthPanel from "../../components/BlogEditorHealthPanel";
import BlogQuickFixPanel from "../../components/BlogQuickFixPanel";
import BlogRefreshActions from "../../components/BlogRefreshActions";
import BlogSourceEditor, { formatSourcesText, parseSourcesText } from "../../components/BlogSourceEditor";
import { appendRefreshBlocks, buildQuickRefreshPayload } from "../../components/blogRefreshKit";
import BlogPublishPreviewModal, {
  buildBlogChangeSummary,
  buildBlogDuplicateIssues,
  normalizeBlogSlug,
} from "../../components/BlogPublishPreviewModal";

const BlogEditor = dynamic(() => import("../../components/BlogEditor"), { ssr: false });

/* ── SEO Title validation ── */
const SEO_TITLE_MIN       = 50;
const SEO_TITLE_IDEAL_MAX = 60;
const SEO_TITLE_HARD_MAX  = 60;

const getSeoTitleStatus = (len) => {
  if (len === 0)                  return { color: "bg-gray-200",  label: "", ok: false };
  if (len < SEO_TITLE_MIN)        return { color: "bg-amber-400", label: `Too short — aim for ${SEO_TITLE_MIN}–${SEO_TITLE_IDEAL_MAX} chars`, ok: false };
  if (len <= SEO_TITLE_IDEAL_MAX) return { color: "bg-green-400", label: "Perfect length", ok: true };
  return                                 { color: "bg-red-400",   label: `Too long — will be truncated by Google (max ${SEO_TITLE_HARD_MAX})`, ok: false };
};

/* ── Friendly error translator ── */
function getFriendlyError(err, context = "general") {
  if (!navigator.onLine) return "You're offline. Please check your internet connection and try again.";
  const code    = err?.code    || "";
  const message = err?.message || "";
  if (context === "upload") {
    if (code === "storage/canceled")               return "Upload was cancelled. Try saving again.";
    if (code === "storage/retry-limit-exceeded")   return "Upload failed after several attempts — your connection may be too slow. Try again.";
    if (code === "storage/quota-exceeded")         return "Storage quota exceeded. Please contact your administrator.";
    if (code === "storage/unauthenticated" || code === "storage/unauthorized") return "You don't have permission to upload files. Try logging out and back in.";
    if (code === "storage/invalid-checksum")       return "The image file was corrupted during upload. Please select the image again and retry.";
    if (code === "storage/server-file-wrong-size") return "Something went wrong uploading the image. Please try again.";
    if (code === "storage/object-not-found")       return "Upload destination not found. Please contact support.";
    if (message.includes("network") || code === "storage/unknown") return "Upload failed due to a network problem. Check your connection and try again.";
    return "Image upload failed. Please try again.";
  }
  if (context === "firestore") {
    if (code === "permission-denied" || code === "firestore/permission-denied") return "You don't have permission to update this blog. Please contact your administrator.";
    if (code === "unavailable" || code === "firestore/unavailable")             return "The database is temporarily unavailable. Please wait a moment and try again.";
    if (code === "deadline-exceeded" || code === "firestore/deadline-exceeded") return "Saving timed out — your connection might be slow. Please try again.";
    if (code === "resource-exhausted" || code === "firestore/resource-exhausted") return "Too many requests. Please wait a few seconds and try again.";
    if (code === "unauthenticated" || code === "firestore/unauthenticated")     return "Your session has expired. Please log out and log back in, then try again.";
    if (code === "not-found" || code === "firestore/not-found")                 return "This blog post no longer exists — it may have been deleted.";
    if (message.includes("network") || message.includes("Failed to fetch"))    return "Network error while saving. Please check your internet and try again.";
    return "Failed to save to the database. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

/* ── Validation messages ── */
const VALIDATION_MESSAGES = {
  heading:       "Please enter a heading for your blog post.",
  description:   "Please write some content for your blog post.",
  imageAlt:      "Please enter alt text for the featured image (required for accessibility and SEO).",
  seoTitleEmpty: "Please enter a meta title (used as the browser tab title and in Google search results).",
  seoTitleShort: (len) => `Meta title is too short (${len} chars). Aim for at least ${SEO_TITLE_MIN} characters so Google shows it fully.`,
  seoTitleLong:  (len) => `Meta title is too long (${len} chars). Google will cut it off after ${SEO_TITLE_HARD_MAX} characters.`,
};

const IMAGE_MESSAGES = {
  wrongType: "That file isn't an image. Please select a JPG, PNG, or WebP file.",
  tooLarge:  (size) => `This image is ${size} — it must be under 2MB. Please resize or compress it first.`,
};

/* ── UI primitives ── */
function Field({ label, hint, error, icon, required, children }) {
  return (
    <div className="space-y-1.5">
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

function Section({ title, children, highlighted = false, id }) {
  return (
    <div
      id={id}
      className={`scroll-mt-24 rounded-2xl border bg-white p-6 shadow-sm transition ${
        highlighted ? "border-blue-200 ring-4 ring-blue-100" : "border-gray-100"
      } space-y-5`}
    >
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
      <span>You're offline. Changes cannot be saved — please reconnect before publishing or saving.</span>
    </div>
  );
}

const generateSlug = (t) => t.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-");
const stripHtml    = (h) => (h || "").replace(/<[^>]+>/g, "");
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
const normalizeDateValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000).toISOString();
  return "";
};

/* ════════════════════════════════════
   Main Page
════════════════════════════════════ */
export default function EditBlog() {
  const router     = useRouter();
  const params     = useParams();
  const pathname   = usePathname();
  const id         = getAdminRouteId(params, pathname);
  const searchParams = useSearchParams();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    heading: "", category: "", author: "", date: "",
    description: "", seoTitle: "", seoDescription: "", image: "", status: "draft",
    workflowState: "", publishAt: null,
    tags: "", authorRole: "", reviewedBy: "", editorialNote: "",
    reviewedAt: "", sourcesText: "", sourceNotes: "",
  });
  const [imageAlt, setImageAlt]           = useState("");
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState("");
  const [imageName, setImageName]         = useState("");
  const [dragOver, setDragOver]           = useState(false);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep]       = useState("idle");
  const [uploadTask, setUploadTask]       = useState(null);
  const [errors, setErrors]               = useState({});
  const [seoExpanded, setSeoExpanded]     = useState(false);
  const [bannerError, setBannerError]     = useState(null);
  const [quickActionApplied, setQuickActionApplied] = useState(false);
  const [publishGate, setPublishGate]     = useState(null);
  const [highlightedSection, setHighlightedSection] = useState("");
  const [originalSnapshot, setOriginalSnapshot] = useState(null);
  const [blogIndex, setBlogIndex]         = useState({ blogs: [], status: "loading", error: "" });
  const [previewRequest, setPreviewRequest] = useState(null);
  const [showHistory, setShowHistory]     = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [workflowBusy, setWorkflowBusy]   = useState(false);

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

  /* ── Load blog ── */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setBannerError("Missing blog id in the route. Please open this post from the blog list again.");
      return;
    }
    (async () => {
      try {
        const data = await fetchBlogById(id);
        if (!data) {
          emitAlert({ type: "error", message: "Blog not found." });
          router.push("/altftool/blogs"); return;
        }
        const loadedForm = {
          heading: data.heading || "", category: data.category || "", author: data.author || "",
          date: data.date || "", description: data.description || "", seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "", image: data.image || "", status: data.status || "draft",
          workflowState: data.workflowState || "", publishAt: data.publishAt || null,
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
          authorRole: data.authorRole || "",
          reviewedBy: data.reviewedBy || "",
          editorialNote: data.editorialNote || "",
          reviewedAt: normalizeDateValue(data.reviewedAt),
          sourcesText: formatSourcesText(data.sources || data.citations || ""),
          sourceNotes: data.sourceNotes || "",
        };
        setFormData(loadedForm);
        setImageAlt(data.imageAlt || "");
        setOriginalSnapshot({ ...loadedForm, imageAlt: data.imageAlt || "", image: data.image || "" });
        if (data.image) { setImagePreview(data.image); setImageName("Current image"); }
      } catch (err) {
        console.error(err);
        const msg = getFriendlyError(err, "firestore");
        emitAlert({ type: "error", message: msg }); setBannerError(msg);
      } finally { setLoading(false); }
    })();
  }, [id]); // eslint-disable-line

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

  useEffect(() => {
    if (loading || quickActionApplied) return;

    const quickAction = searchParams.get("refreshAction") || searchParams.get("action");
    if (!quickAction) return;

    const payload = buildQuickRefreshPayload(quickAction, formData);
    if (!payload.hasWork) return;

    setFormData((prev) => ({
      ...prev,
      ...payload.fields,
      description: appendRefreshBlocks(prev.description, payload.blocks).description,
    }));
    if (payload.expandSeo) setSeoExpanded(true);
    setQuickActionApplied(true);
    setBannerError(null);
    emitAlert({ type: "success", message: `${payload.label} loaded. Review and save the post.` });
  }, [loading, quickActionApplied]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setErrors((p) => ({ ...p, image: undefined }));
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
    setFormData((p) => ({ ...p, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInsertContentBlock = (html) => {
    setFormData((prev) => ({
      ...prev,
      description: `${prev.description || ""}${prev.description?.trim() ? "\n\n" : ""}${html}`,
    }));
    setErrors((prev) => ({ ...prev, description: undefined }));
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
    setBannerError(null);
  };

  const handleApplyQuickFix = (payload = {}, action = {}) => {
    if (!payload.hasWork) {
      emitAlert({ type: "info", message: "No quick-fix changes were needed for this action." });
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
    setBannerError(null);

    const label = payload.label || action.label || "Quick fix";
    const suffix = blockResult.addedCount
      ? ` ${blockResult.addedCount} content block${blockResult.addedCount === 1 ? "" : "s"} added.`
      : blockResult.skippedCount
        ? " Existing content blocks were already present."
        : "";
    emitAlert({ type: "success", message: `${label} applied. Review and save the post.${suffix}` });
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
    setBannerError(null);
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!formData.heading.trim()) e.heading = VALIDATION_MESSAGES.heading;
    if (!formData.description)    e.description = VALIDATION_MESSAGES.description;
    if ((imageFile || imagePreview) && !imageAlt.trim()) e.imageAlt = VALIDATION_MESSAGES.imageAlt;

    const seoTitleLen = formData.seoTitle.trim().length;
    if (!formData.seoTitle.trim())          e.seoTitle = VALIDATION_MESSAGES.seoTitleEmpty;
    else if (seoTitleLen < SEO_TITLE_MIN)   e.seoTitle = VALIDATION_MESSAGES.seoTitleShort(seoTitleLen);
    else if (seoTitleLen > SEO_TITLE_HARD_MAX) e.seoTitle = VALIDATION_MESSAGES.seoTitleLong(seoTitleLen);

    setErrors(e);
    if (e.seoTitle) setSeoExpanded(true);

    const errorCount = Object.keys(e).length;
    if (errorCount > 0) {
      const noun = errorCount === 1 ? "1 field needs" : `${errorCount} fields need`;
      emitAlert({ type: "error", message: `${noun} your attention before saving. Please check the highlighted fields.` });
    }
    return errorCount === 0;
  };

  /* ── Cancel upload ── */
  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel(); setUploadTask(null);
      setUploadStep("idle"); setUploadProgress(0); setSaving(false);
      emitAlert({ type: "info", message: "Upload cancelled. Your changes are still here — you can try again." });
    }
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

  const openSavePreview = (status = "draft") => {
    if (saving || !validate()) return;
    setBannerError(null);
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

    const finalSlug = normalizeBlogSlug(formData.heading);
    const duplicateIssues = buildBlogDuplicateIssues({
      blogs: blogIndex.blogs,
      currentBlogId: id,
      heading: formData.heading,
      slug: finalSlug,
    });

    setPreviewRequest({
      changedFields: buildBlogChangeSummary({
        current: formData,
        original: originalSnapshot,
        imageAlt,
        originalImageAlt: originalSnapshot?.imageAlt || "",
        imageChanged: Boolean(imageFile),
        mode: "edit",
      }),
      duplicateIssues,
      finalSlug,
      status,
    });

    if (duplicateIssues.length) {
      emitAlert({ type: "error", message: "Duplicate title or slug found. Review the preview before saving." });
    }
  };

  const updateBlogHandler = (status) => openSavePreview(status);

  const executeUpdateBlog = async (status) => {
    if (saving) return;

    if (!navigator.onLine) {
      const msg = "You're offline. Please reconnect before saving.";
      setBannerError(msg); emitAlert({ type: "error", message: msg }); return;
    }

    setPreviewRequest((current) => (current ? { ...current, pending: true } : current));
    setSaving(true);
    try {
      // Upload image if a new file was selected
      let imageUrl = formData.image;
      if (imageFile) {
        setUploadStep("uploading"); setUploadProgress(0);
        try {
          imageUrl = await uploadBlogImage({
            file: imageFile,
            blogId: id,
            onProgress: setUploadProgress,
            onTaskReady: setUploadTask,
          });
        } catch (err) {
          const msg = getFriendlyError(err, "upload");
          setBannerError(`Image upload failed: ${msg}`); emitAlert({ type: "error", message: msg });
          setUploadStep("idle"); setUploadProgress(0); setSaving(false); return;
        }
      }

      setUploadStep("saving");
      const slug    = generateSlug(formData.heading);
      const excerpt = stripHtml(formData.description).slice(0, 160);

      const payload = {
        heading: formData.heading.trim(), slug, category: formData.category,
        author: formData.author,
        authorRole: formData.authorRole || "",
        reviewedBy: formData.reviewedBy || "",
        editorialNote: formData.editorialNote || "",
        reviewedAt: formData.reviewedAt || "",
        sources: parseSourcesText(formData.sourcesText),
        sourceNotes: formData.sourceNotes.trim(),
        description: formData.description, excerpt,
        date: formData.date, seoTitle: formData.seoTitle.trim(),
        seoDescription: formData.seoDescription || excerpt,
        image: imageUrl, imageAlt: imageAlt.trim(), status,
        tags: parseBlogTags(formData.tags),
      };

      try {
        await updateBlog(id, payload);
        // Snapshot a doc-shaped revision so version history can restore safely.
        saveBlogRevision({
          blog: { id, ...payload },
          reason: status === "published" ? "publish" : "save-draft",
        }).catch((e) => console.warn("[revision] snapshot failed", e));
      } catch (err) {
        const msg = getFriendlyError(err, "firestore");
        setBannerError(msg); emitAlert({ type: "error", message: msg });
        setUploadStep("idle"); setSaving(false); return;
      }

      logAuditEvent({
        module: "blogs", action: "BLOG_UPDATE", entityType: "blog", entityId: id,
        summary: `${status === "published" ? "Published" : "Saved draft"} blog "${formData.heading.trim()}"`,
        changes: { status, category: formData.category, author: formData.author ?? "" },
        route: `/altftool/blogs/edit-blog/${id}`,
      });

      setUploadStep("done");
      setPreviewRequest(null);
      // Push the change live immediately (no-op unless revalidation is configured).
      if (status === "published") requestBlogRevalidation(slug);
      emitAlert({ type: "success", message: status === "published" ? "Blog published!" : "Draft saved." });
      setTimeout(() => router.push("/altftool/blogs"), 600);
    } catch (err) {
      console.error("Unexpected save error:", err);
      const msg = "Something unexpected went wrong. Please try again.";
      setBannerError(msg); emitAlert({ type: "error", message: msg });
      setUploadStep("idle"); setUploadProgress(0);
    } finally {
      setSaving(false);
    }
  };

  const confirmPreviewSubmit = async () => {
    if (!previewRequest || previewRequest.duplicateIssues?.length) return;
    await executeUpdateBlog(previewRequest.status || "draft");
  };

  /* ── SEO & alt health ── */
  const seoTitleLen    = (formData.seoTitle || "").trim().length;
  const descLen        = (formData.seoDescription || "").length;
  const seoTitleStatus = getSeoTitleStatus(seoTitleLen);
  const descOk         = descLen >= 120 && descLen <= 160;
  const altLen         = imageAlt.length;
  const altOk          = altLen >= 5 && altLen <= 125;
  const requestedQuickAction = searchParams.get("refreshAction") || searchParams.get("action") || "";

  /* ── Dirty detection vs the last saved snapshot ── */
  const dirty = useMemo(() => {
    const o = originalSnapshot;
    if (!o) return false;
    return (
      formData.heading !== o.heading ||
      formData.description !== o.description ||
      formData.seoTitle !== o.seoTitle ||
      formData.seoDescription !== o.seoDescription ||
      formData.category !== o.category ||
      formData.author !== o.author ||
      formData.date !== o.date ||
      formData.tags !== o.tags ||
      formData.authorRole !== o.authorRole ||
      formData.reviewedBy !== o.reviewedBy ||
      formData.editorialNote !== o.editorialNote ||
      formData.sourcesText !== o.sourcesText ||
      formData.sourceNotes !== o.sourceNotes ||
      imageAlt !== (o.imageAlt || "") ||
      Boolean(imageFile)
    );
  }, [formData, imageAlt, imageFile, originalSnapshot]);

  /* ── Auto-save (drafts only; never silently mutates a live post) ── */
  const persistDraft = useCallback(async () => {
    if (!id || formData.status === "published") return;
    const slug = generateSlug(formData.heading || "draft");
    const excerpt = stripHtml(formData.description).slice(0, 160);
    await updateBlog(id, {
      heading: (formData.heading || "").trim(),
      slug,
      category: formData.category,
      author: formData.author,
      authorRole: formData.authorRole || "",
      reviewedBy: formData.reviewedBy || "",
      editorialNote: formData.editorialNote || "",
      reviewedAt: formData.reviewedAt || "",
      sources: parseSourcesText(formData.sourcesText),
      sourceNotes: (formData.sourceNotes || "").trim(),
      description: formData.description,
      excerpt,
      date: formData.date,
      seoTitle: (formData.seoTitle || "").trim(),
      seoDescription: formData.seoDescription || excerpt,
      imageAlt: imageAlt.trim(),
      status: "draft",
      tags: parseBlogTags(formData.tags),
    });
    setOriginalSnapshot({ ...formData, imageAlt, image: formData.image });
  }, [id, formData, imageAlt]);

  const autosave = useAutosave({ formData, imageAlt }, persistDraft, {
    delay: 1500,
    enabled: formData.status !== "published",
    isDirty: () => dirty,
  });

  useUnsavedGuard(dirty);

  /* ── Keyboard shortcuts (ref-backed to avoid stale closures) ── */
  const shortcutActionsRef = useRef({});
  shortcutActionsRef.current = {
    save: () => updateBlogHandler("draft"),
    publish: () => updateBlogHandler("published"),
    help: () => setShowShortcuts(true),
  };
  const shortcutMap = useMemo(() => ({
    "mod+s": () => shortcutActionsRef.current.save(),
    "mod+enter": () => shortcutActionsRef.current.publish(),
    "mod+/": () => shortcutActionsRef.current.help(),
  }), []);
  useEditorShortcuts(shortcutMap);

  /* ── Workflow transitions (publish routes through the existing gate) ── */
  const handleWorkflowTransition = async (to, opts = {}) => {
    if (to === WORKFLOW.PUBLISHED) {
      updateBlogHandler("published");
      return;
    }
    setWorkflowBusy(true);
    try {
      await updateBlogWorkflow(id, { workflowState: to, publishAt: opts.publishAt || null });
      setFormData((prev) => ({
        ...prev,
        status: statusForWorkflow(to),
        workflowState: to,
        publishAt: opts.publishAt || null,
      }));
      emitAlert({ type: "success", message: `Moved to ${to.replace(/_/g, " ")}.` });
      logAuditEvent({
        module: "blogs",
        action: "BLOG_WORKFLOW",
        entityType: "blog",
        entityId: id,
        summary: `Workflow → ${to}`,
        changes: { workflowState: to },
        route: `/altftool/blogs/edit-blog/${id}`,
      });
    } catch (err) {
      console.error("Workflow transition failed", err);
      emitAlert({ type: "error", message: "Could not update workflow state." });
    } finally {
      setWorkflowBusy(false);
    }
  };

  const saveState = formData.status === "published" ? (dirty ? "dirty" : "idle") : autosave.status;
  const savedLabel = formatSavedLabel(autosave.savedAt);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm">Loading blog…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EditorActionBar
        title={`Edit: ${formData.heading || "Untitled"}`}
        onBack={() => router.push("/altftool/blogs")}
        status={saveState}
        savedLabel={savedLabel}
        onSave={() => updateBlogHandler("draft")}
        onHistory={() => setShowHistory(true)}
        onShortcuts={() => setShowShortcuts(true)}
        primaryLabel={formData.status === "published" ? "Update post" : "Publish"}
        onPrimary={() => updateBlogHandler("published")}
        busy={saving}
      />
      <div className="max-w-7xl mx-auto px-5 py-7 space-y-5">
        <BlogPublishPreviewModal
          open={Boolean(previewRequest)}
          mode={previewRequest?.status || "draft"}
          formData={formData}
          finalSlug={previewRequest?.finalSlug || normalizeBlogSlug(formData.heading)}
          changedFields={previewRequest?.changedFields || []}
          duplicateIssues={previewRequest?.duplicateIssues || []}
          publishGate={publishGate}
          pending={Boolean(previewRequest?.pending || saving)}
          onCancel={() => setPreviewRequest(null)}
          onConfirm={confirmPreviewSubmit}
        />

        <OfflineBanner />
        <BannerAlert message={bannerError} onDismiss={() => setBannerError(null)} />

        <WorkflowStatusControl
          blog={{ status: formData.status, workflowState: formData.workflowState, publishAt: formData.publishAt }}
          onTransition={handleWorkflowTransition}
          busy={workflowBusy}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-5">

            <Section title="Post Details" id="blog-section-post-details" highlighted={isHighlighted("blog-section-post-details")}>
              <Field label="Heading" icon={<Type className="w-3.5 h-3.5" />} required error={errors.heading}>
                <Input name="heading" placeholder="Enter blog heading…" value={formData.heading}
                  onChange={(e) => { setFormData((p) => ({ ...p, heading: e.target.value })); setErrors((p) => ({ ...p, heading: undefined })); setBannerError(null); }}
                  error={errors.heading} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Author" icon={<User className="w-3.5 h-3.5" />}>
                  <Input name="author" placeholder="Author name" value={formData.author}
                    onChange={(e) => setFormData((p) => ({ ...p, author: e.target.value }))} />
                </Field>
                <Field label="Display Date" icon={<Calendar className="w-3.5 h-3.5" />}>
                  <Input type="date" name="date" value={formData.date}
                    onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} />
                </Field>
              </div>
              <Field label="Category" icon={<FileText className="w-3.5 h-3.5" />}>
                <CategorySelector value={formData.category} onChange={(v) => setFormData((p) => ({ ...p, category: v }))} />
              </Field>
              <Field label="Tags" icon={<Hash className="w-3.5 h-3.5" />} hint="Comma separated topics for search, archives, and recommendations.">
                <Input name="tags" placeholder="pdf tools, productivity, students" value={formData.tags || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))} />
              </Field>
            </Section>

            <Section title="Trust Metadata" id="blog-section-trust" highlighted={isHighlighted("blog-section-trust")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Author Role" icon={<User className="w-3.5 h-3.5" />} hint="Shown under the author name on public blogs.">
                  <Input name="authorRole" placeholder="AltFTool Editorial, Travel Writer..." value={formData.authorRole || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, authorRole: e.target.value }))} />
                </Field>
                <Field label="Reviewed By" icon={<ShieldCheck className="w-3.5 h-3.5" />} hint="Shown in the editorial review badge.">
                  <Input name="reviewedBy" placeholder="AltFTool Editorial Team" value={formData.reviewedBy || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, reviewedBy: e.target.value }))} />
                </Field>
              </div>
              <Field label="Editorial Note" icon={<Info className="w-3.5 h-3.5" />} hint="Optional trust note shown in the About this guide card.">
                <textarea
                  name="editorialNote"
                  rows={3}
                  value={formData.editorialNote || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, editorialNote: e.target.value }))}
                  placeholder="Reviewed for accuracy, freshness, and practical usefulness..."
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition resize-none"
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
                <p className="flex items-center gap-1 text-xs text-red-500 font-medium -mt-2"><AlertCircle className="w-3 h-3" />{errors.description}</p>
              )}
              <BlogEditor value={formData.description}
                onChange={(data) => { setFormData((p) => ({ ...p, description: data })); setErrors((p) => ({ ...p, description: undefined })); }} />
            </Section>

            {/* SEO — collapsible */}
            <div
              id="blog-section-seo"
              className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                isHighlighted("blog-section-seo") ? "border-blue-200 ring-4 ring-blue-100" : "border-gray-100"
              }`}
            >
              <button type="button" onClick={() => setSeoExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">SEO Settings</span>
                  <div className="flex gap-1 ml-2">
                    <span className={`w-2 h-2 rounded-full ${errors.seoTitle ? "bg-red-400" : seoTitleStatus.ok ? "bg-green-400" : "bg-amber-400"}`} title="Meta title status" />
                    <span className={`w-2 h-2 rounded-full ${descOk ? "bg-green-400" : "bg-amber-400"}`} title="Description length status" />
                  </div>
                  {errors.seoTitle && !seoExpanded && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Fix required — click to expand</span>
                  )}
                </div>
                <span className="text-gray-400 text-xs">{seoExpanded ? "▲ Hide" : "▼ Show"}</span>
              </button>

              {seoExpanded && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                  <Field label="Meta Title" icon={<Type className="w-3.5 h-3.5" />} required error={errors.seoTitle}
                    hint={!errors.seoTitle && seoTitleLen > 0 ? `${seoTitleLen}/${SEO_TITLE_HARD_MAX} chars · ${seoTitleStatus.label}` : `${seoTitleLen}/${SEO_TITLE_HARD_MAX} chars · Ideal: ${SEO_TITLE_MIN}–${SEO_TITLE_IDEAL_MAX}`}>
                    <Input name="seoTitle" placeholder="Enter meta title (50–60 characters ideal)…" value={formData.seoTitle}
                      onChange={(e) => { setFormData((p) => ({ ...p, seoTitle: e.target.value })); setErrors((p) => ({ ...p, seoTitle: undefined })); setBannerError(null); }}
                      error={errors.seoTitle} maxLength={SEO_TITLE_HARD_MAX + 10} />
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full transition-all ${seoTitleStatus.color}`} style={{ width: `${Math.min((seoTitleLen / SEO_TITLE_HARD_MAX) * 100, 100)}%` }} />
                    </div>
                    {seoTitleLen > 0 && <p className="text-[10px] text-gray-400 mt-0.5">Google typically shows ~50–60 characters in search results.</p>}
                  </Field>

                  <Field label="SEO Description" icon={<FileText className="w-3.5 h-3.5" />} hint={`${descLen} chars — aim for 120–160`}>
                    <textarea name="seoDescription" rows={3} placeholder="Defaults to excerpt if empty"
                      value={formData.seoDescription} onChange={(e) => setFormData((p) => ({ ...p, seoDescription: e.target.value }))}
                      className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition resize-none" />
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full transition-all ${descOk ? "bg-green-400" : "bg-amber-400"}`} style={{ width: `${Math.min((descLen / 160) * 100, 100)}%` }} />
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
              {uploadStep === "uploading" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500"><span>Uploading image…</span><span className="font-semibold tabular-nums">{uploadProgress}%</span></div>
                  <ProgressBar value={uploadProgress} />
                  <button type="button" onClick={handleCancelUpload} className="text-xs text-red-500 hover:text-red-700 font-medium underline">Cancel upload</button>
                </div>
              )}
              {uploadStep === "saving" && <div className="flex items-center gap-2 text-xs text-gray-500"><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />Saving to database…</div>}
              {uploadStep === "done"   && <div className="flex items-center gap-2 text-xs text-green-600 font-medium"><CheckCircle2 className="w-4 h-4" />Saved! Redirecting…</div>}
              <div className="space-y-2">
                <button type="button" onClick={() => updateBlogHandler("draft")} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50">
                  {saving && uploadStep === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Draft
                </button>
                <button type="button" onClick={() => updateBlogHandler("published")} disabled={saving || uploadStep === "done"}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition shadow-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  {saving ? (uploadStep === "uploading" ? `Uploading… ${uploadProgress}%` : "Saving…") : "Publish"}
                </button>
              </div>
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600">Slug is auto-generated from the heading on save.</p>
              </div>
            </div>

            <BlogPublishQualityGate
              formData={formData}
              imageAlt={imageAlt}
              hasImage={Boolean(imageFile || imagePreview || formData.image)}
              currentBlogId={id}
              onGateChange={setPublishGate}
            />

            <BlogEditorHealthPanel
              formData={formData}
              imageAlt={imageAlt}
              hasImage={Boolean(imageFile || imagePreview || formData.image)}
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

            <BlogQuickFixPanel
              formData={formData}
              imageAlt={imageAlt}
              hasImage={Boolean(imageFile || imagePreview)}
              requestedAction={requestedQuickAction}
              onApplyQuickFix={handleApplyQuickFix}
            />

            <BlogRefreshActions
              formData={formData}
              onApplyFields={handleApplyWritingFields}
              onInsertBlock={handleInsertContentBlock}
            />

            <BlogSeoChecklist
              formData={formData}
              imageAlt={imageAlt}
              hasImage={Boolean(imageFile || imagePreview)}
            />

            <div
              id="blog-section-internal-links"
              className={`scroll-mt-24 rounded-2xl transition ${
                isHighlighted("blog-section-internal-links") ? "ring-4 ring-blue-100" : ""
              }`}
            >
              <BlogInternalLinkAssistant
                formData={formData}
                currentBlogId={id}
                onInsertLinks={handleInsertContentBlock}
              />
            </div>

            {/* Image card */}
            <div
              id="blog-section-image"
              className={`scroll-mt-24 space-y-3 rounded-2xl border bg-white p-5 shadow-sm transition ${
                isHighlighted("blog-section-image") ? "border-blue-200 ring-4 ring-blue-100" : "border-gray-100"
              }`}
            >
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Featured Image</h2>

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
                    onChange={(e) => { setImageAlt(e.target.value); setErrors((p) => ({ ...p, imageAlt: undefined })); setBannerError(null); }}
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

            {/* View live */}
            {formData.status === "published" && (
              <button onClick={() => router.push(`/altftool/blogs/view-blogs/${id}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition">
                <Eye className="w-4 h-4" />View Live Post
              </button>
            )}
          </div>

        </div>
      </div>

      <BlogHistoryDrawer
        open={showHistory}
        blogId={id}
        currentBlog={{
          id,
          heading: formData.heading,
          slug: generateSlug(formData.heading || "draft"),
          category: formData.category,
          author: formData.author,
          authorRole: formData.authorRole,
          reviewedBy: formData.reviewedBy,
          editorialNote: formData.editorialNote,
          reviewedAt: formData.reviewedAt,
          date: formData.date,
          description: formData.description,
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription,
          image: formData.image,
          imageAlt,
          status: formData.status,
          workflowState: formData.workflowState,
          tags: parseBlogTags(formData.tags),
          sources: parseSourcesText(formData.sourcesText),
          sourceNotes: formData.sourceNotes,
        }}
        onClose={() => setShowHistory(false)}
        onRestored={() => window.location.reload()}
      />
      <KeyboardShortcutsHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
