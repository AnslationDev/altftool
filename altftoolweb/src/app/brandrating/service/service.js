"use client";

import {
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
} from "firebase/firestore";
import { snapshotDocs, subscribeCached } from "@/lib/firebaseCache";
import { getCollectionRef, getDocRef } from "./config";
import {
    MOCK_DATA_ENABLED,
    MOCK_BRANDS,
    MOCK_FAQS,
    MOCK_HIDDEN_BRAND_NAMES,
    MOCK_RANK_OVERRIDES,
    MOCK_BRAND_ENRICH,
} from "../(data)/mockBrands";

const normalizeString = (v = "") => String(v).trim();
const normalizeStatus = (v = "") => normalizeString(v).toLowerCase();

const normalizeBrand = (brand = {}, fallbackCategory = "", fallbackSubcategory = "") => ({
    ...brand,
    id: brand?.id || "",
    name: normalizeString(brand?.name),
    images: Array.isArray(brand?.images) ? brand.images.filter(Boolean) : [],
    logo: normalizeString(brand?.logo),
    heading: normalizeString(brand?.heading),
    category: normalizeString(brand?.category) || fallbackCategory,
    categoryId: normalizeString(brand?.categoryId),
    subCategoryId: normalizeString(brand?.subCategoryId || brand?.subcategoryId),
    subCategory:
        normalizeString(brand?.subCategory) || normalizeString(brand?.subcategory) || fallbackSubcategory,
    rating: Number(brand?.rating) || 0,
    // Admin panel writes `ranking`; legacy/static data uses `rank`.
    rank: brand?.rank ?? brand?.ranking ?? null,
    // Admin panel writes `brandLink`; legacy data uses weblink/url/link.
    weblink: normalizeString(brand?.weblink || brand?.brandLink || brand?.url || brand?.link),
    // Admin panel stores singular field names; the UI reads the plural ones.
    features: brand?.features ?? brand?.feature ?? [],
    specifications: brand?.specifications ?? brand?.specification ?? [],
    additionalBenefits: brand?.additionalBenefits ?? brand?.additionalBenefit ?? [],
});

const normalizeSubcategory = (doc = {}) => ({
    id: doc.id || "",
    name: normalizeString(doc.name || doc.subCategory || doc.category),
    icon: normalizeString(doc.icon),
    status: normalizeStatus(doc.status),
    categoryId: normalizeString(doc.categoryId),
    brands: Array.isArray(doc?.brands)
        ? doc.brands
            .map((brand) => normalizeBrand(brand, "", normalizeString(doc.name || doc.subCategory || doc.category)))
            .filter((brand) => brand?.name)
        : [],
    createdAt: doc?.createdAt || null,
});
// Mock-data merge: mock brands only fill gaps — an admin brand with the same
// name in the same subcategory always replaces its mock twin (see mockBrands.js).
const brandMockKey = (brand = {}) =>
    `${normalizeString(brand?.subCategoryId || brand?.subcategoryId || brand?.categoryId)}:${normalizeString(brand?.name).toLowerCase()}`;

// Fill gaps on a real brand from its enrichment entry; every field applies
// only while the admin value is missing or thin, so admin edits always win.
const enrichBrand = (brand) => {
    const enrich = MOCK_BRAND_ENRICH[brand.name.toLowerCase()];
    if (!enrich) return brand;

    const result = { ...brand };
    const heading = normalizeString(brand.heading);

    if (enrich.heading && (!heading || heading.toLowerCase() === brand.name.toLowerCase())) {
        result.heading = enrich.heading;
    }

    if (enrich.description && !normalizeString(brand.description)) {
        result.description = enrich.description;
    }

    if (enrich.brandLink && !normalizeString(brand.weblink)) {
        result.weblink = enrich.brandLink;
        result.brandLink = enrich.brandLink;
    }

    const featureCount = Array.isArray(brand.features)
        ? brand.features.length
        : brand.features && typeof brand.features === "object"
            ? Object.keys(brand.features).length
            : 0;

    if (Array.isArray(enrich.features) && featureCount < 3) {
        result.features = enrich.features;
        result.feature = enrich.features;
    }

    return result;
};

const applyMockBrands = (realBrands = []) => {
    if (!MOCK_DATA_ENABLED) return realBrands;

    const visible = realBrands
        .filter(
            (brand) =>
                !MOCK_HIDDEN_BRAND_NAMES.includes(brand.name.toLowerCase())
        )
        .map((brand) => {
            const override = MOCK_RANK_OVERRIDES[brand.name.toLowerCase()];

            if (override && Number(brand.ranking ?? brand.rank) === override.from) {
                return enrichBrand({ ...brand, rank: override.to, ranking: override.to });
            }

            return enrichBrand(brand);
        });

    const taken = new Set(visible.map((brand) => brandMockKey(brand)));
    const extras = MOCK_BRANDS
        .map((brand) => normalizeBrand(brand))
        .filter((brand) => brand?.name && !taken.has(brandMockKey(brand)));

    return [...visible, ...extras];
};

const faqMockKey = (faq = {}) =>
    `${normalizeString(faq?.subcategoryId)}:${normalizeString(faq?.question).toLowerCase()}`;

const applyMockFaqs = (realFaqs = []) => {
    if (!MOCK_DATA_ENABLED) return realFaqs;

    const taken = new Set(realFaqs.map((faq) => faqMockKey(faq)));
    const extras = MOCK_FAQS
        .map((faq) => normalizeFaq(faq))
        .filter((faq) => faq?.question && !taken.has(faqMockKey(faq)));

    return [...realFaqs, ...extras];
};

const normalizeFaq = (doc = {}) => ({
    id: doc.id || "",
    question: normalizeString(doc.question),
    answer: normalizeString(doc.answer),
    categoryId: normalizeString(doc.categoryId),
    // Admin panel writes `subCategoryId`; keep both spellings readable.
    subcategoryId: normalizeString(doc.subcategoryId || doc.subCategoryId),
});
const normalizeCategory = (doc) => {
    const category = normalizeString(doc?.category || doc?.name);

    return {
        id: doc?.id || "",
        name: category,
        category,
        icon: normalizeString(doc?.icon),
        status: normalizeStatus(doc?.status || "inactive"),
        subcategories: Array.isArray(doc?.subcategories)
            ? doc.subcategories
                .map((subcategory) => normalizeSubcategory(subcategory))
                .filter((subcategory) => subcategory?.name)
            : [],
        brands: Array.isArray(doc?.brands)
            ? doc.brands
                .map((brand) => normalizeBrand(brand, category, ""))
                .filter((brand) => brand?.name)
            : [],
    };
};

export function transformCategoryData(firebaseData = []) {
    const categories = (Array.isArray(firebaseData) ? firebaseData : [])
        .map((item) => normalizeCategory(item))
        .filter((item) => item?.category);

    return {
        categories: categories.map((item) => ({
            category: item.category,
            icon: item.icon,
            brands: item.subcategories.flatMap((subcategory) =>
                (subcategory?.brands || []).map((brand) => ({
                    ...brand,
                    category: brand?.category || item.category,
                    subCategory: brand?.subCategory || subcategory?.name || "",
                })),
            ),
        })),
    };
}

const firestoreService = {
    subscribe(collectionName, callback, onError) {
        return subscribeCached(
            `brandrating:${collectionName}`,
            (emit, fail) => onSnapshot(
                getCollectionRef(collectionName),
                (snap) => emit(snapshotDocs(snap)),
                (error) => {
                    console.error(`Firestore subscribe error for ${collectionName}:`, error);
                    fail?.(error);
                },
            ),
            callback,
            onError,
        );
    },

    async add(collectionName, payload) {
        return addDoc(getCollectionRef(collectionName), payload);
    },

    async update(collectionName, id, payload) {
        return updateDoc(getDocRef(collectionName, id), payload);
    },

    async remove(collectionName, id) {
        return deleteDoc(getDocRef(collectionName, id));
    },

    async batchUpdate(collectionName, updates = []) {
        const batch = writeBatch(getCollectionRef(collectionName).firestore);

        updates.forEach(({ id, data }) => {
            if (!id) return;
            batch.update(getDocRef(collectionName, id), data);
        });

        return batch.commit();
    },
};

export const heroBannerService = {
    subscribeAll(callback, onError) {
        return firestoreService.subscribe("heroBanners", callback, onError);
    },

    addBanner(payload) {
        return firestoreService.add("heroBanners", payload);
    },

    updateBanner(id, payload) {
        return firestoreService.update("heroBanners", id, payload);
    },

    deleteBanner(id) {
        return firestoreService.remove("heroBanners", id);
    },
};

export const categoryService = {
    subscribeAll(callback, onError) {
        return subscribeCached(
            "brandrating:active-subcategories",
            (emit, fail) => onSnapshot(
                getCollectionRef("subcategories"),
                (snap) => {
                    const data = snapshotDocs(snap, (d) =>
                        normalizeSubcategory({ id: d.id, ...d.data() })
                    );

                    const active = data.filter(
                        (item) => item.status?.toLowerCase() === "active"
                    );

                    emit(active);
                },
                (err) => {
                    console.error("subcategory error:", err);
                    fail?.(err);
                }
            ),
            callback,
            onError,
        );
    },
subscribeFaqs(callback, onError) {
    return subscribeCached(
        "brandrating:faqs",
        (emit, fail) => onSnapshot(
            getCollectionRef("faqs"),
            (snap) => {
                const data = snapshotDocs(snap, (doc) =>
                    normalizeFaq({ id: doc.id, ...doc.data() })
                );

                emit(applyMockFaqs(data));
            },
            (err) => {
                console.error("faqs subscribe error:", err);
                fail?.(err);
            }
        ),
        callback,
        onError,
    );
},

    subscribeMerged(callback, onError) {
        return subscribeCached("brandrating:category-tree", (push, fail) => {
            let categoriesSnapshot = [];
            let subcategoriesSnapshot = [];
            let brandsSnapshot = [];

            const emit = () => {
                const activeCategories = categoriesSnapshot
                    .map((item) => normalizeCategory(item))
                    .filter((item) => item?.status === "active" && item?.id);

                const activeSubcategories = subcategoriesSnapshot
                    .map((item) => normalizeSubcategory(item))
                    .filter(
                        (item) =>
                            item?.status === "active" &&
                            item?.id &&
                            item?.categoryId,
                    );

                const activeBrands = applyMockBrands(
                    brandsSnapshot
                        .map((item) => normalizeBrand(item))
                        .filter((item) => item?.name)
                );

                const categoryMap = new Map(
                    activeCategories.map((category) => [
                        category.id,
                        {
                            ...category,
                            subcategories: [],
                            brands: [],

                        },
                    ]),
                );

                activeSubcategories.forEach((subcategory) => {
                    const targetCategory = categoryMap.get(subcategory.categoryId);
                    if (!targetCategory) return;

                    const existing = new Map(
                        (targetCategory.subcategories || []).map((item) => [item.id || item.name, item]),
                    );

                    if (!existing.has(subcategory.id || subcategory.name)) {
                        targetCategory.subcategories.push(subcategory);
                    }
                });
                activeBrands.forEach((brand) => {
                    const category = categoryMap.get(brand.categoryId);

                    if (!category) return;
                    category.brands.push(brand);
                    // Admin panel links brands via `subCategoryId`; legacy data via name.
                    const sub = category.subcategories.find(
                        (s) =>
                            (brand.subCategoryId && s.id === brand.subCategoryId) ||
                            (brand.subCategory &&
                                s.name.toLowerCase() === brand.subCategory.toLowerCase())
                    );

                    if (sub) {
                        if (!Array.isArray(sub.brands)) sub.brands = [];
                        // Resolve the display name so detail pages can show it.
                        if (!brand.subCategory) brand.subCategory = sub.name;
                        sub.brands.push(brand);
                    }
                });

                push?.(Array.from(categoryMap.values()));
            };
        


        const unsubscribeCategories = onSnapshot(
            getCollectionRef("categories"),
            (snap) => {
                categoriesSnapshot = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                emit();
            },
            (error) => {
                console.error("categories subscribe error:", error);
                fail?.(error);
            },
        );

        const unsubscribeSubcategories = onSnapshot(
            getCollectionRef("subcategories"),
            (snap) => {
                subcategoriesSnapshot = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                emit();
            },
            (error) => {
                console.error("subcategories subscribe error:", error);
                fail?.(error);
            },
        );
        const unsubscribeBrands = onSnapshot(
            getCollectionRef("brands"),
            (snap) => {
                brandsSnapshot = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                emit();
            },
            (error) => {
                console.error("brands subscribe error:", error);
                fail?.(error);
            }
        );

        return () => {
            unsubscribeCategories?.();
            unsubscribeSubcategories?.();
            unsubscribeBrands?.();
        };
        }, callback, onError);
    },
};

export default firestoreService;
