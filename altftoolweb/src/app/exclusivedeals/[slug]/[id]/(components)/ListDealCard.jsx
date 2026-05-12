import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { use } from "react";

function ListDealCard({ item, onGetCode, onSeeDetails }) {
  const isCoupon = !!item.code?.trim();

  const formatDiscount = (discount) => {
    if (!discount) return "";
    const str = discount.toString().trim();
    if (str.includes("%")) return str;
    if (!isNaN(str)) return `${str}%`;
    return str;
  };

  const theme = useTheme();

  return (
    <div className="relative flex border-2 border-purple-400 rounded-l-xl px-5 py-4">

      {/* RIGHT CUTS */}
      <div className={`absolute -right-3 top-5 w-5 h-4 ${theme === "dark" ? "bg-white" : "bg-(--background)"} rounded-full border-3 border-r-0 border-t-0 border-b-0 border-l-purple-400`}></div>
      <div className={`absolute -right-3 bottom-5 w-5 h-4 ${theme === "dark" ? "bg-white" : "bg-(--background)"} rounded-full border-3 border-r-0 border-t-0 border-b-0 border-l-purple-400`}></div>
      <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-4 ${theme === "dark" ? "bg-white" : "bg-(--background)"} rounded-full border-3 border-r-0 border-t-0 border-b-0 border-l-purple-400`}></div>

      {/* LEFT SECTION */}
      <div className="hidden lg:block lg:w-[25%]">
        <div className="w-30 h-20 flex-shrink-0 relative">
          {item.logo && (
            <Image
              src={item.logo}
              alt={item.brandName}
              fill
              className="object-contain"
            />
          )}
        </div>
      </div>

      <div className="lg:w-[75%] w-[100%]">
        <div className="flex flex-col gap-1 w-full mb-2">
          <p className="font-bold text-xl text-(--foreground) truncate">
            {item.brandName}
          </p>
          <p className="text-(--muted-foreground) text-sm leading-snug line-clamp-2 overflow-hidden">
            {item.title || item.description}
          </p>
        </div>

        <div className="flex items-center justify-between flex-shrink-0">
          <p className="text-pink-600 text-sm font-semibold">
            {item.discount ? `Up to ${formatDiscount(item.discount)} off` : ""}
          </p>

          {/* ✅ Conditionally call onGetCode or onSeeDetails */}
          <button
            onClick={() => isCoupon ? onGetCode(item) : onSeeDetails(item)}
            className="border border-purple-500 text-purple-600 px-4 py-2 sm:px-5 sm:py-1.5 rounded-full text-sm font-semibold hover:bg-purple-50 transition-colors cursor-pointer"
          >
            {isCoupon ? "Get Code" : "See Details"}
          </button>
        </div>
      </div>

    </div>
  );
}

export default ListDealCard;