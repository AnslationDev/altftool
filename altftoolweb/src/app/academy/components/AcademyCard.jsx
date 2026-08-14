"use client";

import React from "react";
import Image from "next/image";
import { Star, ArrowUpRight } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { getAcademyRating } from "../data/academies";

/**
 * What the price line should say, or "" when there is nothing honest to print.
 *
 * `price` arrives as a string from academies.js ("499", "Free", "3,500", and one
 * record with a trailing space) and as a coerced number from Firestore, where a
 * missing value becomes 0. Only a real amount gets a ₹.
 */
function formatAcademyPrice(price) {
  const raw = String(price ?? "").replace(/^₹\s*/, "").trim();
  if (!raw) return "";
  if (/^free$/i.test(raw)) return "Free";
  // Strip grouping separators before testing, so "3,500" counts as a number.
  const amount = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `₹${raw}`;
}

export default function AcademyCard({ academy }) {
  if (!academy) return null;
  const rating = getAcademyRating(academy);
  const academyPriceLabel = formatAcademyPrice(academy?.price);
  return (
    <a
      href={academy?.academyUrl || "#"}
      id="academy-card"
      target="_blank"
      rel="noopener noreferrer"
      className="
        group flex w-full min-w-0 flex-col justify-between
        academy-card-surface
        rounded-[8px]
        p-5 sm:p-6 
      "
    >

      <div className={`flex items-center justify-between ${rating ? "mb-2" : "mb-4"}`}>

        <div className="relative h-10 w-32 sm:h-12 sm:w-36">
          <AcademyLogoImage key={academy.image || academy.id || academy.name} academy={academy} />
        </div>

        {rating ? (
          <div className="academy-pill flex h-[28px] items-center gap-[6px] rounded-[7px] px-[10px] text-sm font-medium">
            <Star size={16} className="fill-(--warning) stroke-(--warning)" aria-hidden="true" />
            {rating.value}
            <span className="sr-only">{` out of ${rating.scale}`}</span>
          </div>
        ) : null}
      </div>

      {rating ? (
        <p className="mb-4 text-[11px] leading-4 text-(--muted-foreground)">
          {`${rating.measures}, from ${formatRatingCount(rating.count)} ratings. Checked `}
          <time dateTime={rating.checkedOn}>{rating.checkedOn}</time>
          .
        </p>
      ) : null}

      <span
        className="
          mb-3 w-fit rounded-[7px]
          bg-(--primary)/10 text-(--primary)
          px-3 py-1.5 lg:py-2 text-center text-[11px] font-extrabold uppercase  leading-none tracking-[0.55px]
    
        "
      >
        {academy.subCategory}
      </span>


      <div className="flex flex-col gap-1.5 lg:gap-2 mb-4 lg:mb-6">
        <h3 className="text-[17px] sm:text-[20px] leading-[1.3] sm:leading-[24px] tracking-[0px] font-extrabold ">
          {academy.name}
        </h3>

        <p className="font-semibold text-(--muted-foreground) text-[13px] sm:text-[15px] leading-[1.5] sm:leading-[22.5px] tracking-[0px] line-clamp-3">
          {academy.description}
        </p>
      </div>


      {academy.features?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 lg:mb-6 ">
          {academy.features.map((s, i) => (
            <span
              key={i}
              className="
                inline-flex items-center
                rounded-[6px]
                border border-(--border)
                bg-(--primary)/5
                px-3 py-[5px]
                text-xs font-medium text-(--muted-foreground)
              "
            >
              {s}
            </span>
          ))}
        </div>
      )}


      <div className="w-full h-px bg-(--border) mb-4" />


      <div className="flex items-center justify-between">

        {/*
          The ₹ used to be hardcoded in front of whatever `price` held, which
          produced two wrong labels. Khan Academy's price is the string "Free",
          so its card read "₹Free". And on the live path /academy renders from
          Firestore, where normalizeAcademy coerces a missing price to 0 — so a
          paid platform with no price recorded advertised itself at "₹0".

          A price is now shown only when there is a number to show, and "Free"
          is rendered as the word it is.
        */}
        <div className="flex flex-col leading-tight">
          <span className="academy-muted-text text-[11px] font-bold uppercase tracking-[0.6px]">
            {academyPriceLabel ? "Starting at" : "Pricing"}
          </span>

          <span className="flex items-center gap-1 text-base font-extrabold text-(--foreground)">
            {academyPriceLabel || "On their site"}
          </span>
        </div>


        <span className="academy-btn !text-sm !px-3 !py-2.5 !gap-0.75 whitespace-nowrap">
          <span>Visit Platform</span>

          <span className="academy-btn-icon overflow-visible w-4 h-4 ">
            <ArrowUpRight className="icon-out" />
            <ArrowUpRight className="icon-in" />
          </span>
        </span>
      </div>
    </a>
  );
}

/**
 * Thousands separators without Intl.
 *
 * `toLocaleString` resolves against whatever ICU data the runtime ships, so the
 * server and the browser can disagree on the grouping and React reports a
 * hydration mismatch. The count is transcribed from the store listing, so it is
 * always a plain integer and a regex is enough.
 */
function formatRatingCount(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return "an unstated number of";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function AcademyLogoImage({ academy }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const fallbackLabel = String(academy?.name || "A").trim().slice(0, 2).toUpperCase();

  return (
    <>
      {!imageLoaded && !imageError ? (
        <SkeletonBlock className="absolute inset-0 rounded-lg" />
      ) : null}
      {!imageError && academy.image ? (
        <Image
          src={academy.image}
          alt={academy?.name || "academy"}
          fill
          sizes="96px"
          className={`object-contain transition-opacity duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-(--border) bg-(--muted) text-sm font-extrabold text-(--primary)">
          {fallbackLabel}
        </div>
      )}
    </>
  );
}
