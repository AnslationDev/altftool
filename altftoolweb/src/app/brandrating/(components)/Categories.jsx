"use client";



import * as Icons from "lucide-react";

import Link from "next/link";

import React, { useEffect, useMemo, useRef, useState } from "react";

import DOMPurify from "dompurify";

import { categoryService } from "../service/service";



/*  ICON HELPER  */
function getCategoryIcon(iconName, name) {
    const ICON_MAP = {
        bed: Icons.Bed,
        salad: Icons.Salad,
        dog: Icons.Dog,
        wind: Icons.Wind,
        smile: Icons.Smile,
        home: Icons.Home,
    };

    const fallbackMap = {
        mattresses: "bed",
        "diet plans": "salad",
        "dog food delivery": "dog",
        "air purifier": "wind",
        "air purifiers": "wind",
        "invisible braces": "smile",
    };

    const raw = String(iconName || "").trim();
    const nameKey = String(name || "").toLowerCase().trim();

    const normalize = (val = "") =>
        String(val).toLowerCase().replace(/[^a-z]/g, "").trim();

    /* SVG DETECTION  */
    const isSVG =
        raw.startsWith("<svg") ||
        raw.startsWith("&lt;svg") ||
        raw.includes("<svg");

    if (isSVG) {
        return (
            <span
                className="w-[38px] h-[38px] lg:w-[26px] lg:h-[26px] xl:w-[38px] xl:h-[38px]
                     text-(--primary) transition-all duration-300 group-hover:text-white flex items-center justify-center"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(raw),
                }}
            />
        );
    }

    /* LUCIDE ICON  */
    const iconKey = normalize(raw);

    if (ICON_MAP[iconKey]) {
        const Icon = ICON_MAP[iconKey];
        return (
            <Icon className="w-[38px] h-[38px] lg:w-[26px] lg:h-[26px] xl:w-[38px] xl:h-[38px] text-(--primary) transition-all duration-300 group-hover:text-white" />
        );
    }

    /* FALLBACK  */
    const fallbackKey = fallbackMap[nameKey];

    const Icon = ICON_MAP[fallbackKey] || Icons.Home;

    return (
        <Icon className="w-[38px] h-[38px] lg:w-[26px] lg:h-[26px] xl:w-[38px] xl:h-[38px] text-(--primary) transition-all duration-300 group-hover:text-white" />
    );
}

function getUrlLink(value = "") {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}



/* COMPONENT  */
function Categories() {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileIndex, setMobileIndex] = useState(0);
    const scrollRef = useRef(null);



    /*  FIREBASE LISTENER */
    useEffect(() => {
        const unsubscribe = categoryService.subscribeAll(
            (res) => {
                setSubcategories(Array.isArray(res) ? res : []);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsubscribe?.();
    }, []);

    const topSubcategories = useMemo(() => {
        return [...subcategories]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);
    }, [subcategories]);


    if (loading) {
        return <div className="h-[200px]" />;
    }

    return (
        <section className="bg-(--background) section">
            <div className="flex flex-col items-center gap-2 pb-8 sm:pb-10">
                <h2 className="section-title text-center">
                    Top-Searched Matchups
                </h2>
                <p className="section-subtitle text-center">
                    Discover brands loved by users across all categories.
                </p>
            </div>



            {/* CARDS */}
            <div
                ref={scrollRef}
                onScroll={(e) => {
                    const el = e.currentTarget;
                    const safeLength = Math.max(topSubcategories.length, 1);
                    const cardWidth = el.scrollWidth / safeLength;
                    setMobileIndex(Math.floor(el.scrollLeft / cardWidth));
                }}
                className="flex lg:grid lg:grid-cols-5 gap-5 px-4 sm:px-6 xl:justify-items-center
        max-w-full xl:max-w-[1100px] xl:mx-auto 2xl:max-w-full 2xl:px-6
        overflow-x-auto lg:overflow-visible justify-start xl:justify-center
        snap-x lg:snap-none scroll-smooth items-stretch snap-x snap-mandatory
        no-scrollbar scrollbar-hide"

            >

                {topSubcategories.map((item, index) => (
                    <Link
                        key={item?.id || index}
                        href={`/brandrating/subcategories/${getUrlLink(item?.name)}`}
                        className="snap-start lg:contents"
                    >
                        <div
                            className="w-[calc(50vw-28px)] flex-shrink-0 sm:w-[280px] md:w-[300px] lg:w-full xl:w-full min-h-[260px]
              border-0 rounded-none shadow-none bg-transparent
              lg:flex-shrink sm:min-h-[280px] md:min-h-[320px] lg:min-h-[240px] xl:min-h-[300px]
              sm:rounded-xl sm:border sm:border-(--border)
              flex flex-col items-center justify-between text-center
              pt-12 sm:pt-16 md:pt-20 lg:pt-8 xl:pt-18
              pr-10 sm:pr-12 lg:pr-8
              pb-10 sm:pb-12 lg:pb-6
              pl-10 sm:pl-12 lg:pl-8 xl:pr-10 xl:pb-10 xl:pl-10
              gap-4 group
              sm:hover:shadow-lg sm:hover:border-(--primary)
              transition-all duration-500 ease-out cursor-pointer"
                        >

                            <div
                                className="w-[110px] h-[110px] lg:w-[80px] lg:h-[80px] xl:w-[110px] xl:h-[110px]
                                           flex items-center justify-center rounded-[65px]
                bg-(--search-buysmart) flex-shrink-0
                transition-all duration-300 group-hover:bg-(--primary) group-hover:scale-110"
                            >
                                {getCategoryIcon(item?.icon, item?.name)}
                            </div>

                            {/* NAME */}

                            <div className="group-hover:text-(--primary) text-(--foreground) transition-all duration-200 font-normal text-[20px] lg:text-base xl:text-[20px]">
                                {item?.name}
                            </div>
                        </div>

                    </Link>

                ))}

            </div>



            {/* DOTS */}

            <div className="flex lg:hidden justify-center mt-4 gap-2">
                {Array.from({
                    length: Math.ceil(topSubcategories.length / 2),
                }).map((_, i) => (
                    <span
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                       ${Math.floor(mobileIndex / 2) === i
                                ? "bg-[var(--primary)] scale-110"
                                : "bg-gray-300"
                            }`}
                    />
                ))}

            </div>

        </section>

    );

}



export default Categories;













