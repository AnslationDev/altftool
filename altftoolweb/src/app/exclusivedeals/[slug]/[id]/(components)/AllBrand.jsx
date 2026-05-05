"use client";
import React, { useState } from "react";
import { Check, Zap, ChevronDown, ChevronUp, Copy, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import badge from "../../../(assets)/bluebadge.png";
import { useTheme } from "@/contexts/ThemeContext";

function AllBrand({ data }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [peeled, setPeeled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCopiedOnce, setIsCopiedOnce] = useState(false);

  const hasVerified = data?.tags?.includes("Verified");
  const hasFlashSale = data?.tags?.includes("Flash Sale");
  const isCoupon = !!data?.code;

  const handleClick = () => {
    if (!peeled) {
      setPeeled(true);
      return;
    }

    navigator.clipboard.writeText(data.code);

    setCopied(true); // text change (temporary)
    setIsCopiedOnce(true); // border change (permanent)

    setTimeout(() => setCopied(false), 2000);
  };

  const formatDiscount = (discount) => {
  if (!discount) return "";

  const str = discount.toString().trim();

  // if already contains %, return as it is
  if (str.includes("%")) return str;

  // if it's a number, add %
  if (!isNaN(str)) return `${str}%`;
  return str;
};

  return (
    <div
      className={`rounded-[20px] border border-(--border) overflow-hidden mb-6 transition-shadow duration-300 shadow-md ${
        theme === "dark" ? "bg-(--card)" : "bg-white"
      }`}
    >
      {/* ── DESKTOP LAYOUT (lg and above) ── */}
      <div className="hidden lg:flex">
        {/* LEFT BADGE */}
        <div className="w-28 flex-shrink-0 relative">
          <Image
            src={badge}
            alt="discount badge"
            // width={112}
            // height={112}
            fill
            sizes="112px"
            className="object-fill"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm sm:text-xl text-center leading-tight">
            {formatDiscount(data.discount)} off
          </span>
        </div>

        {/* CENTER CONTENT */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold lg:text-sm xl:text-base leading-snug mb-1.5 max-w-[550px] break-words">
              {data.title}{" "}
              <strong className="text-(--primary)">----{data.brandName}</strong>
            </h3>
            {hasFlashSale && (
              <span className="flex items-center gap-1 text-yellow-500 font-medium text-xs mb-1.5">
                <Zap size={13} fill="currentColor" />
                Flash Sale
              </span>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 text-sm font-semibold text-(--primary) hover:underline cursor-pointer"
            >
              Show Details
              {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-5 text-xs">
              {hasVerified && (
                <span className="flex items-center gap-1 font-medium">
                  <Check size={13} strokeWidth={2.5} className="text-green-600" />
                  Verified
                </span>
              )}
              <span className="flex items-center gap-1 text-xs">
                <Users size={13} />
                {data?.uses ?? "2969"} Uses Today
              </span>
            </div>

            {isCoupon ? (
              <button
                onClick={handleClick}
                className={`min-w-[200px] relative overflow-hidden flex items-center gap-2 border-2 border-dashed rounded-lg px-4 py-2.5 text-sm font-bold tracking-widest transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:-rotate-[0.5deg] ${
                  isCopiedOnce
                    ? "border-green-500 text-green-600"
                    : peeled
                      ? "border-blue-300 hover:border-blue-500 text-gray-800"
                      : "border-gray-300 hover:border-blue-400 text-gray-800"
                }`}
              >
                <span
                  className={`absolute inset-0 z-10 flex items-center justify-center gap-2 bg-blue-600 text-white text-md font-bold tracking-wide rounded-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left ${
                    peeled ? "scale-x-0" : "scale-x-100"
                  }`}
                >
                  Get Coupon
                </span>
                <span
                  className={`flex items-center gap-2 transition-opacity duration-300 text-(--foreground) ${
                    peeled ? "opacity-100 delay-300" : "opacity-0"
                  }`}
                >
                  <Copy size={13} className={copied ? "text-green-500" : "text-(--foreground)"} />
                  {copied ? "Copied!" : data.code}
                </span>
              </button>
            ) : (
              <Link href={data.link || "#"} target="_blank">
                <button className="bg-(--primary) min-w-[200px] hover:bg-blue-500 cursor-pointer active:scale-95 text-white text-md font-bold px-5 py-2.5 rounded-lg whitespace-nowrap transition-all">
                  Grab Deal →
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET LAYOUT (below lg) ── */}
      <div className="flex lg:hidden flex-col">
        {/* TOP ROW: badge + title + meta */}
        <div className="flex items-center gap-0 p-0">
          {/* Badge */}
          <div className="relative w-20  flex-shrink-0 self-stretch bg-blue-600">
            <Image
              src={badge}
              alt="discount badge"
              fill
              sizes="80px"
              className="object-fill"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[12px] text-center leading-tight">
              {formatDiscount(data.discount)} off
            </span>
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0 px-3 py-3">
            <h3 className="font-medium md:text-sm text-xs leading-snug mb-1">
              {data.title}{" "}
              <strong className="text-(--primary)">----{data.brandName}</strong>
            </h3>
            {hasFlashSale && (
              <span className="flex items-center gap-1 text-yellow-500 font-medium text-xs mb-1">
                <Zap size={12} fill="currentColor" />
                Flash Sale
              </span>
            )}
            <div className="flex items-center gap-3 text-xs text-(--foreground)">
              {hasVerified && (
                <span className="flex items-center gap-1 font-medium">
                  <Check
                    size={12}
                    strokeWidth={2.5}
                    className="text-green-600"
                  />
                  Verified
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={12} />
                {data?.uses ?? "2969"} Uses Today
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: Show Details (left) | Coupon/Deal (right) */}
        <div className="flex items-center justify-between border-t border-(--border) px-3 py-2.5 gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 md:text-sm text-xs font-semibold text-(--primary) hover:underline whitespace-nowrap"
          >
            Show Details
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {isCoupon ? (
            <button
              onClick={handleClick}
              className={`relative overflow-hidden flex items-center gap-2 w-32 border-2 border-dashed rounded-lg px-4 py-2 text-sm font-bold tracking-widest transition-all duration-200 cursor-pointer ${
                  isCopiedOnce
                    ? "border-green-500 text-green-600"
                  : peeled
                    ? "border-blue-300 hover:border-blue-500 text-(--foreground)"
                    : "border-gray-300 hover:border-blue-400 text-(--foreground)"
              }`}
            >
              <span
                className={`absolute inset-0 z-10 flex items-center justify-center bg-blue-600 text-white md:text-sm text-xs  font-bold rounded-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left ${
                  peeled ? "scale-x-0" : "scale-x-100"
                }`}
              >
                Get Coupon
              </span>
              <span
                className={`flex items-center gap-1.5 transition-opacity duration-300 ${
                  peeled ? "opacity-100 delay-300" : "opacity-0"
                }`}
              >
                <Copy
                  size={12}
                  className={copied ? "text-green-500" : "text-(--foreground)"}
                />
                {copied ? "Copied!" : data.code}
              </span>
            </button>
          ) : (
            <Link href={data.websiteLink || "#"} target="_blank">
              <button className="bg-(--primary) hover:bg-blue-500 w-32 cursor-pointer active:scale-95 text-white md:text-sm text-xs font-bold px-4 py-2 rounded-md whitespace-nowrap transition-all">
                Grab Deal →
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* EXPANDED DETAILS — shared for both layouts */}
      {open && data.conditions && (
        <div
          className={`${
            theme === "dark" ? "bg-(--card)" : "bg-white"
          } px-5 py-4 border-t border-(--border)`}
        >
          <ul className="space-y-2 text-xs sm:text-sm">
            {data.conditions.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-(--primary) font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AllBrand;
