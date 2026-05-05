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

const normalizeString = (v = "") => String(v).trim();
const normalizeStatus = (v = "") => normalizeString(v).toLowerCase();

const normalizeBrand = (brand = {}, fallbackCategory = "", fallbackSubcategory = "") => ({
    id: brand?.id || "",
    name: normalizeString(brand?.name),
    images: Array.isArray(brand?.images) ? brand.images.filter(Boolean) : [],
    category: normalizeString(brand?.category) || fallbackCategory,
    categoryId: normalizeString(brand?.categoryId),
    subCategory:
        normalizeString(brand?.subCategory) || normalizeString(brand?.subcategory) || fallbackSubcategory,
    ...brand,
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
const normalizeFaq = (doc = {}) => ({
    id: doc.id || "",
    question: normalizeString(doc.question),
    answer: normalizeString(doc.answer),
    categoryId: normalizeString(doc.categoryId),
    subcategoryId: normalizeString(doc.subcategoryId),
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

                emit(data);
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

                const activeBrands = brandsSnapshot
                    .map((item) => normalizeBrand(item))
                    .filter((item) => item?.name);

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
                    const sub = category.subcategories.find(
                        (s) => s.name.toLowerCase() === brand.subCategory.toLowerCase()
                    );

                    if (sub) {
                        if (!Array.isArray(sub.brands)) sub.brands = [];
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
