"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { emitAlert } from "@/lib/alertBus";
// import { createSale, updateSale } from "../service/sales.service";
import {
  X,
  Loader2,
  Type,
  Link,
  Tag,
  Image as ImageIcon,
  DollarSign,
  AlignLeft,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
} from "lucide-react";

/* ─────────────────────────────────────────
   Primitive UI components (match VideoModal)
───────────────────────────────────────── */

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
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition
        ${
          error
            ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
            : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
        }
        ${props.readOnly || props.disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
        ${className}`}
    />
  );
}

function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition resize-none
        ${
          error
            ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
            : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
        }`}
    />
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">
          {title}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Image Uploader (URL + file upload)
   Mirrors ThumbnailUploader from VideoModal
───────────────────────────────────────── */

function ImageUploader({
  imageType,
  setImageType,
  imageUrl,
  setImageUrl,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  errors,
  setErrors,
  fieldKey = "image",
  loading,
}) {
  const inputRef = useRef(null);

  const processFile = useCallback(
    (selected) => {
      if (!selected) return;
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(selected.type)) {
        setErrors((p) => ({ ...p, [fieldKey]: "Only JPG, PNG or WebP files are allowed" }));
        return;
      }
      if (selected.size > 2 * 1024 * 1024) {
        setErrors((p) => ({ ...p, [fieldKey]: "File size must be under 2MB" }));
        return;
      }
      if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
      setImageFile(selected);
      setImagePreview(URL.createObjectURL(selected));
      setErrors((p) => ({ ...p, [fieldKey]: undefined }));
    },
    [imagePreview, imageFile, fieldKey, setErrors, setImageFile, setImagePreview]
  );

  const removeImage = () => {
    if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setImageType("url");
            removeImage();
          }}
          className={`px-3 py-1 rounded-lg text-xs transition ${
            imageType === "url" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => {
            setImageType("upload");
            setImageUrl("");
          }}
          className={`px-3 py-1 rounded-lg text-xs transition ${
            imageType === "upload" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Upload
        </button>
      </div>

      {imageType === "url" ? (
        <div className="space-y-3">
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImagePreview(e.target.value || null);
              setErrors((p) => ({ ...p, [fieldKey]: undefined }));
            }}
            disabled={loading}
            error={errors[fieldKey]}
          />
          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video w-full max-w-xs">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() =>
                  setErrors((p) => ({ ...p, [fieldKey]: "Could not load image from URL" }))
                }
                onLoad={() => setErrors((p) => ({ ...p, [fieldKey]: undefined }))}
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl("");
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {!imagePreview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                processFile(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition
                ${
                  errors[fieldKey]
                    ? "border-red-300 bg-red-50/30"
                    : "border-gray-200 hover:border-blue-300 bg-gray-50/50 hover:bg-blue-50/20"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  errors[fieldKey] ? "bg-red-100" : "bg-gray-100"
                }`}
              >
                <ImageIcon
                  className={`w-5 h-5 ${errors[fieldKey] ? "text-red-400" : "text-gray-400"}`}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Drop image here or{" "}
                  <span className="text-blue-500 font-medium">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Max 2MB</p>
              </div>
              {errors[fieldKey] && (
                <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors[fieldKey]}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
              <div className="relative group aspect-video w-full max-w-xs">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {imageFile && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t bg-white">
                  <div>
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                      {imageFile.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                </div>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => processFile(e.target.files[0])}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Type config — defines which fields render
───────────────────────────────────────── */

const TYPE_CONFIG = {
  flashSale: {
    label: "Flash Sale",
    hasProductTitle: true,
    hasSubtitle: true,
    hasPricing: true,
    hasDiscount: true,
    hasImage: true,
    hasHeroImage: false,
    sectionLabel: "Product Info",
  },
  trendingSale: {
    label: "Trending Sale",
    hasProductTitle: true,
    hasSubtitle: true,
    hasPricing: true,
    hasDiscount: true,
    hasImage: true,
    hasHeroImage: false,
    sectionLabel: "Product Info",
  },
  dealOfTheDay: {
    label: "Deal of the Day",
    hasProductTitle: false,
    hasSubtitle: true,
    hasPricing: false,
    hasDiscount: false,
    hasImage: true,
    hasHeroImage: false,
    sectionLabel: "Category Info",
  },
  hero: {
    label: "Hero",
    hasProductTitle: false,
    hasSubtitle: true,
    hasPricing: false,
    hasDiscount: false,
    hasImage: false,
    hasHeroImage: true,
    sectionLabel: "Hero Content",
  },
};

const TYPES = Object.keys(TYPE_CONFIG);

/* ─────────────────────────────────────────
   Main Modal
───────────────────────────────────────── */

export default function SaleModal({ sales = [], onClose, onSave, initialData }) {
  const isEdit = !!initialData;

  /* ── Type ── */
  const [type, setType] = useState(initialData?.type || "flashSale");
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.flashSale;

  /* ── Shared fields ── */
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaLink, setCtaLink] = useState("");

  /* ── flashSale / trendingSale specific ── */
  const [productTitle, setProductTitle] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [discount, setDiscount] = useState("");

  /* ── hero specific ── */
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");

  /* ── Image state (main image) ── */
  const [imageType, setImageType] = useState("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  /* ── Hero image state ── */
  const [heroImageType, setHeroImageType] = useState("url");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);

  /* ── Misc ── */
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle");

  /* ── Populate fields from initialData ── */
  useEffect(() => {
    if (!initialData) return;

    const t = initialData.type || "flashSale";
    setType(t);

    // Reset all
    setTitle("");
    setSubtitle("");
    setCtaLink("");
    setProductTitle("");
    setPrice("");
    setOldPrice("");
    setDiscount("");
    setHeadline("");
    setSubtext("");
    setImageUrl("");
    setImagePreview(null);
    setImageFile(null);
    setHeroImageUrl("");
    setHeroImagePreview(null);
    setHeroImageFile(null);

    if (t === "flashSale" || t === "trendingSale") {
      setTitle(initialData.title || "");
      setSubtitle(initialData.subtitle || "");
      setProductTitle(initialData.productTitle || "");
      setImageUrl(initialData.image || "");
      setImagePreview(initialData.image || null);
      setPrice(initialData.price || "");
      setOldPrice(initialData.oldPrice || "");
      setDiscount(initialData.discount || "");
      setCtaLink(initialData.ctaLink || "");
    } else if (t === "dealOfTheDay") {
      setTitle(initialData.title || "");
      setSubtitle(initialData.subtitle || "");
      setImageUrl(initialData.image || "");
      setImagePreview(initialData.image || null);
      setCtaLink(initialData.link || "");
    } else if (t === "hero") {
      setTitle(initialData.headline || "");
      setSubtitle(initialData.subtext || "");
      setCtaLink(initialData.ctaLink || "");
      setHeroImageUrl(initialData.heroImage || "");
      setHeroImagePreview(initialData.heroImage || null);
    }
  }, [initialData]);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Required";
    if (!ctaLink.trim()) e.ctaLink = "Required";
    else {
      try {
        new URL(ctaLink);
      } catch {
        e.ctaLink = "Enter a valid URL (include https://)";
      }
    }

    if (config.hasProductTitle && !productTitle.trim()) e.productTitle = "Required";

    if (config.hasPricing) {
      if (!price.trim()) e.price = "Required";
      if (!oldPrice.trim()) e.oldPrice = "Required";
    }

    if (config.hasImage && imageType === "url" && !imageUrl.trim()) {
      e.image = "Image URL is required";
    }
    if (config.hasHeroImage && heroImageType === "url" && !heroImageUrl.trim()) {
      e.heroImage = "Hero image URL is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Save ── */
  const saveSale = async () => {
    if (!validate()) return;
    setLoading(true);
    setStep("saving");

    try {
      // Resolve image URLs (file upload → in a real app you'd upload to storage first)
      const resolvedImage = imageType === "url" ? imageUrl : imagePreview || "";
      const resolvedHeroImage = heroImageType === "url" ? heroImageUrl : heroImagePreview || "";

      let payload = {};

      if (type === "flashSale" || type === "trendingSale") {
        payload = {
          type,
          title: title.trim(),
          subtitle: subtitle.trim(),
          productTitle: productTitle.trim(),
          image: resolvedImage,
          price: price.trim(),
          oldPrice: oldPrice.trim(),
          discount: discount.trim(),
          ctaLink: ctaLink.trim(),
        };
      } else if (type === "dealOfTheDay") {
        payload = {
          type,
          title: title.trim(),
          subtitle: subtitle.trim(),
          image: resolvedImage,
          link: ctaLink.trim(),
        };
      } else if (type === "hero") {
        payload = {
          type,
          headline: title.trim(),
          subtext: subtitle.trim(),
          ctaLink: ctaLink.trim(),
          heroImage: resolvedHeroImage,
        };
      }

      const id = initialData?.id || Date.now();

      // Uncomment when backend ready:
      // if (isEdit) {
      //   await updateSale(initialData.firestoreId, payload);
      // } else {
      //   id = await createSale(payload);
      // }

      onSave({ ...payload, id, createdAt: initialData?.createdAt || new Date().toISOString() });

      setStep("done");
      emitAlert({ type: "success", message: isEdit ? "Sale updated!" : "Sale created!" });
      setTimeout(onClose, 500);
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to save. Please try again." });
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  /* ── Type switch: reset field-specific state ── */
  const handleTypeSwitch = (t) => {
    setType(t);
    setErrors({});
    setTitle("");
    setSubtitle("");
    setCtaLink("");
    setProductTitle("");
    setPrice("");
    setOldPrice("");
    setDiscount("");
    setImageUrl("");
    setImagePreview(null);
    setImageFile(null);
    setHeroImageUrl("");
    setHeroImagePreview(null);
    setHeroImageFile(null);
  };

  const stepLabel = {
    idle: isEdit ? "Update Sale" : "Create Sale",
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
              {isEdit ? "Edit Sale" : "New Sale"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit
                ? "Update the sale details below."
                : "Configure sale type, content and media."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* TYPE SELECTOR */}
          <Field label="Sale Type">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeSwitch(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    type === t
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </Field>

          {/* ── BASIC INFO ── */}
          <Section title={config.sectionLabel}>
            {/* Title row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={type === "hero" ? "Headline" : "Title"}
                icon={<Type className="w-3.5 h-3.5" />}
                required
                error={errors.title}
              >
                <Input
                  placeholder={type === "hero" ? "e.g. Discover the Best Sales" : "e.g. Electronics"}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((p) => ({ ...p, title: undefined }));
                  }}
                  error={errors.title}
                  disabled={loading}
                />
              </Field>

              {/* Subtitle */}
              <Field
                label={type === "hero" ? "Subtext" : "Subtitle"}
                icon={<AlignLeft className="w-3.5 h-3.5" />}
                error={errors.subtitle}
              >
                <Input
                  placeholder={
                    type === "hero"
                      ? "e.g. Find trending sales near you"
                      : "e.g. Best prices on gadgets"
                  }
                  value={subtitle}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    setErrors((p) => ({ ...p, subtitle: undefined }));
                  }}
                  error={errors.subtitle}
                  disabled={loading}
                />
              </Field>
            </div>

            {/* CTA Link */}
            <Field
              label="CTA Link"
              icon={<Link className="w-3.5 h-3.5" />}
              required
              error={errors.ctaLink}
              hint="Full URL the button will navigate to"
            >
              <Input
                placeholder="https://..."
                value={ctaLink}
                onChange={(e) => {
                  setCtaLink(e.target.value);
                  setErrors((p) => ({ ...p, ctaLink: undefined }));
                }}
                error={errors.ctaLink}
                disabled={loading}
              />
            </Field>
          </Section>

          {/* ── PRODUCT INFO (flashSale / trendingSale only) ── */}
          {config.hasProductTitle && (
            <Section title="Product Details">
              <Field
                label="Product Title"
                icon={<Tag className="w-3.5 h-3.5" />}
                required
                error={errors.productTitle}
                hint="Full product name displayed on the card"
              >
                <Input
                  placeholder='e.g. LG 77" OLED 4K UHD Smart TV'
                  value={productTitle}
                  onChange={(e) => {
                    setProductTitle(e.target.value);
                    setErrors((p) => ({ ...p, productTitle: undefined }));
                  }}
                  error={errors.productTitle}
                  disabled={loading}
                />
              </Field>

              {config.hasPricing && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field
                    label="Sale Price"
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                    required
                    error={errors.price}
                  >
                    <Input
                      placeholder="₹1,16,200"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        setErrors((p) => ({ ...p, price: undefined }));
                      }}
                      error={errors.price}
                      disabled={loading}
                    />
                  </Field>

                  <Field
                    label="Original Price"
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                    required
                    error={errors.oldPrice}
                  >
                    <Input
                      placeholder="₹2,49,000"
                      value={oldPrice}
                      onChange={(e) => {
                        setOldPrice(e.target.value);
                        setErrors((p) => ({ ...p, oldPrice: undefined }));
                      }}
                      error={errors.oldPrice}
                      disabled={loading}
                    />
                  </Field>

                  <Field
                    label="Discount Label"
                    error={errors.discount}
                    hint='e.g. "Save ₹1,32,800"'
                  >
                    <Input
                      placeholder="Save ₹1,32,800"
                      value={discount}
                      onChange={(e) => {
                        setDiscount(e.target.value);
                        setErrors((p) => ({ ...p, discount: undefined }));
                      }}
                      error={errors.discount}
                      disabled={loading}
                    />
                  </Field>
                </div>
              )}
            </Section>
          )}

          {/* ── MAIN IMAGE (flashSale / trendingSale / dealOfTheDay) ── */}
          {config.hasImage && (
            <Section title="Product Image">
              <Field
                label="Image"
                icon={<ImageIcon className="w-3.5 h-3.5" />}
                required
                error={errors.image}
                hint="JPG, PNG or WebP · Max 2MB · Recommended 4:3 ratio"
              >
                <ImageUploader
                  imageType={imageType}
                  setImageType={setImageType}
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  imagePreview={imagePreview}
                  setImagePreview={setImagePreview}
                  errors={errors}
                  setErrors={setErrors}
                  fieldKey="image"
                  loading={loading}
                />
              </Field>
            </Section>
          )}

          {/* ── HERO IMAGE (hero only) ── */}
          {config.hasHeroImage && (
            <Section title="Hero Image">
              <Field
                label="Hero Image"
                icon={<ImageIcon className="w-3.5 h-3.5" />}
                required
                error={errors.heroImage}
                hint="JPG, PNG or WebP · Max 2MB · Recommended 16:9 ratio"
              >
                <ImageUploader
                  imageType={heroImageType}
                  setImageType={setHeroImageType}
                  imageUrl={heroImageUrl}
                  setImageUrl={setHeroImageUrl}
                  imageFile={heroImageFile}
                  setImageFile={setHeroImageFile}
                  imagePreview={heroImagePreview}
                  setImagePreview={setHeroImagePreview}
                  errors={errors}
                  setErrors={setErrors}
                  fieldKey="heroImage"
                  loading={loading}
                />
              </Field>
            </Section>
          )}

          {/* Saving indicator */}
          {step === "saving" && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              Saving to database…
            </div>
          )}
          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {isEdit ? "Sale updated!" : "Sale created!"}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">
            {isEdit ? (
              "Changes will update the sale immediately."
            ) : (
              <>
                <span className="font-semibold text-gray-600">Add</span> a{" "}
                {TYPE_CONFIG[type].label} to the homepage.
              </>
            )}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={saveSale}
              disabled={loading || step === "done"}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-sm"
            >
              {loading && step !== "done" && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {step === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {stepLabel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}