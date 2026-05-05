"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

import { emitAlert } from "@/lib/alertBus";
import { fetchCardById, updateCard, updateCardImage, uploadCardImage } from "../../credit-card-services/CreditCardService";

import CreditCardCateogry from "../../components/CreditCardCateogry";
import CreditCardBenefit from "../../components/CreditCardBenefit.jsx";
import CardAdditionalDetails from "../../components/CardAdditionalDetails.jsx";
import { CardCompareDetails } from "../../components/CardCompareDetails.jsx";
import { Field } from "../../styles/FieldStyle.jsx";
import { Input } from "../../styles/InputStyle.jsx";

import { logAuditEvent } from "@/lib/auditClient";
import {
    ArrowLeft, Save, Globe, Type, User, Calendar,
    Search, FileText, ImageIcon, UploadCloud, Trash2,
    CheckCircle2, Loader2, AlertCircle, Eye,
    Info, WifiOff, AlertTriangle, ALargeSmall,
    Gauge, CreditCard, Banknote, SquareArrowOutUpRight,
} from "lucide-react";
import CtaButtonPicker from "../../components/CtaButtonPicker";

/* ── SEO Title validation ── */
const SEO_TITLE_MIN = 50;
const SEO_TITLE_IDEAL_MAX = 60;
const SEO_TITLE_HARD_MAX = 60;

const getSeoTitleStatus = (len) => {
    if (len === 0) return { color: "bg-gray-200", label: "", ok: false };
    if (len < SEO_TITLE_MIN) return { color: "bg-amber-400", label: `Too short — aim for ${SEO_TITLE_MIN}–${SEO_TITLE_IDEAL_MAX} chars`, ok: false };
    if (len <= SEO_TITLE_IDEAL_MAX) return { color: "bg-green-400", label: "Perfect length", ok: true };
    return { color: "bg-red-400", label: `Too long — will be truncated by Google (max ${SEO_TITLE_HARD_MAX})`, ok: false };
};

/* ── Credit Score options ── */
const CreditScore = ["Excellent", "Good", "Fair"];

/* ── Friendly error translator ── */
function getFriendlyError(err, context = "general") {
    if (!navigator.onLine) return "You're offline. Please check your internet connection and try again.";
    const code = err?.code || "";
    const message = err?.message || "";
    if (context === "upload") {
        if (code === "storage/canceled") return "Upload was cancelled. Try saving again.";
        if (code === "storage/retry-limit-exceeded") return "Upload failed after several attempts — your connection may be too slow. Try again.";
        if (code === "storage/quota-exceeded") return "Storage quota exceeded. Please contact your administrator.";
        if (code === "storage/unauthenticated" || code === "storage/unauthorized") return "You don't have permission to upload files. Try logging out and back in.";
        if (code === "storage/invalid-checksum") return "The image file was corrupted during upload. Please select the image again and retry.";
        if (code === "storage/server-file-wrong-size") return "Something went wrong uploading the image. Please try again.";
        if (code === "storage/object-not-found") return "Upload destination not found. Please contact support.";
        if (message.includes("network") || code === "storage/unknown") return "Upload failed due to a network problem. Check your connection and try again.";
        return "Image upload failed. Please try again.";
    }
    if (context === "firestore") {
        if (code === "permission-denied" || code === "firestore/permission-denied") return "You don't have permission to update this card. Please contact your administrator.";
        if (code === "unavailable" || code === "firestore/unavailable") return "The database is temporarily unavailable. Please wait a moment and try again.";
        if (code === "deadline-exceeded" || code === "firestore/deadline-exceeded") return "Saving timed out — your connection might be slow. Please try again.";
        if (code === "resource-exhausted" || code === "firestore/resource-exhausted") return "Too many requests. Please wait a few seconds and try again.";
        if (code === "unauthenticated" || code === "firestore/unauthenticated") return "Your session has expired. Please log out and log back in, then try again.";
        if (code === "not-found" || code === "firestore/not-found") return "This card no longer exists — it may have been deleted.";
        if (message.includes("network") || message.includes("Failed to fetch")) return "Network error while saving. Please check your internet and try again.";
        return "Failed to save to the database. Please try again.";
    }
    return "Something went wrong. Please try again.";
}

/* ── Validation messages ── */
const VALIDATION_MESSAGES = {
    heading: "Please enter a heading for your Credit Card post.",
    annualFee: "Always Select the annual fee",
    rewardRate: "Reward Rate is Important",
    bottomLine: "Write the bottom line inputs",
    cardDetails: "Card details are important",
    cardBenefit: "Card Benefit is required",
    ourTake: "Our take is important",
    category: "Please select a valid card category from the list.",
    regularApr: "Please select the Regular APR",
    applyLink: "Please select the card website url",
    seoDescription: "Please enter an SEO description (helps Google find your post).",
    signupBonus: "Please add the signup Bonus",
    detailRewardRate: "Please add the reward rate with benefits",
    expertReview: "Please add the expert review",
    goodFeature: "Please add at least one good feature of card",
    badFeature: "Please add at least one bad feature of card",
    editorialNote: "Please add the editorial note for card",
    welcomeOffer: "Write the welcome offer",
    firstYearReward: "Add the first year reward",
    introPurchase: "Add the intro purchase reward",
    ongoingPurchase: "Add the ongoing purchase reward",
    introBalanceTransfer: "Add the intro balance transfer",
    ongoingBalanceTransfer: "Add the ongoing balance transfer",
    foreignTranscationFees: "Add the foreign transaction fees",
    balanceTransferFees: "Add the balance transfer fees",
    image: "Please upload a featured image of card.",
    imageAlt: "Please enter alt text for the featured image (required for accessibility and SEO).",
    seoTitleEmpty: "Please enter a meta title (used as the browser tab title and in Google search results).",
    seoTitleShort: (len) => `Meta title is too short (${len} chars). Aim for at least ${SEO_TITLE_MIN} characters so Google shows it fully.`,
    seoTitleLong: (len) => `Meta title is too long (${len} chars). Google will cut it off after ${SEO_TITLE_HARD_MAX} characters.`,
};

const IMAGE_MESSAGES = {
    wrongType: "That file isn't an image. Please select a JPG, PNG, or WebP file.",
    tooLarge: (size) => `This image is ${size} — it must be under 2MB. Please resize or compress it first.`,
};

/* ── UI primitives ── */
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
            <span>You're offline. Changes cannot be saved — please reconnect before publishing or saving.</span>
        </div>
    );
}

const generateSlug = (t) => t.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-");
const stripHtml = (h) => (h || "").replace(/<[^>]+>/g, "");


export default function EditCard() {
    const router = useRouter();
    const { id } = useParams();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        heading: "", category: "", date: "",
        description: "", seoTitle: "", seoDescription: "",
        creditscore: "", cardBenefit: "", regularApr: "", annualFee: "",
        rewardRate: "", applyLink: "", bottomLine: "", ourTake: "",
        cardDetails: "", signupBonus: "", cardHighlight: "",
        detailRewardRate: "", expertReview: "", goodFeature: "", badFeature: "",
        editorialNote: "", welcomeOffer: "", firstYearReward: "",
        introPurchase: "", ongoingPurchase: "", introBalanceTransfer: "",
        ongoingBalanceTransfer: "", foreignTranscationFees: "", balanceTransferFees: "",
        image: "", status: "draft",
    });

    const [cardHighlights, setCardHighlights] = useState([""]);
    const [cardsExtraInfo, setCardsExtraInfo] = useState(false);
    const [imageAlt, setImageAlt] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [imageName, setImageName] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState("idle");
    const [uploadTask, setUploadTask] = useState(null);
    const [errors, setErrors] = useState({});
    const [seoExpanded, setSeoExpanded] = useState(false);
    const [bannerError, setBannerError] = useState(null);

    const clearError = (name) => setErrors((p) => ({ ...p, [name]: undefined }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearError(name);
        setBannerError(null);
    };

    /* ── Load card ── */
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await fetchCardById(id);
                if (!data) {
                    emitAlert({ type: "error", message: "Card not found." });
                    router.push("/leadtree/credit-cards"); return;
                }
                setFormData({
                    heading: data.heading || "",
                    category: data.category || "",
                    date: data.date || "",
                    description: data.description || "",
                    seoTitle: data.seoTitle || "",
                    seoDescription: data.seoDescription || "",
                    creditscore: data.creditscore || "",
                    cardBenefit: data.cardBenefit || "",
                    regularApr: data.regularApr || "",
                    annualFee: data.annualFee || "",
                    rewardRate: data.rewardRate || "",
                    applyLink: data.applyLink || "",
                    bottomLine: data.bottomLine || "",
                    ourTake: data.ourTake || "",
                    cardDetails: data.cardDetails || "",
                    signupBonus: data.signupBonus || "",
                    cardHighlight: data.cardHighlight || "",
                    detailRewardRate: data.detailRewardRate || "",
                    expertReview: data.expertReview || "",
                    goodFeature: data.goodFeature || "",
                    badFeature: data.badFeature || "",
                    editorialNote: data.editorialNote || "",
                    welcomeOffer: data.welcomeOffer || "",
                    firstYearReward: data.firstYearReward || "",
                    introPurchase: data.introPurchase || "",
                    ongoingPurchase: data.ongoingPurchase || "",
                    introBalanceTransfer: data.introBalanceTransfer || "",
                    ongoingBalanceTransfer: data.ongoingBalanceTransfer || "",
                    foreignTranscationFees: data.foreignTranscationFees || "",
                    balanceTransferFees: data.balanceTransferFees || "",
                    image: data.image || "",
                    status: data.status || "draft",
                });
                // Restore cardHighlights array (stored as array in Firestore)
                if (Array.isArray(data.cardHighlights) && data.cardHighlights.length > 0) {
                    setCardHighlights(data.cardHighlights);
                }
                setImageAlt(data.imageAlt || "");
                if (data.image) { setImagePreview(data.image); setImageName("Current image"); }
            } catch (err) {
                console.error(err);
                const msg = getFriendlyError(err, "firestore");
                emitAlert({ type: "error", message: msg }); setBannerError(msg);
            } finally { setLoading(false); }
        })();
    }, [id]); // eslint-disable-line

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
        setFormData((p) => ({ ...p, image: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    /* ── Card highlight handlers ── */
    const handleHighlightChange = (index, value) => {
        const updated = [...cardHighlights];
        updated[index] = value;
        setCardHighlights(updated);
    };

    const addHighlight = () => {
        setCardHighlights([...cardHighlights, ""]);
    };

    /* ── Validation ── */
    const validate = () => {
        const e = {};
        if (!formData.heading.trim()) e.heading = VALIDATION_MESSAGES.heading;
        if (!formData.annualFee.trim()) e.annualFee = VALIDATION_MESSAGES.annualFee;
        if (!formData.rewardRate.trim()) e.rewardRate = VALIDATION_MESSAGES.rewardRate;
        if (!formData.applyLink.trim()) e.applyLink = VALIDATION_MESSAGES.applyLink;
        if (!formData.ourTake.trim()) e.ourTake = VALIDATION_MESSAGES.ourTake;
        if (!formData.cardDetails.trim()) e.cardDetails = VALIDATION_MESSAGES.cardDetails;
        if (!formData.regularApr.trim()) e.regularApr = VALIDATION_MESSAGES.regularApr;
        if (!formData.cardBenefit.trim()) e.cardBenefit = VALIDATION_MESSAGES.cardBenefit;
        if (!formData.bottomLine.trim()) e.bottomLine = VALIDATION_MESSAGES.bottomLine;
        if (!formData.seoDescription.trim()) e.seoDescription = VALIDATION_MESSAGES.seoDescription;
        if (!formData.signupBonus.trim()) e.signupBonus = VALIDATION_MESSAGES.signupBonus;
        if (!cardHighlights.some(h => h.trim() !== "")) {
            e.cardHighlight = "Please add at least one highlight";
        }
        if (!formData.detailRewardRate.trim()) e.detailRewardRate = VALIDATION_MESSAGES.detailRewardRate;
        if (!formData.expertReview.trim()) e.expertReview = VALIDATION_MESSAGES.expertReview;
        if (!formData.goodFeature.trim()) e.goodFeature = VALIDATION_MESSAGES.goodFeature;
        if (!formData.badFeature.trim()) e.badFeature = VALIDATION_MESSAGES.badFeature;
        if (!formData.editorialNote.trim()) e.editorialNote = VALIDATION_MESSAGES.editorialNote;
        if (!formData.welcomeOffer.trim()) e.welcomeOffer = VALIDATION_MESSAGES.welcomeOffer;
        if (!formData.firstYearReward.trim()) e.firstYearReward = VALIDATION_MESSAGES.firstYearReward;
        if (!formData.introPurchase.trim()) e.introPurchase = VALIDATION_MESSAGES.introPurchase;
        if (!formData.ongoingPurchase.trim()) e.ongoingPurchase = VALIDATION_MESSAGES.ongoingPurchase;
        if (!formData.introBalanceTransfer.trim()) e.introBalanceTransfer = VALIDATION_MESSAGES.introBalanceTransfer;
        if (!formData.ongoingBalanceTransfer.trim()) e.ongoingBalanceTransfer = VALIDATION_MESSAGES.ongoingBalanceTransfer;
        if (!formData.foreignTranscationFees.trim()) e.foreignTranscationFees = VALIDATION_MESSAGES.foreignTranscationFees;
        if (!formData.balanceTransferFees.trim()) e.balanceTransferFees = VALIDATION_MESSAGES.balanceTransferFees;
        if (!imageFile && !imagePreview) e.image = VALIDATION_MESSAGES.image;
        if ((imageFile || imagePreview) && !imageAlt.trim()) e.imageAlt = VALIDATION_MESSAGES.imageAlt;

        if (!formData.category.trim()) {
            e.category = VALIDATION_MESSAGES.category;
        }

        const seoTitleLen = formData.seoTitle.trim().length;
        if (!formData.seoTitle.trim()) e.seoTitle = VALIDATION_MESSAGES.seoTitleEmpty;
        else if (seoTitleLen < SEO_TITLE_MIN) e.seoTitle = VALIDATION_MESSAGES.seoTitleShort(seoTitleLen);
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

    /* ── Cancel upload ── */
    const handleCancelUpload = () => {
        if (uploadTask) {
            uploadTask.cancel(); setUploadTask(null);
            setUploadStep("idle"); setUploadProgress(0); setSaving(false);
            emitAlert({ type: "info", message: "Upload cancelled. Your changes are still here — you can try again." });
        }
    };

    /* ── Save / Publish ── */
    const updateCardHandler = async (status) => {
        if (saving || !validate()) return;
        setBannerError(null);

        if (!navigator.onLine) {
            const msg = "You're offline. Please reconnect before saving.";
            setBannerError(msg); emitAlert({ type: "error", message: msg }); return;
        }

        setSaving(true);
        try {
            // Upload image if a new file was selected
            let imageUrl = formData.image;
            if (imageFile) {
                setUploadStep("uploading"); setUploadProgress(0);
                try {
                    imageUrl = await uploadCardImage({
                        file: imageFile,
                        cardId: id,
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
            const slug = generateSlug(formData.heading);
            const excerpt = stripHtml(formData.description).slice(0, 160);

            try {
                await updateCard(id, {
                    heading: formData.heading.trim(),
                    slug,
                    category: formData.category,
                    date: formData.date,
                    description: formData.description,
                    excerpt,
                    seoTitle: formData.seoTitle.trim(),
                    seoDescription: formData.seoDescription.trim() || excerpt,
                    creditscore: formData.creditscore,
                    cardBenefit: formData.cardBenefit.trim(),
                    regularApr: formData.regularApr.trim(),
                    annualFee: formData.annualFee.trim(),
                    rewardRate: formData.rewardRate.trim(),
                    applyLink: formData.applyLink.trim(),
                    bottomLine: formData.bottomLine.trim(),
                    ourTake: formData.ourTake.trim(),
                    cardDetails: formData.cardDetails.trim(),
                    signupBonus: formData.signupBonus.trim(),
                    cardHighlights: cardHighlights,
                    detailRewardRate: formData.detailRewardRate.trim(),
                    expertReview: formData.expertReview.trim(),
                    goodFeature: formData.goodFeature.trim(),
                    badFeature: formData.badFeature.trim(),
                    editorialNote: formData.editorialNote.trim(),
                    welcomeOffer: formData.welcomeOffer.trim(),
                    firstYearReward: formData.firstYearReward.trim(),
                    introPurchase: formData.introPurchase.trim(),
                    ongoingPurchase: formData.ongoingPurchase.trim(),
                    introBalanceTransfer: formData.introBalanceTransfer.trim(),
                    ongoingBalanceTransfer: formData.ongoingBalanceTransfer.trim(),
                    foreignTranscationFees: formData.foreignTranscationFees.trim(),
                    balanceTransferFees: formData.balanceTransferFees.trim(),
                    image: imageUrl,
                    imageAlt: imageAlt.trim(),
                    status,
                });
            } catch (err) {
                const msg = getFriendlyError(err, "firestore");
                setBannerError(msg); emitAlert({ type: "error", message: msg });
                setUploadStep("idle"); setSaving(false); return;
            }

            logAuditEvent({
                module: "creditcard", action: "CARD_UPDATE", entityType: "card", entityId: id,
                summary: `${status === "published" ? "Published" : "Saved draft"} card "${formData.heading.trim()}"`,
                changes: { status, category: formData.category },
                route: `/leadtree/credit-cards/edit-card/${id}`,
            });

            setUploadStep("done");
            emitAlert({ type: "success", message: status === "published" ? "Card published!" : "Draft saved." });
            setTimeout(() => router.push("/leadtree/credit-cards"), 600);
        } catch (err) {
            console.error("Unexpected save error:", err);
            const msg = "Something unexpected went wrong. Please try again.";
            setBannerError(msg); emitAlert({ type: "error", message: msg });
            setUploadStep("idle"); setUploadProgress(0);
        } finally {
            setSaving(false);
        }
    };

    /* ── SEO & alt health ── */
    const seoTitleLen = (formData.seoTitle || "").trim().length;
    const descLen = (formData.seoDescription || "").length;
    const seoTitleStatus = getSeoTitleStatus(seoTitleLen);
    const descOk = descLen >= 120 && descLen <= 160;
    const altLen = imageAlt.length;
    const altOk = altLen >= 5 && altLen <= 125;

    /* ── Checklist ── */
    const checklistItems = [
        { label: "Heading", done: !!formData.heading.trim() },
        { label: "Card Category", done: !!formData.category.trim() },
        { label: "Card Credit Score", done: !!formData.creditscore.trim() },
        { label: "Card Benefit", done: !!formData.cardBenefit.trim() },
        { label: "Display Date", done: !!formData.date },
        { label: "Card Reward Rate", done: !!formData.rewardRate.trim() },
        { label: "Card Annual Fee", done: !!formData.annualFee.trim() },
        { label: "Card Regular APR", done: !!formData.regularApr.trim() },
        { label: "Card Website URL", done: !!formData.applyLink.trim() },
        { label: "Card Bottom Line", done: !!formData.bottomLine.trim() },
        { label: "Card Our Take", done: !!formData.ourTake.trim() },
        { label: "Card Details", done: !!formData.cardDetails.trim() },
        { label: "SignUp Bonus", done: !!formData.signupBonus.trim() },
        { label: "Credit Highlight", done: cardHighlights.some(h => h.trim() !== "") },
        { label: "Detailed Reward Rate", done: !!formData.detailRewardRate.trim() },
        { label: "Expert Review", done: !!formData.expertReview.trim() },
        { label: "Card Good Feature", done: !!formData.goodFeature.trim() },
        { label: "Card Bad Feature", done: !!formData.badFeature.trim() },
        { label: "Editorial Note", done: !!formData.editorialNote.trim() },
        { label: "Meta Title (50–60 chars)", done: seoTitleStatus.ok },
        { label: "SEO Description", done: !!formData.seoDescription.trim() },
        { label: "Featured Image", done: !!(imageFile || imagePreview) },
        { label: "Image Alt Text", done: !!(imageFile || imagePreview) && altOk },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-sm">Loading Card…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-5 py-7 space-y-5">

                <OfflineBanner />
                <BannerAlert message={bannerError} onDismiss={() => setBannerError(null)} />

                {/* Top bar */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push("/leadtree/credit-cards")} className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Edit Card</h1>
                            <p className="text-xs text-gray-400 font-mono truncate max-w-[280px]">ID: {id}</p>
                        </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${formData.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {formData.status === "published" ? "● Published" : "○ Draft"}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ── Main column ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* ── Card Basic Details ── */}
                        <Section title="Card Basic Details">
                            <Field label="Card Heading" icon={<Type className="w-3.5 h-3.5" />} required error={errors.heading}>
                                <Input name="heading" placeholder="Enter credit card heading…" value={formData.heading}
                                    onChange={handleChange} error={errors.heading} />
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Card Category" icon={<FileText className="w-3.5 h-3.5" />} required error={errors.category}>
                                    <CreditCardCateogry value={formData.category}
                                        onChange={(v) => { setFormData((p) => ({ ...p, category: v })); clearError("category"); }} />
                                </Field>

                                <Field label="Card Credit Score" icon={<Gauge className="w-3.5 h-3.5" />} required error={errors.creditscore}>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-2 py-3 text-sm text-gray-500"
                                        value={formData.creditscore || ""}
                                        onChange={(e) => { setFormData({ ...formData, creditscore: e.target.value }); clearError("creditscore"); }}
                                    >
                                        <option value="">Select Credit Score</option>
                                        {CreditScore.map((item, idx) => (
                                            <option key={idx} value={item}>{item}</option>
                                        ))}
                                    </select>
                                    {errors.creditscore && (
                                        <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-1">
                                            <AlertCircle className="w-3 h-3" />{errors.creditscore}
                                        </p>
                                    )}
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Card Benefit" icon={<CreditCard className="w-3.5 h-3.5" />} required error={errors.cardBenefit}>
                                    <CreditCardBenefit value={formData.cardBenefit}
                                        onChange={(v) => { setFormData((p) => ({ ...p, cardBenefit: v })); clearError("cardBenefit"); }} />
                                    {errors.cardBenefit && (
                                        <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-1">
                                            <AlertCircle className="w-3 h-3" />{errors.cardBenefit}
                                        </p>
                                    )}
                                </Field>

                                <Field label="Display Date" icon={<Calendar className="w-3.5 h-3.5" />} required error={errors.date}>
                                    <Input type="date" name="date" value={formData.date} onChange={handleChange} error={errors.date} />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Card Rewards Rate" icon={<CreditCard className="w-3.5 h-3.5" />} required error={errors.rewardRate}>
                                    <div className="flex flex-col gap-1">
                                        <Input name="rewardRate" placeholder="Enter credit card Rewards Rate" value={formData.rewardRate} onChange={handleChange} error={errors.rewardRate} />
                                        <span className="text-[11px] text-gray-500">Recommended Reward Format (1X - 2Y Points/CashBack)</span>
                                    </div>
                                </Field>

                                <Field label="Card Annual Fee" icon={<Banknote className="w-3.5 h-3.5" />} required error={errors.annualFee}>
                                    <Input name="annualFee" placeholder="Enter credit card annual fee" value={formData.annualFee} onChange={handleChange} error={errors.annualFee} />
                                </Field>
                            </div>

                            {/* ── Card Extra Info (collapsible) ── */}
                            <div className="bg-white rounded-xl border border-gray-200">
                                <div
                                    onClick={() => setCardsExtraInfo(!cardsExtraInfo)}
                                    className="flex items-center justify-between cursor-pointer px-4 py-3"
                                >
                                    <h3 className="text-sm font-semibold text-gray-500">Card Extra Info</h3>
                                    <span className="text-xs text-gray-500">{cardsExtraInfo ? "▲" : "▼"}</span>
                                </div>

                                {cardsExtraInfo && (
                                    <div className="p-4 border-t border-gray-100 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Card Regular APR" icon={<CreditCard className="w-3.5 h-3.5" />} required error={errors.regularApr}>
                                                <div className="flex flex-col gap-1">
                                                    <Input name="regularApr" placeholder="Enter credit card APR…" value={formData.regularApr} onChange={handleChange} error={errors.regularApr} />
                                                    <span className="text-[11px] text-gray-500">Recommended APR Format (X% - Y% Regular/Variable)</span>
                                                </div>
                                            </Field>

                                            <Field label="Card Website URL" icon={<SquareArrowOutUpRight className="w-3.5 h-3.5" />} required error={errors.applyLink}>
                                                <Input name="applyLink" placeholder="Enter Card Bank Website URL…" value={formData.applyLink} onChange={handleChange} error={errors.applyLink} />
                                            </Field>
                                        </div>

                                        <Field label="Card Bottom Line" icon={<CreditCard className="w-3.5 h-3.5" />} required error={errors.bottomLine}>
                                            <Input name="bottomLine" placeholder="Enter the bottom line" value={formData.bottomLine} onChange={handleChange} error={errors.bottomLine} />
                                        </Field>

                                        <Field label="Our Take for Card" icon={<CreditCard className="w-3.5 h-3.5" />} required error={errors.ourTake}>
                                            <Input name="ourTake" placeholder="Enter the our take" value={formData.ourTake} onChange={handleChange} error={errors.ourTake} />
                                        </Field>

                                        <Field label="Card Details" icon={<CreditCard className="w-3.5 h-3.5" />} required error={errors.cardDetails}>
                                            <Input name="cardDetails" placeholder="Enter the card details" value={formData.cardDetails} onChange={handleChange} error={errors.cardDetails} />
                                        </Field>
                                    </div>
                                )}
                            </div>
                        </Section>

                        {/* ── Button Picker ── */}
                        <Section title="Button Picker"><CtaButtonPicker /></Section>

                        {/* ── Card Compare Details ── */}
                        <Section title="Card Compare Details">
                            <CardCompareDetails
                                signupBonus={formData.signupBonus}
                                detailRewardRate={formData.detailRewardRate}
                                expertReview={formData.expertReview}
                                goodFeature={formData.goodFeature}
                                badFeature={formData.badFeature}
                                editorialNote={formData.editorialNote}
                                onChange={handleChange}
                                errors={{
                                    signupBonus: errors.signupBonus,
                                    detailRewardRate: errors.detailRewardRate,
                                    expertReview: errors.expertReview,
                                    goodFeature: errors.goodFeature,
                                    badFeature: errors.badFeature,
                                    editorialNote: errors.editorialNote,
                                    cardHighlight: errors.cardHighlight,
                                }}
                                cardHighlights={cardHighlights}
                                onHighlightChange={handleHighlightChange}
                                onAddHighlight={addHighlight}
                            />
                        </Section>

                        {/* ── Card Additional Details ── */}
                        <Section title="Card Additional Details">
                            <CardAdditionalDetails
                                welcomeOffer={formData.welcomeOffer}
                                firstYearReward={formData.firstYearReward}
                                introPurchase={formData.introPurchase}
                                ongoingPurchase={formData.ongoingPurchase}
                                introBalanceTransfer={formData.introBalanceTransfer}
                                ongoingBalanceTransfer={formData.ongoingBalanceTransfer}
                                foreignTranscationFees={formData.foreignTranscationFees}
                                balanceTransferFees={formData.balanceTransferFees}
                                onChange={handleChange}
                                errors={{
                                    welcomeOffer: errors.welcomeOffer,
                                    firstYearReward: errors.firstYearReward,
                                    introPurchase: errors.introPurchase,
                                    ongoingPurchase: errors.ongoingPurchase,
                                    introBalanceTransfer: errors.introBalanceTransfer,
                                    ongoingBalanceTransfer: errors.ongoingBalanceTransfer,
                                    foreignTranscationFees: errors.foreignTranscationFees,
                                    balanceTransferFees: errors.balanceTransferFees,
                                }}
                            />
                        </Section>

                        {/* ── SEO — collapsible ── */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <button type="button" onClick={() => setSeoExpanded((v) => !v)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                                <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">SEO Settings</span>
                                    <div className="flex gap-1 ml-2">
                                        <span className={`w-2 h-2 rounded-full ${errors.seoTitle ? "bg-red-400" : seoTitleStatus.ok ? "bg-green-400" : "bg-amber-400"}`} title="Meta title status" />
                                        <span className={`w-2 h-2 rounded-full ${descOk ? "bg-green-400" : errors.seoDescription ? "bg-red-400" : "bg-amber-400"}`} title="Description length status" />
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
                                        <Input name="seoTitle" placeholder="Enter meta title (50–60 characters ideal)…" value={formData.seoTitle}
                                            onChange={handleChange} error={errors.seoTitle} maxLength={SEO_TITLE_HARD_MAX + 10} />
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
                            {uploadStep === "uploading" && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500"><span>Uploading image…</span><span className="font-semibold tabular-nums">{uploadProgress}%</span></div>
                                    <ProgressBar value={uploadProgress} />
                                    <button type="button" onClick={handleCancelUpload} className="text-xs text-red-500 hover:text-red-700 font-medium underline">Cancel upload</button>
                                </div>
                            )}
                            {uploadStep === "saving" && <div className="flex items-center gap-2 text-xs text-gray-500"><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />Saving to database…</div>}
                            {uploadStep === "done" && <div className="flex items-center gap-2 text-xs text-green-600 font-medium"><CheckCircle2 className="w-4 h-4" />Saved! Redirecting…</div>}
                            <div className="space-y-2">
                                <button type="button" onClick={() => updateCardHandler("draft")} disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50">
                                    {saving && uploadStep === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Draft
                                </button>
                                <button type="button" onClick={() => updateCardHandler("published")} disabled={saving || uploadStep === "done"}
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
                                        <img src={imagePreview} alt={imageAlt || "Card featured image"} className="w-full max-h-44 object-cover bg-gray-100" />
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

                        {/* Checklist */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2.5">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Checklist</h2>

                            <p className="text-[13px] text-gray-500 font-semibold mt-2">Card Basic Details</p>
                            {checklistItems.slice(0, 12).map(({ label, done }) => (
                                <div key={label} className="flex items-center justify-between text-xs">
                                    <span className={done ? "text-gray-600" : "text-gray-400"}>{label}</span>
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? "bg-green-100" : "bg-gray-100"}`}>
                                        {done ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                    </span>
                                </div>
                            ))}

                            <hr className="my-2 border-gray-200" />
                            <p className="text-[13px] text-gray-500 font-semibold mt-2">Compare Card</p>
                            {checklistItems.slice(12, 19).map(({ label, done }) => (
                                <div key={label} className="flex items-center justify-between text-xs">
                                    <span className={done ? "text-gray-600" : "text-gray-400"}>{label}</span>
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? "bg-green-100" : "bg-gray-100"}`}>
                                        {done ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                    </span>
                                </div>
                            ))}

                            <hr className="my-2 border-gray-200" />
                            <p className="text-[13px] text-gray-500 font-semibold mt-2">SEO Settings</p>
                            {checklistItems.slice(19).map(({ label, done }) => (
                                <div key={label} className="flex items-center justify-between text-xs">
                                    <span className={done ? "text-gray-600" : "text-gray-400"}>{label}</span>
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? "bg-green-100" : "bg-gray-100"}`}>
                                        {done ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* View live */}
                        {formData.status === "published" && (
                            <button onClick={() => router.push(`/leadtree/credit-cards/view-cards/${id}`)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition">
                                <Eye className="w-4 h-4" />View Live Card
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}