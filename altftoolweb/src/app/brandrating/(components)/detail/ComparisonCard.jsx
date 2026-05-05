"use client";

import { categoryService } from "../../service/service";
import React, { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, StarHalf, ArrowUpRight } from "lucide-react";
import { useParams } from "next/navigation";;


function getUrlLink(value = "") {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

/* SINGLE CARD COMPONENT*/
function ComparisonCard({ brand,category }) {
    const rating = brand?.rating || 0;
    const fullStars = Math.floor(rating / 2);
    const hasHalf = rating % 2 >= 1;


    return (

        <div className="group w-[85vw] sm:min-w-[240px] md:w-[240px]  min-h-[300px] md:h-[313px]   rounded-lg border border-(--border) p-[10px] flex flex-col gap-[10px]  hover:border-[var(--primary)] hover:shadow-md transition-all duration-300 animate-slide-up">

            <div className="w-full h-[116px] relative rounded-xl overflow-hidden">
                <Image
                    src={brand?.images?.[0] || brand?.image}
                    alt={brand?.name || "Brand"}
                    fill
                    sizes="(max-width: 640px) 85vw, 240px"
                    className="object-cover"
                />
            </div>


            {/* CONTENT */}
            <div className="flex flex-col justify-between flex-1 gap-[16px]">
                <h3 className="text-[20px] font-bold leading-[28px] line-clamp-2">
                    {brand?.name}
                </h3>
                <div className="flex items-center gap-[6px]">

                    <div className="flex">
                        {[...Array(fullStars)].map((_, i) => (
                            <Star
                                key={i}
                                className="w-4 h-4 text-yellow-400 fill-yellow-400"
                            />
                        ))}

                        {hasHalf && (
                            <StarHalf className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        )}
                    </div>

                    <span className="text-xs text-(--muted-foreground) font-medium">
                        {rating}/10
                    </span>
                </div>

                <p className="text-[13px] font-medium text-(--muted-foreground) leading-snug">
                    Trusted by 27,000+ customers
                </p>

                <Link
                   href={`/brandrating/subcategories/${getUrlLink(category)}`}
                    className="w-full h-[42px] sm:h-[45px] rounded-[49.23px] bg-(--primary) flex items-center justify-center gap-2 text-white font-semibold"
                >
                    Compare Now
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-active:rotate-45" />
                </Link>
            </div>
        </div>
    );
}



/* SECTION COMPONENT */
export default function ComparisonCardsSection({ brands = [] }) {
    const params = useParams();
const categorySlug = params?.slug;
    const [mobileIndex, setMobileIndex] = useState(0);
const [subcategories, setSubcategories] = useState([]);
const [loadingCats, setLoadingCats] = useState(true);

useEffect(() => {
    const unsubscribe = categoryService.subscribeAll(
        (res) => {
            setSubcategories(Array.isArray(res) ? res : []);
            setLoadingCats(false);
        },
        () => setLoadingCats(false)
    );

    return () => unsubscribe?.();
}, []);

const currentCategory = useMemo(() => {
    return subcategories.find(
        (item) => getUrlLink(item?.name) === categorySlug
    );
}, [subcategories, categorySlug]);


    const productSlug = params?.pdetail
    const handleScroll = (e) => {
        const el = e.currentTarget;
        const index = Math.round(el.scrollLeft / el.clientWidth);
        setMobileIndex(index);
    };
    const scrollRef = useRef(null);
    const safeBrands = Array.isArray(brands) ? brands : [];
    const filteredBrands = safeBrands.filter((b) => {
        if (!productSlug) return true;
        return b?.slug !== productSlug;
    });

    const topFive = filteredBrands.slice(0, 5);

    const isLoading = brands === undefined;
    const isEmpty = Array.isArray(brands) && brands.length === 0;

    if (isLoading) {
        return <div>Loading brands...</div>;
    }

    if (isEmpty) {
        return <div>No brands found</div>;
    }


    return (
        <div className="section  w-full flex flex-col items-center justify-center animate-slide-up">

            <div className="text-center mb-8 animate-slide-right">
                <h2 className="section-title">
                    Choose the Best
                </h2>

                <p className="section-subtitle">
                    Compare features, ratings, and value across top brands.
                </p>
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="
                flex gap-4 px-4 w-full
                overflow-x-auto scroll-smooth
               snap-x snap-mandatory
              md:flex-wrap md:justify-center md:overflow-visible
             no-scrollbar scrollbar-hide
               "
            >
                {topFive.map((brand, idx) => (
                    <div key={brand?.id || idx}>
                        <ComparisonCard brand={brand}  category={currentCategory?.name}/>
                    </div>
                ))}
            </div>
            <div className="flex md:hidden justify-center mt-4 gap-2">
                {topFive.map((_, i) => (
                    <span
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                ${mobileIndex === i
                                ? "bg-[var(--primary)] scale-110"
                                : "bg-(--muted-foreground)/20"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
