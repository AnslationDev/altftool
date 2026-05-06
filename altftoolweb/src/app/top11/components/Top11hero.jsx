"use client";
import React from "react";
import { useRouter } from "next/navigation";
import ManagedImage from "@/components/ui/ManagedImage";


const categories = [
  { name: "Online Degrees", slug: "online-degrees", image: "/top11/top1.png" },
  { name: "Web Hosting", slug: "web-hosting", image: "/top11/top5.png" },
  { name: "CRM", slug: "crm", image: "/top11/top3.png" },
  { name: "VOIP", slug: "voip", image: "/top11/top4.png" },
  { name: "Walk-in Tubs", slug: "walk-in-tubs", image: "/top11/top9.png" },
  { name: "Management", slug: "management", image: "/top11/top10.png" },
  { name: "Home Warranty", slug: "home-warranty", image: "/top11/top8.png" },
  { name: "Car Selling", slug: "car-selling", image: "/top11/top7.png" },
  { name: "Online Therapy", slug: "online-therapy", image: "/top11/top1.png" },
  { name: "TV Services", slug: "tv-services", image: "/top11/top6.png" },
];

export default function CompareSection() {
      const router = useRouter();

  return (
    <section className="w-full py-20 bg-gradient-to-r from-blue-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Compare the Top11 - Rated <br />
          Products & Services
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-gray-600 max-w-xl mx-auto">
          Our experts vet, rank, and review the best solutions for your life and business, so you don&apos;t have to.
        </p>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">

          {categories.map((item, index) => (
            <div
              key={index}
onClick={() => router.push(`/top11/${item.slug}`)}
              className="group rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:-translate-y-1 "
            >
              {/* Image */}
              <div className="w-52 h-35 mb-3 flex items-center justify-center">
                <ManagedImage
                  src={item.image}
                  alt={item.name}
                  className="w-45 h-45 object-cover"
                />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 text-center group-hover:text-blue-600">
                {item.name}
              </h3>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}