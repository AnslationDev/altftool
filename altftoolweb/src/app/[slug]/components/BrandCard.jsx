"use client";
/* eslint-disable @next/next/no-img-element */

export default function BrandCard({
  logo,
  name,
  percentage,
  prefix = "Up to",
}) {
  return (
    <div
      className="
        group cursor-pointer
        bg-(--card) rounded-2xl p-4
        shadow-sm border border-(--border)
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-1
      "
    >
      {/* Logo Box */}
      <div
        className="
          bg-gray-50 rounded-xl
          h-28 flex items-center justify-center
          overflow-hidden
          transition-all duration-200
          group-hover:scale-[1.02]
        "
      >
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="max-h-14 object-contain"
          />
        ) : (
          <span className="text-xs text-(--foreground)">No Logo</span>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-semibold text-(--foreground) truncate">
          {name || "Brand Name"}
        </h3>

        <p className="text-sm text-(--muted-foreground)">
          {prefix}{" "}
          <span className="text-pink-600 font-semibold">
            {percentage ? `${percentage}%` : "--"}
          </span>
        </p>
      </div>
    </div>
  );
}