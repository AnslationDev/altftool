"use client";
import { Star, StarHalf, ArrowUpRight, Trophy, Check } from "lucide-react";
import Image from "next/image";
import mattress from "../../(assets)/Hero-2.jpg";
import Link from "next/link";


const CardContent = ({ brand, isActive, getImage, normalizedFeatures }) => {
    const rawLink = brand?.brandLink;
    const validLink = (() => {
        if (!rawLink) return "";
        let link = "";
        if (typeof rawLink === "string") {
            link = rawLink;
        } else if (typeof rawLink === "object") {
            link =
                rawLink.url ||
                rawLink.link ||
                rawLink.weblink ||
                rawLink.value ||
                "";
        }
        if (!link || typeof link !== "string") return "";
        link = link.trim();
        if (
            link.toLowerCase() === "null" ||
            link.toLowerCase() === "undefined"
        ) {
            return "";
        }
        return link;
    })();
    const renderStars = (rating = 0) => {
        const safeRating = Math.max(0, Math.min(5, Number(rating)));

        const fullStars = Math.floor(safeRating);
        const hasHalf = safeRating % 1 >= 0.5;

        return (
            <div className="flex text-yellow-500">
                {Array.from({ length: fullStars }).map((_, i) => (
                    <Star key={`f-${i}`} className="w-[18px] h-[18px] fill-yellow-400" />
                ))}

                {hasHalf && (
                    <StarHalf className="w-[18px] h-[18px] fill-yellow-400" />
                )}

                {Array.from({ length: 5 - fullStars - (hasHalf ? 1 : 0) }).map((_, i) => (
                    <Star key={`e-${i}`} className="w-[18px] h-[18px] text-gray-300" />
                ))}
            </div>
        );
    };
    return (

        <>
            {/* IMAGE */}
            <div className="px-4 pt-4">
                <Image
                    src={getImage()}
                    alt={brand.name}
                    width={500}
                    height={300}
                    className="w-full h-[200px] sm:h-[220px] md:h-[240px] lg:h-[182px] object-cover rounded-[14px]"
                />
            </div>


            <div className="px-4 sm:px-6 pt-4 pb-5 flex flex-col gap-2.5">

                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-[22px] sm:text-[26px] lg:text-[22px] xl:text-[24px] font-bold leading-tight flex-1 min-w-0">
                        {brand.name}
                    </h3>
                    <div className="flex lg:hidden items-center gap-1 mt-1 flex-shrink-0">
                        {renderStars(brand.rating)}
                    </div>
                </div>


                <p className="text-[13px] sm:text-[14px] text-[var(--muted-foreground)]">
                    {brand.review || "Trusted by 27,000+ customers"}
                </p>

                {/* DESKTOP RATING */}
                <div className="hidden lg:flex items-center gap-1">
                    {renderStars(brand.rating)}
                    <span className="text-[13px] text-[var(--muted-foreground)] ml-1">
                        {brand.rating || "0"}/5
                    </span>
                </div>

                {/* FEATURES */}
                {normalizedFeatures.length > 0 ? (
                    <div className="flex flex-col gap-2 text-[13px] sm:text-[14px] text-[var(--muted-foreground)]">
                        {normalizedFeatures.slice(0, 3).map((f, i) => {
                            const label =
                                typeof f === "string"
                                    ? f
                                    : f?.heading || f?.description || "";

                            return (
                                <div key={`${label}-${i}`} className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" />
                                    </span>

                                    {label}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400">No features available</p>
                )}

                {validLink ? (
                    <Link
                        href={
                            validLink.startsWith("http")
                                ? validLink
                                : `https://${validLink}`
                        }
                        target="_blank"
                        className={`mt-1 w-full h-[48px] sm:h-[52px] lg:h-[48px] rounded-full flex items-center justify-center gap-2 text-[15px] sm:text-[16px] font-semibold transition-all
              ${isActive
                                ? "bg-[var(--primary)] text-white"
                                : "border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--foreground)]"
                            }`}
                    >
                        Visit Site
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                ) : (
                    <div className="mt-1 w-full h-[48px] rounded-full flex items-center justify-center bg-(--muted-foreground)/30 text-(--muted-foreground) text-[15px] font-semibold cursor-not-allowed">
                        Not Available
                    </div>
                )}
            </div>
        </>
    );
};
export default function TopPickCard({ rank, isActive, brand }) {
    const normalizedFeatures = Array.isArray(brand.features)
        ? brand.features
        : brand.features && typeof brand.features === "object"
            ? Object.values(brand.features)
            : [];

    const getImage = () => {
        const img = brand?.images?.[0] || brand?.logo;
        return typeof img === "string" && img.trim() ? img : mattress;
    };



    if (isActive) {
        return (
            <div className="w-full lg:max-w-[391px] rounded-3xl bg-gradient-to-b from-[#2563EB] via-[#3B82F6] to-white p-2 flex flex-col transition-all duration-300 hover:shadow-[0_14px_40px_rgba(37,99,235,0.22)]">
                <div className="flex justify-center items-center gap-2 pb-2 pt-1 text-white font-bold text-[17px]">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    #{rank} Top Pick
                </div>
                <div className="bg-(--background) rounded-3xl overflow-hidden flex flex-col flex-1">
                    <CardContent
                        brand={brand}
                        isActive={isActive}
                        getImage={getImage}
                        normalizedFeatures={normalizedFeatures}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full lg:max-w-[391px] rounded-3xl border border-[var(--border)] flex flex-col group transition-all duration-300 hover:border-[var(--primary)] hover:shadow-[0_14px_40px_rgba(37,99,235,0.22)]">
            <div className="flex justify-center items-center gap-2 py-3 text-[var(--primary)] font-bold text-[17px]">
                <Trophy className="w-5 h-5 text-yellow-500 group-hover:text-yellow-300 transition-colors" />
                #{rank} Top Pick
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
                <CardContent brand={brand}
                    isActive={isActive}
                    getImage={getImage}
                    normalizedFeatures={normalizedFeatures} />
            </div>
        </div>
    );
}
