"use client";

/**
 * "Post an ad" — the six-step sell flow.
 *
 * Everything lives in this one client component on purpose: the steps share a
 * single draft object, and splitting them across components would mean either
 * lifting that draft anyway or losing entered values on Back.
 *
 * Two things here are easy to get wrong and are handled deliberately:
 *
 * 1. Photo previews are `URL.createObjectURL` blobs — full resolution, free,
 *    and valid only while this document lives. They are for previews ONLY:
 *    posting converts the kept photos to small JPEG data URLs (see
 *    ./photoStorage) and persists those, so My ads keeps its covers across a
 *    reload. Every blob URL is revoked when its photo is removed, when the
 *    ad is posted, or when the wizard unmounts — nothing outlives the wizard.
 * 2. The default city comes from the persisted store, so it must not be read
 *    until `useHydrated()` is true or the first client render would disagree
 *    with the server HTML.
 */

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Info,
  Loader2,
  MapPin,
  PartyPopper,
  Trash2,
} from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import AdQualityScore from "../components/AdQualityScore";
import { getCategoryIcon } from "../components/categoryIcons";
import { Note } from "../components/primitives";
import { ATTRIBUTE_TYPES, getAllCategories, getCategory } from "../data/categories";
import { getAllCities, getCity } from "../data/cities";
import { formatPrice, getPriceStats } from "../data/listings";
import { getMarket } from "../data/market";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";
import {
  THUMBNAIL_BUDGET_BYTES,
  THUMBNAIL_MAX_EDGE,
  estimateStoredSize,
  toThumbnail,
} from "./photoStorage";

// English stays here as source of truth; render sites resolve
// `post.step.<key>` / `post.step.<key>.heading` with these as fallbacks.
const STEPS = [
  { key: "category", label: "Category", heading: "What are you selling?" },
  { key: "details", label: "Details", heading: "Describe your item" },
  { key: "photos", label: "Photos", heading: "Add photos" },
  { key: "price", label: "Price", heading: "Set your price" },
  { key: "location", label: "Location", heading: "Where is it?" },
  { key: "review", label: "Review", heading: "Review and post" },
];

const TITLE_MAX = 70;
const TITLE_MIN = 10;
const DESC_MAX = 4000;
const DESC_MIN = 20;
const MAX_PHOTOS = 8;
const PRICE_MAX = 100000000;
const FREE_CATEGORY = "free-giveaway";

const FIELD =
  "w-full rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-sm text-(--foreground) outline-none focus-visible:border-(--primary) focus-visible:ring-2 focus-visible:ring-(--primary)";
const LABEL = "block text-xs font-bold uppercase tracking-wide text-(--muted-foreground)";
const ERROR_TEXT = "mt-1 flex items-center gap-1 text-xs font-semibold text-(--bzr-urgent)";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** First `select` attribute of a category — the one buyers filter on first. */
function requiredAttributeKey(category) {
  const first = category?.attributes?.find((a) => a.type === ATTRIBUTE_TYPES.SELECT);
  return first ? first.key : null;
}

/**
 * Mirrors STORAGE_KEY in `../hooks/useBazaarStore.js`. The store deliberately
 * keeps that constant private and the file is shared with other work in
 * flight, so the wizard duplicates the literal rather than widening the
 * store's surface. If the key ever changes, `isAdStored` starts reporting
 * false and posting degrades to the "may not survive a reload" notice —
 * annoying, but honest and non-destructive.
 */
const STORE_STORAGE_KEY = "altf-bazaar-state-v1";

/**
 * Did the store's best-effort persist actually land this ad in localStorage?
 *
 * `persist()` swallows QuotaExceededError by design — a full disk silently
 * drops the WHOLE write, leaving the ad in memory but not across reloads.
 * Reading the entry back is the only reliable signal, and it is what lets the
 * submit path retry with smaller thumbnails instead of lying about success.
 */
function isAdStored(id) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed?.myAds) && parsed.myAds.some((a) => a?.id === id);
  } catch {
    return false;
  }
}

export default function PostAdWizard() {
  // The DRAFT is data and stays exactly what the seller typed; attribute
  // option VALUES ("Diesel") also stay English because they are the stored
  // values a filter later matches on. Only labels, headings, buttons and
  // validation messages localise. Errors are recomputed every render, so a
  // locale flip re-resolves them with no extra plumbing.
  const { t, categoryName, subcategoryName, attributeLabel } = useLocale();
  const uid = useId();
  const hydrated = useHydrated();
  const storeCity = useBazaarStore((s) => s.citySlug);
  const myAds = useBazaarStore((s) => s.myAds);
  const addMyAd = useBazaarStore((s) => s.addMyAd);
  const removeMyAd = useBazaarStore((s) => s.removeMyAd);

  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState({});

  const [categorySlug, setCategorySlug] = useState("");
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [attrs, setAttrs] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoNotice, setPhotoNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(true);
  const [cityOverride, setCityOverride] = useState(null);
  const [locality, setLocality] = useState("");
  const [posted, setPosted] = useState(null);
  // How the posted ad's photos fared: `{ saved, total, trimmed, storage }`.
  // Kept out of the ad object on purpose — it describes this submit, not the ad.
  const [postedPhotos, setPostedPhotos] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const headingRef = useRef(null);
  const photoSeq = useRef(0);
  const photosRef = useRef(photos);
  const firstRender = useRef(true);

  const categories = useMemo(() => getAllCategories(), []);
  const cities = useMemo(() => getAllCities(), []);
  const category = categorySlug ? getCategory(categorySlug) : null;
  const subcategory = category?.subcategories.find((s) => s.slug === subcategorySlug) || null;

  // The default city comes from the persisted store, but only once hydration
  // has happened — deriving it here rather than in an effect keeps the first
  // client render identical to the server HTML without a second render pass.
  const citySlug =
    cityOverride ?? (hydrated && storeCity && getCity(storeCity) ? storeCity : "");
  const city = citySlug ? getCity(citySlug) : null;
  const isFreeCategory = categorySlug === FREE_CATEGORY;
  const requiredAttr = requiredAttributeKey(category);
  const priceStats = useMemo(
    () => (categorySlug ? getPriceStats(categorySlug) : null),
    [categorySlug],
  );

  /* ---------------------------------------------------------------
     Object URL bookkeeping
     ------------------------------------------------------------- */

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      // Posting persists thumbnails, so no blob URL is ever handed to another
      // page any more — everything still alive at unmount is ours to revoke.
      // (Revoking a URL the submit path already revoked is a silent no-op.)
      for (const photo of photosRef.current) {
        URL.revokeObjectURL(photo.url);
      }
    };
  }, []);

  /* ---------------------------------------------------------------
     Focus the step heading whenever the step changes
     ------------------------------------------------------------- */

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, posted]);

  /* ---------------------------------------------------------------
     Validation
     ------------------------------------------------------------- */

  const errors = {};
  if (step === 0) {
    if (!categorySlug) errors.category = t("post.error.category");
    else if (!subcategorySlug) errors.subcategory = t("post.error.subcategory");
  } else if (step === 1) {
    const cleanTitle = title.trim();
    if (!cleanTitle) errors.title = t("post.error.title");
    else if (cleanTitle.length < TITLE_MIN)
      errors.title = t("post.error.titleMin", { min: TITLE_MIN });
    else if (title.length > TITLE_MAX)
      errors.title = t("post.error.titleMax", { max: TITLE_MAX });

    const cleanDescription = description.trim();
    if (!cleanDescription) errors.description = t("post.error.description");
    else if (cleanDescription.length < DESC_MIN)
      errors.description = t("post.error.descMin", { min: DESC_MIN });
    else if (description.length > DESC_MAX)
      errors.description = t("post.error.descMax", { max: DESC_MAX });

    for (const attr of category?.attributes || []) {
      const value = attrs[attr.key];
      const label = attributeLabel(attr.key, attr.label);
      if (attr.key === requiredAttr && !value) {
        errors[`attr:${attr.key}`] = t("post.error.attrRequired", { label });
        continue;
      }
      if (attr.type === ATTRIBUTE_TYPES.RANGE && value !== "" && value != null) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
          errors[`attr:${attr.key}`] = t("post.error.attrNumber", { label });
        } else if (numeric < attr.min || numeric > attr.max) {
          errors[`attr:${attr.key}`] = t("post.error.attrRange", {
            label,
            min: attr.min.toLocaleString("en-IN"),
            max: attr.max.toLocaleString("en-IN"),
            unit: attr.unit ? ` ${attr.unit}` : "",
          });
        }
      }
    }
  } else if (step === 2) {
    if (photos.length === 0) errors.photos = t("post.error.photos");
  } else if (step === 3) {
    if (!isFreeCategory) {
      if (price === "") errors.price = t("post.error.price");
      else {
        const numeric = Number(price);
        if (!Number.isFinite(numeric) || numeric < 0) errors.price = t("post.error.priceNegative");
        else if (numeric > PRICE_MAX)
          errors.price = t("post.error.priceMax", { max: formatPrice(PRICE_MAX) });
      }
    }
  } else if (step === 4) {
    if (!citySlug) errors.city = t("post.error.city");
    else if (!locality) errors.locality = t("post.error.locality");
  }

  const errorList = Object.values(errors);
  const stepValid = errorList.length === 0;
  const showErrors = Boolean(attempted[step]);

  function markAttempted() {
    setAttempted((current) => (current[step] ? current : { ...current, [step]: true }));
  }

  function goTo(index) {
    if (index > step) return;
    setStep(index);
  }

  function goNext() {
    if (!stepValid) {
      markAttempted();
      return;
    }
    setAttempted((current) => ({ ...current, [step]: true }));
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  /* ---------------------------------------------------------------
     Step 1 — category
     ------------------------------------------------------------- */

  function chooseCategory(slug) {
    if (slug === categorySlug) return;
    setCategorySlug(slug);
    setSubcategorySlug("");
    setAttrs({});
    if (slug === FREE_CATEGORY) {
      setPrice("0");
      setNegotiable(false);
    } else if (price === "0") {
      setPrice("");
    }
  }

  /* ---------------------------------------------------------------
     Step 3 — photos
     ------------------------------------------------------------- */

  function acceptFiles(fileList) {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    const images = incoming.filter((file) => file.type.startsWith("image/"));
    const room = MAX_PHOTOS - photos.length;
    const accepted = images.slice(0, Math.max(0, room));

    const notices = [];
    if (images.length < incoming.length) notices.push(t("post.error.imagesOnly"));
    if (accepted.length < images.length)
      notices.push(t("post.error.tooManyPhotos", { max: MAX_PHOTOS }));
    setPhotoNotice(notices.join(" "));

    if (accepted.length === 0) return;

    const created = accepted.map((file) => {
      photoSeq.current += 1;
      return {
        id: `photo-${photoSeq.current}`,
        name: file.name,
        // Blob URL for the live preview; the File itself rides along because
        // submit-time thumbnailing decodes the blob, not the URL. Holding the
        // reference costs a handle, not a copy of the bytes.
        file,
        url: URL.createObjectURL(file),
      };
    });
    setPhotos((current) => [...current, ...created]);
  }

  function removePhoto(id) {
    // Revoked here rather than inside the updater: state updaters must stay
    // pure, and React calls them twice in development.
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setPhotos((current) => current.filter((p) => p.id !== id));
    setPhotoNotice("");
  }

  function movePhoto(id, direction) {
    setPhotos((current) => {
      const index = current.findIndex((p) => p.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  /* ---------------------------------------------------------------
     Submit
     ------------------------------------------------------------- */

  async function handleSubmit() {
    // Double-submit guard: thumbnailing takes real time, and a second click
    // can land before React re-renders the disabled button.
    if (submitting || posted) return;
    if (!stepValid || !category || !subcategory || !city) return;

    setSubmitting(true);
    try {
      const cleanTitle = title.trim();
      const numericPrice = isFreeCategory ? 0 : Math.round(Number(price) || 0);

      // Unique within myAds, not just `length + 1`: deleting an ad frees a
      // number an existing ad may still hold, and the quota retry below
      // removes and re-adds BY ID — a collision there would eat an older ad.
      let draftNumber = myAds.length + 1;
      while (myAds.some((a) => a.id === `draft-${draftNumber}`)) draftNumber += 1;
      const id = `draft-${draftNumber}`;

      const cleanAttributes = {};
      for (const attr of category.attributes) {
        const value = attrs[attr.key];
        if (value === "" || value == null || value === false) continue;
        cleanAttributes[attr.key] =
          attr.type === ATTRIBUTE_TYPES.RANGE ? Number(value) : value;
      }

      // Convert every kept photo to a persistable thumbnail. Sequentially on
      // purpose — one decode at a time bounds peak memory when the batch is
      // eight phone photos. `null` means undecodable; that photo is skipped
      // rather than sinking the whole submit.
      const converted = [];
      for (const photo of photos) {
        converted.push({ photo, src: await toThumbnail(photo.file) });
      }
      const usable = converted.filter((entry) => entry.src);

      // Budget: persist the leading run of thumbnails that fits and drop the
      // rest — order matters, photo 1 is the cover. The success panel reports
      // exactly how many made it.
      const takeWithinBudget = (entries) => {
        const kept = [];
        let used = 0;
        for (const entry of entries) {
          const size = estimateStoredSize([entry.src]);
          if (used + size > THUMBNAIL_BUDGET_BYTES) break;
          kept.push(entry);
          used += size;
        }
        return kept;
      };
      const toImages = (entries) =>
        entries.map((entry, index) => ({
          src: entry.src,
          alt: `${cleanTitle} — photo ${index + 1}`,
        }));

      let persisted = takeWithinBudget(usable);
      let images = toImages(persisted);
      let trimmed = false;
      let storage = "ok";

      const baseAd = {
        id,
        slug: `${slugify(title) || "my-ad"}-${id}`,
        title: cleanTitle,
        price: numericPrice,
        priceLabel: formatPrice(numericPrice),
        pricePeriod: null,
        negotiable: numericPrice > 0 && negotiable,
        categorySlug: category.slug,
        categoryName: category.name,
        subcategorySlug: subcategory.slug,
        subcategoryName: subcategory.name,
        citySlug: city.slug,
        cityName: city.name,
        stateName: city.stateName,
        locality,
        attributes: cleanAttributes,
        description: description.trim(),
        images,
        sellerId: null,
        postedDaysAgo: 0,
        featured: false,
        spotlight: false,
        urgent: false,
        views: 0,
        saves: 0,
        status: "active",
      };

      addMyAd(baseAd);
      let stored = isAdStored(id);

      // The store's persist() swallows QuotaExceededError, and a failed write
      // drops EVERYTHING in it — the ad would exist until the next reload and
      // then vanish. Retry once with thumbnails at half the edge (~¼ of the
      // bytes), then once with no images at all: the ad's text is worth
      // keeping even when its photos are not.
      if (!stored && usable.length > 0) {
        const reconverted = [];
        for (const entry of usable) {
          const src = await toThumbnail(entry.photo.file, {
            maxEdge: Math.floor(THUMBNAIL_MAX_EDGE / 2),
          });
          if (src) reconverted.push({ photo: entry.photo, src });
        }
        persisted = takeWithinBudget(reconverted);
        images = toImages(persisted);
        trimmed = true;
        removeMyAd(id);
        addMyAd({ ...baseAd, images });
        stored = isAdStored(id);
      }
      if (!stored && images.length > 0) {
        removeMyAd(id);
        addMyAd({ ...baseAd, images: [] });
        stored = isAdStored(id);
        if (stored) {
          storage = "no-images";
          persisted = [];
          images = [];
          trimmed = false;
        }
      }
      if (!stored) {
        // This browser is keeping nothing (private mode, or quota exhausted
        // by other data). Put the best thumbnails back in the in-memory copy
        // so the session at least looks right, and say so on the panel.
        storage = "unpersisted";
        if (images.length > 0) {
          removeMyAd(id);
          addMyAd({ ...baseAd, images });
        }
      }

      // With thumbnails persisted there is no consumer of the blob URLs left
      // anywhere, so revoke them all now and clear the list — unmount then
      // has nothing to leak and nothing renders a dead URL.
      for (const photo of photos) URL.revokeObjectURL(photo.url);
      setPhotos([]);

      setPostedPhotos({
        saved: persisted.length,
        total: photos.length,
        trimmed,
        storage,
      });
      setPosted({ ...baseAd, images });
    } finally {
      setSubmitting(false);
    }
  }

  function postAnother() {
    // Submit already revoked every blob URL and emptied `photos`; the resets
    // here just return the draft to a blank slate.
    setPhotos([]);
    setPostedPhotos(null);
    setPhotoNotice("");
    setCategorySlug("");
    setSubcategorySlug("");
    setAttrs({});
    setTitle("");
    setDescription("");
    setPrice("");
    setNegotiable(true);
    setLocality("");
    setAttempted({});
    setPosted(null);
    setStep(0);
  }

  /* ---------------------------------------------------------------
     Rendering helpers (plain functions, not components — they close over
     the draft and must not remount on every keystroke)
     ------------------------------------------------------------- */

  function fieldError(key) {
    if (!showErrors || !errors[key]) return null;
    return (
      <p className={ERROR_TEXT} id={`${uid}-${key}-error`}>
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {errors[key]}
      </p>
    );
  }

  function renderAttribute(attr) {
    const id = `${uid}-attr-${attr.key}`;
    const errorKey = `attr:${attr.key}`;
    const invalid = showErrors && Boolean(errors[errorKey]);
    const describedBy = invalid ? `${uid}-${errorKey}-error` : undefined;
    const value = attrs[attr.key];
    const isRequired = attr.key === requiredAttr;

    const label = attributeLabel(attr.key, attr.label);

    if (attr.type === ATTRIBUTE_TYPES.TOGGLE) {
      return (
        <div key={attr.key}>
          <label className="bzr-filter-option" htmlFor={id}>
            <input
              id={id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(event) =>
                setAttrs((current) => ({ ...current, [attr.key]: event.target.checked }))
              }
            />
            <span>{label}</span>
          </label>
        </div>
      );
    }

    return (
      <div key={attr.key}>
        <label className={LABEL} htmlFor={id}>
          {label}
          {isRequired ? <span className="text-(--bzr-urgent)"> *</span> : null}
        </label>

        {attr.type === ATTRIBUTE_TYPES.SELECT ? (
          <select
            id={id}
            className={`${FIELD} mt-1`}
            value={value || ""}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(event) =>
              setAttrs((current) => ({ ...current, [attr.key]: event.target.value }))
            }
          >
            <option value="">{t("post.selectAttr", { label: String(label).toLowerCase() })}</option>
            {attr.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : attr.type === ATTRIBUTE_TYPES.RANGE ? (
          <div className="mt-1 flex items-center gap-2">
            <input
              id={id}
              type="number"
              inputMode="numeric"
              className={FIELD}
              value={value ?? ""}
              min={attr.min}
              max={attr.max}
              step={1}
              placeholder={`${attr.min.toLocaleString("en-IN")} – ${attr.max.toLocaleString("en-IN")}`}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              onChange={(event) =>
                setAttrs((current) => ({ ...current, [attr.key]: event.target.value }))
              }
            />
            {attr.unit ? (
              <span className="shrink-0 text-xs font-semibold text-(--muted-foreground)">
                {attr.unit}
              </span>
            ) : null}
          </div>
        ) : (
          <input
            id={id}
            type="text"
            className={`${FIELD} mt-1`}
            value={value || ""}
            maxLength={80}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(event) =>
              setAttrs((current) => ({ ...current, [attr.key]: event.target.value }))
            }
          />
        )}

        {fieldError(errorKey)}
      </div>
    );
  }

  function renderCategoryStep() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-3 text-sm text-(--muted-foreground)">{t("post.categoryIntro")}</p>
          <div className="bzr-cat-grid" role="group" aria-label={t("post.categoriesAria")}>
            {categories.map((item) => {
              const Icon = getCategoryIcon(item.icon);
              const active = item.slug === categorySlug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  className="bzr-cat-tile"
                  aria-pressed={active}
                  onClick={() => chooseCategory(item.slug)}
                  style={
                    active
                      ? {
                          borderColor: "var(--primary)",
                          background: "var(--bzr-soft)",
                        }
                      : undefined
                  }
                >
                  <span className="bzr-cat-icon">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="bzr-cat-name">{categoryName(item.slug, item.name)}</span>
                </button>
              );
            })}
          </div>
          {fieldError("category")}
        </div>

        {category ? (
          <div>
            <h3 className="mb-2 text-sm font-bold text-(--foreground)">
              {t("post.subcategoryIn", { category: categoryName(category.slug, category.name) })}
            </h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("post.subcategoriesAria")}>
              {category.subcategories.map((sub) => {
                const active = sub.slug === subcategorySlug;
                return (
                  <button
                    key={sub.slug}
                    type="button"
                    className={`bzr-chip${active ? " is-active" : ""}`}
                    aria-pressed={active}
                    onClick={() => setSubcategorySlug(sub.slug)}
                  >
                    {active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                    {subcategoryName(sub.slug, sub.name)}
                  </button>
                );
              })}
            </div>
            {fieldError("subcategory")}
          </div>
        ) : null}
      </div>
    );
  }

  function renderDetailsStep() {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <label className={LABEL} htmlFor={`${uid}-title`}>
            {t("post.field.title")} <span className="text-(--bzr-urgent)">*</span>
          </label>
          <input
            id={`${uid}-title`}
            type="text"
            className={`${FIELD} mt-1`}
            value={title}
            maxLength={TITLE_MAX}
            placeholder={
              category
                ? t("post.titlePlaceholder", {
                    example: subcategoryName(
                      category.subcategories[0].slug,
                      category.subcategories[0].name,
                    ),
                  })
                : t("post.field.title")
            }
            aria-invalid={(showErrors && Boolean(errors.title)) || undefined}
            aria-describedby={`${uid}-title-count`}
            onChange={(event) => setTitle(event.target.value)}
          />
          <p
            id={`${uid}-title-count`}
            className="mt-1 text-end text-xs text-(--muted-foreground)"
          >
            {title.length}/{TITLE_MAX}
          </p>
          {fieldError("title")}
        </div>

        <div>
          <label className={LABEL} htmlFor={`${uid}-description`}>
            {t("post.field.description")} <span className="text-(--bzr-urgent)">*</span>
          </label>
          <textarea
            id={`${uid}-description`}
            className={`${FIELD} mt-1 min-h-32 resize-y`}
            value={description}
            maxLength={DESC_MAX}
            placeholder={t("post.descPlaceholder")}
            aria-invalid={(showErrors && Boolean(errors.description)) || undefined}
            aria-describedby={`${uid}-description-count`}
            onChange={(event) => setDescription(event.target.value)}
          />
          <p
            id={`${uid}-description-count`}
            className="mt-1 text-end text-xs text-(--muted-foreground)"
          >
            {description.length}/{DESC_MAX}
          </p>
          {fieldError("description")}
        </div>

        {category ? (
          <fieldset className="rounded-xl border border-(--border) p-4">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
              {t("post.categoryDetails", { category: categoryName(category.slug, category.name) })}
            </legend>
            <p className="mb-3 text-xs text-(--muted-foreground)">
              {t("post.detailsIntro", { category: categoryName(category.slug, category.name) })}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {category.attributes.map((attr) => renderAttribute(attr))}
            </div>
          </fieldset>
        ) : null}
      </div>
    );
  }

  function renderPhotosStep() {
    return (
      <div className="flex flex-col gap-4">
        <div
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragging ? "border-(--primary) bg-(--bzr-soft)" : "border-(--border) bg-(--card)"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            acceptFiles(event.dataTransfer?.files);
          }}
        >
          <ImagePlus className="mx-auto h-8 w-8 text-(--muted-foreground)" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-(--foreground)">{t("post.dragPhotos")}</p>
          <p className="mt-1 text-xs text-(--muted-foreground)">
            {t("post.upTo", { max: MAX_PHOTOS, count: photos.length })}
          </p>
          <button
            type="button"
            className="bzr-btn bzr-btn-secondary mt-3"
            onClick={() => fileInputRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS}
          >
            {t("post.choosePhotos")}
          </button>
          <input
            ref={fileInputRef}
            id={`${uid}-photos`}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label={t("post.choosePhotosAria")}
            onChange={(event) => {
              acceptFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <Note icon={Info}>
          {/* Supersedes `post.photosLocal`, whose "photos disappear when you
              close the tab" stopped being true once posting persists
              thumbnails. New id with an English fallback — the i18n owner can
              add both locales to strings.js without touching this file. */}
          {t(
            "post.photosKeptLocal",
            "Nothing is uploaded. Full-size photos preview from this tab's memory; posting saves small thumbnails in this browser so your ad keeps its pictures.",
          )}
        </Note>

        {photoNotice ? (
          <p className="text-xs font-semibold text-(--bzr-urgent)" role="status">
            {photoNotice}
          </p>
        ) : null}

        {photos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                className="overflow-hidden rounded-xl border border-(--border) bg-(--card)"
              >
                <div className="relative aspect-[4/3] bg-(--bzr-media)">
                  <ManagedImage
                    src={photo.url}
                    alt={`Preview of ${photo.name}`}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 ? (
                    <span className="bzr-badge bzr-badge-featured absolute start-2 top-2">
                      {t("post.coverPhoto")}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-1 px-2 py-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="bzr-chip"
                      onClick={() => movePhoto(photo.id, -1)}
                      disabled={index === 0}
                      aria-label={t("post.movePhotoEarlier", { name: photo.name })}
                    >
                      {/* "Earlier"/"later" follow the photo grid's flow, which
                          mirrors with the interface direction — so these flip,
                          unlike the gallery's physical prev/next. */}
                      <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="bzr-chip"
                      onClick={() => movePhoto(photo.id, 1)}
                      disabled={index === photos.length - 1}
                      aria-label={t("post.movePhotoLater", { name: photo.name })}
                    >
                      <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="bzr-chip"
                    onClick={() => removePhoto(photo.id)}
                    aria-label={t("post.removePhoto", { name: photo.name })}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {fieldError("photos")}
      </div>
    );
  }

  function renderPriceStep() {
    const numericPrice = price === "" ? null : Number(price);
    return (
      <div className="flex flex-col gap-5">
        <div>
          <label className={LABEL} htmlFor={`${uid}-price`}>
            {t("post.field.price")} <span className="text-(--bzr-urgent)">*</span>
          </label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-(--foreground)" aria-hidden="true">
              {getMarket().currencySymbol}
            </span>
            <input
              id={`${uid}-price`}
              type="number"
              inputMode="numeric"
              className={FIELD}
              value={isFreeCategory ? "0" : price}
              min={0}
              max={PRICE_MAX}
              step={1}
              disabled={isFreeCategory}
              placeholder="0"
              aria-invalid={(showErrors && Boolean(errors.price)) || undefined}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          {isFreeCategory ? (
            <p className="mt-1 text-xs text-(--muted-foreground)">
              {t("post.freeFixed", { symbol: getMarket().currencySymbol })}
            </p>
          ) : null}
          {fieldError("price")}
          <p className="mt-2 text-sm text-(--foreground)">
            {t("post.buyersWillSee")}{" "}
            <strong>
              {isFreeCategory
                ? formatPrice(0)
                : numericPrice == null || !Number.isFinite(numericPrice)
                  ? "—"
                  : formatPrice(Math.max(0, Math.round(numericPrice)))}
            </strong>
          </p>
        </div>

        {!isFreeCategory ? (
          <label className="bzr-filter-option" htmlFor={`${uid}-negotiable`}>
            <input
              id={`${uid}-negotiable`}
              type="checkbox"
              checked={negotiable}
              onChange={(event) => setNegotiable(event.target.checked)}
            />
            <span>{t("post.field.negotiable")}</span>
          </label>
        ) : null}

        {priceStats ? (
          <div className="bzr-panel">
            <h3 className="text-sm font-bold text-(--foreground)">
              {t("post.sellsFor", {
                category: category ? categoryName(category.slug, category.name) : "",
              })}
            </h3>
            <div className="bzr-spec-grid mt-3">
              <div>
                <p className="bzr-spec-label">{t("post.medianPrice")}</p>
                <p className="bzr-spec-value">{formatPrice(priceStats.median)}</p>
              </div>
              <div>
                <p className="bzr-spec-label">{t("post.mostAdsBetween")}</p>
                <p className="bzr-spec-value">
                  {formatPrice(priceStats.p25)} – {formatPrice(priceStats.p75)}
                </p>
              </div>
              <div>
                <p className="bzr-spec-label">{t("post.basedOn")}</p>
                <p className="bzr-spec-value">
                  {t("post.liveAds", { count: priceStats.count.toLocaleString("en-IN") })}
                </p>
              </div>
            </div>
            {numericPrice != null && numericPrice > priceStats.p75 ? (
              <p className="mt-3 text-xs font-semibold text-(--bzr-urgent)">
                {t("post.aboveRange", {
                  category: category ? categoryName(category.slug, category.name) : "",
                })}
              </p>
            ) : numericPrice != null && numericPrice > 0 && numericPrice < priceStats.p25 ? (
              <p className="mt-3 text-xs font-semibold text-(--foreground)">
                {t("post.belowRange")}
              </p>
            ) : null}
          </div>
        ) : (
          <Note icon={Info}>{t("post.noPriceHistory")}</Note>
        )}
      </div>
    );
  }

  function renderLocationStep() {
    return (
      <div className="flex flex-col gap-5 sm:max-w-md">
        <div>
          <label className={LABEL} htmlFor={`${uid}-city`}>
            {t("post.field.city")} <span className="text-(--bzr-urgent)">*</span>
          </label>
          <select
            id={`${uid}-city`}
            className={`${FIELD} mt-1`}
            value={citySlug}
            aria-invalid={(showErrors && Boolean(errors.city)) || undefined}
            onChange={(event) => {
              setCityOverride(event.target.value);
              setLocality("");
            }}
          >
            <option value="">{t("post.selectCity")}</option>
            {cities.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
                {item.stateName ? `, ${item.stateName}` : ""}
              </option>
            ))}
          </select>
          {fieldError("city")}
        </div>

        <div>
          <label className={LABEL} htmlFor={`${uid}-locality`}>
            {t("post.field.locality")} <span className="text-(--bzr-urgent)">*</span>
          </label>
          <select
            id={`${uid}-locality`}
            className={`${FIELD} mt-1`}
            value={locality}
            disabled={!city}
            aria-invalid={(showErrors && Boolean(errors.locality)) || undefined}
            onChange={(event) => setLocality(event.target.value)}
          >
            <option value="">{city ? t("post.selectLocality") : t("post.chooseCityFirst")}</option>
            {(city?.localities || []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {fieldError("locality")}
        </div>

        <Note icon={MapPin}>{t("post.localityNote")}</Note>
      </div>
    );
  }

  function renderPreviewCard(draft) {
    const cover = draft.images[0];
    return (
      <article className="bzr-card max-w-64">
        <div className="bzr-card-media">
          {cover ? (
            <ManagedImage src={cover.src} alt={cover.alt} className="h-full w-full object-cover" />
          ) : null}
          {draft.price === 0 ? (
            <div className="bzr-badges">
              <span className="bzr-badge bzr-badge-free">{t("card.free")}</span>
            </div>
          ) : null}
        </div>
        <div className="bzr-card-body">
          <p className={`bzr-card-price${draft.price === 0 ? " is-free" : ""}`}>
            {draft.priceLabel}
          </p>
          <h4 className="bzr-card-title">{draft.title}</h4>
          <div className="bzr-card-meta">
            <span className="bzr-card-place">
              <MapPin className="me-1 inline h-3 w-3" aria-hidden="true" />
              {draft.locality}, {draft.cityName}
            </span>
            <span>{t("post.today")}</span>
          </div>
        </div>
      </article>
    );
  }

  function renderReviewStep() {
    const numericPrice = isFreeCategory ? 0 : Math.max(0, Math.round(Number(price) || 0));
    const draft = {
      title: title.trim(),
      price: numericPrice,
      priceLabel: formatPrice(numericPrice),
      locality,
      cityName: city?.name || "",
      images: photos.map((photo, index) => ({
        src: photo.url,
        alt: `${title.trim()} — photo ${index + 1}`,
      })),
    };

    const filledAttributes = (category?.attributes || [])
      .map((attr) => {
        const value = attrs[attr.key];
        if (value === "" || value == null || value === false) return null;
        const display =
          attr.type === ATTRIBUTE_TYPES.TOGGLE
            ? t("post.yes")
            : attr.type === ATTRIBUTE_TYPES.RANGE
              ? `${Number(value).toLocaleString("en-IN")}${attr.unit ? ` ${attr.unit}` : ""}`
              : String(value);
        return { key: attr.key, label: attributeLabel(attr.key, attr.label), display };
      })
      .filter(Boolean);

    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-5">
          {/* First panel on the review step deliberately: this is the last
              moment a seller will edit anything, and the step dots above are
              still live, so a "+15 for 3 more photos" prompt here is one click
              from being acted on. Every value it reads is already validated by
              the steps behind it. */}
          <AdQualityScore
            ad={{
              title: draft.title,
              description: description.trim(),
              photoCount: photos.length,
              attributes: attrs,
              categorySlug,
              locality,
              price: numericPrice,
            }}
          />

          <div className="bzr-panel">
            <h3 className="text-sm font-bold text-(--foreground)">{t("post.summary")}</h3>
            <dl className="bzr-spec-grid mt-3">
              <div>
                <dt className="bzr-spec-label">{t("post.step.category", "Category")}</dt>
                <dd className="bzr-spec-value">
                  {category ? categoryName(category.slug, category.name) : ""} ›{" "}
                  {subcategory ? subcategoryName(subcategory.slug, subcategory.name) : ""}
                </dd>
              </div>
              <div>
                <dt className="bzr-spec-label">{t("post.field.price")}</dt>
                <dd className="bzr-spec-value">
                  {draft.priceLabel}
                  {draft.price > 0 && negotiable ? t("post.negotiableTag") : ""}
                </dd>
              </div>
              <div>
                <dt className="bzr-spec-label">{t("post.step.location", "Location")}</dt>
                <dd className="bzr-spec-value">
                  {locality}, {city?.name}
                </dd>
              </div>
              <div>
                <dt className="bzr-spec-label">{t("post.step.photos", "Photos")}</dt>
                <dd className="bzr-spec-value">{photos.length}</dd>
              </div>
            </dl>
          </div>

          <div className="bzr-panel">
            <h3 className="text-sm font-bold text-(--foreground)">
              {t("post.titleAndDescription")}
            </h3>
            <p className="mt-2 text-base font-semibold text-(--foreground)">{draft.title}</p>
            <p className="mt-2 whitespace-pre-line text-sm text-(--muted-foreground)">
              {description.trim()}
            </p>
          </div>

          {filledAttributes.length > 0 ? (
            <div className="bzr-panel">
              <h3 className="text-sm font-bold text-(--foreground)">
                {t("post.step.details", "Details")}
              </h3>
              <dl className="bzr-spec-grid mt-3">
                {filledAttributes.map((item) => (
                  <div key={item.key}>
                    <dt className="bzr-spec-label">{item.label}</dt>
                    <dd className="bzr-spec-value">{item.display}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-(--foreground)">{t("post.preview")}</h3>
          {renderPreviewCard(draft)}
          <p className="mt-2 text-xs text-(--muted-foreground)">{t("post.previewNote")}</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------
     Success panel
     ------------------------------------------------------------- */

  if (posted) {
    // One honest sentence about what happened to the photos. All ids fall
    // back to English until the i18n owner adds them to strings.js.
    let photoLine = null;
    if (postedPhotos) {
      const { saved, total, trimmed, storage } = postedPhotos;
      if (storage === "unpersisted") {
        photoLine = t(
          "post.photosUnpersisted",
          "This browser is not saving data right now (storage may be full or blocked), so this ad and its photos may not survive a reload.",
        );
      } else if (storage === "no-images") {
        photoLine = t(
          "post.photosDropped",
          "This browser's local storage is full, so the ad was saved without photos.",
        );
      } else if (saved === 0 && total > 0) {
        photoLine = t(
          "post.photosUnreadable",
          "The ad was posted without photos — none of the {total} could be stored in this browser.",
          { total },
        );
      } else if (total > 0) {
        photoLine = t(
          "post.photosSaved",
          "Saved {saved} of {total} photos as thumbnails in this browser.",
          { saved, total },
        );
        if (saved < total && storage === "ok" && !trimmed) {
          photoLine += ` ${t(
            "post.photosBudgetTail",
            "The rest were left out to keep local storage light.",
          )}`;
        }
        if (trimmed) {
          photoLine += ` ${t(
            "post.photosShrunk",
            "They were shrunk further to fit the storage available.",
          )}`;
        }
      }
    }

    return (
      <div className="bzr-section">
        <div className="bzr-panel mx-auto max-w-2xl text-center">
          <PartyPopper className="mx-auto h-9 w-9 text-(--primary-text)" aria-hidden="true" />
          <h2
            className="mt-3 text-xl font-bold text-(--foreground)"
            ref={headingRef}
            tabIndex={-1}
          >
            {t("post.liveHeading")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-(--muted-foreground)">
            {/* The bolded title leads in both languages; the tail template
                carries the price and place, so word order can differ. */}
            <strong>{posted.title}</strong>{" "}
            {t("post.savedTail", {
              price: posted.priceLabel,
              place: `${posted.locality}, ${posted.cityName}`,
            })}
          </p>
          {photoLine ? (
            <p className="mx-auto mt-2 max-w-lg text-sm text-(--muted-foreground)">
              {photoLine}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/bazaar/my-ads" className="bzr-btn">
              {t("post.goToMyAds")}
            </Link>
            <button type="button" className="bzr-btn bzr-btn-secondary" onClick={postAnother}>
              {t("post.postAnother")}
            </button>
            <Link href="/bazaar" className="bzr-btn bzr-btn-secondary">
              {t("post.backToBazaar")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------
     Wizard
     ------------------------------------------------------------- */

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="bzr-section">
      <Note icon={Info}>{t("post.demoBanner")}</Note>

      <ol className="bzr-steps mt-5" aria-label={t("post.progressAria")}>
        {STEPS.map((item, index) => (
          <li
            key={item.key}
            className={`bzr-step${index === step ? " is-active" : ""}${index < step ? " is-done" : ""}`}
          >
            <button
              type="button"
              className="bzr-step-dot"
              onClick={() => goTo(index)}
              disabled={index > step || submitting}
              aria-current={index === step ? "step" : undefined}
              aria-label={t("post.stepAria", {
                n: index + 1,
                total: STEPS.length,
                label: t(`post.step.${item.key}`, item.label),
              })}
            >
              {index < step ? <Check className="h-3 w-3" aria-hidden="true" /> : index + 1}
            </button>
            <span aria-hidden="true">{t(`post.step.${item.key}`, item.label)}</span>
            {index < STEPS.length - 1 ? (
              <ChevronRight className="h-3 w-3 opacity-40 rtl:rotate-180" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>

      <section
        className="mt-6"
        aria-labelledby={`${uid}-step-heading`}
        onBlur={markAttempted}
      >
        <h2
          id={`${uid}-step-heading`}
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-bold text-(--foreground) outline-none"
        >
          {t("post.stepAria", {
            n: step + 1,
            total: STEPS.length,
            label: t(`post.step.${current.key}.heading`, current.heading),
          })}
        </h2>

        <div className="mt-4">
          {step === 0 ? renderCategoryStep() : null}
          {step === 1 ? renderDetailsStep() : null}
          {step === 2 ? renderPhotosStep() : null}
          {step === 3 ? renderPriceStep() : null}
          {step === 4 ? renderLocationStep() : null}
          {step === 5 ? renderReviewStep() : null}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 border-t border-(--border) pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="bzr-btn bzr-btn-secondary"
          onClick={goBack}
          // Locked while photos convert: stepping back mid-flight would let
          // the draft change under a submit that is already half done.
          disabled={step === 0 || submitting}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t("post.back")}
        </button>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {isLastStep ? (
            <button
              type="button"
              className="bzr-btn"
              onClick={handleSubmit}
              disabled={!stepValid || submitting}
              aria-busy={submitting || undefined}
              aria-describedby={stepValid ? undefined : `${uid}-blocker`}
            >
              {submitting ? (
                <>
                  {t("post.preparingPhotos", "Preparing photos…")}
                  <Loader2
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  {t("post.publish")}
                  <Check className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="bzr-btn"
              onClick={goNext}
              disabled={!stepValid}
              aria-describedby={stepValid ? undefined : `${uid}-blocker`}
            >
              {t("post.next")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          )}

          <p
            id={`${uid}-blocker`}
            role="status"
            className="text-xs text-(--muted-foreground) sm:text-end"
          >
            {submitting
              ? t("post.preparingPhotos", "Preparing photos…")
              : stepValid
                ? isLastStep
                  ? t("post.allGood")
                  : t("post.ready")
                : errorList[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
