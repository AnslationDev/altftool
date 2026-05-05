"use client";

import { useState, useEffect } from "react";
import Hero from "../../(components)/brandComparison/Hero";
import TopPicks from "../../(components)/brandComparison/TopPicks";
import TopRated from "../../(components)/brandComparison/TopRatedCard";
import Faq from "../../(components)/brandComparison/FAQ";
import Reviews from "../../(components)/brandComparison/Reviews";
import { useParams } from "next/navigation";
import { categoryService } from "../../service/service";
import reviews from "../../(data)/reviews";

function slugify(text) {
    return text
        ?.toLowerCase()
        ?.trim()
        ?.replace(/&/g, "and")
        ?.replace(/\s+/g, "-");
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


            const subcategoryBrands = (parentCategory?.subcategories || []).flatMap(
                (sub) => {
                    if (Array.isArray(sub?.brands)) return sub.brands;
                    if (sub?.brands && typeof sub.brands === "object")
                        return Object.values(sub.brands);
                    return [];
                }
            );


            const allBrands = [...directBrands, ...subcategoryBrands]
                .filter(Boolean)
                .map((b, index) => ({
                    ...b,
                    name: b?.name || "Unnamed",

                  
                    rank:
                        b?.rank !== undefined && b?.rank !== null && b?.rank !== ""
                            ? Number(b.rank)
                            : index + 1,

                    features: (() => {
                        if (Array.isArray(b?.features)) return b.features;
                        if (b?.features && typeof b.features === "object") return Object.values(b.features);
                        if (Array.isArray(b?.feature)) return b.feature;
                        if (typeof b?.feature === "string" && b.feature) return [b.feature];
                        return [];
                    })(),

                    images: Array.isArray(b?.images) ? b.images : [],

              
                    weblink: b?.weblink || b?.url || b?.link || "",
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

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] animate-slide-up">
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