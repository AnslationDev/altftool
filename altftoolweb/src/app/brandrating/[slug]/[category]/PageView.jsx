"use client";

import { useState, useEffect } from "react";
import Hero from "../../(components)/brandComparison/Hero";
import TopPicks from "../../(components)/brandComparison/TopPicks";
import TopRated from "../../(components)/brandComparison/TopRatedCard";
import Faq from "../../(components)/brandComparison/FAQ";
import Reviews from "../../(components)/brandComparison/Reviews";
import PromoAlert from "../../(components)/brandComparison/PromoAlert";
import { useParams } from "next/navigation";
import { categoryService } from "../../service/service";
import reviews from "../../(data)/reviews";
import { Loader2, SearchX } from "lucide-react";

function slugify(text) {
    return text
        ?.toLowerCase()
        ?.trim()
        ?.replace(/&/g, "and")
        ?.replace(/\s+/g, "-");
}

function formatSlugLabel(text = "") {
    return String(text)
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}


export default function Page() {

    const params = useParams();
    // const categorySlug = params?.slug;
    const subcategorySlug = params?.category;
    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFeature, setActiveFeature] = useState("");
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        const unsub = categoryService.subscribeMerged((res) => {
            let foundSubcategory = null;
            let parentCategory = null;

            for (const category of res || []) {
                const match = category?.subcategories?.find(
                    (sub) => slugify(sub?.name) === slugify(subcategorySlug)
                );

                if (match) {
                    foundSubcategory = match;
                    parentCategory = category;
                    break;
                }
            }

            if (!foundSubcategory) {
                
                setSubcategory(null);
                setBrands([]);
                setLoading(false);
                return;
            }

           
            const directBrands = Array.isArray(parentCategory?.brands)
                ? parentCategory.brands
                : parentCategory?.brands && typeof parentCategory.brands === "object"
                    ? Object.values(parentCategory.brands)
                    : [];


            const subcategoryOwnBrands = Array.isArray(foundSubcategory?.brands)
                ? foundSubcategory.brands
                : foundSubcategory?.brands && typeof foundSubcategory.brands === "object"
                    ? Object.values(foundSubcategory.brands)
                    : [];

            // Prefer brands the admin panel linked to this subcategory;
            // fall back to every brand in the parent category (legacy data).
            const pool = subcategoryOwnBrands.length
                ? subcategoryOwnBrands
                : directBrands;

            const seen = new Set();
            const allBrands = pool
                .filter(Boolean)
                .filter((b) => {
                    const key = b?.id || b?.name;
                    if (!key || seen.has(key)) return false;
                    seen.add(key);
                    return true;
                })
                .map((b, index) => ({
                    ...b,
                    name: b?.name || "Unnamed",

                    // Admin panel stores the position as `ranking`.
                    rank: (() => {
                        const raw = b?.rank ?? b?.ranking;
                        return raw !== undefined && raw !== null && raw !== ""
                            ? Number(raw)
                            : index + 1;
                    })(),

                    features: (() => {
                        if (Array.isArray(b?.features)) return b.features;
                        if (b?.features && typeof b.features === "object") return Object.values(b.features);
                        if (Array.isArray(b?.feature)) return b.feature;
                        if (typeof b?.feature === "string" && b.feature) return [b.feature];
                        return [];
                    })(),

                    images: Array.isArray(b?.images) ? b.images : [],

                    // Admin panel stores the outbound URL as `brandLink`.
                    weblink: b?.weblink || b?.brandLink || b?.url || b?.link || "",
                }));


            setCategory(parentCategory);
            setSubcategory(foundSubcategory);
            setBrands(allBrands);
            setLoading(false);
        });

        return () => unsub?.();
    }, [subcategorySlug]);
    //  ADDED: Firebase FAQ integration (separate collection)
    useEffect(() => {
        if (!subcategory?.id || !category?.id) return;

        const unsub = categoryService.subscribeFaqs((data) => {
            const filtered = data.filter((faq) => {
                const matchBySub = faq.subcategoryId === subcategory.id;

                const matchByCategory =
                    faq.categoryId === category.id &&
                    (!faq.subcategoryId || faq.subcategoryId === "");

                return matchBySub || matchByCategory;
            });

            setFaqs(filtered);
        });

        return () => unsub?.();
    }, [subcategory?.id, category?.id]);

    const features = [
        ...new Set(
            brands.flatMap((brand) =>
                Array.isArray(brand.features)
                    ? brand.features.map((f) => {
                        if (typeof f === "string") return f;
                        if (typeof f === "object" && f !== null)
                            return f.heading || f.description || "";
                        return "";
                    })
                    : []
            )
        ),
    ].filter(Boolean);

    const filteredBrands =
        activeFeature === ""
            ? brands
            : brands.filter((brand) =>
                Array.isArray(brand.features) &&
                brand.features.some((f) =>
                    typeof f === "string"
                        ? f === activeFeature
                        : (f?.heading || f?.description) === activeFeature
                )
            );

    if (loading) {
        return (
            <div className="route-page-shell animate-slide-up">
                <Hero title={formatSlugLabel(subcategorySlug) || "Category"} />
                <section className="section !pt-2">
                    <div className="surface-panel flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-(--primary)" />
                        <h2 className="text-xl font-semibold text-(--foreground)">Preparing brand comparison</h2>
                        <p className="max-w-md text-sm leading-6 text-(--muted-foreground)">
                            Pulling the latest category, brand, and FAQ data for this route.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    if (!subcategory) {
        return (
            <div className="route-page-shell animate-slide-up">
                <Hero title="Category not found" />
                <section className="section !pt-2">
                    <div className="surface-panel flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
                        <SearchX className="h-8 w-8 text-(--primary)" />
                        <h2 className="text-xl font-semibold text-(--foreground)">No brand route available</h2>
                        <p className="max-w-md text-sm leading-6 text-(--muted-foreground)">
                            This category is not active yet, or the live data is still syncing.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    // Promote the #1 ranked brand (prefer one with a working outbound link).
    const rankedBrands = [...brands].sort(
        (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity)
    );
    const promoBrand =
        rankedBrands.find((b) => b?.weblink || b?.brandLink) || rankedBrands[0];

    return (
        <div className="route-page-shell animate-slide-up">
            {promoBrand && (
                <PromoAlert
                    brand={promoBrand}
                    subName={subcategory?.name || "Pick"}
                    storageKey={subcategorySlug}
                />
            )}
            <Hero title={subcategory?.name || "Category"} />
            <div className=" flex flex-col">
                <TopPicks
                    brands={brands}
                />

                <TopRated
                    brands={filteredBrands}
                    activeFeature={activeFeature}
                    setActiveFeature={setActiveFeature}
                    features={features}
                />

                <Reviews reviews={reviews} />
                <Faq faqs={faqs} />
            </div>

        </div>

    );
}
