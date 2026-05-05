"use client";

import Image from "next/image";
import { Suspense, useState, useMemo, useEffect } from "react";
import data from "../(data)/db.json";
import Link from "next/link";
import { ArrowLeft, DiamondPercent, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { brandsfirebase } from "../service/firebasebrand";

const TABS = [
  { label: "Popularity", value: "popularity" },
  { label: "A-Z", value: "az" },
  { label: "Top Discount", value: "top-discount" },
  { label: "Live Sales", value: "live-sales" },
  { label: "Newest", value: "newest" },
];

function AllStoresContent() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = brandsfirebase((data) => {
      setBrands(data);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const searchParams = useSearchParams();
  const router = useRouter();

  const categorySlug = searchParams.get("category");
  const [activeTab, setActiveTab] = useState("popularity");

  // const store = data.store || [];
  // const selectedCategory = store.find((item) => item.slug === categorySlug);

  const categoryDisplayName = useMemo(() => {
    if (!categorySlug || brands.length === 0) return null;
    return (
      brands.find(
        (b) => b.categoryName?.toLowerCase() === categorySlug.toLowerCase(),
      )?.categoryName || categorySlug
    );
  }, [brands, categorySlug]);

  const allBrands = useMemo(() => {
    if (!brands || brands.length === 0) return [];

    return brands
      .filter((brand) => {
        if (!categorySlug) return true;
        return brand.categoryName?.toLowerCase() === categorySlug.toLowerCase();
      })
      .map((brand, index) => {
        const coupons = brand.offers?.filter((o) => o.type === "coupon") || [];
        const deals = brand.offers?.filter((o) => o.type === "deal") || [];

        return {
          id: brand.id,
          name: brand.name, // ✅ FIXED
          logo: brand.logo, // ✅ FIXED
          website: brand.link,
          category: brand.categoryName,
          slug: brand.categoryName?.toLowerCase().replace(/\s+/g, "-"),
          discount: brand.highestDiscount || null, // ✅ FIXED
          uniqueKey: `${brand.id}-${index}`,
          originalIndex: index,

          // ✅ CORRECT COUNTING
          totalCoupons: coupons.length,
          totalDeals: deals.length,
        };
      });
  }, [brands, categorySlug]);

  const sortedData = useMemo(() => {
    const brands = [...allBrands];

    switch (activeTab) {
      case "az":
        return brands.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        );

      case "top-discount":
        // Sort by numeric value of brand.discount descending
        return brands.sort((a, b) => {
          const aVal = parseFloat(a.discount) || 0;
          const bVal = parseFloat(b.discount) || 0;
          return bVal - aVal;
        });

      case "live-sales":
        return brands.sort((a, b) => b.totalDeals - a.totalDeals);

      case "newest":
        return brands.sort((a, b) => b.originalIndex - a.originalIndex);

      case "popularity":
      default:
        return brands.sort((a, b) => a.originalIndex - b.originalIndex);
    }
  }, [allBrands, activeTab]);

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  return (
    <>
      <div className="section bg-(--dealspage-background) pt-5 animate-slide-up min-h-screen">
        {/* Breadcrumb */}
        <div className="hidden lg:flex mb-10 text-sm text-(--muted-foreground) flex items-center gap-2">
          <Link
            href="/exclusivedeals"
            className="hover:text-(--primary) transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/exclusivedeals/all-stores"
            className="hover:text-(--primary) transition-colors"
          >
            All Stores
          </Link>
          {categorySlug && categoryDisplayName && (
            <>
              <span>/</span>
              <span className="font-semibold text-(--foreground)">
                {categoryDisplayName}
              </span>
            </>
          )}
        </div>

        {/* Heading */}

        <div className="mb-6 lg:mb-0 flex items-center gap-3">
          {/* Mobile Back Arrow */}
          <button
            onClick={() => router.push("/exclusivedeals")}
            className="lg:hidden p-2 rounded-full border border-(--border) hover:bg-(--muted-foreground)/10 transition"
          >
            <ArrowLeft size={20} />
          </button>

          {/*Title + Subtitle */}
          <div>
            <h1 className="section-title">
              {categorySlug && categoryDisplayName
                ? categoryDisplayName
                : "All Stores"}
            </h1>

            <p className="hidden lg:block section-subtitle !mx-0 text-left">
              {categorySlug && categoryDisplayName
                ? `Explore ${categoryDisplayName} stores`
                : "Explore All Stores From Across Different Categories"}
            </p>
          </div>
        </div>
        {/* Tab Bar */}
        <div className="hidden lg:flex w-full mb-8 border border-(--border) rounded-lg overflow-hidden">
          {TABS.map((tab, index) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 text-center py-3 text-sm md:text-base font-semibold transition-all duration-200 cursor-pointer
                ${index < TABS.length - 1 ? "border-r border-(--border)" : ""}
                ${
                  activeTab === tab.value
                    ? "bg-(--primary) text-white"
                    : "text-(--foreground) hover:bg-(--muted-foreground)/5 hover:text-(--primary)"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-10 gap-4">
          {sortedData.map((brand) => (
            <Link
              key={brand.uniqueKey}
              href={`/exclusivedeals/${brand.slug}/${slugify(brand.name)}`}
            >
              <StoreCard key={brand.uniqueKey} data={brand} />
            </Link>
          ))}
        </div>
        {!loading && sortedData.length === 0 && (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <p className="text-xl font-semibold text-(--foreground)">No Brands Found</p>
    <p className="text-sm text-(--muted-foreground) mt-2">
      {categorySlug
        ? `There are no brands in this category yet. Check back soon!`
        : "No brands available at the moment."}
    </p>
  </div>
)}
      </div>
    </>
  );
}

export default function AllStoresPage() {
  return (
    <Suspense fallback={<div className="section-container py-20 text-center text-(--muted-foreground)">Loading stores...</div>}>
      <AllStoresContent />
    </Suspense>
  );
}

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
    <div className="w-full group cursor-pointer relative overflow-hidden rounded-2xl sm:rounded-4xl h-25 sm:h-36 border-[1.5px] border-(--border) bg-white shadow-[0_2px_30px_0_rgba(0,0,0,0.05)] transition-all duration-500 ease-out hover:bg-(--primary) hover:shadow-lg hover:-translate-y-1">
      {/* Diagonal discount banner — top-left corner */}
      {data.discount && (
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
            {formatDiscount(data.discount)} off
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out group-hover:opacity-0 group-hover:scale-90">
        <div className="h-20 w-28 sm:w-40 sm:h-20 lg:w-30 lg:h-30 xl:w-40 xl:h-20 relative">
          <Image
            src={data.logo}
            alt={data.name}
            fill
            sizes="(max-width: 640px) 112px, (max-width: 1024px) 160px, 160px"
            // width={200}
            // height={100}
            className="object-contain"
          />
        </div>
      </div>

      {/* Brand Name */}
      {/* <p className="text-xs font-semibold text-center">
        {data.name}
      </p> */}

      {/* Hover Content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-white 
        opacity-0 translate-y-4 
        transition-all duration-500 ease-out 
        group-hover:opacity-100 group-hover:translate-y-0"
      >
        <div className="text-lg font-semibold">{data.slug}</div>
        <div className="text-sm mt-1 flex gap-2">
          <DiamondPercent size={18} />
          {data.totalCoupons} Coupons
        </div>
        {/* ✅ Show deals only if exist */}
        {data.totalDeals > 0 && (
          <div className="text-sm mt-1 flex gap-2">
            <Handshake size={18} />
            {data.totalDeals} Deals
          </div>
        )}
      </div>
    </div>
  );
}
