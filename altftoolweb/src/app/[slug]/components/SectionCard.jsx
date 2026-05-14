import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function SectionCard({
  banner = "/amaz.jpg",
  logo = "/vista.png",
  country = "US",
  description = "",
  redirect = "#",
  discount,
  cashback,
}) {
  // ---- Normalize values ----
  const formattedDiscount =
    discount &&
    `Up To ${String(discount).replace(/^0+/, "").replace("%", "")}%`;

  const formattedCashback =
    cashback &&
    `${String(cashback).replace(/^0+/, "").replace("%", "")}% Cashback`;

  // ---- Trim description ----
  const trimmedDescription =
    description.length > 120
      ? `${description.slice(0, 120)}...`
      : description;

  return (
    <div className="w-[350px] h-[400px] rounded-2xl border border-(--border) bg-(--card) overflow-hidden shadow-sm flex flex-col">
      
      {/* Banner */}
      <div className="relative w-full h-[180px] flex-shrink-0">
        <Image
          src={banner}
          alt="Offer"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Logo + Country */}
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <Image
            src={logo}
            alt="Brand"
            width={130}
            height={40}
            className="object-contain"
          />

          <span className="text-xs px-3 py-1 rounded-full bg-(--muted) text-(--muted-foreground) font-medium">
            {country}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-(--muted-foreground) leading-relaxed line-clamp-3 flex-1">
          {trimmedDescription}
        </p>

        {/* Bottom Row */}
        <div className="flex justify-between items-center pt-5 mt-auto">
          
          {/* Offer Text */}
          <Link
            href={redirect}
            className="text-blue-600 text-lg font-semibold hover:underline"
          >
            {formattedDiscount || formattedCashback}
          </Link>

          {/* CTA */}
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
            Get Code
          </button>
        </div>
      </div>
    </div>
  );
}
