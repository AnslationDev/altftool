"use client";
import React from "react";
import { ArrowRight, Handshake, DiamondPercent } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { brandsfirebase } from "../service/firebasebrand";
import { useState, useEffect } from "react";
import { TopStoreSkeleton } from "../DealsPageSkeleton";

function TopStore() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = brandsfirebase((data) => {
      setBrands(data);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const topStore = brands.slice(0, 10);

  const filteredData = topStore.map((brand) => {
    const coupons = brand.offers?.filter((o) => o.type === "coupon") || [];
    const deals = brand.offers?.filter((o) => o.type === "deal") || [];

    return {
      categoryName: brand.categoryName, // using brand name as title
      slug: slugify(brand.categoryName),

      brandId: brand.id,
      brandName: brand.name,
      brandDiscount: brand.highestDiscount || null,
      firstBrandLogo: brand.logo || null,

      totalBrands: 1, // since it's single brand
      totalCoupons: coupons.length,
      totalDeals: deals.length,
    };
  });

  // return {
  //   categoryName: category.categoryName,
  //   slug: category.slug,
  //   firstBrandLogo: category.brands[0]?.brandLogo || null,
  //   totalBrands: category.brands.length,
  //   totalCoupons,
  //   totalDeals,
  // };

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  if (loading) return <TopStoreSkeleton />;

  return (
    <div className="section animate-slide-up">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="section-title">Top Brands</h2>
          <p className="section-subtitle !mx-0 text-left">
            Get coupons from your favorite stores
          </p>
        </div>
        <Link
          href="/exclusivedeals/all-stores"
          className="hidden lg:flex justify-center text-(--primary) gap-1 mt-4 font-semibold cursor-pointer animate-slide-left"
        >
          <span className="inline-block hover:underline">View all Stores</span>
          <span className="inline-block px-2 group-hover:scale-110 transition-transform duration-200 ease-in-out text-(--primary) items-center">
            <ArrowRight size={25} />
          </span>
        </Link>
      </div>

      {/* Mobile & Tablet: Horizontal Scroll | Desktop: Grid */}
      <div className="lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-10 flex gap-4 overflow-x-auto pb-2 lg:overflow-visible no-scrollbar ">
        {filteredData?.map((item, id) => (
          <div
            key={id}
            className="flex-shrink-0 sm:w-60 w-40 lg:w-auto animate-scale-in "
          >
            <Link
              href={`/exclusivedeals/${item.slug}/${slugify(item.brandName)}`}
            >
              <StoreCard data={item} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopStore;

function StoreCard({ data }) {
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
      key={data.id}
      className="w-full group cursor-pointer relative overflow-hidden rounded-2xl sm:rounded-4xl h-25 sm:h-36 border-[1.5px] border-(--border) bg-white shadow-[0_2px_30px_0_rgba(0,0,0,0.05)] transition-all duration-500 ease-out hover:bg-(--primary) hover:shadow-lg hover:-translate-y-1"
    >
      {/* Diagonal discount banner — top-left corner */}
      {data.brandDiscount && (
        <div className="absolute -top-1 -left-1 w-28 h-28 overflow-hidden rounded-tl-2xl pointer-events-none z-10">
          <div
            className="absolute bg-(--primary) group-hover:bg-white group-hover:text-(--primary) text-white font-bold text-xs leading-tight text-center transition-colors duration-500"
            style={{
              width: "120px",
              top: "18px",
              left: "-24px",
              transform: "rotate(-45deg)",
              padding: "3px 0",
            }}
          >
            {formatDiscount(data.brandDiscount)} off
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out group-hover:opacity-0 group-hover:scale-90">
        {data.firstBrandLogo && (
          <div className="h-20 w-28 sm:w-40 sm:h-20 lg:w-30 lg:h-30 xl:w-40 xl:h-20 relative">
          <Image
            src={data.firstBrandLogo}
            alt={data.brandName}
            fill
            sizes="(max-width: 640px) 112px, (max-width: 1024px) 160px, 160px"
            // width={200}
            // height={100}
            className="object-contain"
          />
          </div>
        )}
      </div>

      {/* Hover Content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-white 
        opacity-0 translate-y-4 
        transition-all duration-500 ease-out 
        group-hover:opacity-100 group-hover:translate-y-0"
      >
        <div className="text-lg font-semibold">{data.categoryName}</div>
        <div className="text-sm mt-1 flex gap-2">
<DiamondPercent size={18}/>
          {data.totalCoupons} Coupons
        </div>
        {/* ✅ Show deals only if exist */}
        {data.totalDeals > 0 && (
          <div className="text-sm mt-1 flex gap-2">
         <Handshake size={18}/>
            {data.totalDeals} Deals
          </div>
        )}
      </div>
    </div>
  );
}
