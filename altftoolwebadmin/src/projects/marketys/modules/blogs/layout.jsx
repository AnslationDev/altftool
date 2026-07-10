"use client";

import CkeditorAssets from "@/components/admin/CkeditorAssets";

export default function BlogsLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CkeditorAssets />
      <div className="mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}
